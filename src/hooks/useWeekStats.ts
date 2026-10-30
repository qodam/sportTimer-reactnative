import { Session } from "@/src/types";
import { useMemo } from "react";

export interface WeekDay {
  date: Date;
  done: boolean;
  isToday: boolean;
}

export interface WeekStats {
  /** Lundi → dimanche de la semaine en cours */
  days: WeekDay[];
  thisWeek: Session[];
  earlier: Session[];
  /** Temps total cette semaine, en secondes */
  totalSec: number;
}

const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

function startOfWeek(now: Date): Date {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); // lundi
  return d;
}

/** Statistiques de la semaine en cours, pour l'historique. */
export function useWeekStats(history: Session[]): WeekStats {
  return useMemo(() => {
    const today = new Date();
    const monday = startOfWeek(today);
    const thisWeek = history.filter((s) => new Date(s.date) >= monday);
    const earlier = history.filter((s) => new Date(s.date) < monday);

    const days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      return {
        date,
        done: thisWeek.some((s) => sameDay(new Date(s.date), date)),
        isToday: sameDay(date, today),
      };
    });

    return {
      days,
      thisWeek,
      earlier,
      totalSec: thisWeek.reduce((t, s) => t + s.durationSec, 0),
    };
  }, [history]);
}
