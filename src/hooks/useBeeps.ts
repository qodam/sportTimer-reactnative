import { AudioPlayer, setAudioModeAsync, useAudioPlayer } from "expo-audio";
import { useCallback, useEffect } from "react";

/** Bip court (3-2-1) et bip long (changement de phase). */
export function useBeeps(enabled: boolean) {
  const short = useAudioPlayer(require("@/assets/sounds/bip-court.wav"));
  const long = useAudioPlayer(require("@/assets/sounds/bip-long.wav"));

  useEffect(() => {
    // Les bips sonnent même si le téléphone est en mode silencieux (iPhone).
    setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
  }, []);

  const play = useCallback(
    (player: AudioPlayer) => {
      if (!enabled) return;
      try {
        player.seekTo(0);
        player.play();
      } catch {
        // Un bip raté ne doit jamais bloquer le chrono.
      }
    },
    [enabled],
  );

  return {
    short: useCallback(() => play(short), [play, short]),
    long: useCallback(() => play(long), [play, long]),
  };
}
