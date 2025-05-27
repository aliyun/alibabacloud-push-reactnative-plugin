package com.aliyun.ams.push

import com.alibaba.sdk.android.push.notification.CPushMessage
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.modules.core.DeviceEventManagerModule
import org.json.JSONObject

class AliyunPushEventEmitter private constructor(private val reactContext: ReactApplicationContext) {

  companion object {
    private var instance: AliyunPushEventEmitter? = null

    fun getInstance(context: ReactApplicationContext): AliyunPushEventEmitter {
      return instance ?: synchronized(this) {
        instance ?: AliyunPushEventEmitter(context).also { instance = it }
      }
    }

    fun getInstance(): AliyunPushEventEmitter? {
      return instance
    }
  }

  private val eventEmitter by lazy {
    reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
  }

  private val activeEvents = mutableSetOf<String>()

  // 添加监听器
  fun addListener(eventName: String?) {
    AliyunPushEvent.fromEventName(eventName)?.let {
      activeEvents.add(it.eventName)
    }
  }

  // 移除监听器
  fun removeListeners() {
    activeEvents.clear()
  }

  // 发送事件（仅当监听存在）
  fun sendEvent(event: AliyunPushEvent, body: Map<String, Any?>) {
    if (activeEvents.contains(event.eventName)) {
      val eventBody = Arguments.createMap().apply {
        body.forEach { (key, value) ->
          when (value) {
            is String -> putString(key, value)
            is Number -> putDouble(key, value.toDouble())
            is Boolean -> putBoolean(key, value)
            else -> Unit
          }
        }
      }
      eventEmitter.emit(event.eventName, eventBody)
    }
  }

  // 快捷方法：消息到达
  fun onMessageReceived(cPushMessage: CPushMessage) {
    val data = mapOf(
      "title" to cPushMessage.title,
      "body" to cPushMessage.content
    )
    sendEvent(AliyunPushEvent.ON_MESSAGE, data)
  }

  // 快捷方法：通知到达
  fun onNotificationReceived(title: String, summary: String, extra: Map<String, String>?) {
    val data = mutableMapOf<String, Any?>().apply {
      put("title", title)
      put("summary", summary)
      // convert extra to json
      if (!extra.isNullOrEmpty()) {
        try {
          val extraJson = JSONObject().apply {
            extra.forEach { (key, value) ->
              put(key, value)
            }
          }
          put("extra", extraJson.toString())
        } catch (e: Exception) {
          e.printStackTrace()
        }
      }
    }
    sendEvent(AliyunPushEvent.ON_NOTIFICATION, data)
  }

  // 快捷方法：应用内通知到达
  fun onNotificationReceivedInApp(
    title: String,
    summary: String,
    extraMap: Map<String, String>,
    openType: Int,
    openActivity: String,
    openUrl: String
  ) {
    val data = mutableMapOf<String, Any?>().apply {
      put("title", title)
      put("summary", summary)
      putAll(extraMap)
      put("openType", openType)
      put("openActivity", openActivity)
      put("openUrl", openUrl)
    }
    sendEvent(AliyunPushEvent.ON_NOTIFICATION_RECEIVED_IN_APP, data)
  }

  // 快捷方法：通知被打开
  fun onNotificationOpened(title: String, summary: String, extra: String?) {
    sendEvent(
      AliyunPushEvent.ON_NOTIFICATION_OPENED,
      mapOf("title" to title, "summary" to summary, "extra" to extra)
    )
  }

  // 快捷方法：通知被移除
  fun onNotificationRemoved(messageId: String) {
    sendEvent(
      AliyunPushEvent.ON_NOTIFICATION_REMOVED,
      mapOf("msgId" to messageId)
    )
  }

  // 快捷方法：通知被点击但无动作
  fun onNotificationClickedWithNoAction(title: String, summary: String, extra: String?) {
    sendEvent(
      AliyunPushEvent.ON_NOTIFICATION_CLICKED_WITH_NO_ACTION,
      mapOf("title" to title, "summary" to summary, "extra" to extra)
    )
  }
}
