package expo.modules.sessionservice

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.graphics.Color
import android.graphics.drawable.Icon
import android.media.AudioManager
import android.media.ToneGenerator
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.os.PowerManager
import android.os.SystemClock
import android.os.VibrationEffect
import android.os.Vibrator
import android.view.View
import android.widget.RemoteViews
import org.json.JSONObject

/**
 * Service au premier plan pendant une séance.
 *
 * JavaScript lui envoie le programme complet de la séance (une liste de
 * segments avec leurs heures de début et de fin). Le service l'affiche dans
 * une carte fixe (barre de notifications + écran verrouillé) avec un compte
 * à rebours qui défile tout seul, et passe d'une phase à l'autre sans avoir
 * besoin de JavaScript — qui est en pause quand l'appli est en arrière-plan.
 */
class SessionForegroundService : Service() {

  companion object {
    const val ACTION_UPDATE = "expo.modules.sessionservice.UPDATE"
    const val ACTION_PAUSE = "expo.modules.sessionservice.PAUSE"
    const val ACTION_RESUME = "expo.modules.sessionservice.RESUME"
    const val ACTION_STOP = "expo.modules.sessionservice.STOP"
    const val EXTRA_PAYLOAD = "payload"

    private const val CHANNEL_ID = "pushpause_session"
    private const val NOTIFICATION_ID = 4242
    private const val WAKE_LOCK_TAG = "pushpause:session"

    /** Branché par le module : remonte les boutons de la carte à JavaScript */
    @Volatile var onAction: ((String) -> Unit)? = null

    /** Vrai quand l'appli est à l'écran : c'est elle qui joue les sons et vibrations */
    @Volatile var inApp: Boolean = true

    /** Le service en cours, s'il tourne (pour le mettre à jour sans le redémarrer) */
    @Volatile var instance: SessionForegroundService? = null

    fun cancelNotification(context: Context) {
      (context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager).cancel(NOTIFICATION_ID)
    }
  }

  // ─── Données reçues de JavaScript ──────────────────────────────────────

  private data class Segment(
    val title: String,
    val background: Int,
    val foreground: Int,
    /** epoch ms */
    val startsAt: Long,
    /** epoch ms, 0 = pas de fin (chrono libre sans limite) */
    val endsAt: Long,
    /** true = chrono qui monte, false = compte à rebours */
    val countUp: Boolean,
  )

  private data class Labels(val pause: String, val resume: String, val stop: String, val paused: String)

  private var segments: List<Segment> = emptyList()
  private var labels = Labels("Pause", "Resume", "Stop", "Paused")
  private var doneTitle = "Done"
  private var doneText = ""
  private var channelName = "Workout"
  private var beep = true
  private var paused = false
  private var pausedAt = 0L

  // ─── Outils ────────────────────────────────────────────────────────────

  private val handler = Handler(Looper.getMainLooper())
  private var wakeLock: PowerManager.WakeLock? = null
  private var tone: ToneGenerator? = null

  override fun onBind(intent: Intent?): IBinder? = null

  override fun onCreate() {
    super.onCreate()
    instance = this
  }

  /**
   * Mise à jour d'un service qui tourne déjà : pas besoin de le relancer
   * (Android interdit de démarrer un service au premier plan depuis l'arrière-plan).
   */
  fun update(payloadJson: String) {
    handler.post {
      try {
        applyPayload(payloadJson)
      } catch (e: Exception) {
        android.util.Log.w("PushPause", "Programme de séance invalide", e)
        return@post
      }
      if (segments.isEmpty()) {
        shutdown()
      } else {
        notifyUpdate()
        scheduleNext()
      }
    }
  }

  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    when (intent?.action) {
      ACTION_UPDATE -> intent.getStringExtra(EXTRA_PAYLOAD)?.let {
        try {
          applyPayload(it)
        } catch (e: Exception) {
          // Programme illisible : on garde l'ancien plutôt que de planter le service
          android.util.Log.w("PushPause", "Programme de séance invalide", e)
        }
      }
      ACTION_PAUSE -> {
        pauseLocally()
        onAction?.invoke("pause")
      }
      ACTION_RESUME -> {
        resumeLocally()
        onAction?.invoke("resume")
      }
      ACTION_STOP -> {
        onAction?.invoke("stop")
        shutdown()
        return START_NOT_STICKY
      }
    }

    if (segments.isEmpty()) {
      // Rien à afficher (démarrage par le système sans programme) : on s'arrête proprement.
      startInForeground(buildDoneNotification())
      shutdown()
      return START_NOT_STICKY
    }

    startInForeground(buildNotification())
    scheduleNext()
    return START_NOT_STICKY
  }

  /** L'utilisateur a fermé l'appli depuis le multitâche : la séance reste sauvegardée côté JS. */
  override fun onTaskRemoved(rootIntent: Intent?) {
    shutdown()
    super.onTaskRemoved(rootIntent)
  }

  override fun onDestroy() {
    instance = null
    handler.removeCallbacksAndMessages(null)
    releaseWakeLock()
    tone?.release()
    tone = null
    super.onDestroy()
  }

  // ─── Programme de la séance ────────────────────────────────────────────

  private fun applyPayload(json: String) {
    val o = JSONObject(json)
    val list = o.getJSONArray("segments")
    segments = (0 until list.length()).map { i ->
      val s = list.getJSONObject(i)
      Segment(
        title = s.getString("title"),
        background = parseColor(s.optString("background"), Color.DKGRAY),
        foreground = parseColor(s.optString("foreground"), Color.WHITE),
        startsAt = s.getLong("startsAt"),
        endsAt = s.optLong("endsAt", 0L),
        countUp = s.optBoolean("countUp", false),
      )
    }
    o.optJSONObject("labels")?.let {
      labels = Labels(
        pause = it.optString("pause", labels.pause),
        resume = it.optString("resume", labels.resume),
        stop = it.optString("stop", labels.stop),
        paused = it.optString("paused", labels.paused),
      )
    }
    o.optJSONObject("done")?.let {
      doneTitle = it.optString("title", doneTitle)
      doneText = it.optString("text", doneText)
    }
    channelName = o.optString("channelName", channelName)
    beep = o.optBoolean("beep", true)
    paused = o.optBoolean("paused", false)
    pausedAt = if (paused) System.currentTimeMillis() else 0L
    acquireWakeLock()
  }

  /** Le segment en cours : le premier qui n'est pas encore fini. */
  private fun currentSegment(now: Long = referenceNow()): Segment? =
    segments.firstOrNull { it.endsAt == 0L || now < it.endsAt }

  /** En pause, le temps est figé au moment de la pause. */
  private fun referenceNow(): Long = if (paused) pausedAt else System.currentTimeMillis()

  private fun pauseLocally() {
    if (paused) return
    paused = true
    pausedAt = System.currentTimeMillis()
    handler.removeCallbacksAndMessages(null)
    notifyUpdate()
  }

  private fun resumeLocally() {
    if (!paused) return
    val delta = System.currentTimeMillis() - pausedAt
    // Tout le programme est décalé de la durée de la pause
    segments = segments.map {
      it.copy(startsAt = it.startsAt + delta, endsAt = if (it.endsAt == 0L) 0L else it.endsAt + delta)
    }
    paused = false
    pausedAt = 0L
    notifyUpdate()
    scheduleNext()
  }

  /** Programme le prochain changement de phase, et les bips 3-2-1 juste avant. */
  private fun scheduleNext() {
    handler.removeCallbacksAndMessages(null)
    if (paused) return

    val now = System.currentTimeMillis()
    val seg = currentSegment(now)
    if (seg == null) {
      finishSession()
      return
    }
    if (seg.endsAt == 0L) return // chrono libre sans limite : rien à programmer

    for (k in 1..3) {
      val at = seg.endsAt - k * 1000L - now
      if (at > 0) handler.postDelayed({ if (!inApp && beep) playTone(short = true) }, at)
    }
    handler.postDelayed({ onPhaseChange() }, (seg.endsAt - now).coerceAtLeast(0L))
  }

  private fun onPhaseChange() {
    if (!inApp) {
      vibrate()
      if (beep) playTone(short = false)
    }
    if (currentSegment() == null) {
      finishSession()
    } else {
      notifyUpdate()
      scheduleNext()
    }
  }

  /** Fin de la séance : la carte devient « terminée » et peut être balayée. */
  private fun finishSession() {
    handler.removeCallbacksAndMessages(null)
    val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
    stopForegroundCompat()
    manager.notify(NOTIFICATION_ID, buildDoneNotification())
    releaseWakeLock()
    stopSelf()
  }

  private fun shutdown() {
    handler.removeCallbacksAndMessages(null)
    stopForegroundCompat()
    cancelNotification(this)
    releaseWakeLock()
    stopSelf()
  }

  // ─── Carte affichée ────────────────────────────────────────────────────

  private fun ensureChannel() {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
    val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
    val channel = NotificationChannel(CHANNEL_ID, channelName, NotificationManager.IMPORTANCE_LOW).apply {
      setShowBadge(false)
      setSound(null, null)
      enableVibration(false) // les vibrations sont gérées à la main, au changement de phase
      lockscreenVisibility = Notification.VISIBILITY_PUBLIC
    }
    manager.createNotificationChannel(channel)
  }

  private fun builder(): Notification.Builder {
    ensureChannel()
    return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      Notification.Builder(this, CHANNEL_ID)
    } else {
      @Suppress("DEPRECATION")
      Notification.Builder(this)
    }
  }

  private fun buildNotification(): Notification {
    val seg = currentSegment() ?: return buildDoneNotification()

    val b = builder()
      .setSmallIcon(R.drawable.pushpause_ic_session)
      .setOngoing(true)
      .setOnlyAlertOnce(true)
      .setShowWhen(false)
      .setCategory(Notification.CATEGORY_PROGRESS)
      .setVisibility(Notification.VISIBILITY_PUBLIC)
      .setContentTitle(seg.title)
      .setColor(seg.background)
      .setContentIntent(openAppIntent())
      .setCustomContentView(sessionView(seg, R.layout.pushpause_notification_small))
      .setCustomBigContentView(sessionView(seg, R.layout.pushpause_notification_big))
      .setStyle(Notification.DecoratedCustomViewStyle())

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) b.setColorized(true)
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
      b.setForegroundServiceBehavior(Notification.FOREGROUND_SERVICE_IMMEDIATE)
    }

    if (paused) {
      b.addAction(action(R.drawable.pushpause_ic_play, labels.resume, ACTION_RESUME))
    } else {
      b.addAction(action(R.drawable.pushpause_ic_pause, labels.pause, ACTION_PAUSE))
    }
    b.addAction(action(R.drawable.pushpause_ic_stop, labels.stop, ACTION_STOP))
    return b.build()
  }

  /** Mise en page de la carte : la phase, puis le chrono en grand. */
  private fun sessionView(seg: Segment, layout: Int): RemoteViews {
    val now = referenceNow()
    val views = RemoteViews(packageName, layout)
    views.setInt(R.id.pp_root, "setBackgroundColor", seg.background)
    views.setTextViewText(R.id.pp_title, seg.title)
    views.setTextColor(R.id.pp_title, seg.foreground)
    views.setTextColor(R.id.pp_chrono, seg.foreground)

    // Le Chronometer se cale sur l'horloge « elapsedRealtime » du téléphone
    val base = if (seg.countUp) {
      SystemClock.elapsedRealtime() - (now - seg.startsAt)
    } else {
      SystemClock.elapsedRealtime() + (seg.endsAt - now)
    }
    views.setChronometer(R.id.pp_chrono, base, null, !paused)
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
      views.setChronometerCountDown(R.id.pp_chrono, !seg.countUp)
    }

    if (paused) {
      views.setViewVisibility(R.id.pp_sub, View.VISIBLE)
      views.setTextViewText(R.id.pp_sub, labels.paused)
      views.setTextColor(R.id.pp_sub, seg.foreground)
    } else {
      views.setViewVisibility(R.id.pp_sub, View.GONE)
    }
    return views
  }

  private fun buildDoneNotification(): Notification =
    builder()
      .setSmallIcon(R.drawable.pushpause_ic_session)
      .setContentTitle(doneTitle)
      .setContentText(doneText)
      .setAutoCancel(true)
      .setOngoing(false)
      .setVisibility(Notification.VISIBILITY_PUBLIC)
      .setContentIntent(openAppIntent())
      .build()

  private fun notifyUpdate() {
    val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
    manager.notify(NOTIFICATION_ID, buildNotification())
  }

  private fun startInForeground(notification: Notification) {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
      startForeground(NOTIFICATION_ID, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE)
    } else {
      startForeground(NOTIFICATION_ID, notification)
    }
  }

  private fun stopForegroundCompat() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
      stopForeground(STOP_FOREGROUND_DETACH)
    } else {
      @Suppress("DEPRECATION")
      stopForeground(false)
    }
  }

  private fun action(icon: Int, title: String, intentAction: String): Notification.Action {
    val intent = Intent(this, SessionForegroundService::class.java).setAction(intentAction)
    val pending = PendingIntent.getService(
      this,
      intentAction.hashCode(),
      intent,
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
    )
    return Notification.Action.Builder(Icon.createWithResource(this, icon), title, pending).build()
  }

  private fun openAppIntent(): PendingIntent? {
    val launch = packageManager.getLaunchIntentForPackage(packageName) ?: return null
    launch.flags = Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_REORDER_TO_FRONT
    return PendingIntent.getActivity(
      this,
      0,
      launch,
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
    )
  }

  // ─── Son, vibration, réveil ───────────────────────────────────────────

  private fun playTone(short: Boolean) {
    try {
      val generator = tone ?: ToneGenerator(AudioManager.STREAM_MUSIC, 90).also { tone = it }
      generator.startTone(ToneGenerator.TONE_PROP_BEEP, if (short) 150 else 600)
    } catch (e: RuntimeException) {
      // Pas de son disponible : la vibration suffit.
    }
  }

  private fun vibrate() {
    try {
      @Suppress("DEPRECATION")
      val vibrator = getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator ?: return
      val pattern = longArrayOf(0, 250, 120, 250)
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        vibrator.vibrate(VibrationEffect.createWaveform(pattern, -1))
      } else {
        @Suppress("DEPRECATION")
        vibrator.vibrate(pattern, -1)
      }
    } catch (e: RuntimeException) {
    }
  }

  /** Sans ça, écran éteint, le téléphone s'endort et les phases changeraient en retard. */
  private fun acquireWakeLock() {
    val lastEnd = segments.maxOfOrNull { it.endsAt } ?: 0L
    val timeout = if (lastEnd > 0L) {
      (lastEnd - System.currentTimeMillis() + 60_000L).coerceIn(60_000L, 4 * 3_600_000L)
    } else {
      4 * 3_600_000L // chrono libre sans limite : 4 h maximum
    }
    val lock = wakeLock ?: (getSystemService(Context.POWER_SERVICE) as PowerManager)
      .newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, WAKE_LOCK_TAG)
      .also {
        it.setReferenceCounted(false)
        wakeLock = it
      }
    lock.acquire(timeout)
  }

  private fun releaseWakeLock() {
    wakeLock?.let { if (it.isHeld) it.release() }
  }

  private fun parseColor(value: String?, fallback: Int): Int =
    try {
      if (value.isNullOrEmpty()) fallback else Color.parseColor(value)
    } catch (e: IllegalArgumentException) {
      fallback
    }
}