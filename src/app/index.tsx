import { Screen } from "@/src/components/common/Screen";
import { HomeHeader } from "@/src/components/home/HomeHeader";
import { ModeSelector } from "@/src/components/home/ModeSelector";
import {
  ChronoSettings,
  IntervalSettings,
} from "@/src/components/home/ModeSettings";
import { StartBar } from "@/src/components/home/StartBar";
import { useSettings } from "@/src/contexts/SettingsContext";
import { useTimer } from "@/src/contexts/TimerContext";
import { router } from "expo-router";
import { useEffect } from "react";
import { ScrollView, StyleSheet } from "react-native";

/** Accueil = réglages : on règle et on démarre. */
export default function HomeScreen() {
  const { settings, ready, updateSettings } = useSettings();
  const timer = useTimer();

  // L'appli a été fermée pendant une séance : on y retourne directement.
  useEffect(() => {
    if (timer.ready && timer.session) router.push("/seance");
  }, [timer.ready]);

  const start = () => {
    timer.start(settings);
    router.push("/seance");
  };

  if (!ready) return <Screen />;

  return (
    <Screen padded={false}>
      <ScrollView contentContainerStyle={styles.content} bounces={false}>
        <HomeHeader onHistory={() => router.push("/historique")} />
        <ModeSelector
          value={settings.mode}
          onChange={(mode) => updateSettings({ mode })}
        />
        {settings.mode === "intervalles" ? (
          <IntervalSettings settings={settings} onChange={updateSettings} />
        ) : (
          <ChronoSettings settings={settings} onChange={updateSettings} />
        )}
      </ScrollView>
      <StartBar settings={settings} onChange={updateSettings} onStart={start} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12, gap: 14 },
});
