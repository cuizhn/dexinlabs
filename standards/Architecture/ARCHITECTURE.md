根据你目前项目的发展方向，我建议这文件的定位如下：

* `ARCHITECTURE.md`：**整个教育平台的最高层架构规则**，约束所有模块如何协作

两者关系：

```
ARCHITECTURE.md
        │
        │ 定义系统边界
        ↓

markdown-engine/SPEC.md
        │
        │ 定义 Markdown Engine 内部规则
        ↓

Implementer 执行代码
```
---

# ARCHITECTURE.md

```md
# 德鑫实验室平台架构规范

Version: 1.1

Status: **Partially Implemented**（2026-07-10：Core 五域归位（content-engine/markdown-engine/database/storage）+ Boot 聚合层删除 + Engine 独立·Application 编排 100% 落地；Search Engine / Learning Engine 仍为蓝图）

Priority: Highest


# 1. 项目定位

本项目是一个可长期演进的教育内容平台。

核心目标：

- 管理结构化课程内容
- 支持多学科扩展
- 支持学习流程
- 支持练习系统
- 支持未来智能学习能力


系统不是单一网站，而是一个教育内容基础设施。


---

# 2. 总体架构


系统采用分层架构：

```

Application Layer
|
|
Business Modules
|
|
Domain Engines
|
|
Infrastructure

```


具体：


```

┌──────────────────────┐
│       Pages          │
│   Nuxt Application   │
└──────────┬───────────┘
|
↓

┌──────────────────────┐
│     Modules          │
│ course               │
│ practice             │
│ learning             │
└──────────┬───────────┘
|
↓

┌──────────────────────┐
│      Engines         │
│                      │
│ Content Engine       │
│ Markdown Engine      │
│ Search Engine        │
│ Learning Engine      │
└──────────┬───────────┘
|
↓

┌──────────────────────┐
│ Infrastructure       │
│ Database             │
│ Storage              │
│ External Services    │
└──────────────────────┘

```

Content Engine 定义内容获取的领域接口（如 findLessonById），但具体的数据库访问通过 Infrastructure 层的 Drizzle ORM 实现。Content Engine 依赖于 Infrastructure 的抽象接口，而非直接耦合 Drizzle，代码位于 `app/core/content-engine/`（统一 Core 目录下的内容能力域，禁止放在 app/modules 或 app/data 等泛化目录）。

**Markdown Engine** 是 Domain Engines 层中的**独立纯技术基础设施**，代码位于统一 Core 目录 `app/core/markdown-engine/`（**不放在 app/modules/course、components、render/modules 等业务路径下**），严格保持零 Nuxt / 零 Vue / 零 DB 依赖，未来可独立发布为 npm 包（目录迁移到 app/core 仅属统一组织方式，不影响独立发布能力；只要保持零 app/* 依赖即可）。平台提供公共路径别名 `@me` → `app/core/markdown-engine/src`，业务代码统一通过 `import { createEngine, renderToHTML, runRenderPipeline } from '@me'` 使用，禁止直接 import 内部子路径。
---

# 3. 核心架构原则


## 3.1 单向依赖原则


依赖方向：

```

Application

↓

Modules

↓

Engines

↓

Infrastructure

```


禁止反向依赖。


例如：

允许：

```

Course Module

调用

Content Engine

```


禁止：

```

Content Engine

调用

Course Module

```



---

## 3.2 Core 目录统一组织原则（v4 起强制执行）

所有与业务无关、可被多个业务模块共享的**纯技术核心能力**，统一放入 `app/core/`，禁止再放在项目根目录或泛化的 app/data 下：

```text
app/
└── core/                 【十年稳定 · 只承载非业务纯技术能力】
    ├── content-engine/      【内容能力】内容组织/查询/模型/服务（禁止 import Markdown）
    ├── markdown-engine/     【Markdown 能力】解析/转换/渲染（禁止 import Course/Lesson/Repository）
    ├── database/            【数据能力】Drizzle 连接/Schema/Migration/Repository 实现（独占 drizzle 包引用）
    └── storage/             【资源能力】对象存储（上传/删除/URL/meta）

app/
└── modules/              【业务模块】course / practice / review ...
                           → 仅允许依赖 @core/**，不得直接引用 drizzle/repository
```

**关键规则**：
- 根目录只保留构建配置类文件（package.json / nuxt.config.ts / drizzle.config.ts / tsconfig.json），**禁止任何 Engine / 基础设施代码直接放在根目录**（v4 之前的 markdown-engine/content-engine 根目录模式 100% 废止）
- Database 层的 `drizzle-orm` / `drizzle-kit` 包引用，**只允许出现在 `app/core/database/**` + 根 `drizzle.config.ts`**，Application（Page/Component/Composable/Plugin）禁止直接 import（v4 起是宪法级红线，见 adr0710 §6）
- 两个 Engine（content-engine ↔ markdown-engine）必须**零互相引用**，组合权永远在 Application 具体业务（Nuxt Page / Server API / Plugin / Composable），禁止再创建任何"总 Engine Facade / Boot 总启动层"把两 Engine 写死绑定（v4 起删除 app/boot 整目录）

---

# 4. Engine 层规范


Engine 是系统核心能力。


Engine 特征：

- 独立
- 可复用
- 与业务无关
- 稳定 API
- 长期维护


当前 Engine：


## Content Engine

职责：

- 内容获取
- 内容索引
- 内容查询
- 内容生命周期


不负责：

- Markdown解析
- 页面显示


---


## Markdown Engine

**位置（强制执行）**：统一 Core 目录 `app/core/markdown-engine/`（禁止放在 `app/modules/course/markdown/`、`components/MarkdownRenderer.vue`、`app/render/modules/markdown/` 等业务/组件路径下作为核心实现）。业务代码通过别名 `@me` → `app/core/markdown-engine/src` 访问公共 API。

职责：

- Markdown解析（marked.lexer → MDAST 兼容 AST）
- AST处理（统一类型真源：`@me/ast/types.ts`，禁止业务层复制类型）
- 插件系统（Engine 自管 Map-based Registry，不依赖 `@core/registry`；内置 6 个插件按 order 升序：Heading 10 → TOC 20 → Links 30 → Excerpt 40 → ReadingTime 50 → Reference 100）
- 渲染转换：Pipeline 固定顺序 `Parse → runPlugins → Renderer`，双输出格式：
  - **HTML string**：SSR/SEO/邮件/PDF 导出用
  - **框架无关 JSON VNode 描述树**（`{ type, is, props, children }`，可 `JSON.stringify`）：由 UI 层（app/render/）适配 Vue/React 等渲染
- 公共 API 入口（`@me/index.ts`）：`createEngine / getEngine / parseMarkdown / runRenderPipeline / renderToHTML / renderToVNode / compile / registerPlugin / unregisterPlugin`

不负责：

- 内容存储
- 用户权限
- 课程结构
- 直接挂载 Vue 组件引用（必须是 JSON VNode 描述，由 Vue 适配层动态 `<component :is>` 渲染）



---

# 5. Module 层规范


Module 是业务领域。


例如：

```

modules/

course

practice

learning

user

```


Module 可以：

- 调用 Engine
- 组合业务逻辑
- 提供页面组件


Module 不应该：

- 自己实现 Markdown Parser
- 自己访问数据库底层
- 创建基础设施


---

# 6. Markdown Engine 架构要求


Markdown Engine 必须独立维护。


目录：

```

app/core/markdown-engine/

├── DESIGN.md
├── SPEC.md
├── RFC/
├── VERSION.md
│
├── src/
│
├── tests/
│
└── fixtures/

```


禁止：

```

modules/course/
markdown/

```


或者：

```

components/
MarkdownRenderer.vue

```


作为核心实现。


---

# 7. 技术替换原则


任何 Engine 内部技术可以替换。


例如：

Markdown Engine:

现在：

marked.lexer() + 手动转换为 MDAST 兼容 AST（详细选型理由见 app/core/markdown-engine/ADR.md ADR 002、008）

未来：

remark
rehype
micromark

（注：Parser 技术可替换属于 Engine 内部决策，只要公共 API（createEngine/render/parse）形状不变，对 Module / Page / Database 无影响。AST Schema 是公共契约，更换 Parser 必须保持 MDAST 兼容的节点 shape，不能改根节点 type 或 heading/code 等核心节点结构，否则视为 Breaking Change 必须走 RFC）


不影响：

- Module
- Page
- Database


---

# 8. AI Implementer 工作规则


执行任务前必须阅读：

1. ARCHITECTURE.md

2. 对应 Engine SPEC.md


实现时：

优先保证：

1. 架构正确
2. 边界清晰
3. API稳定
4. 可测试


禁止：

- 快速堆代码
- 跨层调用
- 业务污染基础设施

```

---
