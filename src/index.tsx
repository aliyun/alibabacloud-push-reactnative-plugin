/* eslint-disable prettier/prettier */
import {
  NativeModules,
  Platform,
  DeviceEventEmitter,
  NativeEventEmitter,
  EmitterSubscription,
} from 'react-native';

export const kAliyunPushSuccessCode = '10000';

///参数错误
export const kAliyunPushParamsIllegal = '10001';

export const kAliyunPushFailedCode = '10002';

export const kAliyunPushOnlyAndroid = '10003';

export const kAliyunPushOnlyIOS = '10004';

///平台不支持，比如Android创建group只支持Android 8.0以上版本
export const kAliyunPushNotSupport = '10005';

///本设备
export const kAliyunTargetDevice = 1;

///本设备绑定账号
export const kAliyunTargetAccount = 2;

///别名
export const kAliyunTargetAlias = 3;

export const kAliyunPushLogLevelError = 0;
export const kAliyunPushLogLevelInfo = 1;
export const kAliyunPushLogLevelDebug = 2;

const LINKING_ERROR =
  `The package 'aliyun-react-native-push' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

const AliyunPush = NativeModules.AliyunPush
  ? NativeModules.AliyunPush
  : new Proxy(
    {},
    {
      get() {
        throw new Error(LINKING_ERROR);
      },
    }
  );

export interface PushResult {
  code: string;
  errorMsg?: string;
  aliasList?: string;
  tagsList?: string;
}

export function initPush(
  appKey?: string,
  appSecret?: string
): Promise<PushResult> {
  if (Platform.OS === 'ios') {
    return AliyunPush.initPush(appKey, appSecret);
  } else {
    return AliyunPush.initPush();
  }
}

export function initAndroidThirdPush(): Promise<PushResult> {
  if (Platform.OS === 'ios') {
    let result = {
      code: kAliyunPushOnlyAndroid,
      errorMsg: 'Only Support Android',
    };
    return new Promise((resolve, _) => {
      resolve(result);
    });
  }
  return AliyunPush.initThirdPush();
}

export function getDeviceId(): Promise<string> {
  return AliyunPush.getDeviceId();
}

export function closeAndroidPushLog(): Promise<PushResult> {
  if (Platform.OS === 'ios') {
    let result = {
      code: kAliyunPushOnlyAndroid,
      errorMsg: 'Only Support Android',
    };
    return new Promise((resolve, _) => {
      resolve(result);
    });
  }

  return AliyunPush.closePushLog();
}

export function setAndroidLogLevel(level: number): Promise<PushResult> {
  if (Platform.OS === 'ios') {
    let result = {
      code: kAliyunPushOnlyAndroid,
      errorMsg: 'Only Support Android',
    };
    return new Promise((resolve, _) => {
      resolve(result);
    });
  }
  return AliyunPush.setLogLevel(level);
}

/* 通用方法 */

/*
 * 绑定账户
 */
export function bindAccount(account: string): Promise<PushResult> {
  return AliyunPush.bindAccount(account);
}
/*
 * 解绑账户
 */
export function unbindAccount(): Promise<PushResult> {
  return AliyunPush.unbindAccount();
}
/*
 * 添加别名
 */
export function addAlias(alias: string): Promise<PushResult> {
  return AliyunPush.addAlias(alias);
}

/*
 * 删除别名
 */
export function removeAlias(alias: string): Promise<PushResult> {
  return AliyunPush.removeAlias(alias);
}

/*
 * 查询绑定别名
 */
export function listAlias(): Promise<PushResult> {
  return AliyunPush.listAlias();
}

/*
 * 添加标签
 */
export function bindTag(
  tags: string[],
  target = kAliyunTargetDevice,
  alias?: string
): Promise<PushResult> {
  return AliyunPush.bindTag(tags, target, alias);
}

/*
 * 移除标签
 */
export function unbindTag(
  tags: string[],
  target = kAliyunTargetDevice,
  alias?: string
): Promise<PushResult> {
  return AliyunPush.unbindTag(tags, target, alias);
}

/*
 * 移除标签
 */
export function listTags(target = kAliyunTargetDevice): Promise<PushResult> {
  return AliyunPush.listTags(target);
}

/*
 * 绑定手机号码
 */
export function bindPhoneNumber(phone: string): Promise<PushResult> {
  if (Platform.OS === 'ios') {
    let result = {
      code: kAliyunPushOnlyAndroid,
      errorMsg: 'Only Support Android',
    };
    const promise = new Promise<PushResult>((resolve, _) => {
      resolve(result);
    });
    return promise;
  }
  return AliyunPush.bindPhoneNumber(phone);
}

/*
 * 解绑手机号码
 */
export function unbindPhoneNumber(): Promise<PushResult> {
  if (Platform.OS === 'ios') {
    let result = {
      code: kAliyunPushOnlyAndroid,
      errorMsg: 'Only Support Android',
    };
    const promise = new Promise<PushResult>((resolve, _) => {
      resolve(result);
    });
    return promise;
  }
  return AliyunPush.unbindPhoneNumber();
}

/*
 * 设置通知分组展示，只针对android
 */
export function setNotificationInGroup(inGroup: boolean): Promise<PushResult> {
  if (Platform.OS === 'ios') {
    let result = {
      code: kAliyunPushOnlyAndroid,
      errorMsg: 'Only Support Android',
    };
    const promise = new Promise<PushResult>((resolve, _) => {
      resolve(result);
    });
    return promise;
  }
  return AliyunPush.setNotificationInGroup(inGroup);
}

/*
 * 清楚所有通知
 */
export function clearAndroidNotifications(): Promise<PushResult> {
  if (Platform.OS === 'ios') {
    let result = {
      code: kAliyunPushOnlyAndroid,
      errorMsg: 'Only Support Android',
    };
    const promise = new Promise<PushResult>((resolve, _) => {
      resolve(result);
    });
    return promise;
  }

  return AliyunPush.clearNotifications();
}

/*
 * 创建Android平台的NotificationChannel
 */
export function createAndroidChannel(params: any): Promise<PushResult> {
  if (Platform.OS === 'ios') {
    let result = {
      code: kAliyunPushOnlyAndroid,
      errorMsg: 'Only Support Android',
    };
    const promise = new Promise<PushResult>((resolve, _) => {
      resolve(result);
    });
    return promise;
  }

  return AliyunPush.createChannel(params);
}

/*
 * 创建通知通道的分组
 */
export function createAndroidChannelGroup(
  id: string,
  name: string,
  desc: string
): Promise<PushResult> {
  if (Platform.OS === 'ios') {
    let result = {
      code: kAliyunPushOnlyAndroid,
      errorMsg: 'Only Support Android',
    };
    const promise = new Promise<PushResult>((resolve, _) => {
      resolve(result);
    });
    return promise;
  }

  return AliyunPush.createChannelGroup(id, name, desc);
}

/*
 * 创建通知通道的分组
 */
export function isAndroidNotificationEnabled(id?: string): Promise<boolean> {
  if (Platform.OS === 'ios') {
    return new Promise((resolve, _) => {
      resolve(false);
    });
  }

  return AliyunPush.isNotificationEnabled(id);
}

/*
 * 跳转到通知设置页面
 */
export function jumpToAndroidNotificationSettings(id?: string) {
  if (Platform.OS === 'ios') {
    return;
  }
  AliyunPush.jumpToNotificationSettings(id);
}

/*
 * 开启iOS的debug日志
 */
export function turnOnIOSDebug(): Promise<PushResult> {
  if (Platform.OS !== 'ios') {
    let result = {
      code: kAliyunPushOnlyIOS,
      errorMsg: 'Only Support iOS',
    };
    return new Promise((resolve, _) => {
      resolve(result);
    });
  }

  return AliyunPush.turnOnDebug();
}

export function setIOSBadgeNum(num: number): Promise<PushResult> {
  if (Platform.OS !== 'ios') {
    let result = {
      code: kAliyunPushOnlyIOS,
      errorMsg: 'Only Support iOS',
    };
    return new Promise((resolve, _) => {
      resolve(result);
    });
  }

  return AliyunPush.setBadgeNum(num);
}

export function syncIOSBadgeNum(num: number): Promise<PushResult> {
  if (Platform.OS !== 'ios') {
    let result = {
      code: kAliyunPushOnlyIOS,
      errorMsg: 'Only Support iOS',
    };
    return new Promise((resolve, _) => {
      resolve(result);
    });
  }

  return AliyunPush.syncBadgeNum(num);
}

export function getApnsDeviceToken(): Promise<string> {
  if (Platform.OS !== 'ios') {
    return new Promise((resolve, _) => {
      resolve('Only Support iOS');
    });
  }

  return AliyunPush.getApnsDeviceToken();
}

export function isIOSChannelOpened(): Promise<boolean> {
  if (Platform.OS !== 'ios') {
    return new Promise((resolve, _) => {
      resolve(false);
    });
  }

  return AliyunPush.isChannelOpened();
}

export function showNoticeWhenForeground(
  enabled: boolean
): Promise<PushResult> {
  if (Platform.OS !== 'ios') {
    let result = {
      code: kAliyunPushOnlyIOS,
      errorMsg: 'Only Support iOS',
    };
    return new Promise((resolve, _) => {
      resolve(result);
    });
  }

  return AliyunPush.showNoticeWhenForeground(enabled);
}

export function setPluginLogEnabled(enabled: boolean): void {
  AliyunPush.setPluginLogEnabled(enabled);
}

export type PushCallback = (event: any) => void;

/*
 * 推送通知的回调方法
 */
let _onNotificationListener: EmitterSubscription | null;
/*
 * 应用处于前台时通知到达回调 - 仅针对Android
 */
let _onNotificationReceivedInAppListener: EmitterSubscription | null;
/*
 * 推送消息的回调方法
 */
let _onMessageListener: EmitterSubscription | null;

/*
 * 从通知栏打开通知的扩展处理
 */
let _onNotificationOpenedListener: EmitterSubscription | null;

/*
 * 通知删除回调
 */
let _onNotificationRemovedListener: EmitterSubscription | null;

/*
 * 无动作通知点击回调。当在后台或阿里云控制台指定的通知动作为无逻辑跳转时,
 * 通知点击回调为onNotificationClickedWithNoAction而不是onNotificationOpened
 */
let _onNotificationClickedWithNoAction: EmitterSubscription | null;

/*
 * iOS APNs注册成功回调
 */
let _onRegisterDeviceTokenSuccessListener: EmitterSubscription | null;

/*
 * iOS APNs注册失败回调
 */
let _onRegisterDeviceTokenFailedListener: EmitterSubscription | null;

/*
 * iOS通知渠道打开回调
 */
let _onChannelOpenedListener: EmitterSubscription | null;

const pushManagerEmitter = new NativeEventEmitter(AliyunPush);

export function addNotificationCallback(callback: PushCallback) {
  _onNotificationListener = pushManagerEmitter.addListener(
    'AliyunPush_onNotification',
    (event) => {
      callback(event);
    }
  );
}

export function addNotificationReceivedInApp(callback: PushCallback) {
  _onNotificationReceivedInAppListener = DeviceEventEmitter.addListener(
    'AliyunPush_onNotificationReceivedInApp',
    (event) => {
      callback(event);
    }
  );
}

export function addMessageCallback(callback: PushCallback) {
  _onMessageListener = pushManagerEmitter.addListener(
    'AliyunPush_onMessage',
    (event) => {
      callback(event);
    }
  );
}

export function addNotificationOpenedCallback(callback: PushCallback) {
  _onNotificationOpenedListener = pushManagerEmitter.addListener(
    'AliyunPush_onNotificationOpened',
    (event) => {
      callback(event);
    }
  );
}

export function addNotificationRemovedCallback(callback: PushCallback) {
  _onNotificationRemovedListener = pushManagerEmitter.addListener(
    'AliyunPush_onNotificationRemoved',
    (event) => {
      callback(event);
    }
  );
}

export function addNotificationClickedWithNoAction(callback: PushCallback) {
  _onNotificationClickedWithNoAction = DeviceEventEmitter.addListener(
    'AliyunPush_onNotificationClickedWithNoAction',
    (event) => {
      callback(event);
    }
  );
}

export function addChannelOpenCallback(callback: PushCallback) {
  _onChannelOpenedListener = pushManagerEmitter.addListener(
    'AliyunPush_onChannelOpened',
    (event) => {
      callback(event);
    }
  );
}

export function addRegisterDeviceTokenSuccessCallback(callback: PushCallback) {
  _onRegisterDeviceTokenSuccessListener = pushManagerEmitter.addListener(
    'AliyunPush_onRegisterDeviceTokenSuccess',
    (event) => {
      callback(event);
    }
  );
}

export function addRegisterDeviceTokenFailedCallback(callback: PushCallback) {
  _onRegisterDeviceTokenFailedListener = pushManagerEmitter.addListener(
    'AliyunPush_onRegisterDeviceTokenFailed',
    (event) => {
      callback(event);
    }
  );
}

export function removePushCallback() {
  if (
    _onNotificationListener !== null &&
    _onNotificationListener !== undefined
  ) {
    _onNotificationListener.remove();
    _onNotificationListener = null;
  }

  if (
    _onNotificationReceivedInAppListener !== null &&
    _onNotificationReceivedInAppListener !== undefined
  ) {
    _onNotificationReceivedInAppListener.remove();
    _onNotificationReceivedInAppListener = null;
  }

  if (_onMessageListener !== null && _onMessageListener !== undefined) {
    _onMessageListener.remove();
    _onMessageListener = null;
  }

  if (
    _onNotificationOpenedListener !== null &&
    _onNotificationOpenedListener !== undefined
  ) {
    _onNotificationOpenedListener.remove();
    _onNotificationOpenedListener = null;
  }

  if (
    _onNotificationRemovedListener !== null &&
    _onNotificationRemovedListener !== undefined
  ) {
    _onNotificationRemovedListener.remove();
    _onNotificationRemovedListener = null;
  }

  if (
    _onNotificationClickedWithNoAction !== null &&
    _onNotificationClickedWithNoAction !== undefined
  ) {
    _onNotificationClickedWithNoAction.remove();
    _onNotificationClickedWithNoAction = null;
  }

  if (
    _onChannelOpenedListener !== null &&
    _onChannelOpenedListener !== undefined
  ) {
    _onChannelOpenedListener.remove();
    _onChannelOpenedListener = null;
  }

  if (
    _onRegisterDeviceTokenSuccessListener !== null &&
    _onRegisterDeviceTokenSuccessListener !== undefined
  ) {
    _onRegisterDeviceTokenSuccessListener.remove();
    _onRegisterDeviceTokenSuccessListener = null;
  }

  if (
    _onRegisterDeviceTokenFailedListener !== null &&
    _onRegisterDeviceTokenFailedListener !== undefined
  ) {
    _onRegisterDeviceTokenFailedListener.remove();
    _onRegisterDeviceTokenFailedListener = null;
  }
}
