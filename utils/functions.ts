import { logger } from "@/utils/logger";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Application from "expo-application";
import Constants from "expo-constants";
import * as Linking from "expo-linking";
import * as SecureStore from "expo-secure-store";
import * as WebBrowser from "expo-web-browser";
import { Platform } from "react-native";
import InAppReview from "react-native-in-app-review";
import uuid from "react-native-uuid";

export const handleSendTo = (email: string) => {
  const name =
    Constants.expoConfig?.android?.package ||
    Constants.expoConfig?.ios?.bundleIdentifier;
  const version = Constants.expoConfig?.version;
  const subject = `Support Request [${name} - ${version}]`;
  const body = "Hello, I need help with...";
  const url = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  Linking.openURL(url).catch((err) =>
    logger.error("Error opening email client", err),
  );
};

export const handleUpvote = async (url: string) => {
  await WebBrowser.openBrowserAsync(url || "https://qodam.com", {
    presentationStyle: WebBrowser.WebBrowserPresentationStyle.FORM_SHEET,
  });
};

//a modifier
export const handleRateApp = () => {
  const iosAppId = "6761173777";
  const androidPackageName = "com.codinghub.senera";

  if (Platform.OS === "ios") {
    Linking.openURL(
      `itms-apps://itunes.apple.com/app/id${iosAppId}?action=write-review`,
    );
  } else {
    Linking.openURL(`market://details?id=${androidPackageName}`);
  }
};

export const getOrCreateAppUserID = async (): Promise<string> => {
  const STORE_KEY = "app_user_id";

  try {
    let id = await SecureStore.getItemAsync(STORE_KEY);
    if (id) return id;

    if (Platform.OS === "android") {
      id = Application.getAndroidId();
    } else if (Platform.OS === "ios") {
      id = await Application.getIosIdForVendorAsync();
    }

    if (!id) {
      id = uuid.v4() as string;
    }

    if (id) {
      await SecureStore.setItemAsync(STORE_KEY, id);
    }

    return id;
  } catch (error) {
    logger.error("Erreur identification:", error);
    // Stockage sécurisé indisponible : on garde un identifiant STABLE
    // (sinon RevenueCat verrait un nouvel utilisateur et l'abonné perdrait son accès)
    try {
      const deviceId =
        Platform.OS === "android"
          ? Application.getAndroidId()
          : await Application.getIosIdForVendorAsync();
      if (deviceId) return deviceId;
    } catch {}
    const backup = await AsyncStorage.getItem(STORE_KEY).catch(() => null);
    if (backup) return backup;
    const id = uuid.v4() as string;
    await AsyncStorage.setItem(STORE_KEY, id).catch(() => {});
    return id;
  }
};

// Popup de notation native (appelée sur un moment positif)
export const requestAppReview = () => {
  if (!InAppReview.isAvailable()) return; // pas de popup : on n'envoie pas sur le Store sans prévenir
  InAppReview.RequestInAppReview()
    .then((done) => logger.log("Popup affichée ?", done))
    .catch((e) => logger.log("[Review]", e));
};
