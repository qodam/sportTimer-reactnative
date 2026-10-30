import { RoundButton } from "@/src/components/RoundButton";
import { PhaseRing } from "@/src/components/session/PhaseRing";
import { PREP_SECONDS } from "@/src/constants/session";
import { useTheme } from "@/src/contexts/ThemeContext";
import { useTranslation } from "@/src/contexts/TranslationContext";
import { SessionClock } from "@/src/hooks/useSessionClock";
import { StyleSheet, View } from "react-native";

interface Props {
  clock: SessionClock;
  running: boolean;
  ringSize: number;
  onCancel: () => void;
  onSkip: () => void;
}

/** Mise en place : « PRÊT ? » et le compte à rebours de 10 s. */
export function PrepView({
  clock,
  running,
  ringSize,
  onCancel,
  onSkip,
}: Props) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { tick, secLeft, phaseKey } = clock;

  return (
    <>
      <View style={styles.center}>
        <PhaseRing
          size={ringSize}
          label={t("session.ready")}
          value={`${secLeft}`}
          valueRatio={0.48}
          color={colors.orange}
          track="rgba(255,159,10,0.22)"
          progress={tick.remaining / PREP_SECONDS}
          running={running}
          remainingMs={tick.remaining * 1000}
          phaseKey={phaseKey}
        />
      </View>
      <View style={styles.buttons}>
        <RoundButton
          size={88}
          bg={colors.gray}
          fg={colors.foreground}
          label={t("session.cancel")}
          accessibilityLabel={t("session.cancel")}
          onPress={onCancel}
        />
        <RoundButton
          size={88}
          bg={colors.greenDark}
          fg={colors.green}
          label={t("session.skip")}
          accessibilityLabel={t("session.skipA11y")}
          onPress={onSkip}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  buttons: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 4,
    marginBottom: 12,
  },
});
