import { TICK_MS } from "@/src/constants/session";
import { compute, elapsedMsOf } from "@/src/lib/timer";
import { ActiveSession, Tick } from "@/src/types";
import { useEffect, useState } from "react";

export interface SessionClock {
  tick: Tick;
  /** Change à chaque nouvelle phase (sert à recaler l'anneau et les bips) */
  phaseKey: string;
  /** Secondes restantes dans la phase, arrondies au-dessus (ce qu'on affiche) */
  secLeft: number;
}

/**
 * Lit l'heure plusieurs fois par seconde et en déduit l'état de la séance.
 * Ne tourne que pendant la séance, et seulement quand elle avance.
 */
export function useSessionClock(session: ActiveSession): SessionClock {
  const [now, setNow] = useState(Date.now);

  useEffect(() => {
    setNow(Date.now()); // affiche tout de suite le bon état (reprise, retour d'arrière-plan)
    if (!session.running) return;
    const id = setInterval(() => setNow(Date.now()), TICK_MS);
    return () => clearInterval(id);
  }, [session.running, session.startedAt, session.accumulatedMs]);

  const tick = compute(elapsedMsOf(session, now) / 1000, session.config);
  return {
    tick,
    phaseKey: `${tick.phase}-${tick.interval}`,
    secLeft: Math.ceil(tick.remaining),
  };
}
