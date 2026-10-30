/**
 * Construit le programme envoyé au service Android : la phase en cours et
 * toutes les suivantes, avec leurs heures exactes. Le service s'en sert pour
 * changer de phase tout seul quand l'appli est en arrière-plan.
 */
import { ServicePayload, ServiceSegment } from "@/modules/session-service";
import { PREP_SECONDS } from "@/src/constants/session";
import { elapsedMsOf, intervalCount } from "@/src/lib/timer";
import { ActiveSession, ThemeColors } from "@/src/types";

export type Translate = (
  key: string,
  options?: Record<string, unknown>,
) => string;

const BLACK = "#000000";
const WHITE = "#FFFFFF";

export function buildForegroundPayload(
  s: ActiveSession,
  t: Translate,
  colors: ThemeColors,
  now = Date.now(),
): ServicePayload {
  const c = s.config;
  const elapsedMs = elapsedMsOf(s, now);
  /** Heure (epoch ms) correspondant à `sec` secondes après « Démarrer » */
  const at = (sec: number) => now - elapsedMs + sec * 1000;

  const segments: ServiceSegment[] = [
    {
      title: t("session.ready"),
      background: colors.orange,
      foreground: BLACK,
      startsAt: at(0),
      endsAt: at(PREP_SECONDS),
      countUp: false,
    },
  ];

  let doneText = "";

  if (c.mode === "chrono") {
    const cap = c.chronoMin * 60;
    segments.push({
      title: t("notifications.chrono"),
      background: colors.card2,
      foreground: WHITE,
      startsAt: at(PREP_SECONDS),
      endsAt: cap > 0 ? at(PREP_SECONDS + cap) : 0,
      countUp: true,
    });
  } else {
    const total = c.totalMin * 60;
    const n = intervalCount(c);
    const cycle = c.effort + c.pause;
    for (let i = 0; i < n; i++) {
      const start = i * cycle;
      const effortEnd = Math.min(start + c.effort, total);
      segments.push({
        title: `${t("session.work")} · ${i + 1}/${n}`,
        background: colors.orange,
        foreground: BLACK,
        startsAt: at(PREP_SECONDS + start),
        endsAt: at(PREP_SECONDS + effortEnd),
        countUp: false,
      });
      if (c.pause > 0 && effortEnd < total) {
        segments.push({
          title: `${t("session.rest")} · ${i + 1}/${n}`,
          background: colors.blue,
          foreground: WHITE,
          startsAt: at(PREP_SECONDS + effortEnd),
          endsAt: at(PREP_SECONDS + Math.min(start + cycle, total)),
          countUp: false,
        });
      }
    }
    doneText = `${n}/${n}`;
  }

  return {
    // Seulement la phase en cours et les suivantes
    segments: segments.filter((seg) => seg.endsAt === 0 || seg.endsAt > now),
    paused: !s.running,
    beep: s.beep,
    channelName: t("notifications.channel"),
    labels: {
      pause: t("session.pauseShort"),
      resume: t("session.resume"),
      stop: t("session.finish"),
      paused: t("notifications.paused"),
    },
    done: { title: t("notifications.done"), text: doneText },
  };
}
