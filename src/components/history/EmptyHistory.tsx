import { QText } from "@/src/components/QText";
import { useTranslation } from "@/src/contexts/TranslationContext";
import { Theme, useThemedStyles } from "@/src/hooks/useThemedStyles";
import { StyleSheet, View } from "react-native";

/** Affiché tant qu'aucune séance n'a été terminée. */
export function EmptyHistory() {
  const styles = useThemedStyles(makeStyles);
  const { t } = useTranslation();

  return (
    <View style={styles.card}>
      <QText variant="h3">{t("history.emptyTitle")}</QText>
      <QText variant="body" style={styles.text}>
        {t("history.emptyText")}
      </QText>
    </View>
  );
}

const makeStyles = ({ colors, SCALE: S }: Theme) =>
  StyleSheet.create({
    card: {
      borderRadius: 16,
      backgroundColor: colors.card,
      padding: 24,
      alignItems: "center",
      gap: 6,
    },
    text: {
      textAlign: "center",
      fontSize: 15 * S,
      color: colors.mutedForeground,
    },
  });
