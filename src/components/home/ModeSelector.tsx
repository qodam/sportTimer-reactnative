import { ScalePressable } from "@/src/components/buttons/ScalePressable";
import { QText } from "@/src/components/QText";
import { useTranslation } from "@/src/contexts/TranslationContext";
import { Theme, useThemedStyles } from "@/src/hooks/useThemedStyles";
import { Mode } from "@/src/types";
import { StyleSheet, View } from "react-native";

const MODES: { mode: Mode; labelKey: string }[] = [
  { mode: "intervalles", labelKey: "home.modeIntervals" },
  { mode: "chrono", labelKey: "home.modeChrono" },
];

/** Deux grosses tuiles : effort / repos ou chrono libre. */
export function ModeSelector({
  value,
  onChange,
}: {
  value: Mode;
  onChange: (m: Mode) => void;
}) {
  const styles = useThemedStyles(makeStyles);
  const { t } = useTranslation();

  return (
    <View style={styles.row}>
      {MODES.map(({ mode, labelKey }) => {
        const active = value === mode;
        return (
          <ScalePressable
            key={mode}
            accessibilityState={{ selected: active }}
            onPress={() => onChange(mode)}
            containerStyle={styles.flex}
            style={[styles.tile, active && styles.tileActive]}
          >
            <QText
              variant="body"
              style={[styles.label, active && styles.labelActive]}
            >
              {t(labelKey)}
            </QText>
          </ScalePressable>
        );
      })}
    </View>
  );
}

const makeStyles = ({ colors, fonts, SCALE: S }: Theme) =>
  StyleSheet.create({
    row: { flexDirection: "row", gap: 10 },
    flex: { flex: 1 },
    tile: {
      height: 64 * S,
      borderRadius: 16,
      borderWidth: 2,
      borderColor: colors.card,
      backgroundColor: colors.card,
      alignItems: "center",
      justifyContent: "center",
    },
    tileActive: {
      borderColor: colors.orange,
      backgroundColor: colors.orangeSoft,
    },
    label: {
      fontFamily: fonts.medium,
      fontSize: 17 * S,
      color: colors.mutedForeground,
    },
    labelActive: { color: colors.foreground },
  });
