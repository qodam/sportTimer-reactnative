import { ThemeColors } from "@/src/types";
import React, { createContext, ReactNode, useContext } from "react";
import { Dimensions } from "react-native";

interface ThemePalette {
  light: ThemeColors;
}

interface ThemeContextType {
  colors: ThemeColors;
  fonts: {
    regular: string;
    bold: string;
    medium: string;
  };
  palette: ThemePalette;
  SCALE: number;
  tabular: { fontVariant: "tabular-nums"[] };
}

// --- Data ---

const palette: ThemePalette = {
  light: {
    background: "#15171C", // fond
    card: "#22252D", // listes groupées, cartes
    card2: "#2E323C", // fond d'anneau, boutons dans les cartes
    gray: "#383C47", // boutons ronds secondaires
    separator: "#3A3F4B",
    fill: "rgba(118,118,128,0.24)", // contrôle segmenté, bande de la molette
    selected: "#4B5161", // segment choisi
    foreground: "#FFFFFF",
    mutedForeground: "rgba(228,232,242,0.62)",
    orange: "#FF9F0A", // effort, actions principales
    orangeDark: "#3A2A12",
    orangeSoft: "#35270F", // fond du mode choisi
    blue: "#0A84FF", // repos
    blueDark: "#142C4A",
    green: "#30D158", // réussite, interrupteurs, reprendre
    greenDark: "#12341F",
    red: "#FF453A", // terminer, supprimer
  },
};

const { width } = Dimensions.get("window");
const isTablet = width > 768;

const SCALE = isTablet ? 1.3 : 1;

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface Props {
  children: ReactNode;
}

export const ThemeProvider: React.FC<Props> = ({ children }) => {
  const tabular = { fontVariant: ["tabular-nums" as const] };

  const theme: ThemeContextType = {
    colors: palette.light,
    fonts: {
      regular: "GoogleSans-Regular",
      bold: "GoogleSans-Bold",
      medium: "GoogleSans-Medium",
    },
    palette,
    SCALE,
    tabular,
  };

  return (
    <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within a ThemeProvider");
  return context;
};
