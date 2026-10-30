import { LanguageOption } from "@/src/types";
import en from "@/utils/languages/locales/en.json";
import fr from "@/utils/languages/locales/fr.json";

export const languages: LanguageOption[] = [
  { code: "en", tag: "en-US", name: "English", flag: "🇺🇸" },
  { code: "fr", tag: "fr-FR", name: "Français", flag: "🇫🇷" },
  { code: "es", tag: "es-ES", name: "Español", flag: "🇪🇸" },
  { code: "de", tag: "de-DE", name: "Deutsch", flag: "🇩🇪" },
  { code: "it", tag: "it-IT", name: "Italiano", flag: "🇮🇹" },
  { code: "pt", tag: "pt-BR", name: "Português", flag: "🇧🇷" },
  { code: "ru", tag: "ru-RU", name: "Русский", flag: "🇷🇺" },
  { code: "ar", tag: "ar-SA", name: "العربية", flag: "🇸🇦" },
  { code: "zh", tag: "zh-CN", name: "中文", flag: "🇨🇳" },
  { code: "ja", tag: "ja-JP", name: "日本語", flag: "🇯🇵" },
  { code: "ko", tag: "ko-KR", name: "한국어", flag: "🇰🇷" },
];

export const DEFAULT_TAG = "en-US";

export const tagForCode = (code?: string | null): string => {
  if (!code) return DEFAULT_TAG;
  const base = code.split("-")[0].toLowerCase();
  return languages.find((l) => l.code === base)?.tag ?? DEFAULT_TAG;
};

// Les langues sans fichier retombent sur l'anglais.
export const translations = { en, fr };
