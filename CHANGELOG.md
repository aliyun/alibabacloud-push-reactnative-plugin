# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.1] - 2026-06-04

### Added

- 新增 `checkNotificationAuthorization()` 接口，支持主动检查 iOS 通知权限授权状态
- README 文档 iOS 专用接口部分补充 `checkNotificationAuthorization` API 说明

### Changed

- iOS `initPush` 在 APNs 授权被拒/暂未授权时通过 `onRegisterDeviceTokenFailed` 事件回调通知

## [1.1.0] - 2026-05-06

### Added

- 新增设备标签专用接口 `bindDeviceTag`、`unbindDeviceTag`、`listDeviceTags`
- 推荐使用这些新接口进行设备维度的标签操作，API 更简洁，无需手动指定 target 参数

### Changed

- 升级 AlicloudPush 依赖至 3.2.4+
- 升级 AlicloudUTDID 至 1.6.1.1 — 修复 OpenUDID 导致的 App Store 审核拒绝问题
- 升级 AlicloudELS 至 1.0.4 — 解决 iOS 编译告警和 compact unwind 问题
- `bindTag`、`unbindTag`、`listTags` 方法标记为废弃（@deprecated）
- 上述废弃方法仍保留运行时功能，仅在编译/IDE 阶段显示废弃警告

### Fixed

- 修复示例项目中标签列表为空时错误提示的问题
- 修复示例项目中别名列表为空时错误提示的问题

## [1.0.4] - 2026-02-10

### Fixed

- 修复 `removeAlias` 功能在Android端错误拦截空值的问题
- Android端当传入 `null` 或空字符串时，现在会正确调用SDK的removeAlias方法清除所有别名
- iOS端已经正确支持传入 `nil` 清除所有别名，无需修改

### Changed

- 更新 `removeAlias` 方法的TypeScript类型定义，参数类型从 `string` 改为 `string | null`
- README文档中补充说明：传入 `null` 或空字符串时会清除设备的所有别名
- 版本号从 1.0.3 升级至 1.0.4

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
