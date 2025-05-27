package com.aliyun.ams.push

enum class AliyunPushEvent(val eventName: String) {
  ON_MESSAGE("AliyunPush_onMessage"),
  ON_NOTIFICATION("AliyunPush_onNotification"),
  ON_NOTIFICATION_RECEIVED_IN_APP("AliyunPush_onNotificationReceivedInApp"),
  ON_NOTIFICATION_OPENED("AliyunPush_onNotificationOpened"),
  ON_NOTIFICATION_REMOVED("AliyunPush_onNotificationRemoved"),
  ON_NOTIFICATION_CLICKED_WITH_NO_ACTION("AliyunPush_onNotificationClickedWithNoAction");

  companion object {
    fun fromEventName(name: String?): AliyunPushEvent? {
      return entries.firstOrNull { it.eventName == name }
    }
  }
}
