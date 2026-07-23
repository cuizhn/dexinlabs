

# 页面架构调整执行方案（V2）

## 执行原则

本次不是 UI 美化，也不是样式调整。

本次目标是：

> **将页面从"内容驱动"调整为"学习状态驱动"，为 Progress Engine、Diagnosis Engine 等未来模块预留扩展能力。**

本次只调整页面架构、数据流和组件组织。

不实现复杂业务逻辑。

不实现 AI。

不实现诊断算法。

所有复杂功能使用 Mock Data 或占位接口。

---

# 第一阶段：重构页面职责（必须完成）

重新定义四个页面。

```
Home

Knowledge Map

Topic

Lesson
```

除此之外，不新增新的学习页面。

所有学习流程围绕这四个页面展开。

---

# 第二阶段：首页（Home）

## 目标

首页不再作为课程展示页。

首页成为：

**学习入口。**

---

## 页面状态

拆分两种状态：

### 状态一

首次进入。

没有学习记录。

显示：

```
开始学习

↓

学习阶段选择

↓

3~5 个基础问题（占位）

↓

进入推荐 Topic
```

目前：

学习阶段、诊断问题可以使用 Mock Data。

不要实现真实诊断。

---

### 状态二

存在学习记录。

显示：

```
继续学习

↓

当前 Topic

↓

当前 Lesson

↓

继续学习按钮
```

当前学习状态可读取：

```
localStorage
```

即可。

不要依赖数据库。

---

## 数据接口

新建：

```
useLearningState()
```

当前返回：

```
hasProgress

currentTopic

currentLesson

recentLearning
```

内部全部 Mock。

以后由 Progress Engine 接管。

---

# 第三阶段：Knowledge Map

页面：

```
/map
```

作为唯一知识入口。

Header 导航统一修改为：

```
知识地图

↓

/map
```

---

## 页面布局

顶部：

Domain Filter。

例如：

```
全部

数与代数

图形与几何

统计与概率
```

主体：

直接展示：

Topic。

不要进入 Domain 页面。

---

## Topic Card

每个 Topic Card 显示：

```
标题

简介

学习状态

开始学习按钮
```

状态：

```
待学习

正在学习

已掌握
```

使用不同图标即可。

---

当前状态全部 Mock。

以后由 Progress Engine 提供。

---

# 第四阶段：Topic 页面

重新定位：

Topic 页面不是目录。

Topic 页面是：

学习控制中心。

---

## 页面布局

顶部：

Topic 信息。

学习目标。

学习意义。

---

中部：

Lesson 列表。

显示：

```
Lesson

状态

预计时间
```

---

底部：

根据学习状态切换：

待学习：

```
开始学习
```

学习中：

```
继续学习
```

完成：

```
练习

复习
```

当前全部使用 Mock。

---

# 第五阶段：Lesson 页面

Lesson 页面重点调整。

---

## 删除

删除：

顶部导航。

删除：

面包屑。

删除：

各种跳转入口。

保持沉浸。

---

## 页面布局

建议采用三栏布局。

```
左侧

中间

右侧
```

---

### 左侧

固定区域。

内容：

```
今天需要解决的问题

Concept Checklist

Lesson Progress
```

当前使用静态数据。

以后由 Lesson 数据生成。

---

### 中间

Markdown。

保持最大阅读区域。

不插入复杂组件。

---

### 右侧

预留：

Learning Assistant。

当前全部占位。

例如：

```
学习提示

相关知识

诊断提醒
```

以后接 Progress、Diagnosis。

---

右下角：

固定：

```
我的理解
```

目前：

textarea。

以后接数据库。

---

# 第六阶段：页面状态驱动

所有页面增加：

```
LearningState
```

例如：

```
enum

NOT_STARTED

IN_PROGRESS

MASTERED
```

页面根据状态切换显示。

不要：

```
if (lesson.completed)
```

到处写。

统一封装。

---

# 第七阶段：组件拆分

建议新增：

```
components/

learning/

    ContinueLearningCard.vue

    TopicStatusCard.vue

    TopicLessonList.vue

    LessonChecklist.vue

    LessonAssistant.vue

    MyUnderstanding.vue

    LearningStageDialog.vue
```

以后 Progress Engine 可以直接接入。

---

# 第八阶段：接口预留

不要直接读取数据库。

统一走：

```
Content Engine
```

学习状态统一走：

```
LearningState

(当前 Mock)
```

以后：

```
Progress Engine
```

直接替换即可。

---

# 第九阶段：本阶段不实现

以下全部不要开发：

❌ Diagnosis Engine

❌ Recommendation Engine

❌ Assessment Engine

❌ AI 助手

❌ Concept Graph

❌ 家长端

❌ 实时统计

这些只预留接口。

---

# 第十阶段：验收标准

本次页面改造完成后，应满足以下要求：

### Home

* 首页根据是否存在学习记录，自动进入"开始学习"或"继续学习"模式。
* 学习状态来源统一由 `useLearningState()` 提供，不直接读取业务数据。

### Knowledge Map

* `/map` 知识入口。
* 默认展示所有 Topic。
* Domain 作为过滤器，同时作为路由层级。

### Topic

* 页面根据学习状态自动切换为"待学习""学习中""已掌握"三种模式。
* Lesson 列表支持状态显示，但暂不接真实 Progress 数据。

### Lesson

* 去除面包屑与顶部学习导航。
* 三栏布局（左：学习目标；中：Markdown；右：学习辅助）完成。
* "我的理解"区域预留完成。
* 页面保持沉浸式阅读体验。

---

## 最重要的一条原则（必须遵守）

**不要为了当前功能写死页面。**

所有与学习状态相关的显示，都必须通过统一的 `LearningState` 抽象层驱动。当前可以使用 Mock 数据实现，但页面结构必须能够在未来无重构地接入 **Progress Engine、Diagnosis Engine、Recommendation Engine**。

**本次工作的目标不是完成学习系统，而是搭建学习系统能够持续演进的页面骨架。**
