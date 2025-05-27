# Aliyun React Native Push

## 1. 项目简介

本库（`aliyun-react-native-push`）是一个 React Native 推送通知插件，旨在简化 Android 和 iOS 平台集成阿里云推送服务的过程。通过封装原生阿里云推送 SDK (Android: `alicloud-android-push`, iOS: `AlicloudPush`)，开发者可以更便捷地在 React Native 应用中实现稳定、高效的推送通知功能，而无需深入了解原生平台的复杂配置。本库致力于提供一致的 JavaScript API，降低跨平台开发的难度，提升开发效率。

## 2. 特性

- 🚀 **跨平台支持**：一套代码同时支持 Android 和 iOS 平台。
- 🔔 **阿里云推送**：深度集成阿里云官方推送 SDK，保证推送服务的稳定性和可靠性。
- 🔧 **简化接入**：封装原生复杂配置，提供简洁易用的 JavaScript API。
- 🎯 **消息处理**：支持接收和处理通知栏消息及应用内消息。
- 🔌 **易于扩展**：未来可根据需求扩展更多推送相关功能。

## 3. 安装步骤

```bash
# 使用 yarn 安装（推荐）
yarn add aliyun-react-native-push

# 或使用 npm 安装
npm install aliyun-react-native-push --save
```

**依赖项和版本要求:**

- React Native >= `0.76`
- Android:
  - `alicloud-android-push`: [`3.9.4.1`,`4.0`)
- iOS:
  - `AlicloudPush`: `~> 3.1`

## 4. 插件初始化

```typescript
import * as AliyunPush from 'aliyun-react-native-push';
import { AliyunPushLogLevel } from 'aliyun-react-native-push';
import { Platform, Alert } from 'react-native';

// 设置日志级别（需要在 initPush 前调用）
AliyunPush.setLogLevel(AliyunPushLogLevel.Debug);

// 配置App Key和App Secret（请在 https://emas.console.aliyun.com 获取）
const app = Platform.select({
  ios: {
    appKey: '335545908',
    appSecret: 'f9aada891c32423187b18ae319700c09',
  },
  android: {
    appKey: '335545921',
    appSecret: '4a941e67a6ab4109a673569b95e3348a',
  },
});

// 初始化推送服务
const initPush = async () => {
  try {
    const result = await AliyunPush.initPush(app?.appKey, app?.appSecret);

    if (result.code === AliyunPush.kAliyunPushSuccessCode) {
      Alert.alert('设备注册成功');
    } else {
      Alert.alert(`设备注册失败, errorCode: ${result.code}`, result.errorMsg);
    }
  } catch (error) {
    Alert.alert('设备注册失败', '未知错误');
  }
};

initPush();
```

## 5. 原生环境配置

### 5.1 Android 配置

#### 5.1.1 配置 Maven 仓库

在项目根目录下的 `android/build.gradle` 文件中，添加以下 Maven 仓库地址以支持阿里云推送及相关厂商 SDK：

```gradle
allprojects {
    repositories {
        mavenCentral()
        google()
        maven { url 'https://maven.aliyun.com/nexus/content/repositories/releases/' }
        maven { url 'https://developer.huawei.com/repo/' }
    }
}
```

**说明**：

- 确保 `allprojects.repositories` 中包含上述仓库地址，以正确解析依赖。

#### 5.1.2 配置 AndroidManifest 文件

在 `android/app/src/main/AndroidManifest.xml` 文件的 `<application>` 标签内，添加以下配置以支持多个推送通道（如华为、VIVO、荣耀、OPPO、小米、魅族及 FCM）：

```xml
<!-- 华为推送 -->
<meta-data android:name="com.huawei.hms.client.appid" android:value="YOUR_HUAWEI_APP_ID" />

<!-- VIVO 推送 -->
<meta-data android:name="com.vivo.push.api_key" android:value="YOUR_VIVO_API_KEY" />
<meta-data android:name="com.vivo.push.app_id" android:value="YOUR_VIVO_APP_ID" />

<!-- 荣耀推送 -->
<meta-data android:name="com.hihonor.push.app_id" android:value="YOUR_HIHONOR_APP_ID" />

<!-- OPPO 推送 -->
<meta-data android:name="com.oppo.push.key" android:value="YOUR_OPPO_KEY" />
<meta-data android:name="com.oppo.push.secret" android:value="YOUR_OPPO_SECRET" />

<!-- 小米推送 -->
<meta-data android:name="com.xiaomi.push.id" android:value="YOUR_XIAOMI_APP_ID" />
<meta-data android:name="com.xiaomi.push.key" android:value="YOUR_XIAOMI_APP_KEY" />

<!-- 魅族推送 -->
<meta-data android:name="com.meizu.push.id" android:value="YOUR_MEIZU_APP_ID" />
<meta-data android:name="com.meizu.push.key" android:value="YOUR_MEIZU_APP_KEY" />

<!-- FCM 推送 -->
<meta-data android:name="com.gcm.push.sendid" android:value="YOUR_FCM_SENDER_ID" />
<meta-data android:name="com.gcm.push.applicationid" android:value="YOUR_FCM_APP_ID" />
<meta-data android:name="com.gcm.push.projectid" android:value="YOUR_FCM_PROJECT_ID" />
<meta-data android:name="com.gcm.push.api.key" android:value="YOUR_FCM_API_KEY" />

<!-- 阿里云推送消息接收器 -->
<receiver android:name="com.aliyun.ams.push.AliyunPushMessageReceiver" android:exported="false">
    <intent-filter>
        <action android:name="com.alibaba.push2.action.NOTIFICATION_OPENED" />
    </intent-filter>
    <intent-filter>
        <action android:name="com.alibaba.push2.action.NOTIFICATION_REMOVED" />
    </intent-filter>
    <intent-filter>
        <action android:name="com.alibaba.sdk.android.push.RECEIVE" />
    </intent-filter>
</receiver>
```

**注意事项**：

- **替换参数**：将 `YOUR_XXX` 占位符替换为各推送平台提供的实际参数（如 App ID、API Key 等）。请参考[阿里云推送官方文档](https://help.aliyun.com/document_detail/434677.html)获取具体配置方法。
- **消息接收器**：本插件已内置 `AliyunPushMessageReceiver`，只需按上述模板添加 `<receiver>` 配置即可支持通知的接收和处理。
- **权限检查**：确保 `AndroidManifest.xml` 已包含必要的网络和推送相关权限（如 `<uses-permission android:name="android.permission.INTERNET" />`）。

#### 5.1.3 混淆配置

如果您的项目中使用Proguard等工具做了代码混淆，请保留以下配置：

```txt
-keepclasseswithmembernames class ** {
    native <methods>;
}
-keepattributes Signature
-keep class sun.misc.Unsafe { *; }
-keep class com.taobao.** {*;}
-keep class com.alibaba.** {*;}
-keep class com.alipay.** {*;}
-keep class com.ut.** {*;}
-keep class com.ta.** {*;}
-keep class anet.**{*;}
-keep class anetwork.**{*;}
-keep class org.android.spdy.**{*;}
-keep class org.android.agoo.**{*;}
-keep class android.os.**{*;}
-keep class org.json.**{*;}
-dontwarn com.taobao.**
-dontwarn com.alibaba.**
-dontwarn com.alipay.**
-dontwarn anet.**
-dontwarn org.android.spdy.**
-dontwarn org.android.agoo.**
-dontwarn anetwork.**
-dontwarn com.ut.**
-dontwarn com.ta.**
```

### 5.2 iOS 配置

#### 5.2.1 Podfile 仓库配置

打开 `ios/Podfile` 文件，在文件最上方添加阿里云仓库和官方仓库地址：

```ruby
source 'https://github.com/aliyun/aliyun-specs.git'
source 'https://github.com/CocoaPods/Specs.git'
```

然后进入 `ios` 目录执行 `pod install --repo-update`。

#### 5.2.2 AppDelegate 配置

打开 `ios/YourProjectName/AppDelegate.m` 文件，引入头文件并添加回调处理代码。

> - 如果您用的 Swift 语言，那么您需要在 Xcode 工程中添加桥接文件。您可参考本插件 example/ios 工程配置。添加桥接文件方法如下：
> - 首先在 ios 目录创建桥接文件 `YourExampleApp-Bridging-Header.h`，然后在桥接文件中导入插件的头文件 `#import <AliyunReactNativePush/AliyunReactNativePush.h>`，最后在 Xcode `Build Settings` 中找到：
>   `Swift Compiler - General -> Objective-C Bridging Header` 并设置为： `$(SRCROOT)/YourExampleApp-Bridging-Header.h`

**Objective-C (`AppDelegate.m`):**

```objc
@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
    [UNUserNotificationCenter currentNotificationCenter].delegate = self;
    // ......
}

// 注册APNs成功
- (void)application:(UIApplication *)application didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken {
    NSLog(@"注册APNs成功");
    [AliyunPush didRegisterForRemoteNotificationsWithDeviceToken:deviceToken];
}

// 注册APNs失败
- (void)application:(UIApplication *)application didFailToRegisterForRemoteNotificationsWithError:(NSError *)error {
    NSLog(@"注册APNs失败");
    [AliyunPush didFailToRegisterForRemoteNotificationsWithError:error];
}

// 接收静默通知
- (void)application:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)userInfo {
    NSLog(@"接收静默通知");
    [AliyunPush didReceiveRemoteNotification:userInfo];
}

// 接收静默通知（带完成回调）
- (void)application:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)userInfo fetchCompletionHandler:(void (^)(UIBackgroundFetchResult))completionHandler {
    NSLog(@"接收静默通知（带完成回调）");
    [AliyunPush didReceiveRemoteNotification:userInfo fetchCompletionHandler:completionHandler];
}

// MARK: - UNUserNotificationCenterDelegate

// 前台收到通知
- (void)userNotificationCenter:(UNUserNotificationCenter *)center
       willPresentNotification:(UNNotification *)notification
         withCompletionHandler:(void (^)(UNNotificationPresentationOptions))completionHandler {
    NSLog(@"前台收到通知");
    [AliyunPush userNotificationCenter:center
               willPresentNotification:notification
                 withCompletionHandler:completionHandler];
}

// 点击通知响应
- (void)userNotificationCenter:(UNUserNotificationCenter *)center
didReceiveNotificationResponse:(UNNotificationResponse *)response
         withCompletionHandler:(void (^)(void))completionHandler {
    NSLog(@"点击通知响应");
    [AliyunPush userNotificationCenter:center
        didReceiveNotificationResponse:response
                 withCompletionHandler:completionHandler];
}

@end
```

**Swift (`AppDelegate.swift`):**

请参考本插件Demo工程文件 [AppDelegate.swift](example/ios/AliyunReactNativePushExample/AppDelegate.swift)

**注意：**

- 确保启用了 Push Notifications Capability：在 Xcode 中选择您的 Target -> Signing & Capabilities -> 点击 "+" -> 选择 "Push Notifications"。
- 确保已在苹果开发者中心配置了推送证书并上传到阿里云推送控制台。

## 6. API 参考

本节提供插件的 API 详细参考，涵盖初始化、通用、平台特定（Android 和 iOS）以及回调事件处理接口。每个 API 均包含用途、参数、返回值和使用示例。

### 6.1 初始化相关接口

#### `setLogLevel(level: AliyunPushLogLevel): void`

设置 SDK 的日志级别，控制日志输出详细程度。

- **参数**：
  - `level`: `AliyunPushLogLevel` - 日志级别（`None`、`Debug`、`Info`、`Warn`、`Error`）。设置为 `None` 禁用日志，其他级别启用日志。
- **返回**：`void`
- **注意**：
  - 根据 `level` 是否为 `None` 启用/禁用日志。
  - 调试时建议使用 `Debug` 或 `Info`，生产环境建议使用 `Error` 或 `None`。
  - 必须在初始化之前调用
- **示例**：

  ```typescript
  import { setLogLevel, AliyunPushLogLevel } from 'aliyun-react-native-push';

  setLogLevel(AliyunPushLogLevel.Debug); // 启用调试级别日志
  ```

#### `initPush(appKey?: string, appSecret?: string): Promise<PushResult>`

初始化 Aliyun Push 服务，使用提供的应用凭证。

- **参数**：
  - `appKey`: `string` - Aliyun 提供的应用密钥。
  - `appSecret`: `string` - Aliyun 提供的应用秘钥。
- **返回**：`Promise<PushResult>` - 包含以下字段的 `PushResult` 对象：
  - `code`: 状态码（成功为 `'10000'`，无效参数为 `'10001'`，失败为 `'10002'`）。
  - `errorMsg?`: 错误描述（失败时提供）。
- **注意**：
  - 所有推送功能需先调用此接口完成初始化。
  - 确保 `appKey` 和 `appSecret` 有效，否则初始化失败。
- **示例**：

  ```typescript
  import { initPush, kAliyunPushSuccessCode } from 'aliyun-react-native-push';

  async function initializePush() {
    try {
      const result = await initPush('your-app-key', 'your-app-secret');
      if (result.code === kAliyunPushSuccessCode) {
        console.log('推送服务初始化成功');
      } else {
        console.error('初始化失败:', result.errorMsg);
      }
    } catch (error) {
      console.error('初始化错误:', error);
    }
  }
  initializePush();
  ```

### 6.2 通用接口

#### `getDeviceId(): Promise<string>`

获取 Aliyun Push 服务分配的唯一设备 ID。

- **返回**：`Promise<string>` - 设备 ID 字符串。
- **注意**：用于识别设备的推送通知。
- **示例**：

  ```typescript
  import { getDeviceId } from 'aliyun-react-native-push';

  async function fetchDeviceId() {
    const deviceId = await getDeviceId();
    console.log('设备 ID:', deviceId);
  }
  fetchDeviceId();
  ```

#### `bindAccount(account: string): Promise<PushResult>`

将账户绑定到推送服务，用于定向通知。

- **参数**：
  - `account`: `string` - 账户标识（如用户 ID）。
- **返回**：`Promise<PushResult>` - 绑定操作的状态。
- **示例**：

  ```typescript
  import { bindAccount } from 'aliyun-react-native-push';

  async function bindUserAccount() {
    const result = await bindAccount('user123');
    console.log('绑定账户结果:', result);
  }
  bindUserAccount();
  ```

#### `unbindAccount(): Promise<PushResult>`

解除当前绑定的账户。

- **返回**：`Promise<PushResult>` - 解绑操作的状态。
- **示例**：

  ```typescript
  import { unbindAccount } from 'aliyun-react-native-push';

  async function unbindUserAccount() {
    const result = await unbindAccount();
    console.log('解绑账户结果:', result);
  }
  unbindUserAccount();
  ```

#### `addAlias(alias: string): Promise<PushResult>`

为设备添加别名，用于定向通知。

- **参数**：
  - `alias`: `string` - 与设备关联的别名。
- **返回**：`Promise<PushResult>` - 添加别名的状态。
- **示例**：

  ```typescript
  import { addAlias } from 'aliyun-react-native-push';

  async function addDeviceAlias() {
    const result = await addAlias('device-alias-001');
    console.log('添加别名结果:', result);
  }
  addDeviceAlias();
  ```

#### `removeAlias(alias: string): Promise<PushResult>`

移除设备的指定别名。

- **参数**：
  - `alias`: `string` - 要移除的别名。
- **返回**：`Promise<PushResult>` - 移除别名的状态。
- **示例**：

  ```typescript
  import { removeAlias } from 'aliyun-react-native-push';

  async function removeDeviceAlias() {
    const result = await removeAlias('device-alias-001');
    console.log('移除别名结果:', result);
  }
  removeDeviceAlias();
  ```

#### `listAlias(): Promise<PushResult>`

列出设备关联的所有别名。

- **返回**：`Promise<PushResult>` - 包含 `aliasList` 字段（以逗号拼接成字符串形式返回别名列表）。
- **示例**：

  ```typescript
  import { listAlias } from 'aliyun-react-native-push';

  async function fetchAliases() {
    const result = await listAlias();
    console.log('别名列表:', result.aliasList);
  }
  fetchAliases();
  ```

#### `bindTag(tags: string[], target = kAliyunTargetDevice, alias?: string): Promise<PushResult>`

为设备、账户或别名绑定标签，用于按照标签通知。

- **参数**：
  - `tags`: `string[]` - 要绑定的标签数组。
  - `target`（可选）: `number` - 目标类型（`kAliyunTargetDevice`、`kAliyunTargetAccount` 或 `kAliyunTargetAlias`），默认为 `kAliyunTargetDevice`。
  - `alias`（可选）: `string` - 目标为别名时的别名值。
- **返回**：`Promise<PushResult>` - 绑定标签的状态。
- **示例**：

  ```typescript
  import { bindTag, kAliyunTargetDevice } from 'aliyun-react-native-push';

  async function bindTags() {
    const result = await bindTag(['news', 'sports'], kAliyunTargetDevice);
    console.log('绑定标签结果:', result);
  }
  bindTags();
  ```

#### `unbindTag(tags: string[], target = kAliyunTargetDevice, alias?: string): Promise<PushResult>`

解除设备、账户或别名的指定标签。

- **参数**：
  - `tags`: `string[]` - 要解除的标签数组。
  - `target`（可选）: `number` - 目标类型，默认为 `kAliyunTargetDevice`。
  - `alias`（可选）: `string` - 目标为别名时的别名值。
- **返回**：`Promise<PushResult>` - 解除标签的状态。
- **示例**：

  ```typescript
  import { unbindTag, kAliyunTargetDevice } from 'aliyun-react-native-push';

  async function unbindTags() {
    const result = await unbindTag(['news'], kAliyunTargetDevice);
    console.log('解除标签结果:', result);
  }
  unbindTags();
  ```

#### `listTags(target = kAliyunTargetDevice): Promise<PushResult>`

列出指定目标关联的所有标签。

- **参数**：
  - `target`（可选）: `number` - 目标类型，默认为 `kAliyunTargetDevice`。
- **返回**：`Promise<PushResult>` - 包含 `tagsList` 字段（以逗号拼接成字符串形式返回标签列表）。
- **示例**：

  ```typescript
  import { listTags, kAliyunTargetDevice } from 'aliyun-react-native-push';

  async function fetchTags() {
    const result = await listTags(kAliyunTargetDevice);
    console.log('标签列表:', result.tagsList);
  }
  fetchTags();
  ```

### 6.3 Android 专用接口

#### `initAndroidThirdPush(): Promise<PushResult>`

初始化 Android 第三方推送服务（如华为、小米）。

- **返回**：`Promise<PushResult>` - 初始化状态。
- **注意**：仅 Android 可用，iOS 调用返回 `kAliyunPushOnlyAndroid` 错误。
- **示例**：

  ```typescript
  import { initAndroidThirdPush } from 'aliyun-react-native-push';

  async function initThirdPush() {
    const result = await initAndroidThirdPush();
    console.log('第三方推送初始化结果:', result);
  }
  initThirdPush();
  ```

#### `bindPhoneNumber(phone: string): Promise<PushResult>`

为 Android 推送服务绑定手机号码。

- **参数**：
  - `phone`: `string` - 要绑定的手机号码。
- **返回**：`Promise<PushResult>` - 绑定操作的状态。
- **注意**：仅 Android 可用。
- **示例**：

  ```typescript
  import { bindPhoneNumber } from 'aliyun-react-native-push';

  async function bindPhone() {
    const result = await bindPhoneNumber('+1234567890');
    console.log('绑定手机号码结果:', result);
  }
  bindPhone();
  ```

#### `unbindPhoneNumber(): Promise<PushResult>`

解除 Android 推送服务的手机号码绑定。

- **返回**：`Promise<PushResult>` - 解绑操作的状态。
- **注意**：仅 Android 可用。
- **示例**：

  ```typescript
  import { unbindPhoneNumber } from 'aliyun-react-native-push';

  async function unbindPhone() {
    const result = await unbindPhoneNumber();
    console.log('解除手机号码绑定结果:', result);
  }
  unbindPhone();
  ```

#### `setNotificationInGroup(inGroup: boolean): Promise<PushResult>`

启用或禁用 Android 通知分组。

- **参数**：
  - `inGroup`: `boolean` - 是否启用通知分组。
- **返回**：`Promise<PushResult>` - 操作状态。
- **注意**：仅 Android 可用。
- **示例**：

  ```typescript
  import { setNotificationInGroup } from 'aliyun-react-native-push';

  async function setGroupNotification() {
    const result = await setNotificationInGroup(true);
    console.log('设置通知分组结果:', result);
  }
  setGroupNotification();
  ```

#### `clearAndroidNotifications(): Promise<PushResult>`

清除 Android 上的所有通知。

- **返回**：`Promise<PushResult>` - 操作状态。
- **注意**：仅 Android 可用。
- **示例**：

  ```typescript
  import { clearAndroidNotifications } from 'aliyun-react-native-push';

  async function clearNotifications() {
    const result = await clearAndroidNotifications();
    console.log('清除通知结果:', result);
  }
  clearNotifications();
  ```

#### `createAndroidChannel(params: CreateAndroidChannelParams): Promise<PushResult>`

在 Android 上创建通知渠道。

- **参数**：
  - `params`: `CreateAndroidChannelParams` - 通知渠道配置，包含：
    - `id`: `string` - 渠道 ID。
    - `name`: `string` - 渠道名称。
    - `importance`: `number` - 渠道重要性（1-5，1 为最低，5 为最高）。
    - `desc`: `string` - 渠道描述。
    - `groupId?`: `string` - 渠道组 ID。
    - `allowBubbles?`: `boolean` - 是否允许气泡通知。
    - `light?`: `boolean` - 是否启用通知灯。
    - `lightColor?`: `number` - 通知灯颜色。
    - `showBadge?`: `boolean` - 是否显示角标。
    - `soundPath?`: `string` - 自定义通知音路径。
    - `soundUsage?`: `number` - 通知音使用方式。
    - `soundContentType?`: `number` - 通知音内容类型。
    - `soundFlag?`: `number` - 通知音标志。
    - `vibration?`: `boolean` - 是否启用震动。
    - `vibrationPattern?`: `number[]` - 震动模式。
- **返回**：`Promise<PushResult>` - 渠道创建状态。
- **注意**：仅 Android 可用（API 26+）。
- **示例**：

  ```typescript
  import { createAndroidChannel } from 'aliyun-react-native-push';

  async function createChannel() {
    const params: CreateAndroidChannelParams = {
      id: 'channel1',
      name: '默认渠道',
      desc: '默认通知渠道',
      importance: 3,
      showBadge: true,
    };
    const result = await createAndroidChannel(params);
    console.log('创建渠道结果:', result);
  }
  createChannel();
  ```

#### `createAndroidChannelGroup(id: string, name: string, desc: string): Promise<PushResult>`

在 Android 上创建通知渠道组。

- **参数**：
  - `id`: `string` - 渠道组 ID。
  - `name`: `string` - 渠道组名称。
  - `desc`: `string` - 渠道组描述。
- **返回**：`Promise<PushResult>` - 渠道组创建状态。
- **注意**：仅 Android 可用（API 26+）。
- **示例**：

  ```typescript
  import { createAndroidChannelGroup } from 'aliyun-react-native-push';

  async function createChannelGroup() {
    const result = await createAndroidChannelGroup(
      'group1',
      '组一',
      '第一个组'
    );
    console.log('创建渠道组结果:', result);
  }
  createChannelGroup();
  ```

#### `isAndroidNotificationEnabled(id?: string): Promise<boolean>`

检查 Android 上指定渠道或全局通知是否启用。

- **参数**：
  - `id`（可选）: `string` - 要检查的渠道 ID，若省略则检查全局通知状态。
- **返回**：`Promise<boolean>` - 通知是否启用。
- **注意**：仅 Android 可用。
- **示例**：

  ```typescript
  import { isAndroidNotificationEnabled } from 'aliyun-react-native-push';

  async function checkNotificationStatus() {
    const enabled = await isAndroidNotificationEnabled('channel1');
    console.log('通知是否启用:', enabled);
  }
  checkNotificationStatus();
  ```

#### `jumpToAndroidNotificationSettings(id?: string): void`

打开 Android 指定渠道或全局的通知设置页面。

- **参数**：
  - `id`（可选）: `string` - 要打开设置的渠道 ID。
- **返回**：`void`
- **注意**：仅 Android 可用。
- **示例**：

  ```typescript
  import { jumpToAndroidNotificationSettings } from 'aliyun-react-native-push';

  jumpToAndroidNotificationSettings('channel1'); // 打开 channel1 的设置页面
  ```

### 6.4 iOS 专用接口

#### `setIOSBadgeNum(num: number): Promise<PushResult>`

设置 iOS 应用图标的角标数字。

- **参数**：
  - `num`: `number` - 要设置的角标数字。
- **返回**：`Promise<PushResult>` - 操作状态。
- **注意**：仅 iOS 可用。
- **示例**：

  ```typescript
  import { setIOSBadgeNum } from 'aliyun-react-native-push';

  async function setBadge() {
    const result = await setIOSBadgeNum(5);
    console.log('设置角标结果:', result);
  }
  setBadge();
  ```

#### `syncIOSBadgeNum(num: number): Promise<PushResult>`

将 iOS 角标数字与推送服务同步。

- **参数**：
  - `num`: `number` - 要同步的角标数字。
- **返回**：`Promise<PushResult>` - 操作状态。
- **注意**：仅 iOS 可用。
- **示例**：

  ```typescript
  import { syncIOSBadgeNum } from 'aliyun-react-native-push';

  async function syncBadge() {
    const result = await syncIOSBadgeNum(5);
    console.log('同步角标结果:', result);
  }
  syncBadge();
  ```

#### `getApnsDeviceToken(): Promise<string>`

获取 iOS 设备的 APNs 设备令牌。

- **返回**：`Promise<string>` - APNs 设备令牌。
- **注意**：仅 iOS 可用。
- **示例**：

  ```typescript
  import { getApnsDeviceToken } from 'aliyun-react-native-push';

  async function fetchApnsToken() {
    const token = await getApnsDeviceToken();
    console.log('APNs 令牌:', token);
  }
  fetchApnsToken();
  ```

#### `showNoticeWhenForeground(enabled: boolean): Promise<PushResult>`

启用或禁用 iOS 应用在前台时显示通知。

- **参数**：
  - `enabled`: `boolean` - 是否在前台显示通知。
- **返回**：`Promise<PushResult>` - 操作状态。
- **注意**：仅 iOS 可用。
- **示例**：

  ```typescript
  import { showNoticeWhenForeground } from 'aliyun-react-native-push';

  async function enableForegroundNotice() {
    const result = await showNoticeWhenForeground(true);
    console.log('前台通知设置结果:', result);
  }
  enableForegroundNotice();
  ```

#### `isIOSChannelOpened(): Promise<boolean>`

检查 iOS 阿里云在线通道是否启用。

- **返回**：`Promise<boolean>` - 阿里云在线通道是否启用。
- **注意**：仅 iOS 可用。
- **示例**：

  ```typescript
  import { isIOSChannelOpened } from 'aliyun-react-native-push';

  async function checkChannelStatus() {
    const enabled = await isIOSChannelOpened();
    console.log('iOS 渠道是否启用:', enabled);
  }
  checkChannelStatus();
  ```

### 6.5 回调事件处理

所有回调函数接收一个类型为 `any` 的 `event` 参数，包含平台特定的通知或消息数据。回调函数需符合 `PushCallback` 类型：

```typescript
type PushCallback = (event: any) => void;
```

#### `addMessageCallback(callback: PushCallback): void`

注册接收推送消息的回调。

- **参数**：
  - `callback`: `PushCallback` - 处理消息的函数。
- **返回**：`void`
- **注意**：会替换现有的消息回调。
- **示例**：

  ```typescript
  import { addMessageCallback } from 'aliyun-react-native-push';

  addMessageCallback((event) => {
    console.log('接收到消息:', event);
  });
  ```

#### `addNotificationCallback(callback: PushCallback): void`

注册通知事件的回调。

- **参数**：
  - `callback`: `PushCallback` - 处理通知的函数。
- **返回**：`void`
- **注意**：会替换现有的通知回调。
- **示例**：

  ```typescript
  import { addNotificationCallback } from 'aliyun-react-native-push';

  addNotificationCallback((event) => {
    console.log('接收到通知:', event);
  });
  ```

#### `addNotificationOpenedCallback(callback: PushCallback): void`

注册通知被打开的回调。

- **参数**：
  - `callback`: `PushCallback` - 处理通知打开事件的函数。
- **返回**：`void`
- **注意**：会替换现有的通知打开回调。
- **示例**：

  ```typescript
  import { addNotificationOpenedCallback } from 'aliyun-react-native-push';

  addNotificationOpenedCallback((event) => {
    console.log('通知被打开:', event);
  });
  ```

#### `addNotificationRemovedCallback(callback: PushCallback): void`

注册通知被移除的回调。

- **参数**：
  - `callback`: `PushCallback` - 处理通知移除事件的函数。
- **返回**：`void`
- **注意**：会替换现有的通知移除回调。
- **示例**：

  ```typescript
  import { addNotificationRemovedCallback } from 'aliyun-react-native-push';

  addNotificationRemovedCallback((event) => {
    console.log('通知被移除:', event);
  });
  ```

#### `addNotificationReceivedInApp(callback: PushCallback): void`

注册应用在前台接收通知的回调（仅 Android）。

- **参数**：
  - `callback`: `PushCallback` - 处理前台通知事件的函数。
- **返回**：`void`
- **注意**：iOS 调用无效（`Platform.OS === 'ios'`）。
- **示例**：

  ```typescript
  import { addNotificationReceivedInApp } from 'aliyun-react-native-push';

  addNotificationReceivedInApp((event) => {
    console.log('前台接收到通知:', event);
  });
  ```

#### `addNotificationClickedWithNoAction(callback: PushCallback): void`

注册无动作通知点击的回调（仅 Android）。

- **参数**：
  - `callback`: `PushCallback` - 处理无动作通知点击的函数。
- **返回**：`void`
- **注意**：iOS 调用无效。用于通知无逻辑跳转动作时。
- **示例**：

  ```typescript
  import { addNotificationClickedWithNoAction } from 'aliyun-react-native-push';

  addNotificationClickedWithNoAction((event) => {
    console.log('无动作通知被点击:', event);
  });
  ```

#### `addChannelOpenCallback(callback: PushCallback): void`

注册 iOS 阿里云在线通道成功建连的回调。

- **参数**：
  - `callback`: `PushCallback` - 处理成功建连事件的函数。
- **返回**：`void`
- **注意**：仅 iOS 可用，会替换现有的回调。
- **示例**：

  ```typescript
  import { addChannelOpenCallback } from 'aliyun-react-native-push';

  addChannelOpenCallback((event) => {
    console.log('iOS 成功建连:', event);
  });
  ```

#### `addRegisterDeviceTokenSuccessCallback(callback: PushCallback): void`

注册 iOS APNs 设备令牌注册成功的回调。

- **参数**：
  - `callback`: `PushCallback` - 处理令牌注册成功的函数。
- **返回**：`void`
- **注意**：仅 iOS 可用，会替换现有成功回调。
- **示例**：

  ```typescript
  import { addRegisterDeviceTokenSuccessCallback } from 'aliyun-react-native-push';

  addRegisterDeviceTokenSuccessCallback((event) => {
    console.log('APNs 令牌注册成功:', event);
  });
  ```

#### `addRegisterDeviceTokenFailedCallback(callback: PushCallback): void`

注册 iOS APNs 设备令牌注册失败的回调。

- **参数**：
  - `callback`: `PushCallback` - 处理令牌注册失败的函数。
- **返回**：`void`
- **注意**：仅 iOS 可用，会替换现有失败回调。
- **示例**：

  ```typescript
  import { addRegisterDeviceTokenFailedCallback } from 'aliyun-react-native-push';

  addRegisterDeviceTokenFailedCallback((event) => {
    console.log('APNs 令牌注册失败:', event);
  });
  ```

#### `removePushCallback(): void`

移除所有推送事件回调。

- **返回**：`void`
- **注意**：清除所有消息、通知及平台特定事件的监听器。
- **示例**：

  ```typescript
  import { removePushCallback } from 'aliyun-react-native-push';

  removePushCallback(); // 清除所有推送事件监听器
  ```

### 6.6 常量和类型

#### 结果状态码

- `kAliyunPushSuccessCode = '10000'`: 操作成功。
- `kAliyunPushParamsIllegal = '10001'`: 参数无效。
- `kAliyunPushFailedCode = '10002'`: 操作失败。
- `kAliyunPushOnlyAndroid = '10003'`: 仅 Android 支持。
- `kAliyunPushOnlyIOS = '10004'`: 仅 iOS 支持。
- `kAliyunPushNotSupport = '10005'`: 功能不支持。

> 详细的原生SDK错误码请参考阿里云文档：[Android](https://help.aliyun.com/document_detail/434686.html), [iOS](https://help.aliyun.com/document_detail/434705.html)

#### 标签目标类型

- `kAliyunTargetDevice = 1`: 设备目标。
- `kAliyunTargetAccount = 2`: 账户目标。
- `kAliyunTargetAlias = 3`: 别名目标。

#### 类型定义

- **PushResult**:
  ```typescript
  interface PushResult {
    code: string; // 状态码
    errorMsg?: string; // 错误信息（失败时提供）
    aliasList?: string; // 别名列表（listAlias 返回）
    tagsList?: string; // 标签列表（listTags 返回）
  }
  ```
- **AliyunPushLogLevel**:
  ```typescript
  enum AliyunPushLogLevel {
    None = 'none',
    Error = 'error',
    Warn = 'warn',
    Info = 'info',
    Debug = 'debug',
  }
  ```
- **CreateAndroidChannelParams**:
  ```typescript
  interface CreateAndroidChannelParams {
    id: string; // 渠道 ID
    name: string; // 渠道名称
    importance: number; // 重要性（1-5）
    desc: string; // 描述
    groupId?: string; // 渠道组 ID
    allowBubbles?: boolean; // 是否允许气泡通知
    light?: boolean; // 是否启用通知灯
    lightColor?: number; // 通知灯颜色
    showBadge?: boolean; // 是否显示角标
    soundPath?: string; // 自定义通知音路径
    soundUsage?: number; // 通知音使用方式
    soundContentType?: number; // 通知音内容类型
    soundFlag?: number; // 通知音标志
    vibration?: boolean; // 是否启用震动
    vibrationPattern?: number[]; // 震动模式
  }
  ```
- **PushCallback**:
  ```typescript
  type PushCallback = (event: any) => void;
  ```

### 6.7 注意事项

- **基于 Promise 的 API**：所有返回 `Promise<PushResult>` 的 API 在成功时返回 `code` 为 `'10000'` 的 `PushResult` 对象。需检查 `code` 和 `errorMsg` 进行错误处理。
- **平台特定 API**：Android 和 iOS 专用 API 在错误平台调用时返回 `kAliyunPushOnlyAndroid` 或 `kAliyunPushOnlyIOS` 错误。
- **回调管理**：注册新回调会替换同类型现有回调，必要时使用 `removePushCallback` 清除所有回调。
- **线程安全**：所有 API 均为异步操作，可在主线程安全调用。

## 7. 故障排查

1.  **问题：Android 编译失败，提示找不到阿里云 SDK 相关类。**

    - **解决方案：**
      1.  检查项目根目录 `android/build.gradle` 是否已添加阿里云 Maven 仓库。
      2.  检查 `android/app/build.gradle` 是否正确添加了 `alicloud-android-push` 和 `alicloud-android-third-push` (如果使用) 的依赖，并注意版本号。
      3.  执行 `cd android && ./gradlew clean` 后重新编译。

2.  **问题：iOS `pod install` 失败或找不到 `AlicloudPush` 模块。**

    - **解决方案：**
      1.  确保插件依赖已正确安装。
      2.  尝试执行 `pod repo update` 更新本地 CocoaPods 仓库，然后再次 `pod install`。
      3.  删除 `ios/Pods` 目录和 `ios/Podfile.lock` 文件，然后重新执行 `pod install`。

3.  **问题：收不到推送通知。**

    - **解决方案 (通用)：**
      1.  确认 AppKey 和 AppSecret (Android & iOS) 配置正确无误。
      2.  检查设备网络连接是否正常。
      3.  确认应用是否已获取到 Device ID (可以通过 API 获取并打印日志查看)。
      4.  登录阿里云推送控制台，检查推送目标是否正确，是否有错误日志。
    - **解决方案 (Android)：**
      1.  检查 `AndroidManifest.xml` 中的权限、Receiver 和 Meta-data 配置是否正确。
      2.  查看 Logcat 日志，搜索 "MPS" 或 "AliPush" 等关键词，看是否有 SDK 初始化失败或连接错误的信息。
      3.  如果使用厂商通道，确保已在阿里云控制台配置了对应厂商的参数，并且手机上安装了对应厂商的服务框架。
    - **解决方案 (iOS)：**
      1.  确认已在 Xcode 中开启 "Push Notifications" Capability。
      2.  确认推送证书 (开发/生产) 是否正确配置并上传到阿里云控制台，且未过期。
      3.  检查 `AppDelegate` 中的初始化代码和回调方法是否正确实现。
      4.  真机调试时，检查设备的通知设置，确保允许该 App 显示通知。

4.  **问题：如何在 Expo 框架中使用**

    - **解决方案：**
      1.  你需要参考[这篇文档](https://docs.expo.dev/develop/development-builds/create-a-build/)完成原生构建，并安装到调试机器替代 Expo Go 应用。

5.  **问题：点击通知后，`onNotificationOpened` 事件没有触发。**
    - **解决方案：**
      1.  **Android:** 确保在 `AndroidManifest.xml` 中注册了插件提供的 receiver 组件。
      2.  **iOS:** 确保在 `AppDelegate` 的 `didReceiveNotificationResponse` 中正确将通知点击事件交给 `AliyunPush` 处理。

> 更多问题请参考[阿里云官网文档](https://help.aliyun.com/document_detail/434791.html)

## 8. 贡献指南

我们欢迎任何形式的贡献，包括但不限于：

- 报告 Bug (提交 Issue)
- 提交新功能建议 (提交 Issue)
- 编写或改进文档
- 提交 Pull Request (PR)

**提交 Issue：**

- 请先搜索已有的 Issue，避免重复提交。
- 清晰描述问题，提供复现步骤、环境信息 (React Native 版本、库版本、iOS/Android 版本等) 和相关日志或截图。

**提交 Pull Request：**

1.  Fork 本仓库。
2.  基于 `master` (或当前开发分支) 创建新的特性分支。
3.  确保代码风格一致 (可以使用 Prettier, ESLint 等工具)。
4.  提交 PR 到主仓库的 `master` 分支，并清晰描述 PR 的内容和目的。

## 9. 许可证

本库采用 [MIT License](LICENSE)。
