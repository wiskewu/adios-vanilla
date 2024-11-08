---
title: 为什么React元素有一个$$typeof属性？
category: web
tags:
  - React
author: wiskewu
created: 2022-08-21 09:20:00
updated: 2024-11-08 18:00:00
top: false
summary: $$typeof 是什么？为什么用 Symbol() 作为它的值？
---

## 前言

在写JSX代码时：

```jsx
<marquee bgcolor="#ffa7c4">hi</marquee>
```

实际上我们是在调用一个方法：

```js
React.createElement(
  /* type */ 'marquee',
  /* props */ { bgcolor: '#ffa7c4' },
  /* children */ 'hi'
)
```

`React.createElement`会返回一个对象，称为`React`元素(element)，它告诉`React`下一步应该渲染什么UI，我们写的组件则是返回一个由这些元素组成的树(tree)。

```js
{
  type: 'marquee',
  props: {
    bgcolor: '#ffa7c4',
    children: 'hi',
  },
  key: null,
  ref: null,
  $$typeof: Symbol.for('react.element'), // 这是什么？
}
```

经常写`React`的同学，对`key`、`ref`、`props`、`type`都会比较熟悉。但`$$typeof`是什么？为什么用 `Symbol()`作为它的值？

## XSS攻击

在使用原生JS书写如下代码：

```js
const messageEl = document.getElementById('message');
messageEl.innerHTML = '<p>' + message.text + '</p>';
```

这样看起来没什么问题，但是当`message.text`的值类似`<img src onerror="stealYourPassword()">`时，你的代码就变得没那么安全了。

为什么防止此类攻击，你可以用只处理文本的`document.createTextNode()`或者`textContent`等安全的 API。你也可以事先将用户输入的内容，用转义符把潜在危险字符（`<`、`>`等）替换掉。

尽管如此，这个问题的成本代价很高，且很难做到用户每次输入都记得转换一次。因此像React等新库会默认进行文本转义:

```jsx
// 自动转义
<p>
  {message.text}
</p>
```

如果`message.text`是一个带有`<img>`或其他标签的恶意字符串，它不会被当成真的`<img>`标签处理，`React`会先进行转义 然后 插入`DOM`里。所以`<img>`标签会以文本的形式展现出来。

> 要在 React 元素中渲染任意 HTML，可以使用`dangerouslySetInnerHTML={{ __html: message.text }}`

## $$typeof

`React`元素(elements)是`plain object`。好处在于这些元素可以用来优化编译器，在`workers`之间传递 UI元素，或者将`JSX`从`React`包解耦出来。

但是，如果你的服务器有允许用户存储任意`JSON`对象的漏洞，而前端需要一个字符串，这可能会发生一个问题:

```jsx
// 服务端允许用户存储 JSON
let expectedTextButGotJSON = {
  type: 'div',
  props: {
    dangerouslySetInnerHTML: {
      __html: '/* 要注入的任意代码 */'
    },
  },
  // ...
};
let message = { text: expectedTextButGotJSON };

// React 0.13 中有风险
<p>
  {message.text}
</p>
```

在这个例子中，`React 0.13`很容易受到`XSS`攻击。
在`React 0.14`版本中，它修复了这个问题，修复手段是用`Symbol`标记每个`React`元素（element）:

```diff
{
  type: 'marquee',
  props: {
    bgcolor: '#ffa7c4',
    children: 'hi',
  },
  key: null,
  ref: null,
+  $$typeof: Symbol.for('react.element'),
}
```

这是个有效的办法，因为`JSON`不支持`Symbol`类型，所以即使服务器存在用`JSON`作为文本返回安全漏洞，`JSON`里也不包含`Symbol.for('react.element')`。React会检测`element.$$typeof`，如果元素丢失或者无效，会拒绝处理该元素。

特意用`Symbol.for()`的好处是`Symbols`通用于 `iframes`和`workers`等环境中。因此无论在多奇怪的条件下，这方案也不会影响到应用不同部分传递可信的元素。

> 如果浏览器不支持 `Symbols`怎么办？
> 唉，那这种保护方案就无效了。React仍然会加上 `$$typeof`字段以保证一致性，但只是设置一个数字而已 —— `0xeac7`。
> 为什么是这个数字？因为`0xeac7`看起来有点像`「React」`。

### 参考

- [why-do-react-elements-have-typeof-property](https://overreacted.io/zh-hans/why-do-react-elements-have-typeof-property/)
