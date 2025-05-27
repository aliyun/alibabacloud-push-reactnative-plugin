package com.aliyun.ams.push

import android.app.Notification
import android.content.Context
import androidx.core.app.NotificationCompat
import com.alibaba.sdk.android.push.MessageReceiver
import com.alibaba.sdk.android.push.notification.CPushMessage
import com.alibaba.sdk.android.push.notification.NotificationConfigure
import com.alibaba.sdk.android.push.notification.PushData

class AliyunPushMessageReceiver : MessageReceiver() {

  companion object {
    const val REC_TAG = "MPS:receiver"
  }

  override fun hookNotificationBuild(): NotificationConfigure {
    return object : NotificationConfigure {
      override fun configBuilder(builder: Notification.Builder, pushData: PushData) {
        AliyunPushLog.d(REC_TAG, "configBuilder")
      }

      override fun configBuilder(builder: NotificationCompat.Builder, pushData: PushData) {
        AliyunPushLog.d(REC_TAG, "configBuilder")
      }

      override fun configNotification(notification: Notification, pushData: PushData) {
        AliyunPushLog.d(REC_TAG, "configNotification")
      }
    }
  }

  override fun showNotificationNow(context: Context, map: Map<String, String>): Boolean {
    map.entries.forEach { entry ->
      AliyunPushLog.d(REC_TAG, "key ${entry.key} value ${entry.value}")
    }
    return super.showNotificationNow(context, map)
  }

  /**
   * 推送通知的回调方法
   *
   * @param context
   * @param title
   * @param summary
   * @param extraMap
   */
  override fun onNotification(context: Context, title: String, summary: String, extraMap: Map<String, String>) {
    AliyunPushEventEmitter.getInstance()?.onNotificationReceived(title, summary, extraMap)
  }

  /**
   * 应用处于前台时通知到达回调。注意:该方法仅对自定义样式通知有效，相关详情请参考：
   * https://help.aliyun.com/document_detail/434669.html#7bd6e81866l07
   *
   * @param context
   * @param title
   * @param summary
   * @param extraMap
   * @param openType
   * @param openActivity
   * @param openUrl
   */
  override fun onNotificationReceivedInApp(
    context: Context,
    title: String,
    summary: String,
    extraMap: Map<String, String>,
    openType: Int,
    openActivity: String,
    openUrl: String
  ) {
    AliyunPushEventEmitter.getInstance()?.onNotificationReceivedInApp(title, summary, extraMap, openType, openActivity, openUrl)
  }

  /**
   * 推送消息的回调方法
   *
   * @param context
   * @param cPushMessage
   */
  override fun onMessage(context: Context, cPushMessage: CPushMessage) {
    AliyunPushEventEmitter.getInstance()?.onMessageReceived(cPushMessage)
  }

  /**
   * 从通知栏打开通知的扩展处理
   *
   * @param context
   * @param title
   * @param summary
   * @param extraMap
   */
  override fun onNotificationOpened(context: Context, title: String, summary: String, extraMap: String) {
    AliyunPushEventEmitter.getInstance()?.onNotificationOpened(title, summary, extraMap)
  }

  /**
   * 通知删除回调
   *
   * @param context
   * @param messageId
   */
  override fun onNotificationRemoved(context: Context, messageId: String) {
    AliyunPushEventEmitter.getInstance()?.onNotificationRemoved(messageId)
  }

  /**
   * 无动作通知点击回调。当在后台或阿里云控制台指定的通知动作为无逻辑跳转时,
   * 通知点击回调为onNotificationClickedWithNoAction而不是onNotificationOpened
   *
   * @param context
   * @param title
   * @param summary
   * @param extraMap
   */
  override fun onNotificationClickedWithNoAction(context: Context, title: String, summary: String, extraMap: String) {
    AliyunPushEventEmitter.getInstance()?.onNotificationClickedWithNoAction(title, summary, extraMap)
  }
}
