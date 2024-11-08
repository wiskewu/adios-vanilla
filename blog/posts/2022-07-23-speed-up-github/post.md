---
title: React深入-useEffect完全指南
category: web
tags: 
  - React
  - hooks
author: wiskewu
created: 2022-07-24 13:51:00
updated: 2024-11-08 18:00:00
top: false
summary: 忘记你已经学到的，重新认识useEffect
---

> 通篇大部分内容来自[a-complete-guide-to-useeffect](https://overreacted.io/a-complete-guide-to-useeffect/);
> 部分内容根据作者自身理解略有修改和补充。

----

### 背景

我们在使用`useEffect`时总会感觉一知半解，甚至无法理解部分行为与预期的不一致。心中常常迸发以下几个问题：

- 如何使用`useEffect`模拟`componentDidMount`生命周期？
- 如何正确地在`useEffect`里请求数据？`[]`又是什么？
- 我应该把函数作为effect依赖吗？
- 为什么有时候会出现无限重复请求的问题？
- 为什么在effect里拿到的是旧的state或props？

当你开始阅读以下接下来的内容时，你可能需要明白："当你不再透过熟悉的class组件生命周期方法去窥视`useEffect`这个`Hook`时，你才能得以融会贯通。"

让我们带着心中的疑问进入正文吧。

----

### 摘要

如果你不想阅读整篇内容，可以快速浏览这份摘要。要是部分内容不理解，你可以向下翻阅查找更多详细内容。

1. Question: 如何用`useEffect`模拟`componentDidMount`生命周期？

虽然可以使用`useEffect(fn, [])`，但它们并不完全相等。和`componentDidMount`不一样，`useEffect`会捕获props和state。所以即使在回调函数里，你拿到的还是初始的props和state。如果你想拿到"最新"的值，你可以使用ref，不过，通常有更简单的方式，并不一定要用到ref。记住，effects的心智模型与`componentDidMount`以及其他生命周期是不同的。试图找到它们之间的一致性表达反而会使你更加混淆。想要更有效，你需要"Think in effects"，它的心智模型更接近于实现状态同步，而不是响应生命周期事件。

2. Question: 如何正确地在`useEffect`里请求数据？`[]`又是什么？

`[]`表示effect没有使用任何React数据流里的值，因此该effect仅被调用一次是安全的。`[]`同样也是一类常见问题的来源，也即你以为没使用到数据流里的值但实际上却用到了。

3. Question: 我应该把函数当作effect的依赖吗？

一般建议把不依赖props和state的函数提到你的函数组件之外，并且把那些仅被effect使用到的函数放到effect里面。如果这样做了之后，你的effect还是需要用到组件内的函数（包括通过props传递的函数），可以在定义这些函数的地方使用`useCallback`包裹一层。这样即使后续函数需要使用到某些依赖值，也可以很方便地将这些依赖性添加至`useEffect`中。

4. Question: 为什么有时候会出现无限请求的问题？

这个通常发生于你在effect里做数据请求并且没有设置effect依赖参数的情况。没有设置依赖的话，effect会在每次渲染之后执行一次，然后在effect中更新了状态引起组件渲染并再次触发effect。无限循环的发生也可能是因为你设置的依赖总是会在组件更新时改变。你可以通过一个个移除的方式排查出哪个依赖导致了问题，但是，移除你使用的依赖（或者盲目地使用`[]`）通常是一种错误的解决方式。你应该做的是解决问题的根源。举个例子，函数可能会导致这个问题，你可以把它们放到effect里，或者提到组件外面，或者用`useCallback`包一层，`useMemo`可以做类似的事情以避免重复生成对象。

5. 为什么有时候在effect里拿到的是旧的state或props呢？

*effect拿到的总是定义它的那一次渲染中的props或state*。如果你觉得在渲染中拿到了一些旧的props或state，且不是你想要的，那么你很可能遗漏了一些依赖。

----

### 每一次渲染都有它自己的Props和State

在我们讨论effects之前，我们需要先讨论一下渲染(rendering)。
我们来看一个Counter组件：

```jsx
function Counter() {
    const [count, setCount] = useState(0);

    return (
        <div>
            <p>you clicked {count} times</p>
            <button onClick={() => setCount(count + 1)}>Click me</button>
        </div>
    )
}
```

注意观察`<p>you clicked {count} times</p>`这行代码。`count`会"监听"状态的变化并自动更新吗？实际上`count`仅是一个数字而已。它不是神奇的"data binding"、"watcher"、"proxy"，或者其他任何东西，它就是一个普通的数字而已，就像下面这样：

```js
const count = 0;
// ...
<p>you clicked {count} times</p>
// ...
```

我们的组件第一次渲染时，从`useEffect`拿到`count`的初始值是`0`。当我们调用`setCount(1)`时，React会再次渲染组件，这一次`count`是`1`，如此等等：

```jsx
// 首次渲染
function Counter() {
    const count = 0; // Returned by useState
    return (
        // ...
        <p>you clicked {count} times</p>
        // ...
    )
}

// 点击一次按钮之后，组件更新并渲染
function Counter() {
    const count = 1; // Returned by useState
    return (
        // ...
        <p>you clicked {count} times</p>
        // ...
    )
}

// 再次点击按钮之后，组件更新并渲染
function Counter() {
    const count = 2; // Returned by useState
    return (
        // ...
        <p>you clicked {count} times</p>
        // ...
    )
}
```

当我们更新状态的时候，React会重新渲染组件。每一次渲染都能拿到独立的`count`状态，这个状态是函数中的一个常量。
所以下面这行代码没有做任何特殊的数据绑定：

```jsx
<p>you clicked {count} times</p>
```

它仅仅只是在渲染输出中插入了`count`这个数字，这个数字由React提供。当`setCount`的时候，React会带着一个不同的`count`值再次调用组件。然后，React会更新DOM以保持和渲染输出一致。

这里关键的点在于任意一次渲染中的`count`常量都不会随着时间改变。渲染输出会变是因为我们的组件被一次次调用，而每一次调用引起的渲染中，它包含的`count`值独立于其他渲染。

### 每一次渲染都有它自己的事件处理函数

看下面这个例子：

```jsx
function Counter() {
    const [count, setCount] = useState(0);

    function handleAlertClick() {
        // 三秒之后弹出点击次数
        setTimeout(() => {
            alert('你点击了' + count);
        }, 3000);
    }

    return (
        <div>
            <p>you clicked {count} times</p>
            <button onClick={() => setCount(count + 1)}>Plus one</button>
            <button onClick={handleAlertClick}>Alert</button>
        </div>
    );
}
```

如果我按照下面的步骤去操作：

1. 连续点击"Plus one"按钮增加计数器到3
2. 点击一下"Alert"按钮
3. 在定时器回调触发前继续点击"Plus one"到5

此时会弹出"3"还是"5"？ 正确答案是"3"，即事件"捕获"了我点击按钮时候的状态。

----

但它究竟是如何工作的呢？我们发现`count`在每一次函数调用中都是一个常量值。值得强调的是，我们的组件函数每次渲染都会被调用，但是每一次调用中`count`值都是常量，并且它被赋予了当前渲染中的状态值。
这并不是React特有，普通的函数也有类似的行为：

```js
function sayHi(person) {
    // 注意此处读值
    const name = person.name;
    setTimeout(() => {
        alert('Hello, ' + name);
    }, 3000);
}

let someone = { name: "Dan" };
sayHi(someone);

someone = { name: "Yuzhi" };
sayHi(someone);

someone = { name: "Dominic" };
sayHi(someone);
```

在上面这个例子中。外层的`someone`会被赋值很多次（就像React中组件的状态会改变一样）。然后，在`sayHi`函数中，局部常量`name`回和某次调用中的`person`关联。因为这个变量是局部的，所以每一次调用都是相互独立的。结果就是，当定时器触发时，每一个alert都会弹出它所拥有的`name`。

这就解释了我们的事件处理函数如何捕获点击时的`count`值。如果我们应用相同的替换原理，每一次渲染"看到"的都是它自己的`count`:

```tsx
// 首次渲染
function Counter() {
    const count = 0; // Returned by useState
    // ...
    function handleAlertClick() {
        setTimeout(() => {
            alert('你点击了' + count)
        }, 3000);
    }
    // ...
}

// 第一次点击Plus one按钮
function Counter() {
    const count = 1; // Returned by useState
    // ...
    function handleAlertClick() {
        setTimeout(() => {
            alert('你点击了' + count)
        }, 3000);
    }
    // ...
}

// 第二次点击Plus one按钮
function Counter() {
    const count = 2; // Returned by useState
    // ...
    function handleAlertClick() {
        setTimeout(() => {
            alert('你点击了' + count)
        }, 3000);
    }
    // ...
}
```

所以实际上，每一次渲染都有一个"新版本"的`handleAlertClick`。每一个版本的`handleAlertClick`函数"记住"了它自己的`count`：

```tsx
// 首次渲染
function Counter() {
    // ...
    function handleAlertClick() {
        setTimeout(() => {
            alert('你点击了' + 0)
        }, 3000);
    }
    // ... 函数内持有了 0 值
    <button onClick={handleAlertClick}>Alert</button>
    // ...
}

// 第一次点击Plus one按钮
function Counter() {
    // ...
    function handleAlertClick() {
        setTimeout(() => {
            alert('你点击了' + 1)
        }, 3000);
    }
    // ... 函数内持有了 1 值
    <button onClick={handleAlertClick}>Alert</button>
    // ...
}

// 第二次点击Plus one按钮
function Counter() {
    // ...
    function handleAlertClick() {
        setTimeout(() => {
            alert('你点击了' + 2)
        }, 3000);
    }
    // ... 函数内持有了 2 值
    <button onClick={handleAlertClick}>Alert</button>
    // ...
}
```

也就是说事件处理函数"属于"某一次特定的渲染，当你点击的时候，它会使用那次渲染中`counter`的状态值。

在任意一次渲染中，props和state是始终不变的。如果props和state在不同的渲染中是相互独立的，那么使用到它们的任何值也是独立的（包括事件处理函数）。它们都"属于"一次特定的渲染。即便是事件处理中的异步函数调用"看到"的也是这次渲染中的`count`值。

### 每次渲染都有它自己的Effects

通过上述的计数器例子，我们已经知道`count`是属于某个特定渲染中的常量。事件处理函数"看到"的是属于它那次特定渲染中的`count`值，对于effects也同样如此。

并不是`count`的值在"不变"的effect中发生了改变，而是effect本身在每一次渲染中都不相同。
每一个effect版本"看到"的`count`值都来自于它属于的那一次渲染：

```jsx
// 首次渲染
function Counter() {
    // ...
    const count = 0; // Returned by useState
    useEffect(() => {
        document.title = `You clicked ${0} times`;
    });
    // ...
}

// 第一次点击Plus one按钮
function Counter() {
    // ...
    const count = 1; // Returned by useState
    useEffect(() => {
        document.title = `You clicked ${1} times`;
    });
    // ...
}

// 第二次点击Plus one按钮
function Counter() {
    // ...
    const count = 2; // Returned by useState
    useEffect(() => {
        document.title = `You clicked ${2} times`;
    });
    // ...
}
```

React会记住你提供的effect函数，并且会在每次更改作用于DOM并让浏览器绘制屏幕后去调用它。

所以索然我们说的是一个effect（这里指的是上述更新document的title），但其实每次渲染都是一个不同的函数-- 并且每个effect函数"看到"的props和state都来自于它属于的那次特定渲染。

概念上，你可以想象effects是渲染结果的一部分。

严格来说，它们并不是（为了允许Hooks组合并且不引入笨拙的语法或者运行时）。但是在我们构建的心智模型上，effect函数属于某个特定的渲染，就像事件处理函数一样。

----

为了确保我们已经有了扎实的理解，我们再回顾一下第一次的渲染过程：

1. React：给我状态为`0`时候的UI。
2. 你的组件：
    - 给你需要渲染的内容：`<p>You clicked 0 times</p>`；
    - 记得在渲染完了之后调用这个effect：`() => document.title = 'you clicked 0 times'`；
3. React: 没问题，开始更新UI，喂浏览器，我要给DOM添加一些东西。
4. 浏览器：酷，我已经把它绘制到屏幕上了。
5. React：好的，我现在开始运行给我的effect
    - 运行`() => document.title = 'you clicked 0 times'`。

现在让我们回顾一下我们点击之后发生了什么：

1. 你的组件：喂React，把我的状态设置为`1`。
2. React：好的，给我状态为`1`时候的UI。
3. 你的组件：
    - 给你需要渲染的内容：`<p>You clicked 1 times</p>`；
    - 记得在渲染完了之后调用这个effect：`() => document.title = 'you clicked 1 times'`；
4. React: 没问题，开始更新UI，喂浏览器，我要给DOM添加一些东西。
5. 浏览器：酷，我已经把它绘制到屏幕上了。
6. React：好的，我现在开始运行给我的effect
    - 运行`() => document.title = 'you clicked 1 times'`。

----

### 每一次渲染都有它自己的...所有

我们现在知道effects会在每次渲染之后运行，并且概念上它是组件输出的一部分，可以"看到"属于某次特定渲染的props和state。

思考以下代码：

```jsx
function Counter() {
    const [count, setCount] = useState(0);

    useEffect(() => {
        setTimeout(() => {
            console.log(`You clicked ${count} times`);
        }, 3000);
    });

    return (
        <div>
            <p>You clicked {count} times</p>
            <button onClick={() => setCount(count + 1)}>
                Click me
            </button>
        </div>
    );
}
```

如果我点击了很多次并且在effect里设置了延时，打印出来的结果是什么呢？
正确的答案是我们将会看到顺序的打印：

```txt
// init
You clicked 0 times
// click
You clicked 1 times
You clicked 2 times
You clicked 3 times
You clicked 4 times
...
```

不过，class组件中的`this.state`并不是这样运作的。你可能会想当然以为下面的class实现和上面是相等的：

```jsx
class Example extends Component {
  state = {
    count: 0
  };
  componentDidMount() {
    setTimeout(() => {
      console.log(`You clicked ${this.state.count} times`);
    }, 3000);
  }
  componentDidUpdate() {
    setTimeout(() => {
      console.log(`You clicked ${this.state.count} times`);
    }, 3000);
  }
  render() {
    return (
      <div>
        <p>You clicked {this.state.count} times</p>
        <button onClick={() => this.setState({
          count: this.state.count + 1
        })}>
          Click me
        </button>
      </div>
    )
  }
}
```

然而，`this.state.count`总是指向最新的`count`值，而不是属于某次特定渲染的值。
所以你会看到每次打印输出都是同一个值（假设连续点击了五次按钮）：

```txt
// init
You clicked 0 times
// click
You clicked 5 times
You clicked 5 times
You clicked 5 times
You clicked 5 times
You clicked 5 times
...
```

Hooks这么依赖JavaScript闭包是挺讽刺的一件事。有时候组件的class实现方式会受闭包相关的苦，但其实这个例子中真正混乱的来源是可变数据（React修改了class中的`this.state`使其指向最新状态），并不是闭包本身的错。

当封闭的值始终不会变的情况下闭包是非常棒的。这使得它们非常容易思考，因为你本质上是在引用常量。正如我们所讨论的，props和state在某个特定渲染中是不会改变的。顺便说一下，我们可以使用闭包去修复上面的class版本：

```jsx
class Example extends Component {
  state = {
    count: 0
  };
  componentDidMount() {
    const count = this.state.count;
    setTimeout(() => {
      console.log(`You clicked ${count} times`);
    }, 3000);
  }
  componentDidUpdate() {
    const count = this.state.count;
    setTimeout(() => {
      console.log(`You clicked ${count} times`);
    }, 3000);
  }
  render() {
    return (
      <div>
        <p>You clicked {this.state.count} times</p>
        <button onClick={() => this.setState({
          count: this.state.count + 1
        })}>
          Click me
        </button>
      </div>
    )
  }
}
```

### 逆潮而动

到目前为止，我们可以明确地喊出下面重要的事实：**每一个组件内的函数（包括事件处理函数，effects，定时器或者API调用等等）会捕获某次渲染中定义的props和state**。

所以下面的两个例子是相等的：

```jsx
function Example(props) {
    useEffect(() => {
        setTimeout(() => {
            console.log(props.counter);
        }, 1000);
    });
    // ...
}
```

例二：

```jsx
function Example(props) {
    const counter = props.counter;
    useEffect(() => {
        setTimeout(() => {
            console.log(counter);
        }, 1000);
    });
    // ...
}
```

在组件内什么时候去读取props或state是无关紧要的，因为它们不会改变。在单次渲染的范围内，props和state始终保持不变（解构赋值的props会使得这一点更明显）。

> 当然，有时候你可能想在effect的回调函数里读取最新的值而不是捕获的值。最简单的实现方法是使用refs。

需要注意的是，当你想要从过去渲染的函数里读取未来的props和state，你是在逆潮而动。虽然它并没有错（有时候可能也需要这么做），但它打破了默认范式会使代码显得不够"干净"。这是我们有意为之的，因为它能帮助突出哪些代码是脆弱的，是需要依赖时间次序的。在class中，发生这种情况就没那么显而易见的。

下面的计数器版本模拟了class中的行为：

```jsx
function Example() {
    const [count, setCount] = useState(0);
    const latestCount = useRef(count);

    useEffect(() => {
        // 更新到最新值
        latestCount.current = count;
        setTimeout(() => {
            // 读取最新的可变值
            console.log(`You clicked ${latestCount.current} times`);
        }, 3000);
    });

    // ...
}
```

连续点击五次按钮之后：

```txt
// init
You clicked 0 times
// click
You clicked 5 times
You clicked 5 times
You clicked 5 times
You clicked 5 times
You clicked 5 times
...
```

### Effect中的清理

像[React官网](https://reactjs.org/docs/hooks-effect.html#effects-with-cleanup)介绍的，有些effects可能需要一个清理步骤。本质上，它的目的是消除副作用（effect），比如取消订阅。

思考以下代码：

```jsx
// ...
useEffect(() => {
    ChatAPI.subscribeToFriendStatus(props.id, handleStatusChange);
    return () => {
      ChatAPI.unsubscribeFromFriendStatus(props.id, handleStatusChange);
    };
});
// ...
```

假设第一次渲染时`props`是`{ id: 10 }`，第二次渲染时是`{ id: 20 }`。你可能会认为发生了下面这些事情：

1. React清除了`{ id: 10 }`的effect；
2. React渲染了`{ id: 20 }`的UI；
3. React运行了`{ id: 20 }`的effect;

但事实上并不是这样的。

React只会在浏览器绘制后运行effects，这使得你的应用更流畅，因为大多数effects并不会阻塞屏幕的更新。Effects的清除同样被延迟了，上一次的effect会在重新渲染后被清除：

1. React渲染`{ id: 20 }`的UI；
2. 浏览器绘制，我们在屏幕上看到`{ id: 10 }`的UI；
3. React清除`{ id: 10 }`的effect；
4. React运行`{ id: 20 }`的effect。

你可能会好奇：如果清除上一次effect发生在props变成`{ id: 20 }`之后，那它为什么还能"看到"旧的`{ id: 10 }`？

我们可以引用上半部分得到的结论：
> 组件内的每一个函数（包括事件处理函数，effects，定时器或者API调用等等）会捕获定义它们的那次渲染中的props和state。

现在答案显而易见，effect的清除并不会读取"最新"的props。它只能读取到定义它的那次渲染中的props：

```jsx
// 首次渲染, props为{ id: 10 }
function Example() {
    useEffect(() => {
        ChatAPI.subscribeToFriendStatus(10, handleStatusChange);
        return () => {
            ChatAPI.unsubscribeFromFriendStatus(10, handleStatusChange);
        };
    });
    // ...
}

// props更新为{ id: 20 }
function Example() {
    useEffect(() => {
        ChatAPI.subscribeToFriendStatus(20, handleStatusChange);
        return () => {
            ChatAPI.unsubscribeFromFriendStatus(20, handleStatusChange);
        };
    });
    // ...
}
```

这正是为什么React能做到在绘制之后立即处理effects--并且默认情况下使你的应用运行更流畅。因为你的代码依然可以访问到旧的props，因此清除effect的过程可以发生在UI渲染之后。

### 同步，而非生命周期

假设有这么个组件：

```jsx
function Greeting({ name }) {
    return (
        <h1 className="greeting">Hello, {name}</h1>
    );
}
```

我先渲染`<Greeting name="Dan" />`然后渲染`<Greeting name="Yuzhi" />`和我直接渲染`<Greeting name="Yuzhi" />`并没有什么区别。在这两种情况下，我们最后看到的都是`Hello, Yuzhi`。

人们总是说："重要的是旅行过程，而不是目的地"。在React世界里，恰好相反。重要的是目的，而不是过程。
React会根据我们当前的props和state同步到DOM。"mount"和"update"之于渲染并没有什么区别。

你应该以相同的方式去思考effects。`useEffect`使你能够根据props和state同步React Tree之外的东西。

```jsx
function Greeting({ name }) {
  useEffect(() => {
    document.title = 'Hello, ' + name;
  });
  return (
    <h1 className="Greeting">
      Hello, {name}
    </h1>
  );
}
```

这就是和大家熟知的mount/update/unmount心智模型之间细微的区别。理解和内化这种区别是非常重要的。如果你试图写一个effect会根据是否第一次渲染而表现不一致，那么你正在逆潮而动。如果我们的结果依赖于过程而不是目的，我们就会在同步中犯错。

先渲染属性A、B，再渲染C，和立即渲染C并没有什么区别。虽然它们可能短暂地会有点不同（比如请求数据时），但最终的结果是一样的。

不过话说回来，在每一次渲染后都去运行所有的effects可能并不高效。（并且在某些场景下，它可能会导致无限循环）

### 告诉React去对比你的effects

其实我们已经从React处理DOM的方式中学习到了解决办法。React只会更新DOM真正发生改变的部分，而不是每次渲染都大动干戈。
当你把：

```jsx
<h1 className="Greeting">
  Hello, Dan
</h1>
```

更新到：

```jsx
<h1 className="Greeting">
  Hello, Yuzhi
</h1>
```

React能够看到两个对象：

```js
const oldProps = {className: 'greeting', children: 'Hello, Dan'};
const newProps = {className: 'greeting', children: 'Hello, Yuzhi'};
```

它会检测每一个props，并且发现`children`发生变化需要更新DOM，但`className`并没有变化，所以它只需要这么做：

```js
domNode.innerText = 'Hello, Yuzhi';
// No need to touch domNode.className
```

我们也可以用类似的方式处理effects吗？如果能够在不需要的时候避免调用effect就太好了。举个例子，我们的组件可能因为状态变更而重新渲染：

```jsx
function Greeting({ name }) {
  const [counter, setCounter] = useState(0);

  useEffect(() => {
    document.title = 'Hello, ' + name;
  });

  return (
    <h1 className="Greeting">
      Hello, {name}
      <button onClick={() => setCounter(counter + 1)}>
        Increment
      </button>
    </h1>
  );
}
```

但是我们的effect并没有使用`counter`这个状态。我们的effect只会同步`name`属性给`document.title`，但`name`并没有变。在每一次`counter`改变后重新给`document.title`赋值并不是理想的做法。

那React可以…区分effects的不同吗？比如：

```js
let oldEffect = () => { document.title = 'Hello, Dan'; };
let newEffect = () => { document.title = 'Hello, Dan'; };
// React可以看到这两个函数做了相同的事情吗？
```

很明显，如果不执行的话React并不能猜测到函数做了什么。（源码中并没有包含特殊的值，它仅仅只是引用了`name`属性）

这就是为什么你如果想要避免effects不必要的重复调用，你可以提供给`useEffect`一个依赖数组参数(deps):

```jsx
// ...
useEffect(() => {
    document.title = 'Hello, ' + name;
  }, [name]); // 显式声明依赖项
// ...
```

这好比你告诉React："Hey，我知道你看不到这个函数里的东西，但我可以保证只使用了渲染中的`name`，别无其他。"

如果当前渲染中的这些依赖项和上一次运行这个effect的时候值一样，因为没有什么需要同步，那么React会自动跳过这次effect：

```js
const oldEffect = () => { document.title = 'Hello, Dan'; };
const oldDeps = ['Dan'];

const newEffect = () => { document.title = 'Hello, Dan'; };
const newDeps = ['Dan'];

// React无法感知函数内部是否变化，但它可以比对依赖项
// 因为依赖性没有改变，所以React无需再次执行这个effect
```

即使依赖数组中只有一个值在两次渲染中不一样，我们也不能跳过effect的运行。要同步所有！

### 别对React欺骗所需的依赖项

在依赖项上，对React欺骗会导致不好的结果。这很好理解，但是在编写代码时却又常常违反这个范式：

```jsx
function SearchResults() {
  async function fetchData() {
    // ...
  }

  useEffect(() => {
    fetchData();
  }, []); // 这样做可行吗？并不完全，有更好的方法去实现这个effect

  // ...
}
```

上述代码中你可能只是想在组件挂载时运行某个effect。但是你必须记住："一旦你设置了依赖项，那么effect中用到的所有组件内的值都要包含在依赖中。这包括props、state、函数---组件内的任何东西"。

有时候你按照上述说的做了，但可能会引起一个问题。比如，你可能会遇到无限请求的问题，或者socket被频繁创建的问题。解决问题的方法不是移除依赖项，我们在接下来的内容会了解到具体的解决方案。

### 如果设置了错误的依赖会怎么样？

如果依赖项包含了所有effect中使用到的值，React就能知道何时需要运行它：

```jsx
useEffect(() => {
    document.title = 'Hello, ' + name;
}, [name]);
```

但是如果我们将`[]`设为effect的依赖，新的effect函数不会运行：

```jsx
useEffect(() => {
    document.title = 'Hello, ' + name;
}, []); // 错误：缺失了name依赖
```

在这个例子中，问题看起来显而易见。但在某些情况下如果你脑子里"跳出"class组件的解决办法，你的直觉很可能会欺骗你。

举个例子，我们来写一个每秒递增的计数器。在Class组件中，我们的直觉是："开启一次定时器，清除也是一次"。
当我们理所当然地把它用`useEffect`的方式翻译，直觉上我们会设置依赖为`[]`。"我只想运行一次effect"，对吗？

```jsx
function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setCount(count + 1);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return <h1>{count}</h1>;
}
```

然而，上面这个例子只会递增一次（从0->1）。
如果你的心智模型是"只有当我想重新触发effect的时候才需要去设置依赖"，这个例子可能会让你产生怀疑。

如果你知道依赖是我们给React的暗示，告诉它effect所有需要使用的渲染中的值，你就不会吃惊了。effect中使用了`count`但我们撒谎说它没有依赖。

在第一次渲染中，`count`是`0`。因此，`setCount(count + 1)`在第一次渲染中等价于`setCount(0 + 1)`。既然我们设置了`[]`依赖，effect不会再重新运行，它后面每一秒都会调用`setCount(0 + 1)`:

```jsx
// 首次渲染，count = 0
function Counter() {
  // ...
  useEffect(
    () => {
      const id = setInterval(() => {
        setCount(0 + 1); // 永远是 setCount(1)
      }, 1000);
      return () => clearInterval(id);
    },
    [] // 永远不会重新运行
  );
  // ...
}

// 下一次渲染, count = 1
function Counter() {
  // ...
  useEffect(
    // 这个effect无法重新执行
    // 因为我们欺骗React这个effect无需依赖
    () => {
      const id = setInterval(() => {
        setCount(1 + 1);
      }, 1000);
      return () => clearInterval(id);
    },
    []
  );
  // ...
}
```

我们对React撒谎说我们的effect不依赖组件内的任何值，可实际上我们的effect有依赖！

我们的effect依赖count - 它是组件内的值（不过在effect外面定义）：

```jsx
const count = // ...

useEffect(() => {
    const id = setInterval(() => {
        setCount(count + 1);
    }, 1000);
    return () => clearInterval(id);
}, []);
// ...
```

### 两种诚实告知依赖的方法

有两种诚实告知React所需依赖的策略。你应该从第一种开始，然后在需要的时候应用第二种。

第一种策略是在依赖中包含所有effect中用到的组件内的值。让我们在依赖中包含`count`:

```jsx
useEffect(() => {
  const id = setInterval(() => {
    setCount(count + 1);
  }, 1000);
  return () => clearInterval(id);
}, [count]);
```

现在依赖数组正确了,虽然它可能不是太理想但确实解决了上面的问题。现在，每次count修改都会重新运行effect，并且定时器中的`setCount(count + 1)`会正确引用某次渲染中的 count值。
这能解决问题但是我们的定时器会在每一次count改变后清除和重新设定。这应该不是我们想要的结果。

第二种策略是修改effect内部的代码以确保它包含的值只会在需要的时候发生变更。我们不想告知错误的依赖 - 我们只是修改effect使得依赖更少。

----

### 让Effects自给自足

我们想去掉effect的`count`依赖，为了实现这个目的，我们需要问自己一个问题：我们为什么要用`count`？可以看到我们只在`setCount`调用中用到了`count`。在这个场景中，我们其实并不需要在effect中使用`count`。当我们想要根据前一个状态更新状态的时候，我们可以使用`setState`的函数形式：

```jsx
useEffect(() => {
    const id = setInterval(() => {
      setCount(c => c + 1);
    }, 1000);
    return () => clearInterval(id);
}, []);
```

我们需要告知React的仅仅是去递增状态 - 不管它现在具体是什么值(实际上React已经知道当前的`count`值)。这正是`setCount(c => c + 1)`做的事情。你可以认为它是在给React"发送指令"告知如何更新状态。这种"更新形式"在其他情况下也有帮助，比如你需要批量更新。

尽管effect只运行了一次，第一次渲染中的定时器回调函数可以完美地在每次触发的时候给React发送`c => c + 1`更新指令。它不再需要知道当前的`count`值, 因为React已经知道了。

### 解耦来自Actions的更新

即使是`setCount(c => c + 1)`也并不完美。它看起来有点怪，并且非常受限于它能做的事。举个例子，如果我们有两个互相依赖的状态，或者我们想基于一个prop来计算下一次的state，它并不能做到。幸运的是， `setCount(c => c + 1)`有一个更强大的姐妹模式，它的名字叫`useReducer`。

我们来修改上面的例子让它包含两个状态：`count` 和 `step`。我们的定时器会每次在`count`上增加一个`step`值：

```jsx
function Counter() {
  const [count, setCount] = useState(0);
  const [step, setStep] = useState(1);

  useEffect(() => {
    const id = setInterval(() => {
      setCount(c => c + step);
    }, 1000);
    return () => clearInterval(id);
  }, [step]);

  return (
    <>
      <h1>{count}</h1>
      <input value={step} onChange={e => setStep(Number(e.target.value))} />
    </>
  );
}
```

这个例子目前的行为是修改`step`会重启定时器 - 因为它是依赖项之一。在大多数场景下，这正是你所需要的。清除上一次的effect然后重新运行新的effect并没有任何错。除非我们有很好的理由，我们不应该改变这个默认行为。
不过，假如我们不想在`step`改变后重启定时器，我们该如何从effect中移除对`step`的依赖呢？

**当你想更新一个状态，并且这个状态更新依赖于另一个状态的值时，你可能需要用`useReducer`去替换它们。**

我们用一个`dispatch`依赖去替换effect的`step`依赖:

```jsx
const initialState = {
  count: 0,
  step: 1,
};

function reducer(state, action) {
  const { count, step } = state;
  if (action.type === 'tick') {
    return { count: count + step, step };
  } else if (action.type === 'step') {
    return { count, step: action.step };
  } else {
    throw new Error();
  }
}


function Counter() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { count, step } = state;

  useEffect(() => {
    const id = setInterval(() => {
      dispatch({ type: 'tick' });
    }, 1000);
    return () => clearInterval(id);
  }, [dispatch]);

  return (
    <>
      <h1>{count}</h1>
      <input value={step} onChange={e => {
        dispatch({
          type: 'step',
          step: Number(e.target.value)
        });
      }} />
    </>
  );
}
```

你可能会问："这怎么就更好了？"答案是**React会保证`dispatch`在组件的声明周期内保持不变**。所以上面例子中不再需要重新订阅定时器。（你可以从依赖中去除dispatch, setState, 和useRef包裹的值因为React会确保它们是静态的。不过你设置了它们作为依赖也没什么问题。）

### 为什么useReducer是Hooks的作弊模式

我们已经学习到如何移除effect的依赖，不管状态更新是依赖上一个状态还是依赖另一个状态。但假如我们需要依赖props去计算下一个状态呢？举个例子，也许我们的API是`<Counter step={1} />`。确定的是，在这种情况下，我们没法避免依赖`props.step` 。是吗？

实际上， 我们可以避免！我们可以把reducer函数放到组件内去读取props：

```jsx
function Counter({ step }) {
  const [count, dispatch] = useReducer(reducer, 0);

  function reducer(state, action) {
    if (action.type === 'tick') {
      return state + step;
    } else {
      throw new Error();
    }
  }

  useEffect(() => {
    const id = setInterval(() => {
      dispatch({ type: 'tick' });
    }, 1000);
    return () => clearInterval(id);
  }, [dispatch]);

  return <h1>{count}</h1>;
}
```

这种模式会使一些优化失效，所以你应该避免滥用它，不过如果你需要,你完全可以在reducer里面访问props。

即使是在这个例子中，React也保证dispatch在每次渲染中都是一样的。 所以你可以在依赖中去掉它。它不会引起effect不必要的重复执行。

你可能会疑惑：这怎么可能？在之前渲染中调用的reducer怎么"知道"新的props？答案是当你`dispatch`的时候，React只是记住了action - 它会在下一次渲染中再次调用reducer。在那个时候，新的props就可以被访问到，而且reducer调用也不是在effect里。

这就是为什么我倾向认为`useReducer`是Hooks的"作弊模式"。它可以把更新逻辑和描述发生了什么分开。结果是，这可以帮助我移除不必需的依赖，避免不必要的effect调用。

### 把函数移到Effects里

一个典型的误解是认为函数不应该成为依赖，举个例子，下面的代码看上去可以运行正常：

```jsx
function SearchResults() {
  const [data, setData] = useState({ hits: [] });

  async function fetchData() {
    const result = await axios(
      'https://hn.algolia.com/api/v1/search?query=react',
    );
    setData(result.data);
  }

  useEffect(() => {
    fetchData();
  }, []); // Is this okay?

  // ...
```

需要明确的是，上面的代码可以正常工作。但这样做在组件日渐复杂的迭代过程中我们很难确保它在各种情况下还能正常运行。

想象一下我们的代码做下面这样的分离，并且每一个函数的体量是现在的五倍：

```jsx
function SearchResults() {
  // 想象一下这里的函数体特别庞大
  function getFetchUrl() {
    return 'https://hn.algolia.com/api/v1/search?query=react';
  }

  // 想象一下这里的函数体也特别庞大
  async function fetchData() {
    const result = await axios(getFetchUrl());
    setData(result.data);
  }

  useEffect(() => {
    fetchData();
  }, []);

  // ...
}
```

然后我们在某些函数内使用了某些state或者prop：

```jsx
function SearchResults() {
  const [query, setQuery] = useState('react');

  // Imagine this function is also long
  function getFetchUrl() {
    return 'https://hn.algolia.com/api/v1/search?query=' + query;
  }

  // Imagine this function is also long
  async function fetchData() {
    const result = await axios(getFetchUrl());
    setData(result.data);
  }

  useEffect(() => {
    fetchData();
  }, []);

  // ...
}
```

如果我们忘记去更新使用这些函数（很可能通过其他函数调用）的effects的依赖，我们的effects就不会同步props和state带来的变更。这当然不是我们想要的。

幸运的是，对于这个问题有一个简单的解决方案。如果某些函数仅在effect中调用，你可以把它们的定义移到effect中：

```jsx
function SearchResults() {
  // ...
  useEffect(() => {
    // 我们将函数移到了effect里面
    function getFetchUrl() {
      return 'https://hn.algolia.com/api/v1/search?query=react';
    }
    async function fetchData() {
      const result = await axios(getFetchUrl());
      setData(result.data);
    }

    fetchData();
  }, []); // ✅ Deps are OK
  // ...
}

```

这么做有什么好处呢？我们不再需要去考虑这些"间接依赖"。我们的依赖数组也不再撒谎：在我们的effect中确实没有再使用组件范围内的任何东西。
如果我们后面修改 getFetchUrl去使用query状态，我们更可能会意识到我们正在effect里面编辑它 - 因此，我们需要把query添加到effect的依赖里：

```jsx
function SearchResults() {
  const [query, setQuery] = useState('react');

  useEffect(() => {
    function getFetchUrl() {
      return 'https://hn.algolia.com/api/v1/search?query=' + query;
    }

    async function fetchData() {
      const result = await axios(getFetchUrl());
      setData(result.data);
    }

    fetchData();
  }, [query]); // ✅ Deps are OK

  // ...
}
```

添加这个依赖，我们不仅仅是在"取悦React"。在`query`改变后去重新请求数据是合理的。useEffect的设计意图就是要强迫你关注数据流的改变，然后决定我们的effects该如何和它同步 - 而不是忽视它直到我们的用户遇到了bug。

### 但我们无法把个别函数放到effect里面

有时候你可能不想把函数移入effect里。比如，组件内有几个effect使用了相同的函数，你不想在每个effect里复制黏贴一遍这个逻辑。也或许这个函数是一个prop。

在这种情况下你应该忽略对函数的依赖吗？我不这么认为。再次强调，effects不应该对它的依赖撒谎。通常我们还有更好的解决办法。一个常见的误解是，"函数从来不会改变"。但是这篇文章你读到现在，你知道这显然不是事实。实际上，在组件内定义的函数每一次渲染都在变。

函数每次渲染都会改变这个事实本身就是个问题。 比如有两个effects会调用 `getFetchUrl`:

```jsx
function SearchResults() {
  function getFetchUrl(query) {
    return 'https://hn.algolia.com/api/v1/search?query=' + query;
  }

  useEffect(() => {
    const url = getFetchUrl('react');
    // ... Fetch data and do something ...
  }, []); // 🔴 Missing dep: getFetchUrl

  useEffect(() => {
    const url = getFetchUrl('redux');
    // ... Fetch data and do something ...
  }, []); // 🔴 Missing dep: getFetchUrl

  // ...
}
```

在这个例子中，你可能不想把`getFetchUrl` 移到effects中，因为你想复用逻辑。

另一方面，如果你对依赖很"诚实"，你可能会掉到陷阱里。我们的两个effects都依赖getFetchUrl，而它每次渲染都不同，所以我们的依赖数组会变得无用：

```jsx
function SearchResults() {
  // 🔴 每一次渲染都会重新触发所有effect的执行
  function getFetchUrl(query) {
    return 'https://hn.algolia.com/api/v1/search?query=' + query;
  }

  useEffect(() => {
    const url = getFetchUrl('react');
    // ... Fetch data and do something ...
  }, [getFetchUrl]); // 🚧 依赖项错误，因为依赖变化太频繁了

  useEffect(() => {
    const url = getFetchUrl('redux');
    // ... Fetch data and do something ...
  }, [getFetchUrl]); // 🚧 依赖项错误，因为依赖变化太频繁了

  // ...
}
```

一个可能的解决办法是把`getFetchUrl`从依赖中去掉。但是，我不认为这是好的解决方式。这会使我们后面对数据流的改变很难被发现从而忘记去处理。这会导致类似于上面"定时器不更新值"的问题。

相反的，我们有两个更简单的解决办法。

第一个， 如果一个函数没有使用组件内的任何值，你应该把它提到组件外面去定义，然后就可以自由地在effects中使用：

```jsx
// ✅ Not affected by the data flow
function getFetchUrl(query) {
  return 'https://hn.algolia.com/api/v1/search?query=' + query;
}

function SearchResults() {
  useEffect(() => {
    const url = getFetchUrl('react');
    // ... Fetch data and do something ...
  }, []); // ✅ Deps are OK

  useEffect(() => {
    const url = getFetchUrl('redux');
    // ... Fetch data and do something ...
  }, []); // ✅ Deps are OK

  // ...
}
```

你不再需要把它设为依赖，因为它们不在渲染范围内，因此不会被数据流影响。它不可能突然意外地依赖于props或state。

第二个，你也可以把它包装成`useCallback Hook`:

```jsx
function SearchResults() {
  // ✅ Preserves identity when its own deps are the same
  const getFetchUrl = useCallback((query) => {
    return 'https://hn.algolia.com/api/v1/search?query=' + query;
  }, []);  // ✅ Callback deps are OK

  useEffect(() => {
    const url = getFetchUrl('react');
    // ... Fetch data and do something ...
  }, [getFetchUrl]); // ✅ Effect deps are OK

  useEffect(() => {
    const url = getFetchUrl('redux');
    // ... Fetch data and do something ...
  }, [getFetchUrl]); // ✅ Effect deps are OK

  // ...
}
```

`useCallback`本质上是添加了一层依赖检查。它以另一种方式解决了问题 - 我们使函数本身只在需要的时候才改变，而不是去掉对函数的依赖。

如果我把query添加到useCallback 的依赖中，任何调用了`getFetchUrl`的effect在query改变后都会重新运行：

```jsx
function SearchResults() {
  const [query, setQuery] = useState('react');

  // ✅ Preserves identity until query changes
  const getFetchUrl = useCallback(() => {
    return 'https://hn.algolia.com/api/v1/search?query=' + query;
  }, [query]);  // ✅ Callback deps are OK

  useEffect(() => {
    const url = getFetchUrl();
    // ... Fetch data and do something ...
  }, [getFetchUrl]); // ✅ Effect deps are OK

  // ...
}
```

感谢`useCallback`，因为如果`query`保持不变，`getFetchUrl`也会保持不变，我们的effect也不会重新运行。但是如果query修改了，`getFetchUrl`也会随之改变，因此会重新请求数据。

这正是拥抱数据流和同步思维的结果。对于通过属性从父组件传入的函数这个方法也适用：

```jsx
function Parent() {
  const [query, setQuery] = useState('react');

  // ✅ Preserves identity until query changes
  const fetchData = useCallback(() => {
    const url = 'https://hn.algolia.com/api/v1/search?query=' + query;
    // ... Fetch data and return it ...
  }, [query]);  // ✅ Callback deps are OK

  return <Child fetchData={fetchData} />
}

function Child({ fetchData }) {
  let [data, setData] = useState(null);

  useEffect(() => {
    fetchData().then(setData);
  }, [fetchData]); // ✅ Effect deps are OK

  // ...
}
```

因为`fetchData`只有在`Parent`的`query`状态变更时才会改变，所以我们的`Child`只会在需要的时候才去重新请求数据。

### 函数是数据流的一部分吗？

有趣的是，这种模式在class组件中行不通，并且这种行不通恰到好处地揭示了effect和生命周期范式之间的区别。考虑下面的转换：

```jsx
class Parent extends Component {
  state = {
    query: 'react'
  };
  fetchData = () => {
    const url = 'https://hn.algolia.com/api/v1/search?query=' + this.state.query;
    // ... Fetch data and do something ...
  };
  render() {
    return <Child fetchData={this.fetchData} />;
  }
}

class Child extends Component {
  state = {
    data: null
  };
  componentDidMount() {
    this.props.fetchData();
  }
  componentDidUpdate(prevProps) {
    // 🔴 This condition will never be true
    if (this.props.fetchData !== prevProps.fetchData) {
      this.props.fetchData();
    }
  }
  render() {
    // ...
  }
}
```

上述代码中，子组件并不会因为`query`的变化而重新请求数据。因`fetchData`是一个class方法，它不会因为状态的改变而不同。

想要解决这个class组件中的难题，唯一现实可行的办法是硬着头皮把`query`本身传入`Child`组件。`Child`虽然实际并没有直接使用这个`query`的值，但能在它改变的时候触发一次重新请求：

```jsx
class Parent extends Component {
  state = {
    query: 'react'
  };
  fetchData = () => {
    const url = 'https://hn.algolia.com/api/v1/search?query=' + this.state.query;
    // ... Fetch data and do something ...
  };
  render() {
    return <Child fetchData={this.fetchData} query={this.state.query} />;
  }
}

class Child extends Component {
  state = {
    data: null
  };
  componentDidMount() {
    this.props.fetchData();
  }
  componentDidUpdate(prevProps) {
    if (this.props.query !== prevProps.query) {
      this.props.fetchData();
    }
  }
  render() {
    // ...
  }
}
```

在class组件中，函数属性本身并不是数据流的一部分。组件的方法中包含了可变的`this`变量导致我们不能确定无疑地认为它是不变的。因此，即使我们只需要一个函数，我们也必须把一堆数据传递下去仅仅是为了做"diff"。我们无法知道传入的`this.props.fetchData` 是否依赖状态，并且不知道它依赖的状态是否改变了。

使用`useCallback`，函数完全可以参与到数据流中。我们可以说如果一个函数的输入改变了，这个函数就改变了。如果没有，函数也不会改变。感谢周到的`useCallback`，属性比如`props.fetchData`的改变也会自动传递下去。

类似的，`useMemo`可以让我们对复杂对象做类似的事情:

```jsx
function ColorPicker() {
  // Doesn't break Child's shallow equality prop check
  // unless the color actually changes.
  const [color, setColor] = useState('pink');
  const style = useMemo(() => ({ color }), [color]);
  return <Child style={style} />;
}
```

----

### 说说竞态

下面是一个典型的在class组件里发请求的例子：

```jsx
class Article extends Component {
  state = {
    article: null
  };
  componentDidMount() {
    this.fetchData(this.props.id);
  }
  async fetchData(id) {
    const article = await API.fetchArticle(id);
    this.setState({ article });
  }
  // ...
}
```

很明显，上述代码存在一些潜在的问题，它并没有处理props更新的情况。所以第二个你能够在网上找到的经典例子是下面这样的：

```jsx
class Article extends Component {
  state = {
    article: null
  };
  componentDidMount() {
    this.fetchData(this.props.id);
  }
  componentDidUpdate(prevProps) {
    if (prevProps.id !== this.props.id) {
      this.fetchData(this.props.id);
    }
  }
  async fetchData(id) {
    const article = await API.fetchArticle(id);
    this.setState({ article });
  }
  // ...
}
```

这显然好多了！但依旧有问题。有问题的原因是请求结果返回的顺序不能保证一致。比如我先请求 `{id: 10}`，然后更新到`{id: 20}`，但`{id: 20}`的请求更先返回。请求更早但返回更晚的情况会错误地覆盖状态值。

这被叫做竞态，这在混合了`async` / `await`（假设在等待结果返回）和自顶向下数据流的代码中非常典型（props和state可能会在async函数调用过程中发生改变）。

Effects并没有神奇地解决这个问题，尽管它会警告你如果你直接传了一个`async` 函数给effect。

如果你使用的异步方式支持取消，那太棒了。你可以直接在清除函数中取消异步请求。

或者，最简单的权宜之计是用一个布尔值来跟踪它：

```jsx
function Article({ id }) {
  const [article, setArticle] = useState(null);

  useEffect(() => {
    let didCancel = false;

    async function fetchData() {
      const article = await API.fetchArticle(id);
      if (!didCancel) {
        setArticle(article);
      }
    }

    fetchData();

    return () => {
      didCancel = true;
    };
  }, [id]);

  // ...
}
```

----

> 转自：[a-complete-guide-to-useeffect](https://overreacted.io/a-complete-guide-to-useeffect/)
