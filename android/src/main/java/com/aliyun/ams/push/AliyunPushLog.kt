package com.aliyun.ams.push

import android.util.Log

object AliyunPushLog {
  @Volatile
  private var sLogEnabled = false

  private const val TAG_PUSH = "AliyunPush"
  private const val TAG_EVENT = "AliyunPush-Event"
  private const val TAG_INIT = "AliyunPush-Init"
  private const val TAG_MESSAGE = "AliyunPush-Message"
  private const val TAG_CACHE = "AliyunPush-Cache"

  fun isLogEnabled(): Boolean {
    return sLogEnabled
  }

  fun setLogEnabled(logEnabled: Boolean) {
    sLogEnabled = logEnabled
    if (logEnabled) {
      d(TAG_INIT, "AliyunPush 日志已启用")
    }
  }

  fun d(tag: String, msg: String) {
    if (sLogEnabled) {
      Log.d(tag, msg)
    }
  }

  fun e(tag: String, msg: String) {
    if (sLogEnabled) {
      Log.e(tag, msg)
    }
  }

  fun i(tag: String, msg: String) {
    if (sLogEnabled) {
      Log.i(tag, msg)
    }
  }

  fun w(tag: String, msg: String) {
    if (sLogEnabled) {
      Log.w(tag, msg)
    }
  }

  // 推送模块初始化日志
  fun logInit(msg: String) {
    d(TAG_INIT, "[初始化] $msg")
  }

  // 事件发射器相关日志
  fun logEvent(eventName: String, hasListener: Boolean, action: String) {
    d(TAG_EVENT, "[事件] $eventName - 有监听器: $hasListener - 操作: $action")
  }

  // 缓存操作日志
  fun logCache(eventName: String, action: String, cacheSize: Int = 0) {
    d(TAG_CACHE, "[缓存] $eventName - $action - 缓存数量: $cacheSize")
  }

  // 消息处理日志
  fun logMessage(messageType: String, title: String?, summary: String?) {
    d(TAG_MESSAGE, "[消息] 类型: $messageType, 标题: $title, 内容: $summary")
  }

  // 错误日志
  fun logError(operation: String, error: Throwable) {
    e(TAG_PUSH, "[错误] $operation: ${error.message}")
    if (sLogEnabled) {
      error.printStackTrace()
    }
  }

  // 推送设备信息日志
  fun logDeviceInfo(deviceId: String?, alias: String?) {
    d(TAG_INIT, "[设备信息] DeviceID: $deviceId, 别名: $alias")
  }

  // 监听器管理日志
  fun logListenerManagement(action: String, eventName: String?, activeListeners: Set<String>) {
    d(TAG_EVENT, "[监听器管理] $action - 事件: $eventName - 活跃监听器: ${activeListeners.joinToString(", ")}")
  }
}
