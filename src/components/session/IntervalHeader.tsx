import { QText } from "@/src/components/QText";
import { useTranslation } from "@/src/contexts/TranslationContext";
import { Theme, useThemedStyles } from "@/src/hooks/useThemedStyles";
import { mmss } from "@/src/lib/format";
import { Tick } from "@/src/types";
import { StyleSheet, View } from "react-native";

interface Props {
  tick: Tick;
  /** Couleur de la phase, pour la barre de progression */
  tint: string;
}

/** En haut : « 7/24 » à gauche, le temps total restant à droite, et la barre de progression. */
export function IntervalHeader({ tick, tint }: Props) {
  const styles = useThemedStyles(makeStyles);
  const { t } = useTranslation();
  const left = mmss(Math.ceil(tick.totalRemaining));
  const current = Math.min(tick.interval, tick.intervals);
  const done = Math.max(0, tick.interval - (tick.phase === "pause" ? 0 : 1));

  return (
    <View>
      <View style={styles.row}>
        <QText
          variant="h1"
          style={styles.value}
          accessibilityLabel={t("common.intervalOf", {
            current,
            total: tick.intervals,
          })}
        >
          {current}
          <QText variant="h1" style={[styles.value, styles.soft]}>
            /{tick.intervals}
          </QText>
        </QText>
        <QText
          variant="h1"
          style={styles.value}
          accessibilityLabel={t("common.timeLeft", { time: left })}
        >
          {left}
        </QText>
      </View>
      <View style={styles.progress}>
        <View
          style={[
            styles.part,
            { flex: Math.max(done, 0.0001), backgroundColor: tint },
          ]}
        />
        <View
          style={[
            styles.part,
            styles.rest,
            { flex: Math.max(tick.intervals - done, 0.0001) },
          ]}
        />
      </View>
    </View>
  );
}

const makeStyles = ({ colors, fonts, tabular, SCALE: S }: Theme) =>
  StyleSheet.create({
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "baseline",
      paddingTop: 16,
      paddingHorizontal: 4,
    },
    value: { fontSize: 34 * S, lineHeight: 42 * S, ...tabular },
    soft: { fontFamily: fonts.medium, color: colors.mutedForeground },
    progress: {
      flexDirection: "row",
      gap: 3,
      marginTop: 14,
      paddingHorizontal: 12,
    },
    part: { height: 4, borderRadius: 2 },
    rest: { backgroundColor: colors.card2 },
  });
