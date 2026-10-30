import { ScalePressable } from "@/src/components/buttons/ScalePressable";
import { ClockIcon } from "@/src/components/Icons";
import { QText } from "@/src/components/QText";
import { Ring } from "@/src/components/Ring";
import { useTheme } from "@/src/contexts/ThemeContext";
import { useTranslation } from "@/src/contexts/TranslationContext";
import { Theme, useThemedStyles } from "@/src/hooks/useThemedStyles";
import {
  intervalsDoneOf,
  intervalsOf,
  jourCourt,
  mmss,
} from "@/src/lib/format";
import { Session } from "@/src/types";
import { StyleSheet, View } from "react-native";
import ReanimatedSwipeable from "react-native-gesture-handler/ReanimatedSwipeable";

interface Props {
  session: Session;
  last: boolean;
  onDelete: () => void;
}

/** Une séance : petit anneau, résultat en gros, réglages en petit, jour à droite. Balayer = supprimer. */
export function SessionRow({ session: s, last, onDelete }: Props) {
  const styles = useThemedStyles(makeStyles);
  const { colors } = useTheme();
  const { t, targetLanguageTag } = useTranslation();

  const isChrono = s.mode === "chrono";
  const total = intervalsOf(s);
  const done = intervalsDoneOf(s);
  const complete = !isChrono && s.completed;

  const title = isChrono
    ? t("common.rounds", { count: s.rounds })
    : `${done}/${total}`;
  const detail = isChrono
    ? `${t("history.chrono")} · ${mmss(s.durationSec)}`
    : `${s.effort}/${s.pause} · ${s.totalMin} min`;

  return (
    <ReanimatedSwipeable
      friction={2}
      rightThreshold={40}
      overshootRight={false}
      renderRightActions={() => (
        <ScalePressable
          accessibilityLabel={t("history.deleteA11y")}
          onPress={onDelete}
          containerStyle={styles.deleteContainer}
          style={styles.delete}
        >
          <QText variant="body" style={styles.deleteText}>
            {t("history.delete")}
          </QText>
        </ScalePressable>
      )}
    >
      <View style={[styles.row, !last && styles.separator]}>
        {isChrono ? (
          <View style={styles.badge}>
            <ClockIcon size={22} color={colors.mutedForeground} />
          </View>
        ) : (
          <Ring
            size={44}
            stroke={6}
            progress={total > 0 ? done / total : 0}
            color={complete ? colors.green : colors.orange}
            track={colors.card2}
          />
        )}
        <View style={styles.texts}>
          <QText
            variant="h3"
            style={[styles.title, complete && styles.titleDone]}
          >
            {title}
          </QText>
          <QText variant="body" style={styles.detail}>
            {detail}
          </QText>
        </View>
        <QText variant="body" style={styles.date}>
          {jourCourt(s.date, targetLanguageTag)}
        </QText>
      </View>
    </ReanimatedSwipeable>
  );
}

const makeStyles = ({ colors, fonts, tabular, SCALE: S }: Theme) =>
  StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
      paddingVertical: 12,
      paddingHorizontal: 16,
      backgroundColor: colors.card,
    },
    separator: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.separator,
    },
    badge: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.card2,
      alignItems: "center",
      justifyContent: "center",
    },
    texts: { flex: 1, gap: 1 },
    title: { fontSize: 22 * S, lineHeight: 28 * S, ...tabular },
    titleDone: { color: colors.green },
    detail: {
      fontSize: 15 * S,
      lineHeight: 20 * S,
      color: colors.mutedForeground,
      ...tabular,
    },
    date: { fontSize: 15 * S, color: colors.mutedForeground },
    deleteContainer: { width: 100 },
    delete: {
      flex: 1,
      backgroundColor: colors.red,
      alignItems: "center",
      justifyContent: "center",
    },
    deleteText: { fontFamily: fonts.medium, fontSize: 15 * S },
  });
