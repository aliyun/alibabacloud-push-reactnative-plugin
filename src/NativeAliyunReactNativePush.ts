import type { TurboModule } from 'react-native';
import { TurboModuleRegistry, Platform } from 'react-native';

export interface Spec extends TurboModule {
  // 双端通用接口
  setLogLevel(level: AliyunPushLogLevel): void;
  setPluginLogEnabled(enabled: boolean): void;
  initPush(appKey?: string, appSecret?: string): Promise<PushResult>;
  getDeviceId(): Promise<string>;

  bindAccount(account: string): Promise<PushResult>;
  unbindAccount(): Promise<PushResult>;
  addAlias(alias: string): Promise<PushResult>;
  removeAlias(alias: string): Promise<PushResult>;
  listAlias(): Promise<PushResult>;
  bindTag(tags: string[], target: number, alias?: string): Promise<PushResult>;
  unbindTag(
    tags: string[],
    target: number,
    alias?: string
  ): Promise<PushResult>;
  listTags(target: number): Promise<PushResult>;

  // Android 特定接口
  initAndroidThirdPush(): Promise<PushResult>;
  bindAndroidPhoneNumber(phone: string): Promise<PushResult>;
  unbindAndroidPhoneNumber(): Promise<PushResult>;
  setAndroidNotificationInGroup(inGroup: boolean): Promise<PushResult>;
  clearAndroidNotifications(): Promise<PushResult>;
  createAndroidChannel(params: CreateAndroidChannelParams): Promise<PushResult>;
  createAndroidChannelGroup(
    id: string,
    name: string,
    desc: string
  ): Promise<PushResult>;
  isAndroidNotificationEnabled(id?: string): Promise<boolean>;
  jumpToAndroidNotificationSettings(id?: string): void;

  // iOS 特定接口
  setIosBadgeNum(num: number): Promise<PushResult>;
  syncIosBadgeNum(num: number): Promise<PushResult>;
  showIosNoticeWhenForeground(enable: boolean): Promise<PushResult>;
  getIosApnsDeviceToken(): Promise<string>;
  isIosChannelOpened(): Promise<boolean>;

  // EventEmitter need
  addListener(eventName: string): void;
  removeListeners(count: number): void;
}

// 定义 PushResult 接口
export interface PushResult {
  code: string;
  errorMsg?: string;
  aliasList?: string;
  tagsList?: string;
}

// log level
export enum AliyunPushLogLevel {
  None = 'none',
  Error = 'error',
  Warn = 'warn',
  Info = 'info',
  Debug = 'debug',
}

// 定义 Android 通知通道参数的类型
export interface CreateAndroidChannelParams {
  id: string;
  name: string;
  importance: number;
  desc: string;
  groupId?: string;
  allowBubbles?: boolean;
  light?: boolean;
  lightColor?: number;
  showBadge?: boolean;
  soundPath?: string;
  soundUsage?: number;
  soundContentType?: number;
  soundFlag?: number;
  vibration?: boolean;
  vibrationPattern?: number[];
}

// 定义内部事件
export const AliyunPushEventTypes = {
  onRegisterDeviceTokenSuccess: 'AliyunPush_onRegisterDeviceTokenSuccess',
  onRegisterDeviceTokenFailed: 'AliyunPush_onRegisterDeviceTokenFailed',
  onNotification: 'AliyunPush_onNotification',
  onNotificationReceivedInApp: 'AliyunPush_onNotificationReceivedInApp',
  onNotificationOpened: 'AliyunPush_onNotificationOpened',
  onNotificationRemoved: 'AliyunPush_onNotificationRemoved',
  onNotificationClickedWithNoAction:
    'AliyunPush_onNotificationClickedWithNoAction',
  onChannelOpened: 'AliyunPush_onChannelOpened',
  onMessage: 'AliyunPush_onMessage',
} as const;

const LINKING_ERROR =
  `The package 'AliyunReactNativePush' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({
    ios: "- You have run 'pod install'\n",
    android: "- You have run 'gradlew clean' or 'gradle clean'\n",
  }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n\n' +
  'If you are using Expo:\n' +
  '- Refer to the Expo documentation for creating development builds:\n' +
  '  https://docs.expo.dev/develop/development-builds/create-a-build/\n\n' +
  'If you are not using Expo, check that:\n' +
  '- You have correctly setup your native build environment\n' +
  '- The package is correctly listed in your package.json dependencies\n';

const AliyunReactNativePush = TurboModuleRegistry.get<Spec>(
  'AliyunReactNativePush'
);

const ProxyHandler: ProxyHandler<Spec> = {
  get(_target: Spec, prop: string | symbol) {
    throw new Error(
      `${LINKING_ERROR}\nAttempted to call '${String(prop)}' on AliyunReactNativePush.`
    );
  },
};

export default AliyunReactNativePush ?? new Proxy({} as Spec, ProxyHandler);
