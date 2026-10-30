import { useBeeps } from "@/src/hooks/useBeeps";
import { SessionClock } from "@/src/hooks/useSessionClock";
import * as Haptics from "expo-haptics";
import { useEffect, useRef } from "react";

/**
 * Sons et vibrations pendant la séance :
 *  - bip court à 3, 2, 1 avant chaque changement de phase ;
 *  - bip long + vibration au changement de phase.
 */
export function useSessionFeedback(
  { tick, phaseKey, secLeft }: SessionClock,
  running: boolean,
  beepEnabled: boolean,
): void {
  const beeps = useBeeps(beepEnabled);
  const lastPhase = useRef("");
  const lastCountdown = useRef("");

  useEffect(() => {
    if (lastPhase.current && lastPhase.current !== phaseKey) {
      beeps.long();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
        () => {},
      );
    }
    lastPhase.current = phaseKey;
  }, [phaseKey, beeps]);

  useEffect(() => {
    if (!running || tick.phase === "chrono" || tick.phase === "fin") return;
    if (secLeft < 1 || secLeft > 3) return;
    const key = `${phaseKey}-${secLeft}`;
    if (lastCountdown.current === key) return;
    lastCountdown.current = key;
    beeps.short();
  }, [secLeft, phaseKey, running, tick.phase, beeps]);
}
