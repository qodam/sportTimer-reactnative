/**
 * Petit service de stockage local (JSON dans AsyncStorage).
 * Les erreurs ne remontent jamais à l'écran : une lecture ratée
 * renvoie `null`, une écriture ratée est simplement journalisée.
 */
import { logger } from "@/utils/logger";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const storage = {
  async read<T>(key: string): Promise<T | null> {
    try {
      const raw = await AsyncStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch (e) {
      logger.warn(`[storage] lecture impossible : ${key}`, e);
      return null;
    }
  },

  async write<T>(key: string, value: T): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      logger.warn(`[storage] écriture impossible : ${key}`, e);
    }
  },

  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (e) {
      logger.warn(`[storage] suppression impossible : ${key}`, e);
    }
  },
};
