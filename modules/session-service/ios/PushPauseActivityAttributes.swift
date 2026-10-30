import ActivityKit
import Foundation

/**
 * Contenu de la Live Activity de séance.
 *
 * ⚠️ Ce fichier existe en DEUX exemplaires, strictement identiques :
 *   - modules/session-service/ios/PushPauseActivityAttributes.swift   (l'appli)
 *   - targets/session-activity/PushPauseActivityAttributes.swift      (l'affichage)
 * iOS relie les deux par le nom du type : si tu en modifies un, modifie l'autre.
 */
@available(iOS 16.1, *)
public struct PushPauseActivityAttributes: ActivityAttributes {
  public struct ContentState: Codable, Hashable {
    /// Texte de la phase, ex. « EFFORT · 7/24 »
    public var title: String
    /// Ligne secondaire (fin de séance : « 24/24 »), vide sinon
    public var subtitle: String
    /// Couleurs de la phase, "#RRGGBB"
    public var background: String
    public var foreground: String
    /// Début et fin de la phase (fin absente = chrono libre sans limite)
    public var startsAt: Date
    public var endsAt: Date?
    /// true = chrono qui monte
    public var countUp: Bool
    /// En pause : le temps est figé à `frozenSeconds`
    public var paused: Bool
    public var pausedLabel: String
    public var frozenSeconds: Int
    /// Séance terminée
    public var done: Bool

    public init(
      title: String, subtitle: String, background: String, foreground: String,
      startsAt: Date, endsAt: Date?, countUp: Bool,
      paused: Bool, pausedLabel: String, frozenSeconds: Int, done: Bool
    ) {
      self.title = title
      self.subtitle = subtitle
      self.background = background
      self.foreground = foreground
      self.startsAt = startsAt
      self.endsAt = endsAt
      self.countUp = countUp
      self.paused = paused
      self.pausedLabel = pausedLabel
      self.frozenSeconds = frozenSeconds
      self.done = done
    }
  }

  public init() {}
}