# AGENTS.md

## 代码 CR 规则

- 需要阅读所有变更的代码前后的完整源文件，避免不相关的文件变更
- 给出代码变更的主要目的和其他一些更改
- 对于高风险的代码变更给出特别关注
- 代码对比分支为 master 分支，CR 之前保证两个分支为最新远程分支

## 版本发布工作流程

本项目有两个远程仓库：

- `origin`：阿里内网 code.alibaba-inc.com
- `github`：GitHub 公开仓库 aliyun/alibabacloud-push-reactnative-plugin

### 1. 创建 release 分支

从功能分支创建 release 分支，分支命名格式为 `release/x.y.z`：

```bash
git checkout -b release/x.y.z <功能分支名>
git push -u origin release/x.y.z
```

### 2. 更新版本号

修改 `package.json` 中的 `version` 字段为目标版本号。

### 3. 构建验证

```bash
yarn prepare
```

确认 `bob build` 构建成功，产物输出到 `lib/` 目录。

### 4. 发布到 npm

本项目全局 npm registry 指向阿里内网，但 `package.json` 中的 `publishConfig` 已配置为官方 npmjs.org。

登录时需要手动指定 registry：

```bash
npm login --registry=https://registry.npmjs.org/
```

发布：

```bash
npm publish
```

发布目标为 https://www.npmjs.com/package/aliyun-react-native-push ，access 为 public。

### 5. 提交版本变更

```bash
git add package.json
git commit -m "chore: release x.y.z"
git push origin release/x.y.z
```

### 6. 合并回 master

在内网仓库将 `release/x.y.z` 合并到 `master` 分支。

### 7. 在 master 上打 tag

合并完成后，在 master 分支的合并提交上打 tag：

```bash
git checkout master
git pull origin master
git tag vx.y.z
git push origin vx.y.z
```

### 8. 同步到 GitHub

```bash
git push github master
git push github vx.y.z
```

确保 GitHub 公开仓库的 master 分支和 tag 与内网保持同步。
