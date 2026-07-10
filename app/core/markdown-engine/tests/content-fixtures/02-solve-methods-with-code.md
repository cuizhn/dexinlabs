---
fixture_id: 02-solve-methods
fixture_title: 一元二次方程的解法（含代码块 Fixture）
fixture_category: math-chapter
fixture_coverage: [heading, display-math, inline-math, table, code-block-python, code-block-javascript, ordered-list]
source_lesson_slug: quadratic-equation-in-one-unknown-solve
---

# 一元二次方程的解法

一元二次方程有多种解法，掌握这些方法可以灵活应对不同类型的问题。

## 1. 直接开平方法

适用于形如 $x^2 = p$ 或 $(ax + b)^2 = p$ 的方程。

**例**：解方程 $x^2 = 9$

$$x = \pm \sqrt{9} = \pm 3$$

$$x_1 = 3, \quad x_2 = -3$$

## 2. 配方法

通过配方将方程化为完全平方形式，再用直接开平方法求解。

**步骤**：
1. 移项：将常数项移到右边
2. 配方：两边同时加上一次项系数一半的平方
3. 写成完全平方形式
4. 用直接开平方法求解

**例**：解方程 $x^2 + 6x - 7 = 0$

移项：

$$x^2 + 6x = 7$$

配方（加 9）：

$$x^2 + 6x + 9 = 7 + 9$$

$$(x + 3)^2 = 16$$

$$x + 3 = \pm 4$$

$$x = -3 \pm 4$$

$$x_1 = 1, \quad x_2 = -7$$

## 3. 公式法

对于任何一元二次方程 $ax^2 + bx + c = 0$ $(a \neq 0)$：

$$x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$$

## 4. 代码示例：用程序解方程

### Python 实现

```python
import math

def solve_quadratic(a: float, b: float, c: float) -> list[float] | str:
    """解一元二次方程 ax^2 + bx + c = 0"""
    if a == 0:
        return "不是一元二次方程（a 不能为 0）"

    delta = b ** 2 - 4 * a * c
    if delta > 0:
        x1 = (-b + math.sqrt(delta)) / (2 * a)
        x2 = (-b - math.sqrt(delta)) / (2 * a)
        return [round(x1, 4), round(x2, 4)]
    elif delta == 0:
        x = -b / (2 * a)
        return [round(x, 4)]
    else:
        return "无实数根"

# 例：2x^2 - 5x - 3 = 0
if __name__ == "__main__":
    print(solve_quadratic(2, -5, -3))  # 输出: [3.0, -0.5]
```

### JavaScript 实现

```typescript
type RealRoots = number[] | string;

export function solveQuadratic(a: number, b: number, c: number): RealRoots {
  if (a === 0) return "不是一元二次方程（a 不能为 0）";

  const delta = b * b - 4 * a * c;
  if (delta > 0) {
    const sqrt = Math.sqrt(delta);
    return [
      Number(((-b + sqrt) / (2 * a)).toFixed(4)),
      Number(((-b - sqrt) / (2 * a)).toFixed(4)),
    ];
  } else if (delta === 0) {
    return [Number((-b / (2 * a)).toFixed(4))];
  }
  return "无实数根";
}

// 例：x^2 + 6x - 7 = 0 → [1, -7]
console.log(solveQuadratic(1, 6, -7));
```

## 5. 解法选择建议

| 方程形式 | 推荐解法 |
|----------|----------|
| $x^2 = p$ | 直接开平方法 |
| 容易配方的 | 配方法 |
| 容易因式分解的 | 因式分解法 |
| 一般形式且不易分解 | 公式法 |

## 6. 小结

- **直接开平方法**：适用于 $x^2 = p$ 形式
- **配方法**：通用方法，推导求根公式的基础
- **公式法**：适用于所有一元二次方程
- **因式分解法**：最简便，但只适用于能分解的方程
