import { HOLD_MS } from "@/src/constants/session";
import * as Haptics from "expo-haptics";
import { useCallback, useRef } from "react";
import { Animated, Easing } from "react-native";

/**
 * Logique d'un bouton « à maintenir » : `progress` va de 0 à 1 pendant
 * l'appui, et l'action se déclenche quand il arrive à 1.
 * Relâcher avant annule (la barre revient en arrière).
 */
export function useHoldToConfirm(onConfirm: () => void, duration = HOLD_MS) {
  const progress = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const done = useRef(false);
  const action = useRef(onConfirm);
  action.current = onConfirm;

  const onPressIn = useCallback(() => {
    done.current = false;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    Animated.spring(scale, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 50,
    }).start();
    Animated.timing(progress, {
      toValue: 1,
      duration,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (!finished) return;
      done.current = true;
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
        () => {},
      );
      action.current();
      progress.setValue(0);
    });
  }, [duration, progress, scale]);

  const onPressOut = useCallback(() => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 30,
      bounciness: 6,
    }).start();
    if (done.current) return;
    progress.stopAnimation();
    Animated.timing(progress, {
      toValue: 0,
      duration: 180,
      useNativeDriver: true,
    }).start();
  }, [progress, scale]);

  /** Pour VoiceOver / TalkBack : action directe, sans maintien */
  const confirm = useCallback(() => action.current(), []);

  return { progress, scale, onPressIn, onPressOut, confirm };
}
