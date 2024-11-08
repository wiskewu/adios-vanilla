---
title: Compound Component复合组件
category: web
tags:
  - React
author: wiskewu
created: 2022-07-31 13:56:00
updated: 2024-11-08 18:00:00
top: false
summary: 使用static类静态属性实现复合组件
---

## 背景

我们在使用`Antd`[组件](https://ant.design/components/form-cn/)时经常会有以下写法：

```jsx
<Form>
    <Form.Item name="username">
        <Input />
    </Form.Item>
    <Form.Item name="password">
        <Input.Password />
    </Form.Item>
</Form>
```

那么像`Form.Item`、`Input.Password`这种组件是如何实现的呢？

## 以一个Toggle组件为例

假设我们现在要实现一个`Toggle`组件，其下包含`Toggle.On`、`Toggle.Off`用来指示当前状态，以及一个`Toggle.Button`用来更新状态。用法大概如下所示：

```jsx
function App() {
    const onToggle = (...args) => {
        console.log('onToggling: ', ...args);
    };

    return (
        <Toggle onToggle={onToggle}>
            <Toggle.On>开关打开了</Toggle.On>
            <Toggle.Off>开关关闭了</Toggle.Off>
            <Toggle.Button />
        </Toggle>
    );
}
```

我们可以利用类的`static`去实现这个结构的组件：

```jsx
import React from 'react';
import { Switch } from 'antd';

class Toggle extends React.Component {
    static On = ({ on, children }) => (on ? children : null);
    static Off = ({ on, children }) => (on ? null : children );
    static Button = ({ on, toggle }) => {
        return <Switch checked={on} onChange={toggle} />
    };

    state = {
        on: false,
    };

    toggle = () => {
        this.setState(({ on }) => ({
            on: !on,
        }), () => {
            this.props.onToggle(this.state.on);
        });
    };

    render() {
        const { children } = this.props;
        return React.Children.map(children, (child) => React.cloneElement(child, {
            on: this.state.on,
            toggle: this.toggle,
        }));
    }
}
```

## 完善

上述实现中我们未对`children`进行校验，下面我们进行简单的校验以支持普通的`jsx`标签：

```diff
+ function componentHasChild(child) {
+  for (const property in Toggle) {
+    if (Toggle.hasOwnProperty(property)) {
+      if (child.type === Toggle[property]) {
+        return true;
+      }
+    }
+  }
+  return false;
+ }

class Toggle extends React.Component {
    // ...

    render() {
        const { children } = this.props;
+       return React.Children.map(children, child => {
+          if (componentHasChild(child)) {
+              return React.cloneElement(child, {
+                on: this.state.on,
+                toggle: this.toggle,
+              });
+          }
+          return child;
+       });
    }
}
```

使用示例：

```diff
+ const Hi = () => <h1>hello world</h1>
function App() {
    const onToggle = () => console.log('toggle...');
    return (
        <Toggle onToggle={onToggle}>
            <Toggle.On>开关打开了</Toggle.On>
            <Toggle.Off>开关关闭了</Toggle.Off>
            <Toggle.Button />
+           <span>Hello</span>
+           <Hi />
        </Toggle>
    );
}
```

## 升级为Context版本

我们可以使用`Context`改造一下上面的`Toggle`组件：

```jsx
import React from 'react';
import { Switch } from 'antd';

const ToggleContext = React.createContext();

function ToggleConsumer(props) {
  return (
    <ToggleContext.Consumer {...props}>
        {context => {
            if (!context) {
                // 必须被Toggle包裹
                throw new Error(
                    `Toggle compound components cannot be rendered outside the Toggle component`,
                );
            }
            return props.children(context);
        }}
    </ToggleContext.Consumer>
  );
}

class Toggle extends React.Component {
    static On = ({children}) => (
        <ToggleConsumer>
        {({ on }) => (on ? children : null)}
        </ToggleConsumer>
    );

    static Off = ({children}) => (
        <ToggleConsumer>
        {({ on }) => (on ? null : children)}
        </ToggleConsumer>
    );

    static Button = props => (
        <ToggleConsumer>
        {({on, toggle }) => (
            <Switch on={on} onClick={toggle} {...props} />
        )}
        </ToggleConsumer>
    );

    // 此处toggle放在state之上保证state初始化时this.toggle不为空
    toggle = () => {
        this.setState(
            ({ on }) => ({ on: !on }),
            () => this.props.onToggle(this.state.on),
        );
    };
    state = { on: false, toggle: this.toggle };
    render() {
        return (
            <ToggleContext.Provider value={this.state}>
                {this.props.children}
            </ToggleContext.Provider>
        );
    }
}
```

使用示例：

```jsx
function App() {
    const onToggle = (...args) => console.log('onToggle', ...args);

    return (
        <Toggle onToggle={onToggle}>
            <Toggle.On>开关打开了</Toggle.On>
            <Toggle.Off>开关关闭了</Toggle.Off>
            <div>
                <Toggle.Button />
            </div>
        </Toggle>
    );
}
```

## 参考链接

- [advanced-react-patterns-v2](https://github.com/kentcdodds/advanced-react-patterns-v2/blob/main/src/exercises-final/03.extra-2.js)
