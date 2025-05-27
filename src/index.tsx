import {
  default as AliyunPush,
  AliyunPushEventTypes,
  AliyunPushLogLevel,
} from './NativeAliyunReactNativePush';
import { Platform, NativeEventEmitter } from 'react-native';
import type { EmitterSubscription } from 'react-native';
import type {
  PushResult,
  CreateAndroidChannelParams,
} from './NativeAliyunReactNativePush';
export type { PushResult, CreateAndroidChannelParams };
export { AliyunPushLogLevel };

// result code
export const kAliyunPushSuccessCode = '10000';
export const kAliyunPushParamsIllegal = '10001';
export const kAliyunPushFailedCode = '10002';
export const kAliyunPushOnlyAndroid = '10003';
export const kAliyunPushOnlyIOS = '10004';
export const kAliyunPushNotSupport = '10005';

// tag target
export const kAliyunTargetDevice = 1;
export const kAliyunTargetAccount = 2;
export const kAliyunTargetAlias = 3;

export function setLogLevel(level: AliyunPushLogLevel): void {
  if (level !== AliyunPushLogLevel.None) {
    AliyunPush.setPluginLogEnabled(true);
  } else {
    AliyunPush.setPluginLogEnabled(false);
  }

  AliyunPush.setLogLevel(level);
}

export function initPush(
  appKey?: string,
  appSecret?: string
): Promise<PushResult> {
  return AliyunPush.initPush(appKey, appSecret);
}

export function getDeviceId(): Promise<string> {
  return AliyunPush.getDeviceId();
}

export function initAndroidThirdPush(): Promise<PushResult> {
  return AliyunPush.initAndroidThirdPush();
}

export function bindAccount(account: string): Promise<PushResult> {
  return AliyunPush.bindAccount(account);
}

export function unbindAccount(): Promise<PushResult> {
  return AliyunPush.unbindAccount();
}

export function addAlias(alias: string): Promise<PushResult> {
  return AliyunPush.addAlias(alias);
}

export function removeAlias(alias: string): Promise<PushResult> {
  return AliyunPush.removeAlias(alias);
}

export function listAlias(): Promise<PushResult> {
  return AliyunPush.listAlias();
}

export function bindTag(
  tags: string[],
  target = kAliyunTargetDevice,
  alias?: string
): Promise<PushResult> {
  return AliyunPush.bindTag(tags, target, alias);
}

export function unbindTag(
  tags: string[],
  target = kAliyunTargetDevice,
  alias?: string
): Promise<PushResult> {
  return AliyunPush.unbindTag(tags, target, alias);
}

export function listTags(target = kAliyunTargetDevice): Promise<PushResult> {
  return AliyunPush.listTags(target);
}

export function bindPhoneNumber(phone: string): Promise<PushResult> {
  return AliyunPush.bindAndroidPhoneNumber(phone);
}

export function unbindPhoneNumber(): Promise<PushResult> {
  return AliyunPush.unbindAndroidPhoneNumber();
}

export function setNotificationInGroup(inGroup: boolean): Promise<PushResult> {
  return AliyunPush.setAndroidNotificationInGroup(inGroup);
}

export function clearAndroidNotifications(): Promise<PushResult> {
  return AliyunPush.clearAndroidNotifications();
}

export function createAndroidChannel(
  params: CreateAndroidChannelParams
): Promise<PushResult> {
  return AliyunPush.createAndroidChannel(params);
}

export function createAndroidChannelGroup(
  id: string,
  name: string,
  desc: string
): Promise<PushResult> {
  return AliyunPush.createAndroidChannelGroup(id, name, desc);
}

export function isAndroidNotificationEnabled(id?: string): Promise<boolean> {
  return AliyunPush.isAndroidNotificationEnabled(id);
}

export function jumpToAndroidNotificationSettings(id?: string) {
  AliyunPush.jumpToAndroidNotificationSettings(id);
}

export function setIOSBadgeNum(num: number): Promise<PushResult> {
  return AliyunPush.setIosBadgeNum(num);
}

export function syncIOSBadgeNum(num: number): Promise<PushResult> {
  return AliyunPush.syncIosBadgeNum(num);
}

export function getApnsDeviceToken(): Promise<string> {
  return AliyunPush.getIosApnsDeviceToken();
}

export function showNoticeWhenForeground(
  enabled: boolean
): Promise<PushResult> {
  return AliyunPush.showIosNoticeWhenForeground(enabled);
}

export function isIOSChannelOpened(): Promise<boolean> {
  return AliyunPush.isIosChannelOpened();
}

/**
 * ████████████████████████████████████
 * █ 以下为对callback事件封装
 * ████████████████████████████████████
 */

export type PushCallback = (event: any) => void;

/*
 * 推送通知的回调方法
 */
let _onNotificationListener: EmitterSubscription | null = null;

/*
 * 应用处于前台时通知到达回调 - 仅支持Android
 */
let _onNotificationReceivedInAppListener: EmitterSubscription | null = null;

/*
 * 推送消息的回调方法
 */
let _onMessageListener: EmitterSubscription | null = null;

/*
 * 从通知栏打开通知的扩展处理
 */
let _onNotificationOpenedListener: EmitterSubscription | null = null;

/*
 * 通知删除回调
 */
let _onNotificationRemovedListener: EmitterSubscription | null = null;

/*
 * 无动作通知点击回调 - 仅支持Android
 * 当在后台或阿里云控制台指定的通知动作为无逻辑跳转时,
 * 通知点击回调为onNotificationClickedWithNoAction而不是onNotificationOpened
 */
let _onNotificationClickedWithNoAction: EmitterSubscription | null = null;

/*
 * iOS APNs注册成功回调
 */
let _onRegisterDeviceTokenSuccessListener: EmitterSubscription | null = null;

/*
 * iOS APNs注册失败回调
 */
let _onRegisterDeviceTokenFailedListener: EmitterSubscription | null = null;

/*
 * iOS自有通道建连成功回调
 */
let _onChannelOpenedListener: EmitterSubscription | null = null;

const pushManagerEmitter = new NativeEventEmitter(AliyunPush);

export function addNotificationCallback(callback: PushCallback) {
  // 如果已有注册的监听器，先移除
  if (_onNotificationListener) {
    pushManagerEmitter.removeAllListeners(AliyunPushEventTypes.onNotification);
  }

  _onNotificationListener = pushManagerEmitter.addListener(
    AliyunPushEventTypes.onNotification,
    (event: any) => {
      callback(event);
    }
  );
}

export function addNotificationReceivedInApp(callback: PushCallback) {
  if (Platform.OS === 'ios') {
    return;
  }

  // 如果已有注册的监听器，先移除
  if (_onNotificationReceivedInAppListener) {
    pushManagerEmitter.removeAllListeners(
      AliyunPushEventTypes.onNotificationReceivedInApp
    );
  }

  _onNotificationReceivedInAppListener = pushManagerEmitter.addListener(
    AliyunPushEventTypes.onNotificationReceivedInApp,
    (event) => {
      callback(event);
    }
  );
}

export function addMessageCallback(callback: PushCallback) {
  // 如果已有注册的监听器，先移除
  if (_onMessageListener) {
    pushManagerEmitter.removeAllListeners(AliyunPushEventTypes.onMessage);
  }

  _onMessageListener = pushManagerEmitter.addListener(
    AliyunPushEventTypes.onMessage,
    (event) => {
      callback(event);
    }
  );
}

export function addNotificationOpenedCallback(callback: PushCallback) {
  // 如果已有注册的监听器，先移除
  if (_onNotificationOpenedListener) {
    pushManagerEmitter.removeAllListeners(
      AliyunPushEventTypes.onNotificationOpened
    );
  }

  _onNotificationOpenedListener = pushManagerEmitter.addListener(
    AliyunPushEventTypes.onNotificationOpened,
    (event) => {
      callback(event);
    }
  );
}

export function addNotificationRemovedCallback(callback: PushCallback) {
  // 如果已有注册的监听器，先移除
  if (_onNotificationRemovedListener) {
    pushManagerEmitter.removeAllListeners(
      AliyunPushEventTypes.onNotificationRemoved
    );
  }

  _onNotificationRemovedListener = pushManagerEmitter.addListener(
    AliyunPushEventTypes.onNotificationRemoved,
    (event) => {
      callback(event);
    }
  );
}

export function addNotificationClickedWithNoAction(callback: PushCallback) {
  if (Platform.OS === 'ios') {
    return;
  }

  // 如果已有注册的监听器，先移除
  if (_onNotificationClickedWithNoAction) {
    pushManagerEmitter.removeAllListeners(
      AliyunPushEventTypes.onNotificationClickedWithNoAction
    );
  }

  _onNotificationClickedWithNoAction = pushManagerEmitter.addListener(
    AliyunPushEventTypes.onNotificationClickedWithNoAction,
    (event) => {
      callback(event);
    }
  );
}

export function addChannelOpenCallback(callback: PushCallback) {
  // 如果已有注册的监听器，先移除
  if (_onChannelOpenedListener) {
    pushManagerEmitter.removeAllListeners(AliyunPushEventTypes.onChannelOpened);
  }

  _onChannelOpenedListener = pushManagerEmitter.addListener(
    AliyunPushEventTypes.onChannelOpened,
    (event) => {
      callback(event);
    }
  );
}

export function addRegisterDeviceTokenSuccessCallback(callback: PushCallback) {
  // 如果已有注册的监听器，先移除
  if (_onRegisterDeviceTokenSuccessListener) {
    pushManagerEmitter.removeAllListeners(
      AliyunPushEventTypes.onRegisterDeviceTokenSuccess
    );
  }

  _onRegisterDeviceTokenSuccessListener = pushManagerEmitter.addListener(
    AliyunPushEventTypes.onRegisterDeviceTokenSuccess,
    (event) => {
      callback(event);
    }
  );
}

export function addRegisterDeviceTokenFailedCallback(callback: PushCallback) {
  // 如果已有注册的监听器，先移除
  if (_onRegisterDeviceTokenFailedListener) {
    pushManagerEmitter.removeAllListeners(
      AliyunPushEventTypes.onRegisterDeviceTokenFailed
    );
  }

  _onRegisterDeviceTokenFailedListener = pushManagerEmitter.addListener(
    AliyunPushEventTypes.onRegisterDeviceTokenFailed,
    (event) => {
      callback(event);
    }
  );
}

function removeListener(listener: EmitterSubscription | null) {
  if (listener) {
    listener.remove();
    return null;
  }
  return listener;
}

function cleanupAllListeners() {
  pushManagerEmitter.removeAllListeners(AliyunPushEventTypes.onNotification);
  pushManagerEmitter.removeAllListeners(
    AliyunPushEventTypes.onNotificationReceivedInApp
  );
  pushManagerEmitter.removeAllListeners(AliyunPushEventTypes.onMessage);
  pushManagerEmitter.removeAllListeners(
    AliyunPushEventTypes.onNotificationOpened
  );
  pushManagerEmitter.removeAllListeners(
    AliyunPushEventTypes.onNotificationRemoved
  );
  pushManagerEmitter.removeAllListeners(
    AliyunPushEventTypes.onNotificationClickedWithNoAction
  );
  pushManagerEmitter.removeAllListeners(AliyunPushEventTypes.onChannelOpened);
  pushManagerEmitter.removeAllListeners(
    AliyunPushEventTypes.onRegisterDeviceTokenSuccess
  );
  pushManagerEmitter.removeAllListeners(
    AliyunPushEventTypes.onRegisterDeviceTokenFailed
  );
}

/**
 * 清理所有监听器
 */
export function removePushCallback() {
  _onNotificationListener = removeListener(_onNotificationListener);
  _onNotificationReceivedInAppListener = removeListener(
    _onNotificationReceivedInAppListener
  );
  _onMessageListener = removeListener(_onMessageListener);
  _onNotificationOpenedListener = removeListener(_onNotificationOpenedListener);
  _onNotificationRemovedListener = removeListener(
    _onNotificationRemovedListener
  );
  _onNotificationClickedWithNoAction = removeListener(
    _onNotificationClickedWithNoAction
  );
  _onChannelOpenedListener = removeListener(_onChannelOpenedListener);
  _onRegisterDeviceTokenSuccessListener = removeListener(
    _onRegisterDeviceTokenSuccessListener
  );
  _onRegisterDeviceTokenFailedListener = removeListener(
    _onRegisterDeviceTokenFailedListener
  );

  cleanupAllListeners();
}
