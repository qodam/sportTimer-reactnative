import { storage } from "@/src/services/storage";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";

/**
 * Comme useState, mais la valeur est relue au démarrage et sauvegardée
 * sur le téléphone à chaque changement.
 * `hydrated` passe à true une fois la valeur relue : avant, on évite
 * d'écrire pour ne pas écraser les données enregistrées.
 */
export function usePersistentState<T>(
  key: string,
  initial: T,
  /** Pour fusionner une ancienne version des données avec les valeurs par défaut */
  migrate: (stored: T) => T = (stored) => stored,
): [T, Dispatch<SetStateAction<T>>, boolean] {
  const [value, setValue] = useState<T>(initial);
  const [hydrated, setHydrated] = useState(false);
  const migrateRef = useRef(migrate);

  useEffect(() => {
    let cancelled = false;
    storage.read<T>(key).then((stored) => {
      if (cancelled) return;
      if (stored !== null) setValue(migrateRef.current(stored));
      setHydrated(true);
    });
    return () => {
      cancelled = true;
    };
  }, [key]);

  useEffect(() => {
    if (hydrated) storage.write(key, value);
  }, [key, value, hydrated]);

  return [value, setValue, hydrated];
}
