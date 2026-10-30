import { Settings } from "@/src/types";

/** Secondes de mise en place avant le premier effort. */
export const PREP_SECONDS = 10;

/** Fréquence de rafraîchissement des chiffres (l'anneau s'anime de son côté). */
export const TICK_MS = 250;

/** Temps d'appui pour les boutons « maintenir » (recommencer, terminer). */
export const HOLD_MS = 800;

/** En dessous, une séance arrêtée n'est pas enregistrée. */
export const MIN_SAVED_SECONDS = 5;

export const DEFAULT_SETTINGS: Settings = {
  mode: "intervalles",
  effort: 30,
  pause: 20,
  totalMin: 20,
  chronoMin: 0,
  beep: true,
  keepAwake: true,
};

/** Bornes et pas des réglages de l'accueil. */
export const LIMITS = {
  effort: { min: 5, max: 300, step: 5 },
  pause: { min: 0, max: 300, step: 5 },
  totalMin: { min: 1, max: 60, step: 1 },
  chronoMin: { min: 0, max: 60, step: 1 }, // 0 = infini
} as const;

export const STORAGE_KEYS = {
  settings: "pushpause/settings",
  history: "pushpause/history",
  activeSession: "pushpause/active-session",
} as const;
