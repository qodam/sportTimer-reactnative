import { Digits } from "@/src/components/common/Digits";
import { CheckIcon, ClockIcon } from "@/src/components/Icons";
import { QText } from "@/src/components/QText";
import { Ring } from "@/src/components/Ring";
import { useTheme } from "@/src/contexts/ThemeContext";
import { useTranslation } from "@/src/contexts/TranslationContext";
import { intervalsDoneOf, intervalsOf, mmss } from "@/src/lib/format";
import { Session } from "@/src/types";
import { StyleSheet, View } from "react-native";

/**
 * Le résultat, lisible de loin et sans phrase :
 * - finie : anneau vert plein avec une coche
 * - arrêtée : anneau orange partiel avec les intervalles faits
 * - chrono libre : anneau orange avec le nombre de rounds
 */
export function SessionResult({
  session: s,
  size,
}: {
  session: Session;
  size: number;
}) {
  const { colors, SCALE } = useTheme();
  const { t } = useTranslation();

  const isChrono = s.mode === "chrono";
  const total = intervalsOf(s);
  const done = intervalsDoneOf(s);
  const complete = !isChrono && s.completed;
  const doneLabel = t("end.intervalsDone", { done, total });

  return (
    <View style={styles.center}>
      <Ring
        size={size}
        stroke={22}
        progress={isChrono ? 1 : total > 0 ? done / total : 0}
        color={complete ? colors.green : colors.orange}
        track={colors.card2}
      >
        {complete ? (
          <CheckIcon size={size * 0.42} color={colors.green} />
        ) : isChrono ? (
          <View style={styles.inner}>
            <Digits size={size * 0.36}>{s.rounds}</Digits>
            <QText
              variant="body"
              color={colors.mutedForeground}
              style={{ fontSize: 18 * SCALE, marginTop: -6 }}
            >
              {t("common.roundsUnit")}
            </QText>
          </View>
        ) : (
          <Digits size={size * 0.26} accessibilityLabel={doneLabel}>
            {done}
            <QText
              variant="body"
              color={colors.mutedForeground}
              style={{ fontSize: size * 0.26, lineHeight: size * 0.29 }}
            >
              /{total}
            </QText>
          </Digits>
        )}
      </Ring>

      <View style={styles.stats}>
        {complete && (
          <Digits
            size={44 * SCALE}
            color={colors.green}
            accessibilityLabel={doneLabel}
          >
            {done}/{total}
          </Digits>
        )}
        <View
          style={styles.time}
          accessible
          accessibilityLabel={t("common.duration", {
            time: mmss(s.durationSec),
          })}
        >
          <ClockIcon size={24} color={colors.mutedForeground} />
          <Digits size={26 * SCALE} color={colors.mutedForeground}>
            {mmss(s.durationSec)}
          </Digits>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 28 },
  inner: { alignItems: "center" },
  stats: { alignItems: "center", gap: 6 },
  time: { flexDirection: "row", alignItems: "center", gap: 8 },
});
