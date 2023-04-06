package com.aliyun.ams.push;

import android.util.Log;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

/**
 * @author wangyun
 * @date 2023/3/3
 */
public class AliyunPushEventSender {
	public static void sendEvent(String eventName, WritableMap params) {
		try {
			if (AliyunPushModule.sReactContext != null) {
				AliyunPushModule.sReactContext.getJSModule(
					DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit("AliyunPush_" + eventName, params);
			}
		} catch (Exception e) {
			AliyunPushLog.e("AliyunPush", Log.getStackTraceString(e));
		}
	}
}
