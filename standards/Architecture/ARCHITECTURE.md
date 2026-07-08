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

Status: Draft

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


职责：

- Markdown解析
- AST处理
- 插件系统
- 渲染转换


不负责：

- 内容存储
- 用户权限
- 课程结构



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

markdown-it


未来：

remark
rehype
micromark


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
