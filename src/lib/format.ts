import { intervalCount } from "@/src/lib/timer";
import { Session } from "@/src/types";

/** 75 -> "1:15" */
export function mmss(totalSec: number): string {
  const s = Math.max(0, Math.round(totalSec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

/** 600 -> "10 min", 630 -> "10:30" */
export function duree(totalSec: number): string {
  const s = Math.round(totalSec);
  return s % 60 === 0 ? `${s / 60} min` : mmss(s);
}

/** Nombre d'intervalles prévus (compatible avec les anciennes séances). */
export function intervalsOf(s: Session): number {
  return s.intervals ?? intervalCount(s);
}

/** Intervalles faits (compatible avec les anciennes séances). */
export function intervalsDoneOf(s: Session): number {
  return s.intervalsDone ?? (s.completed ? intervalsOf(s) : 0);
}

/** "Jeu. 29" / "Thu 29", dans la langue choisie */
export function jourCourt(iso: string, languageTag: string): string {
  const d = new Date(iso);
  try {
    const j = d.toLocaleDateString(languageTag, { weekday: "short" });
    return `${j.charAt(0).toUpperCase()}${j.slice(1)} ${d.getDate()}`;
  } catch {
    return `${d.getDate()}/${d.getMonth() + 1}`;
  }
}
