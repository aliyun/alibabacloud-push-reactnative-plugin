package com.aliyun.ams.push

import com.alibaba.sdk.android.push.notification.CPushMessage
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.modules.core.DeviceEventManagerModule
import org.json.JSONObject

class AliyunPushEventEmitter private constructor() {

  companion object {
    private var instance: AliyunPushEventEmitter? = null
    private val instanceLock = Any()

    fun getInstance(context: ReactApplicationContext): AliyunPushEventEmitter {
      return synchronized(instanceLock) {
        if (instance == null) {
          instance = AliyunPushEventEmitter()
        }
        instance!!.also { 
          it.setReactContext(context)
        }
      }
    }

    fun getInstance(): AliyunPushEventEmitter {
      return synchronized(instanceLock) {
        if (instance == null) {
          instance = AliyunPushEventEmitter()
        }
        instance!!
      }
    }
  }

  private var reactContext: ReactApplicationContext? = null
  private val contextLock = Any()
  
  private var eventEmitter: DeviceEventManagerModule.RCTDeviceEventEmitter? = null

  private val activeEvents = mutableSetOf<String>()
  
  // 缓存的事件数据
  private val cachedEvents = mutableMapOf<String, MutableList<Map<String, Any?>>>()

  // 设置React上下文
  private fun setReactContext(context: ReactApplicationContext) {
    synchronized(contextLock) {
      if (this.reactContext == null) {
        this.reactContext = context
        this.eventEmitter = context.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
        AliyunPushLog.logCache("ReactContext", "React上下文已初始化", 0)
      }
    }
  }
  
  // 检查是否已初始化React上下文
  private fun isReactContextInitialized(): Boolean {
    return synchronized(contextLock) {
      reactContext != null && eventEmitter != null
    }
  }

  // 添加监听器
  fun addListener(eventName: String?) {
    AliyunPushEvent.fromEventName(eventName)?.let { event ->
      synchronized(this) {
        activeEvents.add(event.eventName)
        AliyunPushLog.logListenerManagement("添加监听器", event.eventName, activeEvents)
        
        // 发射缓存的事件
        cachedEvents[event.eventName]?.let { eventList ->
          AliyunPushLog.logCache(event.eventName, "发射缓存事件", eventList.size)
          eventList.forEach { cachedEventData ->
            sendEventInternal(event, cachedEventData)
          }
          // 清空该类型的缓存
          cachedEvents.remove(event.eventName)
          AliyunPushLog.logCache(event.eventName, "清空缓存", 0)
        }
      }
    }
  }

  // 移除监听器
  fun removeListeners() {
    // 这里不做任何操作，因为我们无法知道有哪些监听器被移除了
  }

  // 发送事件（监听存在时立即发送，否则缓存）
  fun sendEvent(event: AliyunPushEvent, body: Map<String, Any?>) {
    synchronized(this) {
      val hasListener = activeEvents.contains(event.eventName)
      if (hasListener && isReactContextInitialized()) {
        // 有监听器且React上下文已初始化，立即发送
        AliyunPushLog.logEvent(event.eventName, true, "立即发送")
        sendEventInternal(event, body)
      } else {
        // 无监听器或React上下文未初始化，缓存事件
        val cacheReason = if (!isReactContextInitialized()) "React上下文未初始化" else "无监听器"
        AliyunPushLog.logEvent(event.eventName, false, "缓存事件($cacheReason)")
        cacheEvent(event.eventName, body)
      }
    }
  }
  
  // 内部发送事件方法
  private fun sendEventInternal(event: AliyunPushEvent, body: Map<String, Any?>) {
    eventEmitter?.let { emitter ->
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
      emitter.emit(event.eventName, eventBody)
    }
  }
  
  // 缓存事件
  private fun cacheEvent(eventName: String, body: Map<String, Any?>) {
    val eventList = cachedEvents.getOrPut(eventName) { mutableListOf() }
    eventList.add(body)
    
    // 限制缓存大小，避免内存泄漏（每种事件类型最多缓存10个）
    if (eventList.size > 10) {
      eventList.removeAt(0)
      AliyunPushLog.logCache(eventName, "缓存超限，移除最旧事件", eventList.size)
    } else {
      AliyunPushLog.logCache(eventName, "添加到缓存", eventList.size)
    }
  }

  // 快捷方法：消息到达
  fun onMessageReceived(cPushMessage: CPushMessage) {
    val data = mapOf(
      "title" to cPushMessage.title,
      "body" to cPushMessage.content
    )
    AliyunPushLog.logMessage("消息到达", cPushMessage.title, cPushMessage.content)
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
          AliyunPushLog.logError("通知到达-解析extra", e)
        }
      }
    }
    AliyunPushLog.logMessage("通知到达", title, summary)
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
    AliyunPushLog.logMessage("应用内通知到达", title, summary)
    sendEvent(AliyunPushEvent.ON_NOTIFICATION_RECEIVED_IN_APP, data)
  }

  // 快捷方法：通知被打开
  fun onNotificationOpened(title: String, summary: String, extra: String?) {
    AliyunPushLog.logMessage("通知被打开", title, summary)
    sendEvent(
      AliyunPushEvent.ON_NOTIFICATION_OPENED,
      mapOf("title" to title, "summary" to summary, "extra" to extra)
    )
  }

  // 快捷方法：通知被移除
  fun onNotificationRemoved(messageId: String) {
    AliyunPushLog.logMessage("通知被移除", null, "MessageID: $messageId")
    sendEvent(
      AliyunPushEvent.ON_NOTIFICATION_REMOVED,
      mapOf("msgId" to messageId)
    )
  }

  // 快捷方法：通知被点击但无动作
  fun onNotificationClickedWithNoAction(title: String, summary: String, extra: String?) {
    AliyunPushLog.logMessage("通知被点击但无动作", title, summary)
    sendEvent(
      AliyunPushEvent.ON_NOTIFICATION_CLICKED_WITH_NO_ACTION,
      mapOf("title" to title, "summary" to summary, "extra" to extra)
    )
  }
}
