import * as Haptics from "expo-haptics";
import { useCallback, useEffect, useRef } from "react";

const REPEAT_MS = 110;

/**
 * Appui simple = une action ; appui long = l'action se répète tant qu'on
 * garde le doigt (pour faire défiler une valeur avec − / +).
 */
export function useRepeatPress(action: () => void) {
  const actionRef = useRef(action);
  actionRef.current = action;
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = useCallback(() => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
  }, []);

  useEffect(() => stop, [stop]);

  const onPress = useCallback(() => actionRef.current(), []);

  const onLongPress = useCallback(() => {
    stop();
    timer.current = setInterval(() => {
      Haptics.selectionAsync().catch(() => {});
      actionRef.current();
    }, REPEAT_MS);
  }, [stop]);

  return { onPress, onLongPress, onPressOut: stop };
}
