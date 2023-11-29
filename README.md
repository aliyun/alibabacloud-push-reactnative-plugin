# aliyun-react-native-push

阿里云移动推送官方ReactNative插件

## 一、快速入门

![](https://help-static-aliyun-doc.aliyuncs.com/assets/img/zh-CN/0863888061/p203304.png)

### 1.1 创建应用

EMAS平台中的应用是您实际端应用的映射，您需要在EMAS控制台创建应用，与您要加载SDK的端应用进行关联。创建应用请参见[快速入门](https://help.aliyun.com/document_detail/436513.htm?spm=a2c4g.11186623.0.0.78fa671bjAye93#topic-2225340)。

### 1.2 应用配置

Android

+ 厂商通道配置：移动推送全面支持接入厂商通道，请参见[配置厂商通道秘钥](https://help.aliyun.com/document_detail/434643.htm?spm=a2c4g.11186623.0.0.78fa671bjAye93#topic-1993457)
+ 短信联动配置：移动推送支持与短信联动，通过补充推送短信提升触达效果，请参见[短信联动配置](https://help.aliyun.com/document_detail/434653.htm?spm=a2c4g.11186623.0.0.78fa671bjAye93#topic-1993467)
+ 多包名配置：移动推送支持预先针对各渠道添加包名，实现一次推送，全渠道包消息可达。请参见[配置多包名](https://help.aliyun.com/document_detail/434645.htm?spm=a2c4g.11186623.0.0.78fa671bjAye93#topic-2019868)。

iOS

+ 证书配置：iOS应用推送需配置开发环境/生产环境推送证书，详细信息请参见[iOS 配置推送证书指南](https://help.aliyun.com/document_detail/434701.htm?spm=a2c4g.11186623.0.0.78fa4bfcpKinVG#topic-1824039)。


## 二、安装

```sh
npm install aliyun-react-native-push
```

## 三、配置

### 3.1 Android

#### 3.1.1 AndroidManifest配置

**1. AppKey、AppSecret配置**

在ReactNative工程的android模块下的`AndroidManifest.xml`文件中设置AppKey、AppSecret：

```xml
<application android:name="*****">
    <!-- 请填写你自己的- appKey -->
    <meta-data android:name="com.alibaba.app.appkey" android:value="*****"/> 
    <!-- 请填写你自己的appSecret -->
    <meta-data android:name="com.alibaba.app.appsecret" android:value="****"/> 
</application>
```

`com.alibaba.app.appkey`和`com.alibaba.app.appsecret`为您在EMAS平台上的App对应信息。在EMAS控制台的应用管理中或在下载的配置文件中查看AppKey和AppSecret。

AppKey和AppSecret请务必写在`<application>`标签下，否则SDK会报找不到AppKey的错误。

**2. 消息接收Receiver配置**

创建消息接收Receiver，继承自com.alibaba.sdk.android.push.MessageReceiver，并在对应回调中添加业务处理逻辑，可参考以下代码：

```java
public class MyMessageReceiver extends MessageReceiver {
    // 消息接收部分的LOG_TAG
    public static final String REC_TAG = "receiver";
    @Override
    public void onNotification(Context context, String title, String summary, Map<String, String> extraMap) {
        // TODO处理推送通知
        Log.e("MyMessageReceiver", "Receive notification, title: " + title + ", summary: " + summary + ", extraMap: " + extraMap);
    }
    @Override
    public void onMessage(Context context, CPushMessage cPushMessage) {
            Log.e("MyMessageReceiver", "onMessage, messageId: " + cPushMessage.getMessageId() + ", title: " + cPushMessage.getTitle() + ", content:" + cPushMessage.getContent());
    }
    @Override
    public void onNotificationOpened(Context context, String title, String summary, String extraMap) {
        Log.e("MyMessageReceiver", "onNotificationOpened, title: " + title + ", summary: " + summary + ", extraMap:" + extraMap);
    }
    @Override
    protected void onNotificationClickedWithNoAction(Context context, String title, String summary, String extraMap) {
        Log.e("MyMessageReceiver", "onNotificationClickedWithNoAction, title: " + title + ", summary: " + summary + ", extraMap:" + extraMap);
    }
    @Override
    protected void onNotificationReceivedInApp(Context context, String title, String summary, Map<String, String> extraMap, int openType, String openActivity, String openUrl) {
        Log.e("MyMessageReceiver", "onNotificationReceivedInApp, title: " + title + ", summary: " + summary + ", extraMap:" + extraMap + ", openType:" + openType + ", openActivity:" + openActivity + ", openUrl:" + openUrl);
    }
    @Override
    protected void onNotificationRemoved(Context context, String messageId) {
        Log.e("MyMessageReceiver", "onNotificationRemoved");
    }
}

```

将该receiver添加到AndroidManifest.xml文件中：

```xml
<!-- 消息接收监听器 （用户可自主扩展） -->
<receiver
    android:name=".MyMessageReceiver"
    android:exported="false"> <!-- 为保证receiver安全，建议设置不可导出，如需对其他应用开放可通过android：permission进行限制 -->
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

**3. 混淆配置**

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

#### 3.1.2 辅助通道集成

在国内Android生态中，推送通道都是由终端与云端之间的长链接来维持，非常依赖于应用进程的存活状态。如今一些手机厂家会在自家ROM中做系统级别的推送通道，再由系统分发给各个App，以此提高在自家ROM上的推送送达率。

移动推送针对小米、华为、荣耀、vivo、OPPO、魅族、谷歌等设备管控较严的情况，分别接入了相应的设备厂商推送辅助通道以提高这些设备上的到达率。

辅助通道的集成可参考[辅助通道集成](https://help.aliyun.com/document_detail/434677.html)。

### 3.2 iOS

#### 3.2.1 Objc配置

使用Xcode打开ReactNative工程的iOS模块，需要做`-Objc`配置，即应用的TARGETS -> Build Settings -> Linking -> Other Linker Flags ，需添加上 -ObjC 这个属性，否则推送服务无法正常使用 。

Other Linker Flags中设定链接器参数-ObjC，加载二进制文件时，会将 Objective-C 类和 Category 一并载入 ，若工程依赖多个三方库 ，将所有 Category 一并加载后可能发生冲突，可以使用 -force_load 单独载入指定二进制文件，配置如下 ：

```c++
-force_load<framework_path>/CloudPushSDK.framework/CloudPushSDK
```

## 四、APIs

### `initPush`

`function initPush(appKey?: string, appSecret?: string): Promise<PushResult>`

参数:

| 参数名 | 类型 | 是否必须 |
| --- | --- | ---|
| appKey | String | 可选参数 |
| appSecret | String | 可选参数 |

Android的AppKey和AppSecret是配置在`AnroidManifest.xml`文件中。

返回值：

`Promise<PushResult>`

`PushResult`中包含两个key值:

+ `code`: 错误码
+ `errorMsg`: 错误信息

代码示例:

```javascript
if (Platform.OS === 'ios') {
      AliyunPush.initPush('23793506', '226c59086b35aaa711eac776e87c617c').then(result => {
        let code = result.code;
        if (code === AliyunPush.kAliyunPushSuccessCode) {
          Alert.alert('Init iOS AliyunPush successfully👋');
        } else {
          let errorMsg = result.errorMsg?.toString();
          Alert.alert(`Failed to Init iOS AliyunPush, errorMsg: ${errorMsg}`);
        }
      });
    } else {
      AliyunPush.initPush().then((result) => {
        let code = result.code;
        if (code === AliyunPush.kAliyunPushSuccessCode) {
          Alert.alert('Init Android AliyunPush successfully👋');
        } else {
          let errorMsg = result.errorMsg?.toString();
          Alert.alert(`Failed to Init Android AliyunPush, errorMsg: ${errorMsg}`);
        }
      }).catch((error) => {
        console.log('error is ', error);
      });
    }
```

### `initAndroidThirdPush`

`function initAndroidThirdPush(): Promise<PushResult>`

**注意：**该方法只支持Android平台

初始化辅助通道

返回值：

`Promise<PushResult>`

`PushResult`中包含两个key值:

+ `code`: 错误码
+ `errorMsg`: 错误信息

代码示例：

```javascript
AliyunPush.initAndroidThirdPush().then(result => {
      console.log(result);
      let code = result.code;
      if (code === AliyunPush.kAliyunPushSuccessCode) {
        Alert.alert('Init Android AliyunPush successfully👋');
      } else {
        let errorMsg = result.errorMsg?.toString();
        Alert.alert(`Failed to Init Android AliyunPush, errorMsg: ${errorMsg}`);
      }
    });
```

### `addNotificationCallback`

`function addNotificationCallback(callback: PushCallback)`

注册收到通知回调

代码示例:

```javascript
AliyunPush.addNotificationCallback(event => {
      console.log('onNotification: ', event);
    });
```

### `addNotificationReceivedInApp`

`function addNotificationReceivedInApp(callback: PushCallback)`

应用处于前台时通知到达回调

> **注意：只支持Android**

代码示例：

```javascript
AliyunPush.addNotificationReceivedInApp(event => {
      console.log('onNotificationReceivedInApp: ', event);
    });
```

### `addMessageCallback`

`function addMessageCallback(callback: PushCallback)`

收到消息的回调

代码示例

```javascript
AliyunPush.addMessageCallback(event => {
      console.log('onMessage: ', event);
});
```

### `addNotificationOpenedCallback`

`function addNotificationOpenedCallback(callback: PushCallback)`

从通知栏打开通知的扩展处理

### `addNotificationRemovedCallback`

`function addNotificationRemovedCallback(callback: PushCallback)`

通知删除回调

### `addNotificationClickedWithNoAction`

`function addNotificationClickedWithNoAction(callback: PushCallback)`

> **注意：只支持Android**

无动作通知点击回调。当在后台或阿里云控制台指定的通知动作为无逻辑跳转时, 通知点击回调为onNotificationClickedWithNoAction而不是onNotificationOpened

### `addChannelOpenCallback`

`function addChannelOpenCallback(callback: PushCallback)`

> **注意：只支持iOS**

通道channel打开的回调

### `addRegisterDeviceTokenSuccessCallback`

`function addRegisterDeviceTokenSuccessCallback(callback: PushCallback)`

> **注意：只支持iOS**

 注册APNs token成功回调

### `addRegisterDeviceTokenFailedCallback`

`function addRegisterDeviceTokenFailedCallback(callback: PushCallback)`

> **注意：只支持iOS**

注册APNs token失败回调

## `removePushCallback`

删除全部回调

### getDeviceId

`function getDeviceId(): Promise<string>`

获取设备Id

返回值：

`Promise<String>` - 设备Id

代码示例：

```javascript
 AliyunPush.getDeviceId().then(deviceId => {
      if (deviceId === null) {
        Alert.alert(`deviceId is null, please init AliyunPush first`);
      } else {
        setDeviceId(deviceId);
      }
    })
```

### bindAccount

`function bindAccount(account: string): Promise<PushResult>`

绑定账号

参数:

| 参数名 | 类型 | 是否必须 | 含义 |
| --- | --- | ---| --- |
| account | String | 必须参数 | 要绑定的账号 |

返回值：

`Promise<PushResult>`

`PushResult`中包含两个key值:

+ `code`: 错误码
+ `errorMsg`: 错误信息

代码示例:

```javascript
AliyunPush.bindAccount(account).then(result => {
    let code = result.code;
    if (code === AliyunPush.kAliyunPushSuccessCode) {
        Alert.alert(`绑定账户:${account}成功👋`);
        setAccount('');
        setBoundAccount(account)
    } else {
        let errorMsg = result.errorMsg?.toString();
        Alert.alert(`绑定账户:${account}失败, error: ${errorMsg}`);
    }
});
```

### unbindAccount

`function unbindAccount(): Promise<PushResult>`

解绑账号

返回值：

`Promise<PushResult>`

`PushResult`中包含两个key值:

+ `code`: 错误码
+ `errorMsg`: 错误信息

代码实例:

```javascript
 AliyunPush.unbindAccount().then(result => {
    let code = result.code;
    if (code === AliyunPush.kAliyunPushSuccessCode) {
        Alert.alert(`解绑账户成功👋`);
        setAccount('');
    } else {
        let errorMsg = result.errorMsg?.toString();
        Alert.alert(`解绑账户失败, error: ${errorMsg}`);
    }
});
```

### `addAlias`

`function addAlias(alias: string): Promise<PushResult>`

添加别名

参数:

| 参数名 | 类型 | 是否必须 | 含义 |
| --- | --- | ---| --- |
| alias | String | 必须参数 | 要添加的别名 |  

返回值：

`Promise<PushResult>`

`PushResult`中包含两个key值:

+ `code`: 错误码
+ `errorMsg`: 错误信息

代码示例：

```javascript
AliyunPush.addAlias(aliasAdded).then(result => {
    let code = result.code;
    if (code === AliyunPush.kAliyunPushSuccessCode) {
        Alert.alert(`添加别名成功👋`);
        setAliasAdded('');
    } else {
        let errorMsg = result.errorMsg?.toString();
        Alert.alert(`添加别名失败, error: ${errorMsg}`);
    }
});
```

### `removeAlias`

`function removeAlias(alias: string): Promise<PushResult>`

移除别名

参数:

| 参数名 | 类型 | 是否必须 | 含义 |
| --- | --- | ---| --- |
| alias | String | 必须参数 | 要移除的别名 |  

返回值：

`Promise<PushResult>`

`PushResult`中包含两个key值:

+ `code`: 错误码
+ `errorMsg`: 错误信息

代码示例：

```javascript
AliyunPush.removeAlias(aliasRemoved).then(result => {
    let code = result.code;
    if (code === AliyunPush.kAliyunPushSuccessCode) {
        Alert.alert(`删除别名成功👋`);
        setAliasRemoved('');
    } else {
        let errorMsg = result.errorMsg?.toString();
        Alert.alert(`删除别名失败, error: ${errorMsg}`);
    }
});

```

### `listAlias`

`function listAlias(): Promise<PushResult>`

查询别名

返回值：

`Promise<PushResult>`

`PushResult`中包含三个key值:

+ `code`: 错误码
+ `errorMsg`: 错误信息
+ `aliasList`: 别名列表

代码示例：

```javascript
AliyunPush.listAlias().then(result => {
    let code = result.code;
    if (code === AliyunPush.kAliyunPushSuccessCode) {
        let aliasList = result.aliasList;
        if (aliasList !== null && aliasList !== undefined) {
            Alert.alert(`查询别名列表结果为: ${aliasList}`);
        }
    } else {
        let errorMsg = result.errorMsg?.toString();
        Alert.alert(`查询别名列表失败, error: ${errorMsg}`);
    }
});
```

### `bindTag`

`function bindTag(tags: string[], target = kAliyunTargetDevice, alias?: string): Promise<PushResult>`

添加标签
  
参数:

| 参数名 | 类型 | 是否必须 | 含义 |
| --- | --- | ---| --- |
| tags | List\<String> | 必须参数 |  要绑定的标签列表 |
| target | int | 可选参数 |  目标类型，1: 本设备  2: 本设备绑定账号  3: 别名</br>默认是1 |
| alias | String| 可选参数 | 别名（仅当target = 3时生效）

返回值：

`Promise<PushResult>`

`PushResult`中包含两个key值:

+ `code`: 错误码
+ `errorMsg`: 错误信息

代码实例:

```javascript
let tags = [];
tags.push(deviceTag);
AliyunPush.bindTag(tags, AliyunPush.kAliyunTargetDevice).then(result => {
    let code = result.code;
    if (code === AliyunPush.kAliyunPushSuccessCode) {
        Alert.alert(`添加设备标签 ${deviceTag} 成功👋`);
        setDeviceTag('');
    } else {
        let errorMsg = result.errorMsg?.toString();
        Alert.alert(`添加设备标签 ${deviceTag} 失败, error: ${errorMsg}`);
    }
});
```

### `unbindTag`

`function unbindTag(tags: string[], target = kAliyunTargetDevice, alias?: string): Promise<PushResult>`

移除标签

参数:

| 参数名 | 类型 | 是否必须 | 含义 |
| --- | --- | ---| --- |
| tags | List\<String\> | 必须参数 |  要移除的标签列表 |
| target | int | 可选参数 |  目标类型，1: 本设备  2: 本设备绑定账号  3: 别名</br>默认是1 |
| alias | String| 可选参数 | 别名（仅当target = 3时生效）

返回值：

`Promise<PushResult>`

`PushResult`中包含两个key值:

+ `code`: 错误码
+ `errorMsg`: 错误信息

代码实例:

```javascript
let tags = [];
tags.push(deviceTagRemoved);
AliyunPush.unbindTag(tags, AliyunPush.kAliyunTargetDevice).then(result => {
    let code = result.code;
    if (code === AliyunPush.kAliyunPushSuccessCode) {
        Alert.alert(`删除设备标签 ${deviceTagRemoved} 成功👋`);
        setDeviceTagRemoved('');
    } else {
        let errorMsg = result.errorMsg;
        Alert.alert(`删除设备标签 ${deviceTagRemoved} 失败, error: ${errorMsg}`);
    }
});
```

### `listTags`

`function listTags(target = kAliyunTargetDevice): Promise<PushResult>`

查询标签列表

返回值：

`Promise<PushResult>`

`PushResult`中包含三个key值:

+ `code`: 错误码
+ `errorMsg`: 错误信息
+ `tagsList`: 标签列表

代码示例：

```javascript
AliyunPush.listTags(AliyunPush.kAliyunTargetDevice).then(result => {
    let code = result.code;
    if (code === AliyunPush.kAliyunPushSuccessCode) {
        let tagList = result.tagsList;
        if (tagList !== null && tagList !== undefined) {
            Alert.alert(`查询设备标签列表结果为: ${tagList}`);
        }
    } else {
        let errorMsg = result.errorMsg;
        Alert.alert(`查询设备标签列表失败, error: ${errorMsg}`);
    }
});
```

### closeAndroidPushLog

`function closeAndroidPushLog(): Promise<PushResult>`

关闭Android推送SDK的Log

> **注意：只支持Android平台**

返回值：

`Promise<PushResult>`

`PushResult`中包含两个key值:

+ `code`: 错误码
+ `errorMsg`: 错误信息

代码示例：

```javascript
AliyunPush.closeAndroidPushLog().then(result => {
    let code = result.code;
    if (code === AliyunPush.kAliyunPushSuccessCode) {
        Alert.alert('成功关闭Log👋');
    } else {
        let errorMsg = result.errorMsg;
        Alert.alert(`关闭Log失败, error: ${errorMsg}`);
    }
});
```

### setAndroidLogLevel

`function setAndroidLogLevel(level: number): Promise<PushResult>`

设置Android推送SDK输出日志的级别

> **注意：只支持Android平台**

参数:

| 参数名 | 类型 | 是否必须 | 含义 |
| --- | --- | ---| --- |
| level | int | 必须参数 |  日志级别</br>0 - Error </br> 1 - Info </br> 2- Debug|

返回值：

`Promise<PushResult>`

`PushResult`中包含两个key值:

+ `code`: 错误码
+ `errorMsg`: 错误信息

代码示例：

```javascript
let level;
if (logLevel === 'ERROR') {
    level = AliyunPush.kAliyunPushLogLevelError;
} else if (logLevel === 'INFO') {
    level = AliyunPush.kAliyunPushLogLevelInfo;
} else {
    level = AliyunPush.kAliyunPushLogLevelDebug;
}
AliyunPush.setAndroidLogLevel(level).then(result => {
    let code = result.code;
    if (code === AliyunPush.kAliyunPushSuccessCode) {
        Alert.alert(`成功设置LogLvel为${logLevel} 👋`);
    } else {
        let errorMsg = result.errorMsg;
        Alert.alert(`设置LogLevel为${logLevel}失败, error: ${errorMsg}`);
    }
});
```

### bindPhoneNumber

`function bindPhoneNumber(phone: string): Promise<PushResult>`

绑定手机号码

> **注意：只支持Android平台**

参数:

| 参数名 | 类型 | 是否必须 | 含义 |
| --- | --- | ---| --- |
| phone | string | 必须参数 |  要绑定的电话号码|

返回值：

`Promise<PushResult>`

`PushResult`中包含两个key值:

+ `code`: 错误码
+ `errorMsg`: 错误信息

代码示例:

```javascript
AliyunPush.bindPhoneNumber(phone).then(result => {
    let code = result.code;
    if (code === AliyunPush.kAliyunPushSuccessCode) {
        Alert.alert(`绑定${phone}成功👋`);
    } else {
        let errorMsg = result.errorMsg;
        Alert.alert(`绑定${phone}失败, error: ${errorMsg}`);
    }
});
```

### unbindPhoneNumber

`function unbindPhoneNumber(): Promise<PushResult>`

解绑手机号码

> **注意：只支持Android平台**

返回值：

`Promise<PushResult>`

`PushResult`中包含两个key值:

+ `code`: 错误码
+ `errorMsg`: 错误信息

代码示例:

```javascript
AliyunPush.unbindPhoneNumber().then(result => {
    let code = result.code;
    if (code === AliyunPush.kAliyunPushSuccessCode) {
        Alert.alert('解绑手机号码成功👋');
    } else {
        let errorMsg = result.errorMsg;
        Alert.alert(`解绑手机号码失败, error: ${errorMsg}`);
    }
});
```

### setNotificationInGroup

`function setNotificationInGroup(inGroup: boolean): Promise<PushResult>`

设置通知分组展示

> **注意：只支持Android平台**

参数:

| 参数名 | 类型 | 是否必须 | 含义 |
| --- | --- | ---| --- |
| inGroup | bool | 必须参数 |  true-开启分组;false-关闭分组 |

返回值：

`Promise<PushResult>`

`PushResult`中包含两个key值:

+ `code`: 错误码
+ `errorMsg`: 错误信息

代码示例：

```javascript
AliyunPush.setNotificationInGroup(true).then(result => {
    let code = result.code;
    if (code === AliyunPush.kAliyunPushSuccessCode) {
        Alert.alert('开启通知分组展示成功👋');
    } else {
        let errorMsg = result.errorMsg;
        Alert.alert(`开启通知分组展示失败, error: ${errorMsg}`);
    }
});
```

### clearAndroidNotifications

`function clearAndroidNotifications(): Promise<PushResult>`

清除所有通知

> **注意：只支持Android平台**

返回值：

`Promise<PushResult>`

`PushResult`中包含两个key值:

+ `code`: 错误码
+ `errorMsg`: 错误信息

代码示例:

```javascript
AliyunPush.clearAndroidNotifications().then(result => {
    let code = result.code;
    if (code === AliyunPush.kAliyunPushSuccessCode) {
        Alert.alert('清除所有通知成功👋');
    } else {
        let errorMsg = result.errorMsg;
        Alert.alert(`清除所有通知失败, error: ${errorMsg}`);
    }
});
```

### createAndroidChannel

`function createAndroidChannel(params: any): Promise<PushResult>)`

创建Android平台的NotificationChannel

> **注意：只支持Android平台**

参数:

| 参数名 | 类型 | 是否必须 | 含义 |
| --- | --- | ---| --- |
| id | String | 必须参数 |  通道id |
| name | String |必须参数 | 通道name |
| importance | int | 必须参数 | 通道importance |
| desc | String | 必须参数 | 通道描述 |
| groupId | String | 可选参数 | - |
| allowBubbles | bool | 可选参数 | - |
| light | bool | 可选参数 | - |
| lightColor | int | 可选参数 | - |
| showBadge | bool | 可选参数 | - |
| soundPath | String | 可选参数 | - |
| soundUsage | int | 可选参数 | - |
| soundContentType | int | 可选参数 | - |
| soundFlag | int | 可选参数 | - |
| vibration | bool | 可选参数 | - |
| vibrationPatterns | List\<int> | 可选参数 | - |

返回值：

`Promise<PushResult>`

`PushResult`中包含两个key值:

+ `code`: 错误码
+ `errorMsg`: 错误信息

代码示例：

```javascript
AliyunPush.createAndroidChannel({
    'id': channel,
    'name': '测试通道A',
    'importance': 3,
    'desc': '测试创建通知通道'
}).then(result => {
    let code = result.code;
    if (code === AliyunPush.kAliyunPushSuccessCode) {
        Alert.alert(`创建通道${channel}c成功👋`);
    } else {
        let errorMsg = result.errorMsg;
        Alert.alert(`创建通道${channel}失败, error: ${errorMsg}`);
    }
});
```

### createAndroidChannelGroup

`function createAndroidChannelGroup(id: string, name: string, desc: string): Promise<PushResult>`

创建通知通道的分组

> **注意：只支持Android平台**

参数:

| 参数名 | 类型 | 是否必须 | 含义 |
| --- | --- | ---| --- |
| id | String | 必须参数 |  通道id |
| name | String |必须参数 | 通道name |
| desc | String | 必须参数 | 通道描述 |

返回值：

`Promise<PushResult>`

`PushResult`中包含两个key值:

+ `code`: 错误码
+ `errorMsg`: 错误信息

### isAndroidNotificationEnabled

`function isAndroidNotificationEnabled(id?: string): Promise<boolean>`

检查通知状态

> **注意：只支持Android平台**

参数:

| 参数名 | 类型 | 是否必须 | 含义 |
| --- | --- | ---| --- |
| id | String | 可选参数 |  通道id |

返回值：

`Promise<boolean>` - true: 已打开; false：未打开

代码示例：

```javascript
AliyunPush.isAndroidNotificationEnabled().then(result => {
    Alert.alert(`通知状态: ${result}`);
});
```

### jumpToAndroidNotificationSettings

`function jumpToAndroidNotificationSettings(id?: string)`

跳转到通知设置页面

> **注意：只支持Android平台**

代码示例:

```javascript
AliyunPush.jumpToAndroidNotificationSettings();
```

### turnOnIOSDebug

`function turnOnIOSDebug(): Promise<PushResult>`

打开iOS推送SDK的日志

> **注意：只支持iOS平台**

返回值：

`Promise<PushResult>`

`PushResult`中包含两个key值:

+ `code`: 错误码
+ `errorMsg`: 错误信息

代码示例：

```javascript
AliyunPush.turnOnIOSDebug().then(result => {
    let code = result.code;
    if (code === AliyunPush.kAliyunPushSuccessCode) {
        Alert.alert('打开Debug日志成功👋');
    } else {
        let errorMsg = result.errorMsg?.toString();
        Alert.alert(`打开Debug日志失败, error: ${errorMsg}`);
    }
});
```

### showIOSNoticeWhenForeground

`function showNoticeWhenForeground(enabled: boolean): Promise<PushResult>`

App处于前台时显示通知

> **注意：只支持iOS平台**

返回值：

`Promise<PushResult>`

`PushResult`中包含两个key值:

+ `code`: 错误码
+ `errorMsg`: 错误信息

代码示例：

```javascript
AliyunPush.showNoticeWhenForeground(true).then(result => {
    let code = result.code;
    if (code === AliyunPush.kAliyunPushSuccessCode) {
        setBadge('');
        Alert.alert('设置前台显示通知成功👋');
    } else {
        let errorMsg = result.errorMsg?.toString();
        Alert.alert(`设置前台显示通知失败, error: ${errorMsg}`);
    }
});

```

### setIOSBadgeNum

`function setIOSBadgeNum(num: number): Promise<PushResult>`

设置角标数

> **注意：只支持iOS平台**

返回值：

`Promise<PushResult>`

`PushResult`中包含两个key值:

+ `code`: 错误码
+ `errorMsg`: 错误信息

代码示例：

```javascript
AliyunPush.setIOSBadgeNum(+badge).then(result => {
    let code = result.code;
    if (code === AliyunPush.kAliyunPushSuccessCode) {
        setBadge('');
        Alert.alert(`设置角标 ${badge} 成功👋`);
    } else {
        let errorMsg = result.errorMsg?.toString();
        Alert.alert(`设置角标 ${badge} 失败, error: ${errorMsg}`);
    }
});
```

### syncIOSBadgeNum

`function syncIOSBadgeNum(num: number): Promise<PushResult>`

同步角标数

> **注意：只支持iOS平台**

返回值：

`Promise<PushResult>`

`PushResult`中包含两个key值:

+ `code`: 错误码
+ `errorMsg`: 错误信息

代码示例：

```javascript
AliyunPush.syncIOSBadgeNum(+badge).then(result => {
    let code = result.code;
    if (code === AliyunPush.kAliyunPushSuccessCode) {
        setBadge('');
        Alert.alert(`同步角标 ${badge} 成功👋`);
    } else {
        let errorMsg = result.errorMsg?.toString();
        Alert.alert(`同步角标 ${badge} 失败, error: ${errorMsg}`);
    }
});
```

### getApnsDeviceToken

`Future<String> getApnsDeviceToken() async`

获取APNs Token

> **注意：只支持iOS平台**

返回值：

`Promise<string>` - APNs Token

代码示例：

```javascript
AliyunPush.getApnsDeviceToken().then(result => {
    setApnsToken(result);
});
```

### isIOSChannelOpened

`function isIOSChannelOpened(): Promise<boolean>`

通知通道是否已打开

> **注意：只支持iOS平台**

返回值：

`bool` - true: 已打开; false：未打开

代码示例：

```javascript
AliyunPush.isIOSChannelOpened().then(opened => {
    if (opened) {
        Alert.alert('通道已打开');
    } else {
        Alert.alert('通道未打开');
    }
});
```

### setPluginLogEnabled

`function setPluginLogEnabled(enabled: boolean): void`

设置插件的日志是否开启

代码示例:

```javascript
AliyunPush.setPluginLogEnabled(true);
```

## 五、错误码

| 名称 | 值 |  含义 |
| --- | --- | --- |
| kAliyunPushSuccessCode | "10000" | 成功 |
| kAliyunPushFailedCode | "10001" | 通用失败码 |
| kAliyunPushOnlyAndroid | "10002" | 方法只支持Android平台|
| kAliyunPushOnlyIOS | "10003" | 方法只支持iOS平台 |
| kAliyunPushNotSupport | "10004" | 平台不支持，比如Android创建group只支持Android 8.0以上版本|
