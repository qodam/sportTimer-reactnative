import { SessionService } from "@/modules/session-service";
import { useTheme } from "@/src/contexts/ThemeContext";
import { useTranslation } from "@/src/contexts/TranslationContext";
import { useAppState } from "@/src/hooks/useAppState";
import { buildForegroundPayload } from "@/src/services/foregroundSession";
import { ActiveSession } from "@/src/types";
import { useEffect, useRef } from "react";
import { AppState } from "react-native";

interface Actions {
  togglePause: () => void;
  finish: () => void;
}

/**
 * Carte de séance hors de l'appli pendant toute la séance :
 *  - le programme est renvoyé au service à chaque changement (pause, reprise, recommencer…) ;
 *  - les boutons de la carte pilotent la séance ;
 *  - la carte disparaît quand on quitte l'écran de séance.
 * Android : service au premier plan. iPhone : Live Activity. Rien dans Expo Go.
 */
export function useForegroundSession(
  session: ActiveSession,
  actions: Actions,
): void {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const sessionRef = useRef(session);
  sessionRef.current = session;
  const actionsRef = useRef(actions);
  actionsRef.current = actions;

  // Programme à jour → carte à jour
  useEffect(() => {
    SessionService.start(buildForegroundPayload(session, t, colors));
  }, [session, t, colors]);

  // Écran de séance quitté (fin, annulation) → plus de carte
  useEffect(() => () => SessionService.stop(), []);

  // Sons et vibrations du service seulement quand l'appli n'est pas à l'écran
  useEffect(() => {
    SessionService.setInApp(AppState.currentState === "active");
  }, []);
  useAppState((state) => SessionService.setInApp(state === "active"));

  // Boutons de la carte
  useEffect(() => {
    const sub = SessionService.addActionListener((action) => {
      const s = sessionRef.current;
      if (action === "stop") actionsRef.current.finish();
      else if (
        (action === "pause" && s.running) ||
        (action === "resume" && !s.running)
      )
        actionsRef.current.togglePause();
    });
    return () => sub.remove();
  }, []);
}
