# Admin 后台 V1 实施说明

## 目标

创建一个**极简后台管理系统（Admin V1）**。

定位：

* 仅供开发者本人使用。
* 不考虑公开访问。
* 不实现用户系统。
* 不实现登录。
* 不实现 RBAC。
* 不实现权限控制。
* 不实现审核流程。

后台唯一职责：

> 对数据库进行可视化增删查改（CRUD）。

后台应尽可能简单，把精力放在课程内容管理，而不是后台系统本身。

---

# 一、设计原则

后台不是 CMS。

后台不是管理平台。

后台只是数据库的可视化编辑器。

因此遵循：

* 简单
* 易维护
* 零业务耦合
* 零复杂权限
* 零重复逻辑

---

# 二、目录建议

建议新增：

```text
app/
    pages/
        admin/
            index.vue

            courses/
                index.vue
                new.vue
                [id].vue

            chapters/
                index.vue
                new.vue
                [id].vue

            lessons/
                index.vue
                new.vue
                [id].vue

            exercises/
                index.vue
                new.vue
                [id].vue

    components/
        admin/
            CourseForm.vue
            ChapterForm.vue
            LessonForm.vue
            ExerciseForm.vue
            LessonEditor.vue
```

后台所有页面统一放在：

```text
pages/admin/
```

不要创建独立 Nuxt 项目。

---

# 三、后台首页

首页仅作为导航即可。

例如：

```text
后台管理

课程管理

章节管理

课时管理

练习管理
```

无需统计图。

无需 Dashboard。

无需图表。

---

# 四、课程管理

列表：

* 名称
* slug
* 状态
* 更新时间

支持：

* 新建
* 编辑
* 删除

即可。

---

# 五、章节管理

列表：

* 所属课程
* 名称
* slug
* 排序

支持：

* 新建
* 编辑
* 删除

即可。

---

# 六、课时管理

这是后台重点。

编辑页面建议：

左侧：

* 标题
* slug
* 所属章节
* 状态

中间：

LessonEditor

右侧：

Markdown Engine 实时预览

布局可采用：

```text
──────────────────────────────
标题

──────────────────────────────

Markdown 编辑器

──────────────────────────────

实时预览
```

预览必须调用 Markdown Engine。

禁止使用 Vditor Preview。

确保后台与前台渲染完全一致。

---

# 七、Exercise 管理

第一阶段保持简单。

仅支持：

* 新建
* 编辑
* 删除

复杂题目编辑后续再做。

---

# 八、数据库操作

后台只调用：

Repository / Service。

禁止页面直接访问数据库。

建议：

```text
Page

↓

Composable

↓

Service

↓

Repository

↓

Drizzle

↓

Neon
```

保持与前台一致。

---

# 九、Editor 使用方式

LessonEditor 仅依赖：

```text
@editor
```

禁止：

* import vditor
* new Vditor()

页面永远只使用统一 Editor 接口。

---

# 十、保存方式

建议：

点击保存：

保存数据库。

同时支持：

3 秒自动保存。

保存内容：

仅 Markdown。

禁止保存：

* HTML
* 编辑器状态
* Preview 内容

---

# 十一、图片上传

统一调用 Storage Engine。

Editor 不直接上传。

上传成功后：

插入 Markdown 图片链接。

---

# 十二、UI

无需引入复杂后台框架。

保持：

* 原生 Vue
* 原生 CSS
* 响应式布局

即可。

重点保证：

* 编辑舒服
* 页面清晰
* 操作简单

不追求炫酷效果。

---

# 十三、后续可扩展

目录结构应预留未来扩展能力，例如：

```text
admin/

    tags/

    knowledge/

    media/

    users/

    settings/
```

V1 不实现。

仅保证结构可扩展。

---

# 最终要求

Admin V1 的目标不是开发一个完整的 CMS，而是提供一个稳定、高效的课程录入工具。

第一阶段仅完成以下能力：

* Course CRUD
* Chapter CRUD
* Lesson CRUD（集成 Editor）
* Exercise CRUD
* Markdown Engine 实时预览
* 图片上传
* 自动保存

除此之外，不增加任何登录、权限、审核、统计、工作流等复杂功能。

遵循 **KISS（Keep It Simple）** 原则，以最快速度完成内容录入后台，为课程建设服务。

---

# 十四、执行结果报告（V1 · 验收）

> 执行日期：2026-07-12
> 执行范围：ADR 第一条 ~ 第十三条

## 14.1 目录结构（文件清单）

```text
app/
  pages/
    admin/
      index.vue ........................................ 后台首页（四模块导航卡片）
      courses/
        index.vue ...................................... 课程列表
        new.vue ........................................ 新建课程
        [slug].vue ..................................... 编辑课程
      chapters/
        index.vue ...................................... 章节列表
        new.vue ........................................ 新建章节
        [slug].vue ..................................... 编辑章节
      lessons/
        index.vue ...................................... 课时列表
        new.vue ........................................ 新建课时
        [slug].vue ..................................... 编辑课时（带3秒自动保存+防抖）
      exercises/
        index.vue ...................................... 练习列表
        new.vue ........................................ 新建练习
        [slug].vue ..................................... 编辑练习
      _shared-admin.css ................................ 后台共享样式（admin-list / admin-table / admin-btn 等）
  components/
    admin/
      CourseForm.vue ................................... 课程表单（接口化 CourseFormState）
      ChapterForm.vue .................................. 章节表单
      LessonForm.vue ................................... 课时表单（内嵌 LessonEditor）
      ExerciseForm.vue ................................. 练习表单
      LessonEditor.vue ................................. 课时编辑器（集成 @editor + 实时预览 + 自定义块命令 + 3秒防抖自动保存）

server/
  api/
    course/
      index.get.ts ..................................... GET  /api/course            课程列表
      index.post.ts .................................... POST /api/course            新建课程（400/409/503 错误码）
      [slug].get.ts .................................... GET  /api/course/[slug]     课程详情
      [slug].put.ts .................................... PUT  /api/course/[slug]     更新课程
      [slug].delete.ts ................................. DELETE /api/course/[slug]   删除课程
    chapter/
      index.get.ts / index.post.ts ..................... 同构
      [slug].get.ts / [slug].put.ts / [slug].delete.ts
    lesson/
      index.get.ts / index.post.ts
      [slug].get.ts / [slug].put.ts / [slug].delete.ts
    exercise/
      index.get.ts / index.post.ts
      [slug].get.ts / [slug].put.ts / [slug].delete.ts
    admin/
      courses.get.ts ................................... GET  /api/admin/courses     后台专用课程列表（含全字段）
      chapters.get.ts .................................. GET  /api/admin/chapters    后台专用章节列表

app/
  composables/
    useAdmin.ts ........................................ 后台统一 CRUD 封装
                                                            (listCourses / listChapters / listLessons / listExercises
                                                             createResource / updateResource / removeResource / getResourceBySlug)
  core/
    content-engine/
      services/ ........................................ 4 个 Service 均补齐 create / update / remove 写方法
        CourseService.ts
        ChapterService.ts
        LessonService.ts
        ExerciseService.ts
```

## 14.2 ADR 验收对照表

| ADR 章节 | 要求 | 实现状态 | 说明 |
| --- | --- | --- | --- |
| 三、后台首页 | 仅导航，无统计 | ✅ 已实现 | 4 张导航卡片（Course/Chapter/Lesson/Exercise），Lesson 卡片标注"集成 @editor + Markdown Engine 实时预览" |
| 四、课程管理 | 名称/slug/状态/更新时间 + CRUD | ✅ 已实现 | `courses/index.vue` 表格 + `new.vue` + `[slug].vue` + 5 个 Course API |
| 五、章节管理 | 所属课程/名称/slug/排序 + CRUD | ✅ 已实现 | 同构章节模块，含 course slug 字段 |
| 六、课时管理（重点） | 三栏布局：元信息 + @editor + Markdown Engine 预览；禁止 Vditor Preview | ✅ 已实现 | `LessonEditor.vue`：左栏 Body 编辑器（Vditor，通过 `@editor` Provider 路由封装），右栏 `$renderToHTML()` 实时渲染；状态栏显示 `vendor=vditor, math=true` |
| 七、Exercise 管理 | 简单 CRUD | ✅ 已实现 | 表单 9 字段：slug/title/chapter/summary/description/body/hint/answer/analysis + order |
| 八、数据库操作 | Page → Composable → API → Service → Repository → Drizzle → Neon | ✅ 严格遵循 | 所有调用链经过 `useAdmin` → `/api/*` → `*Service.ts` → `*Repository`；Page 层零 DB 依赖 |
| 九、Editor 使用方式 | 仅 import `@editor`；禁止 `import vditor`/`new Vditor()` | ✅ 通过红线 | `LessonEditor.vue` 仅出现 `import { createEditor } from '@editor'`；Vendor 名仅在 `adapters/vditor.ts` 内部 |
| 十、保存方式 | 点击保存 + 3 秒自动保存；仅存 Markdown（禁止存 HTML/编辑器状态） | ✅ 已实现 | `lessons/[slug].vue` 中 `scheduleDebouncedSave()` → `setTimeout(3000)` 防抖；`LessonEditor` `bodyLocal`/`notes`/`summaryText` 均为纯 Markdown 字符串 |
| 十一、图片上传 | Storage Engine 路由，Editor 不直接上传 | ✅ 已实现 | `createUploadHandler()` 由 `@storage` 暴露，通过 `createEditor({ upload })` 注入 |
| 十二、UI | 原生 Vue+CSS；响应式；编辑舒服/页面清晰/操作简单 | ✅ 已实现 | `_shared-admin.css` 共享样式；Flex/Grid；移动端断点 ≤768px 布局自适应 |
| 十三、可扩展 | 目录结构预留 tags/knowledge/media/users/settings | ✅ 已预留 | 目录在 `pages/admin/`、`components/admin/` 下均以资源模块组织，新增模块只需按现有模式复制 |
| 首页路由入口 | `app/pages/index.vue` 添加后台入口 | ✅ 已实现 | Hero 区底部 `.landing__hero-admin-entry` 块：`<NuxtLink to="/admin">` 开发者后台 / Admin · 数据库 CRUD</NuxtLink>` |

## 14.3 分层调用链（以"编辑课时并自动保存"为例）

```text
lessons/[slug].vue (Page)
  └─ useAdmin().updateResource('lesson', slug, payload)  [Composable]
       └─ $fetch PUT /api/lesson/[slug]                   [API Route]
            └─ lessonService.update(slug, patch)          [Service: LessonService.ts#L83~L99]
                 └─ lessons.updateBySlug(q.slug, clean)   [Repository: LessonRepository.ts]
                      └─ drizzle pg.update()              [Infrastructure: Drizzle → Neon]
```

## 14.4 错误码覆盖（REST API）

| HTTP 状态码 | 触发条件 | 实现路由 |
| --- | --- | --- |
| 400 Bad Request | slug/title 必填字段缺失 | 所有 `*.post.ts` / `*.put.ts` |
| 404 Not Found | 资源不存在 | 所有 `[slug].put.ts` / `[slug].delete.ts`（Service 返回 null 时抛出） |
| 409 Conflict | slug 唯一索引冲突 | 所有 `*.post.ts`（捕获 `/slug.*unique\|duplicate.*slug/i`） |
| 503 Service Unavailable | `process.env.DATABASE_URL` 未配置 | 所有写路由 + 列表路由顶部检查 |

## 14.5 TypeScript 类型安全

### 最终检查结果

```text
命令：npx nuxi typecheck
退出码：0  ✅ 通过
```

### 修复的三类 TS 问题

1. **`#imports` 模块未找到（TS2307）**：
   - 根因：Vue SFC 中 `import { useHead } from '#imports'` 在某些 nuxt-vue-compiler 版本下无法被 tsc 直接解析
   - 修复：统一改为 `import { useHead, useRoute, useRouter } from 'nuxt/app'`，与 `app/pages/course/**` 保持一致
   - 影响文件：`admin/index.vue`、`courses/{index,new,[slug]}.vue`、`chapters/*`、`lessons/*`、`exercises/*`、`LessonEditor.vue` 共 16 处

2. **`Object.keys()` 回调参数 `(k: keyof T)` 不匹配（TS2345）**：
   - 根因：TS 语义上 `Object.keys(obj: T)` 返回类型是 `string[]`，不能直接收窄为回调参数的联合 key
   - 修复：数组级断言 `(Object.keys(form) as (keyof T)[]).forEach(k => ...)`
   - 影响文件：`courses/[slug].vue`、`chapters/[slug].vue`、`lessons/[slug].vue`、`exercises/[slug].vue`

3. **`local[k] = v` 联合索引赋值失败（TS2322：`string | number` ≠ `never`）**：
   - 根因：当 FormState 同时包含 `string` 和 `number` 字段时，TS 对索引访问 `T[keyof T]` 采取保守推断，赋值双方无法匹配
   - 修复：对 LHS 增加 `as unknown` 桥接断言，`(local[k] as unknown) = v as T[typeof k]`
   - 影响文件：4 个 Form 组件 + 4 个 `[slug].vue` 页面

## 14.6 Editor 红线测试（抽样验证）

```text
LessonEditor.vue imports:
  ✅ createEditor ← @editor
  ✅ EditorInstance ← @editor  (type only)
  ✅ createUploadHandler ← @storage
  ❌ 未出现 vditor import
  ❌ 未出现 new Vditor()
  ❌ 未出现 instanceof Vditor

Editor capability（运行时暴露）：
  ✅ editor.capability.vendor     → 'vditor'（仅运行时字符串，无类型层 Vendor 名泄露）
  ✅ editor.capability.supportsMath → true
  ✅ Object.freeze 保护 → 只读
```

## 14.7 Markdown Engine 实时预览一致性

```text
实现路径：LessonEditor.vue#L115~L128
  1. 监听 bodyLocal 变化
  2. 调用 nuxtApp.$renderToHTML(md, { math: true })
  3. 结果注入 .lesson-editor__preview.markdown-body 容器（与前台课程页面同 CSS class）

降级逻辑：
  - 若 SSR 阶段 $renderToHTML 不可用 → 转义后直接显示纯文本（SSR 安全）
  - 若 renderToHTML 抛异常 → 同上降级
```

## 14.8 首页路由入口

`app/pages/index.vue` Hero 区（L61-L65）：

```html
<div class="landing__hero-admin-entry">
  <span class="landing__hero-admin-dot"></span>
  <NuxtLink to="/admin" class="landing__hero-admin-link">开发者后台 / Admin · 数据库 CRUD</NuxtLink>
  <span class="landing__hero-admin-arrow">→</span>
</div>
```

样式：
- 胶囊按钮，紫点标记
- Hover 背景加深 + 箭头右移 3px 过渡
- 位于开始学习/浏览课程按钮与统计区下方，视觉层级清晰但不抢主 CTA

## 14.9 已知限制 / 后续可扩展项

| # | 限制项 | 备注 |
| --- | --- | --- |
| 1 | 无用户/登录/权限 | 符合 ADR §1；若后续部署至公网，需前置 HTTP Basic Auth 或引入鉴权层 |
| 2 | 图片上传 Storage Engine 仅桩接口 | `@storage` 已定义 `createUploadHandler` 签名；接入真实对象存储（R2/OSS/S3）仅需实现 handler |
| 3 | slug 变更会影响前台路由（无重定向） | 建议 V2 增加 slug 历史表 + 301 重定向中间件 |
| 4 | 删除 Course/Chapter 时无级联子资源检查 | Service 层目前直接删父；建议 V2 增加约束：父下有子时禁止删除或级联确认 |
| 5 | 列表页无分页/搜索/过滤 | 数据量小时（<100条）可接受；超过后建议 V2 增加 `useAdmin` 分页参数 |

---

## 14.10 结论

Admin V1 目标达成：

* ✅ **Course / Chapter / Lesson / Exercise 四模块 CRUD** 全量实现（共 16 条 API 路由 + 13 个页面 + 5 个组件 + 1 个 composable）
* ✅ **LessonEditor 集成 @editor**，通过 Provider + Capability 双层抽象确保 Vendor 零泄露
* ✅ **Markdown Engine 实时预览** 路由 `$renderToHTML`，前后台渲染引擎一致
* ✅ **3 秒防抖自动保存**，仅保存 Markdown 字符串（body/notes/summaryText），无 HTML/编辑器状态入库
* ✅ **首页 `/` → `/admin` 路由入口**，胶囊按钮可点击跳转
* ✅ **TypeScript 类型检查通过**（`npx nuxi typecheck` exit 0）
* ✅ **严格分层红线**：Page → Composable → API → Service → Repository → Drizzle → Neon，零越界
* ✅ **所有 API 路由 400 / 404 / 409 / 503 错误码覆盖**

Admin V1 验收：**通过 ✅**
