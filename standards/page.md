
我建议执行者采用一种**渐进式架构**。

---

# 给执行者的建议

## 一、本次目标

本次不要开发 Learning Engine。

不要开发 Progress Engine。

不要开发 Diagnosis Engine。

也不要开发通用 LearningLayout。

**本次目标只有一个：**

> **建立学习页面统一的设计语言（Design Language），而不是统一组件。**

也就是说：

先统一思想。

再统一代码。

---

# 二、建立两个 Layout，而不是一个

目前建议保留：

```text
layouts/

default.vue

learning.vue
```

职责明确：

**default.vue**

负责网站。

包含：

* 首页
* 关于
* 方法
* 登录
* 家长端
* 其它普通页面

继续使用 AppHeader。

---

**learning.vue**

负责学习。

所有学习页面：

```text
/map

/:domain

/:domain/:topic

/:domain/:topic/:lesson
```

统一进入：

learning.vue

---

## 三、Learning Header

不要继续使用 AppHeader。

但是：

**不要删除 AppHeader。**

重新建立：

```text
components/learning/

LearningHeader.vue
```

Learning Header 只负责学习。

保持极简。

建议结构：

```text
┌──────────────────────────────────────────────┐
│ ← 返回上一层        当前标题            ☰      │
└──────────────────────────────────────────────┘
```

整个 Header 永远只有三个区域：

左：

返回上一层

中：

当前对象标题

右：

菜单（可选）

不要放：

Logo。

导航菜单。

登录。

搜索。

等等。

---

## 四、返回逻辑

这里非常重要。

返回不是：

```text
history.back()
```

而是：

**返回学习层级。**

例如：

Lesson

↓

返回

↓

Topic

Topic

↓

返回

↓

Domain

Domain

↓

返回

↓

Knowledge Map

Knowledge Map

没有返回。

这是整个学习空间最高层。

因此：

Header 不应该依赖浏览器历史。

而应该依赖：

学习对象之间的父子关系。

---

## 五、菜单

菜单默认折叠。

本阶段不要做复杂功能。

不同层级显示不同内容即可。

例如：

Lesson：

显示：

* Lesson 列表

Topic：

显示：

* Lesson 列表
* Topic 信息

Domain：

显示：

* Topic 列表

Knowledge Map：

可以没有菜单。

---

## 六、不要现在统一 Sidebar

这是我调整最大的地方。

之前建议：

统一 Sidebar。

现在我建议：

**不要。**

原因：

目前：

我们还不知道：

Diagnosis。

Recommendation。

Progress。

最终长什么样。

如果现在统一：

以后一定拆。

所以：

目前建议：

```text
LessonSidebar.vue

TopicSidebar.vue

DomainSidebar.vue
```

允许：

三个组件不同。

但是：

位置保持一致。

以后：

等真正稳定。

再抽象。

不要提前抽象。

---

## 七、Bottom Panel

建议保留：

统一位置。

例如：

```text
<MyUnderstanding/>
```

但是：

目前：

仅保留位置。

甚至：

可以先显示：

```text
开发中
```

以后：

Progress。

AI。

Diagnosis。

都可能进入这里。

---

## 八、页面结构保持一致

建议所有学习页面都遵循统一结构。

例如：

```text
LearningHeader

↓

Main Area

↓

Bottom Area（可折叠）
```

Main Area 内部：

允许：

Lesson。

Topic。

Domain。

各自不同。

不要为了统一：

写：

```vue
<LearningContainer>
```

现在没必要。

---

## 九、不要设计 LearningContext

这是第二个我修改的地方。

之前建议：

统一：

LearningContext。

现在：

建议不要。

原因：

Context 到底应该包含：

Progress？

Diagnosis？

Recommendation？

Concept？

Assessment？

目前都没有最终确定。

如果现在设计：

以后一定重构。

建议：

页面先直接读取：

自己的数据。

例如：

Lesson：

读取：

Lesson。

Topic：

读取：

Topic。

以后：

Progress Engine 成熟以后。

再建立：

LearningContext。

---

## 十、当前真正应该统一的只有四件事情

整个学习系统。

目前：

真正应该统一的是：

### ① Header 风格

统一。

---

### ② 返回逻辑

统一。

返回：

父级。

不是：

上一页。

---

### ③ 页面布局比例

统一。

例如：

```text
Header

Main

Bottom
```

不要每页不同。

---

### ④ 页面设计语言

统一。

例如：

留白。

按钮。

颜色。

标题。

学习状态。

图标。

这些应该统一。

---

## 十一、以后什么时候开始抽象？

我的建议。

至少等：

下面三个模块开始稳定以后。

```text
Progress

Diagnosis

Recommendation
```

再开始：

统一：

```text
LearningContainer

LearningContext

Sidebar

Assistant
```

那个时候。

抽象几乎不会返工。

现在。

抽象风险太高。

---

# 我最终建议的实施路线

**第一阶段（现在）**

目标：

统一学习体验。

允许代码重复。

因为：

我们还在探索产品。

---

**第二阶段（课程逐渐完善）**

开始发现：

哪些区域：

真的一样。

哪些：

真的不一样。

---

**第三阶段（Progress、Diagnosis 基本稳定）**

开始抽象：

LearningContainer。

LearningContext。

LearningSidebar。

LearningAssistant。

---

## 给执行者的一句话

> **不要过早抽象，不要为了复用而复用。当前优先统一的是"学习体验"，而不是"代码结构"。先让 Learning Header、学习层级导航和页面设计语言稳定下来，等 Progress、Diagnosis、Recommendation 的数据模型成熟后，再统一 LearningContainer、LearningContext 和各类 Sidebar。这样既能避免过度设计，又能保证未来架构自然演进，而不是反复重构。**
