import { useTheme } from "@/src/contexts/ThemeContext";
import { useMemo } from "react";

export type Theme = ReturnType<typeof useTheme>;

/**
 * Crée les styles d'un composant à partir du thème (couleurs, polices, SCALE).
 * Usage : `const styles = useThemedStyles(makeStyles)` avec
 * `const makeStyles = (theme: Theme) => StyleSheet.create({...})` hors du composant.
 */
export function useThemedStyles<T>(factory: (theme: Theme) => T): T {
  const theme = useTheme();
  return useMemo(() => factory(theme), [theme, factory]);
}
