import { QText } from "@/src/components/QText";
import { useTheme } from "@/src/contexts/ThemeContext";
import { StyleProp, TextStyle } from "react-native";

interface Props {
  children: React.ReactNode;
  /** Taille de police en points (déjà calculée par l'appelant) */
  size: number;
  color?: string;
  /** Réduit le texte s'il ne tient pas en largeur */
  fit?: boolean;
  style?: StyleProp<TextStyle>;
  accessibilityLabel?: string;
}

/**
 * Très gros chiffres (chrono, compteur…) : chiffres à chasse fixe pour
 * que rien ne bouge quand les secondes défilent, et hauteur de ligne
 * recalée (celle de QText est fixe par variante).
 */
export function Digits({
  children,
  size,
  color,
  fit,
  style,
  accessibilityLabel,
}: Props) {
  const { tabular } = useTheme();
  return (
    <QText
      variant="body"
      color={color}
      numberOfLines={fit ? 1 : undefined}
      adjustsFontSizeToFit={fit}
      accessibilityLabel={accessibilityLabel}
      style={[
        tabular,
        {
          fontSize: size,
          lineHeight: size * 1.12,
          letterSpacing: -1,
          textAlign: "center",
        },
        style,
      ]}
    >
      {children}
    </QText>
  );
}
