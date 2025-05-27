import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider

@main
class AppDelegate: RCTAppDelegate, UNUserNotificationCenterDelegate {
  override func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey : Any]? = nil) -> Bool {
    self.moduleName = "AliyunReactNativePushExample"
    self.dependencyProvider = RCTAppDependencyProvider()
    self.initialProps = [:]
    
    // 设置通知代理
    UNUserNotificationCenter.current().delegate = self
    
    return super.application(application, didFinishLaunchingWithOptions: launchOptions)
  }
  
  // 注册APNs成功
  override func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
    print("注册APNs成功")
    AliyunPush.didRegisterForRemoteNotifications(withDeviceToken: deviceToken)
  }
  
  // 注册APNs失败
  override func application(_ application: UIApplication, didFailToRegisterForRemoteNotificationsWithError error: Error) {
    print("注册APNs失败")
    AliyunPush.didFailToRegisterForRemoteNotificationsWithError(error)
  }
  
  // 接收静默通知
  override func application(_ application: UIApplication, didReceiveRemoteNotification userInfo: [AnyHashable : Any]) {
    print("接收静默通知")
    AliyunPush.didReceiveRemoteNotification(userInfo)
  }
  
  // 接收静默通知（带完成回调）
  override func application(_ application: UIApplication, didReceiveRemoteNotification userInfo: [AnyHashable : Any], fetchCompletionHandler completionHandler: @escaping (UIBackgroundFetchResult) -> Void) {
    print("接收静默通知（带完成回调）")
    AliyunPush.didReceiveRemoteNotification(userInfo, fetchCompletionHandler: completionHandler)
  }
  
  // MARK: - UNUserNotificationCenterDelegate
  
  // 前台收到通知
  func userNotificationCenter(_ center: UNUserNotificationCenter, willPresent notification: UNNotification, withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void) {
    print("前台收到通知")
    AliyunPush.userNotificationCenter(center, willPresent: notification, withCompletionHandler: completionHandler);
  }
  
  // 点击通知响应
  func userNotificationCenter(_ center: UNUserNotificationCenter, didReceive response: UNNotificationResponse, withCompletionHandler completionHandler: @escaping () -> Void) {
    print("点击通知响应")
    AliyunPush.userNotificationCenter(center, didReceive: response, withCompletionHandler: completionHandler);
  }
  
  override func sourceURL(for bridge: RCTBridge) -> URL? {
    return self.bundleURL()
  }
  
  override func bundleURL() -> URL? {
#if DEBUG
    return RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
#else
    return Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }
}
