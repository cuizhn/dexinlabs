# 内容编写指南

> 如何使用 Markdown 编写课程内容，包括数学公式、代码块和特殊语法

## 目录

- [文件结构](#文件结构)
- [YAML Frontmatter](#yaml-frontmatter)
- [数学公式](#数学公式)
- [常用 Markdown 语法](#常用-markdown-语法)
- [内容组织建议](#内容组织建议)
- [示例模板](#示例模板)

---

## 文件结构

### 课程目录

每个课程在 `content/courses/` 下拥有一个独立目录：

```
content/courses/
├── algebra/
│   ├── _course.yml          # 课程元数据
│   ├── 01-introduction.md   # 第一章
│   └── 02-functions.md      # 第二章
└── geometry/
    ├── _course.yml
    └── 01-lines-and-angles.md
```

### 文件命名规范

| 文件类型 | 命名规则 | 示例 |
|---------|---------|------|
| 课程元数据 | `_course.yml` | 固定名称 |
| 章节内容 | `{序号}-{标识}.md` | `01-introduction.md` |

- 序号使用两位数字（01, 02, ..., 10, 11）
- 标识使用小写英文单词，用连字符连接
- 序号决定章节的显示顺序

---

## YAML Frontmatter

每个章节文件的开头必须包含 YAML frontmatter，用 `---` 包裹：

```yaml
---
title: 代数基础与方程
order: 1
course: algebra
chapterType: lesson
duration: 30
---
```

### 字段说明

| 字段 | 类型 | 必填 | 说明 | 示例 |
|------|------|------|------|------|
| `title` | `string` | 是 | 章节标题，会显示在页面标题和导航中 | `代数基础与方程` |
| `order` | `number` | 是 | 章节排序序号，应与文件名序号一致 | `1` |
| `course` | `string` | 是 | 所属课程 ID，与课程目录名一致 | `algebra` |
| `chapterType` | `string` | 否 | 章节类型：`lesson`（课程）或 `exercise`（练习） | `lesson` |
| `duration` | `number` | 否 | 预计学习时长（分钟） | `30` |

### 课程元数据 (_course.yml)

```yaml
id: algebra
title: 代数入门
description: 用字母表示数，掌握方程与不等式的解法
icon: x
difficulty: beginner
order: 1
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | `string` | 是 | 课程唯一标识，与目录名一致 |
| `title` | `string` | 是 | 课程标题 |
| `description` | `string` | 否 | 课程描述，显示在课程卡片上 |
| `icon` | `string` | 否 | 课程图标，建议使用数学符号 |
| `difficulty` | `string` | 是 | 难度等级：`beginner` / `intermediate` / `advanced` |
| `order` | `number` | 是 | 课程排序权重 |

---

## 数学公式

平台使用 KaTeX 引擎渲染数学公式，支持行内公式和块级公式。

### 行内公式

使用单个 `$` 包裹公式，公式会嵌入在文本行中：

```markdown
一元一次方程的标准形式为 $ax + b = 0$，其中 $a \neq 0$。
```

渲染效果：一元一次方程的标准形式为 ax + b = 0，其中 a ≠ 0。

### 块级公式

使用双 `$$` 包裹公式，公式会独占一行并居中显示：

```markdown
求根公式为：

$$
x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}
$$
```

### 常用公式语法

#### 分数

```markdown
$$
\frac{分子}{分母}
$$

# 示例
$$
\frac{12}{3} = 4
$$
```

#### 根号

```markdown
# 平方根
$$
\sqrt{x}
$$

# n 次方根
$$
\sqrt[n]{x}
$$

# 示例
$$
\sqrt{b^2 - 4ac}
$$
```

#### 上下标

```markdown
# 上标
$$
x^2
$$

# 下标
$$
x_1, x_2
$$

# 组合
$$
a_n = 2^n
$$
```

#### 求和与积分

```markdown
# 求和
$$
\sum_{i=1}^{n} i = \frac{n(n+1)}{2}
$$

# 积分
$$
\int_{a}^{b} f(x) \, dx
$$

# 极限
$$
\lim_{x \to 0} \frac{\sin x}{x} = 1
$$
```

#### 希腊字母

```markdown
$$
\alpha, \beta, \gamma, \delta, \epsilon, \theta, \lambda, \mu, \pi, \sigma, \phi, \omega
$$

# 大写
$$
\Delta, \Sigma, \Omega
$$
```

#### 关系运算符

```markdown
$$
= \neq \approx \equiv \leq \geq \lt \gt
$$

$$
\pm \times \div \cdot \circ
$$

$$
\in \notin \subset \supset \subseteq \supseteq
$$

$$
\cup \cap \setminus \emptyset
$$
```

#### 逻辑符号

```markdown
$$
\forall \exists \neg \land \lor \implies \iff
$$
```

#### 括号

```markdown
# 普通括号
$$
(a + b)
$$

# 自适应大小括号
$$
\left( \frac{a}{b} \right)
$$

# 方括号
$$
\left[ \frac{a}{b} \right]
$$

# 花括号（需要转义）
$$
\left\{ \frac{a}{b} \right\}
$$
```

#### 方程组

```markdown
$$
\begin{cases}
x + y = 5 \\
2x - y = 1
\end{cases}
$$
```

#### 矩阵

```markdown
$$
\begin{pmatrix}
a & b \\
c & d
\end{pmatrix}
$$

$$
\begin{bmatrix}
1 & 2 & 3 \\
4 & 5 & 6
\end{bmatrix}
$$
```

#### 多行公式对齐

```markdown
$$
\begin{aligned}
3x - 5 &= 7 \\
3x &= 7 + 5 \\
3x &= 12 \\
x &= 4
\end{aligned}
$$
```

### 注意事项

1. **公式中的空格**：KaTeX 默认忽略空格，需要空格时使用 `\,`（小空格）、`\;`（中空格）、`\quad`（大空格）
2. **特殊字符转义**：`$`、`{`、`}`、`\` 等字符在公式中需要转义
3. **公式内文本**：使用 `\text{}` 在公式中插入文本
   ```markdown
   $$
   x = 5 \quad \text{（舍去负值）}
   $$
   ```

---

## 常用 Markdown 语法

### 标题

```markdown
# 一级标题（章节标题，通常由 frontmatter 的 title 自动生成）
## 二级标题（主要知识点）
### 三级标题（子知识点）
#### 四级标题（细节说明）
```

### 文本格式

```markdown
**粗体文本**
*斜体文本*
~~删除线~~
`行内代码`
```

### 列表

#### 无序列表

```markdown
- 第一项
- 第二项
  - 子项 A
  - 子项 B
- 第三项
```

#### 有序列表

```markdown
1. 第一步
2. 第二步
3. 第三步
```

### 引用

```markdown
> 这是一个引用块
>
> 可以包含多行内容
```

### 代码块

```markdown
\`\`\`javascript
function solve(a, b, c) {
  const delta = b * b - 4 * a * c;
  return (-b + Math.sqrt(delta)) / (2 * a);
}
\`\`\`
```

### 表格

```markdown
| 难度等级 | 标识 | 颜色 | 说明 |
|---------|------|------|------|
| 入门 | beginner | 绿色 | 适合初学者 |
| 进阶 | intermediate | 黄色 | 需要一定基础 |
| 高级 | advanced | 红色 | 较高难度 |
```

### 链接

```markdown
[链接文字](/courses/algebra)
```

### 图片

```markdown
![图片描述](/images/diagram.png)
```

---

## 内容组织建议

### 章节结构模板

推荐的章节内容结构：

```markdown
---
title: 章节标题
order: 1
course: course-id
chapterType: lesson
duration: 30
---

# 章节标题

> 简短的章节导语（可选）

## 知识点一

概念解释...

### 定义

$$
公式
$$

### 例题

题目描述...

**解：**

解题过程...

## 知识点二

...

## 小结

- 要点 1
- 要点 2
- 要点 3
```

### 编写建议

1. **循序渐进**：从简单到复杂，每个知识点建立在前一个的基础上
2. **公式与文字结合**：不要只堆砌公式，用文字解释公式的含义
3. **例题驱动**：每个重要知识点配合 1-2 个例题
4. **小结归纳**：章节末尾用列表总结核心要点
5. **适度使用标题**：标题层级不要太深，一般到三级标题即可
6. **公式编号**：重要公式可以单独成行，方便引用

---

## 示例模板

### 完整章节示例

```markdown
---
title: 一元二次方程
order: 2
course: algebra
chapterType: lesson
duration: 45
---

# 一元二次方程

一元二次方程是代数学中的重要内容，广泛应用于物理、工程和经济学等领域。

## 标准形式

一元二次方程的标准形式为：

$$
ax^2 + bx + c = 0 \quad (a \neq 0)
$$

其中 $a$、$b$、$c$ 为常数，$x$ 为未知数。

## 判别式

判别式 $\Delta$ 决定了方程根的情况：

$$
\Delta = b^2 - 4ac
$$

| 判别式 | 根的情况 | 图像特征 |
|--------|---------|---------|
| $\Delta > 0$ | 两个不相等的实数根 | 抛物线与 x 轴有两个交点 |
| $\Delta = 0$ | 两个相等的实数根 | 抛物线与 x 轴有一个交点（相切） |
| $\Delta < 0$ | 没有实数根 | 抛物线与 x 轴没有交点 |

## 求根公式

当 $\Delta \geq 0$ 时，方程的根为：

$$
x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}
$$

### 例题

解方程 $x^2 - 5x + 6 = 0$。

**解：**

首先计算判别式：

$$
\Delta = (-5)^2 - 4 \times 1 \times 6 = 25 - 24 = 1 > 0
$$

因为 $\Delta > 0$，所以方程有两个不相等的实数根。

代入求根公式：

$$
x = \frac{5 \pm \sqrt{1}}{2} = \frac{5 \pm 1}{2}
$$

所以：

$$
x_1 = \frac{5 + 1}{2} = 3, \quad x_2 = \frac{5 - 1}{2} = 2
$$

## 韦达定理

如果 $x_1$ 和 $x_2$ 是方程 $ax^2 + bx + c = 0$ 的两个根，则：

$$
x_1 + x_2 = -\frac{b}{a}
$$

$$
x_1 \cdot x_2 = \frac{c}{a}
$$

## 小结

- 一元二次方程的标准形式：$ax^2 + bx + c = 0$
- 判别式 $\Delta = b^2 - 4ac$ 决定根的情况
- 求根公式：$x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$
- 韦达定理：根与系数的关系
