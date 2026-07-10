---
fixture_id: 04-exercise-placeholder
fixture_title: 一元二次方程练习题（Exercise Placeholder Fixture）
fixture_category: exercise
fixture_coverage: [frontmatter, heading, inline-math, display-math, exercise-placeholder-custom-block, numbered-list, answer-section]
source_lesson_slug: quadratic-equation-in-one-unknown-exercise
exercise_placeholder_spec_version: 1.0-draft
---

# 一元二次方程练习题

## 一、基础练习

### 1. 判断下列方程是否为一元二次方程

(1) $3x^2 - 2x + 1 = 0$

(2) $x^3 + x = 0$

(3) $\dfrac{1}{x^2} + x = 2$

(4) $2x^2 - 5 = 0$

### 2. 指出下列方程各项的系数

(1) $2x^2 + 3x - 7 = 0$

(2) $x^2 - 4x = 0$

(3) $5x^2 - 1 = 0$

---

::exercise{id="ex-001" type="choose-one" difficulty="easy" points="5" chapter="quadratic-equation-in-one-unknown" tags="[基础,判别式]"}
## Exercise 001 · 单项选择（Exercise Placeholder）

> 本块为 **Exercise Custom Block Placeholder（草案 V1.0）**。
> 未来 Content Engine + Vue Exercise 组件会识别 `::exercise` Block，
> 渲染为交互式答题卡。Markdown Engine 目前仅做「透传 AST → Custom Node」，
> 不做业务逻辑，由 Application 层（Vue `<ExerciseCard>`）负责渲染。

**题目**：方程 $x^2 - 6x + 9 = 0$ 的根的情况是？

- A. 两个不相等的实数根
- B. 两个相等的实数根
- C. 无实数根
- D. 有一个实数根和一个虚数根

**解析占位**：$\Delta = (-6)^2 - 4 \times 1 \times 9 = 0$，两相等实根（重根 $x=3$）。
**正确答案占位**：B
::

---

::exercise{id="ex-002" type="fill-blank" difficulty="medium" points="10" chapter="quadratic-equation-in-one-unknown" tags="[公式法,韦达定理]"}
## Exercise 002 · 填空题（Exercise Placeholder）

**题目**：已知方程 $2x^2 + 5x - 3 = 0$ 的两根为 $x_1, x_2$，则
$x_1 + x_2 = \underline{\hspace{3em}}$，$x_1 \cdot x_2 = \underline{\hspace{3em}}$。

**解析占位**：$x_1 + x_2 = -b/a = -5/2$；$x_1 x_2 = c/a = -3/2$。
**参考答案占位**：$-5/2$，$-3/2$
::

---

## 二、解方程

### 3. 用直接开平方法解方程

(1) $x^2 = 25$

(2) $(x - 2)^2 = 9$

### 4. 用配方法解方程

(1) $x^2 + 4x - 5 = 0$

(2) $2x^2 - 8x + 6 = 0$

---

::exercise{id="ex-003" type="solve-step" difficulty="hard" points="15" chapter="quadratic-equation-in-one-unknown" tags="[应用题,几何]"}
## Exercise 003 · 解答题（Exercise Placeholder）

**题目**：一个直角三角形的两条直角边相差 2 cm，斜边长为 10 cm，求两条直角边的长度。

**步骤占位（未来渲染为步骤批改）**：
1. 设未知数：设短直角边为 $x$ cm，则长直角边为 $(x + 2)$ cm
2. 列方程（勾股定理）：$x^2 + (x + 2)^2 = 10^2$
3. 整理方程：$2x^2 + 4x - 96 = 0$ → $x^2 + 2x - 48 = 0$
4. 解方程（因式分解）：$(x + 8)(x - 6) = 0$
5. 取正根：$x = 6$（舍去 $x = -8$）

**参考答案占位**：两条直角边分别为 **6 cm** 和 **8 cm**。
::

---

## 三、判别式练习

### 7. 不解方程，判断根的情况

(1) $x^2 - 6x + 9 = 0$

(2) $2x^2 + 3x + 5 = 0$

(3) $x^2 + x - 1 = 0$

## 四、应用题

### 10. 面积问题

用一根长 28 cm 的铁丝围成一个矩形，要使面积为 48 cm²，求矩形的长和宽。

---

## 参考答案（节选 · 供测试 excerpt / reading time 插件使用）

**第 1 题**：
- (1) 是
- (2) 否（三次方程）
- (3) 否（分式方程）
- (4) 是

**第 3 题**：
- (1) $x = \pm 5$
- (2) $x_1 = 5, x_2 = -1$

**Exercise 003**：两直角边 6 cm 和 8 cm（长 8 cm，宽 6 cm）
