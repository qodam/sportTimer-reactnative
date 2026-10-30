import { ReactNode, useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const clamp = (v: number) => Math.min(1, Math.max(0, v));

type Props = {
  size: number;
  stroke?: number;
  /** Part de l'anneau remplie au moment présent (0 à 1). */
  progress: number;
  color: string;
  track: string;
  /** Si vrai, l'anneau se vide tout seul jusqu'à 0 en `remainingMs`. */
  running?: boolean;
  remainingMs?: number;
  /** Change à chaque nouvelle phase : l'anneau se recale alors sur `progress`. */
  syncKey?: string;
  children?: ReactNode;
};

/**
 * Anneau de progression façon app Minuteur.
 * L'animation tourne sur le fil d'affichage du téléphone (Reanimated) :
 * elle reste fluide même si le reste de l'écran se met à jour.
 */
export function Ring({
  size,
  stroke = 18,
  progress,
  color,
  track,
  running = false,
  remainingMs = 0,
  syncKey = "",
  children,
}: Props) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const p = useSharedValue(clamp(progress));

  // On se recale uniquement au changement de phase, à la pause et à la reprise,
  // pas à chaque rafraîchissement du chrono.
  useEffect(() => {
    cancelAnimation(p);
    p.value = clamp(progress);
    if (running && remainingMs > 0) {
      p.value = withTiming(0, { duration: remainingMs, easing: Easing.linear });
    }
  }, [syncKey, running]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: c * (1 - p.value),
    strokeOpacity: p.value > 0.002 ? 1 : 0, // pas de petit point quand l'anneau est vide
  }));

  return (
    <View style={{ width: size, height: size }}>
      {/* Rotation de -90° pour que l'anneau parte du haut */}
      <Svg
        width={size}
        height={size}
        style={{ transform: [{ rotate: "-90deg" }] }}
      >
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={track}
          strokeWidth={stroke}
          fill="none"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${c} ${c}`}
          animatedProps={animatedProps}
        />
      </Svg>
      <View style={[StyleSheet.absoluteFill, styles.center]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: "center", justifyContent: "center" },
});
