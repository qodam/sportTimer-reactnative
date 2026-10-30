import { ScalePressable } from "@/src/components/buttons/ScalePressable";
import { Digits } from "@/src/components/common/Digits";
import { MinusIcon, PlusIcon } from "@/src/components/Icons";
import { useTheme } from "@/src/contexts/ThemeContext";
import { useTranslation } from "@/src/contexts/TranslationContext";
import { Theme, useThemedStyles } from "@/src/hooks/useThemedStyles";
import * as Haptics from "expo-haptics";
import { StyleSheet, View } from "react-native";

interface Props {
  rounds: number;
  onAdd: () => void;
  onRemove: () => void;
}

/** Compteur manuel : le nombre, un petit − pour corriger, et le gros + orange. */
export function RoundCounter({ rounds, onAdd, onRemove }: Props) {
  const styles = useThemedStyles(makeStyles);
  const { colors, SCALE } = useTheme();
  const { t } = useTranslation();

  return (
    <>
      <View style={styles.row}>
        <ScalePressable
          accessibilityLabel={t("session.removeRound")}
          onPress={onRemove}
          style={styles.minus}
        >
          <MinusIcon color={colors.foreground} />
        </ScalePressable>
        <Digits
          size={64 * SCALE}
          accessibilityLabel={t("common.rounds", { count: rounds })}
        >
          {rounds}
        </Digits>
        <View style={styles.spacer} />
      </View>
      <ScalePressable
        accessibilityLabel={t("session.addRound")}
        haptic={false}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(
            () => {},
          );
          onAdd();
        }}
        style={styles.plus}
      >
        <PlusIcon color="#000000" />
      </ScalePressable>
    </>
  );
}

const makeStyles = ({ colors, SCALE: S }: Theme) => {
  const minus = 56 * S;
  return StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 12,
    },
    minus: {
      width: minus,
      height: minus,
      borderRadius: minus / 2,
      backgroundColor: colors.card,
      alignItems: "center",
      justifyContent: "center",
    },
    spacer: { width: minus },
    plus: {
      height: 180 * S,
      borderRadius: 28,
      backgroundColor: colors.orange,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 12,
    },
  });
};
