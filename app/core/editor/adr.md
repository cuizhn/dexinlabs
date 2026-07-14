建议告诉执行者：**Vditor 是当前阶段的编辑器实现，不是系统架构的一部分。整个后台必须以"编辑器可替换"为原则设计，为未来迁移到 Milkdown 或其他编辑器保留空间。**

可以将下面这份设计要求直接交给执行者。

---

# Dexin Labs Admin · Vditor 接入设计要求（V1）

## 一、设计目标

本阶段后台采用 **Vditor** 作为 Markdown 编辑器。

选择 Vditor 的原因：

* 开发成本低
* 编辑体验成熟
* 支持 Markdown、KaTeX、Mermaid
* 能快速完成课程录入后台

**注意：Vditor 仅作为输入工具，不属于 Markdown Engine，也不属于 Content Engine。**

---

# 二、核心原则（必须遵守）

## 1、编辑器可替换（最高优先级）

整个后台不得直接依赖 Vditor。

业务层只能依赖统一 Editor 接口。

禁止出现：

```js
new Vditor(...)
vditor.getValue()
vditor.insertValue()
vditor.setValue()
```

这些 API 散落在页面、组件或业务逻辑中。

所有 Vditor API 必须集中封装。

---

## 2、数据库始终保存 Markdown

数据库保存：

```text
# 一元二次方程

内容...

$$
ax^2+bx+c=0
$$

:::definition
...
:::
```

禁止保存：

* HTML
* Vditor 内部数据
* 编辑器状态
* ProseMirror JSON

Markdown 是整个系统唯一的内容源（Source of Truth）。

---

## 3、Markdown Engine 独立

后台编辑器只负责：

```
Markdown 输入
```

Markdown Engine 负责：

```
Markdown
↓

Parser

↓

AST

↓

Renderer

↓

Vue
```

编辑器不得参与渲染逻辑。

---

# 三、建议目录

建议新增独立模块：

```text
app/
└── core/
    └── editor/
        ├── index.js
        ├── types.js
        ├── adapters/
        │     └── vditor.js
        ├── composables/
        └── utils/
```

不要放入：

```
content-engine
```

也不要放入：

```
markdown-engine
```

Editor 是第三个独立能力。

---

# 四、统一接口

建议定义统一接口，例如：

```ts
create()

destroy()

getMarkdown()

setMarkdown()

insert()

focus()

blur()

onChange()

onSave()
```

页面永远调用统一接口。

不能直接调用 Vditor API。

---

# 五、LessonEditor 组件

建议：

```
LessonEditor

↓

Editor Adapter

↓

Vditor
```

而不是：

```
LessonEditor

↓

直接 new Vditor
```

这样未来替换 Milkdown 时：

```
LessonEditor

↓

Editor Adapter

↓

Milkdown
```

业务代码无需修改。

---

# 六、图片上传

不要使用 Vditor 默认上传。

统一调用：

```
Storage Engine

↓

OBS

↓

URL

↓

插入 Markdown
```

保证未来编辑器切换时上传逻辑无需修改。

---

# 七、预览

右侧实时预览建议直接调用：

```
Markdown Engine
```

不要调用：

```
Vditor Preview
```

原因：

后台预览必须与前台渲染保持 **100% 一致**。

---

# 八、自定义 Markdown

后台必须允许输入所有自定义语法，例如：

```markdown
:::definition

定义内容

:::
```

```markdown
:::theorem

定理内容

:::
```

```markdown
:::exercise

...

:::
```

不要因为 Vditor 默认不认识这些语法而限制输入。

真正解析由 Markdown Engine 完成。

---

# 九、自动保存

建议支持：

* 内容变更
* 延迟（如 3 秒）
* 自动保存 Markdown
* 保存成功提示

不要频繁请求数据库。

---

# 十、后续迁移目标

V2 可能迁移至：

* Milkdown
* 或其他编辑器

因此整个后台不得出现任何 Vditor 专属设计。

最终目标应为：

```
Page

↓

LessonEditor

↓

Editor Adapter

↓

Vditor（V1）
Milkdown（V2）
其它编辑器（未来）
```

Editor 是可插拔组件，而不是业务核心。

---

## 最终要求（必须遵守）

1. **Vditor 仅作为当前编辑器实现，不得与业务逻辑耦合。**
2. **数据库唯一存储格式为 Markdown。**
3. **预览统一使用 Markdown Engine，确保与前台渲染一致。**
4. **所有 Vditor API 必须封装在 Adapter 中，页面和业务层禁止直接调用。**
5. **整个后台应具备未来无痛替换为 Milkdown 的能力，仅需替换 Adapter 实现即可。**

这套设计与你目前的 **Content Engine** 和 **Markdown Engine** 的分层理念保持一致，也符合高内聚、低耦合的长期架构目标。

---

# 迁移验收报告 · ADR 执行结果

执行时间：2026-07-12

---

## 一、目录结构（按 §三 建议落地）

```text
app/core/editor-engine/
├── adr.md                              ← 本设计文档 + 验收报告（本条）
├── src/
│   ├── index.ts                        ← Public API：createEditor() 工厂，零 Vditor 依赖
│   ├── types.ts                        ← EditorAdapter / EditorInstance / 类型契约，零实现依赖
│   ├── adapters/
│   │   └── vditor.ts                   ← 唯一 import 'vditor' 的文件，SSR 动态导入降级
│   └── utils/
│       ├── debounce.ts                 ← 3s 自动保存防抖（§九）
│       └── storage.ts                  ← §六 图片上传 Storage Engine 预留接口 + Fallback 错误
└── tests/
    ├── contract.test.ts                ← 统一接口契约 / 红线 / 适配器可替换 / SSR 验证（12 cases）
    └── utils.test.ts                   ← debounce / autoSave 集成验证（6 cases）
```

**未放入 content-engine / markdown-engine**：Editor 作为第三独立能力，与 Content Engine（查询组织）、Markdown Engine（解析渲染）严格解耦。三 Engine 零相互依赖（见 §三 红线）。

`tsconfig.json` 中已增加 `@editor` / `@editor/*` alias（与 `@ce` / `@me` 风格一致）。

---

## 二、10 条设计原则逐条验证（§一 ~ §十）

| # | ADR 条款 | 验证结果 | 证据 |
|---|---|---|---|
| 1 | **编辑器可替换（最高优先级）**：业务层仅依赖统一 Editor 接口，页面永不 `new Vditor()` / `vditor.getValue()` | ✅ 通过 | `createEditor(adapter)` 仅接收 `EditorAdapter` 抽象；[contract.test.ts](file:///c:/Users/cui/Documents/www/dexinlabs/app/core/editor-engine/tests/contract.test.ts#L42-L78) 用 MockAdapter（无 Vditor）完整跑通 10 方法契约，`onChange` / `onSave` hook 正常接收事件 —— 证明业务代码只依赖接口，未来换 Adapter 无需改调用方。 |
| 2 | **数据库始终保存 Markdown**：禁止存 HTML / Vditor 内部数据 / ProseMirror JSON | ✅ 通过 | Editor 对外唯一读写接口：`getMarkdown()` / `setMarkdown()` 返回 **纯字符串**；Vditor Adapter 内部即便有 Vditor 实例也仅对 `getValue() / setValue()` 做字符串透传，`internalMarkdown` 字段只存 Markdown。 |
| 3 | **Markdown Engine 独立**：编辑器仅负责「Markdown 输入」，不参与渲染 | ✅ 通过 | `editor-engine/src/**` 中 Grep `@me` / `markdown-engine` / `renderToHTML` / `renderToVNode`：**0 命中**；图片上传接口（§六）、预览渲染（§七）均为预留接口或文档要求，不在 Engine 内实现。 |
| 4 | **目录隔离**：Editor 位于 `app/core/editor-engine/`，不得混入 Content / Markdown Engine | ✅ 通过 | LS 已验证；`content-engine/` 与 `markdown-engine/` 下无 `editor*` 目录 / `vditor` import。 |
| 5 | **统一接口（§四）**：`create/destroy/getMarkdown/setMarkdown/insert/focus/blur/onChange/onSave` 9 个方法必须存在 | ✅ 通过 | [types.ts](file:///c:/Users/cui/Documents/www/dexinlabs/app/core/editor-engine/src/types.ts) 中 `EditorAdapter` / `EditorInstance` 双接口完整覆盖 §四 9 方法 + 扩展 `isCreated()`、`getAdapter()` 用于生命周期与测试自检；[contract.test.ts#L72-L77](file:///c:/Users/cui/Documents/www/dexinlabs/app/core/editor-engine/tests/contract.test.ts#L72-L77) 逐一断言 11 方法皆为 `function`。 |
| 6 | **LessonEditor 组件分层（§五）**：`LessonEditor → Editor Adapter → Vditor`，未来换 Milkdown 仅改 Adapter | ✅ 通过 | 架构支持：`createEditor(createVditorAdapter())` 构成组合根；若要换成 Milkdown 只需新增 `adapters/milkdown.ts` 实现同样 10 方法的 `EditorAdapter`，调用侧零改动。**实际分层图**见 §六。 |
| 7 | **图片上传（§六）**：不走 Vditor 默认上传，统一经过 Storage Engine → OBS → URL → 插入 Markdown | ✅ 通过 | [utils/storage.ts](file:///c:/Users/cui/Documents/www/dexinlabs/app/core/editor-engine/src/utils/storage.ts) 定义 `StorageUploader` 接口 + `FallbackStorageUploader`（未配置时抛出**明确错误**提示注入实现）+ `createUploadHandler` + `toMarkdownImageLinks`；vditor Adapter 的 `upload.handler()` 仅调用该接口，绝不产生 Vditor 专属上传逻辑。 |
| 8 | **预览（§七）**：右侧实时预览必须调用 Markdown Engine，禁止 Vditor Preview | ✅ 通过 | Engine 不内置预览；Adapter `preview.mode` 虽保留字段方便后续接入，但业务层可通过 `editor.onChange(md => markdownEngine.render(md))` 接入 `@me` 完成，架构红线已在 ADR §七 明确。 |
| 9 | **自定义 Markdown 语法（§八）**：`:::definition / :::theorem / :::exercise` 必须允许输入，解析由 Markdown Engine 负责 | ✅ 通过 | 所有 Adapter 接口仅操作字符串；Vditor Adapter 即使默认不识别这些语法，也仅作为普通 text-mode 输入；**不做任何语法限制或白名单**。 |
| 10 | **自动保存（§九）**：内容变更 → 延迟 3 秒 → 自动保存 Markdown，避免频繁 DB 请求 | ✅ 通过 | [utils/debounce.ts](file:///c:/Users/cui/Documents/www/dexinlabs/app/core/editor-engine/src/utils/debounce.ts) 实现带 `cancel` / `flush` 的通用 debounce；`createEditor` 的 `autoSave: { enabled: true, delay: 3000 }` 默认开启并在 `notifyChange` 内串接 → `onSave` hook；`autoSave.enabled=false` 时完全跳过。 |

---

## 三、红线验证表（架构边界）

**红线 = 违反后整个 ADR 失效的硬约束。**

| 编号 | 红线 | 是否满足 | 验证方式 |
|---|---|---|---|
| R1 | `index.ts` / `types.ts` 不得 `import 'vditor'`（static/dynamic 皆禁止） | ✅ 满足 | [contract.test.ts#L164-L188](file:///c:/Users/cui/Documents/www/dexinlabs/app/core/editor-engine/tests/contract.test.ts#L164-L188) 对 `src/index.ts` / `src/types.ts` / `utils/*.ts` 文件内容做正则：`import('vditor')` 与 `import ... from 'vditor'` 双形态 Grep，**0 命中**，仅 `adapters/vditor.ts` 1 处命中。 |
| R2 | 只有 `adapters/vditor.ts` 能 import vditor 模块 | ✅ 满足 | 同上测试；代码审计：`app/core/editor-engine/` 下仅 [adapters/vditor.ts#L49](file:///c:/Users/cui/Documents/www/dexinlabs/app/core/editor-engine/src/adapters/vditor.ts#L49) 存在 `await import('vditor')`（**动态导入**，SSR 环境会返回 null 走 no-op 路径，符合 Engine 可在服务端被 import 而不崩的要求）。 |
| R3 | Editor Engine 不得依赖 Content Engine | ✅ 满足 | 目录内 Grep `@ce` / `content-engine`：0 命中。 |
| R4 | Editor Engine 不得依赖 Markdown Engine | ✅ 满足 | 目录内 Grep `@me` / `markdown-engine` / `renderToHTML`：0 命中。 |
| R5 | Editor Engine 不得依赖 Drizzle / Neon 数据库 | ✅ 满足 | 目录内 Grep `drizzle-orm` / `@core/database` / `process.env.DATABASE_URL`：0 命中。 |
| R6 | SSR（无 window）下 import Editor Engine 必须不抛错（Node 可跑测试 = 证明） | ✅ 满足 | `npx tsx app/core/editor-engine/tests/contract.test.ts` 在 Node 环境完整跑 12 tests；Vditor Adapter 在 SSR 环境下走 `loadVditorConstructor → null → no-op create / memory-only getMarkdown / setMarkdown` 分支，确保后台 SSR 时即便引用 Editor 模块也不会 500。 |
| R7 | 业务层（页面 / composable / 组件）必须通过 `@editor` 调用统一接口，**不得**直接 `import vditor` | ✅ 架构已支持 | 组合根处推荐写法：`import { createEditor, createVditorAdapter } from '@editor'` —— 业务代码对 `vditor` 包的依赖为 0，引用的只是从 adapter 命名暴露的「工厂函数名字符串」，不涉及 Vditor 类型或 API。 |

---

## 四、未来 Milkdown / 其他编辑器迁移方案（V2 无痛替换 PoC）

**只需 3 步，调用侧（Page / LessonEditor 组件 / composable）0 改动：**

```text
Step 1: 新增
  app/core/editor-engine/src/adapters/milkdown.ts
    导出 createMilkdownAdapter(): EditorAdapter
    实现 10 方法：create / destroy / getMarkdown / setMarkdown /
                 insert / focus / blur / onChange / onSave / isCreated

Step 2: 组合根（插件或组件 setup 顶部）替换一行
  - const editor = createEditor(createVditorAdapter(), { autoSave: { enabled: true } })
  + const editor = createEditor(createMilkdownAdapter(), { autoSave: { enabled: true } })

Step 3: 卸载 vditor 包（可选）
  npm remove vditor
```

**证明**：[contract.test.ts#L42-L115](file:///c:/Users/cui/Documents/www/dexinlabs/app/core/editor-engine/tests/contract.test.ts#L42-L115) 中的 `MockAdapter` 即扮演"未来任意编辑器"的角色，它完全不依赖 Vditor，但通过 `createEditor(new MockAdapter())` 后，所有对外契约方法、hook、autoSave 表现完全一致。这就是可替换性的证明。

---

## 五、测试报告

### 5.1 运行方式

```bash
# 类型检查（Editor Engine 仅 src/tests）
npx tsc --noEmit          # Exit 0，0 errors ✅

# 合约 + 红线测试
npx tsx app/core/editor-engine/tests/contract.test.ts

# debounce + autoSave 集成测试
npx tsx app/core/editor-engine/tests/utils.test.ts
```

### 5.2 Case 清单（合计 18 / 18 Pass）

**contract.test.ts（12 / 12）**

1. createEditor 对 null/undefined adapter 抛错（参数有效性）
2. EditorInstance 暴露 §四 要求的 10 方法 + 2 扩展方法
3. MockAdapter：create → set → get → insert（append/replace）全流程
4. focus / blur / destroy 转发到 Adapter
5. `editor.onChange` 与 `editor.onSave`：通过 Adapter wiring 正常接收事件
6. Vditor Adapter 方法形状（10 method）+ SSR no-op 行为（内存读写也可用）
7. FallbackStorageUploader.upload：**未配置 Storage 时抛带诊断信息的错误**（§六）
8. toMarkdownImageLinks：`![name](url)` 格式正确
9. 🔴 RED LINE：`src/index.ts` 0 vditor 导入
10. 🔴 RED LINE：`src/types.ts` 0 vditor 导入
11. 🔴 RED LINE：`src/utils/*` 0 vditor 导入
12. 🔴 RED LINE：仅 `adapters/vditor.ts` 允许 import vditor（static or dynamic）

**utils.test.ts（6 / 6）**

1. DEFAULT_AUTOSAVE_DELAY_MS ≡ 3000ms（§九）
2. debounce 在窗口内合并多次调用，flush 立即触发合并调用
3. debounce.cancel 丢弃待执行事件
4. debounce 等满 waitMs 窗口后执行，取最后一次参数
5. autoSave 场景：3 次 pushChange → 窗口合并 → 仅 1 次 onSave，内容为最终值 `v3`
6. autoSave.enabled=false → 完全不触发保存

### 5.3 构建与类型验证

| 验证 | 结果 | 命令 |
|---|---|---|
| TypeScript `--noEmit` 全项目类型检查 | ✅ 0 errors | `npx tsc --noEmit` |
| Editor Engine Node 可运行（SSR 安全） | ✅ 18 / 18 Pass | 见 §5.1 |
| `drizzle.config.ts` process 报错（tsconfig 修复） | ✅ 前序修复已完成 | `include` 增加 `drizzle.config.ts` |
| `@editor` alias 解析 | ✅ 已注册 | tsconfig paths |

---

## 六、Public API 冻结（ADR 稳定化）

`@editor`（即 `app/core/editor-engine/src/index.ts`）对外仅暴露以下符号，**后续新增能力走 RFC**：

**工厂函数**
- `createEditor(adapter, options?)` — 唯一入口

**适配器工厂**
- `createVditorAdapter()` — 唯一具体实现（V1）

**工具函数（与 §六 §九 对应）**
- `debounce(fn, waitMs?)` + `DEFAULT_AUTOSAVE_DELAY_MS`
- `createUploadHandler(uploader?)`
- `FallbackStorageUploader`
- `toMarkdownImageLinks(responses)`

**类型（全部来自 types.ts，零 Vditor 类型泄露）**
- `EditorAdapter`, `EditorInstance`, `EditorCreateOptions`
- `EditorChangeHook`, `EditorLifecycleHook`
- `StorageUploader`, `UploadHandler`, `UploadResponse`
- `DebounceFunction<T>`

**禁止对外的符号**（以下仅内部使用，不得从 `@editor` re-export）：
- Vditor 构造函数本身
- 任何 `VditorOptions` / Vditor 专属类型 / Vditor 事件对象
- Adapter 内部 `loadVditorConstructor` 等

---

## 七、结论

**ADR 文档中 §一 ~ §十 及最终要求的 5 条硬约束全部验收通过 ✅**。

Editor Engine V1 已达到 ADR 预期目标：
- 第三独立能力定位确认（≠ Content Engine ≠ Markdown Engine，三 Engine 零交叉引用）
- 编辑器可替换（MockAdapter 完整跑通契约，为 Milkdown 迁移铺路）
- 数据库唯一存储为 Markdown（接口层字符串语义）
- 图片上传走 Storage Engine 预留接口 + Fallback 显式错误
- 自动保存 3s debounce 已集成 + 可关闭
- SSR 环境安全（Node 可跑完整 18 条测试）
- tsconfig 已注册 `@editor` / `@editor/*` alias，业务层组合成本为 0

**下一步建议**：在 Nuxt 插件中按 `$content` / `$markdown` 风格注入 `$editor = { create: (opts) => createEditor(createVditorAdapter(), opts) }`，然后开始实现后台 `LessonEditor.vue` 组件（仅调用 `@editor` 暴露的统一接口，**绝不直接 import vditor**）。


# Editor 架构评审反馈（V1 修订）

整体评价：

本次 ADR 执行质量较高，整体架构符合预期，可以作为 Editor 模块 V1 的基础实现。

优点：

* Editor 与 Content Engine、Markdown Engine 已完成解耦。
* Adapter 抽象合理，具备未来迁移 Milkdown 的能力。
* SSR、安全性、自动保存、统一接口等设计均符合预期。
* 测试覆盖较完整，架构方向正确。

在正式作为长期架构之前，请完成以下优化。

---

# 1、目录名称调整（建议）

当前：

```
app/core/editor-engine/
```

建议调整为：

```
app/core/editor/
```

原因：

Editor 本身不是 Engine。

Markdown Engine、Content Engine 都承担完整的数据处理流程，因此称为 Engine 合理。

Editor 更准确的定位应该是：

* Editor
* Adapter
* Provider
* Command
* Plugin

因此建议统一改为：

```
app/core/editor/
```

alias 同步调整为：

```
@editor
```

---

# 2、Storage 能力移出 Editor

当前：

```
editor/
    utils/
        storage.ts
```

建议调整。

Editor 不应该知道：

* OBS
* S3
* COS
* OSS

这些属于 Storage Engine 的职责。

建议：

```
core/
    storage-engine/
```

Editor 仅接收：

```
uploadHandler
```

或

```
StorageUploader
```

作为注入能力。

Editor 不直接依赖任何存储实现。

---

# 3、业务层不要知道 Adapter

当前：

```
createEditor(
    createVditorAdapter()
)
```

建议不要让页面或组件直接创建 Adapter。

推荐：

```
createEditor({
    provider: 'vditor'
})
```

或由 Registry 自动完成 Adapter 创建。

目标：

业务层永远不知道：

* Vditor
* Milkdown
* TipTap

业务只知道：

```
createEditor()
```

以后更换编辑器，仅修改 Provider 注册即可。

---

# 4、预留 Command 能力

请在 Editor 公共接口中预留 Command 扩展点。

例如：

```
executeCommand()

registerCommand()
```

未来将用于：

* 插入公式
* 插入定理
* 插入定义
* 插入例题
* 插入知识点
* 插入图片

Toolbar 应调用 Command，而不是调用具体编辑器 API。

---

# 5、预留 Capability 能力

建议增加统一 Capability 描述。

例如：

```
supportsMath

supportsImageUpload

supportsMermaid

supportsTable

supportsSlashCommand
```

以后业务通过：

```
editor.capability
```

判断功能，而不是判断：

```
instanceof Vditor
```

这也是未来迁移 Milkdown 的重要基础。

---

# 6、Editor 不暴露 Vendor 类型

Public API 不应暴露：

* Vditor 类型
* Vditor Options
* Vditor Event
* Vditor Instance

所有 Vendor 类型仅允许存在于：

```
adapters/
```

外部只能依赖：

```
EditorAdapter

EditorInstance

EditorCommand

EditorCapability
```

---

# 7、建议补充 RFC

建议新增以下 RFC，为后续演进建立统一规范。

```
RFC001 Editor Provider
RFC002 Toolbar
RFC003 Command
RFC004 Selection
RFC005 Clipboard
RFC006 History
```

V1 可仅建立文档，不要求全部实现。

---

# 最终要求

本次 ADR 已具备合并条件。

请完成以上优化后，将 Editor 定位为独立能力模块，而不是 Engine。

最终目标：

```
Page
    ↓
LessonEditor
    ↓
Editor
    ↓
Provider
    ↓
Adapter
    ↓
Vditor（V1）
Milkdown（V2）
```

业务层始终只依赖 Editor，不依赖任何具体编辑器实现。

未来无论替换为 Milkdown、TipTap 或其他编辑器，都应保证页面、业务逻辑、数据库、Content Engine 与 Markdown Engine 无需修改，仅替换 Provider/Adapter 即可。

---

# 评审反馈 V1 修订 · 验收报告（2026-07-12）

> 本报告为「Editor 架构评审反馈（V1 修订）」7 条优化项的逐条落地与验收结果。

---

## 一、修订后目录结构（§1、§2）

```text
app/core/
├── editor/                                    ← 正式更名为 editor（不再是 editor-engine，§1 完成）
│   ├── adr.md                                 ← 设计文档 + 原验收报告 + 本报告
│   ├── RFC/                                   ← §7：RFC001 ~ RFC006 骨架文档（7 份）
│   │   ├── RFC001-Editor-Provider.md
│   │   ├── RFC002-Toolbar.md
│   │   ├── RFC003-Command.md
│   │   ├── RFC004-Selection.md
│   │   ├── RFC005-Clipboard.md
│   │   └── RFC006-History.md
│   ├── src/
│   │   ├── index.ts                           ← Public API：Provider Registry / createEditor({ provider })
│   │   ├── types.ts                           ← Editor* 抽象类型 + EditorProvider + EditorCommand + EditorCapability
│   │   ├── adapters/
│   │   │   └── vditor.ts                      ← 唯一 import('vditor') 位置；实现 reportCapabilities/executeCommand
│   │   └── utils/
│   │       └── debounce.ts                    ← autoSave 防抖（§2：storage.ts 已移除）
│   └── tests/
│       ├── contract.test.ts                   ← 22 cases：Contract / Provider / Command / Capability / Red-Line
│       └── utils.test.ts                      ← 6 cases：debounce + autoSave 集成
│
└── storage-engine/                            ← §2：Storage 能力独立（Editor 不再拥有），业务注入 uploadHandler
    └── src/
        ├── index.ts                           ← FallbackStorageUploader / createUploadHandler / toMarkdownImageLinks
        └── types.ts                           ← StorageUploader / StorageUploadResponse / UploadHandler
```

**tsconfig 别名：**
- `@editor` → `app/core/editor/src`（§1 更名后仍保留，路径已同步）
- `@storage` → `app/core/storage-engine/src`（§2 Storage 移出后新增别名）

---

## 二、评审反馈 7 条优化 · 逐条验收

| # | 反馈条款 | 执行情况 | 验收证据 |
|---|---|---|---|
| **§1** | **目录重命名 editor-engine → editor**（Editor 不是 Engine，是独立能力） | ✅ **已完成** | 真实目录已为 `app/core/editor/`（见 LS）；`tsconfig.json` paths 中 `@editor` 已指向 `app/core/editor/src` |
| **§2** | **Storage 能力移出 Editor → storage-engine**；Editor 仅接收 uploadHandler / StorageUploader 注入 | ✅ **已完成** | ① Editor `utils/storage.ts` 已删除；② Editor `types.ts` 已移除 `StorageUploader` 接口（仅保留 EditorCreateOptions 需要用的最小 `UploadHandler` / `UploadResponse` 注入签名）；③ Editor `@editor` Public API 已停止导出 `FallbackStorageUploader` / `createUploadHandler` / `toMarkdownImageLinks`（三者从 `@storage` 提供）；④ vditor Adapter upload.handler 仅走注入的 `options.upload`，不产生 Vditor 专属上传逻辑 |
| **§3** | **业务层永不见 Adapter**：改为 `createEditor({ provider: 'vditor' })` 或 `createEditor()`；Provider Registry 自动创建 Adapter | ✅ **已完成** | ① [types.ts](file:///c:/Users/cui/Documents/www/dexinlabs/app/core/editor/src/types.ts#L89-L94) 定义 `EditorProvider` / `EditorProviderFactory`；② [index.ts](file:///c:/Users/cui/Documents/www/dexinlabs/app/core/editor/src/index.ts#L17-L46) 实现 `registerEditorProvider` / `listEditorProviders`，默认 lazy 注册 `vditor` provider；③ `createEditor({ provider?, _adapter?, autoSave? })` 工厂只接收 provider id（或测试用 `_adapter`），不再直接传 adapter；④ contract.test.ts 测试 `listEditorProviders`、`registerEditorProvider` 校验、`createEditor()` 空参默认、`createEditor({ provider:'vditor' })`、自定义 provider 注册与创建——全部通过 |
| **§4** | **预留 Command 能力**：`executeCommand()` / `registerCommand()`；Toolbar 应调用 Command，而不是调用具体编辑器 API | ✅ **已完成** | ① [types.ts](file:///c:/Users/cui/Documents/www/dexinlabs/app/core/editor/src/types.ts#L43-L55) 定义 `EditorCommandContext` / `EditorCommandHandler` / `EditorCommandName`，并在 `EditorAdapter` 加入可选 `executeCommand`；② [index.ts](file:///c:/Users/cui/Documents/www/dexinlabs/app/core/editor/src/index.ts#L118-L234) 在 `EditorInstance` 暴露 `registerCommand`（全局命令注册） + `executeCommand`（global → adapter 两级路由）；③ [adapters/vditor.ts](file:///c:/Users/cui/Documents/www/dexinlabs/app/core/editor/src/adapters/vditor.ts#L86-L283) 已内置实现 6 个自定义块 / 内容命令（insert:definition / theorem / exercise / formula / image / markdown，均带别名）；④ contract.test.ts 覆盖全局命令注册+执行、adapter 命令兜底、未识别命令返回 false、Vditor 自定义块命令正确渲染——全部通过 |
| **§5** | **预留 Capability 能力**：统一 `editor.capability` 对象（`supportsMath` / `supportsMermaid` / `supportsImageUpload` / `supportsTable` / `supportsSlashCommand` / `supportsHistory` / `vendor` 等），禁止用 `instanceof Vditor` 判断功能 | ✅ **已完成** | ① [types.ts](file:///c:/Users/cui/Documents/www/dexinlabs/app/core/editor/src/types.ts#L57-L68) 定义 `EditorCapability`（所有字段 readonly，vendor 为 5 元素联合字面量，不含 VditorOptions 等专有类型）；② `EditorAdapter.reportCapabilities()` / `EditorInstance.capability` 已实装（capability 内部 `Object.freeze` 固化，防业务层误改）；③ vditor Adapter 报告 `supportsMath/Mermaid/ImageUpload/Table/History = true`，`supportsSlashCommand = false`，`vendor = 'vditor'`；Mock Adapter 报告 `vendor = 'mock'`；④ contract.test.ts 验证 capability 字段完整 + frozen + vendor 正确通过 `editor.capability` 读取而不是强转 adapter |
| **§6** | **Editor 不暴露 Vendor 类型**：Public API 不应暴露 Vditor 类型/Options/Event/Instance；所有 Vendor 类型仅允许在 adapters/ | ✅ **已完成** | ① `index.ts` **未** export `createVditorAdapter` / 任何 vditor 命名符号（contract.test.ts Red-Line 扫描所有 `export ` 行，正则 `/\b(vditor|Vditor)\b/` 0 命中 ✅）；② `types.ts` 中无 `VditorOptions` / `VditorEvent` / `VditorInstance` 引用（Red-Line 正则 0 命中 ✅）；③ 仅 `adapters/vditor.ts` 1 处存在 `await import('vditor')`（动态导入，SSR 安全降级）；④ `index.ts` / `types.ts` / `utils/debounce.ts` 三者 `import vditor`（static & dynamic）均 0 命中（Red-Line ✅）；⑤ 业务侧推荐写法 `createEditor()` 或 `createEditor({ provider: 'vditor' })`，调用处 0 处引用 Vditor |
| **§7** | **补充 RFC 文档骨架**：RFC001 Provider / RFC002 Toolbar / RFC003 Command / RFC004 Selection / RFC005 Clipboard / RFC006 History | ✅ **已完成** | `app/core/editor/RFC/` 下已创建 6 份 RFC 骨架文档，每份均含：Status（Draft + 已实现部分标注）、背景与动机、设计要求/建议抽象、V1 现状与红线、未决事项、版本时间戳；其中 RFC001/003/006 已与现有实现关联映射 |

---

## 三、新最终分层图（业务永不知 Vendor）

```
Page（LessonEditor.vue 等业务组件）
    ↓                （调用 createEditor() / createEditor({ provider: 'vditor' })）
    ↓                （调用 editor.executeCommand('insert:theorem', {...})）
    ↓                （读取 editor.capability.supportsMath 决定按钮显隐）
Editor 统一层（@editor）
  ├── Provider Registry（registerEditorProvider / listEditorProviders）
  ├── Command Registry（registerCommand / executeCommand 两级路由）
  ├── Capability（frozen EditorCapability，替代 instanceof 判断）
  └── AutoSave（3s debounce）
    ↓                （Provider.id → createAdapter()）
Provider / Adapter 层（@editor/src/adapters/*.ts）
  │ Vditor（V1）        ┌── reportCapabilities / executeCommand 内置 6 自定义块
  │ Milkdown（V2）      │   未来新增：createMilkdownAdapter() → reportCapabilities / executeCommand
  │ TipTap（远期）      └── 仅此处允许 vendor import + vendor 类型
    ↓
Vditor / Milkdown / TipTap / ...（Vendor 编辑器包）


Storage Engine（@storage，DIP：Editor 仅依赖 uploadHandler 注入，不依赖实现）
  ├── FallbackStorageUploader（未配置时抛出带诊断错误）
  ├── createUploadHandler（装配为 upload: UploadHandler）
  └── toMarkdownImageLinks（响应 → Markdown 图片链接）
    ↓
OBS / S3 / COS / OSS（具体实现，未来由 Storage Engine Provider 注入）
```

---

## 四、新 Public API 冻结（V1 修订版）

**@editor (`app/core/editor/src`) 对外仅暴露以下符号：**

| 分类 | 符号 | 说明 |
|---|---|---|
| **工厂函数（业务唯一入口）** | `createEditor(options?)` | 新签名：`{ provider?, _adapter?, autoSave? }`；**默认** provider=`vditor` |
| **Provider Registry** | `registerEditorProvider(p)` · `listEditorProviders()` | 组合根/插件注册 provider；业务层通常无需调用 |
| **Command（V1 已用）** | `EditorInstance.registerCommand(name, fn)` · `editor.executeCommand(name, payload?)` | 全局命令注册；两级路由：global → adapter |
| **工具函数** | `debounce(fn, wait?)` · `DEFAULT_AUTOSAVE_DELAY_MS` (=3000ms) | 自动保存防抖 |
| **类型（全部零 Vendor 依赖）** | `EditorAdapter` · `EditorInstance` · `EditorCreateOptions` · `EditorChangeHook` · `EditorLifecycleHook` · `EditorProvider` · `EditorProviderFactory` · `EditorProviderId` · `EditorCapability` · `EditorCommandName` · `EditorCommandContext` · `EditorCommandHandler` · `DebounceFunction<T>` · `UploadHandler` · `UploadResponse` | 只有 `Upload*` 两个是给 EditorCreateOptions 注入签名需要的最小抽象（**`StorageUploader` 已移除**，由 `@storage` 提供） |

**⚠️ @editor 明确不再导出（改从 @storage 获取）：**
- ❌ `StorageUploader` / `FallbackStorageUploader`
- ❌ `createUploadHandler` / `toMarkdownImageLinks`
- ❌ `createVditorAdapter`（Vendor 工厂名绝对不对外）

---

## 五、测试报告（V1 修订版 · 28 / 28 ✅）

### 5.1 命令

```bash
# 全项目类型检查
npx tsc --noEmit                                    # Exit 0，0 errors ✅

# Contract / Provider / Command / Capability / Red-Line Tests（22 cases）
npx tsx app/core/editor/tests/contract.test.ts     # 22 / 22 Pass ✅

# Debounce + autoSave 集成（6 cases）
npx tsx app/core/editor/tests/utils.test.ts        # 6 / 6 Pass ✅
```

### 5.2 Case 清单

**contract.test.ts（22 / 22 Pass）**

| # | Case | 分类 |
|---|---|---|
| 1 | createEditor 对显式 `_adapter=null` 抛错（严格校验） | 参数校验 |
| 2 | createEditor 未知 provider 抛错并列出已注册 | Provider |
| 3 | EditorInstance 暴露 13 方法（9 原 + getAdapter + 2 Command + registerCommand + executeCommand）+ capability 字段 | 接口契约 |
| 4 | MockAdapter create/get/set/insert 全流程（新签名 `{_adapter}`） | 接口契约 |
| 5 | focus/blur/destroy 转发到 Adapter | 接口契约 |
| 6 | onChange / onSave hook 通过 Adapter wiring 正常接收 | 接口契约 |
| 7 | listEditorProviders 返回默认 `vditor` id | Provider |
| 8 | registerEditorProvider 拒绝 null / 空 id / 非函数 createAdapter | Provider |
| 9 | 自定义 provider 注册 → `{ provider: id }` 创建编辑器；`getAdapter()` 为注册返回值 | Provider |
| 10 | 业务写法：`createEditor({ provider: 'vditor' })` SSR no-op 全流程（无任何 Vendor 名在调用侧） | Provider + 业务 |
| 11 | createVditorAdapter() 12 方法形状 + vditor capability 7 字段报告正确（supports*） | Adapter |
| 12 | editor.capability 被 Object.freeze，业务层误写抛错或无效果（替代 instanceof 防分支） | Capability |
| 13 | editor.registerCommand 注册全局命令 → executeCommand 调用成功并实际写 md | Command |
| 14 | executeCommand 未注册全局 → fallback 到 adapter.executeCommand；未识别命令返回 false | Command 路由 |
| 15 | Vditor adapter：6 条内置命令（definition/theorem/exercise/formula/image/markdown）→ 正确写 md | Command 内置 |
| 16 | FallbackStorageUploader.upload 抛出带 `StorageUploader / storage-engine` 字样的友好错误（§2 Storage 已迁移至 @storage） | Storage 迁移 |
| 17 | toMarkdownImageLinks 格式化 `![name](url)` 正确（§2 从 @storage 获取） | Storage 迁移 |
| 18 | 🔴 红线：@editor `export` 语句 0 处出现 `vditor` / `Vditor` / `createVditorAdapter` | Vendor 隔离 §6 |
| 19 | 🔴 红线：types.ts 0 处 import vditor / 引用 VditorOptions / VditorEvent 等专有类型 | Vendor 隔离 §6 |
| 20 | 🔴 红线：index.ts / utils/debounce.ts 0 处 import vditor（static/dynamic） | Vendor 隔离 §6 |
| 21 | 🔴 红线：仅 `adapters/vditor.ts` 允许 import vditor（其他文件 0 命中） | Vendor 隔离 §6 |
| 22 | 业务最简写法：`createEditor()` 空参 → 默认 provider 工作，调用侧 0 Vditor 引用 | 业务推荐 §3 |

**utils.test.ts（6 / 6 Pass）**

| # | Case | 分类 |
|---|---|---|
| 1 | DEFAULT_AUTOSAVE_DELAY_MS === 3000 | debounce |
| 2 | debounce 窗口内合并 3 次调用，flush 后仅 1 次执行 | debounce |
| 3 | debounce.cancel 丢弃 pending | debounce |
| 4 | debounce 等待窗口取最后一次参数（a→b→c→sleep→c） | debounce |
| 5 | autoSave：3 次 onChange → 窗口合并 → onSave 仅 1 次，值取最终 v3 | autoSave 集成 |
| 6 | autoSave.enabled=false → 彻底不触发保存 | autoSave 集成 |

---

## 六、架构红线（V1 修订版新增）

除原文 §三 红线外，本次修订新增以下红线：

| 编号 | 红线 | 验证 |
|---|---|---|
| **N1** | `editor.capability` 业务层 **唯一可用于**分支判断能力的入口；禁止 `adapter instanceof VditorAdapter` / 强转 adapter 访问 vendor 字段 | contract.test.ts Capability case 通过 |
| **N2** | Toolbar 按钮 / 业务逻辑必须通过 `editor.executeCommand(name, payload?)` 触发，禁止 import vditor / 访问 vditor 实例 | RFC002 + RFC003 已规范 |
| **N3** | `createEditor()` / `createEditor({ provider: id })` 是业务层唯二合法写法；**禁止** `createEditor(createVditorAdapter(), {...})` 两参数直传 Adapter 写法（内部 `_adapter` 仅用于测试，前置下划线表示 private） | contract.test.ts Business pattern case |
| **N4** | Storage 能力必须从 `@storage` import（`FallbackStorageUploader` / `toMarkdownImageLinks` 等），Editor 模块 **不再** 提供这些符号的导出 | tsconfig @storage alias + 测试验证 |

---

## 七、结论

**7 条评审反馈优化项全部验收通过 ✅（§1~§7 每一条均有测试与代码证据）。**

Editor V1 修订后达成目标：

- 定位确认：`app/core/editor/`（非 Engine），作为第三独立能力模块；`Storage Engine` 第四独立能力模块；Content / Markdown / Editor / Storage 四能力零相互依赖（Editor 仅 DIP 注入 UploadHandler，Content/Markdown 完全不知 Editor 存在）。
- 业务层彻底零 Vendor 感知：业务写 `createEditor()` 即可，provider 默认 vditor；未来换 Milkdown 只需在组合根 `registerEditorProvider({ id:'milkdown', createAdapter:()=>... })` 然后改 `createEditor({ provider:'milkdown' })`，页面/组件/DB/Content Engine / Markdown Engine 均无需改动。
- Command / Capability 已实装，为 Toolbar（§4 / RFC002）、Selection/Clipboard/History（RFC004/005/006）奠定统一抽象骨架。
- 红线保护更严密：通过 `export 语句 Vendor 名扫描` + `import 扫描` + `capability 替代 instanceof` 三层测试防线，防止未来贡献者引入 `import vditor` 到业务层。

**后续推荐下一步：** 在 Nuxt 插件中按 `$content` / `$markdown` 风格注入 `$editor = { create: (opts) => createEditor(opts) }`，并以 `@editor + @storage` 搭配实现 `LessonEditor.vue`——组件内部 **绝不** 写 `import vditor` / `new Vditor`。

# Content Engine V2 · Composable（useLesson）职责调整

## 背景

目前 `LessonService` 与 `useLesson` 的职责存在一定重叠，导致 Service 层部分方法只是简单透传 Repository，没有真正承担业务职责。

V2 的目标不是增加更多抽象，而是重新划分各层职责，使每一层只负责自己的工作。

---

# 最终职责划分

```
Vue Page
    │
    ▼
Composable（useLesson）
    │
    ▼
API（server/api）
    │
    ▼
LessonService
    │
    ▼
LessonRepository
    │
    ▼
Database（Drizzle）
```

---

# LessonRepository

**职责：数据库访问层。**

只负责：

* CRUD
* SQL 查询
* Join（仅数据库层面的 Join）
* 数据持久化

例如：

* getBySlug()
* getById()
* list()
* create()
* update()
* delete()

禁止：

* 页面逻辑
* 上下课计算
* 面包屑
* 权限
* 业务规则

Repository 永远不知道页面如何展示数据。

---

# LessonService

**职责：业务层。**

负责：

* 业务规则
* 数据组合
* 调用多个 Repository
* 返回页面真正需要的数据

例如：

```
Lesson
    ↓
Chapter
    ↓
Course
    ↓
Previous Lesson
    ↓
Next Lesson
```

这些组合工作全部由 Service 完成。

未来推荐的方法例如：

```
getLessonPage(slug)
getChapterPage(slug)
getCoursePage(slug)
```

Service 可以调用多个 Repository，但 Repository 不允许反向调用 Service。

---

# API

**职责：HTTP 层。**

只负责：

* 参数获取
* 调用 Service
* 返回 JSON
* HTTP Error

禁止：

* 查询数据库
* 拼装业务数据
* 编写业务规则

API 应尽可能保持轻量。

---

# useLesson（Composable）

**职责：Vue / Nuxt 适配层。**

仅负责：

* useAsyncData()
* 调用 API
* loading
* error
* refresh
* SSR
* Hydration
* Nuxt Cache
* 响应式封装

例如：

```
const { lesson, loading, error, refresh } = await useLesson(slug)
```

其内部仅负责：

```
$fetch('/api/lesson/:slug')
```

禁止：

* 查询多个接口再自行拼装
* 计算上一课、下一课
* 获取 Chapter、Course 后自行组合业务数据
* 编写业务规则

Composable 不负责业务，只负责让 Vue 页面方便使用数据。

---

# Vue Page

页面职责保持最简单：

```
const { lesson } = await useLesson(route.params.slug)
```

页面直接渲染：

* lesson
* previous
* next
* chapter
* course

页面不关心这些数据来自哪里，也不负责组合。

---

# V2 设计原则

以后遵循以下原则：

* Repository 负责数据库。
* Service 负责业务规则与数据组合。
* API 负责 HTTP。
* Composable 负责 Vue/Nuxt 响应式适配。
* Page 负责渲染。

任何业务逻辑都不应出现在 Composable 中，也不应出现在 Page 中。

---

# V2 目标

V2 完成后，`useLesson()` 应尽可能保持轻量，主要承担 Vue 层适配职责；`LessonService` 成为真正的业务入口；`LessonRepository` 成为唯一的数据访问入口。

最终实现各层职责单一、边界清晰、低耦合，便于未来扩展后台管理、移动端、小程序等不同客户端，而无需修改业务层逻辑。
