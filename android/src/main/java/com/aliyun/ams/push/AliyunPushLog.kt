package com.aliyun.ams.push

import android.util.Log

object AliyunPushLog {
  @Volatile
  private var sLogEnabled = false

  fun isLogEnabled(): Boolean {
    return sLogEnabled
  }

  fun setLogEnabled(logEnabled: Boolean) {
    sLogEnabled = logEnabled
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
}
