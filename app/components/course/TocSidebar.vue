<!--
  ============================================================
  【自动注册名】<TocSidebar>
    注册原理：nuxt.config.ts 配置 srcDir = 'app/' 且 components.dirs = '~/components'
    Nuxt 自动扫描 app/components/**/*.vue，按目录路径+文件名 PascalCase 转换
    本文件路径：app/components/course/TocSidebar.vue → 注册名：TocSidebar
    （Toc = Table of Contents，文档目录/大纲）
  ============================================================
  【Props 概览】
    items     字段名：items     类型：TocItem[] | undefined   必填：否   默认值：undefined
      子字段：
        id     string            对应标题 DOM 元素 id 属性（锚点）
        text   string            目录项显示的标题文本
        depth  2 | 3             标题层级，仅支持 h2(depth=2) 和 h3(depth=3)
                                  h3 项样式追加 toc-sidebar__item--h3 类增加缩进
    isMobile  字段名：isMobile  类型：boolean | undefined    必填：否   默认值：undefined
      true 时追加 toc-sidebar--mobile 修饰类：静态定位 + 白底边框，显示关闭按钮
      false/undefined 时为桌面端：sticky 定位 + 无关闭按钮
  ============================================================
  【Emit 事件】
    close 事件名：close   参数：无（void）   触发时机：移动端关闭按钮点击（@click="$emit('close')"）
          作用：通知父组件隐藏/销毁 TocSidebar（如抽屉模式下关闭抽屉容器）
  ============================================================
  【引用方搜索结果】
    ① docs/README.md:84 — 架构文档中列出组件位置说明（目录侧边栏）
    ② 实际页面引用：暂未搜索到 <TocSidebar 标签调用（待集成到课时详情页右侧）
    预期使用方：课时详情页 /course/[chapter]/[lesson].vue 右侧，展示 ContentRenderer 渲染出的 Markdown 目录
  ============================================================
  【数据流向】
    父组件 → props(items, isMobile) → TocSidebar
      ↑                                    ↓
      │                              ① 点击目录项 → scrollTo()
      │                                → document.getElementById(id).scrollIntoView()
      │                                → 平滑滚动到对应标题
      │                              ② 滚动监听 onScroll()
      │                                → 遍历 .markdown-body h2/h3
      │                                → 更新 activeId ref
      │                                → 匹配项高亮 --active
      │                              ③ 移动端关闭按钮
      │                                → emit('close') → 父组件处理
      │
      数据来源 items：@nuxt/content 的 ContentRenderer 提取的目录（toc 数据）
                     或使用 document.querySelectorAll 手动提取后传入
      isMobile 来源：useWindowSize() / useMediaQuery() composable 判断视口宽度
  ============================================================
  TocSidebar 组件 - 目录侧边栏
  功能说明：
  - 从渲染内容中提取的标题（h2、h3）组成的目录列表
  - 支持点击目录项平滑滚动到对应标题位置
  - 监听页面滚动，自动高亮当前可视区域对应的目录项
  - 移动端模式下显示关闭按钮，通过 emit 通知父组件关闭
  - h3 级标题有额外的缩进，体现层级关系
-->
<template>
  <!-- TOC 根容器：动态 class 绑定 toc-sidebar--mobile 修饰类 -->
  <!-- isMobile=true（移动端）：position:static + 白底 + 边框圆角 + 关闭按钮 -->
  <!-- isMobile=false/undefined（桌面端）：position:sticky; top:80px + 最大高度 100vh-100px + 可滚动 -->
  <div class="toc-sidebar" :class="{ 'toc-sidebar--mobile': isMobile }">
    <!-- 侧边栏头部容器：flex 两端对齐布局，桌面端仅显示标题，移动端多一个关闭按钮 -->
    <div class="toc-sidebar__header">
      <!-- TOC 标题：固定文案"目录"，小号大写字母样式 -->
      <h3 class="toc-sidebar__title">目录</h3>
      <!-- 移动端关闭按钮：仅当 isMobile 为 truthy 时渲染（v-if 条件） -->
      <!-- @click 点击触发：调用 $emit('close') 向父组件发送 close 事件，无参数 -->
      <!-- 父组件需监听 @close 来处理隐藏/销毁侧边栏（如抽屉收起） -->
      <button v-if="isMobile" class="toc-sidebar__close" @click="$emit('close')">
        <!-- SVG 关闭叉号图标：stroke-linecap="round" 圆角线条 -->
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M12 4L4 12M4 4l8 8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
      </button>
    </div>
    <!-- 目录列表导航容器：nav 语义化标签，垂直排列目录链接项 -->
    <nav class="toc-sidebar__list">
      <!-- 遍历 items 数组渲染每个目录链接项 -->
      <!-- :key 使用 item.id（标题 DOM id，唯一）保证列表 Diff 性能 -->
      <!-- :href 原生锚点 #${id}：即使 JS 禁用时也能降级跳转 -->
      <!-- 动态 class 数组：
           ① toc-sidebar__item--h${item.depth}：按标题层级追加 --h2 或 --h3 类，h3 增加缩进
           ② toc-sidebar__item--active：activeId === item.id 时高亮激活项 -->
      <!-- @click.prevent：阻止 a 标签原生跳转（否则地址栏 URL 变 #xxx），调用自定义 scrollTo 方法 -->
      <a
        v-for="item in items"
        :key="item.id"
        :href="`#${item.id}`"
        class="toc-sidebar__item"
        :class="[
          `toc-sidebar__item--h${item.depth}`,
          { 'toc-sidebar__item--active': activeId === item.id }
        ]"
        @click.prevent="scrollTo(item.id)"
      >
        <!-- 目录项显示文本：绑定 item.text（标题文案） -->
        {{ item.text }}
      </a>
    </nav>
  </div>
</template>

<script setup lang="ts">
// ============================================================
// 【组件声明】Vue 3 <script setup> 语法糖
// 组件名自动推导：从文件名 TocSidebar.vue 推导为 PascalCase "TocSidebar"
// Nuxt 全局注册：配合 nuxt.config.ts 的 components.dirs 配置，无需手动 import
// ============================================================

/**
 * 目录侧边栏组件：展示页面标题目录，支持点击跳转和滚动高亮
 * @component TocSidebar
 */

// ============================================================
// 【外部依赖 import】
// ref：Vue 3 组合式 API，创建响应式基础类型引用（本组件存 activeId）
// onMounted / onUnmounted：Vue 3 生命周期钩子，注册/销毁滚动事件监听
// ============================================================
import { ref, onMounted, onUnmounted } from 'vue'

// ============================================================
// 【接口定义 TocItem】单条目录项数据结构
//   id: string      — 对应页面中 <h2 id="xxx"> / <h3 id="xxx"> 的 id 属性
//                     用作 scrollTo() 查找 DOM 元素的 key，也是 v-for :key
//   text: string    — 目录项展示的标题文本（直接渲染到 <a> 标签内容）
//   depth: 2 | 3    — 标题层级，联合类型仅允许 2 或 3（h2 / h3）
//                     值 2：toc-sidebar__item--h2（无额外缩进）
//                     值 3：toc-sidebar__item--h3（padding-left 增加缩进）
// ============================================================
interface TocItem {
  id: string
  text: string
  depth: 2 | 3
}

// ============================================================
// 【Props 声明】使用泛型 defineProps<T>() 语法
// ----------
// 字段 items：
//   字段名：items
//   类型：TocItem[] | undefined（数组或 undefined）
//   必填：否（? 可选修饰符）
//   默认值：undefined（未传入时 v-for 遍历 undefined 不渲染项）
//   每项子字段说明：参见上方 TocItem 接口定义
// ----------
// 字段 isMobile：
//   字段名：isMobile
//   类型：boolean | undefined
//   必填：否（? 可选修饰符）
//   默认值：undefined（等价于 false，走桌面端样式分支）
//   作用：① 根容器 class 动态追加 toc-sidebar--mobile
//         ② v-if 控制关闭按钮渲染
// ============================================================
defineProps<{
  items?: TocItem[]
  isMobile?: boolean
}>()

// ============================================================
// 【Emit 事件声明】使用泛型 defineEmits<T>() 语法
//   事件名：close
//   参数：[] 空数组，表示 emit 时不传递任何参数（$emit('close') 无第二参）
//   触发时机：template 中移动端关闭按钮 @click="$emit('close')"
//   父组件监听方式：<TocSidebar @close="handleClose" />
// ============================================================
defineEmits<{
  close: []
}>()

// ============================================================
// 【响应式状态 activeId】当前高亮目录项的 id
// 类型：ref<string>，初始值为空字符串 ''（无高亮项）
// 更新时机：onScroll() 滚动事件处理函数中，遍历可视区域内标题后赋值
// 模板使用：动态 class 绑定 { 'toc-sidebar__item--active': activeId === item.id }
// ============================================================
const activeId = ref('')

// ============================================================
// 【函数 scrollTo(id)】点击目录项时平滑滚动到对应标题位置
// 参数 id：string — 目标标题 DOM 元素的 id 属性值（与 TocItem.id 对应）
// 执行流程：
//   1. document.getElementById(id) — 通过 id 查找目标标题 DOM 元素
//   2. 若元素存在（if (el)）→ 调用原生 scrollIntoView() API
//      - behavior: 'smooth' — 浏览器原生平滑滚动动画（非瞬间跳变）
//      - block: 'start' — 滚动后元素顶部对齐视口顶部
//   3. 若元素不存在（id 错误或未渲染）→ 静默不处理，无报错
// ============================================================
function scrollTo(id: string) {
  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

// ============================================================
// 【函数 onScroll()】window 滚动事件处理函数
// 作用：根据当前滚动位置，计算哪个标题在视口顶部附近，更新 activeId
// 执行流程：
//   1. document.querySelectorAll<HTMLHeadingElement> — 查找 Markdown 渲染区内所有 h2/h3
//      选择器 '.markdown-body h2, .markdown-body h3'：
//        仅在 @nuxt/content ContentRenderer 渲染出的 .markdown-body 容器内查找，
//        避免影响页面其他位置的 h2/h3（如页脚 Hero 标题）
//   2. 初始化 current = ''（无匹配项时清空高亮）
//   3. 遍历所有找到的标题元素，从上到下依次判断：
//      heading.getBoundingClientRect().top <= 100
//        → 元素顶部距离视口顶部 ≤ 100px 时，认为已滚动到该标题位置
//        → 覆盖 current = heading.id，继续遍历（后面的项会覆盖前面的，最终保留最后一个符合条件的）
//   4. 循环结束后，activeId.value = current，Vue 响应式更新模板中的 class --active
//      实现"当前阅读位置对应的目录项高亮"效果
// ============================================================
function onScroll() {
  const headings = document.querySelectorAll<HTMLHeadingElement>('.markdown-body h2, .markdown-body h3')
  let current = ''
  for (const heading of headings) {
    if (heading.getBoundingClientRect().top <= 100) {
      current = heading.id
    }
  }
  activeId.value = current
}

// ============================================================
// 【生命周期钩子 onMounted】组件挂载到 DOM 后执行
// 操作：向 window 全局注册 scroll 事件监听器
//   - 回调：onScroll（上方定义的滚动处理函数）
//   - options: { passive: true } — 被动事件监听，告知浏览器回调中不会调用 preventDefault()
//     提升滚动性能（避免阻塞主线程的滚动流畅度），现代浏览器滚动事件最佳实践
// ============================================================
onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
})

// ============================================================
// 【生命周期钩子 onUnmounted】组件销毁前执行
// 操作：从 window 移除 scroll 事件监听器，防止内存泄漏
//   - 必须移除与 onMounted 中相同的回调函数引用（同一个 onScroll 闭包）
//   - 若不移除：组件多次挂载/销毁后会积累多个监听器，每个都执行，重复计算且性能下降
// ============================================================
onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
})
</script>

<style scoped>
.toc-sidebar {
  position: sticky;
  top: 80px;
  max-height: calc(100vh - 100px);
  overflow-y: auto;
}

.toc-sidebar--mobile {
  position: static;
  max-height: none;
  background-color: var(--color-bg-white);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-lg);
}

.toc-sidebar__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-md);
}

.toc-sidebar__title {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.toc-sidebar__close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  color: var(--color-text-secondary);
  transition: all 0.2s ease;
}

.toc-sidebar__close:hover {
  background-color: var(--color-bg-secondary);
  color: var(--color-text-primary);
}

.toc-sidebar__list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.toc-sidebar__item {
  display: block;
  padding: var(--spacing-xs) var(--spacing-sm);
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  text-decoration: none;
  border-radius: var(--border-radius-sm);
  transition: all 0.2s ease;
  line-height: 1.5;
}

.toc-sidebar__item:hover {
  color: var(--color-primary);
  background-color: var(--color-primary-light);
}

.toc-sidebar__item--active {
  color: var(--color-primary);
  font-weight: 600;
  background-color: var(--color-primary-light);
}

.toc-sidebar__item--h3 {
  padding-left: var(--spacing-md);
}
</style>
