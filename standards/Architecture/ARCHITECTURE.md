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

Version: 1.0

Status: **Partially Implemented**（2026-07-09：Content Engine 目录重构 + Markdown Engine V1 全量落地；Search Engine / Learning Engine 仍为蓝图）

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

Content Engine 定义内容获取的领域接口（如 findLessonById），但具体的数据库访问通过 Infrastructure 层的 Drizzle ORM 实现。Content Engine 依赖于 Infrastructure 的抽象接口，而非直接耦合 Drizzle，代码位于 `app/modules/content/`。

**Markdown Engine** 是 Domain Engines 层中的**根目录独立基础设施**，代码位于仓库根目录 `markdown-engine/`（**不放在 `app/` 下**），保证零 Nuxt/Vue/DB 依赖，未来可独立发布为 npm 包。平台提供公共路径别名 `@me` → `markdown-engine/src`，业务代码统一通过 `import { createEngine, renderToHTML, runRenderPipeline } from '@me'` 使用，禁止直接 import 内部子路径。
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

**位置（强制执行）**：根目录 `markdown-engine/`（禁止放在 `app/markdown-engine/` 或 `app/render/modules/markdown/` 等 app 内部路径）。业务代码通过别名 `@me` → `markdown-engine/src` 访问公共 API。

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

markdown-engine/

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

marked.lexer() + 手动转换为 MDAST 兼容 AST（详细选型理由见 markdown-engine/ADR.md ADR 002、008）

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
