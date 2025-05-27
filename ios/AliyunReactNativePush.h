#import <UIKit/UIApplication.h>
#import <UserNotifications/UserNotifications.h>

typedef void (^AliyunPushRemoteNotificationCallback)(UIBackgroundFetchResult result);
typedef void (^AliyunPushForeReceiveNoticeCallback)(UNNotificationPresentationOptions);
typedef void (^AliyunPushNotificationActionCallback)(void);

@interface AliyunPush : NSObject

+ (void) didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken;

+ (void) didFailToRegisterForRemoteNotificationsWithError:(NSError *)error;

+ (void) didReceiveRemoteNotification:(NSDictionary *)userInfo;

+ (void) didReceiveRemoteNotification:(NSDictionary *)userInfo
               fetchCompletionHandler:(AliyunPushRemoteNotificationCallback)completionHandler;

+ (void) userNotificationCenter:(UNUserNotificationCenter *)center
        willPresentNotification:(UNNotification *)notification
          withCompletionHandler:(AliyunPushForeReceiveNoticeCallback)completionHandler;

+ (void) userNotificationCenter:(UNUserNotificationCenter *)center
 didReceiveNotificationResponse:(UNNotificationResponse *)response
          withCompletionHandler:(AliyunPushNotificationActionCallback)completionHandler;

@end
