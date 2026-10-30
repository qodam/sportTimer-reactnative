/**
 * Séance en cours : démarrer, mettre en pause, recommencer, terminer…
 *
 * Le contexte ne stocke que des instants (début, temps cumulé, en marche
 * ou non). Il ne se met jamais à jour toutes les secondes : ce sont les
 * écrans qui lisent l'heure avec `useSessionClock`. Résultat :
 *  - pas de rendu inutile du reste de l'appli ;
 *  - la séance survit à un passage en arrière-plan, et même à la
 *    fermeture de l'appli (elle est sauvegardée sur le téléphone).
 * La carte affichée hors de l'appli (Android) est gérée par
 * `useForegroundSession`, depuis l'écran de séance.
 */
import { SessionService } from "@/modules/session-service";
import {
  MIN_SAVED_SECONDS,
  PREP_SECONDS,
  STORAGE_KEYS,
} from "@/src/constants/session";
import { useHistory } from "@/src/contexts/HistoryContext";
import { usePersistentState } from "@/src/hooks/usePersistentState";
import {
  compute,
  elapsedMsOf,
  intervalsDoneAt,
  sessionCap,
} from "@/src/lib/timer";
import { ActiveSession, Session, Settings } from "@/src/types";
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useRef,
} from "react";

interface TimerContextType {
  /** Séance en cours, ou null */
  session: ActiveSession | null;
  /** true une fois une éventuelle séance en cours relue depuis le téléphone */
  ready: boolean;
  start: (settings: Settings) => void;
  togglePause: () => void;
  restart: () => void;
  skipPrep: () => void;
  addRound: () => void;
  removeRound: () => void;
  /** Abandonne sans rien enregistrer */
  cancel: () => void;
  /** Termine la séance. Renvoie la séance enregistrée, ou null si elle était trop courte. */
  finish: () => Session | null;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export const TimerProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { addSession } = useHistory();
  const [session, setSession, ready] = usePersistentState<ActiveSession | null>(
    STORAGE_KEYS.activeSession,
    null,
  );

  // Toujours la dernière version, pour les actions déclenchées en différé (appui long)
  const sessionRef = useRef(session);
  sessionRef.current = session;

  const update = useCallback(
    (fn: (s: ActiveSession) => ActiveSession) =>
      setSession((s) => (s ? fn(s) : s)),
    [setSession],
  );

  const start = useCallback(
    (settings: Settings) => {
      const { beep, keepAwake, ...config } = settings;
      setSession({
        config,
        beep,
        keepAwake,
        startedAt: Date.now(),
        accumulatedMs: 0,
        running: true,
        rounds: 0,
      });
      SessionService.requestPermission(); // Android 13+ : pour afficher la carte de séance
    },
    [setSession],
  );

  const togglePause = useCallback(
    () =>
      update((s) => {
        const now = Date.now();
        return s.running
          ? {
              ...s,
              running: false,
              accumulatedMs: s.accumulatedMs + now - s.startedAt,
            }
          : { ...s, running: true, startedAt: now };
      }),
    [update],
  );

  const restart = useCallback(
    () =>
      update((s) => ({
        ...s,
        startedAt: Date.now(),
        accumulatedMs: 0,
        running: true,
        rounds: 0,
      })),
    [update],
  );

  const skipPrep = useCallback(
    () =>
      update((s) => {
        const missing = PREP_SECONDS * 1000 - elapsedMsOf(s);
        return missing > 0
          ? { ...s, accumulatedMs: s.accumulatedMs + missing }
          : s;
      }),
    [update],
  );

  const addRound = useCallback(
    () => update((s) => ({ ...s, rounds: s.rounds + 1 })),
    [update],
  );
  const removeRound = useCallback(
    () => update((s) => ({ ...s, rounds: Math.max(0, s.rounds - 1) })),
    [update],
  );

  const cancel = useCallback(() => {
    setSession(null);
  }, [setSession]);

  const finish = useCallback((): Session | null => {
    const s = sessionRef.current;
    if (!s) return null;
    sessionRef.current = null; // évite un double enregistrement (fin auto + appui)
    setSession(null);

    const elapsedSec = elapsedMsOf(s) / 1000;
    const tick = compute(elapsedSec, s.config);
    const cap = sessionCap(s.config);
    const workSec = Math.max(0, elapsedSec - PREP_SECONDS);
    const durationSec = cap > 0 ? Math.min(workSec, cap) : workSec;
    if (durationSec < MIN_SAVED_SECONDS) return null;

    const isIntervals = s.config.mode === "intervalles";
    return addSession({
      mode: s.config.mode,
      effort: s.config.effort,
      pause: s.config.pause,
      totalMin: s.config.totalMin,
      durationSec: Math.round(durationSec),
      completed: tick.phase === "fin",
      intervals: isIntervals ? tick.intervals : undefined,
      intervalsDone: isIntervals ? intervalsDoneAt(tick) : undefined,
      rounds: isIntervals ? 0 : s.rounds,
    });
  }, [setSession, addSession]);

  const value = useMemo(
    () => ({
      session,
      ready,
      start,
      togglePause,
      restart,
      skipPrep,
      addRound,
      removeRound,
      cancel,
      finish,
    }),
    [
      session,
      ready,
      start,
      togglePause,
      restart,
      skipPrep,
      addRound,
      removeRound,
      cancel,
      finish,
    ],
  );

  return (
    <TimerContext.Provider value={value}>{children}</TimerContext.Provider>
  );
};

export const useTimer = (): TimerContextType => {
  const context = useContext(TimerContext);
  if (!context) throw new Error("useTimer must be used within a TimerProvider");
  return context;
};
