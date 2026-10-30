import { useTheme } from "@/src/contexts/ThemeContext";
import { useHoldToConfirm } from "@/src/hooks/useHoldToConfirm";
import { ReactNode } from "react";
import { Animated, Pressable, StyleSheet, View } from "react-native";

interface Props {
  /** Lu par VoiceOver / TalkBack (le bouton n'affiche que l'icône) */
  label: string;
  icon: ReactNode;
  /** Couleur qui remplit le bouton pendant l'appui */
  fill: string;
  onConfirm: () => void;
  height?: number;
}

/**
 * Bouton à maintenir : il se remplit de gauche à droite pendant l'appui,
 * l'action se déclenche quand il est plein. Relâcher avant annule.
 */
export function HoldButton({
  label,
  icon,
  fill,
  onConfirm,
  height = 64,
}: Props) {
  const { colors } = useTheme();
  const hold = useHoldToConfirm(onConfirm);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityActions={[{ name: "activate" }]}
      onAccessibilityAction={hold.confirm}
      onPressIn={hold.onPressIn}
      onPressOut={hold.onPressOut}
      style={styles.container}
    >
      <Animated.View
        style={[
          styles.btn,
          {
            height,
            backgroundColor: colors.card,
            transform: [{ scale: hold.scale }],
          },
        ]}
      >
        <Animated.View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: fill,
              transformOrigin: "left",
              transform: [{ scaleX: hold.progress }],
            },
          ]}
        />
        <View style={styles.content}>{icon}</View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  btn: { borderRadius: 24, overflow: "hidden", justifyContent: "center" },
  content: { alignItems: "center", justifyContent: "center" },
});
