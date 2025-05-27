package com.aliyun.ams.push

import android.app.Activity
import java.io.File
import android.app.Application
import android.app.NotificationChannel
import android.app.NotificationChannelGroup
import android.app.NotificationManager
import android.content.Context
import android.content.Intent
import android.os.Build
import android.media.AudioAttributes
import android.net.Uri
import android.provider.Settings
import androidx.annotation.RequiresApi
import com.alibaba.sdk.android.push.CloudPushService
import com.alibaba.sdk.android.push.CommonCallback
import com.alibaba.sdk.android.push.noonesdk.PushServiceFactory
import androidx.core.app.NotificationManagerCompat
import com.alibaba.sdk.android.push.noonesdk.PushInitConfig
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.WritableNativeMap
import com.facebook.react.module.annotations.ReactModule

@ReactModule(name = AliyunReactNativePushModule.NAME)
class AliyunReactNativePushModule(
  private val reactContext: ReactApplicationContext
) : NativeAliyunReactNativePushSpec(reactContext) {

  init {
    AliyunPushContextHolder.setReactContext(reactContext)
  }

  private val eventEmitter = AliyunPushEventEmitter.getInstance(reactContext)

  override fun getName(): String {
    return NAME
  }

  override fun setLogLevel(level: String?) {
    val logLevel = when (level?.lowercase()) {
      "none" -> CloudPushService.LOG_OFF
      "error" -> CloudPushService.LOG_ERROR
      "warn" -> CloudPushService.LOG_ERROR // warn 映射为 error
      "info" -> CloudPushService.LOG_INFO
      "debug" -> CloudPushService.LOG_DEBUG
      else -> CloudPushService.LOG_INFO // 默认设为 info
    }
    PushServiceFactory.getCloudPushService().setLogLevel(logLevel)
  }

  override fun setPluginLogEnabled(enabled: Boolean) {
    AliyunPushLog.setLogEnabled(enabled)
  }

  override fun initPush(appKey: String?, appSecret: String?, promise: Promise?) {
    val context = reactContext.applicationContext
    if (appKey?.isBlank() == true || appSecret?.isBlank() == true || context !is Application) {
      PushServiceFactory.init(context)
    } else {
      val config = PushInitConfig.Builder().apply {
        application(context)
        appKey(appKey)
        appSecret(appSecret)
      }
      PushServiceFactory.init(config.build())
    }
    val pushService = PushServiceFactory.getCloudPushService()
    pushService.register(context, createCommonCallback(promise))
    pushService.turnOnPushChannel(createCommonCallback(null))
  }

  override fun getDeviceId(promise: Promise?) {
    val pushService = PushServiceFactory.getCloudPushService()
    promise?.resolve(pushService.deviceId)
  }

  override fun bindAccount(account: String?, promise: Promise?) {
    if (account.isNullOrEmpty()) {
      resolveWithError(promise, CODE_PARAM_ILLEGAL, "account can not be empty")
    } else {
      val pushService = PushServiceFactory.getCloudPushService()
      pushService.bindAccount(account, createCommonCallback(promise))
    }
  }

  override fun unbindAccount(promise: Promise?) {
    val pushService = PushServiceFactory.getCloudPushService()
    pushService.unbindAccount(createCommonCallback(promise))
  }

  override fun addAlias(alias: String?, promise: Promise?) {
    if (alias.isNullOrEmpty()) {
      resolveWithError(promise, CODE_PARAM_ILLEGAL, "alias can not be empty")
    } else {
      val pushService = PushServiceFactory.getCloudPushService()
      pushService.addAlias(alias, createCommonCallback(promise))
    }
  }

  override fun removeAlias(alias: String?, promise: Promise?) {
    if (alias.isNullOrEmpty()) {
      resolveWithError(promise, CODE_PARAM_ILLEGAL, "alias can not be empty")
    } else {
      val pushService = PushServiceFactory.getCloudPushService()
      pushService.removeAlias(alias, createCommonCallback(promise))
    }
  }

  override fun listAlias(promise: Promise?) {
    val pushService = PushServiceFactory.getCloudPushService()
    pushService.listAliases(createCommonCallback(promise, includeAliasList = true))
  }

  override fun bindTag(tags: ReadableArray?, target: Double, alias: String?, promise: Promise?) {
    if (tags == null || tags.toArrayList().isEmpty()) {
      resolveWithError(promise, CODE_PARAM_ILLEGAL, "tags can not be empty")
    } else {
      val tagsNormal = tags.toArrayList().map { it as String }.toTypedArray()
      val targetNormal = target.toInt()
      val validTarget = if (targetNormal in setOf(1, 2, 3)) targetNormal else 1
      val pushService = PushServiceFactory.getCloudPushService()
      pushService.bindTag(validTarget, tagsNormal, alias, createCommonCallback(promise))
    }
  }

  override fun unbindTag(tags: ReadableArray?, target: Double, alias: String?, promise: Promise?) {
    if (tags == null || tags.toArrayList().isEmpty()) {
      resolveWithError(promise, CODE_PARAM_ILLEGAL, "tags can not be empty")
    } else {
      val tagsNormal = tags.toArrayList().map { it as String }.toTypedArray()
      val targetNormal = target.toInt()
      val validTarget = if (targetNormal in setOf(1, 2, 3)) targetNormal else 1
      val pushService = PushServiceFactory.getCloudPushService()
      pushService.unbindTag(validTarget, tagsNormal, alias, createCommonCallback(promise))
    }
  }

  override fun listTags(target: Double, promise: Promise?) {
    val targetNormal = target.toInt()
    val validTarget = if (targetNormal in setOf(1, 2, 3)) targetNormal else 1
    val pushService = PushServiceFactory.getCloudPushService()
    pushService.listTags(validTarget, createCommonCallback(promise, includeTagList = true))
  }

  override fun initAndroidThirdPush(promise: Promise?) {
    val context = reactContext.applicationContext
    if (context is Application) {
      AliyunThirdPushUtils.registerHuaweiPush(context)
      AliyunThirdPushUtils.registerXiaoMiPush(context)
      AliyunThirdPushUtils.registerVivoPush(context)
      AliyunThirdPushUtils.registerOppoPush(context)
      AliyunThirdPushUtils.registerMeizuPush(context)
      AliyunThirdPushUtils.registerGCM(context)
      AliyunThirdPushUtils.registerHonorPush(context)
      resolveSuccess(promise)
    } else {
      resolveWithError(promise, CODE_FAILED, "context is not Application")
    }
  }

  override fun bindAndroidPhoneNumber(phone: String?, promise: Promise?) {
    if (phone.isNullOrEmpty()) {
      resolveWithError(promise, CODE_PARAM_ILLEGAL, "phone number can not be empty")
    } else {
      val pushService = PushServiceFactory.getCloudPushService()
      pushService.bindPhoneNumber(phone, createCommonCallback(promise))
    }
  }

  override fun unbindAndroidPhoneNumber(promise: Promise?) {
    val pushService = PushServiceFactory.getCloudPushService()
    pushService.unbindPhoneNumber(createCommonCallback(promise))
  }

  override fun setAndroidNotificationInGroup(inGroup: Boolean, promise: Promise?) {
    val pushService = PushServiceFactory.getCloudPushService()
    pushService.setNotificationShowInGroup(inGroup)
    resolveSuccess(promise)
  }

  override fun clearAndroidNotifications(promise: Promise?) {
    val pushService = PushServiceFactory.getCloudPushService()
    pushService.clearNotifications()
    resolveSuccess(promise)
  }

  override fun createAndroidChannel(params: ReadableMap, promise: Promise?) {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
      resolveWithError(
        promise,
        CODE_NOT_SUPPORT,
        "Android version is below Android O which is not support create channel"
      )
      return
    }

    val id = params.getString("id") ?: return resolveWithError(promise, CODE_PARAM_ILLEGAL, "id is required")
    val name = params.getString("name") ?: return resolveWithError(promise, CODE_PARAM_ILLEGAL, "name is required")
    val importance = params.getInt("importance")
    if (importance !in NotificationManager.IMPORTANCE_MIN..NotificationManager.IMPORTANCE_MAX) {
      return resolveWithError(promise, CODE_PARAM_ILLEGAL, "invalid importance level")
    }
    val desc = params.getString("desc") ?: ""
    val groupId = params.getString("groupId")
    val allowBubbles = params.getBooleanOrDefault("allowBubbles", false)
    val light = params.getBooleanOrDefault("light", false)
    val lightColor = params.getIntOrDefault("lightColor", -1)
    val showBadge = params.getBooleanOrDefault("showBadge", false)
    val soundPath = params.getString("soundPath")
    val soundUsage = params.getIntOrDefault("soundUsage", AudioAttributes.USAGE_UNKNOWN)
    val soundContentType = params.getIntOrDefault("soundContentType", AudioAttributes.CONTENT_TYPE_UNKNOWN)
    val soundFlag = params.getIntOrDefault("soundFlag", AudioAttributes.FLAG_LOW_LATENCY)
    val vibration = params.getBooleanOrDefault("vibration", false)
    val vibrationPatterns = params.getArray("vibrationPattern")?.let { array ->
      LongArray(array.size()) { i -> array.getDouble(i).toLong() }
    }

    val context = reactContext.applicationContext
    val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
    val channel = NotificationChannel(id, name, importance).apply {
      description = desc
      groupId?.let { group = it }
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
        setAllowBubbles(allowBubbles)
      }
      enableLights(light)
      if (lightColor != -1) {
        setLightColor(lightColor)
      }
      setShowBadge(showBadge)
      soundPath?.let { path ->
        File(path).takeIf { it.exists() && it.canRead() && it.isFile }?.let { file ->
          setSound(Uri.fromFile(file), if (soundUsage < 0) null else AudioAttributes.Builder()
            .setUsage(soundUsage)
            .setContentType(soundContentType)
            .setFlags(soundFlag)
            .build())
        }
      }
      enableVibration(vibration)
      vibrationPatterns?.takeIf { it.isNotEmpty() }?.let { setVibrationPattern(it) }
    }

    notificationManager.createNotificationChannel(channel)
    resolveSuccess(promise)
  }

  override fun createAndroidChannelGroup(id: String?, name: String?, desc: String?, promise: Promise?) {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
      resolveWithError(
        promise,
        CODE_NOT_SUPPORT,
        "Android version is below Android O which is not support create group"
      )
      return
    }

    if (id.isNullOrEmpty() || name.isNullOrEmpty()) {
      resolveWithError(promise, CODE_PARAM_ILLEGAL, "id and name are required")
      return
    }

    val context = reactContext.applicationContext
    val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
    val group = NotificationChannelGroup(id, name).apply {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
        description = desc
      }
    }

    notificationManager.createNotificationChannelGroup(group)
    resolveSuccess(promise)
  }

  override fun isAndroidNotificationEnabled(id: String?, promise: Promise?) {
    val context = reactContext.applicationContext
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
      if (!manager.areNotificationsEnabled()) {
        promise?.resolve(false)
        return
      }
      if (id == null) {
        promise?.resolve(true)
        return
      }
      manager.notificationChannels.find { it.id == id }?.let { channel ->
        if (channel.importance == NotificationManager.IMPORTANCE_NONE) {
          promise?.resolve(false)
          return
        }
        if (channel.group != null && Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
          manager.getNotificationChannelGroup(channel.group)?.let { group ->
            promise?.resolve(!group.isBlocked)
            return
          }
        }
        promise?.resolve(true)
        return
      }
      // Channel not found
      promise?.resolve(false)
    } else {
      promise?.resolve(NotificationManagerCompat.from(context).areNotificationsEnabled())
    }
  }

  @RequiresApi(Build.VERSION_CODES.O)
  override fun jumpToAndroidNotificationSettings(id: String?) {
    val context = reactContext.applicationContext
    val intent = if (id != null) {
      Intent(Settings.ACTION_CHANNEL_NOTIFICATION_SETTINGS).apply {
        putExtra(Settings.EXTRA_APP_PACKAGE, context.packageName)
        putExtra(Settings.EXTRA_CHANNEL_ID, id)
      }
    } else {
      Intent(Settings.ACTION_APP_NOTIFICATION_SETTINGS).apply {
        putExtra(Settings.EXTRA_APP_PACKAGE, context.packageName)
      }
    }

    if (context !is Activity) {
      intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
    }

    context.startActivity(intent)
  }

  override fun setIosBadgeNum(num: Double, promise: Promise?) {
    resolveOnlyIos(promise)
  }

  override fun syncIosBadgeNum(num: Double, promise: Promise?) {
    resolveOnlyIos(promise)
  }

  override fun showIosNoticeWhenForeground(enable: Boolean, promise: Promise?) {
    resolveOnlyIos(promise)
  }

  override fun getIosApnsDeviceToken(promise: Promise?) {
    resolveOnlyIos(promise)
  }

  override fun isIosChannelOpened(promise: Promise?) {
    resolveOnlyIos(promise)
  }

  override fun addListener(eventName: String?) {
    eventEmitter.addListener(eventName)
  }

  override fun removeListeners(count: Double) {
    eventEmitter.removeListeners()
  }

  companion object {
    const val NAME = "AliyunReactNativePush"
    private const val CODE_SUCCESS = "10000"
    private const val CODE_PARAM_ILLEGAL = "10001"
    private const val CODE_FAILED = "10002"
    private const val CODE_ONLY_IOS = "10004"
    private const val CODE_NOT_SUPPORT = "10005"
    private const val KEY_CODE = "code"
    private const val KEY_ERROR = "errorMsg"
    private const val ERROR_ONLY_IOS = "Only Support iOS"

    private fun resolveSuccess(promise: Promise?) {
      val result = WritableNativeMap()
      result.putString(KEY_CODE, CODE_SUCCESS)
      promise?.resolve(result)
    }

    private fun resolveSuccess(promise: Promise?, extraData: Map<String, String?> = emptyMap()) {
      val result = WritableNativeMap()
      result.putString(KEY_CODE, CODE_SUCCESS)
      extraData.forEach { (key, value) -> value?.let { result.putString(key, it) } }
      promise?.resolve(result)
    }

    private fun resolveWithError(promise: Promise?, errorCode: String?, errorMessage: String?) {
      val result = WritableNativeMap()
      result.putString(KEY_CODE, errorCode ?: CODE_FAILED)
      errorMessage?.let { result.putString(KEY_ERROR, it) }
      promise?.resolve(result)
    }

    private fun resolveOnlyIos(promise: Promise?) {
      val result = WritableNativeMap()
      result.putString(KEY_CODE, CODE_ONLY_IOS)
      result.putString(KEY_ERROR, ERROR_ONLY_IOS)
      promise?.resolve(result)
    }

    private fun createCommonCallback(
      promise: Promise?,
      includeAliasList: Boolean = false,
      includeTagList: Boolean = false
    ): CommonCallback {
      return object : CommonCallback {
        override fun onSuccess(response: String?) {
          if (includeAliasList) {
            resolveSuccess(promise, mapOf("aliasList" to response))
          } else if (includeTagList) {
            resolveSuccess(promise, mapOf("tagsList" to response))
          } else {
            resolveSuccess(promise)
          }
        }

        override fun onFailed(errorCode: String?, errorMsg: String?) {
          resolveWithError(promise, errorCode, errorMsg)
        }
      }
    }

    private fun ReadableMap.getBooleanOrDefault(key: String, default: Boolean): Boolean =
      if (hasKey(key)) getBoolean(key) else default

    private fun ReadableMap.getIntOrDefault(key: String, default: Int): Int =
      if (hasKey(key)) getInt(key) else default
  }
}
