import { StepButton } from "@/src/components/home/StepButton";
import { QText } from "@/src/components/QText";
import { useTheme } from "@/src/contexts/ThemeContext";
import { useTranslation } from "@/src/contexts/TranslationContext";
import { Theme, useThemedStyles } from "@/src/hooks/useThemedStyles";
import { useRef } from "react";
import { StyleSheet, View } from "react-native";

interface Props {
  label: string;
  labelColor: string;
  value: number;
  unit: string;
  limits: { min: number; max: number; step: number };
  onChange: (v: number) => void;
  /** La valeur minimale s'affiche « ∞ » (chrono sans limite) */
  infiniteAtMin?: boolean;
}

/** Une carte de réglage : libellé, chiffre en très gros, boutons − et +. */
export function SettingCard({
  label,
  labelColor,
  value,
  unit,
  limits,
  onChange,
  infiniteAtMin,
}: Props) {
  const styles = useThemedStyles(makeStyles);
  const { tabular } = useTheme();
  const { t } = useTranslation();
  const { min, max, step } = limits;

  // Toujours la valeur à jour, même pendant le défilement par appui long
  const valueRef = useRef(value);
  valueRef.current = value;
  const set = (v: number) => {
    const next = Math.min(max, Math.max(min, v));
    valueRef.current = next;
    onChange(next);
  };

  const infinite = infiniteAtMin && value <= min;

  return (
    <View style={styles.card}>
      <View>
        <QText variant="label" color={labelColor} style={styles.label}>
          {label}
        </QText>
        {infinite ? (
          <QText
            variant="h1"
            style={styles.value}
            accessibilityLabel={t("common.noLimit")}
          >
            ∞
          </QText>
        ) : (
          <QText variant="h1" style={[styles.value, tabular]}>
            {value}
            <QText variant="body" style={styles.unit}>
              {" "}
              {unit}
            </QText>
          </QText>
        )}
      </View>
      <View style={styles.steps}>
        <StepButton
          kind="minus"
          label={t("home.less", { label, step, unit })}
          disabled={value <= min}
          onStep={() => set(valueRef.current - step)}
        />
        <StepButton
          kind="plus"
          label={t("home.more", { label, step, unit })}
          disabled={value >= max}
          onStep={() => set(valueRef.current + step)}
        />
      </View>
    </View>
  );
}

const makeStyles = ({ colors, SCALE: S }: Theme) =>
  StyleSheet.create({
    card: {
      borderRadius: 20,
      backgroundColor: colors.card,
      paddingVertical: 14,
      paddingLeft: 20,
      paddingRight: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    label: { fontSize: 15 * S },
    value: { fontSize: 52 * S, lineHeight: 60 * S, letterSpacing: -1 },
    unit: {
      fontSize: 24 * S,
      lineHeight: 30 * S,
      color: colors.mutedForeground,
    },
    steps: { flexDirection: "row", gap: 10 },
  });
