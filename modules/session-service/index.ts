/**
 * Service de séance au premier plan (Android).
 * Sur iPhone (et dans Expo Go), le module natif n'existe pas : toutes les
 * fonctions ne font simplement rien.
 */
import { requireOptionalNativeModule } from "expo-modules-core";
import { PermissionsAndroid, Platform } from "react-native";

/** Une phase de la séance, avec ses heures de début et de fin. */
export interface ServiceSegment {
  /** Texte affiché, ex. « EFFORT · 7/24 » */
  title: string;
  /** Couleur de fond de la carte (#RRGGBB) */
  background: string;
  /** Couleur du texte (#RRGGBB) */
  foreground: string;
  /** Début, epoch ms */
  startsAt: number;
  /** Fin, epoch ms (0 = sans fin) */
  endsAt: number;
  /** true = chrono qui monte, false = compte à rebours */
  countUp: boolean;
}

export interface ServicePayload {
  segments: ServiceSegment[];
  paused: boolean;
  beep: boolean;
  channelName: string;
  labels: { pause: string; resume: string; stop: string; paused: string };
  done: { title: string; text: string };
}

export type ServiceAction = "pause" | "resume" | "stop";

interface NativeSessionService {
  start(payloadJson: string): void;
  stop(): void;
  setInApp(inApp: boolean): void;
  addListener(
    event: "onAction",
    listener: (event: { type: ServiceAction }) => void,
  ): { remove(): void };
}

const native =
  requireOptionalNativeModule<NativeSessionService>("SessionService");

export const SessionService = {
  /** false sur iPhone et dans Expo Go */
  isAvailable: native != null,

  /** Démarre la carte de séance, ou la met à jour si elle est déjà affichée. */
  start(payload: ServicePayload): void {
    native?.start(JSON.stringify(payload));
  },

  stop(): void {
    native?.stop();
  },

  /** Prévient le service que l'appli est à l'écran (c'est alors elle qui fait les sons). */
  setInApp(inApp: boolean): void {
    native?.setInApp(inApp);
  },

  /** Boutons Pause / Reprendre / Terminer de la carte. */
  addActionListener(listener: (action: ServiceAction) => void): {
    remove(): void;
  } {
    return (
      native?.addListener("onAction", (e) => listener(e.type)) ?? {
        remove() {},
      }
    );
  },

  /** Android 13+ : la carte n'apparaît que si l'utilisateur autorise les notifications. */
  async requestPermission(): Promise<void> {
    if (!native || Platform.OS !== "android" || Number(Platform.Version) < 33)
      return;
    try {
      await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );
    } catch {
      // Refus ou erreur : la séance fonctionne quand même, sans la carte.
    }
  },
};
