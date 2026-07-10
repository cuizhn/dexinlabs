---
fixture_id: 03-formula-discriminant
fixture_title: 求根公式与判别式（大量数学公式 Fixture）
fixture_category: math-formula
fixture_coverage: [frontmatter, heading, display-math-heavy, inline-math, table, multiline-formula, example]
source_lesson_slug: quadratic-equation-in-one-unknown-formula
---

# 求根公式与判别式

## 1. 求根公式的推导

对于一元二次方程 $ax^2 + bx + c = 0$ $(a \neq 0)$，我们通过**配方法**推导求根公式。

**推导过程**：

$$ax^2 + bx + c = 0$$

两边同除以 $a$：

$$x^2 + \frac{b}{a}x + \frac{c}{a} = 0$$

配方：

$$x^2 + \frac{b}{a}x + \left(\frac{b}{2a}\right)^2 = \left(\frac{b}{2a}\right)^2 - \frac{c}{a}$$

$$\left(x + \frac{b}{2a}\right)^2 = \frac{b^2 - 4ac}{4a^2}$$

当 $b^2 - 4ac \geq 0$ 时，两边开方：

$$x + \frac{b}{2a} = \pm \frac{\sqrt{b^2 - 4ac}}{2a}$$

**结论（求根公式）**：

$$x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$$

## 2. 求根公式（标准型）

$$
\boxed{x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a} \quad (a \neq 0, \; b^2 - 4ac \geq 0)}
$$

这个公式叫做**一元二次方程的求根公式**。

## 3. 判别式

令 $\Delta = b^2 - 4ac$，$\Delta$ 称为方程的**判别式**（读作 Delta）。

| 判别式 | 根的情况 | 根的个数 | 几何意义（$y=ax^2+bx+c$ 与 $x$ 轴交点）|
|--------|----------|----------|---------------------------------------|
| $\Delta > 0$ | 两个不相等的实数根 | 2 个 | 2 个交点 |
| $\Delta = 0$ | 两个相等的实数根（重根）| 1 个 | 1 个切点（相切）|
| $\Delta < 0$ | 无实数根 | 0 个 | 0 个交点 |

## 4. 根与系数的关系（韦达定理 · 扩展）

如果方程 $ax^2 + bx + c = 0$ 有两个实数根 $x_1, x_2$，那么：

$$x_1 + x_2 = -\frac{b}{a}, \qquad x_1 \cdot x_2 = \frac{c}{a}$$

## 5. 例题

### 例 1：不解方程，判断根的情况

(1) $x^2 - 5x + 6 = 0$

$$\Delta = (-5)^2 - 4 \times 1 \times 6 = 25 - 24 = 1 > 0$$

**有两个不相等的实数根**（$x_1=2, x_2=3$，韦达验证：$x_1+x_2=5=-b/a$ ✓，$x_1 x_2=6=c/a$ ✓）

(2) $x^2 - 4x + 4 = 0$

$$\Delta = (-4)^2 - 4 \times 1 \times 4 = 16 - 16 = 0$$

**有两个相等的实数根**（重根 $x_1 = x_2 = 2$）

(3) $x^2 + x + 1 = 0$

$$\Delta = 1^2 - 4 \times 1 \times 1 = 1 - 4 = -3 < 0$$

**无实数根**

### 例 2：用公式法解方程 $2x^2 - 5x - 3 = 0$

解：$a = 2, b = -5, c = -3$

$$\Delta = (-5)^2 - 4 \times 2 \times (-3) = 25 + 24 = 49 > 0$$

$$x = \frac{-(-5) \pm \sqrt{49}}{2 \times 2} = \frac{5 \pm 7}{4}$$

$$x_1 = \frac{5 + 7}{4} = 3, \quad x_2 = \frac{5 - 7}{4} = -\frac{1}{2}$$

## 6. 小结

- 求根公式：$x = \dfrac{-b \pm \sqrt{b^2 - 4ac}}{2a}$
- 判别式：$\Delta = b^2 - 4ac$
  - $\Delta > 0$：两不等实根
  - $\Delta = 0$：两相等实根
  - $\Delta < 0$：无实根
- 韦达定理：$x_1 + x_2 = -\dfrac{b}{a}$，$x_1 x_2 = \dfrac{c}{a}$
- 公式法适用于所有一元二次方程
