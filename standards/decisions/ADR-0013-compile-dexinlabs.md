\# 合并 `dexinlabs-content` 到主项目

## 1. 目标

将当前独立的 `dexinlabs-content` 仓库合并回主项目。

合并后：

* 主项目成为唯一代码仓库；
* `lessons/` 成为唯一课程源；
* VitePress 继续作为课程内容的本地预览工具；
* Content Compiler 进入主项目，但作为开发/构建工具存在；
* `Lesson AST` 从 Content System 中彻底独立出来，统一使用 `shared/lessonAST.ts`；
* 不再维护独立的 `dexinlabs-content` 仓库。

不要改变当前已经确定的 Course → Topic → Chapter → Lesson 内容结构。

---

## 2. 合并后的目标结构

将项目整理为：

```text
dexinlabs/
├── app/
│   ├── content/
│   │   ├── repository/  (实际路径: app/database/repository)
│   │   └── service/
│   │
│   ├── content/
│   └── ...
│
├── shared/
│   └── lessonAST.ts
│
├──── lessons/
│       └── ...
│
├── tools/
│   └── content-compiler/
│       └── ...
│
├── lessons/.vitepress/config.ts
├── package.json
└── ...
```

实际迁移时先检查主项目现有目录，不要机械创建重复目录。

---

## 3. `content/lessons/` 成为唯一课程源

将 `dexinlabs-content` 中当前真正的课程 Markdown 源文件迁移到主项目：

```text
lessons/
```

这是项目唯一的课程内容源。

以后：

```text
lessons/
        ↓
   ┌────┴─────┐
   ↓          ↓
VitePress   Compiler
   ↓          ↓
预览       Lesson AST
              ↓
            DB
```

禁止形成：

```text
主项目一份课程
dexinlabs-content 一份课程
```

不得长期保留两份内容源。

---

## 4. VitePress 继续保留

VitePress 的职责仅限于：

> **课程内容作者的本地预览工具。**

它不是生产 Content Renderer，也不是 Nuxt 页面渲染系统。

配置 VitePress，使其直接读取：

```text
lessons/
```

提供类似：

```bash
npm run content:preview
```

的命令。

开发者执行后即可本地浏览完整课程内容。

如果当前 VitePress 已经存在可用配置，优先迁移并整理，不要重新设计一套无必要的内容系统。

---

## 5. Content Compiler 迁移到主项目

将 `dexinlabs-content` 中负责：

```text
Markdown
→ Lesson AST
→ JSON / DB
```

的编译逻辑迁移到：

```text
tools/content-compiler/
```

它属于开发/构建工具，不属于：

```text
app/content/
```

原因：

`app/content/` 是运行时 Content System；

`tools/content-compiler/` 是内容生产工具。

两者职责必须保持分离。

---

## 6. Lesson AST 必须独立

将 Lesson AST 的最终定义统一放到：

```text
shared/lessonAST.ts
```

它不属于：

```text
app/content/
```

也不属于：

```text
tools/content-compiler/
```

它是整个项目共享的稳定数据契约。

依赖关系：

```text
shared/lessonAST.ts
        ↑
        │
 ┌──────┼────────┐
 ↓      ↓        ↓
Compiler Content Renderer
                ↓
          Learning Intelligence
```

所有消费者必须直接引用：

```text
shared/lessonAST.ts
```

禁止：

* Compiler 自己重新定义 AST；
* 前端重新定义 AST；
* Content System 再复制一套 AST；
* Learning Intelligence 再复制一套 AST。

---

## 7. 解决现有 AST 不一致问题

迁移过程中重点检查之前已经发现的问题：

> 编译器输出的 AST 与前端 Block 组件消费的结构不一致。

例如：

```text
Compiler:
children: Inline[]

Frontend:
content: string
```

不得通过局部类型转换继续掩盖这个问题。

应该以：

```text
shared/lessonAST.ts
```

中的正式 AST 定义作为唯一事实来源。

然后统一修改：

* Compiler；
* Content Service；
* API；
* Renderer；
* Vue Block Components；
* Lesson 页面；

确保整条链路使用同一个 AST 契约。

---

## 8. 内容预览与生产渲染保持分离

明确区分：

### 内容开发阶段

```text
Markdown
   ↓
VitePress
   ↓
本地预览
```

### 内容发布阶段

```text
Markdown
   ↓
Content Compiler
   ↓
Lesson AST
   ↓
Database
```

### 用户访问阶段

```text
Database
   ↓
Content Service
   ↓
Lesson AST
   ↓
Nuxt Renderer
   ↓
用户
```

不要让生产系统依赖 VitePress。

VitePress 只是 Authoring Preview。

---

## 9. package.json 脚本

根据现有项目实际情况整理脚本，目标至少提供：

```json
{
  "scripts": {
    "dev": "nuxt dev",
    "build": "nuxt build",
    "preview": "vitepress dev lessons",
    "content:compile": "tsx tools/content-compiler/index.ts"
  }
}
```

具体命令根据现有 Compiler 实现调整。

如果 Compiler 目前不是 `tsx` 入口，不要为了符合示例而重写，只需要提供等价的稳定命令。

---

## 10. 删除重复代码和重复依赖

完成迁移后：

1. 搜索主项目和迁移内容中的重复 AST 定义；
2. 删除旧的 AST 定义；
3. 删除重复的 Content 类型；
4. 删除已经不再使用的 Compiler 类型；
5. 删除因仓库拆分而产生的临时适配代码；
6. 清理不再使用的 npm dependencies。

不要为了迁移而长期保留：

```text
legacy/
old/
compat/
deprecated/
```

之类的重复实现。

如果确实需要临时兼容层，迁移完成后立即删除。

---

## 11. 不改变生产内容架构

这次任务的目标是：

> **合并仓库，而不是重新设计整个 Content System。**

保持已经确定的架构：

```text
Course
  ↓
Topic
  ↓
Chapter
  ↓
Lesson
```

保持数据库作为生产内容存储。

保持：

```text
Markdown
→ Compiler
→ Lesson AST
→ Database
```

保持 Nuxt 负责正式网站。

不要因为合并仓库而把 VitePress 变成生产内容系统，也不要重新引入已经移除的 Markdown Engine。

---

## 12. Learning System 不参与本次合并重构

目前只为未来的 Learning System / Learning Intelligence 保留正确的 AST 与数据边界。

不要现在把：

```text
Diagnosis
Mastery
Learning Intelligence
```

加入 Content Compiler。

Content Compiler 只负责：

> Markdown → Lesson AST → 内容发布。

学习系统以后消费学习数据。

学习智能以后消费：

```text
Lesson AST / Knowledge Model
+
Learning Data
```

三者保持独立。

---

## 13. 验证要求

迁移完成后必须依次验证：

### A. VitePress

```bash
npm run content:preview
```

确认所有课程 Markdown 可以正常预览。

### B. Compiler

```bash
npm run content:compile
```

确认课程可以正常编译。

### C. AST

确认 Compiler 输出与：

```text
shared/lessonAST.ts
```

完全一致。

### D. Nuxt

```bash
npm run build
```

确认生产构建通过。

### E. 类型检查

确认不存在：

* 重复 AST；
* 类型不一致；
* import 指向旧仓库结构；
* 残留 `dexinlabs-content` 路径。

### F. 全局搜索

搜索：

```text
lessonAST.ts
dexinlabs-content
content-engine
markdown-engine
旧 content 路径
```

确认没有遗留错误引用。

---

## 14. 最终原则

合并完成后，项目应该形成清晰的职责关系：

```text
lessons/
        │
        ├──────────────→ VitePress
        │                 内容预览
        │
        ↓
Content Compiler
        │
        ↓
shared/lessonAST.ts
        │
        ↓
Database
        │
        ↓
Content System
        │
        ↓
Nuxt
```

其中：

* `lessons/ = 唯一课程源
* shared/lessonAST.ts = 全系统共享的 Lesson AST 契约
* tools/content-compiler/ = 内容编译工具
* app/content/ = 生产环境 Content System
* VitePress = 内容作者预览工具
* Nuxt = 正式产品
* Database = 生产内容存储

最终删除独立的 dexinlabs-content 仓库，避免形成两个课程源和两套内容逻辑
最终请.gitignore
├── lessons/
└── .vitepress