import ActivityKit
import SwiftUI
import WidgetKit

/**
 * Dessin de la carte de séance :
 *  - écran verrouillé : fond de la couleur de la phase, phase à gauche, gros temps à droite ;
 *  - Dynamic Island : pastille de couleur + temps.
 * Le temps défile tout seul (géré par iOS), sans réveiller l'appli.
 */
@main
struct PushPauseWidgets: WidgetBundle {
  var body: some Widget {
    SessionLiveActivity()
  }
}

struct SessionLiveActivity: Widget {
  var body: some WidgetConfiguration {
    ActivityConfiguration(for: PushPauseActivityAttributes.self) { context in
      LockScreenView(state: context.state)
        .activityBackgroundTint(Color(hex: context.state.background))
        .activitySystemActionForegroundColor(Color(hex: context.state.foreground))
    } dynamicIsland: { context in
      let state = context.state
      let accent = state.accentColor
      return DynamicIsland {
        DynamicIslandExpandedRegion(.leading) {
          PhaseTitle(state: state)
            .foregroundColor(accent)
            .padding(.leading, 6)
        }
        DynamicIslandExpandedRegion(.trailing) {
          TimeText(state: state)
            .font(.system(size: 40, weight: .bold, design: .rounded))
            .monospacedDigit()
            .foregroundColor(accent)
            .multilineTextAlignment(.trailing)
            .frame(maxWidth: 140, alignment: .trailing)
            .padding(.trailing, 6)
        }
        DynamicIslandExpandedRegion(.bottom) {
          PhaseProgress(state: state)
            .tint(accent)
            .padding(.horizontal, 6)
        }
      } compactLeading: {
        Circle()
          .fill(accent)
          .frame(width: 12, height: 12)
      } compactTrailing: {
        TimeText(state: state)
          .monospacedDigit()
          .font(.system(size: 15, weight: .semibold, design: .rounded))
          .foregroundColor(accent)
          .multilineTextAlignment(.trailing)
          .frame(width: 48, alignment: .trailing)
      } minimal: {
        Circle()
          .fill(accent)
          .frame(width: 12, height: 12)
      }
      .keylineTint(accent)
    }
  }
}

// ─── Écran verrouillé ──────────────────────────────────────────────────────

private struct LockScreenView: View {
  let state: PushPauseActivityAttributes.ContentState

  var body: some View {
    VStack(spacing: 12) {
      HStack(alignment: .center) {
        PhaseTitle(state: state)
        Spacer(minLength: 12)
        TimeText(state: state)
          .font(.system(size: 52, weight: .bold, design: .rounded))
          .monospacedDigit()
          .multilineTextAlignment(.trailing)
          .frame(maxWidth: 180, alignment: .trailing)
      }
      PhaseProgress(state: state)
        .tint(Color(hex: state.foreground))
    }
    .foregroundColor(Color(hex: state.foreground))
    .padding(.horizontal, 20)
    .padding(.vertical, 16)
  }
}

// ─── Morceaux communs ──────────────────────────────────────────────────────

/// « EFFORT · 7/24 », et en dessous « PAUSE » ou « 24/24 »
private struct PhaseTitle: View {
  let state: PushPauseActivityAttributes.ContentState

  var body: some View {
    VStack(alignment: .leading, spacing: 2) {
      Text(state.title)
        .font(.system(size: 20, weight: .heavy, design: .rounded))
        .lineLimit(1)
        .minimumScaleFactor(0.7)
      if state.paused {
        Text(state.pausedLabel)
          .font(.system(size: 15, weight: .semibold, design: .rounded))
          .opacity(0.7)
      } else if !state.subtitle.isEmpty {
        Text(state.subtitle)
          .font(.system(size: 15, weight: .semibold, design: .rounded))
          .opacity(0.7)
      }
    }
  }
}

/// Temps de la phase : défile tout seul, figé en pause
private struct TimeText: View {
  let state: PushPauseActivityAttributes.ContentState

  var body: some View {
    if state.done {
      Image(systemName: "checkmark")
    } else if state.paused {
      Text(mmss(state.frozenSeconds))
    } else if state.countUp {
      Text(timerInterval: state.startsAt...Date.distantFuture, countsDown: false)
    } else if let end = state.endsAt, end > state.startsAt {
      Text(timerInterval: state.startsAt...end, countsDown: true)
    } else {
      Text("0:00")
    }
  }
}

/// Barre de progression de la phase (rien pour le chrono libre ni la fin)
private struct PhaseProgress: View {
  let state: PushPauseActivityAttributes.ContentState

  var body: some View {
    if state.done || state.countUp {
      EmptyView()
    } else if let end = state.endsAt, end > state.startsAt {
      if state.paused {
        let total = end.timeIntervalSince(state.startsAt)
        ProgressView(value: max(0, total - Double(state.frozenSeconds)), total: total)
          .labelsHidden()
      } else {
        ProgressView(timerInterval: state.startsAt...end, countsDown: true)
          .labelsHidden()
      }
    } else {
      EmptyView()
    }
  }
}

private func mmss(_ seconds: Int) -> String {
  String(format: "%d:%02d", seconds / 60, seconds % 60)
}

// ─── Couleurs ──────────────────────────────────────────────────────────────

extension PushPauseActivityAttributes.ContentState {
  /// Dans la Dynamic Island (toujours noire) : la couleur de la phase,
  /// ou la couleur du texte si la phase est trop sombre (chrono libre).
  var accentColor: Color {
    Color.luminance(hex: background) < 0.25 ? Color(hex: foreground) : Color(hex: background)
  }
}

extension Color {
  init(hex: String) {
    let (r, g, b) = Color.rgb(hex: hex)
    self.init(red: r, green: g, blue: b)
  }

  static func luminance(hex: String) -> Double {
    let (r, g, b) = rgb(hex: hex)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b
  }

  static func rgb(hex: String) -> (Double, Double, Double) {
    var value: UInt64 = 0
    let clean = hex.trimmingCharacters(in: CharacterSet(charactersIn: "# "))
    guard clean.count >= 6, Scanner(string: String(clean.prefix(6))).scanHexInt64(&value) else {
      return (0.5, 0.5, 0.5)
    }
    return (
      Double((value >> 16) & 0xFF) / 255,
      Double((value >> 8) & 0xFF) / 255,
      Double(value & 0xFF) / 255
    )
  }
}