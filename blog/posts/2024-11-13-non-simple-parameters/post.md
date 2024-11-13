---
title: JS函数中的非简单参数
category: web
tags:
  - js
  - es6
author: wiskewu
created: 2024-11-13 11:00:00
updated: 
top: false
summary: 从arguments.callee不恰当使用了解非简单参数概念
---

## 背景

最近看到一篇[文章](https://alan.norbauer.com/articles/browser-debugging-tricks#break-on-function-arity-mismatch)，里面提到了一个调试技巧，通过`arguments.callee.length !== arguments.length`来调试函数参数个数不匹配的问题。

原文提到的示例代码如下：

```js
function stopOnWrongArguments(name) {
  console.log(`Hello, ${name}`);
  // 原文是在控制面板进行表达式断点，这里使用代码模拟断点
  if (arguments.callee.length !== arguments.length) {
    debugger;
  }
}
```

然后我联想到如果基于上述技巧，在`es6`函数中使用剩余参数，结果又是如何？于是有了下面的测试代码：

```js
function stopOnWrongArguments(...args) {
  // 原文是在控制面板进行表达式断点，这里使用代码模拟断点
  if (arguments.callee.length !== arguments.length) {
    debugger;
  }
}
```

尝试运行上述代码，控制台抛出如下异常：

```txt
Uncaught TypeError: 'caller', 'callee', and 'arguments' properties may not be accessed on strict mode functions or the arguments objects for calls to them
```

下面，分析一下产生此错误的具体原因。

## 分析

通过查阅相关资料，在MDN上找到了[相关说明](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Functions/arguments/callee),里面有这么一个备注信息：

> 备注： `callee` 是仅存在于具有简单参数的非严格函数（在这种情况下 `arguments` 对象也是自动同步的）的数据属性。否则，它是一个访问器属性，其 `getter` 和 `setter` 都会抛出 `TypeError`。

注意到文中提到几个关键词：**简单参数**和**非严格函数**。

### 非严格函数

展开讲应该是非严格模式下的函数。提到非严格，则绕不开**严格模式**。

> 严格模式详细内容可参见：[MDN Strict_mode](https://mdn.org.cn/en-US/docs/Web/JavaScript/Reference/Strict_mode)

其中提到下述内容：

> `"use strict"` 指令只能应用于具有简单参数的函数体。在具有`rest`、`default`或`解构参数`的函数中使用`"use strict"`是语法错误。

这里又再次提到了**简单参数**，那么什么情况算是**简单参数**呢？

### 简单参数

在js中，函数参数的包含以下几种情形：

1. [简单参数](https://mdn.org.cn/en-US/docs/Web/JavaScript/Reference/Functions#function_parameters): 每个函数参数都是一个简单的标识符
2. [默认参数](https://mdn.org.cn/en-US/docs/Web/JavaScript/Reference/Functions/Default_parameters): 允许为形式参数初始化默认值，如果未传递值或传递`undefined`
3. [剩余参数](https://mdn.org.cn/en-US/docs/Web/JavaScript/Reference/Functions/rest_parameters): 允许将不确定的参数数量表示为数组
4. [解构参数](https://mdn.org.cn/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment): 允许将数组中的元素或对象中的属性解包到不同的变量中

可知，简单参数就是除了默认参数、剩余参数、解构参数之外的其他参数形式。例如下面的`add`函数就是一个非严格简单参数的函数：

```js
function add(a, b) {}
```

注意，在情形1中，文中链接明确指出如果使用了上述非简单参数语法之一（即情形2/3/4），会有一些后果：

- 您不能将`"use strict"`应用于函数体--这将会导致语法错误。
- **即使函数不在严格模式下，某些严格模式函数特性也会适用，包括`arguments`对象停止与命名参数同步，`arguments.callee`在访问时会抛出错误，并且不允许重复的参数名称。**

由第二点可知，上述错误正是基于此规则抛出的。

---

## 参考链接

- [MDN Strict_mode](https://mdn.org.cn/en-US/docs/Web/JavaScript/Reference/Strict_mode)
- [MDN Functions](https://mdn.org.cn/en-US/docs/Web/JavaScript/Reference/Functions#function_parameters)
- [MDN arguments.callee](https://mdn.org.cn/en-US/docs/Web/JavaScript/Reference/Functions/arguments/callee)
