package com.wjdxodbs.fillit

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build
import com.reactnativeandroidwidget.RNWidgetJsCommunication
import java.util.Calendar
import java.util.TimeZone

/**
 * 한국 시간(KST) 00:00에 위젯을 갱신하고, 다음 자정 알람을 다시 스케줄합니다.
 */
class MidnightWidgetUpdateReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        when (intent.action) {
            ACTION_MIDNIGHT_UPDATE -> {
                // 위젯 갱신 (잔디 한 칸 채워지도록)
                RNWidgetJsCommunication.requestWidgetUpdate(context, "FillitGrass")
                scheduleNextMidnight(context)
            }
            Intent.ACTION_BOOT_COMPLETED -> {
                // 재부팅 후 다음 자정 알람만 스케줄
                scheduleNextMidnight(context)
            }
        }
    }

    companion object {
        private const val ACTION_MIDNIGHT_UPDATE = "com.wjdxodbs.fillit.MIDNIGHT_WIDGET_UPDATE"
        private const val REQUEST_CODE = 34001

        /**
         * 다음 한국 시간 00:00:00에 알람을 스케줄합니다.
         * 앱 시작 시 및 알람 수신 시 호출합니다.
         */
        @JvmStatic
        fun scheduleNextMidnight(context: Context) {
            val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as? AlarmManager ?: return
            val kst = TimeZone.getTimeZone("Asia/Seoul")
            val nextMidnight = Calendar.getInstance(kst).apply {
                set(Calendar.HOUR_OF_DAY, 0)
                set(Calendar.MINUTE, 0)
                set(Calendar.SECOND, 0)
                set(Calendar.MILLISECOND, 0)
                add(Calendar.DAY_OF_MONTH, 1)
            }.timeInMillis

            val intent = Intent(context, MidnightWidgetUpdateReceiver::class.java).apply {
                action = ACTION_MIDNIGHT_UPDATE
            }
            val flags = PendingIntent.FLAG_UPDATE_CURRENT or
                (if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) PendingIntent.FLAG_IMMUTABLE else 0)
            val pending = PendingIntent.getBroadcast(context, REQUEST_CODE, intent, flags)

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                alarmManager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, nextMidnight, pending)
            } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                alarmManager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, nextMidnight, pending)
            } else {
                @Suppress("DEPRECATION")
                alarmManager.setExact(AlarmManager.RTC_WAKEUP, nextMidnight, pending)
            }
        }
    }
}
