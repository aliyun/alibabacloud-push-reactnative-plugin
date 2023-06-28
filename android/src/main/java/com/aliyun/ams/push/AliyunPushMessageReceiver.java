package com.aliyun.ams.push;

import java.util.HashMap;
import java.util.Map;
import java.util.Map.Entry;

import com.alibaba.sdk.android.push.MessageReceiver;
import com.alibaba.sdk.android.push.notification.CPushMessage;
import com.alibaba.sdk.android.push.notification.NotificationConfigure;
import com.alibaba.sdk.android.push.notification.PushData;

import android.app.Notification;
import android.content.Context;
import androidx.core.app.NotificationCompat;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeMap;

/**
 * @author wangyun
 * @date 2023/1/12
 */

public class AliyunPushMessageReceiver extends MessageReceiver {

	// 消息接收部分的LOG_TAG
	public static final String REC_TAG = "MPS:receiver";

	@Override
	public NotificationConfigure hookNotificationBuild() {
		return new NotificationConfigure() {
			@Override
			public void configBuilder(Notification.Builder builder, PushData pushData) {
				AliyunPushLog.e(REC_TAG, "configBuilder");
			}

			@Override
			public void configBuilder(NotificationCompat.Builder builder, PushData pushData) {
				AliyunPushLog.e(REC_TAG, "configBuilder");
			}

			@Override
			public void configNotification(Notification notification, PushData pushData) {
				AliyunPushLog.e(REC_TAG, "configNotification");
			}
		};
	}

	@Override
	public boolean showNotificationNow(Context context, Map<String, String> map) {
		AliyunPushLog.e(REC_TAG, "foreground " + com.alibaba.sdk.android.push.notification.e.a(context));
		AliyunPushLog.e(REC_TAG,
			"show when foreground " + com.alibaba.sdk.android.push.notification.d.a(map));
		for (Map.Entry<String, String> entry : map.entrySet()) {
			AliyunPushLog.e(REC_TAG, "key " + entry.getKey() + " value " + entry.getValue());
		}

		return super.showNotificationNow(context, map);
	}

	/**
	 * 推送通知的回调方法
	 *
	 * @param context
	 * @param title
	 * @param summary
	 * @param extraMap
	 */
	@Override
	public void onNotification(Context context, String title, String summary,
							   Map<String, String> extraMap) {

		WritableMap writableMap = new WritableNativeMap();
		if (extraMap != null && !extraMap.isEmpty()) {
			for (Entry<String, String> entry: extraMap.entrySet()) {
				writableMap.putString(entry.getKey(), entry.getValue());
			}
		}
		writableMap.putString("title", title);
		writableMap.putString("summary", summary);
		AliyunPushEventSender.sendEvent("onNotification", writableMap);
	}

	/**
	 * 应用处于前台时通知到达回调。注意:该方法仅对自定义样式通知有效,相关详情请参考https://help.aliyun.com/document_detail/30066
	 * .html?spm=5176.product30047.6.620.wjcC87#h3-3-4-basiccustompushnotification-api
	 *
	 * @param context
	 * @param title
	 * @param summary
	 * @param extraMap
	 * @param openType
	 * @param openActivity
	 * @param openUrl
	 */
	@Override
	protected void onNotificationReceivedInApp(Context context, String title, String summary,
											   Map<String, String> extraMap, int openType,
											   String openActivity, String openUrl) {
		WritableMap writableMap = new WritableNativeMap();
		if (extraMap != null && !extraMap.isEmpty()) {
			for (Entry<String, String> entry: extraMap.entrySet()) {
				writableMap.putString(entry.getKey(), entry.getValue());
			}
		}
		writableMap.putString("title", title);
		writableMap.putString("summary", summary);
		writableMap.putString("openType", openType + "");
		writableMap.putString("openActivity", openActivity);
		writableMap.putString("openUrl", openUrl);
		AliyunPushEventSender.sendEvent("onNotificationReceivedInApp", writableMap);
	}

	/**
	 * 推送消息的回调方法
	 *
	 * @param context
	 * @param cPushMessage
	 */
	@Override
	public void onMessage(Context context, CPushMessage cPushMessage) {
		WritableMap writableMap = new WritableNativeMap();
		writableMap.putString("title", cPushMessage.getTitle());
		writableMap.putString("content", cPushMessage.getContent());
		writableMap.putString("msgId", cPushMessage.getMessageId());
		writableMap.putString("appId", cPushMessage.getAppId());
		writableMap.putString("traceInfo", cPushMessage.getTraceInfo());
		AliyunPushEventSender.sendEvent("onMessage", writableMap);
	}

	/**
	 * 从通知栏打开通知的扩展处理
	 *
	 * @param context
	 * @param title
	 * @param summary
	 * @param extraMap
	 */
	@Override
	public void onNotificationOpened(Context context, String title, String summary,
									 String extraMap) {
		WritableMap writableMap = new WritableNativeMap();
		writableMap.putString("title", title);
		writableMap.putString("summary", summary);
		writableMap.putString("extraMap", extraMap);
		AliyunPushEventSender.sendEvent("onNotificationOpened", writableMap);
	}

	/**
	 * 通知删除回调
	 *
	 * @param context
	 * @param messageId
	 */
	@Override
	public void onNotificationRemoved(Context context, String messageId) {
		WritableMap writableMap = new WritableNativeMap();
		writableMap.putString("msgId", messageId);
		AliyunPushEventSender.sendEvent("onNotificationRemoved", writableMap);
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
	@Override
	protected void onNotificationClickedWithNoAction(Context context, String title, String summary
		, String extraMap) {
		WritableMap writableMap = new WritableNativeMap();
		writableMap.putString("title", title);
		writableMap.putString("summary", summary);
		writableMap.putString("extraMap", extraMap);
		AliyunPushEventSender.sendEvent("onNotificationClickedWithNoAction", writableMap);
	}
}