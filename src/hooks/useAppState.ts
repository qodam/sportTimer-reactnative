import { useEffect, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";

/** Appelle `onChange` quand l'appli passe au premier plan ou en arrière-plan. */
export function useAppState(onChange: (state: AppStateStatus) => void): void {
  const callback = useRef(onChange);
  callback.current = onChange;

  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) =>
      callback.current(state),
    );
    return () => sub.remove();
  }, []);
}
