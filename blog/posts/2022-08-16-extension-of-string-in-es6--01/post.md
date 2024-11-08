---
title: 《ES6标准入门》- 字符串的扩展(上)
category: web
tags:
  - ES6
author: wiskewu
created: 2022-08-16 23:45:00
updated: 2024-11-08 18:00:00
top: false
summary: ES6加强了对Unicode的支持，并且扩展了字符串对象
---


> 参见阮一峰《ES6标准入门》Chapter4：字符串扩展 P49

## 字符的Unicode表示法

JS采用`\uxxxx`形式表示一个字符，其中`xxxx`表示字符的`Unicode`**码点**。如：

```js
console.log('\u0061'); // a
```

这种表示法仅限于码点在`\u0000`-`\uFFFF`之间的字符，超出这个范围的字符，必须用两个双字节的形式表示，如：

```js
console.log('\uD842\uDFB6'); // 𠮶

console.log('\u20BB6'); // ₻6
```

上述代码表示，如果直接在`\u`后面跟上超过`0xFFFF`的数值（比如'\u20BB6'）,JS会理解成`\u20BB`+`6`。
ES6对上述做出了改进，只需要将**码点**放入大括号，就能正确解读该字符：

```js
// 单字符
console.log('\u{20BB6}'); // 𠮶

// 多字符
console.log('\u{41}\u{42}\u{43}'); // ABC

let hello = 123;
console.log('hell\u{6F}'); // hello

// 字符的双字节、四字节表示
console.log('\u{1F680}' === '\uD83D\uDE80'); // true
```

上述最后一个例子表明，**字符的大括号表示法与四字节的`UTF-16`编码是等价的**。

至此，JS共有六种方法可以表示一个字符：

```js
console.log('\z' === 'z'); // true
console.log('\172' === 'z'); // true
console.log('\x7A' === 'z'); // true
console.log('\u007A' === 'z'); // true
console.log('\u{7A}' === 'z'); // true
```

## codePointAt()

在JS内部，字符以UTF-16的格式存储，**每个字符固定为2个字节**。对于那些需要4个字节存储的字符（Unicode码点大于`0xFFFF`的字符），JS会认为它们是2个字符。

```js
var s = "𠮷";

s.length; // 2
s.charAt(0); // ''
s.charAt(1); // ''
s.charCodeAt(0); // 55362
s.charCodeAt(1); // 57271
```

上述代码中，汉字“𠮷”的码点是0x20BB7, UTF-16编码为'0xD842 0xDFB7'(十进制为55362 57271), 需要4个字节储存。由于JS不能正确处理4字节的字符，字符串长度会被误判为2，而且`charAt`方法无法正确读取整个字符，`charCodeAt`方法分别返回前2个字节和后两个字节的值。

ES6提供了`codePointAt`方法，能够正确处理4个字节储存的字符，返回一个字符的码点。

```js
var s = '𠮷a';

s.codePointAt(0); // 134071
s.codePointAt(1); // 57271
s.codePointAt(2); // 97
```

上述代码中，JS将'𠮷a'视为3个字符，`codePointAt`方法在第一个字符上正确地识别了'𠮷',返回它的十进制码点134071（即十六进制地20BB7）。在第二个字符（即'𠮷'后2个字节）和第三个字符上，`codePointAt`与`charCodeAt`方法返回的结果相同。

总之，`codePointAt`会正确返回32位的UTF-16字符的码点。对于那些2个字节存储的常规字符，它的返回结果与`charCodeAt`方法相同。

`codePointAt`返回的是码点的十进制值，如果想要十六进制的值，可以使用`toString`方法转换：

```js
var s = '𠮷a';

s.codePointAt(0).toString(16); // "20BB7"
s.codePointAt(2).toString(16); // "61"
```

### 正确使用codePointAt

上述字符串'𠮷a'中，'a'的正确位置序号是1, 但是必须向`codePointAt`方法传入2; 解决这个问题的一个办法是使用`for...of`循环，它会正确识别32位的UTF-16字符。

```js
var s = '𠮷a';

for (let ch of s) {
    console.log(ch.codePointAt(0).toString(16));
}

// 20BB7
// 61
```

`codePointAt`方法是测试一个字符由2个字节还是4个字节组成的最简单方法：

```js
function is32Bit(c) {
    return c.codePointAt(0) > 0xFFFF;
}

is32Bit('𠮷'); // true
is32Bit('a'); // false
```

## String.fromCodePoint()

与`codePointAt`对应，ES6提供了`String.FromCodePoint`方法用于识别32位的UTF-16字符，弥补了`String.FromCharCode`方法的不足。

```js
String.fromCodePoint(0x20BB7); // '𠮷'

String.fromCodePoint(0x78, 0x1f680, 0x79) === 'x\uD83D\uDE80y'; // true
```

可知，`String.fromCodePoint`方法支持多个参数，它们会被合并为一个字符串返回。

## 字符串的遍历器接口

前面提到，`for...of`可以正确识别32位的UTF-16字符，而普通的`for (;;)`循环则无法正确识别大于`0xFFFFF`码点地字符。

## at()

ES5对字符串提供了`charAt`方法，返回字符串给定位置的字符，但该方法无法正确识别码点大于`0xFFFF`的字符。

```js
'abc'.charAt(0); // 'a'
'𠮷'.charAt(0); // '\uD842'
```

上述代码中，`charAt`方法返回地是UTF-16编码的第一个字节，实际上是无法显示字符的。

目前，有一个提案提出字符串实例`at`方法，可以识别Unicode编号大于0xFFFF的字符，返回正确的字符。

```js
'abc'.at(0); // 'a'
'𠮷'.at(0); // '𠮷'
```

这个方法可以通过[垫片库](github.com/es-shims/String.prototype.at)实现。

## normalize()

许多欧洲语言有语调符号和重音符号，为了表示它们，Unicode提供了两种方法，一种是直接提供带重音符号的字符，比如'Ǒ'(\u01D1); 另一种是提供**合成符号**（combining character），即原字符与重音符号合成为一个字符，比如'O'（\u004F）与'̌'（\u030C）合成'Ǒ'(\u004F\u030C)。

这两种表示方法在视觉和语义上都是等价的，但是JS却无法识别。

```js
'\u01D1' === '\u004F\u030C'; // false
'\u01D1'.length; // 1
'\u004F\u030C'.length; // 2
```

ES6为字符串提供了`normalize`方法，用来将字符的不同表示方法统一为同样的形式，这称为Unicode正规化。

```js
'\u01D1'.normalize() === '\u004F\u030C'.normalize(); // true
```

`normalize`方法接受一个参数用来指定normalize的方式：

- NFC: 默认参数，表示"标准等价合成"(Normalization Form Canonical Composition);
- NFD: 表示"标准等价分解"(Normalization Form Canonical Decomposition);
- NFKC: 表示"兼容等价合成"(Normalization Form Compatibility Composition);
- NFKD: 表示"兼容等价分解"(Normalization Form Compatibility Decomposition);

`normalize`方法目前不能识别3个或3个以上字符的合成，这种情况下，还是只能使用正则表达式，通过Unicode编号区间判断。

## include()、startsWith()、endsWith()

ES6增加3种方法用来确定一个字符串是否包含在另一个字符串中：

- include(): 返回布尔值，表示是否找到参数字符串；
- startsWith(): 返回布尔值，表示参数字符串是否在源字符串的头部；
- endsWith(): 返回布尔值，表示参数字符串是否在源字符串的尾部；

```js
var s = 'Hello world!';

s.startsWith('Hello'); // true
s.endsWith('!'); // true
s.include('o'); // true

// 三种方法都支持第二个参数，表示开始搜索的位置
s.startsWith('world', 6); // true
s.endsWith('Hello', 5); // true
s.include('Hello', 6); // false
```

当接受第二个参数`n`时，`endsWith`的行为与其他两个方法有所不同，它针对前n个字符，而其他两个方法针对从第n个位置到字符串结束位置之间的字符。

## repeat()

`repeat`方法返回一个新字符串，表示将原字符串重复n次。

```js
'x'.repeat(3); // 'xxx'
'hello'.repeat(2); // 'hellohello'
// 重复0次时，返回空字符串
'na'.repeat(0); // ''

// 参数如果是小数，会被取整。
'na'.repeat(2.9); // 'nana'

// 如果参数是负数或Infinity，抛出异常
'na'.repeat(Infinity); // RangeError
'na'.repeat(-1); // RangeError

// -1～0之间的参数，会被视为0
'na'.repeat(-0.9); // ''

// NaN 等同于0
'na'.repeat(NaN); // ''

// 参数是字符串，会先转换为数字
'na'.repeat('aaa'); // ''
'na'.repeat('3'); // 'nanana'
```

## padStart()、padEnd()

ES2017引入了字符串补全长度的功能。

```js
'x'.padStart(5, 'ab'); // 'ababx'
'x'.padStart(4, 'ab'); // 'abax'

'x'.padEnd(5, 'ab'); // 'xabab'
'x'.padEnd(4, 'ab'); // 'xaba'
```

`padStart`和`padEnd`分别接受两个参数，第一个参数用来指定字符串的最小长度，第二个参数则是用来补全的字符串。
如果原字符串的长度等于或大于指定的最小长度，则返回原字符串。

```js
'xxx'.padStart(2, 'ab'); // 'xxx'
'xxx'.padEnd(2, 'ab'); // 'xxx'
```

如果用来补全的字符串与字符串的长度之和超出了指定的最小长度，则会截去超出位数的补全字符串。

```js
'abc'.padStart(10, '0123456789');
// '0123456abc'
```

如果省略第二个参数，则会使用空格来补全。
`padStart`的常见用途是为数值补全指定位数，下面的代码将生成10位的数值字符串：

```js
'1'.padStart(10, '0'); // '0000000001'
'12'.padStart(10, '0'); // '0000000012'
'123456'.padStart(10, '0'); // '0000123456'
```

另一个用途是提示字符串格式：

```js
'12'.padStart(10, 'YYYY-MM-DD'); // 'YYYY-MM-12'

'09-12'.padStart(10, 'YYYY-MM-DD'); // 'YYYY-09-12'
```
