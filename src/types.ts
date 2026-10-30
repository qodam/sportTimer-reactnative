// ─── Thème ────────────────────────────────────────────────────────────────
export interface ThemeColors {
  background: string;
  card: string;
  card2: string;
  gray: string;
  separator: string;
  fill: string;
  selected: string;
  foreground: string;
  mutedForeground: string;
  orange: string;
  orangeDark: string;
  orangeSoft: string;
  blue: string;
  blueDark: string;
  green: string;
  greenDark: string;
  red: string;
}

// ─── Langues ──────────────────────────────────────────────────────────────
export interface LanguageOption {
  code: string;
  tag: string;
  name: string;
  flag: string;
}

// ─── Réglages ─────────────────────────────────────────────────────────────
export type Mode = "intervalles" | "chrono";

/** Ce qui définit une séance (figé au moment où on appuie sur Démarrer). */
export interface SessionConfig {
  mode: Mode;
  /** Effort, en secondes */
  effort: number;
  /** Repos, en secondes */
  pause: number;
  /** Durée totale du mode effort / repos, en minutes */
  totalMin: number;
  /** Limite du chrono libre, en minutes (0 = infini) */
  chronoMin: number;
}

export interface Settings extends SessionConfig {
  beep: boolean;
  keepAwake: boolean;
}

// ─── Minuteur ─────────────────────────────────────────────────────────────
export type Phase = "prepa" | "effort" | "pause" | "chrono" | "fin";

/** État du minuteur à un instant donné (calculé, jamais stocké). */
export interface Tick {
  phase: Phase;
  /** Secondes restantes dans la phase en cours (prépa, effort, repos) */
  remaining: number;
  /** Numéro de l'intervalle en cours, à partir de 1 */
  interval: number;
  /** Nombre total d'intervalles */
  intervals: number;
  /** Secondes restantes sur toute la séance (0 si pas de limite) */
  totalRemaining: number;
  /** Secondes écoulées depuis la fin de la mise en place */
  elapsed: number;
}

/** Un changement de phase à venir (utilisé pour les notifications). */
export interface PhaseBoundary {
  /** Secondes depuis « Démarrer » (mise en place comprise) */
  at: number;
  phase: Exclude<Phase, "prepa">;
  interval: number;
  intervals: number;
}

/**
 * Séance en cours. Le temps n'est jamais compté « à la main » :
 * il est recalculé depuis l'horloge du téléphone, donc il reste juste
 * même si l'appli passe en arrière-plan ou est fermée puis rouverte.
 */
export interface ActiveSession {
  config: SessionConfig;
  beep: boolean;
  keepAwake: boolean;
  /** Moment de la dernière reprise (epoch ms) */
  startedAt: number;
  /** Temps cumulé avant la dernière reprise (ms) */
  accumulatedMs: number;
  running: boolean;
  /** Rounds comptés à la main (chrono libre) */
  rounds: number;
}

// ─── Historique ───────────────────────────────────────────────────────────
export interface Session extends Pick<
  SessionConfig,
  "mode" | "effort" | "pause" | "totalMin"
> {
  id: string;
  /** Date de fin, ISO */
  date: string;
  /** Temps réellement fait, hors mise en place (s) */
  durationSec: number;
  /** Séance allée jusqu'au bout */
  completed: boolean;
  /** Intervalles prévus (effort / repos) */
  intervals?: number;
  /** Intervalles faits (effort / repos) */
  intervalsDone?: number;
  /** Rounds comptés (chrono libre) */
  rounds: number;
}
