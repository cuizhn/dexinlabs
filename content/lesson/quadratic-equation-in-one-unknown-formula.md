---
slug: quadratic-equation-in-one-unknown-formula
title: 求根公式与判别式
description: 学习一元二次方程的求根公式，理解判别式的意义和作用
order: 3
---

# 求根公式与判别式

## 1. 求根公式的推导

对于一元二次方程 $ax² + bx + c = 0$ $(a \neq 0)$，我们通过**配方法**推导求根公式。

**推导过程**：

$$ax² + bx + c = 0$$

两边同除以 $a$：

$$x² + \frac{b}{a}x + \frac{c}{a} = 0$$

配方：

$$x² + \frac{b}{a}x + \left(\frac{b}{2a}\right)² = \left(\frac{b}{2a}\right)² - \frac{c}{a}$$

$$\left(x + \frac{b}{2a}\right)² = \frac{b² - 4ac}{4a²}$$

当 $b² - 4ac \geq 0$ 时：

$$x + \frac{b}{2a} = \pm \frac{\sqrt{b² - 4ac}}{2a}$$

$$x = \frac{-b \pm \sqrt{b² - 4ac}}{2a}$$

## 2. 求根公式

$$x = \frac{-b \pm \sqrt{b² - 4ac}}{2a} \quad (a \neq 0, \; b² - 4ac \geq 0)$$

这个公式叫做**一元二次方程的求根公式**。

## 3. 判别式

令 $\Delta = b² - 4ac$，$\Delta$ 称为方程的**判别式**。

| 判别式 | 根的情况 | 根的个数 |
|--------|----------|----------|
| $\Delta > 0$ | 两个不相等的实数根 | 2 个 |
| $\Delta = 0$ | 两个相等的实数根 | 1 个（重根） |
| $\Delta < 0$ | 无实数根 | 0 个 |

## 4. 例题

**例 1**：不解方程，判断根的情况

(1) $x² - 5x + 6 = 0$

$$\Delta = (-5)² - 4 \times 1 \times 6 = 25 - 24 = 1 > 0$$

**有两个不相等的实数根**

(2) $x² - 4x + 4 = 0$

$$\Delta = (-4)² - 4 \times 1 \times 4 = 16 - 16 = 0$$

**有两个相等的实数根**

(3) $x² + x + 1 = 0$

$$\Delta = 1² - 4 \times 1 \times 1 = 1 - 4 = -3 < 0$$

**无实数根**

**例 2**：用公式法解方程 $2x² - 5x - 3 = 0$

解：$a = 2, b = -5, c = -3$

$$\Delta = (-5)² - 4 \times 2 \times (-3) = 25 + 24 = 49 > 0$$

$$x = \frac{-(-5) \pm \sqrt{49}}{2 \times 2} = \frac{5 \pm 7}{4}$$

$$x₁ = \frac{5 + 7}{4} = 3, \quad x₂ = \frac{5 - 7}{4} = -\frac{1}{2}$$

## 5. 小结

- 求根公式：$x = \frac{-b \pm \sqrt{b² - 4ac}}{2a}$
- 判别式：$\Delta = b² - 4ac$
- $\Delta > 0$：两不等实根；$\Delta = 0$：两相等实根；$\Delta < 0$：无实根
- 公式法适用于所有一元二次方程
