---
title: 写一个简单的拉取项目模板web脚手架工具
category: web
tags:
  - js
  - cli
  - nodejs
author: wiskewu
created: 2024-11-26 11:00:00
updated: 
top: false
summary: 使用脚手架和模板项目快速启动一个新项目开发
---

## 背景

随着公司项目的增多，发现同事在创建新项目时都是从一个老项目中复制源码，然后删删减减，再开始开发。这个过程存在一些问题，如：

- 大部分项目的基础配置是一样的，如项目结构、第三方依赖、构建配置、开发命令、`tsconfig.json`、`eslint.config.js`等，无需每次都手动配置
- 一小部分的文件需要手动修改，如`package.json`中的`name`、`version`、`description`等
- 删文件的过程繁琐且耗时，容易出错

基于上述问题，决定开发一款简单的cli工具来半自动化创建一个新的项目，以快速进入开发。

## 需求

我希望这款cli工具具备以下能力：

- 统一使用`esm`语法
- 能够直接拉取`github`、`gitlab`线上模板仓库
- 能够选择仓库项目的某一分支
- 能够在拉取项目之后，对项目进行一些简单的修改
- 能够快速使用此cli工具，无需全局安装

## 实现

具体实现源码请见这里：[web-project-template-cli](https://github.com/wiskewu/web-project-template-cli)
本文只聊聊一些设计思想和部分源码依赖。

### 代码结构

项目结构如下：

```txt
|- .husky           -- 配置git相关钩子
| |- bin            -- 全局安装后的脚手架命令
| | |- ptc-cli.js   -- 全局安装后的脚手架入口文件
| |- dist           -- ts转译后的js产物，包含index.js和其他js文件
| |- node_modules
| |- src            -- 源码目录
| | |- command      -- 用于存放对应的命令，如init、create等，单个命令自成一个目录
| | |- config       -- 用于存放一些配置文件，如临时文件夹目录名
| | |- template     -- 用于存放一些处理模板项目的钩子函数
| | |- utils        -- 用于存放一些工具函数，如下载模板代码、拉取项目分支信息等
| | |- index.ts     -- 源码入口文件，被ptc-cli.js所使用
|- .eslintrc        -- 代码风格配置
|- .gitignore
|- .npmrc
|- LICENSE
|- package.json     -- 项目基础信息，开发配置
|- README.md
|- tsconfig.json    -- esm、ts相关配置
```

### esm语法统一

`package.json`设置如下内容：

```json
{
  "exports": "./dist/index.js",
  "module": "dist/index.js",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "type": "module",
  "files": [
    "dist",
    "bin"
  ]
}
```

在`tsconfig.json`中设置如下内容，此处继承第三方包[`@ombro/tsconfig`](https://www.npmjs.com/package/@ombro/tsconfig)提供的配置：

```json
{
  "extends": "@ombro/tsconfig/tsconfig.esm.json",
  "compilerOptions": {
    "target": "ES2020",
    "module": "ES2022", // enable pure esmodule and top-level await
    "composite": true,
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src/**/*"]
}

```

### 快速开始

此处利用`npx`命令的特点，避免全局安装模块，假设`npmjs`上已经发布了模块包`web-project-template-cli`：

```bash
npx web-project-template-cli create project-name
```

上述命令中，`npx`将会下载`web-project-template-cli`包到临时目录，然后运行模块提供的`create`命令，并传递参数`project-name`。运行之后，将会在当前目录下创建`project-name`目录，目录内容为选择的模板代码。

### 本地调试

`npx`命令同样可以执行本地项目的命令。在`package.json`中配置`bin`字段：

```json
{
  "bin": {
    "ptc": "./bin/ptc-cli.js",
    "ptc-cli": "./bin/ptc-cli.js"
  },
  "name": "web-project-template-cli",
  "exports": "./dist/index.js",
  "module": "dist/index.js",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "type": "module",
  "files": [
    "dist",
    "bin"
  ],
  "engines": {
    "node": ">=18"
  },
  "scripts": {
    "build": "tsc -p tsconfig.json"
  }
}
```

在执行完`pnpm run build`打包命令之后，可以在终端执行`npx ptc create test-project`运行`bin`中指定的脚本`ptc-cli.js`文件，效果和最终生产环境是一样的。

> `npx` 的原理很简单，就是运行的时候，会到`node_modules/.bin`路径和环境变量`$PATH`里面，检查命令是否存在。
> 注意，只要 `npx` 后面的模块无法在本地发现，就会下载同名模块。
> -- 摘自[阮一峰《npx 使用教程》](https://www.ruanyifeng.com/blog/2019/02/npx.html)

### create命令流程

在执行`npx ptc create test-project`时，主要做了以下几件事情：

1. 注册进程异常退出监听函数，用于创建失败时删除临时数据等回滚操作
2. 获取用户临时数据目录，如`C:\\Users\\DELL\\tmp-ptc-cache`
3. 清空上述临时数据目录文件
4. 在当前终端工作目录下创建`test-project`目录
5. 用户选择模板项目及对应分支
6. 下载模板项目分支代码到临时数据目录
7. 讲模板项目分支代码从临时数据目录拷贝到`test-project`目录
8. 对模板项目分支代码执行一些后置操作
9. 清空临时数据目录文件
10. 结束

### ptc-cli.js与index.ts

`ptc-cli.js`做的事情很简单，导入`index.ts`，并执行其导出的成员函数：

```js
#!/usr/bin/env node

import('../dist/index.js').then((m) => {
  m.main()
})

```

`index.ts`导出了`main`函数：

```ts
import { program } from 'commander'

import commands from './command/index.js'

export function main() {
  program.name('ptc').usage('<command> [options]')

  program
    .command('create [project-name]')
    .description('create a new project')
    .action((projectName: string): void => {
      commands.create(projectName)
    })

  program.parse(process.argv)
  if (!program.args.length) {
    program.help()
  }
}

```

### 依赖参考

这个脚手架主要用到几个第三方库：

- [Execa](https://www.npmjs.com/package/execa): 在子进程中运行其他命令
- [fs-extra](https://www.npmjs.com/package/fs-extra): 操作文件系统
- [commander](https://www.npmjs.com/package/commander): 完整的 `node.js` 命令行解决方案
- [inquirer](https://www.npmjs.com/package/inquirer): 通用的交互式命令行接口集合
- [ora](https://www.npmjs.com/package/ora): 优雅的终端加载指示器

## 工具函数

在写这个脚手架工具时，提取了几个可以复用的工具函数，供后续开发参考。

### run

用于运行其他命令:

```ts
import type { Options } from 'execa'
import { execa } from 'execa'

export default async function run(
  bin: string,
  arg: ReadonlyArray<string>,
  opts: Options = {},
) {
  return execa(bin, arg, { stdio: 'inherit', ...opts })
}
```

### ls-repo-branch

用于列出仓库远端分支信息:

```ts
import run from './run.js'

/**
 * 
 * 从`
  04d6a6b13bf7d256c0586312046072ff657b4101        refs/heads/demo/test
  131ac4c73ac7e2453015a36d117201cda19e635f        refs/heads/dev
  7839f0b591b5beaa0ba1a56da21b060ea87645a3        refs/heads/master
 * `中解析出['demo/test'、'dev'、'master']
 * @param repoPath 
 */
export default async function lsRepoBranch(repoUrl: string): Promise<string[]> {
  const output = (
    await run('git', ['ls-remote', '--heads', repoUrl], { stdio: 'pipe' })
  ).stdout as string
  return output
    .split('\n')
    .map((line) => (line ? line.split('/').slice(2).join('/') : ''))
    .filter(Boolean)
}

```

### download-git-repo

用于下载一个指定分支的repo项目

```ts
import run from './run.js'

/**
 * 下载一个repo
 * @param repo repo地址
 * @param branch repo分支
 * @param dest 存放目录地址
 */
export default async function downloadGitRepo(
  repo: string,
  branch: string,
  dest: string,
) {
  await run('git', [
    'clone',
    '--depth=1',
    '--branch',
    branch,
    '--single-branch',
    repo,
    dest,
  ])
}

```

### logger

用于在终端输出一些带前缀颜色标识信息的日志

```ts
import picocolors from 'picocolors'

const logger = {
  info: (...msgs: string[]) =>
    console.log(`${picocolors.cyan('[-]')}`, ...msgs),
  success: (...msgs: string[]) =>
    console.log(`${picocolors.green('[√]')}`, ...msgs),
  warning: (...msgs: string[]) =>
    console.log(`${picocolors.yellow('[!]')}`, ...msgs),
  error: (...msgs: string[]) =>
    console.log(`${picocolors.red('[x]')}`, ...msgs),
}

export default logger
```

## 扩展

这个脚手架实际上更多只是一个示例作用，了解脚手架如何搭建，如果需要支持更多功能，则可以创建更多的`command`命令，此处不再展开。
