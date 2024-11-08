---
title: 简单写一个石头剪刀布游戏
category: web
tags:
  - js
  - proxy
author: wiskewu
created: 2023-09-09 17:22:00
updated: 2024-11-08 18:00:00
top: false
summary: 从一个小游戏认识proxy机制
---

## 背景

最近在逛github时看到一个开源库，还蛮有意思的。花点时间阅读了源码，遂写了一个小游戏来加强理解～

> 可以[>>>猛戳这里](https://github.com/yairEO/console-colors)查看`console-colors`源码

## 石头剪刀布

```javascript
function genRSP() {
    // 被代理对象
    const RSP = {};
    const queue = [];
    const RPS_MAP = {
        "R": "Rock",
        "P": "Paper",
        "S": "Scissors"
    };

    const proxyRSP = new Proxy(RSP, {
        get(t, p) {
            // 优先级：代理 > 被代理对象
            return p in t ? t[p] : RSP;
        }
    });

    // 定义代理属性
    const def = (name, value) => {
        Object.defineProperty(proxyRSP, name, {
            get() {
                queue.push(value);
                return proxyRSP;
            }
        });
    };

    for (let k in RPS_MAP) {
        def(k, RPS_MAP[k]);
    }

    // 收敛函数
    proxyRSP.done = function() {
        const q = [...queue];
        queue.length = 0;
        const result = {
            q,
            vs(to) {
                // 模拟返回一个新方法，给外部调用，以支持调试定位上下文（source-map）
                const score = _vs(result, to);
                if (score === 0) {
                    console.log("NO ONE WINS!");
                } else if (score > 0) {
                    console.log("YOU WIN!");
                } else {
                    console.log("YOU LOSE!");
                }
            }
        };
        return result;
    }

    // 游戏逻辑，可忽略
    function _vs(resultA, resultB) {
        var q1 = resultA.q, q2 = resultB.q;
        var l1 = q1.length,
            l2 = q2.length,
            len = Math.min(l1, l2);
        var y = n = 0;
        for (let i = 0; i < len; i++) {
            var a = q1[i], b = q2[i];
            if (a === b) continue;
            else if (
                (a === RPS_MAP.R && b === RPS_MAP.S) ||
                (a === RPS_MAP.P && b === RPS_MAP.R) ||
                (a === RPS_MAP.S && b === RPS_MAP.P)
            ) ++y;
            else ++n;
        }
        return y === n ? 0 : y > n ? 1 : -1;
    }

    return proxyRSP;
}

// test cases
const rsp = genRSP();

rsp.R.P.S.R.R.done().vs(rsp.S.P.R.R.done()); // NO ONE WINS!
rsp.R.done().vs(rsp.S.S.done()); // YOU WIN!
rsp.S.done().vs(rsp.R.done()); // YOU LOSE!

```

----

## 补充

基本的核心逻辑已在源码中作出解释，另补充几个关键点：

- 通过`proxy`的`getter trap`实现在读取属性时进行额外的计算/缓存等逻辑
- 通过返回`proxy`本身来实现链式调用
- 通过返回新的函数，将最终函数调用控制权交给使用方，对源码调试更友好
- 在最后一个进行收尾操作，实现过程的收敛
