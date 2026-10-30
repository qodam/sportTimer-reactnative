import { ScalePressable } from "@/src/components/buttons/ScalePressable";
import { PlayIcon } from "@/src/components/Icons";
import { QText } from "@/src/components/QText";
import { useTranslation } from "@/src/contexts/TranslationContext";
import { Theme, useThemedStyles } from "@/src/hooks/useThemedStyles";
import { Settings } from "@/src/types";
import { StyleSheet, View } from "react-native";

interface Props {
  settings: Settings;
  onChange: (patch: Partial<Settings>) => void;
  onStart: () => void;
}

type OptionKey = "beep" | "keepAwake";
const OPTIONS: { key: OptionKey; labelKey: string }[] = [
  { key: "beep", labelKey: "home.beep" },
  { key: "keepAwake", labelKey: "home.awake" },
];

/** Bas de l'accueil : le gros bouton Démarrer et les deux options. */
export function StartBar({ settings, onChange, onStart }: Props) {
  const styles = useThemedStyles(makeStyles);
  const { t } = useTranslation();

  return (
    <View style={styles.footer}>
      <ScalePressable onPress={onStart} style={styles.start}>
        <PlayIcon size={22} color="#000000" />
        <QText variant="h3" color="#000000" style={styles.startText}>
          {t("home.start")}
        </QText>
      </ScalePressable>

      <View style={styles.options}>
        {OPTIONS.map(({ key, labelKey }) => {
          const on = settings[key];
          return (
            <ScalePressable
              key={key}
              accessibilityRole="switch"
              accessibilityState={{ checked: on }}
              onPress={() => onChange({ [key]: !on })}
              style={[styles.option, on ? styles.optionOn : styles.optionOff]}
            >
              <QText
                variant="body"
                style={[styles.optionText, on ? styles.textOn : styles.textOff]}
              >
                {on ? "✓ " : ""}
                {t(labelKey)}
              </QText>
            </ScalePressable>
          );
        })}
      </View>
    </View>
  );
}

const makeStyles = ({ colors, fonts, SCALE: S }: Theme) =>
  StyleSheet.create({
    footer: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 8, gap: 12 },
    start: {
      height: 68 * S,
      borderRadius: 34 * S,
      backgroundColor: colors.orange,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
    },
    startText: { fontSize: 21 * S },
    options: { flexDirection: "row", justifyContent: "center", gap: 8 },
    option: {
      height: 36 * S,
      paddingHorizontal: 14,
      borderRadius: 18 * S,
      alignItems: "center",
      justifyContent: "center",
    },
    optionOn: { backgroundColor: colors.greenDark },
    optionOff: { backgroundColor: colors.card },
    optionText: {
      fontFamily: fonts.medium,
      fontSize: 15 * S,
      lineHeight: 20 * S,
    },
    textOn: { color: colors.green },
    textOff: { color: colors.mutedForeground },
  });
