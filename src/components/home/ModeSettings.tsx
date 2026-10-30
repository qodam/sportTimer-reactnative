import { SettingCard } from "@/src/components/home/SettingCard";
import { QText } from "@/src/components/QText";
import { LIMITS } from "@/src/constants/session";
import { useTheme } from "@/src/contexts/ThemeContext";
import { useTranslation } from "@/src/contexts/TranslationContext";
import { duree } from "@/src/lib/format";
import { intervalCount, workSeconds } from "@/src/lib/timer";
import { Settings } from "@/src/types";
import { StyleSheet, View } from "react-native";

interface Props {
  settings: Settings;
  onChange: (patch: Partial<Settings>) => void;
}

/** Réglages du mode effort / repos, avec le résumé calculé en dessous. */
export function IntervalSettings({ settings: s, onChange }: Props) {
  const { colors, SCALE } = useTheme();
  const { t } = useTranslation();
  const sec = t("common.seconds");

  return (
    <View style={styles.cards}>
      <SettingCard
        label={t("home.work")}
        labelColor={colors.orange}
        value={s.effort}
        unit={sec}
        limits={LIMITS.effort}
        onChange={(v) => onChange({ effort: v })}
      />
      <SettingCard
        label={t("home.rest")}
        labelColor={colors.blue}
        value={s.pause}
        unit={sec}
        limits={LIMITS.pause}
        onChange={(v) => onChange({ pause: v })}
      />
      <SettingCard
        label={t("home.total")}
        labelColor={colors.mutedForeground}
        value={s.totalMin}
        unit={t("common.minutes")}
        limits={LIMITS.totalMin}
        onChange={(v) => onChange({ totalMin: v })}
      />
      <QText
        variant="body"
        color={colors.mutedForeground}
        style={[styles.summary, { fontSize: 15 * SCALE }]}
      >
        {t("home.summary", {
          count: intervalCount(s),
          work: duree(workSeconds(s)),
        })}
      </QText>
    </View>
  );
}

/** Réglage du chrono libre : juste une durée, infinie par défaut. */
export function ChronoSettings({ settings: s, onChange }: Props) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <View style={styles.cards}>
      <SettingCard
        label={t("home.total")}
        labelColor={colors.mutedForeground}
        value={s.chronoMin}
        unit={t("common.minutes")}
        limits={LIMITS.chronoMin}
        infiniteAtMin
        onChange={(v) => onChange({ chronoMin: v })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  cards: { gap: 10 },
  summary: { textAlign: "center", marginTop: 4 },
});
