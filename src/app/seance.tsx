import { Screen } from "@/src/components/common/Screen";
import { ChronoView } from "@/src/components/session/ChronoView";
import { IntervalView } from "@/src/components/session/IntervalView";
import { PrepView } from "@/src/components/session/PrepView";
import { useTheme } from "@/src/contexts/ThemeContext";
import { useTimer } from "@/src/contexts/TimerContext";
import { useBackgroundAudio } from "@/src/hooks/useBackgroundAudio";
import { useForegroundSession } from "@/src/hooks/useForegroundSession";
import { useScreenAwake } from "@/src/hooks/useScreenAwake";
import { useSessionClock } from "@/src/hooks/useSessionClock";
import { useSessionFeedback } from "@/src/hooks/useSessionFeedback";
import { ActiveSession } from "@/src/types";
import { router } from "expo-router";
import { useCallback, useEffect, useRef } from "react";
import { useWindowDimensions } from "react-native";

export default function SessionScreen() {
  const { session } = useTimer();
  // Juste après « Terminer », la séance n'existe plus le temps de changer d'écran.
  if (!session) return <Screen />;
  return <RunningSession session={session} />;
}

function RunningSession({ session }: { session: ActiveSession }) {
  const timer = useTimer();
  const { SCALE } = useTheme();
  const { width, height } = useWindowDimensions();
  const clock = useSessionClock(session);

  useSessionFeedback(clock, session.running, session.beep);
  useScreenAwake(session.keepAwake);
  useBackgroundAudio(session.running); // iPhone : reste éveillée hors de l'appli

  // Fin auto et appui sur « Terminer » peuvent arriver presque en même temps
  const leaving = useRef(false);

  const finish = useCallback(() => {
    if (leaving.current) return;
    leaving.current = true;
    const saved = timer.finish();
    if (saved) router.replace({ pathname: "/fin", params: { id: saved.id } });
    else router.back(); // arrêtée avant d'avoir vraiment commencé : rien à montrer
  }, [timer]);

  // Carte Android hors de l'appli : phase + compte à rebours, boutons Pause / Terminer
  useForegroundSession(session, { togglePause: timer.togglePause, finish });

  const cancel = useCallback(() => {
    if (leaving.current) return;
    leaving.current = true;
    timer.cancel();
    router.back();
  }, [timer]);

  // Fin automatique quand le temps est écoulé
  useEffect(() => {
    if (clock.tick.phase === "fin") finish();
  }, [clock.tick.phase]);

  const ringSize = Math.min(width - 40, height * 0.42, 340 * SCALE);
  const controls = {
    onTogglePause: timer.togglePause,
    onRestart: timer.restart,
    onFinish: finish,
  };

  return (
    <Screen>
      {clock.tick.phase === "prepa" ? (
        <PrepView
          clock={clock}
          running={session.running}
          ringSize={ringSize}
          onCancel={cancel}
          onSkip={timer.skipPrep}
        />
      ) : session.config.mode === "chrono" ? (
        <ChronoView
          clock={clock}
          running={session.running}
          rounds={session.rounds}
          hasCap={session.config.chronoMin > 0}
          onAddRound={timer.addRound}
          onRemoveRound={timer.removeRound}
          {...controls}
        />
      ) : (
        <IntervalView
          clock={clock}
          config={session.config}
          running={session.running}
          ringSize={ringSize}
          {...controls}
        />
      )}
    </Screen>
  );
}
