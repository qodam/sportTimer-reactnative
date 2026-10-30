import { Digits } from "@/src/components/common/Digits";
import { QText } from "@/src/components/QText";
import { Ring } from "@/src/components/Ring";
import { useTheme } from "@/src/contexts/ThemeContext";
import { StyleSheet } from "react-native";

interface Props {
  size: number;
  /** Mot affiché au-dessus du chrono (EFFORT, REPOS, PRÊT ?) */
  label: string;
  /** Texte du chrono (0:24, 10…) */
  value: string;
  /** Taille du chrono en proportion de l'anneau */
  valueRatio?: number;
  color: string;
  track: string;
  /** Part de la phase qui reste, de 0 à 1 */
  progress: number;
  running: boolean;
  remainingMs: number;
  phaseKey: string;
}

/** L'anneau qui se vide pendant la phase, avec le mot et le chrono au centre. */
export function PhaseRing({
  size,
  label,
  value,
  valueRatio = 0.38,
  color,
  track,
  progress,
  running,
  remainingMs,
  phaseKey,
}: Props) {
  const { SCALE } = useTheme();

  return (
    <Ring
      size={size}
      progress={progress}
      color={color}
      track={track}
      running={running}
      remainingMs={remainingMs}
      syncKey={phaseKey}
    >
      <QText
        variant="h3"
        color={color}
        style={[styles.label, { fontSize: 24 * SCALE, lineHeight: 30 * SCALE }]}
      >
        {label}
      </QText>
      <Digits size={size * valueRatio} fit style={{ maxWidth: size * 0.84 }}>
        {value}
      </Digits>
    </Ring>
  );
}

const styles = StyleSheet.create({
  label: { letterSpacing: 2 },
});
