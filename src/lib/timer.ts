/**
 * Moteur du minuteur : fonctions pures, sans React.
 * Tout se déduit du temps écoulé depuis « Démarrer », ce qui les rend
 * faciles à tester et fiables après un passage en arrière-plan.
 */
import { PREP_SECONDS } from "@/src/constants/session";
import { ActiveSession, PhaseBoundary, SessionConfig, Tick } from "@/src/types";

type IntervalConfig = Pick<SessionConfig, "effort" | "pause" | "totalMin">;

export function intervalCount(c: IntervalConfig): number {
  const cycle = c.effort + c.pause;
  return cycle > 0 ? Math.ceil((c.totalMin * 60) / cycle) : 0;
}

/** Temps d'effort réel sur la séance, en secondes. */
export function workSeconds(c: IntervalConfig): number {
  const total = c.totalMin * 60;
  const cycle = c.effort + c.pause;
  let work = 0;
  for (let start = 0; cycle > 0 && start < total; start += cycle) {
    work += Math.min(c.effort, total - start);
  }
  return work;
}

/** Durée maximale de la séance hors mise en place, en secondes (0 = sans limite). */
export function sessionCap(c: SessionConfig): number {
  return c.mode === "intervalles" ? c.totalMin * 60 : c.chronoMin * 60;
}

/** Temps écoulé d'une séance active, en ms. */
export function elapsedMsOf(s: ActiveSession, now = Date.now()): number {
  return s.accumulatedMs + (s.running ? now - s.startedAt : 0);
}

/** État du minuteur à partir du temps écoulé depuis « Démarrer » (mise en place comprise). */
export function compute(t: number, c: SessionConfig): Tick {
  const intervals = c.mode === "intervalles" ? intervalCount(c) : 0;
  const total = c.totalMin * 60;

  if (t < PREP_SECONDS) {
    return {
      phase: "prepa",
      remaining: PREP_SECONDS - t,
      interval: 1,
      intervals,
      totalRemaining: total,
      elapsed: 0,
    };
  }

  const e = t - PREP_SECONDS;

  if (c.mode === "chrono") {
    const cap = c.chronoMin * 60;
    if (cap > 0 && e >= cap) {
      return {
        phase: "fin",
        remaining: 0,
        interval: 0,
        intervals: 0,
        totalRemaining: 0,
        elapsed: cap,
      };
    }
    const left = cap > 0 ? cap - e : 0;
    return {
      phase: "chrono",
      remaining: left,
      interval: 0,
      intervals: 0,
      totalRemaining: left,
      elapsed: e,
    };
  }

  if (e >= total) {
    return {
      phase: "fin",
      remaining: 0,
      interval: intervals,
      intervals,
      totalRemaining: 0,
      elapsed: total,
    };
  }

  const cycle = c.effort + c.pause;
  const idx = Math.floor(e / cycle);
  const within = e - idx * cycle;
  const isEffort = within < c.effort;
  const phaseEnd = isEffort ? c.effort - within : cycle - within;

  return {
    phase: isEffort ? "effort" : "pause",
    remaining: Math.min(phaseEnd, total - e),
    interval: idx + 1,
    intervals,
    totalRemaining: total - e,
    elapsed: e,
  };
}

/** Intervalles réellement faits au moment `tick`. */
export function intervalsDoneAt(tick: Tick): number {
  if (tick.phase === "fin") return tick.intervals;
  if (tick.phase === "pause") return tick.interval;
  return Math.max(0, tick.interval - 1);
}

/**
 * Liste des changements de phase à venir après `fromSec`
 * (secondes depuis « Démarrer »). Sert à prévenir l'utilisateur
 * quand l'appli est en arrière-plan.
 */
export function phaseBoundaries(
  c: SessionConfig,
  fromSec: number,
): PhaseBoundary[] {
  const out: PhaseBoundary[] = [];
  const push = (b: PhaseBoundary) => {
    if (b.at > fromSec) out.push(b);
  };

  if (c.mode === "chrono") {
    if (c.chronoMin > 0)
      push({
        at: PREP_SECONDS + c.chronoMin * 60,
        phase: "fin",
        interval: 0,
        intervals: 0,
      });
    return out;
  }

  const total = c.totalMin * 60;
  const n = intervalCount(c);
  const cycle = c.effort + c.pause;
  for (let i = 0; i < n; i++) {
    const start = i * cycle;
    push({
      at: PREP_SECONDS + start,
      phase: "effort",
      interval: i + 1,
      intervals: n,
    });
    if (c.pause > 0 && start + c.effort < total) {
      push({
        at: PREP_SECONDS + start + c.effort,
        phase: "pause",
        interval: i + 1,
        intervals: n,
      });
    }
  }
  push({ at: PREP_SECONDS + total, phase: "fin", interval: n, intervals: n });
  return out;
}
