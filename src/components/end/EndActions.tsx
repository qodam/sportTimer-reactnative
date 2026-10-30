import { ScalePressable } from "@/src/components/buttons/ScalePressable";
import { ChartIcon } from "@/src/components/Icons";
import { QText } from "@/src/components/QText";
import { useTheme } from "@/src/contexts/ThemeContext";
import { useTranslation } from "@/src/contexts/TranslationContext";
import { Theme, useThemedStyles } from "@/src/hooks/useThemedStyles";
import { StyleSheet, View } from "react-native";

/** Bas de l'écran de fin : historique (icône) et OK (retour à l'accueil). */
export function EndActions({
  onHistory,
  onDone,
}: {
  onHistory: () => void;
  onDone: () => void;
}) {
  const styles = useThemedStyles(makeStyles);
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <View style={styles.footer}>
      <ScalePressable
        accessibilityLabel={t("common.history")}
        onPress={onHistory}
        style={styles.history}
      >
        <ChartIcon size={28} color={colors.orange} />
      </ScalePressable>
      <ScalePressable
        accessibilityLabel={t("end.home")}
        onPress={onDone}
        containerStyle={styles.flex}
        style={styles.ok}
      >
        <QText variant="h2" color="#000000">
          {t("end.ok")}
        </QText>
      </ScalePressable>
    </View>
  );
}

const makeStyles = ({ colors, SCALE: S }: Theme) =>
  StyleSheet.create({
    footer: { flexDirection: "row", gap: 10, paddingBottom: 12 },
    flex: { flex: 1 },
    history: {
      width: 76 * S,
      height: 76 * S,
      borderRadius: 24,
      backgroundColor: colors.card,
      alignItems: "center",
      justifyContent: "center",
    },
    ok: {
      height: 76 * S,
      borderRadius: 24,
      backgroundColor: colors.orange,
      alignItems: "center",
      justifyContent: "center",
    },
  });
