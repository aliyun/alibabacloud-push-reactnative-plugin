#import "AliyunReactNativePush.h"
#import <AliyunReactNativePush/RNAliyunReactNativePushSpec.h>
#import <CloudPushSDK/CloudPushSDK.h>
#import <React/RCTConvert.h>
#import <React/RCTEventEmitter.h>


#pragma mark - 用户从iOS AppDelegate中调用本SDK的事件定义
static NSString* const kRemoteDeviceTokenRegistration = @"RemoteDeviceTokenRegistration";
static NSString* const kRemoteDeviceTokenRegisterError = @"RemoteDeviceTokenRegisterError";
static NSString* const kReceiveRemoteNotification = @"ReceiveRemoteNotification";
static NSString* const kForegroundReceiveNotification = @"ForegroundReceiveNotification";
static NSString* const kNotificationAction = @"NotificationAction";


#pragma mark - iOS发送给JS的事件定义
static NSString *const kOnRegisterDeviceTokenSuccess = @"AliyunPush_onRegisterDeviceTokenSuccess";
static NSString *const kOnRegisterDeviceTokenFailed = @"AliyunPush_onRegisterDeviceTokenFailed";
static NSString *const kOnNotification = @"AliyunPush_onNotification";
static NSString *const kOnNotificationOpened = @"AliyunPush_onNotificationOpened";
static NSString *const kOnNotificationRemoved = @"AliyunPush_onNotificationRemoved";
static NSString *const kOnChannelOpened = @"AliyunPush_onChannelOpened";
static NSString *const kOnMessage = @"AliyunPush_onMessage";


#pragma mark - Push Result Key定义
static NSString* const KEY_CODE = @"code";
static NSString* const KEY_ERROR = @"errorMsg";


#pragma mark - Push Result Value定义
static NSString* const CODE_SUCCESS = @"10000";
static NSString* const CODE_FAILED = @"10002";
static NSString* const CODE_ONLY_ANDROID = @"10003";
static NSString* const ERROR_ONLY_ANDROID = @"Only Support Android";



#pragma mark - 插件日志

// ---------------------------------------------
// 用于打印插件日志
// ---------------------------------------------

@interface AliyunPushLog : NSObject

+ (void)enableLog;

+ (BOOL)isLogEnabled;

+ (void)disableLog;

#define PushLogD(frmt, ...)\
if ([AliyunPushLog isLogEnabled]) {\
NSLog(@"[CloudPush Debug]: %@", [NSString stringWithFormat:(frmt), ##__VA_ARGS__]);\
}

#define PushLogE(frmt, ...)\
if ([AliyunPushLog isLogEnabled]) {\
NSLog(@"[CloudPush Error]: %@", [NSString stringWithFormat:(frmt), ##__VA_ARGS__]);\
}

@end

static BOOL logEnable = YES;

@implementation AliyunPushLog

+ (void)enableLog {
    logEnable = YES;
}

+ (BOOL)isLogEnabled {
    return logEnable;
}

+ (void)disableLog {
    logEnable = NO;
}

@end


#pragma mark - AliyunPush

// ---------------------------------------------
// AliyunPush implementation
// 用户应该在自己的 AppDelegate 中调用以下方法
// ---------------------------------------------

@implementation AliyunPush

+ (void)didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken {
    [[NSNotificationCenter defaultCenter] postNotificationName:kRemoteDeviceTokenRegistration
                                                        object:self
                                                      userInfo:@{@"deviceToken": deviceToken}];
}

+ (void)didFailToRegisterForRemoteNotificationsWithError:(NSError *)error {
    [[NSNotificationCenter defaultCenter] postNotificationName:kRemoteDeviceTokenRegisterError
                                                        object:self
                                                      userInfo:@{@"error": error}];
}

+ (void)didReceiveRemoteNotification:(NSDictionary *)userInfo {
    [[NSNotificationCenter defaultCenter] postNotificationName:kReceiveRemoteNotification
                                                        object:self
                                                      userInfo:@{@"notification": userInfo}];
}

+ (void)didReceiveRemoteNotification:(NSDictionary *)userInfo
              fetchCompletionHandler:(__strong AliyunPushRemoteNotificationCallback)completionHandler {
    [[NSNotificationCenter defaultCenter] postNotificationName:kReceiveRemoteNotification
                                                        object:self
                                                      userInfo:@{@"notification": userInfo, @"completionHandler": completionHandler}];
}

+ (void)userNotificationCenter:(UNUserNotificationCenter *)center
       willPresentNotification:(UNNotification *)notification
         withCompletionHandler:(AliyunPushForeReceiveNoticeCallback)completionHandler {
    [[NSNotificationCenter defaultCenter] postNotificationName:kForegroundReceiveNotification
                                                        object:self
                                                      userInfo:@{@"notification": notification, @"completionHandler": completionHandler}];
}

+ (void)userNotificationCenter:(UNUserNotificationCenter *)center
didReceiveNotificationResponse:(UNNotificationResponse *)response
         withCompletionHandler:(AliyunPushNotificationActionCallback)completionHandler {
    [[NSNotificationCenter defaultCenter] postNotificationName:kNotificationAction
                                                        object:self
                                                      userInfo:@{@"response": response, @"completionHandler": completionHandler}];
}

@end


#pragma mark - AliyunReactNativePush Turbo Modules

// ---------------------------------------------
// AliyunReactNativePush Turbo Modules
// ---------------------------------------------

@interface AliyunReactNativePush : RCTEventEmitter <NativeAliyunReactNativePushSpec>
@end

@implementation AliyunReactNativePush {
    BOOL _showNoticeWhenForeground;
}
RCT_EXPORT_MODULE()

+ (BOOL)requiresMainQueueSetup {
    return YES;
}

- (id)init {
    self = [super init];
    NSNotificationCenter *center = [NSNotificationCenter defaultCenter];
    [center addObserver:self selector:@selector(innerHandleDeviceTokenRegistered:) name:kRemoteDeviceTokenRegistration object:nil];
    [center addObserver:self selector:@selector(innerHandleDeviceTokenRegisterError:) name:kRemoteDeviceTokenRegisterError object:nil];
    [center addObserver:self selector:@selector(innerHandleReceiveRemoteNotification:) name:kReceiveRemoteNotification object:nil];
    [center addObserver:self selector:@selector(innerHandleForegroundReceiveNotification:) name:kForegroundReceiveNotification object:nil];
    [center addObserver:self selector:@selector(innerHandleNotificationAction:) name:kNotificationAction object:nil];
    return self;
}

- (NSArray<NSString *> *)supportedEvents
{
    return @[
        kOnRegisterDeviceTokenSuccess,
        kOnRegisterDeviceTokenFailed,
        kOnNotification,
        kOnNotificationOpened,
        kOnNotificationRemoved,
        kOnChannelOpened,
        kOnMessage
    ];
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
    return std::make_shared<facebook::react::NativeAliyunReactNativePushSpecJSI>(params);
}

// 内部统一处理 CloudPushSDK 调用结果
- (void)innerHandlePushCallbackResult:(CloudPushCallbackResult *)result
                              resolve:(RCTPromiseResolveBlock)resolve
                              dataKey:(NSString *)key
                              context:(NSString *)operation {
    if (result.success) {
        PushLogD(@"%@ succeeded with Aliyun Push Service", operation);
        if (key.length > 0) {
            resolve(@{KEY_CODE: CODE_SUCCESS, key: result.data});
        } else {
            resolve(@{KEY_CODE: CODE_SUCCESS});
        }
    } else {
        NSString *errorMsg = [NSString stringWithFormat:@"%@ failed with Aliyun Push Service. Error: %@",
                              operation, result.error ?: @"Unknown error"];
        PushLogE(@"%@", errorMsg);
        resolve(@{KEY_CODE: CODE_FAILED, KEY_ERROR: errorMsg});
    }
}

- (void)innerHandlePushCallbackResult:(CloudPushCallbackResult *)result
                              resolve:(RCTPromiseResolveBlock)resolve
                              context:(NSString *)operation {
    [self innerHandlePushCallbackResult:result resolve:resolve dataKey:nil context:operation];
}

- (void)rejectWithAndroidOnlyError:(RCTPromiseResolveBlock)resolve {
    resolve(@{KEY_CODE: CODE_ONLY_ANDROID,
            KEY_ERROR: ERROR_ONLY_ANDROID});
}

#pragma mark - Turbo Module Spec

// ---------------------------------------------
// Turbo Module Spec implementation
// ---------------------------------------------

- (void)addAlias:(NSString *)alias
         resolve:(RCTPromiseResolveBlock)resolve
          reject:(RCTPromiseRejectBlock)reject {
    [CloudPushSDK addAlias:alias withCallback:^(CloudPushCallbackResult *res) {
        [self innerHandlePushCallbackResult:res
                                    resolve:resolve
                                    context:@"Add alias"];
    }];
}

- (void)bindAccount:(NSString *)account
            resolve:(RCTPromiseResolveBlock)resolve
             reject:(RCTPromiseRejectBlock)reject {
    [CloudPushSDK bindAccount:account withCallback:^(CloudPushCallbackResult *res) {
        [self innerHandlePushCallbackResult:res
                                    resolve:resolve
                                    context:@"Bind account"];
    }];
}

- (void)bindAndroidPhoneNumber:(NSString *)phone resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject { 
    [self rejectWithAndroidOnlyError:resolve];
}

- (void)bindTag:(NSArray *)tags target:(double)target alias:(NSString *)alias resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
    [CloudPushSDK bindTag:target 
                 withTags:tags
                withAlias:alias
             withCallback:^(CloudPushCallbackResult *res) {
        [self innerHandlePushCallbackResult:res
                                    resolve:resolve
                                    context:@"Bind tag"];
    }];
}

- (void)clearAndroidNotifications:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject { 
    [self rejectWithAndroidOnlyError:resolve];
}

- (void)createAndroidChannel:(JS::NativeAliyunReactNativePush::CreateAndroidChannelParams &)params resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
    [self rejectWithAndroidOnlyError:resolve];
}

- (void)createAndroidChannelGroup:(NSString *)id name:(NSString *)name desc:(NSString *)desc resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject { 
    [self rejectWithAndroidOnlyError:resolve];
}

- (void)getDeviceId:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject { 
    NSString *deviceId = [CloudPushSDK getDeviceId];
    resolve(deviceId);
}

- (void)getIosApnsDeviceToken:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject { 
    NSString *deviceToken = [CloudPushSDK getApnsDeviceToken];
    resolve(deviceToken);
}

- (void)initAndroidThirdPush:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject { 
    [self rejectWithAndroidOnlyError:resolve];
}

- (void)initPush:(NSString *)appKey appSecret:(NSString *)appSecret resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
    [self registerAPNs];
    [self registerAliyunElsChannelMessageAndEvent];
    
    [CloudPushSDK startWithAppkey:appKey
                        appSecret:appSecret
                         callback:^(CloudPushCallbackResult *res) {
        [self innerHandlePushCallbackResult:res
                                    resolve:resolve
                                    context:@"Init push"];
    }];
}

- (void)isAndroidNotificationEnabled:(NSString *)id resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject { 
    [self rejectWithAndroidOnlyError:resolve];
}

- (void)isIosChannelOpened:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject { 
    BOOL opened = [CloudPushSDK isChannelOpened];
    resolve(@(opened));
}

- (void)jumpToAndroidNotificationSettings:(NSString *)id { 
    PushLogE(@"iOS platform does not support jumping to notification settings page");
}

- (void)listAlias:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject { 
    [CloudPushSDK listAliases:^(CloudPushCallbackResult *res) {
        [self innerHandlePushCallbackResult:res
                                    resolve:resolve
                                    dataKey:@"aliasList"
                                    context:@"List alias"];
    }];
}

- (void)listTags:(double)target resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject { 
    [CloudPushSDK listTags:target withCallback:^(CloudPushCallbackResult *res) {
        [self innerHandlePushCallbackResult:res
                                    resolve:resolve
                                    dataKey:@"tagsList"
                                    context:@"List tags"];
    }];
}

- (void)removeAlias:(NSString *)alias resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject { 
    [CloudPushSDK removeAlias:alias withCallback:^(CloudPushCallbackResult *res) {
        [self innerHandlePushCallbackResult:res
                                    resolve:resolve
                                    context:@"Remove alias"];
    }];
}

- (void)setAndroidNotificationInGroup:(BOOL)inGroup resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject { 
    [self rejectWithAndroidOnlyError:resolve];
}

- (void)setIosBadgeNum:(double)num resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject { 
    if (@available(iOS 16.0, *)) {
        UNUserNotificationCenter *_notificationCenter = [UNUserNotificationCenter currentNotificationCenter];
        [_notificationCenter setBadgeCount:num withCompletionHandler:^(NSError * _Nullable error) {
            if (error == nil) {
                resolve(@{KEY_CODE: CODE_SUCCESS});
            } else {
                resolve(@{KEY_CODE:CODE_FAILED, KEY_ERROR: error.localizedDescription});
            }
        }];
    } else {
        RCTExecuteOnMainQueue(^{
            RCTSharedApplication().applicationIconBadgeNumber = num;
            resolve(@{KEY_CODE: CODE_SUCCESS});
        });
    }
}

- (void)setPluginLogEnabled:(BOOL)enabled { 
    if (enabled) {
      [AliyunPushLog enableLog];
    } else {
      [AliyunPushLog disableLog];
    }
}

- (void)showIosNoticeWhenForeground:(BOOL)enable resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject { 
    _showNoticeWhenForeground = enable;
    resolve(@{KEY_CODE:CODE_SUCCESS});
}

- (void)syncIosBadgeNum:(double)num resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject { 
    [CloudPushSDK syncBadgeNum:num withCallback:^(CloudPushCallbackResult *res) {
        [self innerHandlePushCallbackResult:res
                                    resolve:resolve
                                    context:@"Sync badge number"];
    }];
}

- (void)unbindAccount:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject { 
    [CloudPushSDK unbindAccount:^(CloudPushCallbackResult *res) {
        [self innerHandlePushCallbackResult:res
                                    resolve:resolve
                                    context:@"Unbind account"];
    }];
}

- (void)unbindAndroidPhoneNumber:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject { 
    [self rejectWithAndroidOnlyError:resolve];
}

- (void)unbindTag:(NSArray *)tags target:(double)target alias:(NSString *)alias resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject { 
    [CloudPushSDK unbindTag:target withTags:tags withAlias:alias withCallback:^(CloudPushCallbackResult *res){
        [self innerHandlePushCallbackResult:res
                                    resolve:resolve
                                    context:@"Unbind tag"];
    }];
}

- (void)setLogLevel:(nonnull NSString *)levelString {
    MPLogLevel level = MPLogLevelNone;
    if ([levelString isEqualToString:@"none"]) {
        level = MPLogLevelNone;
    } else if ([levelString isEqualToString:@"error"]) {
        level = MPLogLevelError;
    } else if ([levelString isEqualToString:@"warn"]) {
        level = MPLogLevelWarn;
    } else if ([levelString isEqualToString:@"info"]) {
        level = MPLogLevelInfo;
    } else if ([levelString isEqualToString:@"debug"]) {
        level = MPLogLevelDebug;
    }
    
    [CloudPushSDK setLogLevel:level];
}


#pragma mark - SDK内部用于异步处理通知回调、推送令牌的相关方法

// ---------------------------------------------
// 内部处理iOS事件
// ---------------------------------------------

// 处理APNs注册成功
- (void)innerHandleDeviceTokenRegistered: (NSNotification *)notification {
    NSData* deviceToken = notification.userInfo[@"deviceToken"];
    [CloudPushSDK registerDevice:deviceToken withCallback:^(CloudPushCallbackResult *res) {
        if (res.success) {
            PushLogD(@"Successfully registered APNs device token with Aliyun Push Service: %@", [CloudPushSDK getApnsDeviceToken]);
            NSMutableDictionary *dic = [NSMutableDictionary dictionary];
            [dic setValue:[CloudPushSDK getApnsDeviceToken] forKey:@"apnsDeviceToken"];
            [self sendEventWithName:kOnRegisterDeviceTokenSuccess body:dic];
        } else {
            PushLogE(@"Failed to register APNs device token with Aliyun Push Service. Error: %@", res.error.localizedDescription ?: @"Unknown error");
            NSMutableDictionary *dic = [NSMutableDictionary dictionary];
            [dic setValue:res.error forKey:@"error"];
            [self sendEventWithName:kOnRegisterDeviceTokenFailed body:dic];
        }
    }];
    PushLogD(@"APNs registration succeeded; device token will be automatically registered with Aliyun Push Service.");
}

// 处理APNs注册失败
- (void)innerHandleDeviceTokenRegisterError: (NSNotification *)notification {
    NSError* error = notification.userInfo[@"error"];
    NSMutableDictionary *dic = [NSMutableDictionary dictionary];
    [dic setValue:error.userInfo.description forKey:@"error"];
    [self sendEventWithName:kOnRegisterDeviceTokenFailed body:dic];
    PushLogE(@"APNs registration failed with error: %@", error.localizedDescription);
}

// 处理静默通知
- (void)innerHandleReceiveRemoteNotification: (NSNotification *) notification {
    NSDictionary *userInfo = notification.userInfo[@"notification"];
    AliyunPushRemoteNotificationCallback completionHandler = notification.userInfo[@"completionHandler"];
    
    [CloudPushSDK sendNotificationAck:userInfo];
    [self sendEventWithName:kOnNotification body:userInfo];

    if (completionHandler != nil) {
        completionHandler(UIBackgroundFetchResultNewData);
    }
    PushLogD(@"Remote notification received, userInfo: %@", userInfo);
}

// 处理前台通知
- (void)innerHandleForegroundReceiveNotification: (NSNotification *) notification {
    UNNotification *unNotification = notification.userInfo[@"notification"];
    AliyunPushForeReceiveNoticeCallback completionHandler = notification.userInfo[@"completionHandler"];
    NSString *notificationID = unNotification.request.identifier;

    if(_showNoticeWhenForeground) {
        // 通知弹出，且带有声音、内容和角标
        PushLogD(@"Foreground notification received and displayed (ID: %@).", notificationID);
        if (completionHandler) {
            if (@available(iOS 14.0, *)) {
                completionHandler(UNNotificationPresentationOptionSound | UNNotificationPresentationOptionList | UNNotificationPresentationOptionBanner | UNNotificationPresentationOptionBadge);
            } else {
#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdeprecated-declarations"
        completionHandler(UNNotificationPresentationOptionSound | UNNotificationPresentationOptionAlert | UNNotificationPresentationOptionBadge);
#pragma clang diagnostic pop
            }
        }
    } else {
        // 处理iOS 10通知，并上报通知打开回执
        PushLogD(@"Foreground notification received and not displayed (ID: %@), processed with callback.", notificationID);
        [self handleiOS10Notification:unNotification];
        // 通知不弹出
        if (completionHandler != nil) {
            completionHandler(UNNotificationPresentationOptionNone);
        }
    }
}

// 处理点击事件
- (void)innerHandleNotificationAction: (NSNotification *) notification {
    UNNotificationResponse *response = notification.userInfo[@"response"];
    NSString *userAction = response.actionIdentifier;

    if ([userAction isEqualToString:UNNotificationDefaultActionIdentifier]) {
        // 点击通知打开
        [CloudPushSDK sendNotificationAck:response.notification.request.content.userInfo];
        PushLogD(@"Notification opened.");
        [self sendEventWithName:kOnNotificationOpened body:response.notification.request.content.userInfo];
    }
    // 通知dismiss，category创建时传入UNNotificationCategoryOptionCustomDismissAction才可以触发
    if ([userAction isEqualToString:UNNotificationDismissActionIdentifier]) {
        //通知删除回执上报
        [CloudPushSDK sendDeleteNotificationAck:response.notification.request.content.userInfo];
        PushLogD(@"Notification dismissed.");
        [self sendEventWithName:kOnNotificationRemoved body:response.notification.request.content.userInfo];
    }
    
    AliyunPushNotificationActionCallback completionHandler = notification.userInfo[@"completionHandler"];
    if (completionHandler != nil) {
        completionHandler();
    }
}

// 处理前台通知
- (void)handleiOS10Notification:(UNNotification *)notification {
    UNNotificationRequest *request = notification.request;
    UNNotificationContent *content = request.content;
    NSDictionary *userInfo = content.userInfo;
    
    // 通知角标数清0
    [UIApplication sharedApplication].applicationIconBadgeNumber = 0;
    //  同步角标数到服务端
    [CloudPushSDK syncBadgeNum:0 withCallback:^(CloudPushCallbackResult *res) {
        if (res.success) {
            PushLogD(@"Successfully synced badge number to 0 with Aliyun Push Service");
        } else {
            PushLogE(@"Failed to sync badge number to 0 with Aliyun Push Service. Error: %@", res.error.localizedDescription ?: @"Unknown error");
        }
    }];
    
    // 通知打开回执上报
    [CloudPushSDK sendNotificationAck:userInfo];
    [self sendEventWithName:kOnNotification body:userInfo];
}


#pragma mark - APNs注册、长连通道消息与事件注册

// ---------------------------------------------
// 内部工具方法
// ---------------------------------------------

// 请求通知权限并在得到授权后向APNs注册，获取deviceToken
-(void)registerAPNs {
    UNUserNotificationCenter *_notificationCenter = [UNUserNotificationCenter currentNotificationCenter];
    [_notificationCenter requestAuthorizationWithOptions:UNAuthorizationOptionAlert | UNAuthorizationOptionBadge | UNAuthorizationOptionSound completionHandler:^(BOOL granted, NSError * _Nullable error) {
        if (granted) {
            PushLogD(@"User authorized notifications");
            dispatch_async(dispatch_get_main_queue(), ^{
                [RCTSharedApplication() registerForRemoteNotifications];
                PushLogD(@"Registered APNs for remote notifications");
            });
        } else {
            if (error) {
                PushLogD(@"Authorization failed with error: %@", error.localizedDescription);
            } else {
                PushLogD(@"User denied notification authorization");
            }
        }
    }];
}

- (void)registerAliyunElsChannelMessageAndEvent {
    NSNotificationCenter *center = [NSNotificationCenter defaultCenter];

    [center addObserver:self
               selector:@selector(onElsChannelOpened:)
                   name:@"CCPDidChannelConnectedSuccess"
                 object:nil];

    [center addObserver:self
               selector:@selector(onElsMessageReceived:)
                   name:@"CCPDidReceiveMessageNotification"
                 object:nil];
}

- (void)onElsChannelOpened:(NSNotification *)notification {
    PushLogD(@"Aliyun Channel opened");
    [self sendEventWithName:kOnChannelOpened body:nil];
}

- (void)onElsMessageReceived:(NSNotification *)notification {
    NSDictionary *data = notification.object;
    NSString *title = data[@"title"];
    NSString *body = data[@"content"];
    
    NSDictionary *eventBody = @{
        @"title": title ?: @"",
        @"body": body ?: @""
    };
    
    PushLogD(@"Aliyun Message received - Title: %@, Body: %@", title, body);
    [self sendEventWithName:kOnMessage body:eventBody];
}

@end
