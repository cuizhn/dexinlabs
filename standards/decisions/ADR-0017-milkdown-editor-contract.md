# ADR-0017 — Milkdown Editor Contract

> 状态：Approved（已通过架构师审核，进入 POC 补测 P-1～P-5）
>
> 日期：2026-08-18（Draft）/ 2026-08-18（架构师批示）
>
> 前置：ADR-0015（Content Split）、POC 报告 `poc/milkdown-editor/REPORT.md`

## 0. 架构师批示（§13.2 正式答复）

> 批示日期：2026-08-18
>
> 两个强调原则：
> 1. **没有业务需求，不因为编辑器方便而增加 AST 节点或字段。**
> 2. **Editor 可以限制输入，但不能偷偷改变 Content Contract。**

| # | 项目 | 批示 | 理由 |
|---|---|---|---|
| A-1 | Block Math 方案（双轨：`FormulaBlock.display=true` vs `MathInline`） | ✅ **通过** | FormulaBlock(display=true) 已存在，保持现有语义，**不修改 AST** |
| A-2 | section 显式化 | ❌ **暂不增加** | 当前没有足够业务需求，不要为了编辑器增加 AST 结构 |
| A-3 | image MVP | ⚠️ **暂缓** | Native Markdown 可以保留，但暂不做专用 UI |
| A-4 | question.answer / question.analysis 专用字段 | ⚠️ **暂不支持** | 当前 Contract 没有明确需求，保持 Markdown 内容即可 |
| A-5 | 草稿存储机制 | ⚠️ **暂不决定** | 先完成单机编辑 + 保存验证，草稿机制属于后续产品能力 |
| A-6 | heading 层级限制（禁止 H1 正文） | ✅ **通过** | Editor 可以限制非法层级，但**不要因此修改 LessonAST** |

### POC 补测（§13.3）优先级

**全部需要做**，但按以下顺序：**P-1 > P-2 > P-3 > P-4 > P-5**。
完成后报告每项 PASS / FAIL / PARTIAL 以及是否需要修改 ADR-0017。
**全部通过后，才进入正式 Milkdown Editor 实现。**
目前**不需要重新设计 LessonAST**。

---

## 1. Editor 定位

### 1.1 目标架构

```
 ┌──────────┐
 │ External │     ← title / slug / topic / order / ...  (Lesson Metadata)
 │   Form   │
 └──────────┘

 Author  ──►  Milkdown Editor  ──►  Markdown  ──►  Content Compiler  ──►  LessonAST
                                                                               │
                                                                               ▼
                                                                    Contract Validation
                                                                               │
                                                                               ▼
                                                                      Publisher  ──►  DB
```

### 1.2 Editor 在全链路中的角色

| 项目 | 归属 | 依据 |
|---|---|---|
| **唯一 Canonical Content Model** | **LessonAST** | ADR-0010 / ADR-0015 |
| **Editor 产出的稳定数据格式** | **Markdown（GFM + remark-directive + remark-math）** | POC 验证：AST 81/81、11/11 保持 |
| **Editor 内部临时模型** | Milkdown ProseMirror Doc（**不持久化**、**不出编辑器边界**）| POC 禁止事项 8 |
| **Editor 是否定义课程语义** | **否** | Content Contract 定义权在 ADR-0015 + LESSON_AST.md |
| **Editor 是否接入 DB** | **否** | Editor Contract 失败边界（§7）|
| **Contract 版本** | `protocol_version = 1`, `ast_version = 1` | Content Contract 冻结 |

### 1.3 与现有 Content Contract 的关系

- Milkdown Editor 是 **Content Contract 的消费者**，**不是生产者**
- Editor 对 Content Contract 的理解完全以 `dexinlabs/shared/lessonAST.ts` 为准
- Editor 有新增节点类型的诉求时，必须通过 Content Contract 变更流程，**不能自行在 Markdown 层扩展**
- 当前所有 Editor Markdown 必须能被 **既有 `parseLesson()`** 100% 编译通过（无 P0 结构性破坏）

---

## 2. Block Math 的最终判断（第一优先级）

### 2.1 现状核实

当前系统对数学的表达存在**双轨**：

| 层级 | Markdown | Compiler 输出 | Renderer 消费 |
|---|---|---|---|
| **行内公式** | `$…$` | `MathInline { type: 'math', latex }` | `InlineRenderer.vue` — `katex.renderToString(..., { displayMode: false })` |
| **块级公式** | `$$…$$` | `FormulaBlock { type: 'formula', latex, display: true }` | `FormulaBlock.vue` — `katex.renderToString(..., { displayMode: props.block.display })`，`display=true` 时居中，`display=false` 时 inline（`.formula--inline`） |

### 2.2 POC 暴露的关键矛盾

POC 的 `$$…$$` 被 Milkdown 导出为 `$…$` 后：

- **Compiler**：`$…$` 在段落内 → `MathInline`（段落级 inline math）
- **Compiler**：`$$…$$` → `FormulaBlock.display = true`
- 两者生成的 **AST 结构不同**（一个是 paragraph 的 inline child，一个是独立 block）

**但 POC debug 显示**：主样本 9 对 `$$…$$` 在 `parseLesson` 后 block math 数 = **0**。原因在 `remark-math` → mdast：段落中行内写的 `$$3-5=?$$`（无前后空行分隔）实际上被识别为 `inlineMath`，而不是 `math`（flow）。即 **当前真实课程作者实际上几乎只用到了 inline math**；`FormulaBlock.display = true` 路径仅被 homeData.ts（硬编码，非编译）和 ADR-0015 设计文档、LESSON_AST.md 规范触及。

**LessonAST 契约中 `FormulaBlock.display` 字段存在，但真实 Compiler 路径几乎从未产出 `display: false` 的值。**

### 2.3 两种方案对比

#### 方案 A：**保持现状（推荐，已确定）**

**Contract 决定**：LessonAST 语义层**继续**保留 `FormulaBlock.display: boolean`，不做任何修改。

- `FormulaBlock.display = true`：数学教材式独立居中公式（教学语义 = "展示级公式"/"推导步骤"）
- `MathInline`：行内数学表达式（教学语义 = 词内引用）
- 两者在**教学语义**上有本质区别（"公式段落" vs "行内标记"），应当是**两种不同节点类型**，而不是单一 `formula` 节点的布尔字段

**编译器（dexinlabs-content/compiler/parser.ts）保留现有逻辑**：
- mdast `math` (flow/`$$…$$` 独立块) → `FormulaBlock { display: true }`
- mdast `inlineMath` (`$…$` 行内) → `MathInline { type: 'math' }`

**Milkdown 侧的约束**：
- Block Math Custom Node 只负责**编辑器视觉/编辑体验**
- 编辑器保存时，块级公式必须写成独立的 `$$\n…\n$$` 块（占独立段落，前后有空行）
- 行内公式必须写成 `$…$`
- **不允许**在 Markdown 层滥用 `$$` 做行内表达，也**不为了适配 Milkdown** 把所有公式降级成 inline math

**对现有课程的影响**：0。why-negative-numbers.md 现有 9 对 `$$` 本来就被识别为 inline（因作者写法无空行），Compiler 现有逻辑保持不变。

**对 Milkdown POC 是否需要补测**：是——需用独立 `$$…$$` 块（含前后空行）构造一个合成样本，验证 Milkdown Block Math Custom Node 正确导出独立块、Compiler 生成 `FormulaBlock.display=true`、Renderer 居中渲染。补测范围小，可在正式集成的 Block Math Custom Node 实现单元内完成。

#### 方案 B：Contract 修正（暂不采用）

如果将来发现：
- 真实课程作者大量需要 display-mode 公式
- 需要在 `MathInline` 中区分 `display: true`（目前 MathInline 接口**没有** display 字段）
- `FormulaBlock.display` 需要覆盖 `false` 值场景

则应提交独立的 Content Contract 变更，通过以下最小修正：

```
MathInline 新增可选 display?: boolean（默认 false）
或
新增 DisplayMathInline（新 type）
```

**当前不做**。因为真实课程只有 1 个文件使用 `$$`，且全被识别为 inline。

---

## 3. Editor ↔ Markdown 边界

### 3.1 Editor 接收的输入

Editor **只接收 Lesson Body Markdown**（不含 frontmatter）。

```typescript
// Editor 初始化入参接口（示意，非最终实现）
interface EditorInitInput {
  body: string               // 不含 frontmatter 的 Markdown 正文
  astVersion?: 1             // 锁定 = 1
}
```

Frontmatter（`title / slug / topic_slug / chapter_slug / order / ...`）由**外部 Metadata 表单**处理，不送入 Milkdown 编辑区。

### 3.2 Editor 导出的输出

唯一合法的保存导出：**Markdown 字符串**（不带 frontmatter）。

```typescript
// Editor 保存导出接口（示意，非最终实现）
interface EditorExport {
  markdown: string           // GFM + remark-directive + remark-math
                             // 对应 parseLesson(body, source) 第一个参数
}
```

### 3.3 禁止越过边界的数据

**Editor 绝对不能持久化或导出以下任何一种**：

1. ❌ Milkdown JSON（ProseMirror Doc 的 JSON 表达）
2. ❌ Milkdown ProseMirror Doc（序列化 PM state）
3. ❌ 自有的第二套 Canonical AST（如 `EditorNode` 联合）
4. ❌ 带有 editor-specific 属性标记的 HTML（如 `data-milkdown-node-id`）
5. ❌ 数据库 upsert 指令
6. ❌ LessonAST（Editor 不直接生成 LessonAST）
7. ❌ frontmatter（由外部表单收集，在保存层拼接）

**保存流程唯一合法路径**：

```
Editor.exportMarkdown()
  → (外部) 拼 frontmatter + body
  → parseLesson(combinedBody, source)
  → LessonAST
  → Content Contract Validation
  → Content Package
  → POST /api/content-package (Publisher → DB)
```

即 **Editor 只负责第一环：Markdown ↔ UI ↔ Markdown**。

---

## 4. Editor ↔ LessonAST 边界

### 4.1 Editor 不拥有 LessonAST

- Editor 不在内部构造 LessonAST
- Editor 不缓存 LessonAST
- Editor 不根据 LessonAST 渲染（虽然初始化可以考虑 Compiler 辅助的 AST→Markdown 预取，但必须通过 Markdown 序列化后再送入，不允许直接从外部 LessonAST 初始化 ProseMirror state）

### 4.2 Validation 由 Compiler + Publisher 负责

Editor 在保存时**可以**触发一个 "预览校验" 步骤：

```
Markdown  →  parseLesson()  →  LessonAST  →  本地结构性 check
```

但**校验失败时**：
- Editor 不能**自行修复** Markdown 以通过校验（避免 silent data loss）
- Editor 必须把错误位置+原因呈现给作者，并阻止"通过校验"的保存操作继续进入 Publisher
- 允许 "保存为草稿"（不触发 Publisher 流程），但**草稿内必须仍为 Markdown**，不得存 Milkdown JSON

### 4.3 LessonAST 的任何改动必须走 Contract 变更

如果 Editor 开发中发现以下情况：
- 某节点的 Markdown ↔ LessonAST 映射有歧义
- 需要新增节点类型
- 需要新增字段到已有节点

**必须**：
1. 提交独立的 Content Contract 变更（修改 `shared/lessonAST.ts` + `standards/LESSON_AST.md` + 相应 ADR）
2. 等 Contract 审核通过后
3. 再修改 Compiler / Renderer / Publisher
4. 最后才能调整 Editor 对应实现

**禁止在 Editor 层先做 hack，再倒逼 Contract 适配。**

---

## 5. Native Markdown Node 清单（Milkdown 原生处理，不做 Custom Node）

以下 Contract 节点类型**完全对应 CommonMark / GFM / remark-math 行内表达**，使用 Milkdown/Crepe 原生能力，**不为了统一而强制全部做 Custom Node**。

| LessonAST 节点 | Markdown 表达 | Milkdown 原生支持 | Editor 策略 |
|---|---|---|---|
| `paragraph` | 普通文本段落 | ✅ Crepe paragraph | **原生** |
| `heading` | `## / ### / #### / #####` （映射 AST level 1-4） | ✅ Crepe heading | **原生**，但限制最高 ≤ 4（课程规范 h1=课程级，h2 起才进入正文） |
| `bold`（Inline） | `**…**` | ✅ Crepe strong | **原生** |
| `italic`（Inline） | `*…*` | ✅ Crepe emphasis | **原生** |
| `code`（Inline） | `` `…` `` | ✅ Crepe inlineCode | **原生** |
| `link`（Inline） | `[text](url)` | ✅ Crepe link | **原生**；课程内的 `/courses/.../TODO` 等相对路径允许原样透传，Editor 不做 URL 校验 |
| `list.unordered = false` | `-` / `*` / `+` 项 | ✅ Crepe list | **原生**；导出时统一 `*` 或 `-` 均可，不影响 AST |
| `list.unordered = true` | `1. / 2. / …` | ✅ Crepe orderedList | **原生** |
| `quote` Block | `> …` | ✅ Crepe blockquote | **原生** |
| `code` Block | ``` ```lang\n…\n``` ``` | ✅ Crepe codeBlock | **原生** |
| `image` Block | `![alt](src "caption?")` | ✅ Crepe image + **原生 caption 的限制** | **原生 + 辅助**：caption 若需进入 AST，需确认 Milkdown 的 caption 插件与 Compiler 的 ImageBlock.caption 兼容性；若不兼容则用 Custom Node 或暂时禁用图片编辑（MVP 阶段无图片课程） |
| `table` Block | GFM table | ✅ Crepe table | **原生**；列宽重排、对齐风格变化可接受（不影响 AST） |
| `divider` Block | `---` / `***` / `***` | ✅ Crepe thematicBreak | **原生**；导出风格不做统一（Compiler 都识别为 `type: 'divider'`） |
| `MathInline`（Inline） | `$…$` | ✅ Crepe math inline | **原生**；按 §2 Block Math 判断的约束 |
| `section` Block | `heading` + 后续兄弟（Compiler 自动切分） | — 无独立 UI 元素 | **不进入 Editor**；Compiler 通过 heading level 切分 section，Editor 只编辑 heading + 段落，section 完全在保存→编译后隐式存在 |

### 原生层的注意事项

1. **heading 最高层级约束**：Editor 禁止作者选择 H1。课程标题进入 frontmatter `title` 字段，不进入 Editor 正文。正文 heading 允许 H2（AST level=1）→ H5（AST level=4）。
2. **table**：GFM table 不含 merged cells。复杂合并 table 用代码块或后续独立 image/figure Contract。
3. **image**：MVP 无图片课程。如启用，需单独 Contract + 存储方案。Editor MVP 阶段可隐藏图片插入按钮。
4. **link**：Editor 不做 URL 有效性校验（含相对路径、`TODO` 占位符），所有校验交给 Compiler / Publisher。

---

## 6. Custom Node 最小集合（必须实现才能正式集成）

> 这些节点的共同特性：**对应 `remark-directive` 的 `containerDirective`**，Crepe 7.22.1 默认不识别其 prosemirror schema。
> 如不实现 Custom Node，用户将无法在 UI 中识别 "块边界"，存在误删 `:::` 关闭符 / 修改属性的风险（POC 已验证 = P1）。

Custom Node 实现原则：

- **必须保留现有 directive 类型字符串**（即 `definition / example / hint / question`），不得改成 `dx-definition` 或其他私有名字
- **必须保留现有所有属性名 + 属性语义**，不得重命名 `term → definitionTerm` 等
- **保存时的 Markdown 表达必须仍然是 directive 语法**（`:::definition{term="…"} … :::`），不能转换成 `<div>`、自定义 fenced code、或非标准缩进表示
- **内部正文仍然按普通 Markdown（Inline + 段落）编辑，最终仍然进入现有 Compiler 解析**
- Custom Node 的 UI 只做两件事：(a) 让用户在编辑器中**看见块边界** (b) 让用户在不手写 `{term="…"}` 的情况下**编辑属性**

### 6.1 Custom Node 1：definition

| 项目 | 值 |
|---|---|
| **LessonAST 类型** | `DefinitionBlock { type: 'definition', term: string, children: Block[] }` |
| **Markdown 表达** | `:::definition{term="正数"}\n…\n:::` |
| **Milkdown Custom Node 名** | `containerDirective:definition`（复用 remark-directive 的 directive name） |
| **属性映射** | `node.attrs.term ↔ {term="…"}` |
| **属性 UI** | 块标题栏提供可编辑文本框 `Term`（默认空串）；属性写入 Markdown 时 HTML 转义 `"` |
| **内部正文** | 普通 Markdown 块子编辑器，接受 paragraph / heading / list / blockquote / formula / nested-directive？ |
| **嵌套规则** | 允许嵌套任意 Block（当前 Compiler 已支持，定义在 `children: Block[]`） |
| **边界 UI** | 整块带背景色 + 左上角 `DEFINITION`/「定义」tag + 可折叠（可选） |
| **Contract 风险点** | 无；Compiler 已有完整属性和嵌套处理 |

### 6.2 Custom Node 2：example

| 项目 | 值 |
|---|---|
| **LessonAST 类型** | `ExampleBlock { type: 'example', title?: string, children: Block[] }` |
| **Markdown 表达** | `:::example{title="海拔"}\n…\n:::` |
| **Milkdown Custom Node 名** | `containerDirective:example` |
| **属性映射** | `node.attrs.title ↔ {title="…"}`；未填时整个属性段可省略 |
| **属性 UI** | 块标题栏提供可编辑文本框 `Title`（可选） |
| **内部正文** | 普通 Markdown 块子编辑器 |
| **嵌套规则** | 同 definition |
| **边界 UI** | 整块背景色 + 左上角 `EXAMPLE`/「示例」tag，如标题非空则作为块级标题行显示 |
| **Contract 风险点** | 无；`title` 可选语义稳定 |

### 6.3 Custom Node 3：hint（= 用户任务中提到的 callout）

| 项目 | 值 |
|---|---|
| **LessonAST 类型** | `HintBlock { type: 'hint', level: 'info' \| 'tip' \| 'warning' \| 'danger', children: Block[] }` |
| **Markdown 表达** | `:::hint{level="info"}\n…\n:::` / `:::hint{level="warning"}…` |
| **Milkdown Custom Node 名** | `containerDirective:hint` |
| **属性映射** | `node.attrs.level ↔ {level="info"}`；默认 `info` |
| **属性 UI** | 块标题栏提供 4 选 1 水平选择器（Info / Tip / Warning / Danger），直接映射到 4 个 level 字面量 |
| **内部正文** | 普通 Markdown 块子编辑器 |
| **嵌套规则** | 同 definition |
| **边界 UI** | 4 种 level 分别用不同配色边框/背景；左上角 tag 直接用选择器结果 |
| **Contract 风险点** | `question` Block 的 `hint?: string` 字段类型是 `string`（不是 Inline[]/Block[]）。注意不要和本 `HintBlock` 搞混。命名空间冲突风险低（一个是 Block，一个是 Question 的属性），但在 Custom Node UI 文案中避免混用「Hint」一词提示 Question 的 hint，应分别为「Callout」(hint block) vs「Question Hint」(question.attrs.hint)。**已确认 lessonAST.ts 区分**：`HintBlock` vs `QuestionBlock.hint?: string`。 |

### 6.4 Custom Node 4：question

| 项目 | 值 |
|---|---|
| **LessonAST 类型** | `QuestionBlock { type: 'question', prompt: Block[], hint?: string, answer?: Inline[], analysis?: Inline[] }` |
| **Markdown 表达** | `:::question{hint="先思考等式两边同时减去 3"}\n\n题目正文（prompt）\n\n:::` |
| **Milkdown Custom Node 名** | `containerDirective:question` |
| **属性映射** | `node.attrs.hint ↔ {hint="…"}`（string，非 Inline[]）。`answer` / `analysis` 在 LessonAST v1 中**未实现 Markdown 表达**（真实课程无使用），Editor MVP 阶段暂不提供 UI。 |
| **属性 UI** | 可折叠的提示输入框 `Hint`（纯文本）；不填时整个属性段可省略 |
| **内部正文** | prompt = 块正文。允许 paragraph / list / formula / image 等。 |
| **嵌套规则** | prompt 支持 Block[] |
| **边界 UI** | 整块边框/tag `QUESTION`/「思考题」。Hint 属性独立于正文块。 |
| **Contract 风险点** | `answer` / `analysis` 未进入 Markdown 层（LessonAST 虽定义了字段，但 Contract v1 没有对应 Markdown 表示）。如后续需要启用，必须先走独立 Content Contract 变更（给 containerDirective 扩展属性或嵌套），**不由 Editor 先行扩展**。 |

### 6.5 Custom Node 5：block math（按 §2 Block Math 判断 = 方案 A）

| 项目 | 值 |
|---|---|
| **LessonAST 类型** | `FormulaBlock { type: 'formula', latex: string, display: true }` |
| **Markdown 表达** | **独立段落式** `$$\n3 - 5 = ?\n$$`（前后有空行，独占块） |
| **Milkdown Custom Node/Feature** | 基于 Crepe math feature 扩展。关键：**区分 display 模式**，在 UI 上与 inline math 有视觉区别（独立居中块 / 上下边距） |
| **属性映射** | 无属性（`display=true` 由 Markdown 表达位置决定） |
| **属性 UI** | 无；若需切换 inline↔block，用"转为块级/转为行内"右键菜单，通过 Markdown 表达层的重写完成 |
| **内部正文** | 纯 LaTeX 文本，单行允许多行折行（`$$` 块允许多行） |
| **边界 UI** | 独立块，居中 KaTeX 预览（FormulaBlock.vue 同款视觉风格），双击进入编辑 |
| **Contract 风险点** | P0：保存时必须写成独立 `$$…$$` 块（前后空行），否则 Compiler 会识别为 `inlineMath` 放入 paragraph，**节点层级改变**（P0 级 Contract 破坏）。实现时必须在 prosemirror schema 中把块级公式定义为独立 block node，禁止作为 inline child 放入 paragraph。Editor 在检测到 $$ 出现在 paragraph 内保存时应强报 Validation Warning 并强制纠正。 |

### 6.6 `exercise` 节点的说明

当前 Contract 中**不存在** `exercise` Block 类型。Content Package 顶层 `exercises: []` 为 MVP 空数组保留字段，Markdown 层没有对应 lessonAST 节点。

**Editor MVP 阶段不实现 exercise 的 Custom Node。** 如需启用，必须先完成独立 Content Contract 设计（exercises 的 Markdown 表示、Compiler 映射、LessonAST 字段扩展）。

---

## 7. Frontmatter 处理方式

**原则：Frontmatter 不进入 Milkdown。**

### 7.1 Lesson Metadata vs Content 拆分

```
Lesson 完整 Markdown 文件
  ├── frontmatter (YAML: title / order / ...)     ← External Metadata Form
  └── body (Markdown 正文)                        ← Milkdown Editor
```

Editor 初始化 & 保存的数据流：

```
载入时：
  Lesson File
    →  Scanner 按 frontmatter 切分
       →  External Form 填充 title / order / slug / ... 字段
       →  body 字符串送入 Milkdown Editor

保存时：
  External Form 收集 title / order / ...        (YAML format frontmatter)
  Milkdown Editor 导出 body Markdown
  →  拼接成完整 Markdown (frontmatter + body)
  →  parseLesson(combined, source)
  →  LessonAST
  →  Validation / Contract Check
  →  Publisher  ↔  DB
```

### 7.2 允许的 frontmatter 字段（Contract v1 当前实际）

Scanner 当前只保留 `title` 和 `order`：

| 字段 | 格式 | 必填 | 归属 |
|---|---|---|---|
| `title` | string | ✅ | frontmatter → Metadata Form |
| `order` | 正整数 | ✅ | frontmatter → Metadata Form |

**其他字段**（如 `slug`、`topic_slug`、`chapter_slug`、`exercises` 等）当前不在 Lesson 级 frontmatter 中出现，由 Manifest 生成。如未来扩展，一律按 Metadata Form 字段处理，不进入 Editor。

### 7.3 frontmatter 处理的禁止事项

1. ❌ 禁止把 `---\ntitle:…\norder:…\n---` 作为普通 Markdown 内容送入 Editor
2. ❌ 禁止在 Editor 保存流程中，把 frontmatter 作为 Editor 的一部分导出（允许外部层单独拼接，但拼接必须在 Editor 之外进行）
3. ❌ 禁止 Custom Node 包装 frontmatter（虽然 POC 提出了方案 B，但方案 A 更清晰，正式采用方案 A）
4. ❌ 禁止让 title / order 的 UI 在编辑器正文中同时存在，避免出现两个真值（single source of truth）

---

## 8. Math 处理方式（总结 §2 + §6.5）

### 8.1 双轨区分（语义层已确定：区分）

| 分类 | Markdown | LessonAST 节点 | Renderer 视觉 | Milkdown 处理 |
|---|---|---|---|---|
| 行内公式 | `$…$` | `MathInline`（paragraph 的 inline child） | InlineRenderer → inline katex | Crepe 原生 math inline |
| 块级公式 | `$$\n…\n$$`（独立块 + 前后空行） | `FormulaBlock.display = true`（独立 block） | FormulaBlock.vue 居中 katex | Custom Node / Feature：块级公式（视觉独立居中） |
| 块级公式（非独立） | `$$…$$` 出现在段落行内 | 当前 Compiler 实际上识别为 `inlineMath`（由 remark-math 行为） | 同 InlineRenderer | **保存层强制纠正**：禁止 $$ 出现在 paragraph 内，要么写成 `$…$`（inline），要么独立块 |

### 8.2 保存层的 Block Math 强制校验（P0，不允许静默）

保存→Compiler 之前，必须加一个 Editor 侧的 Pre-Validation：

> 如果 Markdown 中存在 **非独立块** 的 `$$`（即 `$$` 前后同一行还有字符，或前后段没空行），直接报错阻止保存，提示作者：
>
> - 行内短公式请用 `$…$`（单美元符）
> - 展示级公式请用独立块写法 `$$` + 新行 + 公式 + 新行 + `$$`，并且前后有空行

**不做自动修复**，避免作者不知情地把公式语义降级。

---

## 9. 保存 / 验证流程

### 9.0 保存链路的明确顺序（架构师批示补充）

**唯一合法顺序**：

```
Editor
  │
  ▼
Markdown  ───►  Pre-Validation  ───►  Content Compiler  ───►  LessonAST  ───►  Validation  ───►  Save / Publish
                 (不修复，只报错)         parseLesson()           (Contract)
```

**Pre-Validation 规则（架构师批示强调）**：

Pre-Validation 的职责是**发现错误并阻止保存**，而**不是自动修复内容**。
典型错误场景：

- 错误的行内 `$$…$$`（inline display-math） → 不能自动变为 `$$…$$` 独立块，也不能自动变成 `$…$`（inline math）
- directive 属性名拼写错误（如 `{trem="…"}` 应为 `{term="…"}`）→ 不能自动纠正拼写

正确处理方式：

1. **Validation Failed**
2. 精确告诉作者**哪里错了**（行号 + 原文片段 + 规则说明）
3. **由作者手动修正**

> 否则很容易出现：编辑器看起来没问题，但实际保存时系统悄悄改变了作者的课程内容。
> 与 §12 "禁止静默自动修复" 一致。

### 9.1 正式保存流程（允许进入发布）

```
  ┌────────────┐      ┌────────────┐
  │ Ext. Form  │      │ Milkdown   │
  │ + Metadata │      │ Markdown   │
  └──────┬─────┘      └─────┬──────┘
         │                  │
         └────────┬─────────┘
                  ▼
      ┌──────────────────────┐
      │  拼接 Full Markdown   │  (frontmatter + body，同现有 Scanner 格式)
      │  + Pre-Validation     │  ① Block Math 独立块强制检查（只报错，不修复）
      └───────────┬──────────┘  ② directive 属性键名白名单检查（只报错，不修复）
                  │
                  ▼
      ┌──────────────────────┐
      │  Content Compiler     │  parseLesson(fullMd, source)  ← 直接复用现有，不修改
      │  → LessonAST          │
      └───────────┬──────────┘
                  │
                  ▼
      ┌──────────────────────┐
      │  Contract Validation  │  a. ast.version === 1
      │  (Package 层)         │  b. Block/Inline 结构严格符合 lessonAST.ts
      └───────────┬──────────┘  c. 身份唯一性
                  │
                  ▼
      ┌──────────────────────┐
      │  Build ContentPackage │  5 顶层字段 + manifest + lessons + exercises[]
      │  protocol_version=1   │
      │  ast_version=1        │
      └───────────┬──────────┘
                  │
                  ▼
      ┌──────────────────────┐
      │  POST /api/content-package │ ←  Publisher 走数据库事务 UPSERT
      │  x-publish-token      │
      └──────────────────────┘
```

### 9.2 草稿保存流程（本地，不进入发布）

- 草稿**只存 Markdown（frontmatter + body）**，与正式保存格式一致
- 草稿可以不通过 Contract Validation
- 草稿**不允许存储 Milkdown JSON / ProseMirror state / 私有的 Editor AST**
- 草稿重新载入时，必须走 Markdown→Compiler→LessonAST 校验（即使失败也允许进入编辑态，只是不能正式保存）

### 9.3 Validation 失败的用户反馈

| 阶段 | 失败源 | 反馈方式 | 能否"静默自动修复" |
|---|---|---|---|
| Pre-Validation（Editor 侧） | Block Math 非独立块 / directive 属性名非法 | 高亮错误位置 + 中文错误信息 | **禁止**，必须作者手动确认 |
| parseLesson() | Markdown 语法异常导致 ParseError | 展示 Parser 错误堆栈片段 + 上下文 | **禁止** |
| Contract Validation | ast.version / identity / 结构 / package 字段 | 展示 Validation 错误清单 | **禁止** |
| Publisher | DB 事务 / token / 权限 | Publisher 返回 payload 原始错误 | **禁止** |

---

## 10. 错误处理

### 10.1 Editor 内部错误（渲染异常 / 自定义插件异常）

| 级别 | 举例 | 策略 |
|---|---|---|
| Fatal（Editor 崩溃） | Crepe InitReady timer 丢失（esm.sh 跨包）、Custom Node schema 冲突 | 立即禁用编辑态 + 展示错误信息 + 提供"重新载入"按钮；未保存变更提示作者手动复制 Markdown |
| Error（功能不可用） | 某个 Custom Node 渲染失败、KaTeX 公式语法错误 | 该节点降级为 raw 代码块（或原文显示），阻止保存 |
| Warning（体验问题） | 数学公式语法警告、链接无法访问 | 仅在 UI 上黄色标记，不阻塞保存 |

### 10.2 Compiler / Publisher 错误回传

Publisher 端返回的所有错误**必须原文透传展示给作者**，不能在 Editor 层吞掉或重写。错误包含：

- 结构化字段（`lessons[0].slug 非法`、`content.version != ast_version`）
- DB 级异常（identity 冲突、chapter 不存在等）

---

## 11. Editor 的责任边界（失败边界）

### 11.1 Editor 负责

| 领域 | 内容 |
|---|---|
| 内容输入 | Markdown 正文的键盘、鼠标、粘贴、快捷键交互 |
| 内容编辑 | 全部原生节点 + 4 种 directive Custom Node + Block Math 的编辑体验 |
| Custom Node UI | term / title / level / hint 等属性编辑器；块边界可视化；块级公式独立居中显示 |
| Markdown 导出 | 输出合法 GFM + remark-directive + remark-math，能被现有 parseLesson 100% 解析 |
| 基础编辑体验 | Undo / Redo、光标管理、选区、复制粘贴、拖拽（如 Crepe 支持）|
| Pre-Validation | Block Math 独立块强制检查；directive 属性键名白名单检查 |

### 11.2 Compiler 负责

| 领域 | 内容 |
|---|---|
| Markdown 解析 | `unified + remarkParse + remarkGfm + remarkMath + remarkDirective` → mdast |
| 内容语义转换 | mdast → LessonAST Block/Inline（节点类型分派、heading→section 切分、directive 解析）|
| LessonAST 构建 | `parseLesson()` 产出符合 `shared/lessonAST.ts` 的结构 |
| Contract 验证（课程层）| parseLesson 中的结构性断言 + 后续 Package 层 validateContentPackage |

### 11.3 Publisher 负责

| 领域 | 内容 |
|---|---|
| LessonAST → DB | PostgreSQL 事务 UPSERT（courses / topics / chapters / lessons） |
| 发布流程 | `POST /api/content-package`（token 校验 + protocol_version/ast_version 冻结） |
| exercises 处理 | MVP 空数组透传 |

### 11.4 Editor **不负责**（严禁越界）

| 领域 | 说明 |
|---|---|
| **数据库** | 任何 SQL / Drizzle / DB schema 相关代码不出现在 Editor 模块 |
| **发布** | 发布流程由 Publisher Service + API 层负责，Editor 最多调用一个"保存并发布"按钮（后端走现有 API） |
| **课程业务逻辑** | 课程目录、推荐顺序、先修依赖等，全归 Publisher / App logic |
| **学习进度** | 与运行时学生侧状态完全隔离 |
| **用户权限** | 鉴权、角色、token（除了调用发布 API 需要 publisher 的 token，Editor 不管理用户）|
| **Content Contract 定义权** | Editor 不新增 / 重命名 / 修改任何 LessonAST 节点或字段；Contract 变更走 §4.3 流程 |

---

## 12. 禁止事项（Hard Rules）

> 任何一项被打破，Editor Contract 视为失效，必须回滚或重新走架构决策。

1. ❌ **禁止** Milkdown JSON / ProseMirror Doc 进入 DB 或 Content Package。
2. ❌ **禁止** Milkdown 直接产出 LessonAST。LessonAST 的唯一生成入口是 `parseLesson(markdown, source)`。
3. ❌ **禁止** 为了适配 Milkdown 而修改 LessonAST 的节点类型、字段、语义。（若 Contract 确实需要修正，走独立变更流程，而非反向倒逼。）
4. ❌ **禁止** 新建第二套 Canonical AST（如 `EditorBlock / EditorInline` 联合）作为全链路上的数据层。Editor 内部临时结构不得持久化或跨边界传递。
5. ❌ **禁止** 让 frontmatter 作为 Milkdown 正文的一部分进入编辑器。
6. ❌ **禁止** 自定义 directive 的类型名、属性名在 Editor 层被重命名。
7. ❌ **禁止** 任何 Pre-Validation 错误在 Editor 层被"静默自动修复"。
8. ❌ **禁止** Editor 模块直接写 DB（任何形式的 DB driver / schema）。
9. ❌ **禁止** 在实现 Editor 的同时顺手重构其他架构（Content Contract / Compiler / Renderer / Publisher 各自独立演进）。
10. ❌ **禁止** exercise / analysis / answer 等 Contract v1 未定义 Markdown 表示的字段由 Editor 先行实现为非标准 Markdown 扩展。

---

## 13. 三分类清单

### 13.1 Contract 已确定（= 本 ADR 正式采纳后不得再讨论）

| # | 项目 | 结论 |
|---|---|---|
| E-1 | Editor 定位 | Markdown Authoring UI，非 Canonical 层 |
| E-2 | LessonAST 地位 | 唯一 Canonical Content Model |
| E-3 | 保存链路唯一路径 | Editor Markdown → parseLesson → LessonAST → Validation → Publisher → DB |
| E-4 | Milkdown 持久化格式 | 仅 Markdown，**绝对禁止** Milkdown JSON / PM State 持久化 |
| E-5 | Frontmatter 处理方案 | External Metadata Form（方案 A），不进入 Editor |
| E-6 | 原生 Markdown 节点 | §5 清单全部原生实现，不做 Custom Node |
| E-7 | Custom Node 最小集 | definition / example / hint / question / block math（= 5 个）|
| E-8 | Custom Node 命名约束 | 保留 `definition / example / hint / question` 4 个类型字面量，保留全部属性名 |
| E-9 | Pre-Validation 静默修复 | 禁止 |
| E-10 | exercise 节点 | MVP 不实现，需独立 Contract 变更 |

### 13.2 待架构师确认

| # | 项目 | 候选方案 | 推荐 |
|---|---|---|---|
| A-1 | **Block Math Contract**（§2 第一优先级） | 方案 A：保持现状（`FormulaBlock.display` + `MathInline` 双轨）；方案 B：修正 Contract，让行内 `$$` 也能产生 display=true 的 Inline | **方案 A**（§2.3 已论证） |
| A-2 | `section` Block 在 Editor 中的显式表示 | A. 完全隐式（按 heading level 由 Compiler 切分）；B. 给 section 做 Custom Node 可视化容器，section 切分由 Markdown 输出时的 heading level 顺序仍然决定（即 Custom Node 只做视觉，不改变 Markdown 输出）| **A**（MVP 先隐式，若作者混乱再升级到 B；正式实现时可留 Feature Flag） |
| A-3 | image Block MVP 处理 | A. 在 Editor 中完全禁用图片插入；B. 做 Image Custom Node，但存储/上传方案先 dummy | **A**（当前无图片课程，避免 MVP 膨胀） |
| A-4 | `question.answer` / `question.analysis` MVP | A. 暂不实现；B. 先做 Contract 设计，再实现 | **A**（真实课程无使用，延后到 exercise 体系一起设计） |
| A-5 | 草稿保存的存储介质 | A. 客户端 localStorage（纯 Markdown）；B. 服务端草稿表（需独立 Contract 设计） | **A**（MVP 最小化，避免 DB schema 变动） |
| A-6 | heading 最高层级限制 | A. 限制 H2-H5（对应 AST level 1-4，H1 为 frontmatter title）；B. 允许 H1 但在 Pre-Validation 阶段报错 | **A**（直接在工具栏/快捷键禁用 H1） |

### 13.3 需进一步 POC / 补测

| # | 项目 | 说明 |
|---|---|---|
| P-1 | **Block Math Custom Node → 独立 `$$\n…\n$$` 块往返**（§8.2） | ✅ **PASS** — 新增合成样本含 8 个 flow `$$…$$` 块（含多行 LaTeX + `paragraph $$ block $$ paragraph` 混合），验证 (a)(b)(c) 均成立：`FormulaBlock.display=true` 原始=8 / 无编辑导出=8 / 编辑后=8，无 type-change。 |
| P-2 | directive 内部嵌套多段落 + 块级公式 往返 | ✅ **PASS** — 验证 `definition └ paragraph └ formula` 等嵌套：directive 类型数 (def=1/ex=1/hint=1) 与嵌套公式数 (inside=4) 全部保持，no-edit/edit type-change=0。 |
| P-3 | `:::` 关闭符在 list item 上下文中缩进问题（POC P2） | ⚠️ **PARTIAL** — directive 总数=3 / list-items=4 / type-change=0，Compiler 仍能正确识别所有指令；但顶层 `:::` 关闭符在嵌套场景下被 Milkdown 缩进 3 处。**处理方式**：正式实现在 Pre-Validation 加告警但不阻塞（仍可正确保存/发布）。 |
| P-4 | Copy-paste 外部富文本 → Markdown 的降级行为 | ✅ **PASS** — 4 个子 case 全部通过：(1) 网页 HTML (2) Word/Google Docs 风格 HTML (3) 纯 Markdown (4) 纯 text/plain。`parseLesson()` 不抛错，无未知 Block/Inline 类型，无 javascript:/data: 可疑链接。 |
| P-5 | Crepe onChange 稳定钩子 | ✅ **PASS** — 通过 `editorViewCtx.dispatchTransaction` 拦截 + MutationObserver fallback 双保险。12 次键盘输入 → 156 change 事件（防抖下正常）；Markdown 导出 N=20 avg=3.3ms；`parseLesson` x30 avg=5.3ms；onChange+Compiler 串联 x10 avg=6.0ms（单字符编辑 <16ms 帧预算）。 |

### §13.3.1 P-1~P-5 最终判定表

| POC | 结论 | 是否需修改 ADR-0017 | 备注 |
|---|---|---|---|
| P-1 Block Math 独立块往返 | **PASS** | 否 | Block Math 作为最高优先级 P0，Contract 未发现问题；保持现有 `FormulaBlock(display=true)` 语义即可。 |
| P-2 Directive 嵌套 | **PASS** | 否 | 现有 Compiler + Milkdown remark-directive 双端都能保持嵌套结构。 |
| P-3 `:::` 缩进 | **PARTIAL** | **是**（仅补充说明条款） | §9.0 保存链路追加：「正式实现应在 Pre-Validation 对 `:::` 缩进加告警但不阻塞」。**不降级，不阻塞正式实现启动**。 |
| P-4 富文本粘贴 | **PASS** | 否 | 未发现静默错误 LessonAST。Word/Web/Markdown/Plain 四种来源均不产生 unknown 类型或可疑协议链接。 |
| P-5 Crepe onChange | **PASS** | 否 | 性能与事件可靠性均达到帧预算，无需架构变更。 |

### §13.3.2 ADR-0017 修订建议（§13.3 补测结论反推）

- **[P3] §9.0 保存链路补充**：在「Pre-Validation 禁止静默修复」条目下，新增：
  > 当 Compiler 仍能正确识别的"格式轻微偏移"（如 directive `:::` 关闭符被缩进），Pre-Validation 允许以**告警不阻塞**的方式呈现给作者，而不是作为保存失败报错。语义未破坏的轻微格式漂移不作为 Content Contract 违规。

- 其余 P-1/P-2/P-4/P-5 均不需要新增或修改 ADR-0017 已有条款。

---

## 14. 结论与下一步

**Editor Contract 的核心结论**：Milkdown 在得心实验室内容系统中被允许做的事情 = 「Markdown Authoring UI」，仅此一件。绝对不能做的事情 = 成为 Canonical AST、定义课程语义、持久化私有 JSON、越过 Markdown 边界直连 DB/Publisher。

**§13.2 架构师批示已就位 + §13.3 P-1~P-5 补测完成（未发现新的 Contract 问题）→ 可以进入正式 Milkdown Editor 实现。**

**正式实现顺序**：
1. ✅ §13.2 A-1 ~ A-6 架构师批示（已在 §0 记录）
2. ✅ §13.3 P-1 ~ P-5 补测（PASS：P1/P2/P4/P5；PARTIAL：P3，仅补充告警说明）
3. 进入正式实现：
   - 第一步：External Metadata Form + Editor shell + 5 种 Native 节点（无 Custom Node）→ 跑通保存全链路
   - 第二步：5 个 Custom Node（definition / example / hint / question / block math）
   - 第三步：Pre-Validation + 草稿保存（含 P3 `:::` 缩进告警但不阻塞）
   - 第四步：UI 打磨 / 快捷键打磨 / 粘贴兜底体验

**LessonAST 目前不需要重新设计**（符合 §13.2 批示：Editor 可以限制输入，但不能偷偷改变 Content Contract）。
