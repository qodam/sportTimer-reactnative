import { QText } from "@/src/components/QText";
import { useTranslation } from "@/src/contexts/TranslationContext";
import { Theme, useThemedStyles } from "@/src/hooks/useThemedStyles";
import { WeekDay } from "@/src/hooks/useWeekStats";
import { duree } from "@/src/lib/format";
import { StyleSheet, View } from "react-native";

const FALLBACK_DAYS = ["M", "T", "W", "T", "F", "S", "S"];

interface Props {
  days: WeekDay[];
  sessionCount: number;
  totalSec: number;
}

/** La semaine en un coup d'œil : une pastille par jour, puis « 3 séances · 53 min ». */
export function WeekSummary({ days, sessionCount, totalSec }: Props) {
  const styles = useThemedStyles(makeStyles);
  const { t } = useTranslation();
  const letters = t("history.days") as unknown;
  const dayLetters = Array.isArray(letters)
    ? (letters as string[])
    : FALLBACK_DAYS;

  return (
    <View style={styles.card}>
      <View style={styles.days}>
        {days.map((d, i) => (
          <View key={i} style={styles.day}>
            <QText
              variant="label"
              style={[styles.letter, d.isToday && styles.letterToday]}
            >
              {dayLetters[i]}
            </QText>
            <View
              accessible
              accessibilityLabel={
                d.done ? t("history.dayDone") : t("history.dayEmpty")
              }
              style={[
                styles.dot,
                d.done ? styles.dotDone : styles.dotEmpty,
                d.isToday && !d.done && styles.dotToday,
              ]}
            />
          </View>
        ))}
      </View>
      <QText variant="body" style={styles.summary}>
        <QText variant="body" style={styles.strong}>
          {sessionCount}
        </QText>{" "}
        {t("history.sessions", { count: sessionCount })}
        {"  ·  "}
        <QText variant="body" style={styles.strong}>
          {duree(Math.round(totalSec / 60) * 60)}
        </QText>
      </QText>
    </View>
  );
}

const makeStyles = ({ colors, fonts, tabular, SCALE: S }: Theme) =>
  StyleSheet.create({
    card: {
      borderRadius: 20,
      backgroundColor: colors.card,
      paddingVertical: 16,
      paddingHorizontal: 14,
      gap: 14,
    },
    days: { flexDirection: "row", justifyContent: "space-between" },
    day: { alignItems: "center", gap: 8, flex: 1 },
    letter: { fontSize: 13 * S },
    letterToday: { color: colors.foreground },
    dot: { width: 30 * S, height: 30 * S, borderRadius: 15 * S },
    dotDone: { backgroundColor: colors.orange },
    dotEmpty: { backgroundColor: colors.card2 },
    dotToday: { borderWidth: 2, borderColor: colors.foreground },
    summary: {
      textAlign: "center",
      fontSize: 17 * S,
      color: colors.mutedForeground,
      ...tabular,
    },
    strong: {
      fontFamily: fonts.bold,
      fontSize: 17 * S,
      color: colors.foreground,
    },
  });
