#import "AppDelegate.h"

#import <React/RCTBundleURLProvider.h>
#import <CloudPushSDK/CloudPushSDK.h>
// iOS 10 notification
#import <UserNotifications/UserNotifications.h>
#import <AliyunReactNativePush.h>

@interface AppDelegate () <UNUserNotificationCenterDelegate>

@end

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  self.moduleName = @"AliyunReactNativePushExample";
  // You can add your custom initial props in the dictionary below.
  // They will be passed down to the ViewController used by React Native.
  self.initialProps = @{};
  
  UNUserNotificationCenter *center =
        [UNUserNotificationCenter currentNotificationCenter];
    center.delegate = self;

  return [super application:application didFinishLaunchingWithOptions:launchOptions];
}

/*
 * APNs注册成功回调，将返回的deviceToken上传到CloudPush服务器
 */
- (void)application:(UIApplication *)application didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken {
  [AliyunPush didRegisterForRemoteNotificationsWithDeviceToken:deviceToken];
}

/*
 * APNs注册失败回调
 */
- (void)application:(UIApplication *)application didFailToRegisterForRemoteNotificationsWithError:(NSError *)error {
  [AliyunPush didFailToRegisterForRemoteNotificationsWithError:error];
}

#pragma mark Notification Open
/*
 *  App处于启动状态时，通知打开回调
 */
// iOS (3_0, 10_0) App 处于前台,如果收到 远程通知 则调用该处理方法
- (void)application:(UIApplication*)application didReceiveRemoteNotification:(NSDictionary*)userInfo {
  [AliyunPush didReceiveRemoteNotification:userInfo];
}

- (void)application:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)userInfo fetchCompletionHandler:(void (^)(UIBackgroundFetchResult))completionHandler {
  [AliyunPush didReceiveRemoteNotifiaction:userInfo fetchCompletionHandler:completionHandler];
}

/*
    APP处于前台时收到通知(iOS 10+)
 */
- (void)userNotificationCenter:(UNUserNotificationCenter *)center willPresentNotification:(UNNotification *)notification withCompletionHandler:(void (^)(UNNotificationPresentationOptions))completionHandler {
    
  [AliyunPush userNotificationCenter:center willPresentNotification:notification withCompletionHandler:completionHandler];
}



/**
 *  触发通知动作时回调，比如点击、删除通知和点击自定义action(iOS 10+)
 */
- (void)userNotificationCenter:(UNUserNotificationCenter *)center didReceiveNotificationResponse:(UNNotificationResponse *)response withCompletionHandler:(void (^)(void))completionHandler {
    
  [AliyunPush userNotificationCenter:center didReceiveNotificationResponse:response withCompletionHandler:completionHandler];
}



- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

/// This method controls whether the `concurrentRoot`feature of React18 is turned on or off.
///
/// @see: https://reactjs.org/blog/2022/03/29/react-v18.html
/// @note: This requires to be rendering on Fabric (i.e. on the New Architecture).
/// @return: `true` if the `concurrentRoot` feature is enabled. Otherwise, it returns `false`.
- (BOOL)concurrentRootEnabled
{
  return true;
}

@end
