// ============================================================
// 【文件定位】types.d.ts
//  作用：TypeScript 环境声明文件（Ambient Declaration File，.d.ts 后缀）
//  加载时机：TypeScript 编译器启动时自动加载（根据 tsconfig.json include: [] 配置）
//  运行时行为：本文件无任何可执行 JS 代码，仅为编译器提供类型提示，编译后完全擦除，不影响 bundle
//  本文件两大块：
//    ① declare global {}        —  向全局作用域注入类型（CollectionQueryBuilder 接口、queryCollection 函数）
//    ② declare module '@nuxt/schema' {} —  向 @nuxt/schema 模块注入类型扩展（NuxtConfig 接口合并）
// ============================================================
// 【为什么不用删？将来 nuxi prepare 也不冲突？】
//  答：
//  1. 声明合并（Declaration Merging）机制：
//     TypeScript 中同名 interface 是"合并"关系而非"覆盖"关系。
//     即使 Nuxt 未来在 @nuxt/schema 包内官方定义了 NuxtConfig.content 接口，
//     与我们这里手写的扩展也是字段合并叠加，不会冲突（除非字段名完全相同且类型不兼容）。
//     [key: string]: unknown 索引签名进一步提供了容错性，允许任意额外字段。
//  2. .d.ts 声明文件运行时零体积：
//     nuxi prepare 命令的产物（.nuxt 目录下的类型文件）也是 ambient declaration，
//     多个 .d.ts 文件共存时 TypeScript 会合并它们，没有运行时代码冲突问题。
//  3. 全局类型仅在编译期存在：
//     declare global 声明的 CollectionQueryBuilder 和 queryCollection 仅在 tsc 校验阶段存在，
//     真正的实现由 @nuxt/content 模块在运行时注入（或 server/api 端手动实现）。
//     nuxi prepare 生成的类型不会删除用户自定义声明，只会在其上补充。
// ============================================================

// ============================================================
// 【declare global】全局作用域类型声明
//  TypeScript 语法：declare global {} 用于向"全局作用域"（Global Scope）扩展类型。
//  注意：必须在"模块文件"中使用（即文件中存在 import / export 语句，本文件底部 export {} 确保这一点）。
//  没有 export 的 .ts/.d.ts 文件被视为"脚本文件"，declare global 在脚本文件中无效。
// ----------
//  本块声明两部分：
//    ① interface CollectionQueryBuilder<T> —  内容集合查询构造器链式 API 接口
//    ② function queryCollection<T>(event, collection) —  工厂函数，返回上述构造器
// ============================================================
declare global {
  // ============================================================
  // 【CollectionQueryBuilder 接口】
  //  设计模式：查询构造器模式（Query Builder）+ 链式调用（Fluent Interface）
  //  所有 where/order/sort/limit/skip 方法返回 this（即自身引用），因此可以 .where().order().limit().first() 链式调用
  // ----------
  //  泛型参数：
  //    T = Record<string, unknown> — 查询结果的条目类型，默认任意字典对象
  //    调用时可显式指定泛型，例如 queryCollection<Chapter>(event, 'chapter') 返回 CollectionQueryBuilder<Chapter>
  //    此时 first() 返回 Promise<Chapter | null>，all() 返回 Promise<Chapter[]>，类型安全
  // ----------
  //  各方法签名：
  //    where(field, operator, value): this — 条件过滤（WHERE）
  //      field: string     — 字段名（如 'slug'、'order'）
  //      operator: string  — 比较运算符（如 '=='、'!='、'>'、'<'、'contains'）
  //      value: unknown    — 比较值（任意类型，根据 operator 解释）
  //      返回 this：可继续链式调用
  //    order(field, direction?): this — 排序（ORDER BY），与 sort 功能相同的别名
  //      field: string              — 排序字段名
  //      direction?: 'ASC' | 'DESC' — 升序/降序，可选，默认 'ASC'
  //      返回 this
  //    sort(field, direction?): this — 排序别名，与 order 等价
  //      参数同 order
  //    limit(n: number): this — 限制返回数量（LIMIT）
  //      n: number — 返回条目最大数量
  //      返回 this
  //    skip(n: number): this — 跳过前 N 条（OFFSET），通常与 limit 配合实现分页
  //      n: number — 跳过条数
  //      返回 this
  //    first(): Promise<T | null> — 终端方法：执行查询并返回第一条结果
  //      返回 Promise<T | null>：异步 Promise，有数据时 resolve T（泛型），无数据时 resolve null
  //    all(): Promise<T[]> — 终端方法：执行查询并返回全部结果数组
  //      返回 Promise<T[]>：异步 Promise，resolve 结果数组（空集合时为 [] 空数组）
  // ============================================================
  interface CollectionQueryBuilder<T = Record<string, unknown>> {
    // where：条件过滤方法，字段名 + 运算符 + 值，返回 this 继续链式
    where(field: string, operator: string, value: unknown): this
    // order：排序（ORDER BY），方向可选 ASC/DESC，默认 ASC
    order(field: string, direction?: 'ASC' | 'DESC'): this
    // sort：order 别名，功能一致，提供两种命名习惯
    sort(field: string, direction?: 'ASC' | 'DESC'): this
    // limit：限制返回条数（LIMIT N）
    limit(n: number): this
    // skip：跳过前 N 条（OFFSET N），配合 limit 做分页
    skip(n: number): this
    // first：执行查询，返回首条结果（Promise，无结果为 null）
    first(): Promise<T | null>
    // all：执行查询，返回全部结果数组（Promise，无结果为 []）
    all(): Promise<T[]>
  }

  // ============================================================
  // 【queryCollection 全局函数】
  //  作用：Server API 端（server/api/**/*.ts）的内容查询工厂函数，
  //        传入当前事件对象和集合名，返回 CollectionQueryBuilder 查询构造器
  //  设计：与 @nuxt/content v3 Server 端 queryCollection API 对齐
  // ----------
  //  泛型参数：
  //    T = Record<string, unknown> — 查询结果条目类型，默认任意对象
  //    显式传 <T> 则 first()/all() 返回类型为 T 约束，否则 unknown
  // ----------
  //  函数参数：
  //    event: unknown      — H3/Nuxt Server 事件对象（H3Event），
  //                          底层 server/api 路由处理函数的首个参数（defineEventHandler((event) => { ... })）
  //                          传 unknown 是为了不强依赖 H3 具体类型（避免强制 import h3）
  //    collection: string  — 内容集合名，对应 content.config.ts 中 collections 的 key：
  //                          'chapter' | 'lesson' | 'exercise'
  // ----------
  //  返回值：
  //    CollectionQueryBuilder<T> — 查询构造器实例，可继续链式 where/order/limit，最终 first()/all() 执行
  // ============================================================
  function queryCollection<T = Record<string, unknown>>(
    // event：H3 Server 事件对象（defineEventHandler 的第一个参数），类型兼容用 unknown
    event: unknown,
    // collection：集合名，如 'chapter' / 'lesson' / 'exercise'
    collection: string
  // 返回查询构造器，泛型 T 决定结果条目类型
  ): CollectionQueryBuilder<T>
}

// ============================================================
// 【declare module '@nuxt/schema'】模块接口扩展
//  TypeScript 语法：declare module '模块名' {} 用于对已存在的模块进行"声明增强"（Module Augmentation）。
//  原理：声明合并（Declaration Merging）
//    @nuxt/schema 包本身已经 export 了 interface NuxtConfig {...}
//    我们这里再次 declare module '@nuxt/schema'，在其中写同名 interface NuxtConfig，
//    TypeScript 编译器会将两个同名 interface 的成员"合并"在一起（字段叠加）。
//    这是 TypeScript 官方支持的模块扩展模式，广泛用于扩展第三方库类型。
//  为什么要扩展？
//    Nuxt 官方 NuxtConfig 接口没有声明 content 字段的详细子结构，
//    @nuxt/content 模块通常通过 nuxi prepare 自动生成类型，但在某些环境（未 prepare 前）类型会缺失。
//    手写扩展保证即使在未运行 nuxi prepare 时，nuxt.config.ts 中 content: {...} 字段也能有完整类型提示。
// ----------
//  本块声明：
//    interface NuxtConfig.content — 新增/扩展 NuxtConfig 的 content 配置子结构
// ============================================================
declare module '@nuxt/schema' {
  // ============================================================
  // 【NuxtConfig 接口扩展（Module Augmentation）】
  //  新增可选顶层字段 content?: {...}，描述 @nuxt/content 模块的配置项结构
  //  所有字段均为可选（?）+ 末尾 [key: string]: unknown 索引签名，
  //  保证与未来 @nuxt/content 官方类型合并时不会冲突（允许任意未声明的键）
  // ----------
  //  content 子键概览：
  //    experimental  — 实验性特性（sqliteConnector、watch 等）
  //    build         — 构建参数（markdown.remarkPlugins/rehypePlugins/toc、highlight 等）
  //    sources       — 内容源配置（多数据源/远程源）
  //    documentDriven — 文档驱动模式开关/配置
  //    navigation    — 导航菜单自动生成配置
  //    search        — 内置搜索功能配置
  //    api           — Content Server API 配置（baseURL 等）
  //    [key: string]: unknown — 允许额外键，避免官方新增字段时报类型错
  // ============================================================
  interface NuxtConfig {
    // content：@nuxt/content 模块顶层配置对象（可选，不使用模块时不存在）
    content?: {
      // content.experimental：实验性特性集合（Beta/Preview）
      experimental?: {
        // experimental.sqliteConnector：SQLite 连接器开关（见 nuxt.config.ts content.experimental.sqliteConnector 注释）
        sqliteConnector?: boolean
        // experimental.watch：内容文件监视配置（开发模式热更新相关）
        watch?: {
          // watch.enabled：是否启用文件变更监视（true=保存即热更新内容）
          enabled?: boolean
          // [key: string]: unknown — 其他 watch 相关未来字段的容错索引签名
          [key: string]: unknown
        }
        // [key: string]: unknown — experimental 下其他实验性字段的容错索引签名
        [key: string]: unknown
      }
      // content.build：构建阶段配置
      build?: {
        // build.markdown：Markdown 构建管道配置
        markdown?: {
          // markdown.remarkPlugins：Remark 插件字典（插件名 → 选项对象）
          remarkPlugins?: Record<string, unknown>
          // markdown.rehypePlugins：Rehype 插件字典（插件名 → 选项对象）
          rehypePlugins?: Record<string, unknown>
          // markdown.toc：目录（Table of Contents）自动生成配置
          toc?: Record<string, unknown>
          // markdown.anchorLinks：自动为 h2-h6 标题追加锚点链接（boolean 或详细配置对象）
          anchorLinks?: boolean | Record<string, unknown>
          // [key: string]: unknown — 其他 markdown 构建选项的容错索引签名
          [key: string]: unknown
        }
        // build.highlight：代码块语法高亮配置（Shiki/Prism 等）
        highlight?: Record<string, unknown>
        // [key: string]: unknown — 其他 build 子配置的容错索引签名
        [key: string]: unknown
      }
      // content.sources：额外内容源（远程 GitHub、文件系统其他目录、Headless CMS 等）
      sources?: Record<string, unknown>
      // content.documentDriven：文档驱动模式开关（true 开启或详细配置对象）
      //   开启后内容文件 frontmatter 可决定路由、布局、导航等，类似 VuePress/VitePress
      documentDriven?: boolean | Record<string, unknown>
      // content.navigation：内容导航自动生成配置（自动生成 .navigation.json 供菜单使用）
      navigation?: Record<string, unknown>
      // content.search：内置内容搜索功能配置（本地索引 / Algolia 等）
      search?: Record<string, unknown>
      // content.api：Content Server API 配置
      api?: {
        // api.baseURL：自定义 Content API 基础路径前缀
        baseURL?: string
        // [key: string]: unknown — 其他 api 相关选项（如缓存策略）
        [key: string]: unknown
      }
      // [key: string]: unknown — content 顶层其他字段的通用容错索引签名
      // 关键作用：保证官方版本升级新增字段时，nuxt.config.ts 中写了这些字段不会报"类型不存在"
      [key: string]: unknown
    }
  }
}

// ============================================================
// 【export {}】文件末尾空导出
//  目的：将本 .d.ts 文件标记为"模块文件"（Module），而非"脚本文件"（Script）。
//  TypeScript 规则：
//    - 文件中只要存在 import / export 关键字 → 模块文件（有自己的作用域）
//    - 无 import / export → 脚本文件（所有声明在全局作用域，declare global 语法无效）
//  副作用：此处 export {} 无实际导出值，仅触发模块文件语义。
//  没有此行，上方 declare global 会被 TypeScript 报错：
//    "Augmentations for the global scope can only be directly nested in external modules or ambient module declarations."
// ============================================================
export {}
