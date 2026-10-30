import { useTheme } from "@/src/contexts/ThemeContext";
import React from "react";
import { Text as RNText, StyleSheet, TextProps } from "react-native";

type TextVariant = "h1" | "h2" | "h3" | "body" | "label" | "error";

interface AppTextProps extends TextProps {
  variant?: TextVariant;
  color?: string;
}

export const QText: React.FC<AppTextProps> = ({
  variant = "body",
  style,
  color,
  children,
  ...props
}) => {
  const { colors, fonts, SCALE } = useTheme();

  // On intègre le multiplicateur SCALE dans les dimensions
  const variantStyles = React.useMemo(
    () =>
      StyleSheet.create({
        h1: {
          fontFamily: fonts.bold,
          fontSize: 32 * SCALE,
          lineHeight: 38 * SCALE,
          letterSpacing: -1,
          color: colors.foreground,
        },
        h2: {
          fontFamily: fonts.bold,
          fontSize: 24 * SCALE,
          lineHeight: 30 * SCALE,
          letterSpacing: -0.6,
          color: colors.foreground,
        },
        h3: {
          fontFamily: fonts.bold,
          fontSize: 20 * SCALE,
          lineHeight: 26 * SCALE,
          letterSpacing: -0.4,
          color: colors.foreground,
        },
        body: {
          fontFamily: fonts.regular,
          fontSize: 16 * SCALE,
          lineHeight: 22 * SCALE,
          letterSpacing: 0,
          color: colors.foreground,
        },
        label: {
          fontFamily: fonts.medium,
          fontSize: 12 * SCALE,
          letterSpacing: 0,
          color: colors.mutedForeground,
        },
        error: {
          fontFamily: fonts.regular,
          fontSize: 14 * SCALE,
          letterSpacing: 0,
          color: colors.red,
        },
      }),
    [colors],
  );

  const finalColor = color || variantStyles[variant].color;

  return (
    <RNText
      style={[variantStyles[variant], { color: finalColor }, style]}
      {...props}
    >
      {children}
    </RNText>
  );
};
