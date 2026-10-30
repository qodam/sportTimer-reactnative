import { useTheme } from "@/src/contexts/ThemeContext";
import { ReactNode } from "react";
import { StyleProp, ViewStyle } from "react-native";
import { Edge, SafeAreaView } from "react-native-safe-area-context";

interface Props {
  children?: ReactNode;
  /** Marges latérales standard (20) */
  padded?: boolean;
  edges?: Edge[];
  style?: StyleProp<ViewStyle>;
}

/** Fond de l'appli + zones sûres (encoche, barre du bas) pour tous les écrans. */
export function Screen({
  children,
  padded = true,
  edges = ["top", "bottom"],
  style,
}: Props) {
  const { colors } = useTheme();
  return (
    <SafeAreaView
      edges={edges}
      style={[
        { flex: 1, backgroundColor: colors.background },
        padded && { paddingHorizontal: 20 },
        style,
      ]}
    >
      {children}
    </SafeAreaView>
  );
}
