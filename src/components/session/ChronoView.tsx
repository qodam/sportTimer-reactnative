import { Digits } from "@/src/components/common/Digits";
import { QText } from "@/src/components/QText";
import { RoundCounter } from "@/src/components/session/RoundCounter";
import { SessionControls } from "@/src/components/session/SessionControls";
import { useTheme } from "@/src/contexts/ThemeContext";
import { useTranslation } from "@/src/contexts/TranslationContext";
import { SessionClock } from "@/src/hooks/useSessionClock";
import { mmss } from "@/src/lib/format";
import { StyleSheet, View, useWindowDimensions } from "react-native";

interface Props {
  clock: SessionClock;
  running: boolean;
  rounds: number;
  /** true si une limite de temps est réglée */
  hasCap: boolean;
  onTogglePause: () => void;
  onRestart: () => void;
  onFinish: () => void;
  onAddRound: () => void;
  onRemoveRound: () => void;
}

/** Chrono libre : boutons discrets en haut, le temps au centre, le compteur en bas. */
export function ChronoView({
  clock,
  running,
  rounds,
  hasCap,
  onAddRound,
  onRemoveRound,
  ...actions
}: Props) {
  const { colors, tabular, SCALE } = useTheme();
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const left = mmss(Math.ceil(clock.tick.totalRemaining));

  return (
    <>
      <View style={styles.top}>
        <SessionControls
          running={running}
          tint={colors.orange}
          neutral
          height={64}
          {...actions}
        />
      </View>

      <View style={styles.center}>
        <Digits size={Math.min(width * 0.3, 120 * SCALE)} fit>
          {mmss(Math.floor(clock.tick.elapsed))}
        </Digits>
        {hasCap && (
          <QText
            variant="h2"
            color={colors.mutedForeground}
            style={tabular}
            accessibilityLabel={t("common.timeLeft", { time: left })}
          >
            −{left}
          </QText>
        )}
      </View>

      <RoundCounter
        rounds={rounds}
        onAdd={onAddRound}
        onRemove={onRemoveRound}
      />
    </>
  );
}

const styles = StyleSheet.create({
  top: { paddingTop: 12 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
});
