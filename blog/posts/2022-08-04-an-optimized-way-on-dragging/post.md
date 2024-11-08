---
title: 基于事件委托的拖拽优化
category: web
tags:
  - JS
  - Event
author: wiskewu
created: 2022-08-04 23:15:00
updated: 2024-11-08 18:00:00
top: false
summary: 探讨如何让拖动操作更加流畅，不卡顿不掉帧
---

## 需求背景

实现一个侧边栏，可通过拖拽调整侧边栏宽度。

## 前期实现

对于这么一个需求，我们很快就随手写下如下代码：

```jsx
import React from 'react';
import styled from 'styled-component';

// 侧边栏
const SideContent = styled.div`
    position: relative;
    width: 200px;
    height: 800px;
    background: red;
`;

// 锚点，操作区
const DragHandle = styled.div`
    position: absolute;
    right: -5px;
    top: 0;
    bottom: 0;
    width: 10px;
    background: green;
`;

const App = () => {
    const [width, setWidth] = useState(200);
    const positionRef = useRef({ dragging: false, clientX: 0 });

    const onMouseDown = (e) => {
        positionRef.current = {
            dragging: true,
            clientX: e.clientX,
        };
    };

    const onMouseMove = (e) => {
        if (!positionRef.current.dragging) return;
        // 计算差值
        const deltaX = e.clientX - positionRef.current.clientX;
        setWidth((preWidth) => preWidth + deltaX);
    };

    const onMouseUp = (e) => {
        positionRef.current = {
            dragging: false,
            clientX: 0,
        };
    };

    return (
        <SideContent style={{ width }}>
            这是侧边栏内容，右侧有一个可操作的区域
            <DragHandle
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
            />
        </SideContent>
    )
};
```

## 存在的问题

上述代码虽然看似没问题，但实际操作起来却屡出问题，主要有几个问题：

1. 鼠标按下后移动过程中频繁触发组件渲染
2. 鼠标按下后快速移动时，鼠标可能不在`DragHandle`上，导致鼠标抬起时无法触发`DragHandle`的`onMouseUp`事件，从而导致缩放动作无法正常退出
3. 无法非常顺畅地进行缩放操作，鼠标位置经常脱离`DragHandle`

## 优化方案

我们主要考虑几个方面，一个是`事件委托`机制，一个是`原生DOM节点操作`。

```jsx
import React from 'react';
import styled from 'styled-component';

// 侧边栏
const SideContent = styled.div`
    position: relative;
    width: 200px;
    height: 800px;
    background: red;
`;

// 锚点，操作区
const DragHandle = styled.div`
    position: absolute;
    right: -5px;
    top: 0;
    bottom: 0;
    width: 10px;
    background: green;
`;

const App = () => {
    const sidebarRef = useRef<HTMLDivElement>();
    const positionRef = useRef({ dragging: false, clientX: 0 });

    function mouseMoveHandler = (e) => {
        if (!positionRef.current.dragging) return;
        // 计算差值
        const deltaX = e.clientX - positionRef.current.clientX;
        // 如有需要，可在此处做尺寸限定
        const nextWidth = sidebarRef.current.clientWidth + deltaX;

        // 直接操作节点样式
        sidebarRef.current.style.width = nextWidth + 'px';
    };

    function mouseUpHandler = (e) => {
        positionRef.current = {
            dragging: false,
            clientX: 0,
        };
        // 及时移除事件委托
        document.removeEventListener('mousemove', mouseMoveHandler);
        document.removeEventListener('mouseup', mouseUpHandler);
    };

    const onMouseDown = (e) => {
        if (!sidebarRef.current) return;
        positionRef.current = {
            dragging: true,
            clientX: e.clientX,
        };
        // 及时将事件委托至document
        document.addEventListener('mousemove', mouseMoveHandler);
        document.addEventListener('mouseup', mouseUpHandler);
    };

    useEffect(() => {
        // 及时清除事件监听
        return () => {
            document.removeEventListener('mousemove', mouseMoveHandler);
            document.removeEventListener('mouseup', mouseUpHandler);
        };
    }, []);
    return (
        <SideContent ref={sidebarRef}>
            这是侧边栏内容，右侧有一个可操作的区域
            <DragHandle onMouseDown={onMouseDown} />
        </SideContent>
    )
};
```

我们利用节点`ref`直接操作节点样式，避免组件多次渲染引起的性能问题；
通过监听`DragHandle`的鼠标按下事件，将接下来的`mouseUp`和`mouseMove`分别委托至`document`对象，这样可避免鼠标移动过程中脱离`DragHandle`的问题，保证鼠标移动时的流畅度，避免事件丢失的问题。

## 扩展

网上已经有人实现了很多拖拽库，如[`react-rnd`](https://www.npmjs.com/package/react-rnd)等，具体的实现原理未探究，同样也是非常顺滑，有时间可以研究一下其实现原理。如果是业务场景需要的话，这个库基本上可以很好地解决此类问题。
