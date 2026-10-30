import { IntervalHeader } from "@/src/components/session/IntervalHeader";
import { PhaseRing } from "@/src/components/session/PhaseRing";
import { SessionControls } from "@/src/components/session/SessionControls";
import { useTheme } from "@/src/contexts/ThemeContext";
import { useTranslation } from "@/src/contexts/TranslationContext";
import { SessionClock } from "@/src/hooks/useSessionClock";
import { mmss } from "@/src/lib/format";
import { SessionConfig } from "@/src/types";
import { StyleSheet, View } from "react-native";

interface Props {
  clock: SessionClock;
  config: SessionConfig;
  running: boolean;
  ringSize: number;
  onTogglePause: () => void;
  onRestart: () => void;
  onFinish: () => void;
}

/** Effort / repos : progression en haut, anneau au centre, boutons en bas. */
export function IntervalView({
  clock,
  config,
  running,
  ringSize,
  ...actions
}: Props) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { tick, secLeft, phaseKey } = clock;
  const isRest = tick.phase === "pause";
  const tint = isRest ? colors.blue : colors.orange;
  const phaseLen = isRest ? config.pause : config.effort;

  return (
    <>
      <IntervalHeader tick={tick} tint={tint} />
      <View style={styles.center}>
        <PhaseRing
          size={ringSize}
          label={isRest ? t("session.rest") : t("session.work")}
          value={mmss(secLeft)}
          color={tint}
          track={colors.card2}
          progress={phaseLen > 0 ? tick.remaining / phaseLen : 0}
          running={running}
          remainingMs={tick.remaining * 1000}
          phaseKey={phaseKey}
        />
      </View>
      <SessionControls running={running} tint={tint} height={96} {...actions} />
    </>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
});
