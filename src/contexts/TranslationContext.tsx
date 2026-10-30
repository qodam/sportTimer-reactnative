import { languages, tagForCode, translations } from "@/utils/languages/index";
import { logger } from "@/utils/logger";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Localization from "expo-localization";
import { I18n, TranslateOptions } from "i18n-js";
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

interface TranslationContextType {
  targetLanguage: string;
  targetLanguageName: string;
  targetLanguageTag: string;
  changeTargetLanguage: (newCode: string) => void;
  t: (key: string, options?: TranslateOptions) => string;
}

interface Props {
  children: ReactNode;
}

// Même convention de nommage que @theme_override et @calendar_type.
const LANGUAGE_KEY = "@target_language";

const isSupported = (code?: string | null): boolean =>
  !!code && languages.some((l) => l.code === code);

/** Langue de l'appareil si on la gère, sinon anglais. Utilisée uniquement
 *  tant qu'aucun choix explicite n'a été stocké. */
const deviceLanguage = (): string => {
  const code = Localization.getLocales?.()[0]?.languageCode;
  return isSupported(code) ? code! : "en";
};

const TranslationContext = createContext<TranslationContextType | undefined>(
  undefined,
);

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error("useTranslation must be used within a TranslationProvider");
  }
  return context;
};

export const TranslationProvider: React.FC<Props> = ({ children }) => {
  // Initialisation synchrone sur la langue système : c'est le comportement
  // attendu à la première ouverture, et ça évite un premier rendu en anglais.
  const [targetLanguage, setTargetLanguage] = useState<string>(deviceLanguage);

  // Passe à true quand AsyncStorage a répondu. Permet à l'appelant d'attendre
  // avant d'afficher, s'il veut éviter le bref flash langue système ->
  // langue choisie au démarrage.
  const [isHydrated, setIsHydrated] = useState(false);

  // Relecture de la préférence au montage. Un choix explicite de
  // l'utilisateur prime toujours sur la langue du téléphone.
  useEffect(() => {
    let cancelled = false;

    AsyncStorage.getItem(LANGUAGE_KEY)
      .then((stored) => {
        if (cancelled) return;
        if (isSupported(stored)) setTargetLanguage(stored!);
      })
      .catch((e) => logger.error("Error loading language preference", e))
      .finally(() => {
        if (!cancelled) setIsHydrated(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const changeTargetLanguage = useCallback((newCode: string) => {
    const langObj = languages.find((l) => l.code === newCode);
    if (!langObj) return;

    // State d'abord : l'UI bascule immédiatement même si l'écriture traîne.
    setTargetLanguage(langObj.code);
    AsyncStorage.setItem(LANGUAGE_KEY, langObj.code).catch((e) =>
      logger.error("Error saving language preference", e),
    );
  }, []);

  // Dérivé plutôt que stocké dans un state parallèle : impossible de
  // désynchroniser le nom affiché et la langue active.
  const targetLanguageName = useMemo(
    () => languages.find((l) => l.code === targetLanguage)?.name ?? "English",
    [targetLanguage],
  );

  const i18nInstance = useMemo(() => {
    try {
      const instance = new I18n(translations);
      instance.locale = targetLanguage;
      instance.enableFallback = true;
      instance.defaultLocale = "en";

      // Logique de fallback (ex: fr-CA -> fr)
      const availableLocales = Object.keys(translations);
      if (!availableLocales.includes(targetLanguage)) {
        const baseLanguage = targetLanguage.split("-")[0];
        if (availableLocales.includes(baseLanguage)) {
          instance.locale = baseLanguage;
        }
      }
      return instance;
    } catch (error) {
      logger.error("[TranslationContext] ❌ Erreur instance I18n:", error);
      return null;
    }
  }, [targetLanguage]);

  const targetLanguageTag = useMemo(
    () => tagForCode(targetLanguage),
    [targetLanguage],
  );

  const value: TranslationContextType = useMemo(
    () => ({
      targetLanguage,
      targetLanguageTag,
      targetLanguageName,
      changeTargetLanguage,
      t: (key: string, options?: TranslateOptions) => {
        if (!i18nInstance) return key;
        try {
          return i18nInstance.t(key, options);
        } catch (e) {
          logger.warn(`[Translation] Key not found: ${key}`);
          return key;
        }
      },
    }),
    [
      targetLanguage,
      targetLanguageTag,
      targetLanguageName,
      changeTargetLanguage,
      i18nInstance,
      isHydrated,
    ],
  );

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
};
