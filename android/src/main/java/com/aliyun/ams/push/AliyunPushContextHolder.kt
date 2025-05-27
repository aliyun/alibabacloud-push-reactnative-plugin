package com.aliyun.ams.push

import com.facebook.react.bridge.ReactApplicationContext

object AliyunPushContextHolder {
  private var reactContext: ReactApplicationContext? = null

  fun setReactContext(context: ReactApplicationContext) {
    reactContext = context
  }

  fun getReactContext(): ReactApplicationContext? {
    return reactContext
  }
}
