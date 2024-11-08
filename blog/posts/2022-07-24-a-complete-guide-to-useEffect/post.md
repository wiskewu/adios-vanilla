---
title: React深入-useEffect完全指南
category: web
tags:
  - React
  - Hooks
author: wiskewu
created: 2022-07-24 13:51:00
updated: 2024-11-08 18:00:00
top: false
summary: 忘记你已经学到的，重新认识useEffect
---

## 基本原理

Github在国内由于分发加速网络的域名遭到DNS污染，我们可以通过修改系统的`hosts`文件，绕过国内DNS解析，直接访问Github的CDN节点，从而达到加速的目的。

## 步骤一

打开[IPAddress](www.ipaddress.com)网站(或其他可以查询IP的网站)，分别查询下列三个域名对应的IP：

```txt
1. github.com
2. github.github.io
3. github.global.ssl.fastly.net
```

## 步骤二

编辑本地`hosts`文件：

```bash
sudo vi /etc/hosts
```

(windows同理，找到对应的hosts文件编辑即可)
输入上述查询到的IP及域名，例如：

```txt
140.82.114.4 github.com
185.199.108.153 github.github.io
185.199.109.153 github.github.io
185.199.110.153 github.github.io
185.199.111.153 github.github.io
199.232.69.194 github.global.ssl.Fastly.net
```

## 步骤三

刷新DNS缓存（以MAC OX X12为例）：

```bash
sudo killall -HUP mDNSResponder

sudo killall mDNSResponderHelper

sudo dscacheutil -flushcache
```

完成之后就可以去[Github](github.com)试试效果了～。
