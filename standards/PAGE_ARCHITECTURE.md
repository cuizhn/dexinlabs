# 得心实验室 · 页面架构设计（V2）

> 产品架构重构文档 · 2026-07-22
> 状态：已实施（2026-07-22 完成代码迁移）
> 变更：V2 基于第二轮评审意见迭代，删除 Chapter 页面但保留数据模型，首页进一步极简，新增首次访问与回访流程，学习进度独立为 Progress 模块

> **实施备注**：实际路由结构与设计略有调整，采用更扁平的嵌套结构：
> - `/[domain]` 替代 `/map/[domain]`（领域页直接挂在根级）
> - `/[domain]/[topic]` 替代 `/learn/[topic]`（主题嵌套在领域下）
> - `/[domain]/[topic]/[lesson]` 替代 `/learn/[topic]/[lesson]`（课时嵌套在主题下）
> - `/exercise?topic=xxx` 替代 `/exercise/[topic]`（练习使用查询参数，不绑定主题 URL）
> - API 统一使用复数形式：`/api/domains`、`/api/topics`、`/api/lessons`、`/api/exercises`

---

## 〇、V2 变更摘要

| 变更项 | V1 | V2 | 理由 |
|--------|----|----|------|
| 页面层级 | Domain → Topic → Chapter → Lesson（4 层） | Domain → Topic → Lesson（3 层页面，Chapter 保留为数据模型） | 删除 Chapter 页面减少跳转，Repository 层聚合隐藏 Chapter |
| 学习进度 | composable 直接读写 localStorage | 独立 Progress 模块（Service + Repository + Storage Adapter） | 依赖反转，MVP 用 LocalStorage，未来无缝切换云端 |
| 首页焦点 | 继续学习 + 推荐 + 统计 + 地图入口 | 只有「继续学习」 | 首页不是网站首页，是学习入口 |
| 首次访问 | 未设计 | 新增 First Run 流程 | MVP 关键路径 |
| 回访流程 | 未设计 | 新增 Returning Learner 流程 | 核心使用场景 |
| 内部概念 | 向学习者展示「知识领域」等术语 | 不暴露内部概念 | 技术模型与产品语言分离 |
| 学习目标 | 3-5 条列表 | 一句话 | 降低认知负担，快速开始 |
| Lesson 返回 | 返回与上下课权重相当 | 「下一课」视觉权重高于「返回」 | 鼓励保持学习节奏 |

---

## 一、信息架构（Information Architecture）

### 1.1 核心原则

1. **学习优先**：所有页面围绕「开始学习 → 持续学习 → 完成学习」设计
2. **渐进展示**：不一次展示全部知识，逐层展开（Progressive Disclosure）
3. **极简专注**：学习过程中移除一切干扰元素
4. **下一步明确**：始终突出「现在该做什么」
5. **本地优先**：MVP 阶段学习记录存储在浏览器本地
6. **减少决策**：持续减少页面层级、点击次数和选择次数

### 1.2 知识组织方式

采用长期稳定的数学知识体系组织，而非教材/年级结构：

```
数学
├── 数与代数
│   ├── 有理数
│   ├── 实数
│   ├── 一元二次方程
│   └── 函数
├── 图形与几何
│   ├── 三角形
│   ├── 四边形
│   └── 圆
├── 统计与概率
│   ├── 数据分析
│   └── 概率初步
└── 综合与实践
    ├── 数学建模
    └── 探究活动
```

### 1.3 内容层级映射

| 内部层级 | 技术实体 | 说明 | 是否独立页面 |
|---------|---------|------|------------|
| L1 领域 | Domain（分组字段） | 数与代数、图形与几何 等 | 是（/map） |
| L2 主题 | Topic（= 现有 Course） | 一元二次方程、函数 等 | 是（/[domain]/[topic]） |
| L2.5 分组 | Chapter（数据模型保留） | 内容分组，如「概念」「求解方法」「应用」 | **否**（对页面隐藏） |
| L3 课时 | Lesson | 单次学习最小单位 | 是（/[domain]/[topic]/[lesson]） |

> **V2 关键决策**：删除 Chapter 页面，但保留 Chapter 数据模型。Chapter 继续承担内容分组职责，在 Repository 层聚合后对页面隐藏。详见 [附录 A：Topic 与 Chapter 合并分析](#附录-atopic-与-chapter-合并分析)。

### 1.4 概念分离原则

技术模型与产品语言严格分离：

| 内部技术概念 | 学习者看到的 | 说明 |
|------------|-----------|------|
| Domain | 领域名称（如「数与代数」） | 不出现「知识领域」标签 |
| Topic | 主题名称（如「一元二次方程」） | 不出现「知识专题」标签 |
| Lesson | 课时标题 | 不出现「课时」前缀 |
| Learning Hub | 直接展示主题名 | 不出现「学习单元」「Learning Hub」 |

---

## 二、页面树（Page Tree）

### 2.1 MVP 页面清单

```
/                          # 学习首页（Learning Home）
/map                       # 知识地图（领域列表）
/[domain]                  # 领域页（主题列表）
/[domain]/[topic]          # 学习主题页（Learning Hub）
/[domain]/[topic]/[lesson] # 课时学习页（Immersive Lesson）
/exercise?topic=xxx        # 练习页
```

> 共 6 个页面，比 V1（8 个）减少 2 个。移除了独立的 Topic 列表页和 Chapter 页。

### 2.2 页面层级关系

```
学习首页 (/)
  ├── 继续学习 → 直接进入上次学习的课时
  └── 探索知识 → /map

知识地图 (/map)
  └── 领域 (/[domain])
        └── 主题 (/[domain]/[topic])  ← Learning Hub
              ├── 开始学习 → 进入第一个课时
              └── 练习 → /exercise?topic=[topic]

课时学习页 (/[domain]/[topic]/[lesson])
  ├── 上一课 / 下一课
  └── 返回主题
```

### 2.3 现有页面迁移映射

| 现有页面 | 新页面 | 路由变化 | 说明 |
|---------|--------|---------|------|
| `pages/index.vue` | 学习首页 | 路径不变 | 完全重新设计 |
| `pages/course/index.vue` | 知识地图 | `/course` → `/map` | 重新定位 |
| `pages/course/[chapter]/index.vue` | 领域页 + 主题页 | `/course/[ch]` → `/[domain]` + `/[domain]/[topic]` | 拆分为两层 |
| `pages/course/[chapter]/[lesson].vue` | 课时学习页 | `/course/[ch]/[lesson]` → `/[domain]/[topic]/[lesson]` | 沉浸式重构 |
| `pages/exercise/[chapter].vue` | 练习页 | `/exercise/[chapter]` → `/exercise?topic=xxx` | 查询参数解耦 |
| `pages/study.vue` | 移除 | —— | 内容不再需要 |
| `pages/methods.vue` | 移除 | —— | 内容不再需要 |
| `pages/about.vue` | 保留（页脚链接） | —— | 次要页面 |

---

## 三、页面职责说明（Page Responsibility）

### 3.1 学习首页（Learning Home）

**路由**：`/`

**核心问题**：今天，继续学习吗？

**设计理念**：首页不是网站首页，是学习入口。更像 Kindle 的「继续阅读」，而不是课程平台首页。

**页面内容**：

| 区块 | 内容 | 视觉权重 | 说明 |
|------|------|---------|------|
| 继续学习 | 上次学习的课时 + 「继续学习」按钮 | **唯一焦点** | 占据首屏大部分空间 |
| 探索知识 | 小型入口 | 弱化 | 一行文字链接 |

> V2 移除了：推荐学习、学习统计、知识地图卡片。统计属于奖励反馈，不应成为首页主要内容。

**两种状态**：

| 状态 | 触发条件 | 首页内容 |
|------|---------|---------|
| 首次访问 | localStorage 无学习记录 | 见 [首次访问流程](#四首次访问体验first-run-experience) |
| 回访学习 | localStorage 有学习记录 | 「继续学习」卡片 + 「探索知识」入口 |

**设计原则**：
- 首屏只有一个视觉焦点：Continue Learning
- 不展示课程列表、分类、统计
- 不承担知识导航职责
- 学习者进入后 1 秒内决定：继续学习

---

### 3.2 知识地图（/map）

**路由**：`/map`

**核心目标**：浏览数学知识体系

**页面内容**：

| 区块 | 内容 | 说明 |
|------|------|------|
| 标题 | 「数学」 | 直接显示内容名称，不显示「知识地图」标签 |
| 领域卡片 | 数与代数、图形与几何、统计与概率、综合与实践 | 每个含图标和简介 |

**设计原则**：
- 只展示 L1 层级
- 每个领域卡片视觉重量相当
- 不展开具体主题

---

### 3.3 领域页（/[domain]）

**路由**：`/[domain]`

**核心目标**：展示某个领域下的所有学习主题

**页面内容**：

| 区块 | 内容 | 说明 |
|------|------|------|
| 返回 | ← 返回 | 返回知识地图 |
| 标题 | 「数与代数」 | 直接显示领域名 |
| 主题列表 | 主题卡片：标题 + 一句话描述 + 学习状态 | L2 层级 |
| 开始按钮 | 「开始学习」或「继续学习」 | 主要行动 |

**设计原则**：
- 只展示 L2 层级（学习主题）
- 每个主题标注状态：未开始 · 学习中 · 已完成
- 线性列表，体现学习顺序
- 突出「下一步」

---

### 3.4 学习主题页（Learning Hub）（/[domain]/[topic]）

**路由**：`/[domain]/[topic]`

**核心目标**：学习准备 — 帮助学习者快速进入学习状态

> V2 合并了 V1 的「知识专题页」和「学习单元页」。一个主题直接就是一个 Learning Hub。

**页面内容**：

| 区块 | 内容 | 视觉权重 | 说明 |
|------|------|---------|------|
| 返回 | ← 返回 | 弱化 | 返回领域页 |
| 标题 | 主题名称 | 中 | 如「一元二次方程」 |
| 学习目标 | 一句话 | 中 | 如「学完这一主题，你将能够求解任何一元二次方程。」 |
| 开始按钮 | 「开始学习」或「继续学习」 | **高** | 主要行动按钮 |
| 课时列表 | 序号 + 标题 + 状态 | 中 | 线性列表 |
| 练习入口 | 练习卡片 | 低 | 完成学习后更有意义 |

> V2 变更：学习目标从 3-5 条列表简化为一句话。目标越简单，学习者越容易开始。

**设计原则**：
- 从「目录页」转变为「学习启动页」
- 重点是帮助学习者进入学习状态，不是展示信息
- 一句话目标 + 开始按钮 = 首屏全部内容
- 课时列表在首屏下方，不是视觉焦点

---

### 3.5 课时学习页（Immersive Lesson）（/[domain]/[topic]/[lesson]）

**路由**：`/[domain]/[topic]/[lesson]`

**核心目标**：沉浸式学习，零干扰

**页面内容**：

| 区块 | 内容 | 位置 | 视觉权重 | 说明 |
|------|------|------|---------|------|
| 返回 | ← | 顶部左侧 | **极低** | 可保留但视觉权重最低 |
| 课时标题 | 标题文字 | 顶部居中 | 中 | |
| 进度 | X / N | 顶部右侧 | 低 | 轻量提示 |
| 正文 | Markdown 渲染 | 主体 | **唯一焦点** | |
| 上一课 | ← 上一课 | 底部左侧 | 中 | |
| 下一课 | 下一课 → | 底部右侧 | **高** | 鼓励继续学习 |

> V2 变更：「下一课」视觉权重明显高于「返回」。继续学习的优先级高于离开。

**移除的元素**：
- ❌ 面包屑导航
- ❌ 侧边栏目录
- ❌ 推荐阅读
- ❌ 相关文章
- ❌ 分类标签
- ❌ 任何会打断学习的组件

**设计原则**：
- 正文永远是唯一视觉中心
- 充足的行高和边距，最大宽度 760px
- 「下一课」比「返回」更突出，持续鼓励学习节奏
- 顶部返回按钮极弱化，不干扰阅读

---

### 3.6 练习页（/exercise?topic=xxx）

**路由**：`/exercise?topic=xxx`

**核心目标**：巩固所学，训练思维

**页面内容**：

| 区块 | 内容 | 说明 |
|------|------|------|
| 返回 | ← 返回 | 返回学习主题 |
| 标题 | 主题名 + 「练习」 | |
| 题目 | 题目描述 + 交互区域 | 核心内容 |
| 提示 | 渐进式：小提示 → 思路 → 完整解答 | |
| 导航 | 上一题 / 下一题 | |

**设计原则**：
- 与课时页保持一致的极简风格
- 一题一页
- 提示分层，重视解题过程

---

## 四、首次访问体验（First Run Experience）

### 4.1 场景描述

学习者第一次来到得心实验室，localStorage 中没有任何学习记录。

### 4.2 首页状态

首次访问时，首页不显示「继续学习」（因为没有学习记录），而是显示：

```
┌─────────────────────────────────────────┐
│                                         │
│                                         │
│           得心实验室                     │
│       理解为先，应用为本                 │
│                                         │
│    ┌─────────────────────────────────┐   │
│    │                                  │   │
│    │  开始你的学习之旅                 │   │
│    │                                  │   │
│    │  从「一元二次方程」开始            │   │
│    │  这是初中数学的核心主题之一         │   │
│    │                                  │   │
│    │       [ 开始学习 → ]              │   │
│    │                                  │   │
│    └─────────────────────────────────┘   │
│                                         │
│         或者，先探索知识体系 →            │
│                                         │
│                                         │
└─────────────────────────────────────────┘
```

### 4.3 首次访问流程

```
首次访问 (/)
    │
    ├── 点击「开始学习」→ 直接进入推荐的第一个主题 (/[domain]/[topic])
    │       │
    │       └── Learning Hub 展示一句话目标 + 课时列表
    │               │
    │               └── 点击「开始学习」→ 进入第一个课时
    │
    └── 点击「探索知识体系」→ 进入知识地图 (/map)
            │
            └── 逐级浏览 → 选择主题 → 进入学习
```

### 4.4 首次访问设计原则

- **不设置障碍**：不需要注册、不需要选年级、不需要能力测试
- **立即开始**：提供推荐入口，一键进入学习
- **探索可选**：想先了解全局的学习者可以进入知识地图
- **推荐固定**：MVP 阶段推荐第一个主题，后续可增加智能推荐

### 4.5 状态切换

| 条件 | 首页状态 |
|------|---------|
| localStorage 无 `learning_progress` 键 | First Run 模式 |
| localStorage 有学习记录 | 回访模式（显示「继续学习」） |

---

## 五、回访学习流程（Returning Learner Flow）

### 5.1 场景描述

学习者之前已经学习过，localStorage 中有学习记录，再次打开网站。

### 5.2 完整流程

```
打开网站 (/)
    │
    ▼
学习首页：显示「继续学习」卡片
    │
    │  读取 localStorage 中的 last_lesson
    │  显示：上次学习的主题名 + 课时标题 + 进度
    │
    ├── 点击「继续学习」→ 直接进入上次学习的课时
    │       │           (/[domain]/[topic]/[lesson])
    │       │
    │       ▼
    │    沉浸式学习
    │       │
    │       ├── 下一课 → 继续学习
    │       └── 返回 → 回到 Learning Hub
    │
    └── 点击「探索知识」→ /map
            │
            ▼
         知识地图 → 领域 → 主题 → 开始学习
```

### 5.3 Progress 模块设计

学习进度作为独立模块，与 Content 模块解耦。MVP 使用 LocalStorage，未来可无缝切换到云端存储。

**模块结构**：

```
app/progress/
├── models/
│   └── index.ts           # Progress 数据模型
├── storage/
│   ├── LocalStorageAdapter.ts  # MVP 存储实现
│   └── types.ts           # Storage 接口定义
├── ProgressService.ts     # 业务逻辑
├── index.ts               # 模块导出
└── types.ts               # 对外类型
```

**Storage 接口（依赖反转）**：

```typescript
// app/progress/storage/types.ts
export interface ProgressStorage {
  get(): LearningProgress | null
  save(progress: LearningProgress): void
  clear(): void
}
```

**MVP 实现（LocalStorage）**：

```typescript
// app/progress/storage/LocalStorageAdapter.ts
export class LocalStorageAdapter implements ProgressStorage {
  private readonly key = 'dexinlabs_progress'

  get(): LearningProgress | null {
    if (typeof localStorage === 'undefined') return null
    const raw = localStorage.getItem(this.key)
    return raw ? JSON.parse(raw) : null
  }

  save(progress: LearningProgress): void {
    if (typeof localStorage === 'undefined') return
    localStorage.setItem(this.key, JSON.stringify(progress))
  }

  clear(): void {
    if (typeof localStorage === 'undefined') return
    localStorage.removeItem(this.key)
  }
}
```

**数据模型**：

```typescript
// app/progress/models/index.ts
export interface LearningProgress {
  /** 上次学习的课时（用于「继续学习」） */
  lastLesson: {
    topicSlug: string
    topicTitle: string
    lessonSlug: string
    lessonTitle: string
    lessonIndex: number
    totalLessons: number
  } | null

  /** 已完成的课时 slug 列表 */
  completedLessons: string[]

  /** 连续学习天数 */
  streak: {
    days: number
    lastStudyDate: string  // YYYY-MM-DD
  }

  /** 首次访问时间 */
  firstVisitAt: string  // ISO date
}
```

**Service 层**：

```typescript
// app/progress/ProgressService.ts
export class ProgressService {
  constructor(private storage: ProgressStorage) {}

  /** 是否首次访问 */
  isFirstVisit(): boolean {
    return this.storage.get() === null
  }

  /** 获取继续学习信息 */
  getLastLesson() {
    return this.storage.get()?.lastLesson ?? null
  }

  /** 记录进入课时 */
  recordLessonVisit(lesson: LastLesson): void {
    const progress = this.getOrCreate()
    progress.lastLesson = lesson
    this.updateStreak(progress)
    this.storage.save(progress)
  }

  /** 标记课时完成 */
  completeLesson(lessonSlug: string): void {
    const progress = this.getOrCreate()
    if (!progress.completedLessons.includes(lessonSlug)) {
      progress.completedLessons.push(lessonSlug)
      this.storage.save(progress)
    }
  }

  /** 课时是否已完成 */
  isLessonCompleted(lessonSlug: string): boolean {
    return this.storage.get()?.completedLessons.includes(lessonSlug) ?? false
  }

  /** 获取连续学习天数 */
  getStreakDays(): number {
    return this.storage.get()?.streak.days ?? 0
  }

  private getOrCreate(): LearningProgress {
    return this.storage.get() ?? {
      lastLesson: null,
      completedLessons: [],
      streak: { days: 0, lastStudyDate: '' },
      firstVisitAt: new Date().toISOString()
    }
  }

  private updateStreak(progress: LearningProgress): void {
    const today = new Date().toISOString().slice(0, 10)
    const lastDate = progress.streak.lastStudyDate
    if (lastDate === today) return
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
    progress.streak.days = lastDate === yesterday ? progress.streak.days + 1 : 1
    progress.streak.lastStudyDate = today
  }
}
```

**未来切换云端存储**：

只需实现新的 `ProgressStorage` 接口（如 `CloudStorageAdapter`），注入到 `ProgressService` 即可，业务层代码不变。

### 5.4 Composable 暴露

```typescript
// app/composables/useProgress.ts
export function useProgress() {
  const service = new ProgressService(new LocalStorageAdapter())
  return {
    isFirstVisit: () => service.isFirstVisit(),
    lastLesson: service.getLastLesson(),
    recordLessonVisit: (lesson) => service.recordLessonVisit(lesson),
    completeLesson: (slug) => service.completeLesson(slug),
    isLessonCompleted: (slug) => service.isLessonCompleted(slug),
    streakDays: service.getStreakDays()
  }
}
```

### 5.5 学习记录更新时机

| 事件 | 更新内容 |
|------|---------|
| 进入课时 | 更新 `lastLesson` + `streak` |
| 课时滚动到底部 | 标记课时为已完成，加入 `completedLessons` |
| 首次访问网站 | 写入 `firstVisitAt` |

---

## 六、页面跳转关系（Navigation Flow）

### 6.1 首次访问流程

```
首次访问
    │
    ├──[开始学习]──→ /[domain]/[topic] ──→ /[domain]/[topic]/[lesson]
    │                                              │
    │                                       [下一课] [返回]
    │
    └──[探索知识]──→ /map ──→ /[domain] ──→ /[domain]/[topic]
                                                    │
                                              [开始学习]
                                                    │
                                                    ▼
                                          /[domain]/[topic]/[lesson]
```

### 6.2 回访学习流程

```
回访学习
    │
    ├──[继续学习]──→ /[domain]/[topic]/[lesson]  (直接进入上次课时)
    │                       │
    │                [下一课] [返回]
    │                       │
    │                  [返回] → /[domain]/[topic]
    │
    └──[探索知识]──→ /map → /[domain] → /[domain]/[topic]
                                                │
                                          [开始学习]
                                                │
                                                ▼
                                      /[domain]/[topic]/[lesson]
```

### 6.3 导航规则

| 规则 | 说明 |
|------|------|
| **首页即入口** | 所有流量默认进入学习首页 |
| **学习直线化** | 课时之间通过「上一课/下一课」线性流动 |
| **下一课优先** | 「下一课」视觉权重高于「返回」 |
| **逐级返回** | 从深层页面返回时，逐级返回上一层 |
| **不跨层跳转** | 课时页不直接跳到知识地图，需逐级返回 |

### 6.4 全局导航

MVP 阶段不设复杂导航栏：

- **左上角 Logo**：点击返回学习首页
- **页脚**：关于、隐私政策等次要链接

---

## 七、低保真线框图（Wireframe）

### 7.1 学习首页 — 首次访问（/）

```
┌─────────────────────────────────────────┐
│                                         │
│                                         │
│                                         │
│           得心实验室                     │
│        理解为先，应用为本                 │
│                                         │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │                                    │  │
│  │  开始你的学习之旅                   │  │
│  │                                    │  │
│  │  从「一元二次方程」开始              │  │
│  │                                    │  │
│  │         [ 开始学习 → ]              │  │
│  │                                    │  │
│  └───────────────────────────────────┘  │
│                                         │
│         探索知识体系 →                   │
│                                         │
│                                         │
│                                         │
└─────────────────────────────────────────┘
```

---

### 7.2 学习首页 — 回访（/）

```
┌─────────────────────────────────────────┐
│  ⊙  Dexin Labs                          │
│                                         │
│                                         │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │                                    │  │
│  │  继续学习                          │  │
│  │                                    │  │
│  │  一元二次方程                       │  │
│  │  第 3 课 · 用配方法解一元二次方程    │  │
│  │                                    │  │
│  │         [ 继续学习 → ]              │  │
│  │                                    │  │
│  └───────────────────────────────────┘  │
│                                         │
│                                         │
│  探索知识 →                              │
│                                         │
│                                         │
└─────────────────────────────────────────┘
```

> 首页只有「继续学习」一个焦点。「探索知识」仅为一行文字链接。

---

### 7.3 知识地图（/map）

```
┌─────────────────────────────────────────┐
│ ←  Dexin Labs                           │
│                                         │
│          数学                            │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │  🔢  数与代数                      │  │
│  │  有理数、实数、方程、函数...        │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │  📐  图形与几何                     │  │
│  │  三角形、四边形、圆...              │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │  📊  统计与概率                     │  │
│  │  数据分析、概率初步...              │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │  🔬  综合与实践                     │  │
│  │  数学建模、探究活动...              │  │
│  └───────────────────────────────────┘  │
│                                         │
└─────────────────────────────────────────┘
```

---

### 7.4 领域页（/[domain]）

```
┌─────────────────────────────────────────┐
│ ←  数学                                 │
│                                         │
│  数与代数                                │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │  01  有理数                        │  │
│  │      从整数到有理数的扩展            │  │
│  │      ✅ 已完成                      │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │  02  实数                          │  │
│  │      从有理数到实数的扩展            │  │
│  │      ✅ 已完成                      │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │  03  一元二次方程                   │  │
│  │      从概念到应用，系统掌握          │  │
│  │      📖 学习中  2/5                 │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │  04  函数                          │  │
│  │      理解变量之间的关系              │  │
│  │      ⏳ 未开始                      │  │
│  └───────────────────────────────────┘  │
│                                         │
└─────────────────────────────────────────┘
```

---

### 7.5 学习主题页（Learning Hub）（/[domain]/[topic]）

```
┌─────────────────────────────────────────┐
│ ←                                       │
│                                         │
│  一元二次方程                             │
│                                         │
│  学完这一主题，你将能够                   │
│  求解任何一元二次方程。                   │
│                                         │
│  [ 继续学习第 3 课 → ]                   │
│                                         │
│  ─────────────────────────────────────  │
│                                         │
│  01  一元二次方程的概念 ........... ✅    │
│  02  直接开平方法 .................. ✅   │
│  03  配方法 ........................ 📖   │
│  04  求根公式与判别式 .............. ⏳   │
│  05  因式分解法 .................... ⏳   │
│                                         │
│  ─────────────────────────────────────  │
│                                         │
│  ✦ 练习                        [ 开始 ] │
│                                         │
└─────────────────────────────────────────┘
```

> 一句话目标 + 开始按钮 = 首屏。课时列表在下方，不是视觉焦点。

---

### 7.6 课时学习页（Lesson）（/[domain]/[topic]/[lesson]）

```
┌─────────────────────────────────────────┐
│ ←          配方法               3 / 5   │
│                                         │
│                                         │
│         用配方法解一元二次方程            │
│                                         │
│  配方法是一种通过将方程转化为完全平方      │
│  形式来求解一元二次方程的方法。            │
│                                         │
│  ## 基本思想                             │
│                                         │
│  对于方程 x² + bx + c = 0，我们可以       │
│  通过配方将其转化为：                    │
│                                         │
│  (x + b/2)² = (b/2)² - c                │
│                                         │
│  ## 一般步骤                             │
│                                         │
│  1. 把二次项系数化为 1                    │
│  2. 移项，使方程左边为二次项和一次项        │
│  3. 两边同时加上一次项系数一半的平方        │
│  4. 左边化为完全平方，右边合并同类项        │
│  5. 直接开平方求解                        │
│                                         │
│  ## 例题                                 │
│  ...                                    │
│                                         │
│                                         │
│  ← 上一课           [ 下一课 → ]         │
│                                         │
└─────────────────────────────────────────┘
```

> 「下一课」视觉权重高于「上一课」和「返回」。正文是唯一焦点。

---

### 7.7 练习页（/exercise?topic=xxx）

```
┌─────────────────────────────────────────┐
│ ←                                       │
│                                         │
│  一元二次方程 · 练习                      │
│  第 1 题 / 共 8 题                       │
│                                         │
│  ─────────────────────────────────────  │
│                                         │
│  用配方法解方程：                        │
│                                         │
│  x² + 6x + 5 = 0                        │
│                                         │
│  [ 输入答案的交互区域 ]                  │
│                                         │
│  [ 提交答案 ]                            │
│                                         │
│  需要帮助？                              │
│  [ 💡 提示 ]  [ 📖 思路 ]  [ ✅ 答案 ]   │
│                                         │
│                                         │
│  ← 上一题           [ 下一题 → ]         │
│                                         │
└─────────────────────────────────────────┘
```

---

## 八、与现有项目的迁移方案（Migration Plan）

### 8.1 迁移步骤

#### 阶段一：架构准备

1. **调整路由结构**（已完成 2026-07-22）
   - 新建 `pages/index.vue`（学习首页，含首次/回访两种状态）
   - 新建 `pages/map/index.vue`（知识地图）
   - 新建 `pages/[domain]/index.vue`（领域页）
   - 新建 `pages/[domain]/[topic]/index.vue`（学习主题页 / Learning Hub）
   - 新建 `pages/[domain]/[topic]/[lesson].vue`（课时学习页）
   - 新建 `pages/exercise/index.vue`（练习页，使用 ?topic=xxx 查询参数）

2. **新建 Progress 模块**
   - 创建 `app/progress/` 目录（独立模块，与 Content 解耦）
   - 实现 `ProgressStorage` 接口 + `LocalStorageAdapter`
   - 实现 `ProgressService` 业务逻辑
   - 创建 `app/composables/useProgress.ts` 对外暴露

3. **数据模型适配**
   - 现有 `Course` 实体对应新的「学习主题（Topic）」
   - 增加 `domain` 字段用于领域分类
   - **保持现有 Course → Chapter → Lesson 数据关系不变**
   - Repository 层负责聚合：查询 Topic 时关联 Chapters → Lessons，展平后返回给页面
   - 页面层不感知 Chapter

#### 阶段二：核心页面实现

1. **学习首页**（含首次访问和回访两种状态）
2. **知识地图 + 领域页**
3. **学习主题页（Learning Hub）**
4. **课时学习页（沉浸式重构）**
5. **练习页适配**

#### 阶段三：体验完善

1. **学习记录自动追踪**
2. **旧页面清理与重定向**
3. **TypeScript 编译 & Nuxt build 验证**

### 8.2 数据模型变更

**核心原则**：保持现有数据关系不变，通过业务层适配新架构。

**现有模型 → 新架构映射**：

| 现有概念 | 新架构概念 | 数据库变化 |
|---------|-----------|-----------|
| Course | Topic（学习主题） | 增加 `domain` 字段 |
| Chapter | Chapter（保留，内容分组） | 不变，不独立页面 |
| Lesson | Lesson | 不变 |

**唯一数据库变更（courses 表）**：

```sql
ALTER TABLE courses ADD COLUMN domain VARCHAR(50);
-- domain: 'algebra' | 'geometry' | 'statistics' | 'integration'
```

**数据关系保持不变**：

```
Course → Chapter → Lesson（现有关系，不改动）
```

**Repository 层聚合**：

```typescript
// Repository 查询 Topic 时，通过关联查询聚合所有 Chapter 下的 Lessons
async getTopicWithLessons(slug: string) {
  return this.db.query.courses.findFirst({
    where: eq(courses.slug, slug),
    with: {
      chapters: {
        with: { lessons: true },
        orderBy: asc(chapters.order)
      }
    }
  })
}

// Service 层将嵌套的 chapters.lessons 展平为扁平列表
buildTopicPage(course) {
  const lessons = course.chapters
    .sort((a, b) => a.order - b.order)
    .flatMap(ch => ch.lessons.sort((a, b) => a.order - b.order))
  return { topic: course, lessons }
}
```

> 不新增 `lesson.courseId`，不废弃 `lesson.chapterId`。Repository 层负责聚合，页面层只看到 Topic + 扁平的 Lesson 列表。

### 8.3 API 变更（已完成 2026-07-22）

| 现有 API | 新 API | 说明 |
|---------|--------|------|
| `GET /api/course` | `GET /api/domains` | 全部领域列表（知识地图） |
| `GET /api/course?slug=xxx` | `GET /api/domains?slug=xxx` | 指定领域数据 |
| `GET /api/chapter/[slug]` | `GET /api/topics/[slug]` | 主题详情（含课时列表） |
| `GET /api/lesson/[slug]` | `GET /api/lessons/[slug]` | 课时内容 |
| `GET /api/exercise?chapter=xxx` | `GET /api/exercises?topic=xxx` | 练习内容 |

### 8.4 风险与应对

| 风险 | 影响 | 应对 |
|------|------|------|
| 路由变更导致链接失效 | 中 | 配置 301 重定向 |
| Repository 聚合查询性能 | 低 | 使用 Drizzle 关联查询，无额外 N+1 |
| 学习记录本地存储 | 低 | MVP 可接受，Progress 模块支持未来切换云端 |

### 8.5 迁移检查清单

- [ ] 新路由结构创建完成
- [ ] `app/progress/` 模块（Service + Storage + LocalStorageAdapter）可用
- [ ] `useProgress` composable 可用
- [ ] 学习首页（首次访问 + 回访）实现并测试
- [ ] 知识地图页实现并测试
- [ ] 领域页实现并测试
- [ ] 学习主题页（Learning Hub）实现并测试
- [ ] 课时学习页（沉浸式）实现并测试
- [ ] 练习页适配新路由
- [ ] 旧页面重定向配置
- [ ] 旧代码清理
- [ ] TypeScript 编译通过
- [ ] Nuxt build 成功
- [ ] 主要页面功能验证

---

## 附录 A：Topic 与 Chapter 合并分析

### 问题

V1 架构为 4 层：Domain → Topic → Chapter → Lesson

需要验证 Topic 和 Chapter 是否存在职责重复。

### 分析

**V1 中 Topic 页面的职责**：
- 展示该专题下的所有 Chapter（学习单元）
- 提供导航到具体 Chapter 的入口
- 展示整体学习进度

**V1 中 Chapter 页面的职责**：
- 展示学习目标
- 展示课时列表
- 提供开始学习入口
- 提供练习入口

**职责重叠点**：
- 两个页面都展示「内容列表」和「进入学习入口」
- Topic 展示 Chapter 列表，Chapter 展示 Lesson 列表
- 学习者需要经过 Topic → Chapter → Lesson 两次跳转才能开始学习

**从学习流程验证**：

以「一元二次方程」为例：

```
V1（4 层）：
数与代数 → 一元二次方程（Topic）→ 求解方法（Chapter）→ 配方法（Lesson）
                                  ↑ 多一次跳转

V2（3 层）：
数与代数 → 一元二次方程（Topic/Learning Hub）→ 配方法（Lesson）
              ↑ 直接展示课时列表
```

在数学知识体系中，「一元二次方程」本身就是一个完整的学习主题，包含概念、求解方法、应用等。将其拆分为 Topic + Chapter 两层，只是增加了一次跳转，没有创造新的价值。

### 结论

**删除 Chapter 页面，保留 Chapter 数据模型**。理由：

1. **减少决策**：学习者少做一次选择（少一级页面）
2. **减少跳转**：从领域页直接进入主题页，即可开始学习
3. **职责不重复**：页面层面一个主题 = 一个 Learning Hub，职责清晰
4. **数据稳定**：保持现有 Course → Chapter → Lesson 数据关系不变，无需数据库迁移

**实现方式**：
- `Course` 表 = Topic（学习主题），增加 `domain` 字段用于领域分类
- `Chapter` 表保留，继续承担内容分组职责（如「概念」「求解方法」「应用」）
- `Lesson` 表关联关系不变（`chapterId` → `chapters.id`）
- **Repository 层负责聚合**：查询 Topic 时通过 `Course → Chapters → Lessons` 关联查询，将所有 Chapter 下的 Lessons 聚合为扁平列表返回给页面
- **页面不感知 Chapter**：Learning Hub 和课时页只看到 Topic 和 Lesson，不看到 Chapter

---

## 附录 B：后续规划（MVP 之后）

1. **搜索功能**：知识地图页增加全局搜索
2. **学习路径**：根据目标推荐学习路径
3. **笔记系统**：课时内可添加笔记
4. **错题本**：自动收集做错的练习题
5. **成就系统**：学习勋章、里程碑
6. **账号系统**：学习记录云端同步
7. **能力测试**：首次访问时可选的能力评估
8. **更多领域**：逐步扩展高中、大学内容

---

> 本文档为 V2 设计稿。V2 在 V1 基础上合并了 Topic/Chapter 层级，进一步极简首页，新增首次访问和回访流程。确认后进入开发。
