---
title: React Hooks核心逻辑实现
category: web
tags:
  - React
  - Hooks
author: wiskewu
created: 2022-07-30 12:56:00
updated: 2024-11-08 18:00:00
top: false
summary: 理解React Hooks内部实现原理并手写一个微型hooks
---


> React Hooks are not magic, just arrays.

`React`钩子函数主要是利用了函数的闭包特性。

## useState基础版

从代码看`useState`如何实现：

```javascript
const MyReact = (function () {
    let _val; // 当前值
    return {
        render(Component) {
            const Comp = Component();
            Comp.render(); // 调用组件的渲染器
            return Comp;
        },
        useState(initialValue) {
            _val = _val || initialValue; // 每次运行时都重新赋值
            function setState(newVal) {
                _val = newVal; // 更新值
            }
            return [_val, setState];
        }
    }
})();
```

使用案例：

```javascript
// 通过返回一个对象来模拟组件的渲染和更新
function Counter() {
    const [count, setCount] = MyReact.useState(0);

    return {
        click: () => setCount(count + 1),
        render: () => console.log('render: ', { count });
    };
}

let App;
App = MyReact.render(Counter); // render: { count: 0 }
App.click(); // mock event
App = MyReact.render(Counter); // render: { count: 1 }
```

## useEffect基础版

上述代码我们利用闭包实现了一个微型的`useState`钩子函数。
利用相同的原理，我们可以实现一个微型的`useEffect`钩子函数。

```javascript
const MyReact = (function () {
    // 存放state
    let _val;
    // 存放依赖项
    let _deps;

    return {
        render(Component) {
            const Comp = Component();
            Comp.render();
            return Comp;
        },
        useEffect(callback, depArray) {
            // 没有依赖的情况下每次渲染都会执行effect
            const hasNoDeps = !depArray;
            // 首次渲染或依赖项变化，则也会重新执行依赖
            const hasDepsChanged = _deps ? !depArray.every((el, i) => el === _deps[i]) : true;
            if (hasNoDeps || hasDepsChanged) {
                callback();
                // 若副作用被执行，则更新依赖项
                _deps = depArray;
            }
        },
        useState(initialValue) {
            _val = _val || initialValue;
            function setState(newVal) {
                _val = newVal;
            }

            return [_val, setState];
        }
    };
})();
```

使用示例：

```javascript
function Counter() {
    const [count, setCount] = MyReact.useState(0);
    MyReact.useEffect(() => {
        console.log('effect: ', count);
    }, [count]);

    return {
        click: () => setCount(count + 1),
        noop: () => setCount(count),
        render: () => console.log('render: ', { count });
    };
}

let App;
App = MyReact.render(Counter);
// effect: 0
// render: { count: 0 }

App.click();
App = MyReact.render(Counter);
// effect: 1
// render: { count: 1 }

App.noop();
App = MyReact.render(Counter);
// render: { count: 1 } 没有任何副作用

App.click();
App = MyReact.render(Counter);
// effect: 2
// render: { count: 2 }

```

## 进阶

虽然上述代码中我们看似实现了`useState`、`useEffect`核心逻辑，但是它们都是只能在单例模式下运行，多个`useState`或`useEffect`将会导致逻辑混乱。
下面我们将实现一个较为完整的hooks版本，核心的要点就是使用**数组+迭代+闭包**：

```javascript
const MyReact = (function () {
    let hooks = []; // 保存state或依赖项
    let currentHook = 0; // hooks迭代索引

    return {
        render(Component) {
            const Comp = Component();
            Comp.render();
            currentHook = 0; // 组件渲染完毕后重置迭代索引值
            return Comp;
        },
        useEffect(callback, depArray) {
            const hasNoDeps = !depArray;
            // 每次执行时获取记录的依赖项
            const deps = hooks[currentHook]; // 类型为数组或undefined
            const hasDepsChanged = deps ? !depArray.every((el, i) => el === deps[i]) : true;
            if (hasNoDeps || hasDepsChanged) {
                callback();
                // 更新依赖项
                hooks[currentHook] = depArray;
            }
            // 下一个迭代
            currentHook++;
        },
        useState(initialValue) {
            hooks[currentHook] = hooks[currentHook] || initialValue; // 类型为any或undefined
            // 此处是为了消除闭包对setState的影响，防止执行setState时索引值不正确
            const setStateHookIndex = currentHook;
            const setState = (newVal) => {
                hooks[setStateHookIndex] = newVal;
            }
            // 下一个迭代
            return [hooks[currentHook++], setState];
        }
    };
})();
```

请注意这行代码`const setStateHookIndex = currentHook;`，看起来没做什么事情，实际上它利用闭包将当前上下文的索引值记录下来，便于后续`setState`时能取到当时定义时的索引值。如果此处不这么写，将会导致`setState`赋值位置错误。

使用案例:

```javascript
function Counter() {
    const [count, setCount] = MyReact.useState(0);
    // 可以同时使用多个useState
    const [text, setText] = MyReact.useState('foo');

    MyReact.useEffect(() => {
        console.log('effect: ', count, text);
    }, [count, text]);

    return {
        click: () => setCount(count + 1),
        type: (txt) => setText(txt),
        noop: () => setCount(count),
        render: () => console.log('render: ', { count, text }),
    };
}

let App;
App = MyReact.render(Counter);
// effect: 0 foo
// render: { count: 0, text: 'foo' }

App.click();
App = MyReact.render(Counter);
// effect: 1 foo
// render: { count: 1, text: 'foo' }

App.type('bar');
App = MyReact.render(Counter);
// effect: 1 bar
// render: { count: 1, text: 'bar' }

App.noop();
App = MyReact.render(Counter);
// 没有副作用执行
// render: { count: 1, text: 'bar' }

App = MyReact.render(Counter);
// effect: 2 bar
// render: { count: 2, text: 'bar' }

```

## 总结

基本的实现原理就是使用一个钩子数组和一个索引，索引随着每个钩子被调用而增加，并在组件被渲染时重置钩子索引，以便下次组件渲染前能正确执行钩子。

上述代码只能在单个组件上进行使用，暂未考虑多组件的情况。

---

## 延伸

其实从上述钩子的实现中，我们可以重新理解`React`[官方](https://zh-hans.reactjs.org/docs/hooks-rules.html#only-call-hooks-at-the-top-level)对钩子函数使用的规则限制：

- 只在最顶层使用Hooks
- 只在React函数中调用Hooks（不要在普通的 JavaScript 函数中调用 Hook）

### 只在最顶层使用Hooks

不要在循环，条件或嵌套函数中调用`Hook`，确保总是在你的`React`函数的最顶层以及任何`return`之前调用他们。遵守这条规则，你就能确保`Hook`在每一次渲染中都**按照同样的顺序**被调用。这让`React`能够在多次的`useState`和`useEffect`调用之间保持`hook`状态的正确。

## 参考链接

- [Deep Dive: How do React hooks really work](https://www.netlify.com/blog/2019/03/11/deep-dive-how-do-react-hooks-really-work/)
