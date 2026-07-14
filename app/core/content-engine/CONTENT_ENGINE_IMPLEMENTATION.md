

# Content Engine 开发原则（Implementer Guide）

## 核心目标

Content Engine 是整个项目唯一的内容中枢（Content Hub）。

它负责统一组织、查询、管理和提供内容，不负责数据库实现、不负责 Markdown 解析、不负责 UI 渲染。

设计目标：

* 高内聚（High Cohesion）
* 低耦合（Low Coupling）
* 渐进演进（Evolutionary Architecture）
* 接口稳定，实现可重构

---

# 第一原则

不要为了未来设计未来。

任何模块都必须满足：

**现在有明确需求，再增加模块。**

严禁为了"以后可能会用"而创建目录、接口、抽象层。

例如：

不要提前创建：

* plugin/
* registry/
* pipeline/
* events/
* middleware/
* adapters/
* transformers/

除非当前版本已经真正需要。

---

# 第二原则

每个模块只有一个职责（Single Responsibility）。

例如：

Repository

负责：

读取、保存数据库。

除此之外什么都不要做。

Service

负责：

内容业务逻辑。

不要写 SQL。

不要访问对象存储。

不要解析 Markdown。

Storage

负责：

对象存储。

不要访问数据库。

不要管理课程。

Markdown Engine

负责：

Markdown → Render Tree（或 HTML）。

不要查询数据库。

不要关心 Lesson。

---

# 第三原则

目录按能力生长。

不要一次生成完整架构。

初始目录：

content-engine/

models/

repositories/

services/

index

即可。

没有实际需求：

不要增加：

cache

search

navigation

permissions

registry

plugins

events

---

# 第四原则

只有一种能力出现第二个使用场景时，才允许独立模块。

例如：

只有一个查询：

放 Service。

当查询越来越多：

再建立：

queries/

只有一个缓存：

放 Service。

多个地方都开始缓存：

再建立：

cache/

只有课程图片：

Storage 保持最简单。

以后：

视频

PDF

音频

CDN

再逐步扩展。

---

# 第五原则

所有模块只能依赖下层接口。

允许：

Application

↓

Content Engine

↓

Repository Interface

↓

Repository Implementation

↓

Database

禁止：

Application

↓

Drizzle

禁止：

Page

↓

Repository

禁止：

Component

↓

Database

所有内容必须经过 Content Engine。

---

# 第六原则

Repository 不允许泄漏 ORM。

Repository 返回：

Content Model

不要返回：

Drizzle Query

Database Row

SQL Result

ORM Entity

Content Engine 永远不知道使用了 Drizzle。

以后可以替换 ORM。

---

# 第七原则

对象存储独立。

图片、PDF、视频等资源全部属于 Storage。

Repository 不保存文件。

Storage 不保存课程。

二者通过 Asset 引用关联。

---

# 第八原则

Markdown 只是内容格式。

数据库保存 Markdown。

Markdown Engine 负责解析。

Content Engine 只负责组织内容。

Content Engine 不允许出现 Markdown 解析逻辑。

---

# 第九原则

保持最少公开接口。

每增加一个 Public API，都意味着未来必须长期维护。

如果某能力暂时只在内部使用：

不要导出。

---

# 第十原则

任何新增目录必须回答：

为什么必须独立？

如果一句话解释不清：

说明不应该拆。

---

# 演进路线

V1

models

repositories

services

index

目标：

完成内容读取。

V2

增加：

queries

目标：

统一查询逻辑。

V3

增加：

cache

目标：

提升读取性能。

V4

增加：

navigation

目标：

统一目录、面包屑、上一篇下一篇。

V5

增加：

storage

目标：

统一对象存储。

V6

增加：

search

目标：

统一全文搜索。

V7

增加：

cms

目标：

提供后台管理接口。

V8

增加：

ai

目标：

提供 AI Chunk、Embedding、RAG。

每一阶段完成后，评估是否真正需要进入下一阶段。

没有需求，不允许提前实现。

---

# 最终原则

Content Engine 不是为了"未来拥有很多模块"而设计。

Content Engine 的目标是：

随着项目成长，自然长出新的能力。

允许未来不断增加模块。

允许未来不断删除模块。

允许未来不断重构实现。

唯一不能改变的是：

对外接口保持稳定。

实现可以变化。

契约必须稳定。

这是整个 Content Engine 最重要的设计原则。

这份文档的目的不是规定具体实现细节，而是规定**演进方式**。执行者应始终优先选择当前阶段最简单、最清晰的实现，只有在真实需求驱动下才增加新的模块或抽象层。这样既能保持高内聚、低耦合，也能避免随着项目推进出现过度设计。

