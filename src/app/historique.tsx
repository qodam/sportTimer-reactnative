import { Screen } from "@/src/components/common/Screen";
import { EmptyHistory } from "@/src/components/history/EmptyHistory";
import { SessionSection } from "@/src/components/history/SessionSection";
import { WeekSummary } from "@/src/components/history/WeekSummary";
import { useHistory } from "@/src/contexts/HistoryContext";
import { useTranslation } from "@/src/contexts/TranslationContext";
import { useWeekStats } from "@/src/hooks/useWeekStats";
import { ScrollView, StyleSheet } from "react-native";

/** Historique : la semaine en un coup d'œil, puis les séances. */
export default function HistoryScreen() {
  const { history, removeSession } = useHistory();
  const { t } = useTranslation();
  const week = useWeekStats(history);

  return (
    <Screen padded={false} edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <WeekSummary
          days={week.days}
          sessionCount={week.thisWeek.length}
          totalSec={week.totalSec}
        />
        {history.length === 0 ? (
          <EmptyHistory />
        ) : (
          <>
            <SessionSection
              title={t("history.thisWeek")}
              sessions={week.thisWeek}
              onDelete={removeSession}
            />
            <SessionSection
              title={t("history.earlier")}
              sessions={week.earlier}
              onDelete={removeSession}
            />
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 40, gap: 14 },
});
