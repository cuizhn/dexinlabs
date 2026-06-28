<!--
  组件文件名：FeatureGrid.vue
  Nuxt自动注册组件名：HomeFeatureGrid
  被引用页面：app/pages/index.vue（首页，第103行 <HomeFeatureGrid />）
  Props 字段列表：
    - features: { type: Array, required: false, default: () => [] }
      功能卡片数据列表（注意：组件内部已硬编码 features 数据，props 未实际使用）
  Emits：无（未使用 defineEmits）
  CSS 变量引用：
    --spacing-lg / --spacing-2xl / --spacing-xl / --spacing-md / --spacing-sm: 间距变量
    --color-bg-secondary: Features 区域背景色
    --color-bg-white: 功能卡片背景色（白色）
    --color-border: 卡片边框色
    --color-primary: 卡片悬停边框色、图标主色
    --color-primary-light: 区域标签背景色（淡紫色）
    --color-text-primary: 区域标题、功能标题文字颜色
    --color-text-secondary: 区域描述、功能描述文字颜色
    --border-radius-xl / --border-radius-md: 圆角大小
    --shadow-lg: 卡片悬停阴影
-->
<!-- Features 核心优势区域：展示平台的五大特色功能 -->
   <template>
    <section class="landing__features">
      <div class="landing__section-inner">
        <div class="landing__section-header">
          <span class="landing__section-tag">核心优势</span>
          <h2 class="landing__section-title">为数学学习<br/>量身打造</h2>
          <p class="landing__section-desc">不只是视频和文字，而是真正可交互的学习体验</p>
        </div>

        <!-- 功能卡片网格：大卡片占3列，中卡片占2列 -->
        <div class="landing__features-grid">
          <div v-for="(feat, i) in features" :key="i" class="landing__feature" :class="`landing__feature--${feat.size}`">
            <div class="landing__feature-icon" :style="{ backgroundColor: feat.bg }">
              <span>{{ feat.icon }}</span>
            </div>
            <h3 class="landing__feature-title">{{ feat.title }}</h3>
            <p class="landing__feature-desc">{{ feat.desc }}</p>
          </div>
        </div>
      </div>
    </section>
</template>
<script setup>
/**
 * 平台核心优势功能列表组件：展示平台的五大特色功能
 * @component HomeFeatureGrid
 */
// import: ref 来自 'vue'，Vue 3 组合式 API，用于创建响应式变量（此组件导入后未实际使用）
import { ref } from 'vue'

// defineProps: 定义组件接收的 props，数据类型为 Object（返回值类型为 Readonly<{ features: Array }>）
//   注意：此处声明的 props.features 未在 template 中使用，组件实际使用下方硬编码的 features 数组
const props = defineProps({
  /** 功能卡片数据列表 */
  features: { type: Array, default: () => [] },
})
// features: 硬编码的功能卡片数据数组，数据类型 Array<Object>，包含5个功能项对象
//   每个对象结构：
//     - icon: string, emoji 图标字符
//     - title: string, 功能标题
//     - desc: string, 功能详细描述
//     - size: string, 卡片尺寸 'lg'（大）或 'md'（中）
//     - bg: string, 图标背景色（十六进制颜色值）
const features = [
  {
    icon: '📐',
    title: '系统化课程',
    desc: '从代数几何到概率统计，完整覆盖中学数学知识体系，每个阶段都有清晰的学习目标和路径规划',
    size: 'lg',
    bg: '#EEF2FF',
  },
  {
    icon: '✏️',
    title: '交互式练习',
    desc: '单选题、填空题等多种题型，即时判题反馈，边学边练巩固知识',
    size: 'md',
    bg: '#ECFDF5',
  },
  {
    icon: '📊',
    title: '学习追踪',
    desc: '实时记录学习进度，可视化展示知识掌握程度',
    size: 'md',
    bg: '#FFF7ED',
  },
  {
    icon: '🔬',
    title: '公式渲染',
    desc: 'KaTeX 驱动的数学公式渲染，让复杂的数学表达式清晰呈现',
    size: 'md',
    bg: '#FDF2F8',
  },
  {
    icon: '📱',
    title: '多端适配',
    desc: '响应式设计，手机、平板、电脑随时随地学习',
    size: 'lg',
    bg: '#F0F9FF',
  },
]

</script>
<style scoped>
/* ==================== 全局布局 ==================== */
/* 落地页根容器：隐藏水平溢出 */
.landing {
  overflow-x: hidden;
}

/* 通用内容区域容器：限制最大宽度并居中 */
.landing__section-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-lg);
}

/* 通用区域标题组：限制宽度并设置底部间距 */
.landing__section-header {
  max-width: 480px;
  margin-bottom: var(--spacing-2xl);
}

/* 区域标签（如"核心优势"、"课程体系"）：胶囊形小标签 */
.landing__section-tag {
  display: inline-block;
  padding: 4px 12px;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-primary);
  background-color: var(--color-primary-light);
  border-radius: 100px;
  margin-bottom: var(--spacing-md);
}

/* 区域大标题 */
.landing__section-title {
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--color-text-primary);
  line-height: 1.15;
  margin-bottom: var(--spacing-md);
}

/* 区域描述文字 */
.landing__section-desc {
  font-size: 1.0625rem;
  color: var(--color-text-secondary);
  line-height: 1.7;
}

/* ==================== Hero 主视觉区域 ==================== */
/* Hero 区域：全屏高度，弹性布局居中 */
.landing__hero {
  position: relative;
  min-height: calc(100vh - 64px);
  display: flex;
  align-items: center;
  padding: var(--spacing-2xl) var(--spacing-lg);
  overflow: hidden;
}

/* Hero 背景层：绝对定位覆盖整个区域 */
.landing__hero-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

/* 背景网格线：淡紫色细线网格，径向渐变遮罩 */
.landing__hero-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(79, 70, 229, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(79, 70, 229, 0.03) 1px, transparent 1px);
  background-size: 60px 60px;
  mask-image: radial-gradient(ellipse 70% 60% at 30% 50%, black 30%, transparent 80%);
  -webkit-mask-image: radial-gradient(ellipse 70% 60% at 30% 50%, black 30%, transparent 80%);
}

/* 背景光晕效果：模糊圆形渐变 */
.landing__hero-glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
}

/* 光晕1：左上角紫色光晕 */
.landing__hero-glow--1 {
  width: 600px;
  height: 600px;
  top: -15%;
  left: -10%;
  background: rgba(79, 70, 229, 0.08);
}

/* 光晕2：右下角青色光晕 */
.landing__hero-glow--2 {
  width: 400px;
  height: 400px;
  bottom: -10%;
  right: 5%;
  background: rgba(6, 182, 212, 0.06);
}

/* 浮动数学符号：通过 CSS 变量控制位置和动画参数 */
.landing__hero-symbol {
  position: absolute;
  left: var(--x);
  top: var(--y);
  font-size: var(--size);
  color: var(--color-primary);
  font-weight: 700;
  transform: rotate(var(--rotate));
  animation: symbol-float var(--duration) ease-in-out var(--delay) infinite alternate;
  pointer-events: none;
  font-family: var(--font-mono);
}

/* 浮动符号上下浮动动画 */
@keyframes symbol-float {
  0% { transform: rotate(var(--rotate)) translateY(0); }
  100% { transform: rotate(var(--rotate)) translateY(-14px); }
}

/* Hero 左侧内容区：限制宽度并与页面内容区左对齐 */
.landing__hero-content {
  position: relative;
  z-index: 2;
  max-width: 560px;
  margin-left: max(calc((100vw - 1200px) / 2 + var(--spacing-lg)), var(--spacing-lg));
}

/* 状态徽章：胶囊形，带脉冲动画小圆点 */
.landing__hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 16px;
  background-color: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  border-radius: 100px;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-xl);
  box-shadow: var(--shadow-sm);
}

/* 徽章小圆点：绿色脉冲呼吸灯效果 */
.landing__hero-badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: var(--color-success);
  animation: dot-pulse 2s ease-in-out infinite;
}

/* 小圆点脉冲动画 */
@keyframes dot-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

/* Hero 主标题：大号粗体 */
.landing__hero-title {
  font-size: 4rem;
  font-weight: 800;
  line-height: 1.08;
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-lg);
  letter-spacing: -0.02em;
}

/* 标题强调文字：主色到辅色渐变 */
.landing__hero-title-accent {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Hero 描述文字 */
.landing__hero-desc {
  font-size: 1.125rem;
  color: var(--color-text-secondary);
  line-height: 1.75;
  margin-bottom: var(--spacing-xl);
}

/* 操作按钮组 */
.landing__hero-actions {
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-2xl);
}

/* 通用按钮基础样式：圆角、内边距、过渡动画 */
.landing__btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 28px;
  border-radius: var(--border-radius-md);
  font-weight: 600;
  font-size: 0.9375rem;
  text-decoration: none;
  transition: all 0.25s ease;
}

/* 主要按钮：紫色渐变背景，白色文字 */
.landing__btn--primary {
  background: linear-gradient(135deg, var(--color-primary), #6366F1);
  color: #fff;
  box-shadow: 0 4px 14px rgba(79, 70, 229, 0.3);
}

/* 主要按钮悬停：上移并加深阴影 */
.landing__btn--primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(79, 70, 229, 0.4);
}

/* 幽灵按钮：白底带边框 */
.landing__btn--ghost {
  background-color: var(--color-bg-primary);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}

/* 幽灵按钮悬停：边框变主色 */
.landing__btn--ghost:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background-color: var(--color-primary-light);
}

/* 大号按钮：用于 CTA 区域 */
.landing__btn--lg {
  padding: 16px 36px;
  font-size: 1rem;
}

/* 统计数据行：水平排列，带分隔线 */
.landing__hero-stats {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
}

/* 单个统计项：数字+标签垂直排列 */
.landing__hero-stat {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

/* 统计数字：大号等宽字体 */
.landing__hero-stat-num {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--color-text-primary);
  font-family: var(--font-mono);
}

/* 统计标签：小号浅色文字 */
.landing__hero-stat-label {
  font-size: 0.8125rem;
  color: var(--color-text-light);
}

/* 统计项之间的竖线分隔符 */
.landing__hero-stat-divider {
  width: 1px;
  height: 32px;
  background-color: var(--color-border);
}

/* ==================== Hero 右侧视觉卡片 ==================== */
/* 右侧视觉区域：绝对定位在右侧，垂直居中 */
.landing__hero-visual {
  position: absolute;
  right: max(calc((100vw - 1200px) / 2 + var(--spacing-lg)), var(--spacing-lg));
  top: 50%;
  transform: translateY(-50%);
  width: 360px;
  z-index: 1;
}

/* 课程进度卡片：毛玻璃效果，带滑入动画 */
.landing__hero-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md) var(--spacing-lg);
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: var(--border-radius-lg);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.06);
  margin-bottom: var(--spacing-md);
  animation: card-slide-in 0.6s ease-out both;
}

/* 三张卡片依次错位排列，动画延迟递增 */
.landing__hero-card--1 { animation-delay: 0.2s; margin-left: 0; }
.landing__hero-card--2 { animation-delay: 0.4s; margin-left: 40px; }
.landing__hero-card--3 { animation-delay: 0.6s; margin-left: 16px; }

/* 卡片从右侧滑入动画 */
@keyframes card-slide-in {
  from { opacity: 0; transform: translateX(30px); }
  to { opacity: 1; transform: translateX(0); }
}

/* 卡片图标：圆角方块，白色文字 */
.landing__hero-card-icon {
  width: 44px;
  height: 44px;
  border-radius: var(--border-radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  font-weight: 700;
  color: #fff;
  flex-shrink: 0;
}

/* 三张卡片图标的渐变背景色 */
.landing__hero-card--1 .landing__hero-card-icon { background: linear-gradient(135deg, #8B5CF6, #6366F1); }
.landing__hero-card--2 .landing__hero-card-icon { background: linear-gradient(135deg, #06B6D4, #0891B2); }
.landing__hero-card--3 .landing__hero-card-icon { background: linear-gradient(135deg, #10B981, #059669); }

/* 卡片文字区域 */
.landing__hero-card-body {
  flex: 1;
  min-width: 0;
}

/* 卡片课程名称标签 */
.landing__hero-card-label {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-text-primary);
  display: block;
  margin-bottom: 6px;
}

/* 进度条背景轨道 */
.landing__hero-card-bar {
  height: 4px;
  background-color: var(--color-bg-secondary);
  border-radius: 2px;
  overflow: hidden;
}

/* 进度条填充：渐变色，带增长动画 */
.landing__hero-card-fill {
  height: 100%;
  border-radius: 2px;
  background: linear-gradient(90deg, var(--color-primary), var(--color-secondary));
  animation: fill-grow 1.2s ease-out 0.8s both;
}

/* 进度条增长动画：从0宽度到目标宽度 */
@keyframes fill-grow {
  from { width: 0 !important; }
}

/* 数学公式展示卡片：毛玻璃效果，展示导数定义公式 */
.landing__hero-equation {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: var(--spacing-md) var(--spacing-lg);
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: var(--border-radius-lg);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
  font-family: var(--font-mono);
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  animation: card-slide-in 0.6s ease-out 0.8s both;
  margin-left: 60px;
}

/* 公式中的函数部分：主色高亮 */
.landing__hero-eq-part {
  color: var(--color-primary);
  font-weight: 600;
}

/* 公式中的等号 */
.landing__hero-eq-op {
  font-weight: 700;
  color: var(--color-text-primary);
}

/* 公式中的下标（如 h→0） */
.landing__hero-eq-sub {
  font-size: 0.625rem;
  align-self: flex-end;
  margin-bottom: 2px;
  color: var(--color-text-light);
}

/* 公式中的分数容器：上下排列分子分母 */
.landing__hero-eq-frac {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  line-height: 1.2;
}

/* 分子：带底部边框线 */
.landing__hero-eq-num {
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 2px;
  font-size: 0.75rem;
}

/* 分母 */
.landing__hero-eq-den {
  padding-top: 2px;
  font-size: 0.75rem;
}

/* ==================== Features 核心优势区域 ==================== */
.landing__features {
  padding: 6rem 0;
  background-color: var(--color-bg-secondary);
}

/* 功能卡片网格：6列布局，大卡片跨3列，中卡片跨2列 */
.landing__features-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: var(--spacing-lg);
}

/* 单个功能卡片：白底带边框，悬停上移并高亮边框 */
.landing__feature {
  background-color: var(--color-bg-white);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-xl);
  padding: var(--spacing-xl);
  transition: all 0.3s ease;
}

.landing__feature:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: var(--color-primary);
}

/* 大尺寸卡片：跨3列 */
.landing__feature--lg {
  grid-column: span 2;
}

/* 中尺寸卡片：跨3列 */
.landing__feature--md {
  grid-column: span 2;
}

/* 功能图标：带背景色的圆角方块 */
.landing__feature-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--border-radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.375rem;
  margin-bottom: var(--spacing-md);
}

/* 功能标题 */
.landing__feature-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-sm);
}

/* 功能描述文字 */
.landing__feature-desc {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  line-height: 1.7;
}

/* ==================== Courses 课程体系区域 ==================== */
.landing__courses {
  padding: 6rem 0;
}

/* 课程卡片网格：两列布局 */
.landing__courses-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-lg);
}

/* 课程卡片：横向布局，含图标、标题描述、元信息和箭头 */
.landing__course {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  padding: var(--spacing-xl);
  background-color: var(--color-bg-white);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-xl);
  text-decoration: none;
  color: inherit;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

/* 课程卡片悬停遮罩：淡渐变叠加层 */
.landing__course::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(79, 70, 229, 0.02), rgba(6, 182, 212, 0.02));
  opacity: 0;
  transition: opacity 0.3s ease;
}

.landing__course:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-lg);
  border-color: var(--color-primary);
}

.landing__course:hover::after {
  opacity: 1;
}

/* 课程图标：圆角方块，按难度显示不同渐变色 */
.landing__course-icon {
  width: 56px;
  height: 56px;
  border-radius: var(--border-radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.375rem;
  font-weight: 700;
  color: #fff;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
}

/* 入门级：绿色渐变 */
.landing__course-icon--beginner { background: linear-gradient(135deg, #10B981, #059669); }
/* 进阶级：橙色渐变 */
.landing__course-icon--intermediate { background: linear-gradient(135deg, #F59E0B, #D97706); }
/* 高级级：紫色渐变 */
.landing__course-icon--advanced { background: linear-gradient(135deg, #8B5CF6, #6366F1); }

/* 课程标题和描述区域 */
.landing__course-body {
  flex: 1;
  min-width: 0;
  position: relative;
  z-index: 1;
}

.landing__course-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: 4px;
}

.landing__course-desc {
  font-size: 0.8125rem;
  color: var(--color-text-secondary);
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 课程元信息：章节数和难度标签，右对齐 */
.landing__course-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
}

/* 章节数文字 */
.landing__course-chapters {
  font-size: 0.75rem;
  color: var(--color-text-light);
}

/* 难度标签：胶囊形 */
.landing__course-difficulty {
  padding: 2px 10px;
  border-radius: 100px;
  font-size: 0.6875rem;
  font-weight: 600;
}

/* 入门难度标签：绿色 */
.landing__course-difficulty--beginner {
  background-color: #ECFDF5;
  color: #059669;
}

/* 进阶难度标签：橙色 */
.landing__course-difficulty--intermediate {
  background-color: #FFF7ED;
  color: #D97706;
}

/* 高级难度标签：紫色 */
.landing__course-difficulty--advanced {
  background-color: #EEF2FF;
  color: #6366F1;
}

/* 课程卡片右侧箭头图标：悬停时变主色并右移 */
.landing__course-arrow {
  position: relative;
  z-index: 1;
  color: var(--color-text-light);
  transition: all 0.25s ease;
}

/* 悬停时箭头变主色并右移 */
.landing__course:hover .landing__course-arrow {
  color: var(--color-primary);
  transform: translateX(4px);
}

/* ==================== How 学习方式区域 ==================== */
.landing__how {
  padding: 6rem 0;
  background-color: var(--color-bg-secondary);
}

/* 三步流程网格：三列等宽 */
.landing__how-steps {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-xl);
}

/* 单个步骤卡片：白底带边框，悬停上移 */
.landing__how-step {
  position: relative;
  padding: var(--spacing-xl);
  background-color: var(--color-bg-white);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-xl);
  transition: all 0.3s ease;
}

.landing__how-step:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-lg);
}

/* 步骤编号：大号渐变色数字 */
.landing__how-number {
  font-size: 3rem;
  font-weight: 800;
  font-family: var(--font-mono);
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1;
  margin-bottom: var(--spacing-md);
}

/* 步骤标题 */
.landing__how-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-sm);
}

/* 步骤描述文字 */
.landing__how-desc {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  line-height: 1.7;
}

/* ==================== CTA 行动号召区域 ==================== */
.landing__cta {
  padding: 6rem 0;
}

/* CTA 内部容器：渐变背景，圆角，居中文字 */
.landing__cta-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 4rem var(--spacing-xl);
  background: linear-gradient(135deg, var(--color-primary) 0%, #6366F1 50%, var(--color-secondary) 100%);
  border-radius: var(--border-radius-xl);
  text-align: center;
  position: relative;
  overflow: hidden;
  margin-left: var(--spacing-lg);
  margin-right: var(--spacing-lg);
}

/* CTA 装饰符号：右下角大号半透明 ∑ */
.landing__cta-deco {
  position: absolute;
  right: -20px;
  bottom: -30px;
  font-size: 12rem;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.06);
  line-height: 1;
  pointer-events: none;
}

/* CTA 标题：白色大字 */
.landing__cta-title {
  font-size: 2.25rem;
  font-weight: 800;
  color: #fff;
  margin-bottom: var(--spacing-md);
  position: relative;
}

/* CTA 描述：半透明白色 */
.landing__cta-desc {
  font-size: 1.0625rem;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: var(--spacing-xl);
  position: relative;
}

/* CTA 区域的主要按钮：白底紫字，覆盖默认样式 */
.landing__cta .landing__btn--primary {
  background: #fff;
  color: var(--color-primary);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15);
}

/* CTA 按钮悬停：加深阴影 */
.landing__cta .landing__btn--primary:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

/* ==================== 响应式适配 ==================== */
/* 平板端（≤1024px）：隐藏右侧视觉卡片，调整网格列数 */
@media (max-width: 1024px) {
  .landing__hero-visual {
    display: none;
  }

  .landing__hero-content {
    margin-left: 0;
    max-width: 600px;
  }

  .landing__hero-title {
    font-size: 3rem;
  }

  .landing__features-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .landing__feature--lg {
    grid-column: span 2;
  }

  .landing__feature--md {
    grid-column: span 1;
  }

  .landing__courses-grid {
    grid-template-columns: 1fr;
  }
}

/* 手机端（≤768px）：缩小标题，调整布局为纵向 */
@media (max-width: 768px) {
  .landing__hero {
    min-height: auto;
    padding: var(--spacing-2xl) var(--spacing-md);
    padding-top: 3rem;
  }

  .landing__hero-title {
    font-size: 2.25rem;
  }

  .landing__hero-desc {
    font-size: 1rem;
  }

  .landing__hero-actions {
    flex-direction: column;
  }

  .landing__hero-stats {
    gap: var(--spacing-md);
  }

  .landing__hero-stat-num {
    font-size: 1.25rem;
  }

  .landing__section-inner {
    padding: 0 var(--spacing-md);
  }

  .landing__section-title {
    font-size: 1.75rem;
  }

  .landing__features {
    padding: 4rem 0;
  }

  .landing__features-grid {
    grid-template-columns: 1fr;
  }

  .landing__feature--lg,
  .landing__feature--md {
    grid-column: span 1;
  }

  .landing__courses {
    padding: 4rem 0;
  }

  .landing__course {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-md);
    padding: var(--spacing-lg);
  }

  .landing__course-meta {
    flex-direction: row;
    align-items: center;
  }

  .landing__course-arrow {
    display: none;
  }

  .landing__how {
    padding: 4rem 0;
  }

  .landing__how-steps {
    grid-template-columns: 1fr;
  }

  .landing__cta-inner {
    margin-left: var(--spacing-md);
    margin-right: var(--spacing-md);
    padding: 3rem var(--spacing-lg);
  }

  .landing__cta-title {
    font-size: 1.75rem;
  }
}

/* 小屏手机端（≤480px）：进一步缩小字号和间距 */
@media (max-width: 480px) {
  .landing__hero-title {
    font-size: 1.875rem;
  }

  .landing__hero-badge {
    font-size: 0.75rem;
    padding: 4px 12px;
  }

  .landing__btn {
    padding: 10px 20px;
    font-size: 0.875rem;
    justify-content: center;
  }

  .landing__hero-stats {
    flex-wrap: wrap;
    gap: var(--spacing-sm);
  }

  .landing__hero-stat-divider {
    display: none;
  }

  .landing__hero-stat {
    flex-direction: row;
    gap: 6px;
    align-items: center;
  }

  .landing__section-title {
    font-size: 1.5rem;
  }

  .landing__cta-title {
    font-size: 1.5rem;
  }

  .landing__cta-deco {
    font-size: 8rem;
  }
}
</style>