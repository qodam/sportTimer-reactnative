import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

import { HistoryProvider } from "@/src/contexts/HistoryContext";
import { SettingsProvider } from "@/src/contexts/SettingsContext";
import { ThemeProvider, useTheme } from "@/src/contexts/ThemeContext";
import { TimerProvider } from "@/src/contexts/TimerContext";
import { Stack } from "expo-router/stack";
import { LogBox, StatusBar } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import {
  TranslationProvider,
  useTranslation,
} from "@/src/contexts/TranslationContext";
SplashScreen.preventAutoHideAsync();

export default function Layout() {
  const [loaded, error] = useFonts({
    "GoogleSans-Regular": require("@/assets/fonts/GoogleSans-Regular.ttf"),
    "GoogleSans-Medium": require("@/assets/fonts/GoogleSans-Medium.ttf"),
    "GoogleSans-Bold": require("@/assets/fonts/GoogleSans-Bold.ttf"),
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  useEffect(() => {
    //AnalyticsService.init();
  }, []);

  if (!loaded && !error) {
    return null;
  }

  return (
    <ThemeProvider>
      <TranslationProvider>
        {/* Données sauvegardées sur le téléphone, puis la séance en cours */}
        <SettingsProvider>
          <HistoryProvider>
            <TimerProvider>
              <MainLayout />
            </TimerProvider>
          </HistoryProvider>
        </SettingsProvider>
      </TranslationProvider>
    </ThemeProvider>
  );
}

function MainLayout() {
  const { colors, fonts } = useTheme();
  const { t } = useTranslation();

  if (__DEV__) LogBox.ignoreAllLogs(true);

  return (
    <GestureHandlerRootView
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <StatusBar barStyle={"light-content"} />
      <Stack
        screenOptions={{
          // Pas d'en-tête par défaut : seul l'historique en affiche un
          headerShown: false,
          headerStyle: {
            backgroundColor: colors.background, // Couleur de fond du header
          },
          headerTintColor: colors.orange, // Couleur des boutons retour/icônes
          headerTitleStyle: {
            color: colors.foreground,
          },
          contentStyle: {
            backgroundColor: colors.background, // Fond de l'écran sous le header
          },
          headerShadowVisible: false,
          animation: "fade",
          headerBackButtonDisplayMode: "minimal",
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen
          name="seance"
          options={{ gestureEnabled: false, animation: "fade" }}
        />
        <Stack.Screen
          name="fin"
          options={{ gestureEnabled: false, animation: "fade" }}
        />
        <Stack.Screen
          name="historique"
          options={{ headerShown: true, title: t("common.history") }}
        />
      </Stack>
    </GestureHandlerRootView>
  );
}
