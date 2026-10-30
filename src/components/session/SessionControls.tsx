import { ScalePressable } from "@/src/components/buttons/ScalePressable";
import { HoldButton } from "@/src/components/HoldButton";
import {
  PauseIcon,
  PlayIcon,
  ResetIcon,
  StopIcon,
} from "@/src/components/Icons";
import { useTheme } from "@/src/contexts/ThemeContext";
import { useTranslation } from "@/src/contexts/TranslationContext";
import { StyleSheet, View } from "react-native";

interface Props {
  running: boolean;
  /** Couleur du bouton pause (orange en effort, bleu en repos) */
  tint: string;
  /** Bouton pause gris, pour l'écran chrono libre */
  neutral?: boolean;
  height: number;
  onTogglePause: () => void;
  onRestart: () => void;
  onFinish: () => void;
}

/** Une seule ligne, sans texte : ↺ (maintenir) · pause / reprendre · ■ (maintenir). */
export function SessionControls({
  running,
  tint,
  neutral,
  height,
  onTogglePause,
  onRestart,
  onFinish,
}: Props) {
  const { colors, SCALE } = useTheme();
  const { t } = useTranslation();
  const h = height * SCALE;
  const mainBg = running ? (neutral ? colors.card : tint) : colors.green;

  return (
    <View style={styles.row}>
      <HoldButton
        label={t("session.hold", { action: t("session.restart") })}
        icon={<ResetIcon size={30} color={colors.foreground} />}
        fill="rgba(255,255,255,0.14)"
        height={h}
        onConfirm={onRestart}
      />
      <ScalePressable
        accessibilityLabel={running ? t("session.pause") : t("session.resume")}
        onPress={onTogglePause}
        containerStyle={styles.mainContainer}
        style={[styles.main, { height: h, backgroundColor: mainBg }]}
      >
        {running ? (
          <PauseIcon
            size={40}
            color={neutral ? colors.foreground : "#000000"}
          />
        ) : (
          <PlayIcon size={40} color="#000000" />
        )}
      </ScalePressable>
      <HoldButton
        label={t("session.hold", { action: t("session.finish") })}
        icon={<StopIcon size={28} color={colors.red} />}
        fill="rgba(255,69,58,0.30)"
        height={h}
        onConfirm={onFinish}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  mainContainer: { flex: 1.8 },
  main: { borderRadius: 24, alignItems: "center", justifyContent: "center" },
});
