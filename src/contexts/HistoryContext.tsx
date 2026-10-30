import { STORAGE_KEYS } from "@/src/constants/session";
import { usePersistentState } from "@/src/hooks/usePersistentState";
import { Session } from "@/src/types";
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
} from "react";

interface HistoryContextType {
  history: Session[];
  ready: boolean;
  addSession: (data: Omit<Session, "id" | "date">) => Session;
  removeSession: (id: string) => void;
  getSession: (id: string) => Session | undefined;
}

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

/** Historique des séances terminées, de la plus récente à la plus ancienne. */
export const HistoryProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [history, setHistory, ready] = usePersistentState<Session[]>(
    STORAGE_KEYS.history,
    [],
  );

  const addSession = useCallback(
    (data: Omit<Session, "id" | "date">) => {
      const session: Session = {
        ...data,
        id: `${Date.now()}`,
        date: new Date().toISOString(),
      };
      setHistory((h) => [session, ...h]);
      return session;
    },
    [setHistory],
  );

  const removeSession = useCallback(
    (id: string) => setHistory((h) => h.filter((s) => s.id !== id)),
    [setHistory],
  );

  const getSession = useCallback(
    (id: string) => history.find((s) => s.id === id),
    [history],
  );

  const value = useMemo(
    () => ({ history, ready, addSession, removeSession, getSession }),
    [history, ready, addSession, removeSession, getSession],
  );

  return (
    <HistoryContext.Provider value={value}>{children}</HistoryContext.Provider>
  );
};

export const useHistory = (): HistoryContextType => {
  const context = useContext(HistoryContext);
  if (!context)
    throw new Error("useHistory must be used within a HistoryProvider");
  return context;
};
