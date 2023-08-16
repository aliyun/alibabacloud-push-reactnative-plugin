#import "AliyunReactNativePush.h"
#import <React/RCTBridge.h>
#import <React/RCTConvert.h>
#import <React/RCTEventDispatcher.h>
#import <CloudPushSDK/CloudPushSDK.h>

static NSString* const KEY_CODE = @"code";
static NSString* const KEY_ERROR_MSG = @"errorMsg";

static NSString* const CODE_SUCCESS = @"10000";
static NSString* const CODE_PARAMS_ILLEGAL = @"10001";
static NSString* const CODE_FAILED = @"10002";

static NSString* const kRemoteDeviceTokenRegistration = @"RemoteDeviceTokenRegistration";
static NSString* const kRemoteDeviceTokenRegisterError = @"RemoteDeviceTokenRegisterError";
static NSString* const kReceiveRemoteNotification = @"ReceiveRemoteNotification";
static NSString* const kForegroundReceiveNotification = @"ForegroundReceiveNotification";
static NSString* const kNotificationAction = @"NotificationAction";


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

@implementation AliyunPush {
    BOOL _showNoticeWhenForeground;
}

RCT_EXPORT_MODULE()

+ (BOOL)requiresMainQueueSetup
{
    return YES;
}

- (id) init {
    self = [super init];
    NSNotificationCenter *center = [NSNotificationCenter defaultCenter];
    [center addObserver:self selector:@selector(handleDeviceTokenRegistered:) name:kRemoteDeviceTokenRegistration object:nil];
    [center addObserver:self selector:@selector(handleDeviceTokenRegisterError:) name:kRemoteDeviceTokenRegisterError object:nil];
    [center addObserver:self selector:@selector(handleReceiveRemoteNotification:) name:kReceiveRemoteNotification object:nil];
    [center addObserver:self selector:@selector(handleForegroundReceiveNotification:) name:kForegroundReceiveNotification object:nil];
    [center addObserver:self selector:@selector(handleNotificationAction:) name:kNotificationAction object:nil];
    return self;
}

- (NSArray<NSString *> *)supportedEvents
{
  return @[@"AliyunPush_onRegisterDeviceTokenSuccess",
           @"AliyunPush_onRegisterDeviceTokenFailed",
           @"AliyunPush_onNotification",
           @"AliyunPush_onNotificationOpened",
           @"AliyunPush_onNotificationRemoved",
           @"AliyunPush_onChannelOpened",
           @"AliyunPush_onMessage"
  ];
}

+ (void) didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken {
    [[NSNotificationCenter defaultCenter] postNotificationName:kRemoteDeviceTokenRegistration object:self userInfo:@{@"deviceToken": deviceToken}];
}


+ (void) didFailToRegisterForRemoteNotificationsWithError:(NSError *)error {
    [[NSNotificationCenter defaultCenter] postNotificationName:kRemoteDeviceTokenRegisterError object:self userInfo:@{@"error": error}];
}

+ (void) didReceiveRemoteNotification:(NSDictionary *)userInfo {
    [[NSNotificationCenter defaultCenter] postNotificationName:kReceiveRemoteNotification object:self userInfo:@{@"notification": userInfo}];
}

+ (void) didReceiveRemoteNotifiaction:(NSDictionary *)userInfo fetchCompletionHandler:(AliyunPushRemoteNotificationCallback)completionHandler {
    [[NSNotificationCenter defaultCenter] postNotificationName:kReceiveRemoteNotification object:self userInfo:@{@"notification": userInfo, @"completionHandler": completionHandler}];
}

+ (void) userNotificationCenter:(UNUserNotificationCenter *)center willPresentNotification:(UNNotification *)notification withCompletionHandler:(void (^)(UNNotificationPresentationOptions))completionHandler{
    [[NSNotificationCenter defaultCenter] postNotificationName:kForegroundReceiveNotification object:self userInfo:@{@"notification": notification, @"completionHandler": completionHandler}];
}

+ (void) userNotificationCenter:(UNUserNotificationCenter *)center didReceiveNotificationResponse:(UNNotificationResponse *)response withCompletionHandler:(void (^)(void))completionHandler {
    [[NSNotificationCenter defaultCenter] postNotificationName:kNotificationAction object:self userInfo:@{@"response": response, @"completionHandler": completionHandler}];
}

- (void) handleDeviceTokenRegistered: (NSNotification *)notification {
    NSData* deviceToken = notification.userInfo[@"deviceToken"];
    [CloudPushSDK registerDevice:deviceToken withCallback:^(CloudPushCallbackResult *res) {
        if (res.success) {
            PushLogD(@"Register deviceToken successfully, deviceToken: %@",[CloudPushSDK getApnsDeviceToken]);
            NSMutableDictionary *dic = [NSMutableDictionary dictionary];
            [dic setValue:[CloudPushSDK getApnsDeviceToken] forKey:@"apnsDeviceToken"];
            [self sendEventWithName:@"AliyunPush_onRegisterDeviceTokenSuccess" body:dic];
        } else {
            PushLogD(@"Register deviceToken failed, error: %@", res.error);
            NSMutableDictionary *dic = [NSMutableDictionary dictionary];
            [dic setValue:res.error forKey:@"error"];
            [self sendEventWithName:@"AliyunPush_onRegisterDeviceTokenFailed" body:dic];
        }
    }];
    PushLogD(@"####### ===> APNs register success");
}

- (void) handleDeviceTokenRegisterError: (NSNotification *)notification {
    NSError* error = notification.userInfo[@"error"];
    NSMutableDictionary *dic = [NSMutableDictionary dictionary];
    [dic setValue:error.userInfo.description forKey:@"error"];
    [self sendEventWithName:@"AliyunPush_onRegisterDeviceTokenFailed" body:dic];
}

- (void) handleReceiveRemoteNotification: (NSNotification *) notification {
    NSDictionary *userInfo = notification.userInfo[@"notification"];
    AliyunPushRemoteNotificationCallback completionHandler = notification.userInfo[@"completionHandler"];
    
   //服务端中extras字段，key是自己定义的
    PushLogD(@"onNotification userInfo =%@", userInfo);
    
    [CloudPushSDK sendNotificationAck:userInfo];
    [self sendEventWithName:@"AliyunPush_onNotification" body:userInfo];

    if (completionHandler != nil) {
        completionHandler(UIBackgroundFetchResultNewData);
    }
}

- (void) handleForegroundReceiveNotification: (NSNotification *) notification {
    UNNotification *unnotification = notification.userInfo[@"notification"];
    AliyunPushForeReceiveNoticeCallback completionHandler = notification.userInfo[@"completionHandler"];
    if(_showNoticeWhenForeground) {
        // 通知弹出，且带有声音、内容和角标
        if (completionHandler != nil) {
            completionHandler(UNNotificationPresentationOptionSound | UNNotificationPresentationOptionAlert | UNNotificationPresentationOptionBadge);
        }
    } else {
        // 处理iOS 10通知，并上报通知打开回执
        [self handleiOS10Notification:unnotification];
        // 通知不弹出
        if (completionHandler != nil) {
            completionHandler(UNNotificationPresentationOptionNone);
        }
    }
}

- (void) handleNotificationAction: (NSNotification *) notification {
    UNNotificationResponse *response = notification.userInfo[@"response"];
    NSString *userAction = response.actionIdentifier;
    // 点击通知打开
    if ([userAction isEqualToString:UNNotificationDefaultActionIdentifier]) {
        [CloudPushSDK sendNotificationAck:response.notification.request.content.userInfo];
        NSLog(@"###### AliyunPush_onNotificationOpened");
        [self sendEventWithName:@"AliyunPush_onNotificationOpened" body:response.notification.request.content.userInfo];
    }
    // 通知dismiss，category创建时传入UNNotificationCategoryOptionCustomDismissAction才可以触发
    if ([userAction isEqualToString:UNNotificationDismissActionIdentifier]) {
        //通知删除回执上报
        [CloudPushSDK sendDeleteNotificationAck:response.notification.request.content.userInfo];
        [self sendEventWithName:@"AliyunPush_onNotificationRemoved" body:response.notification.request.content.userInfo];
    }
    
    AliyunPushNotificationActionCallback completionHandler = notification.userInfo[@"completionHandler"];
    if (completionHandler != nil) {
        completionHandler();
    }
}

- (void)handleiOS10Notification:(UNNotification *)notification {
    UNNotificationRequest *request = notification.request;
    UNNotificationContent *content = request.content;
    NSDictionary *userInfo = content.userInfo;
    
    // 通知角标数清0
    [UIApplication sharedApplication].applicationIconBadgeNumber = 0;
    //  同步角标数到服务端
    [CloudPushSDK syncBadgeNum:0 withCallback:^(CloudPushCallbackResult *res) {
        if (res.success) {
            PushLogD(@"Sync badge num: 0 success.");
        } else {
            PushLogD(@"Sync badge num: 0 failed, error: %@", res.error);
        }
    }];
    
    
    // 通知打开回执上报
    [CloudPushSDK sendNotificationAck:userInfo];
    PushLogD(@"onNotification userInfo = %@", userInfo);
    
    [self sendEventWithName:@"AliyunPush_onNotification" body:userInfo];
}


RCT_REMAP_METHOD(initPush,
                 initPushWithAppKey:(NSString*)appKey
                 initPushWithAppSecret:(NSString*)appSecret
                 withResolver:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject) {
    if (!appKey || !appKey.length) {
        resolve(@{KEY_CODE: CODE_PARAMS_ILLEGAL, @"errorMsg": @"appKey config error"});
        return;
    }

    if (!appSecret|| !appSecret.length) {
        resolve(@{KEY_CODE: CODE_PARAMS_ILLEGAL, @"errorMsg": @"appSecret config error"});
        return;
    }
    
    
    [self registerAPNS];
    
    //初始化
    [CloudPushSDK asyncInit:appKey appSecret:appSecret callback:^(CloudPushCallbackResult *res) {
        if (res.success) {
            PushLogD(@"Push SDK init success, deviceId: %@.", [CloudPushSDK getDeviceId]);
            resolve(@{KEY_CODE:CODE_SUCCESS});
        } else {
            PushLogD(@"Push SDK init failed, error: %@", res.error);
            resolve(@{KEY_CODE:CODE_FAILED, @"errorMsg": [NSString stringWithFormat:@"errorCode: %ld", res.error.code]});
        }
    }];
    
    [self listenerOnChannelOpened];
    [self registerMessageReceive];
}


-(void)registerAPNS {
    float systemVersionNum = [[[UIDevice currentDevice] systemVersion] floatValue];
    if (systemVersionNum >= 10.0) {
        // iOS 10 notifications
        UNUserNotificationCenter *_notificationCenter = [UNUserNotificationCenter currentNotificationCenter];
        // 请求推送权限
        [_notificationCenter requestAuthorizationWithOptions:UNAuthorizationOptionAlert | UNAuthorizationOptionBadge | UNAuthorizationOptionSound completionHandler:^(BOOL granted, NSError * _Nullable error) {
            if (granted) {
                // granted
                PushLogD(@"####### ===> User authored notification.");
                // 向APNs注册，获取deviceToken
                dispatch_async(dispatch_get_main_queue(), ^{
                    [RCTSharedApplication() registerForRemoteNotifications];
                });
            } else {
                // not granted
                PushLogD(@"####### ===> User denied notification.");
            }
        }];
    } else if (systemVersionNum >= 8.0) {
#pragma clang diagnostic push
#pragma clang diagnostic ignored"-Wdeprecated-declarations"
        [RCTSharedApplication() registerUserNotificationSettings:
         [UIUserNotificationSettings settingsForTypes:
          (UIUserNotificationTypeSound | UIUserNotificationTypeAlert | UIUserNotificationTypeBadge)
                                           categories:nil]];
        [RCTSharedApplication() registerForRemoteNotifications];
#pragma clang diagnostic pop
    } else {
#pragma clang diagnostic push
#pragma clang diagnostic ignored"-Wdeprecated-declarations"
        [RCTSharedApplication()registerForRemoteNotificationTypes:
         (UIRemoteNotificationTypeAlert | UIRemoteNotificationTypeBadge | UIRemoteNotificationTypeSound)];
#pragma clang diagnostic pop
    }
}

#pragma mark Channel Opened
/**
 *    注册推送通道打开监听
 */
- (void)listenerOnChannelOpened {
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(onChannelOpened:)
                                                 name:@"CCPDidChannelConnectedSuccess"
                                               object:nil];
}

/**
 *    推送通道打开回调
 *
 */
- (void)onChannelOpened:(NSNotification *)notification {
    [self sendEventWithName:@"AliyunPush_onChannelOpened" body:nil];
}

#pragma mark Receive Message
/**
 *    @brief    注册推送消息到来监听
 */
- (void)registerMessageReceive {
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(onMessageReceived:)
                                                 name:@"CCPDidReceiveMessageNotification"
                                               object:nil];
}

/**
 *    处理到来推送消息
 *
 */
- (void)onMessageReceived:(NSNotification *)notification {
    CCPSysMessage *message = [notification object];
    NSMutableDictionary *dic = [NSMutableDictionary dictionary];
    NSString *title = [[NSString alloc] initWithData:message.title encoding:NSUTF8StringEncoding];
    NSString *body = [[NSString alloc] initWithData:message.body encoding:NSUTF8StringEncoding];
    [dic setValue:title forKey:@"title"];
    [dic setValue:body forKey:@"body"];
    PushLogD(@"Push SDK onMessageReceived: title: %@, body: %@", title, body);
    [self sendEventWithName:@"AliyunPush_onMessage" body:dic];
}

RCT_REMAP_METHOD(closeCCPChannel,
                 closeCCPWithResolver:(RCTPromiseResolveBlock)resolve
                 closeCCPWithRejecter:(RCTPromiseRejectBlock)reject){
    [CloudPushSDK closeCCPChannel];
    resolve(@{KEY_CODE: CODE_SUCCESS});
}

RCT_REMAP_METHOD(getDeviceId,
                 getDeviceIdWithResolver:(RCTPromiseResolveBlock)resolve
                 getDeviceIdWithRejecter:(RCTPromiseRejectBlock)reject)
{
    resolve([CloudPushSDK getDeviceId]);
}

RCT_REMAP_METHOD(turnOnDebug,
                 turnOnDebugWithResolver:(RCTPromiseResolveBlock)resolve
                 turnOnDebugWithRejecter:(RCTPromiseRejectBlock)reject) {
    [CloudPushSDK turnOnDebug];
    resolve(@{KEY_CODE: CODE_SUCCESS});
}

RCT_REMAP_METHOD(bindAccount,
                 bindAccountWithAccount:(NSString *)account
                 bindAccountWithResolver:(RCTPromiseResolveBlock)resolve
                 bindAccountWithRejecter:(RCTPromiseRejectBlock)reject) {
    if (account) {
        [CloudPushSDK bindAccount:account withCallback:^(CloudPushCallbackResult *res) {
            if (res.success) {
                resolve(@{KEY_CODE:CODE_SUCCESS});
            } else {
                resolve(@{KEY_CODE:CODE_FAILED, KEY_ERROR_MSG: [NSString stringWithFormat:@"errorCode: %ld", res.error.code]});
            }
        }];
    } else {
        resolve(@{KEY_CODE: CODE_PARAMS_ILLEGAL, KEY_ERROR_MSG: @"account can not be empty"});
    }
}

RCT_REMAP_METHOD(unbindAccount,
                 unbindAccountWithResolver:(RCTPromiseResolveBlock)resolve
                 unbindAccountWithRejecter:(RCTPromiseRejectBlock)reject) {
    [CloudPushSDK unbindAccount:^(CloudPushCallbackResult *res) {
        if (res.success) {
            resolve(@{KEY_CODE:CODE_SUCCESS});
        } else {
            resolve(@{KEY_CODE:CODE_FAILED, KEY_ERROR_MSG: [NSString stringWithFormat:@"errorCode: %ld", res.error.code]});
        }
    }];
}

RCT_REMAP_METHOD(addAlias, addAliasWithAlias:(NSString *)alias
                 addAliasWithResolver:(RCTPromiseResolveBlock)resolve
                 addAliasWithRejecter:(RCTPromiseRejectBlock)reject) {
    if (alias) {
        [CloudPushSDK addAlias:alias withCallback:^(CloudPushCallbackResult *res) {
            if (res.success) {
                resolve(@{KEY_CODE:CODE_SUCCESS});
            } else {
                resolve(@{KEY_CODE:CODE_FAILED, KEY_ERROR_MSG: [NSString stringWithFormat:@"errorCode: %ld", res.error.code]});
            }
        }];
    } else {
        resolve(@{KEY_CODE: CODE_PARAMS_ILLEGAL, KEY_ERROR_MSG: @"alias can not be empty"});
    }
}

RCT_REMAP_METHOD(removeAlias, removeAliasWithAlias:(NSString *)alias
                 removeAliasWithResolver:(RCTPromiseResolveBlock)resolve
                 removeAliasWithRejecter:(RCTPromiseRejectBlock)reject) {
    if (alias) {
        [CloudPushSDK removeAlias:alias withCallback:^(CloudPushCallbackResult *res) {
            if (res.success) {
                resolve(@{KEY_CODE:CODE_SUCCESS});
            } else {
                resolve(@{KEY_CODE:CODE_FAILED, KEY_ERROR_MSG: [NSString stringWithFormat:@"errorCode: %ld", res.error.code]});
            }
        }];
    } else {
        resolve(@{KEY_CODE: CODE_PARAMS_ILLEGAL, KEY_ERROR_MSG: @"alias can not be empty"});
    }
}

RCT_REMAP_METHOD(listAlias,
                 listAliasWithResolver:(RCTPromiseResolveBlock)resolve
                 listAliasWithRejecter:(RCTPromiseRejectBlock)reject) {
    [CloudPushSDK listAliases:^(CloudPushCallbackResult *res) {
        if (res.success) {
            resolve(@{KEY_CODE:CODE_SUCCESS, @"aliasList": res.data});
        } else {
            resolve(@{KEY_CODE:CODE_FAILED, KEY_ERROR_MSG: [NSString stringWithFormat:@"errorCode: %ld", res.error.code]});
        }
    }];
}

RCT_REMAP_METHOD(bindTag,
                 bindTagWithTags:(NSArray *)tags
                 bindTagWithTarget:(int)target
                 bindTagWithAlias:(NSString *)alias
                 bindTagWithResolver:(RCTPromiseResolveBlock)resolve
                 bindTagWithRejecter:(RCTPromiseRejectBlock)reject
                 ) {
    if (tags && tags.count != 0) {
        if (target != 1 && target != 2 && target != 3) {
            target = 1;
        }
        [CloudPushSDK bindTag:target withTags:tags withAlias:alias withCallback:^(CloudPushCallbackResult *res){
            if (res.success) {
                resolve(@{KEY_CODE:CODE_SUCCESS});
            } else {
                resolve(@{KEY_CODE:CODE_FAILED, KEY_ERROR_MSG: [NSString stringWithFormat:@"errorCode: %ld", res.error.code]});
            }
        }];
    } else {
        resolve(@{KEY_CODE: CODE_PARAMS_ILLEGAL, KEY_ERROR_MSG: @"tags can not be empty"});
    }
}

RCT_REMAP_METHOD(unbindTag,
                 unbindTagWithTags:(NSArray *)tags
                 unbindTagWithTarget:(int)target
                 unbindTagWithAlias:(NSString *)alias
                 unbindTagWithResolver:(RCTPromiseResolveBlock)resolve
                 unbindTagWithRejecter:(RCTPromiseRejectBlock)reject
                 ) {
    if (tags && tags.count != 0) {
        if (target != 1 && target != 2 && target != 3) {
            target = 1;
        }
        [CloudPushSDK unbindTag:target withTags:tags withAlias:alias withCallback:^(CloudPushCallbackResult *res){
            if (res.success) {
                resolve(@{KEY_CODE:CODE_SUCCESS});
            } else {
                resolve(@{KEY_CODE:CODE_FAILED, KEY_ERROR_MSG: [NSString stringWithFormat:@"errorCode: %ld", res.error.code]});
            }
        }];
    } else {
        resolve(@{KEY_CODE: CODE_PARAMS_ILLEGAL, KEY_ERROR_MSG: @"tags can not be empty"});
    }
}

RCT_REMAP_METHOD(listTags,
                 listTagsWithTarget:(int)target
                 listTagsWithResolver:(RCTPromiseResolveBlock)resolve
                 listTagsWithRejecter:(RCTPromiseRejectBlock)reject
                 ) {
    if (target != 1 && target != 2 && target != 3) {
        target = 1;
    }
    [CloudPushSDK listTags:target withCallback:^(CloudPushCallbackResult *res){
        if (res.success) {
            resolve(@{KEY_CODE:CODE_SUCCESS, @"tagsList": res.data});
        } else {
            resolve(@{KEY_CODE:CODE_FAILED, KEY_ERROR_MSG: [NSString stringWithFormat:@"errorCode: %ld", res.error.code]});
        }
    }];
}

RCT_REMAP_METHOD(setBadgeNum,
                 setBadgeNumWithNum:(int)num
                 setBadgeNumWithResolver:(RCTPromiseResolveBlock)resolve
                 setBadgeNumWithRejecter:(RCTPromiseRejectBlock)reject) {
    RCTSharedApplication().applicationIconBadgeNumber = num;
    resolve(@{KEY_CODE: CODE_SUCCESS});
}

RCT_REMAP_METHOD(syncBadgeNum,
                 syncBadgeNumWithNum:(int)num
                 syncBadgeNumWithResolver:(RCTPromiseResolveBlock)resolve
                 syncBadgeNumWithRejecter:(RCTPromiseRejectBlock)reject) {
    [CloudPushSDK syncBadgeNum:num withCallback:^(CloudPushCallbackResult *res) {
        if (res.success) {
            PushLogD(@"Sync badge num: [%lu] success.", (unsigned long)num);
            resolve(@{KEY_CODE: CODE_SUCCESS});
        } else {
            PushLogD(@"Sync badge num: [%lu] failed, error: %@", (unsigned long)num, res.error);
            resolve(@{KEY_CODE: CODE_FAILED, KEY_ERROR_MSG: [NSString stringWithFormat:@"errorCode: %ld", res.error.code]});
        }
    }];
}

RCT_REMAP_METHOD(showNoticeWhenForeground, showNoticeWhenForegroundWithEnabled: (BOOL)enable
                 showNoticeWhenForegroundWithResolver:(RCTPromiseResolveBlock)resolve
                 showNoticeWhenForegroundWithRejecter:(RCTPromiseRejectBlock)reject) {
    _showNoticeWhenForeground = enable;
    resolve(@{KEY_CODE:CODE_SUCCESS});
}

RCT_REMAP_METHOD(getApnsDeviceToken,
                 getApnsDeviceTokenWithResolver:(RCTPromiseResolveBlock)resolve
                 getApnsDeviceTokenWithRejecter:(RCTPromiseRejectBlock)reject) {
    resolve([CloudPushSDK getApnsDeviceToken]);
}

RCT_REMAP_METHOD(setPluginLogEnabled, setPluginLogEnabledWithEnabled:(BOOL)enabled) {
    if (enabled) {
      [AliyunPushLog enableLog];
    }else {
      [AliyunPushLog disableLog];
    }
}

RCT_REMAP_METHOD(isChannelOpened,
                 isChannelOpenedWithResolver:(RCTPromiseResolveBlock)resolve
                 isChannelOpenedWithRejecter:(RCTPromiseRejectBlock)reject) {
    resolve(@([CloudPushSDK isChannelOpened]));
}


// Don't compile this code when we build for the old architecture.
#ifdef RCT_NEW_ARCH_ENABLED
- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
    return std::make_shared<facebook::react::NativeAliyunReactNativePushSpecJSI>(params);
}
#endif

@end
