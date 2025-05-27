package com.aliyun.ams.push

import android.app.Application
import android.content.Context
import android.content.pm.PackageManager
import com.alibaba.sdk.android.push.HonorRegister
import com.alibaba.sdk.android.push.huawei.HuaWeiRegister
import com.alibaba.sdk.android.push.register.GcmRegister
import com.alibaba.sdk.android.push.register.MeizuRegister
import com.alibaba.sdk.android.push.register.MiPushRegister
import com.alibaba.sdk.android.push.register.OppoRegister
import com.alibaba.sdk.android.push.register.VivoRegister

object AliyunThirdPushUtils {

  fun registerGCM(application: Application) {
    val sendId = getGCMSendId(application)
    val applicationId = getGCMApplicationId(application)
    val projectId = getGCMProjectId(application)
    val apiKey = getGCMApiKey(application)

    if (sendId != null && applicationId != null && projectId != null && apiKey != null) {
      GcmRegister.register(application, sendId, applicationId, projectId, apiKey)
    }
  }

  fun registerMeizuPush(application: Application) {
    val meizuId = getMeizuPushId(application)
    val meizuKey = getMeizuPushKey(application)

    if (meizuId != null && meizuKey != null) {
      MeizuRegister.register(application, meizuId, meizuKey)
    }
  }

  fun registerOppoPush(application: Application) {
    val oppoKey = getOppoPushKey(application)
    val oppoSecret = getOppoPushSecret(application)

    if (oppoKey != null && oppoSecret != null) {
      OppoRegister.register(application, oppoKey, oppoSecret)
    }
  }

  fun registerXiaoMiPush(application: Application) {
    val xiaoMiId = getXiaoMiId(application)
    val xiaoMiKey = getXiaoMiKey(application)

    if (xiaoMiId != null && xiaoMiKey != null) {
      MiPushRegister.register(application, xiaoMiId, xiaoMiKey)
    }
  }

  fun registerVivoPush(application: Application) {
    val vivoApiKey = getVivoApiKey(application)
    val vivoAppId = getVivoAppId(application)
    if (vivoApiKey != null && vivoAppId != null) {
      VivoRegister.register(application)
    }
  }

  fun registerHuaweiPush(application: Application) {
    val huaweiAppId = getHuaWeiAppId(application)
    if (!huaweiAppId.isNullOrBlank()) {
      HuaWeiRegister.register(application)
    }
  }

  fun registerHonorPush(application: Application) {
    val honorAppId = getHonorAppId(application)
    if (honorAppId != null) {
      HonorRegister.register(application)
    }
  }

  // Private methods
  private fun getAppMetaDataWithId(context: Context, key: String): String? {
    val value = getAppMetaData(context, key)
    return value?.let { if (it.startsWith("id=")) it.replace("id=", "") else it }
  }

  private fun getAppMetaData(context: Context, key: String): String? {
    return try {
      val packageManager = context.packageManager
      val packageName = context.packageName
      val info = packageManager.getApplicationInfo(packageName, PackageManager.GET_META_DATA)
      info.metaData?.getString(key)
    } catch (e: PackageManager.NameNotFoundException) {
      e.printStackTrace()
      null
    }
  }

  private fun getGCMSendId(context: Context): String? {
    return getAppMetaDataWithId(context, "com.gcm.push.sendid")
  }

  private fun getGCMApplicationId(context: Context): String? {
    return getAppMetaDataWithId(context, "com.gcm.push.applicationid")
  }

  private fun getGCMProjectId(context: Context): String? {
    return getAppMetaDataWithId(context, "com.gcm.push.projectid")
  }

  private fun getGCMApiKey(context: Context): String? {
    return getAppMetaDataWithId(context, "com.gcm.push.api.key")
  }

  private fun getMeizuPushId(context: Context): String? {
    return getAppMetaDataWithId(context, "com.meizu.push.id")
  }

  private fun getMeizuPushKey(context: Context): String? {
    return getAppMetaDataWithId(context, "com.meizu.push.key")
  }

  private fun getOppoPushKey(context: Context): String? {
    return getAppMetaDataWithId(context, "com.oppo.push.key")
  }

  private fun getOppoPushSecret(context: Context): String? {
    return getAppMetaDataWithId(context, "com.oppo.push.secret")
  }

  private fun getXiaoMiId(context: Context): String? {
    return getAppMetaDataWithId(context, "com.xiaomi.push.id")
  }

  private fun getXiaoMiKey(context: Context): String? {
    return getAppMetaDataWithId(context, "com.xiaomi.push.key")
  }

  private fun getVivoApiKey(context: Context): String? {
    return getAppMetaData(context, "com.vivo.push.api_key")
  }

  private fun getVivoAppId(context: Context): String? {
    return getAppMetaData(context, "com.vivo.push.app_id")
  }

  private fun getHuaWeiAppId(context: Context): String? {
    return getAppMetaData(context, "com.huawei.hms.client.appid")
  }

  private fun getHonorAppId(context: Context): String? {
    return getAppMetaData(context, "com.hihonor.push.app_id")
  }
}
