import { useAudioPlayer } from "expo-audio";
import { useEffect } from "react";
import { Platform } from "react-native";

/**
 * iPhone uniquement : pendant que la séance tourne, une piste silencieuse
 * joue en boucle. Tant qu'un son joue, iOS laisse l'appli éveillée hors
 * de l'écran, donc :
 *  - les bips 3-2-1 continuent ;
 *  - la Live Activity passe d'effort à repos à l'heure prévue.
 * En pause, la piste s'arrête : rien à faire tourner.
 * (Android n'en a pas besoin : le service au premier plan s'en charge.)
 */
export function useBackgroundAudio(active: boolean): void {
  const enabled = Platform.OS === "ios";
  const player = useAudioPlayer(
    enabled ? require("@/assets/sounds/silence.wav") : null,
  );

  useEffect(() => {
    if (!enabled) return;
    try {
      player.loop = true;
      if (active) player.play();
      else player.pause();
    } catch {
      // Sans piste, la séance marche quand même tant que l'appli est à l'écran.
    }
  }, [enabled, active, player]);

  // Écran de séance quitté : silence complet
  useEffect(
    () => () => {
      try {
        player.pause();
      } catch {
        // déjà libéré
      }
    },
    [player],
  );
}
