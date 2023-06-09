//
//  NotificationService.m
//  notiservice
//
//  Created by 王贇 on 2023/3/9.
//

#import "NotificationService.h"

@interface NotificationService ()

@property (nonatomic, strong) void (^contentHandler)(UNNotificationContent *contentToDeliver);
@property (nonatomic, strong) UNMutableNotificationContent *bestAttemptContent;

@end

@implementation NotificationService

- (void)didReceiveNotificationRequest:(UNNotificationRequest *)request withContentHandler:(void (^)(UNNotificationContent * _Nonnull))contentHandler {
    self.contentHandler = contentHandler;
    self.bestAttemptContent = [request.content mutableCopy];
    
    // Modify the notification content here...
    self.bestAttemptContent.title = [NSString stringWithFormat:@"%@ [modified]", self.bestAttemptContent.title];
    
    // 获取通知中自定义KV字段，此处取key为`attachment`的value，为阿里云logo图片的Url地址
    // 控制台 or OpenAPI推送时需要设定iOSExtParameters，其中携带`attachment`KV
    NSString *picUrlString = self.bestAttemptContent.userInfo[@"attachment"];
    if (picUrlString) {
        NSString *picPath = [[NSHomeDirectory() stringByAppendingPathComponent:@"Documents"] stringByAppendingPathComponent:@"notice_media.png"];
        // 下载图片到本地
        NSURLSession *session = [NSURLSession sharedSession];
        NSURLSessionDownloadTask *downloadTask = [session downloadTaskWithURL:[NSURL URLWithString:picUrlString] completionHandler:^(NSURL * _Nullable location, NSURLResponse * _Nullable response, NSError * _Nullable error) {
            if (error) {
                self.bestAttemptContent.body = [error description];
            } else {
                NSFileManager *fm = [NSFileManager defaultManager];
                // 图片存储到指定picPath位置
                [fm moveItemAtPath:location.path toPath:picPath error:nil];
                // 创建通知附件
                UNNotificationAttachment *attachment = [UNNotificationAttachment attachmentWithIdentifier:@"pic" URL:[NSURL URLWithString:[@"file://" stringByAppendingString:picPath]] options:nil error:&error];
                if (error) {
                    self.bestAttemptContent.body = [error description];
                } else if (attachment) {
                    // 添加通知附件到通知
                    self.bestAttemptContent.attachments = @[attachment];
                }
                // 弹出修改后的通知
                self.contentHandler(self.bestAttemptContent);
            }
        }];
        [downloadTask resume];
    } else {
        // 若没有指定资源Url，从本地获取资源添加到通知中
        NSString *picLocalPath = [[NSBundle mainBundle] pathForResource:@"aliyun-logo-local" ofType:@"png"];
        if (picLocalPath) {
            NSError *error;
            UNNotificationAttachment *attachment = [UNNotificationAttachment attachmentWithIdentifier:@"pic" URL:[NSURL URLWithString:[@"file://" stringByAppendingString:picLocalPath]] options:nil error:&error];
            if (error) {
                self.bestAttemptContent.body = [error description];
            } else if (attachment) {
                // 添加附件到通知
                self.bestAttemptContent.attachments = @[attachment];
            }
        }
        // 弹出修改后的通知
        self.contentHandler(self.bestAttemptContent);
    }
}

- (void)serviceExtensionTimeWillExpire {
    // Called just before the extension will be terminated by the system.
    // Use this as an opportunity to deliver your "best attempt" at modified content, otherwise the original push payload will be used.
    self.contentHandler(self.bestAttemptContent);
}

@end
