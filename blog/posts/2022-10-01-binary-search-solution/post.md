---
title: 二分查找
category: Algorithm
tags:
  - c
author: wiskewu
created: 2022-10-01 16:51:00
updated: 2024-11-08 18:00:00
top: false
summary: 二分查找算法的C语言实现
---

## 题目

来自力扣地址: [704-二分查找](https://leetcode.cn/problems/binary-search/);

给定一个`n`个元素有序的（升序）整型数组`nums`和一个目标值`target`，写一个函数搜索`nums`中的`target`，如果目标值存在返回下标，否则返回 `-1`。

示例一：

```txt
输入: nums = [-1,0,3,5,9,12], target = 9
输出: 4
解释: 9 出现在 nums 中并且下标为 4
```

示例二:

```txt
输入: nums = [-1,0,3,5,9,12], target = 2
输出: -1
解释: 2 不存在 nums 中因此返回 -1
```

提示：

1. 你可以假设 nums 中的所有元素是不重复的
2. n 将在 [1, 10000]之间
3. nums 的每个元素都将在 [-9999, 9999]之间

## 解法

主要使用到了二分查找算法。

主要思想就是在随机位置(此处使用中间位置`mid`的值)取一个值，通过与目标值`target`进行比较，若大于目标值，则说明目标值可能在`mid`位置右侧；若小于目标值，则说明目标值可能在`mid`左侧；若与目标值相等，则返回`mid`。重复上述步骤至区间无效或找到结果，返回`-1`或结果值。

### 解法一

使用`while`循环：

```c
#include <stdio.h>

int search(int * nums, int num_size, int target) {
    int left = 0, right = num_size - 1;
    while (left <= right) {
        int mid = (left + right) / 2;
        if (nums[mid] == target) return mid;
        if (nums[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    return -1;
}

int main() {
    int nums[] = {1, 2, 5, 7, 9, 10, 12, 15};
    int size = 8;
    int index = search(nums, size, 12);
    printf("result: %d", index);
    return 0;
}
```

### 解法二

使用递归：

```c
#include <stdio.h>

int binary_search(int * nums, int target, int left, int right) {
    if (left > right) return -1;
    int mid = (left + right) / 2;
    if (nums[mid] == target) return mid;
    if (nums[mid] < target)
        return binary_search(nums, target, mid + 1, right);
    return binary_search(nums, target, left, mid - 1);
}

int search(int * nums, int num_size, int target) {
    return binary_search(nums, target, 0, num_size - 1);
}

int main() {
    int nums[] = {1, 2, 5, 7, 9, 10, 12, 15};
    int size = 8;
    int index = search(nums, size, 12);
    printf("result: %d", index);
    return 0;
}
```

### 其他

二分查找算法时间复杂度为$O(\log N)$
