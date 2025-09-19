# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.3] - 2025-09-18

### Added

- 新增 `setAndroidBadgeNum(num: number)` 接口，支持设置Android应用图标角标数字
- Android端通过调用 `PushServiceFactory.getCloudPushService().setBadgeNum(context, num)` 实现角标设置
- iOS端返回仅支持Android的错误提示，保持跨平台接口一致性
- 示例项目中添加Android角标设置功能演示
- README文档中添加新接口的详细使用说明

### Changed

- 版本号从 1.0.2 升级至 1.0.3

## [1.0.2] - Previous Release

- 基础推送功能实现
- 支持Android和iOS双平台
- 账号、别名、标签管理
- 通知渠道管理
- 第三方厂商推送集成
