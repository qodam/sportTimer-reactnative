import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake";
import { useEffect } from "react";

const TAG = "pushpause-session";

/** Garde l'écran allumé tant que `enabled` est vrai et que l'écran est affiché. */
export function useScreenAwake(enabled: boolean): void {
  useEffect(() => {
    if (!enabled) return;
    activateKeepAwakeAsync(TAG).catch(() => {});
    return () => {
      deactivateKeepAwake(TAG);
    };
  }, [enabled]);
}
