import ActivityKit
import ExpoModulesCore
import Foundation

/**
 * Pont JavaScript ↔ Live Activity (iPhone).
 * Même interface que le service Android :
 *  - start(json)  : affiche ou met à jour la carte de séance
 *  - stop()       : retire la carte
 *  - setInApp(b)  : sans effet sur iPhone (c'est l'appli qui joue les sons)
 *
 * Le programme reçu contient toutes les phases à venir : le module passe
 * tout seul d'une phase à l'autre à l'heure prévue. Ça marche hors de
 * l'appli tant qu'elle reste éveillée (piste audio silencieuse pendant la
 * séance, voir useBackgroundAudio).
 */
public class SessionServiceModule: Module {
  private var program: Program?
  private var pausedAt: Date?
  private var timer: Timer?
  /// Activity<PushPauseActivityAttributes>, rangée en Any à cause des versions d'iOS
  private var activity: Any?

  public func definition() -> ModuleDefinition {
    Name("SessionService")

    Events("onAction")

    Function("start") { (payloadJson: String) in
      guard
        let data = payloadJson.data(using: .utf8),
        let program = try? JSONDecoder().decode(Program.self, from: data)
      else { return }
      DispatchQueue.main.async { self.apply(program) }
    }

    Function("stop") {
      DispatchQueue.main.async { self.stop() }
    }

    Function("setInApp") { (inApp: Bool) in
      _ = inApp // iPhone : les sons sont joués par l'appli elle-même
    }

    OnDestroy {
      self.timer?.invalidate()
    }
  }

  // ─── Programme ─────────────────────────────────────────────────────────

  private func apply(_ program: Program) {
    self.program = program
    pausedAt = program.paused ? Date() : nil
    render()
    scheduleNext()
  }

  /// Heure de référence : figée pendant la pause
  private var now: Date { pausedAt ?? Date() }

  /// La phase en cours : la première qui n'est pas encore finie
  private func currentSegment(at date: Date) -> Segment? {
    program?.segments.first { $0.endsAt == 0 || date < $0.endsDate! }
  }

  /// Toutes les phases sont passées ?
  private func isOver(at date: Date) -> Bool {
    guard let program, !program.segments.isEmpty else { return false }
    return currentSegment(at: date) == nil
  }

  private func scheduleNext() {
    timer?.invalidate()
    timer = nil
    guard pausedAt == nil, let seg = currentSegment(at: Date()), let end = seg.endsDate else { return }
    let delay = max(0, end.timeIntervalSinceNow) + 0.05
    timer = Timer.scheduledTimer(withTimeInterval: delay, repeats: false) { [weak self] _ in
      self?.render()
      self?.scheduleNext()
    }
  }

  private func stop() {
    timer?.invalidate()
    timer = nil
    // Séance allée au bout : on laisse « Terminé » quelques minutes à l'écran
    let finished = pausedAt == nil && isOver(at: Date())
    if #available(iOS 16.2, *) {
      let state = finished ? doneState() : nil
      endActivity(final: state, dismissAfter: finished ? 10 * 60 : 0)
    }
    program = nil
    pausedAt = nil
  }

  // ─── Live Activity ─────────────────────────────────────────────────────

  private func render() {
    guard #available(iOS 16.2, *), let program else { return }
    let state: PushPauseActivityAttributes.ContentState
    if let seg = currentSegment(at: now) {
      state = segmentState(seg, labels: program.labels)
    } else {
      state = doneState()
    }
    show(state)
  }

  @available(iOS 16.2, *)
  private func segmentState(_ seg: Segment, labels: Labels?) -> PushPauseActivityAttributes.ContentState {
    let frozen: Int
    if seg.countUp {
      frozen = Int(now.timeIntervalSince(seg.startsDate))
    } else {
      frozen = Int((seg.endsDate ?? now).timeIntervalSince(now).rounded(.up))
    }
    return .init(
      title: seg.title,
      subtitle: "",
      background: seg.background,
      foreground: seg.foreground,
      startsAt: seg.startsDate,
      endsAt: seg.endsDate,
      countUp: seg.countUp,
      paused: pausedAt != nil,
      pausedLabel: labels?.paused ?? "",
      frozenSeconds: max(0, frozen),
      done: false
    )
  }

  @available(iOS 16.2, *)
  private func doneState() -> PushPauseActivityAttributes.ContentState {
    .init(
      title: program?.done?.title ?? "",
      subtitle: program?.done?.text ?? "",
      background: "#30D158",
      foreground: "#000000",
      startsAt: Date(),
      endsAt: nil,
      countUp: false,
      paused: false,
      pausedLabel: "",
      frozenSeconds: 0,
      done: true
    )
  }

  @available(iOS 16.2, *)
  private func show(_ state: PushPauseActivityAttributes.ContentState) {
    let content = ActivityContent(state: state, staleDate: nil)

    if let current = activity as? Activity<PushPauseActivityAttributes>, current.activityState == .active {
      Task { await current.update(content) }
      return
    }

    guard ActivityAuthorizationInfo().areActivitiesEnabled else { return }

    // Restes d'une séance précédente (appli fermée de force…)
    for old in Activity<PushPauseActivityAttributes>.activities {
      Task { await old.end(nil, dismissalPolicy: .immediate) }
    }

    do {
      activity = try Activity.request(attributes: PushPauseActivityAttributes(), content: content, pushType: nil)
    } catch {
      // Live Activities désactivées par l'utilisateur : la séance continue sans carte.
    }
  }

  @available(iOS 16.2, *)
  private func endActivity(final state: PushPauseActivityAttributes.ContentState?, dismissAfter seconds: TimeInterval) {
    let policy: ActivityUIDismissalPolicy = seconds > 0 ? .after(Date().addingTimeInterval(seconds)) : .immediate
    let content = state.map { ActivityContent(state: $0, staleDate: nil) }
    for current in Activity<PushPauseActivityAttributes>.activities {
      Task { await current.end(content, dismissalPolicy: policy) }
    }
    activity = nil
  }
}

// ─── Programme reçu de JavaScript (voir ServicePayload dans index.ts) ────

private struct Program: Decodable {
  let segments: [Segment]
  let paused: Bool
  let labels: Labels?
  let done: Done?
}

private struct Segment: Decodable {
  let title: String
  let background: String
  let foreground: String
  /// epoch ms
  let startsAt: Double
  /// epoch ms, 0 = sans fin
  let endsAt: Double
  let countUp: Bool

  var startsDate: Date { Date(timeIntervalSince1970: startsAt / 1000) }
  var endsDate: Date? { endsAt == 0 ? nil : Date(timeIntervalSince1970: endsAt / 1000) }
}

private struct Labels: Decodable {
  let paused: String?
}

private struct Done: Decodable {
  let title: String
  let text: String
}