import { ScalePressable } from "@/src/components/buttons/ScalePressable";
import { ChartIcon } from "@/src/components/Icons";
import { QText } from "@/src/components/QText";
import { useTheme } from "@/src/contexts/ThemeContext";
import { useTranslation } from "@/src/contexts/TranslationContext";
import { Theme, useThemedStyles } from "@/src/hooks/useThemedStyles";
import { StyleSheet, View } from "react-native";

/** Nom de l'appli + accès à l'historique. */
export function HomeHeader({ onHistory }: { onHistory: () => void }) {
  const styles = useThemedStyles(makeStyles);
  const { colors, SCALE } = useTheme();
  const { t } = useTranslation();

  return (
    <View style={styles.header}>
      <QText variant="h1" style={styles.title} accessibilityRole="header">
        Push
        <QText variant="h1" style={[styles.title, styles.light]}>
          Pause
        </QText>
      </QText>
      <ScalePressable
        accessibilityLabel={t("common.history")}
        onPress={onHistory}
        hitSlop={6}
        style={styles.historyBtn}
      >
        <ChartIcon size={24 * SCALE} color={colors.orange} />
      </ScalePressable>
    </View>
  );
}

const makeStyles = ({ colors, fonts, SCALE: S }: Theme) =>
  StyleSheet.create({
    header: {
      minHeight: 64,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingTop: 8,
    },
    title: { fontSize: 30 * S, lineHeight: 38 * S, letterSpacing: -0.5 },
    light: { fontFamily: fonts.regular, color: colors.mutedForeground },
    historyBtn: {
      width: 52 * S,
      height: 52 * S,
      borderRadius: 18 * S,
      backgroundColor: colors.card,
      alignItems: "center",
      justifyContent: "center",
    },
  });
