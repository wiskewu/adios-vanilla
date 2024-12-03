---
title: pnpm link 简单使用
category: web
tags:
  - js
  - development
author: wiskewu
created: 2024-12-03 14:00:00
updated: 
top: false
summary: 使用pnpm link进行本地库跨项目调试
---

## 背景

在实际项目开发过程中，经常会出现以下若干场景：

1. 公司开发了一个库`lib`，并且已上传到`npm`/`nexus`，这时候你需要对这个lib添加新的功能，并且你希望在项目`project_b`中测试这个新功能；

2. 公司让你开发了一个新的库`lib`，你要在一个项目`project`中进行测试验证，没问题了再发包；

3. 你的项目`project`使用到了`github`/`npm`上的第三方库`lib`，你希望在拷贝源码之后，在本地的项目中进行调试；

4. 你在使用第三库`lib`的过程中，发现了`bug`，你拉取该库源码，做了修改，希望在提交PR前测试功能完整性；

对于场景1和场景2，传统做法是在`lib`本地开发完毕后，升级版本号，打包上传到`npm`/`nexus`，然后在项目`project`中升级`lib`的版本号，更新依赖，然后继续后续的开发验证。

对于场景3和场景4，你不是`lib`的第一作者，你没有权限发行新的版本，导致你修改的功能无法在`project`中进行验证。

对于上述场景，我们实际上都可以使用`pnpm link`进行临时的跨项目调试，简化工作流程。

## pnpm link

官方语法为：

```bash
# 将 <dir> 里面的包（lib） link 到当前工作目录的项目中（project）（可以通过 --dir 参数更改）
pnpm link <dir>
# 将当前工作目录的包（lib）（或者`--dir`指定的目录），link 到全局 node_modules 中。
pnpm link --global
# 将 全局 node_modules 中的 `pkg`（lib） link 到当前目录项目（project）（或者`--dir`指定的目录中）的node_modules中
pnpm link --global <pkg>
```

### link使用示例

假设`lib`库的根目录是`D:\\workspace\\code\\lib`，项目`project`的根目录是`D:\\workspace\\code\\project`，那么依次执行下述命令：

```bash
# 切换到project所在根目录
cd D:\\workspace\\code\\project
# link到库lib目录
pnpm link D:\\workspace\\code\\lib
```

此时控制台将输出`project`的`node_modules`添加了新的依赖`lib`。

### 注意事项

在`monorepo`场景下，需要到对应的`package`下进行`link`操作。
`link`是一次性的，建立的是文件夹级别的软链接，当`lib`重新`build`打包之后，`project`能够同步最新的打包之后的代码进行编译。
在`project`中执行`pnpm install`时，如果`lib`依赖已在`package.json`中声明，则`lib`的`link`关系会被移除，并使用线上的版本替换。
如果`lib`未在`package.json`中声明，则`link`关系不会被移除。

## pnpm unlink

官方语法为：

```bash
# 移除当前目录下（project）所有由 pnpm link 创建出来的 link（lib包），然后重新 install（yarn 不会做后面这一步）。
pnpm unlink
```

### unlink使用示例

假设`lib`库的根目录是`D:\\workspace\\code\\lib`，项目`project`的根目录是`D:\\workspace\\code\\project`，那么依次执行下述命令：

```bash
# 切换到project所在根目录
cd D:\\workspace\\code\\project
# 解除link
pnpm unlink
```

## 参考链接

本文部分内容参考自 [pnpm link 使用手册](https://leavesster.github.io/2024/01/30/pnpm-link/)，可进入该链接查看更多相关内容。
