---
title: DOM0级事件与DOM2级事件
category: web
tags:
  - html
  - dom
  - js
  - events
author: wiskewu
created: 2022-10-23 21:11:00
updated: 2024-11-08 18:00:00
top: false
summary: 简单区分DOM0级事件与2级事件的概念
---

## DOM0级事件

DOM0级事件，就是直接通过类似`onclick`等方式实现的事件，原生JS支持两种方式：

- 标签内书写0级事件：

    ```html
    <button onclick="alert('click me');">确定</button>
    ```

- 脚本中书写0级事件：

    ```js
    document.getElementById('btn').onclick = function () {
        alert('click me');
    }
    ```

DOM0级事件具有以下特点：

1. DOM0级事件添加后，后添加的同类型事件会覆盖前面已添加的事件
2. DOM0级事件具有很有跨浏览器优势，但由于绑定速度太快，可能页面还没完全加载出来，以至于事件可能无法正常执行

## DOM2级事件

主流浏览器主要通过以下两个方法用来处理绑定和删除事件程序的操作：

- addEventListener
- removeEventListener

示例：

```js
var btn = document.getElementById('btn');

btn.addEventListener('click', function () {
    console.log('callback A');
});

btn.addEventListener('click', function () {
    console.log('callback B');
});

btn.addEventListener('click', function () {
    console.log('callback C');
});

```

DOM2级事件的特点：

1. 可以对同一元素多次绑定相同类型的事件
2. 多个同类型的事件在触发时会依次执行回调
