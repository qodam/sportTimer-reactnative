import { ScalePressable } from "@/src/components/buttons/ScalePressable";
import { QText } from "@/src/components/QText";
import { useTheme } from "@/src/contexts/ThemeContext";
import { ReactNode } from "react";
import { View } from "react-native";

type Props = {
  size: number;
  bg: string;
  fg: string;
  label?: string;
  children?: ReactNode;
  accessibilityLabel: string;
  onPress?: () => void;
};

/** Bouton rond à double contour, comme dans l'app Minuteur de l'iPhone. */
export function RoundButton(p: Props) {
  const { fonts, SCALE } = useTheme();
  const size = p.size * SCALE;
  const r = size / 2;

  return (
    <ScalePressable
      accessibilityLabel={p.accessibilityLabel}
      onPress={p.onPress}
      style={{
        width: size,
        height: size,
        borderRadius: r,
        borderWidth: 2,
        borderColor: p.bg,
        padding: 3,
      }}
    >
      {/* Double contour : l'anneau extérieur, puis le disque plein */}
      <View
        style={{
          flex: 1,
          borderRadius: r,
          backgroundColor: p.bg,
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
        }}
      >
        {p.children}
        {p.label ? (
          <QText
            variant="body"
            color={p.fg}
            style={{ fontFamily: fonts.medium, fontSize: 17 * SCALE }}
          >
            {p.label}
          </QText>
        ) : null}
      </View>
    </ScalePressable>
  );
}
