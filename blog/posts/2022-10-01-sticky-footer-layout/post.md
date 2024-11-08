---
title: Sticky Footer
category: web
tags:
  - css
  - html
author: wiskewu
created: 2022-10-01 10:16:00
updated: 2024-11-08 18:00:00
top: false
summary: 使用flex布局实现黏性页脚
---

## 准备工作

假设有以下布局（常见的上中下布局）：

```html
<body>
    <header>...</header>
    <section class="main-content">...</section>
    <footer>...</footer>
</body>
```

我们希望`header`和`footer`只占用他们应该占用的空间，将剩余的空间全部交给主体内容区域。

## 样式设置

```css
header{
   /* 我们希望 header 采用固定的高度，只占用必须的空间 */
   /* 0 flex-grow, 0 flex-shrink, auto flex-basis */
   flex: 0 0 auto;
}

.main-content{
   /* 将 flex-grow 设置为1，该元素会占用全部可使用空间
   而其他元素该属性值为0，因此不会得到多余的空间*/
   /* 1 flex-grow, 0 flex-shrink, auto flex-basis */
   flex: 1 0 auto;
}

footer{
   /* 和 header 一样，footer 也采用固定高度*/
   /* 0 flex-grow, 0 flex-shrink, auto flex-basis */
   flex: 0 0 auto;
}
```

## 词条解释

`flex`的完整写法表示为`flex: flex-grow, flex-shrink, flex-basis;`，其中：

- flex-grow: 元素在同一容器中对可分配空间的分配比率，及扩展比率
- flex-shrink：如果空间不足，元素的收缩比率
- flex-basis：元素的伸缩基准值

### 参考

- [css trick flex 快速指南](https://css-tricks.com/snippets/css/a-guide-to-flexbox/)
- [常见flexbox布局示例](https://philipwalton.github.io/solved-by-flexbox/)
