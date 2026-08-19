# DexinLabs 项目代码检查报告

- **日期**：2026-08-19
- **范围**：`app/`、`server/`、`shared/`、`tools/`、`scripts/`，以及 `package.json`、`nuxt.config.ts`、`drizzle.config.ts`、`eslint.config.mjs`、`vitest.config.ts`
- **方法**：静态结构扫描 + 依赖引用核验 + 运行 ESLint 与 vue-tsc 类型检查 + git 状态核对

---

## 一、总体结论

**健康度：良好（B+）。** 类型安全、数据库层、内容 AST 契约、发布接口鉴权都做得很扎实；核心链路（DB → Service → API → AST Renderer）结构清晰、可维护性强。

但存在 **两类需要尽快处理的中高风险**：

1. **依赖图已损坏**——8 个包在源码中完全未被引用（死依赖），且 `markdown-it` 本体缺失却保留了它的两个插件（若被引用会直接崩溃）。
2. **内容编译器管线在仓库内断裂**——`tools/content-compiler/` 目录为空，而 `.gitignore` 与架构决策（ADR）都声明它应承载编译器源码。

这两点相互印证：基于 `unified`/`remark` 的 markdown→AST 编译器很可能已被移除/外置，但依赖与文档没同步清理。

---

## 二、核心指标

| 指标 | 结果 |
|------|------|
| 源码规模 | ~7,778 行（`.ts` + `.vue`，app/server/shared） |
| 文件数 | app 81 / server 9 / shared 2（含测试 2 个） |
| 类型检查（vue-tsc --noEmit） | ✅ 0 错误 |
| ESLint | ⚠️ 15 错误 / 4 警告 |
| 单元测试 | 2 文件（`publish.test.ts`、`slug.test.ts`）未在本轮执行 |
| 死依赖 | 8 个（见第四节） |
| 未提交改动 | 3 文件（Divider/Header/index.vue）；未跟踪 `compile/`、`public/shot-*.png` |
| 待办（TODO） | 1 处（GlobalSearch 搜索逻辑） |

---

## 三、🟢 正向亮点

- **类型检查零错误**：`strict: true` 下 vue-tsc 通过，类型纪律好。
- **数据库层规范**：`app/database/schema.ts` 五表（Course→Topic→Chapter→Lesson + Exercise）关系、`uniqueIndex`、`onDelete` 级联、UTC 时间戳都完整；连接池按 Serverless 自适应（`max=1` / `idleTimeoutMillis`），注释清晰。
- **发布接口安全**：`server/api/content-package/index.post.ts` 用 `x-publish-token === PUBLISH_TOKEN` 做严格鉴权，发布走 DB 事务 UPSERT，错误分级（400/401/500）且对客户端隐藏内部细节。
- **AST 契约清晰**：`shared/lessonAST.ts` 作为单一事实源，语义/渲染分离、行内结构（Inline[]）设计合理，文档引用到位。
- **配置完备**：`nuxt.config.ts` 主题防闪烁脚本、字体/别名/组件前缀配置到位；`eslint.config.mjs` 正确忽略工具产物。

---

## 四、🔴🟡 发现与风险（按严重度）

### 🔴 高 — 内容编译器管线断裂
- `tools/content-compiler/` **目录为空**（0 文件）。但 `.gitignore` 注释明确写“`tools/content-compiler/` 等源码应入库，保证全新 clone 可复现内容编译环境”，且架构决策 ADR-0013/0014 描述其用 `unified`+`remark` 把 markdown 编译为 AST。
- 配套现象：`unified`、`remark-parse`、`remark-gfm`、`remark-math`、`remark-directive` 在全部已提交源码中**均无引用**（见依赖扫描）。
- **推断**：仓库内的 markdown→AST 编译器已丢失/外置，内容发布实际依赖外部 `dexinlabs-content` 仓库（`scripts/publish-content.mjs` 读取 `../dexinlabs-content/output/content-package.json`）。
- **影响**：新 clone 无法在本地复现内容编译；ADR 与 `.gitignore` 与现状不符，易误导接手者。
- **建议**：二选一——① 把编译器源码补回 `tools/content-compiler/`；② 若已永久外置，更新 ADR/`.gitignore` 注释说明现状，并删掉已无用的 `unified`/`remark-*` 依赖。

### 🔴 高 — 依赖图损坏（死依赖 + 缺失本体）
在 `app/server/shared/tools` 中完全未被引用的包（共 8 个，均列在 `dependencies`）：

| 包 | 状态 |
|----|------|
| `markdown-it-container` | 死依赖（且 `markdown-it` 本体不在 deps） |
| `markdown-it-mathjax3` | 死依赖（同上） |
| `remark-directive` | 死依赖 |
| `remark-gfm` | 死依赖 |
| `remark-math` | 死依赖 |
| `remark-parse` | 死依赖 |
| `unified` | 死依赖 |
| `vitepress` | 未在已提交源码引用（可能为 gitignored 的 `lessons/` 预览工具所用，需确认） |

额外问题：**`markdown-it` 本体未声明**，但 `markdown-it-container`/`markdown-it-mathjax3` 是它的插件——若未来误被 import 会直接抛 “Cannot find module 'markdown-it'”。当前因未被引用而“侥幸”无事。
**影响**：安装体积膨胀、CI 变慢、掩盖真实依赖边界、埋下运行时崩溃隐患。
**建议**：`npm uninstall` 上述死依赖；如确有遗留 markdown 渲染需求，先补 `markdown-it` 本体。

### 🟡 中 — ESLint 未达标（15 错误 / 4 警告）
- **`any` 滥用（11 处）**：`publish.test.ts`(6)、`publish.ts`(2)、`content-package/index.post.ts`(3)。应替换为具体类型或 `unknown` + 守卫。
- **未用变量**：`HomeLearningPath.vue:4` 的 `v-for` 循环变量 `i`；`publish.ts:25-26` 的 `PgDatabase`/`PgTransaction`/`DbInstance` 三个未用导入（应从 import 中删除）。
- **死 directive**：`content-package/index.post.ts:84` 的 `eslint-disable-next-line no-console` 实际未触发（no-console 未启用），属无效注释。
- **样式/属性告警**：`GlobalSearch.vue`、`NodeMark.vue` 属性顺序；`FormulaBlock.vue` 的 `v-html`（见下条安全提示）。

### 🟡 中 — `playwright` 依赖归类错误
`playwright` 被放进 `dependencies`，但它**只在 `scripts/*.mjs` 截图脚本**里用，不在运行时链路。应移至 `devDependencies`，避免生产镜像拉取无谓的浏览器二进制。

### 🟡 中 — `.gitignore` 缺口
- `compile/` 目录：`.gitignore` 仅忽略 `compile/output/`，但根级 `compile/` 含截图等产物；项目记忆明确“`compile/` 不入库”。应整体忽略 `compile/`。
- `public/shot-desktop.png` / `public/shot-mobile.png` **未跟踪**：截图误放入 `public/`，会被随站点部署出去。应移到 `compile/` 或加入忽略。
- 当前未提交：3 个文件改动（近期 zed.dev 竖线布局工作）、`compile/`、`public/shot-*.png`。

### 🟢 低 — 安全提示（FormulaBlock v-html）
`app/components/content/blocks/FormulaBlock.vue` 用 `v-html` 渲染 KaTeX 输出。当前 LaTeX 来自受信任的 DB 内容，风险低；但需确认 KaTeX 保持默认 `trust: false`（禁用 `\href` 等危险指令）。若未来内容来源扩展到用户提交，须加清洗/沙箱。

### 🟢 低 — 未实现功能 & console 残留
- `app/components/app/GlobalSearch.vue:100` 有 `TODO: 实现搜索逻辑`——搜索框目前为空壳（`:102` 还有一处调试 `console.log`）。
- 源码中 26 处 `console.*`，多数为 `seed-v4.ts` 种子脚本（可接受），少量如 GlobalSearch 调试 log 建议清理。

---

## 五、建议行动清单（按优先级）

| 优先级 | 行动 | 命令/位置 |
|--------|------|-----------|
| P0 | 清理 8 个死依赖 | `npm uninstall markdown-it-container markdown-it-mathjax3 remark-directive remark-gfm remark-math remark-parse unified vitepress` |
| P0 | 修复/澄清内容编译器管线 | 补回 `tools/content-compiler/` 或更新 ADR + 移除 `unified`/`remark-*` |
| P1 | `playwright` 移入 devDependencies | 编辑 `package.json` |
| P1 | 修复 lint 错误 | `npm run lint:fix` 处理属性顺序；手动改 `any`→具体类型、删未用导入、修 `HomeLearningPath` 的 `i` |
| P1 | 修正 `.gitignore` | 忽略 `compile/`（全目录）；处理 `public/shot-*.png` |
| P2 | 运行并确认测试 | `npm test`（注意 publish 测试可能依赖 DB/外部包） |
| P2 | 清理调试 console + 实现/隐藏搜索 | `GlobalSearch.vue` |

---

## 六、复现命令

```bash
npm run typecheck        # vue-tsc --noEmit → 0 错误
npm run lint             # eslint . → 15 错误 / 4 警告
npm run test             # vitest run
npm run drizzle:check    # 校验迁移与 schema 一致
```

> 说明：本轮未执行 `npm test` 与 `nuxt build`（避免依赖外部 DB / 触发已知构建卡死问题），仅做静态与 lint/typecheck 核查。

---

## 七、执行状态（2026-08-19 更新 — 已处理）

用户确认 `tools/content-compiler/` 已迁移其他项目、8 个包为零引用死依赖，授权安全删除。已执行：

| 项 | 操作 | 结果 |
|----|------|------|
| 8 个死依赖 | `npm uninstall markdown-it-container markdown-it-mathjax3 remark-directive remark-gfm remark-math remark-parse unified vitepress` | ✅ 移除 204 个包（含传递依赖）；`package.json` dependencies 现为 `drizzle-orm / katex / nuxt / pg / playwright` |
| `tools/content-compiler/` | 删除空目录 | ✅ 已不存在 |
| 类型检查 | `npm run typecheck` | ✅ 0 错误，运行链路无碍 |
| 源码引用复核 | 全仓 grep `import ... from 'unified\|remark-\|markdown-it\|vitepress'` | ✅ 无任何源码 import 残留 |

**遗留可选项 — 已于本轮（14:54 起）全部处理**：
- ✅ `playwright` 已移入 `devDependencies`（仅 `scripts/` 截图脚本使用）。
- ✅ `@types/mdast` 已从 `devDependencies` 移除（无源码引用，原服务于已删的 remark/mdast 管线）。
- ✅ `standards/LESSON_AST.md` 已于 2026-08-18 写明“Compiler 已迁移至 `dexinlabs-content/compiler/`”；本轮另在 `standards/handbook/01-ARCHITECTURE.md` 技术栈表补注 unified/remark 属外部仓库、主仓不含。
- ✅ `.gitignore` 中 `tools/content-compiler/` 相关注释已更新为“编译器已外置”说明。

**最终 `package.json` 状态**：`dependencies` = `drizzle-orm / katex / nuxt / pg`（4 个）；`devDependencies` 含 `playwright` 等（无死依赖）。`npm run typecheck` 复核 0 错误。
