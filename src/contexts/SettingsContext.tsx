import { DEFAULT_SETTINGS, STORAGE_KEYS } from "@/src/constants/session";
import { usePersistentState } from "@/src/hooks/usePersistentState";
import { Settings } from "@/src/types";
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
} from "react";

interface SettingsContextType {
  settings: Settings;
  /** true une fois les réglages relus depuis le téléphone */
  ready: boolean;
  updateSettings: (patch: Partial<Settings>) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined,
);

/** Réglages de l'accueil (effort, repos, durée, options), gardés d'une séance à l'autre. */
export const SettingsProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [settings, setSettings, ready] = usePersistentState<Settings>(
    STORAGE_KEYS.settings,
    DEFAULT_SETTINGS,
    (stored) => ({ ...DEFAULT_SETTINGS, ...stored }), // nouvelles options = valeur par défaut
  );

  const updateSettings = useCallback(
    (patch: Partial<Settings>) => setSettings((s) => ({ ...s, ...patch })),
    [setSettings],
  );

  const value = useMemo(
    () => ({ settings, ready, updateSettings }),
    [settings, ready, updateSettings],
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (!context)
    throw new Error("useSettings must be used within a SettingsProvider");
  return context;
};
