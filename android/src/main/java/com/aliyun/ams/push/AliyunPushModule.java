package com.aliyun.ams.push;

import java.io.File;
import java.util.ArrayList;
import java.util.List;

import com.alibaba.sdk.android.push.CloudPushService;
import com.alibaba.sdk.android.push.CommonCallback;
import com.alibaba.sdk.android.push.noonesdk.PushServiceFactory;

import android.app.Activity;
import android.app.Application;
import android.app.NotificationChannel;
import android.app.NotificationChannelGroup;
import android.app.NotificationManager;
import android.content.Context;
import android.content.Intent;
import android.media.AudioAttributes;
import android.net.Uri;
import android.os.Build;
import android.os.Build.VERSION_CODES;
import android.provider.Settings;
import android.text.TextUtils;
import android.util.Log;
import androidx.annotation.NonNull;
import androidx.annotation.RequiresApi;
import androidx.core.app.NotificationManagerCompat;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeMap;
import com.facebook.react.module.annotations.ReactModule;

@ReactModule(name = AliyunPushModule.NAME)
public class AliyunPushModule extends ReactContextBaseJavaModule {
	public static final String NAME = "AliyunPush";

	private static final String CODE_SUCCESS = "10000";
	private static final String CODE_PARAM_ILLEGAL = "10001";
	private static final String CODE_FAILED = "10002";
	private static final String CODE_NOT_SUPPORT = "10005";

	private static final String CODE_KEY = "code";
	private static final String ERROR_MSG_KEY = "errorMsg";

	private final Context mContext;

	public static ReactContext sReactContext;

	public AliyunPushModule(ReactApplicationContext reactContext) {
		super(reactContext);
		mContext = reactContext.getApplicationContext();
		sReactContext = reactContext;
	}

	@Override
	public void invalidate() {
		super.invalidate();
		sReactContext = null;
	}

	@Override
	@NonNull
	public String getName() {
		return NAME;
	}

	@ReactMethod
	public void initPush(Promise promise) {
		PushServiceFactory.init(mContext);
		final CloudPushService pushService = PushServiceFactory.getCloudPushService();
		pushService.setLogLevel(CloudPushService.LOG_DEBUG);
		pushService.register(mContext, new CommonCallback() {
			@Override
			public void onSuccess(String response) {
				WritableMap result = new WritableNativeMap();
				result.putString(CODE_KEY, CODE_SUCCESS);
				promise.resolve(result);
			}

			@Override
			public void onFailed(String errorCode, String errorMessage) {
				WritableMap result = new WritableNativeMap();
				result.putString(CODE_KEY, errorCode);
				result.putString(ERROR_MSG_KEY, errorMessage);
				promise.resolve(result);
			}
		});
		pushService.turnOnPushChannel(new CommonCallback() {
			@Override
			public void onSuccess(String s) {

			}

			@Override
			public void onFailed(String s, String s1) {

			}
		});
	}

	@ReactMethod
	public void initThirdPush(Promise promise) {
		WritableMap result = new WritableNativeMap();
		Context context = mContext.getApplicationContext();
		if (context instanceof Application) {
			Application application = (Application) context;
			AliyunThirdPushUtils.registerHuaweiPush(application);
			AliyunThirdPushUtils.registerXiaoMiPush(application);
			AliyunThirdPushUtils.registerVivoPush(application);
			AliyunThirdPushUtils.registerOppoPush(application);
			AliyunThirdPushUtils.registerMeizuPush(application);
			AliyunThirdPushUtils.registerGCM(application);
			AliyunThirdPushUtils.registerHonorPush(application);

			result.putString(CODE_KEY, CODE_SUCCESS);
		} else {
			result.putString(CODE_KEY, CODE_FAILED);
			result.putString(ERROR_MSG_KEY, "context is not Application");
		}

		promise.resolve(result);
	}

	@ReactMethod
	public void closePushLog(Promise promise) {
		CloudPushService service = PushServiceFactory.getCloudPushService();
		service.setLogLevel(CloudPushService.LOG_OFF);
		WritableMap result = new WritableNativeMap();
		result.putString(CODE_KEY, CODE_SUCCESS);
		promise.resolve(result);
	}

	@ReactMethod
	public void getDeviceId(Promise promise) {
		final CloudPushService pushService = PushServiceFactory.getCloudPushService();
		promise.resolve(pushService.getDeviceId());
	}

	@ReactMethod
	public void setLogLevel(int level, Promise promise) {
		final CloudPushService pushService = PushServiceFactory.getCloudPushService();
		pushService.setLogLevel(level);
		WritableMap result = new WritableNativeMap();
		result.putString(CODE_KEY, CODE_SUCCESS);
		promise.resolve(result);
	}

	@ReactMethod
	public void bindAccount(String account, Promise promise) {
		WritableMap result = new WritableNativeMap();
		if (TextUtils.isEmpty(account)) {
			result.putString(CODE_KEY, CODE_PARAM_ILLEGAL);
			result.putString(ERROR_MSG_KEY, "account can not be empty");
			promise.resolve(result);
		} else {
			final CloudPushService pushService = PushServiceFactory.getCloudPushService();
			pushService.bindAccount(account, new CommonCallback() {
				@Override
				public void onSuccess(String response) {
					result.putString(CODE_KEY, CODE_SUCCESS);
					promise.resolve(result);
				}

				@Override
				public void onFailed(String errorCode, String errorMsg) {
					result.putString(CODE_KEY, errorCode);
					result.putString(ERROR_MSG_KEY, errorMsg);
					promise.resolve(result);
				}
			});
		}
	}

	@ReactMethod
	public void unbindAccount(Promise promise) {
		WritableMap result = new WritableNativeMap();
		final CloudPushService pushService = PushServiceFactory.getCloudPushService();
		pushService.unbindAccount(new CommonCallback() {
			@Override
			public void onSuccess(String response) {
				result.putString(CODE_KEY, CODE_SUCCESS);
				promise.resolve(result);
			}

			@Override
			public void onFailed(String errorCode, String errorMsg) {
				result.putString(CODE_KEY, errorCode);
				result.putString(ERROR_MSG_KEY, errorMsg);
				promise.resolve(result);
			}
		});
	}

	@ReactMethod
	public void addAlias(String alias, Promise promise) {
		WritableMap result = new WritableNativeMap();
		if (TextUtils.isEmpty(alias)) {
			result.putString(CODE_KEY, CODE_PARAM_ILLEGAL);
			result.putString(ERROR_MSG_KEY, "alias can not be empty");
			promise.resolve(result);
		} else {
			final CloudPushService pushService = PushServiceFactory.getCloudPushService();
			pushService.addAlias(alias, new CommonCallback() {
				@Override
				public void onSuccess(String response) {
					result.putString(CODE_KEY, CODE_SUCCESS);
					promise.resolve(result);
				}

				@Override
				public void onFailed(String errorCode, String errorMsg) {
					result.putString(CODE_KEY, errorCode);
					result.putString(ERROR_MSG_KEY, errorMsg);
					promise.resolve(result);
				}
			});
		}
	}

	@ReactMethod
	public void removeAlias(String alias, Promise promise) {
		WritableMap result = new WritableNativeMap();
		if (TextUtils.isEmpty(alias)) {
			result.putString(CODE_KEY, CODE_PARAM_ILLEGAL);
			result.putString(ERROR_MSG_KEY, "alias can not be empty");
			promise.resolve(result);
		} else {
			final CloudPushService pushService = PushServiceFactory.getCloudPushService();
			pushService.removeAlias(alias, new CommonCallback() {
				@Override
				public void onSuccess(String response) {
					result.putString(CODE_KEY, CODE_SUCCESS);
					promise.resolve(result);
				}

				@Override
				public void onFailed(String errorCode, String errorMsg) {
					result.putString(CODE_KEY, errorCode);
					result.putString(ERROR_MSG_KEY, errorMsg);
					promise.resolve(result);
				}
			});
		}
	}

	@ReactMethod
	public void listAlias(Promise promise) {
		WritableMap result = new WritableNativeMap();
		final CloudPushService pushService = PushServiceFactory.getCloudPushService();
		pushService.listAliases(new CommonCallback() {
			@Override
			public void onSuccess(String response) {
				result.putString(CODE_KEY, CODE_SUCCESS);
				result.putString("aliasList", response);
				promise.resolve(result);
			}

			@Override
			public void onFailed(String errorCode, String errorMsg) {
				result.putString(CODE_KEY, errorCode);
				result.putString(ERROR_MSG_KEY, errorMsg);
				promise.resolve(result);
			}
		});
	}

	@ReactMethod
	public void bindTag(ReadableArray tagsArr, int target, String alias, Promise promise) {
		WritableMap result = new WritableNativeMap();
		if (tagsArr == null) {
			result.putString(CODE_KEY, CODE_PARAM_ILLEGAL);
			result.putString(ERROR_MSG_KEY, "tags can not be empty");
			promise.resolve(result);
			return;
		}
		ArrayList<Object> tags = tagsArr.toArrayList();
		if (tags.isEmpty()) {
			result.putString(CODE_KEY, CODE_PARAM_ILLEGAL);
			result.putString(ERROR_MSG_KEY, "tags can not be empty");
			promise.resolve(result);
		} else {
			if (target != 1 && target != 2 && target != 3) {
				// 默认本设备
				target = 1;
			}
			String[] tagsArray = new String[tags.size()];
			for (int i = 0; i < tags.size(); i++) {
				String tag = (String)tags.get(i);
				tagsArray[i] = tag;
			}
			final CloudPushService pushService = PushServiceFactory.getCloudPushService();
			pushService.bindTag(target, tagsArray, alias, new CommonCallback() {
				@Override
				public void onSuccess(String response) {
					result.putString(CODE_KEY, CODE_SUCCESS);
					promise.resolve(result);
				}

				@Override
				public void onFailed(String errorCode, String errorMsg) {
					result.putString(CODE_KEY, errorCode);
					result.putString(ERROR_MSG_KEY, errorMsg);
					promise.resolve(result);
				}
			});
		}
	}

	@ReactMethod
	public void unbindTag(ReadableArray tagsArr, int target, String alias, Promise promise) {
		WritableMap result = new WritableNativeMap();
		if (tagsArr == null) {
			result.putString(CODE_KEY, CODE_PARAM_ILLEGAL);
			result.putString(ERROR_MSG_KEY, "tags can not be empty");
			promise.resolve(result);
			return;
		}
		ArrayList<Object> tags = tagsArr.toArrayList();
		if (tags.isEmpty()) {
			result.putString(CODE_KEY, CODE_PARAM_ILLEGAL);
			result.putString(ERROR_MSG_KEY, "tags can not be empty");
			promise.resolve(result);
		} else {
			if (target != 1 && target != 2 && target != 3) {
				// 默认本设备
				target = 1;
			}
			String[] tagsArray = new String[tags.size()];
			for (int i = 0; i < tags.size(); i++) {
				String tag = (String)tags.get(i);
				tagsArray[i] = tag;
			}
			final CloudPushService pushService = PushServiceFactory.getCloudPushService();
			pushService.unbindTag(target, tagsArray, alias, new CommonCallback() {
				@Override
				public void onSuccess(String response) {
					result.putString(CODE_KEY, CODE_SUCCESS);
					promise.resolve(result);
				}

				@Override
				public void onFailed(String errorCode, String errorMsg) {
					result.putString(CODE_KEY, errorCode);
					result.putString(ERROR_MSG_KEY, errorMsg);
					promise.resolve(result);
				}
			});
		}
	}

	@ReactMethod
	public void listTags(int target, Promise promise) {
		if (target != 1 && target != 2 && target != 3) {
			// 默认本设备
			target = 1;
		}
		WritableMap result = new WritableNativeMap();
		final CloudPushService pushService = PushServiceFactory.getCloudPushService();
		pushService.listTags(target, new CommonCallback() {
			@Override
			public void onSuccess(String response) {
				result.putString(CODE_KEY, CODE_SUCCESS);
				result.putString("tagsList", response);
				promise.resolve(result);
			}

			@Override
			public void onFailed(String errorCode, String errorMsg) {
				result.putString(CODE_KEY, errorCode);
				result.putString(ERROR_MSG_KEY, errorMsg);
				promise.resolve(result);
			}
		});
	}

	@ReactMethod
	public void bindPhoneNumber(String phone, Promise promise) {
		WritableMap result = new WritableNativeMap();
		if (TextUtils.isEmpty(phone)) {
			result.putString(CODE_KEY, CODE_PARAM_ILLEGAL);
			result.putString(ERROR_MSG_KEY, "phone number can not be empty");
			promise.resolve(result);
		} else {
			final CloudPushService pushService = PushServiceFactory.getCloudPushService();
			pushService.bindPhoneNumber(phone, new CommonCallback() {
				@Override
				public void onSuccess(String response) {
					result.putString(CODE_KEY, CODE_SUCCESS);
					promise.resolve(result);
				}

				@Override
				public void onFailed(String errorCode, String errorMsg) {
					result.putString(CODE_KEY, errorCode);
					result.putString(ERROR_MSG_KEY, errorMsg);
					promise.resolve(result);
				}
			});
		}
	}

	@ReactMethod
	public void unbindPhoneNumber(Promise promise) {
		WritableMap result = new WritableNativeMap();

		final CloudPushService pushService = PushServiceFactory.getCloudPushService();
		pushService.unbindPhoneNumber(new CommonCallback() {
			@Override
			public void onSuccess(String response) {
				result.putString(CODE_KEY, CODE_SUCCESS);
				promise.resolve(result);
			}

			@Override
			public void onFailed(String errorCode, String errorMsg) {
				result.putString(CODE_KEY, errorCode);
				result.putString(ERROR_MSG_KEY, errorMsg);
				promise.resolve(result);
			}
		});
	}

	@ReactMethod
	public void setNotificationInGroup(boolean inGroup, Promise promise) {
		final CloudPushService pushService = PushServiceFactory.getCloudPushService();
		pushService.setNotificationShowInGroup(inGroup);
		WritableMap result = new WritableNativeMap();
		result.putString(CODE_KEY, CODE_SUCCESS);
		promise.resolve(result);
	}

	@ReactMethod
	public void clearNotifications(Promise promise) {
		final CloudPushService pushService = PushServiceFactory.getCloudPushService();
		pushService.clearNotifications();
		WritableMap result = new WritableNativeMap();
		result.putString(CODE_KEY, CODE_SUCCESS);
		promise.resolve(result);
	}

	@ReactMethod
	public void createChannel(ReadableMap params, Promise promise) {
		WritableMap result = new WritableNativeMap();
		if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {

			String id = params.getString("id");
			String name = params.getString("name");
			int importance = params.getInt("importance");
			String desc = params.getString("desc");
			String groupId = null;
			if (params.hasKey("groupId")) {
				groupId = params.getString("groupId");
			}
			boolean allowBubbles = false;
			if (params.hasKey("allowBubbles")) {
				allowBubbles = params.getBoolean("allowBubbles");
			}
			boolean light = false;
			if (params.hasKey("light")) {
				light = params.getBoolean("light");
			}

			int color = -1;
			if (params.hasKey("lightColor")) {
				color = params.getInt("lightColor");
			}
			boolean showBadge = false;
			if (params.hasKey("showBadge")) {
				showBadge = params.getBoolean("showBadge");
			}
			String soundPath = null;
			if (params.hasKey("soundPath")) {
				soundPath = params.getString("soundPath");
			}

			int soundUsage = AudioAttributes.USAGE_UNKNOWN;
			if (params.hasKey("soundUsage")) {
				soundUsage = params.getInt("soundUsage");
			}
			int soundContentType = AudioAttributes.CONTENT_TYPE_UNKNOWN;
			if (params.hasKey("soundContentType")) {
				soundContentType = params.getInt("soundContentType");
			}
			int soundFlag = AudioAttributes.FLAG_LOW_LATENCY;
			if (params.hasKey("soundFlag")) {
				soundFlag = params.getInt("soundFlag");
			}
			boolean vibration = false;
			if (params.hasKey("vibration")) {
				vibration = params.getBoolean("vibration");
			}
			long[] vibrationPatterns = null;
			if (params.hasKey("vibrationPattern")) {
				ReadableArray readableArray = params.getArray("vibrationPattern");
				if (readableArray != null) {
					vibrationPatterns = new long[readableArray.size()];
					if (readableArray.size() != 0) {
						for (int i = 0; i < readableArray.size(); i++) {
							double pattern = readableArray.getDouble(i);
							vibrationPatterns[i] = Math.round(pattern);
						}
					}
				}
			}

			NotificationManager notificationManager = (NotificationManager) mContext
					.getSystemService(Context.NOTIFICATION_SERVICE);
			NotificationChannel channel = new NotificationChannel(id, name, importance);
			channel.setDescription(desc);
			if (groupId != null) {
				channel.setGroup(groupId);
			}
			if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
				channel.setAllowBubbles(allowBubbles);
			}
			channel.enableLights(light);
			if (color != -1) {
				channel.setLightColor(color);
			}
			channel.setShowBadge(showBadge);
			if (!TextUtils.isEmpty(soundPath)) {
				File file = new File(soundPath);
				if (file.exists() && file.canRead() && file.isFile()) {
					if (soundUsage < 0) {
						channel.setSound(Uri.fromFile(file), null);
					} else {
						AudioAttributes.Builder builder = new AudioAttributes.Builder()
								.setUsage(soundUsage);
						builder.setContentType(soundContentType);
						builder.setFlags(soundFlag);
						channel.setSound(Uri.fromFile(file), builder.build());
					}
				}
			}
			channel.enableVibration(vibration);
			if (vibrationPatterns != null && vibrationPatterns.length > 0) {
				channel.setVibrationPattern(vibrationPatterns);
			}
			notificationManager.createNotificationChannel(channel);
			result.putString(CODE_KEY, CODE_SUCCESS);

		} else {
			result.putString(CODE_KEY, CODE_NOT_SUPPORT);
			result.putString(ERROR_MSG_KEY,
					"Android version is below Android O which is not support create channel");
		}
		promise.resolve(result);
	}

	@ReactMethod
	public void createGroup(String id, String name, String desc, Promise promise) {
		WritableMap result = new WritableNativeMap();
		if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {

			NotificationManager notificationManager = (NotificationManager) mContext
					.getSystemService(Context.NOTIFICATION_SERVICE);
			NotificationChannelGroup group = new NotificationChannelGroup(id, name);
			if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
				group.setDescription(desc);
			}
			notificationManager.createNotificationChannelGroup(group);
			result.putString(CODE_KEY, CODE_SUCCESS);
		} else {
			result.putString(CODE_KEY, CODE_NOT_SUPPORT);
			result.putString(ERROR_MSG_KEY,
					"Android version is below Android O which is not support create group");
		}
		promise.resolve(result);
	}

	@ReactMethod
	public void isNotificationEnabled(String id, Promise promise) {
		if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
			NotificationManager manager = (NotificationManager) mContext.getSystemService(
					Context.NOTIFICATION_SERVICE);
			if (!manager.areNotificationsEnabled()) {
				promise.resolve(false);
				return;
			}
			if (id == null) {
				promise.resolve(true);
				return;
			}
			List<NotificationChannel> channels = manager.getNotificationChannels();
			for (NotificationChannel channel : channels) {
				if (channel.getId().equals(id)) {
					if (channel.getImportance() == NotificationManager.IMPORTANCE_NONE) {
						promise.resolve(false);
						return;
					} else {
						if (channel.getGroup() != null) {
							if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.P) {
								NotificationChannelGroup group = manager
										.getNotificationChannelGroup(channel.getGroup());
								promise.resolve(!group.isBlocked());
								return;
							}
						}
						promise.resolve(true);
						return;
					}
				}
			}
			// channel 未定义，返回false
			promise.resolve(false);
		} else {
			promise.resolve(NotificationManagerCompat.from(mContext).areNotificationsEnabled());
		}
	}

	@RequiresApi(api = VERSION_CODES.O)
	@ReactMethod
	public void jumpToNotificationSettings(String id) {
		Intent intent;
		if (id != null) {
			intent = new Intent(Settings.ACTION_CHANNEL_NOTIFICATION_SETTINGS);
			intent.putExtra(Settings.EXTRA_APP_PACKAGE, mContext.getPackageName());
			intent.putExtra(Settings.EXTRA_CHANNEL_ID, id);
		} else {
			// 跳转到应用的通知设置界面
			intent = new Intent(Settings.ACTION_APP_NOTIFICATION_SETTINGS);
			intent.putExtra(Settings.EXTRA_APP_PACKAGE, mContext.getPackageName());
		}
		if (!(mContext instanceof Activity)) {
			intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
		}
		mContext.startActivity(intent);
	}

	@ReactMethod
	public void setPluginLogEnabled(boolean enabled) {
		AliyunPushLog.setLogEnabled(enabled);
	}
}
