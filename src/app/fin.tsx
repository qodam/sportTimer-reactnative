import { Screen } from "@/src/components/common/Screen";
import { EndActions } from "@/src/components/end/EndActions";
import { SessionResult } from "@/src/components/end/SessionResult";
import { useHistory } from "@/src/contexts/HistoryContext";
import { useTheme } from "@/src/contexts/ThemeContext";
import { router, useLocalSearchParams } from "expo-router";
import { useWindowDimensions } from "react-native";

/** Fin de séance : le résultat en grand, puis OK. */
export default function EndScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getSession } = useHistory();
  const { SCALE } = useTheme();
  const { width, height } = useWindowDimensions();
  const session = getSession(id);

  // La séance vient d'être enregistrée : elle arrive au rendu suivant.
  if (!session) return <Screen />;

  return (
    <Screen>
      <SessionResult
        session={session}
        size={Math.min(width - 80, height * 0.36, 280 * SCALE)}
      />
      <EndActions
        onHistory={() => router.replace("/historique")}
        onDone={() => router.back()}
      />
    </Screen>
  );
}
