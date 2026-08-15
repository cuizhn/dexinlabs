<template>
  <div :class="wrapperClass">
    <slot name="header" />

    <div class="body">
      <slot name="body-start" />

      <template v-if="blocks && blocks.length">
        <component
          :is="componentFor(block)"
          v-for="block in blocks"
          :key="block.id || block.type"
          :block="block"
        />
      </template>

      <slot v-else name="empty" />

      <slot name="body-end" />
    </div>

    <slot name="footer" />
  </div>
</template>

<script setup lang="ts">
/**
 * ContentRenderer - AST 驱动的内容渲染器
 *
 * 接收 Lesson AST 的 Block 列表，按 Block 类型分发到对应的 Vue 组件。
 * 每个 Block 组件负责自身的渲染和样式。
 *
 * 支持通过插槽自定义：
 * - header: 内容区顶部
 * - body-start: 正文开始前
 * - body-end: 正文结束后
 * - footer: 内容区底部
 * - empty: blocks 为空时展示
 *
 * 架构决策：standards/LESSON_AST.md §6.5
 */
import type { Block } from '@shared/lessonAST'

/** Block 组件映射表 — 延迟导入避免循环依赖 */
import ParagraphBlock from './blocks/ParagraphBlock.vue'
import HeadingBlock from './blocks/HeadingBlock.vue'
import ImageBlock from './blocks/ImageBlock.vue'
import ListBlock from './blocks/ListBlock.vue'
import TableBlock from './blocks/TableBlock.vue'
import FormulaBlock from './blocks/FormulaBlock.vue'
import CodeBlock from './blocks/CodeBlock.vue'
import QuoteBlock from './blocks/QuoteBlock.vue'
import HintBlock from './blocks/HintBlock.vue'
import DefinitionBlock from './blocks/DefinitionBlock.vue'
import ExampleBlock from './blocks/ExampleBlock.vue'
import QuestionBlock from './blocks/QuestionBlock.vue'
import SectionBlock from './blocks/SectionBlock.vue'
import DividerBlock from './blocks/DividerBlock.vue'

const props = withDefaults(
  defineProps<{
    /** Lesson AST 的 Block 列表 */
    blocks?: Block[]
    /** 主题样式 */
    theme?: string
  }>(),
  {
    blocks: () => [],
    theme: 'default'
  }
)

/** Block 类型 → Vue 组件映射 */
const COMPONENT_MAP: Record<string, unknown> = {
  paragraph: ParagraphBlock,
  heading: HeadingBlock,
  image: ImageBlock,
  list: ListBlock,
  table: TableBlock,
  formula: FormulaBlock,
  code: CodeBlock,
  quote: QuoteBlock,
  hint: HintBlock,
  definition: DefinitionBlock,
  example: ExampleBlock,
  question: QuestionBlock,
  section: SectionBlock,
  divider: DividerBlock
}

/** 根据 Block 类型返回对应的 Vue 组件 */
function componentFor(block: Block) {
  return COMPONENT_MAP[block.type] || ParagraphBlock
}

const wrapperClass = computed(() => [
  'renderer',
  `theme-${props.theme}`
])
</script>

<style scoped>
@import "~/assets/css/typography.css";
@import "~/assets/css/math.css";

.renderer {
  color: inherit;
}

.body {
  line-height: 1.8;
}
</style>
