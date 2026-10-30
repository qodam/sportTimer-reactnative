package expo.modules.sessionservice

import android.content.Intent
import android.os.Build
import expo.modules.kotlin.exception.Exceptions
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

/**
 * Pont JavaScript ↔ service Android.
 *  - start(json)   : démarre ou met à jour la carte de séance
 *  - stop()        : retire la carte et arrête le service
 *  - setInApp(b)   : l'appli est-elle à l'écran ? (sons et vibrations natifs seulement si non)
 * Événement "onAction" : { type: "pause" | "resume" | "stop" } quand on touche un bouton de la carte.
 */
class SessionServiceModule : Module() {
  private val context
    get() = appContext.reactContext ?: throw Exceptions.ReactContextLost()

  override fun definition() = ModuleDefinition {
    Name("SessionService")

    Events("onAction")

    OnCreate {
      SessionForegroundService.onAction = { type -> sendEvent("onAction", mapOf("type" to type)) }
    }

    OnDestroy {
      SessionForegroundService.onAction = null
    }

    Function("start") { payloadJson: String ->
      val running = SessionForegroundService.instance
      if (running != null) {
        // Déjà en marche : simple mise à jour, sans redémarrer le service
        running.update(payloadJson)
      } else {
        val intent = Intent(context, SessionForegroundService::class.java).apply {
          action = SessionForegroundService.ACTION_UPDATE
          putExtra(SessionForegroundService.EXTRA_PAYLOAD, payloadJson)
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
          context.startForegroundService(intent)
        } else {
          context.startService(intent)
        }
      }
      Unit // rien à renvoyer à JavaScript
    }

    Function("stop") {
      context.stopService(Intent(context, SessionForegroundService::class.java))
      SessionForegroundService.cancelNotification(context)
    }

    Function("setInApp") { inApp: Boolean ->
      SessionForegroundService.inApp = inApp
    }
  }
}