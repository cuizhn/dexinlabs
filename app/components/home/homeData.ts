/**
 * 首页静态展示数据（视觉实验专用）
 *
 * 设计约束（见任务书）：
 * - 仅用于首页视觉实验，不影响业务架构；
 * - lesson 预览内容以真实 Lesson AST（@shared/lessonAST）的 Block[] 形态书写，
 *   交由现有 ContentRenderer 渲染，不重新发明内容格式；
 * - 主题地图沿用真实 4 个主题 slug，链接指向真实课程页；
 * - 内容为得心实验室自有产品语言，非 Zed 文案/素材。
 */
import type { Block, Inline } from '@shared/lessonAST'

/** 行内文本构造器 */
const txt = (value: string): Inline => ({ type: 'text', value })

/**
 * Hero 中的"真实学习界面"——一段真实的 Lesson 内容片段。
 * 仅使用中性块（heading / paragraph / formula / table / list），
 * 刻意避开 definition（品牌色 term）、example（绿色左边框）、question（青色）等带色块，
 * 以保证首页近黑白体系不被破坏。
 */
export const previewLesson: { title: string, blocks: Block[] } = {
  title: '函数为什么存在？',
  blocks: [
    {
      type: 'heading',
      level: 2,
      children: [txt('从一个问题开始')]
    },
    {
      type: 'paragraph',
      children: [txt('一个量发生变化时，另一个量为什么也会随之变化？')]
    },
    {
      type: 'paragraph',
      children: [
        txt('打车时，你发现路程越远，车费越高；等待越久，计费也越多。'),
        txt('两个量之间，似乎存在某种确定的关系。')
      ]
    },
    {
      type: 'formula',
      latex: 'y = f(x)',
      display: true
    },
    {
      type: 'heading',
      level: 3,
      children: [txt('生活中的依赖')]
    },
    {
      type: 'table',
      headers: [[txt('距离 (km)')], [txt('车费 (元)')]],
      rows: [
        [[txt('3')], [txt('16')]],
        [[txt('5')], [txt('20')]],
        [[txt('8')], [txt('26')]]
      ]
    },
    {
      type: 'list',
      ordered: false,
      items: [
        [txt('车费只由距离决定吗？')],
        [txt('等待的时间是否也会计费？')],
        [txt('如果堵车，计费方式会变吗？')]
      ]
    }
  ]
}

/**
 * "正在验证"学习状态——交互式问题（首页原生组件，非 AST QuestionBlock）。
 * 静态演示数据：选择后揭示结果，用于呈现"学习正在发生"的状态。
 */
export const verifyScene = {
  label: '正在验证',
  prompt: '车费会随着哪些因素变化？',
  options: [
    '只和距离有关',
    '只和时间有关',
    '距离和时间都有关',
    '还不清楚'
  ],
  /** 命中"距离和时间都有关"时揭示的理解结论 */
  reveal: '没错。当一个量随另一个量按一定规则变化，它们之间就建立了一种关系——这正是我们为什么需要函数。',
  /** 其他选择的温和提示 */
  hint: '再想想：等待的时间，会不会也会计费？'
}

/**
 * 知识地图——沿用真实 4 个主题的 slug，链接指向真实课程页。
 * 以近黑白文本列呈现，不使用彩色卡片或 emoji 图标。
 */
export const topicMap: { slug: string, title: string, description: string }[] = [
  {
    slug: 'number-and-algebra',
    title: '数与代数',
    description: '有理数、实数、代数式、方程与不等式'
  },
  {
    slug: 'geometry',
    title: '图形与几何',
    description: '三角形、四边形、圆、相似与全等'
  },
  {
    slug: 'statistics-and-probability',
    title: '统计与概率',
    description: '数据分析、统计图表、概率基础'
  },
  {
    slug: 'comprehensive-practice',
    title: '综合与实践',
    description: '数学建模、问题解决、实际应用'
  }
]

/**
 * Features 三联——得心实验室的三个学习理念。
 * 用于 Hero 之下的多列网格区，仿 zed.dev 的 "Fast / Agentic / Collaborative" 结构。
 * 内容为自有产品语言，非 Zed 文案。
 */
export const features: { label: string, title: string, description: string }[] = [
  {
    label: 'WHY',
    title: '理解为先',
    description: '每一个概念，都从"为什么"开始。不是公式堆砌，而是发现问题的过程。'
  },
  {
    label: 'WHAT',
    title: '应用为本',
    description: '从打车计费、储蓄利率到地图测距，数学是理解世界的工具，不是考题。'
  },
  {
    label: 'HOW',
    title: '得心应手',
    description: '猜想 → 验证 → 建立概念 → 迁移反思，让学习像呼吸一样自然发生。'
  }
]

/**
 * 学习路径时间线——展示得心实验室的认知顺序。
 * 仿 zed.dev 的 agent 任务流时间线列表（密集信息 + 时间标签 + 状态点）。
 * 内容为 LDS 认知顺序：发现问题 → 产生需求 → 猜想 → 建立概念 → 定义 → 迁移 → 反思。
 */
export const learningPath: {
  step: string,
  title: string,
  detail: string,
  state: 'done' | 'active' | 'todo'
}[] = [
  {
    step: '01',
    title: '发现问题',
    detail: '打车时车费怎么算？为什么路程越远越贵？',
    state: 'done'
  },
  {
    step: '02',
    title: '产生需求',
    detail: '需要一个工具，描述"一个量随另一个量变化"的关系。',
    state: 'done'
  },
  {
    step: '03',
    title: '猜想',
    detail: '车费 = 起步价 + 单价 × 距离 + 等待费 × 时间',
    state: 'active'
  },
  {
    step: '04',
    title: '建立概念',
    detail: '当一个量随另一个量按规则变化，它们之间就建立了一种关系。',
    state: 'todo'
  },
  {
    step: '05',
    title: '定义',
    detail: '函数：y = f(x)，从集合 A 到集合 B 的对应关系。',
    state: 'todo'
  },
  {
    step: '06',
    title: '迁移',
    detail: '气温随时间变化、身高随年龄增长、价格随供求波动——都是函数。',
    state: 'todo'
  },
  {
    step: '07',
    title: '反思',
    detail: '函数是一种"对应"而非"计算"，它描述关系，不一定要求连续或可导。',
    state: 'todo'
  }
]
