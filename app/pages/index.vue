<template>
  <div>
    <!-- Hero 区域 -->
    <section class="hero">
      <div class="container">
        <h1>得心实验室</h1>
        <p class="subtitle">理解，而不是记住。</p>
        
        <div class="actions">
          <NuxtLink to="/courses" class="btn btn-primary">
            直接开始
          </NuxtLink>
          <a href="#why" class="btn btn-link">
            深入了解
          </a>
        </div>
      </div>
    </section>

    <!-- 为什么是得心实验室 -->
    <section id="why" class="section">
      <div class="container">
        <h2 class="section-title">为什么是得心实验室？</h2>
        <p class="section-subtitle">
          我们相信，学习的本质是理解，而不是记忆。得心实验室致力于帮助学生真正理解数学概念，建立深层的知识连接。
        </p>
        
        <div class="grid">
          <div class="card">
            <div class="icon">🎯</div>
            <h3>理解优先</h3>
            <p>
              每个知识点都从"为什么"开始，帮助学生建立直觉理解，而不是死记硬背公式。
            </p>
          </div>
          
          <div class="card">
            <div class="icon">🔗</div>
            <h3>知识连接</h3>
            <p>
              展示知识点之间的联系，让学生看到数学是一个整体，而不是零散的概念集合。
            </p>
          </div>
          
          <div class="card">
            <div class="icon">💡</div>
            <h3>启发思考</h3>
            <p>
              通过问题引导和探索式学习，培养学生的数学思维和解决问题的能力。
            </p>
          </div>
          
          <div class="card">
            <div class="icon">📈</div>
            <h3>循序渐进</h3>
            <p>
              精心设计的学习路径，从基础到进阶，每一步都建立在扎实的理解之上。
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- 课程与学习方式 -->
    <section class="section section-alt">
      <div class="container">
        <h2 class="section-title">课程与学习方式</h2>
        <p class="section-subtitle">
          不只是视频和文字，而是真正可交互的学习体验
        </p>
        
        <div class="grid">
          <div v-for="(feature, index) in features" :key="index" class="card">
            <div class="icon">{{ feature.icon }}</div>
            <h3>{{ feature.title }}</h3>
            <p>{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 数学知识地图 -->
    <section class="section">
      <div class="container">
        <h2 class="section-title">数学知识地图</h2>
        <p class="section-subtitle">
          完整覆盖初中数学知识体系，从数与代数到统计与概率，每个知识点都精心设计。
        </p>
        
        <div class="grid grid-topics">
          <NuxtLink 
            v-for="topic in topics" 
            :key="topic.slug" 
            :to="`/courses/${topic.slug}`"
            class="card card-topic"
          >
            <div class="icon icon-large">{{ topic.icon }}</div>
            <h3>{{ topic.title }}</h3>
            <p>{{ topic.description }}</p>
            <span class="meta">{{ topic.lessonCount }} 个课时</span>
          </NuxtLink>
        </div>
        
        <div class="cta">
          <NuxtLink to="/courses" class="btn btn-primary">
            查看全部课程
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- 自由探索课程 -->
    <section class="section section-alt">
      <div class="container text-center">
        <h2 class="section-title">自由探索课程</h2>
        <p class="section-subtitle">
          无需注册，立即体验我们的学习课程。选择你感兴趣的主题，开始探索之旅。
        </p>
        
        <div class="actions">
          <NuxtLink to="/courses" class="btn btn-primary">
            浏览所有课程
          </NuxtLink>
          <NuxtLink to="/courses" class="btn btn-outline">
            查看学习路径
          </NuxtLink>
        </div>
        
        <div class="note">
          <p>💡 提示：注册账号后可以保存学习进度、参与互动练习、获得个性化推荐</p>
        </div>
      </div>
    </section>

    <!-- 关于得心实验室 -->
    <section class="section">
      <div class="container">
        <h2 class="section-title">关于得心实验室</h2>
        
        <p class="intro">
          心得实验室是一个致力于数学教育创新的在线学习平台。我们相信，数学不应该只是公式和计算，而应该是理解世界的一种方式。
        </p>
        
        <div class="mission">
          <h3>我们的使命</h3>
          <p>
            帮助学生建立深层的数学理解，培养数学思维能力，让每个学生都能发现数学之美。
          </p>
        </div>
        
        <div class="grid">
          <div class="card">
            <div class="icon">🎯</div>
            <h4>理解优先</h4>
            <p>
              我们追求真正的理解，而不是表面的记忆。每个知识点都从"为什么"开始。
            </p>
          </div>
          
          <div class="card">
            <div class="icon">🔗</div>
            <h4>知识连接</h4>
            <p>
              我们展示知识点之间的联系，帮助学生建立完整的知识网络。
            </p>
          </div>
          
          <div class="card">
            <div class="icon">💡</div>
            <h4>启发思考</h4>
            <p>
              我们通过问题引导和探索式学习，培养学生的数学思维。
            </p>
          </div>
        </div>
        
        <div class="cta">
          <NuxtLink to="/courses" class="btn btn-primary">
            开始学习之旅
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: '得心实验室 · 理解，而不是记住'
})

const features = [
  {
    icon: '📚',
    title: '结构化知识体系',
    description: '从基础概念到高级应用，每个知识点都有清晰的学习路径和前置依赖。'
  },
  {
    icon: '🎯',
    title: '概念驱动学习',
    description: '每个课时围绕核心概念展开，帮助学生建立深层理解而非表面记忆。'
  },
  {
    icon: '💬',
    title: '交互式学习体验',
    description: '通过问题引导、即时反馈和可视化演示，让学习过程更加生动有趣。'
  },
  {
    icon: '🔗',
    title: '知识点关联',
    description: '自动展示知识点之间的联系，帮助学生建立完整的知识网络。'
  },
  {
    icon: '📊',
    title: '学习进度追踪',
    description: '记录学习轨迹，可视化展示掌握程度，让学习成果清晰可见。'
  },
  {
    icon: '🎨',
    title: '沉浸式学习界面',
    description: '简洁专注的课时页面，减少干扰，让注意力集中在内容本身。'
  }
]

const topics = [
  {
    slug: 'number-algebra',
    icon: '🔢',
    title: '数与代数',
    description: '有理数、实数、代数式、方程与不等式',
    lessonCount: 15
  },
  {
    slug: 'geometry',
    icon: '📐',
    title: '图形与几何',
    description: '三角形、四边形、圆、相似与全等',
    lessonCount: 12
  },
  {
    slug: 'statistics-probability',
    icon: '📊',
    title: '统计与概率',
    description: '数据分析、统计图表、概率基础',
    lessonCount: 8
  },
  {
    slug: 'comprehensive',
    icon: '🎯',
    title: '综合与实践',
    description: '数学建模、问题解决、实际应用',
    lessonCount: 6
  }
]
</script>

<style scoped>
/* ========== 通用组件 ========== */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-lg);
}

.text-center {
  text-align: center;
}

.section {
  padding: var(--spacing-3xl) var(--spacing-lg);
  background: var(--color-bg-white);
}

.section-alt {
  background: var(--color-bg-secondary);
}

.section-title {
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--color-text-primary);
  text-align: center;
  margin: 0 0 var(--spacing-xl);
}

.section-subtitle {
  font-size: 1.125rem;
  color: var(--color-text-secondary);
  text-align: center;
  max-width: 700px;
  margin: 0 auto var(--spacing-2xl);
  line-height: 1.7;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--spacing-xl);
}

.grid-topics {
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  margin-bottom: var(--spacing-2xl);
}

.card {
  padding: var(--spacing-xl);
  background: var(--color-bg-white);
  border-radius: var(--border-radius-lg);
  border: 1px solid var(--color-border-light);
  transition: all 0.3s ease;
}

.section-alt .card {
  background: var(--color-bg-white);
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
  border-color: var(--color-primary-light);
}

.card-topic {
  text-decoration: none;
  display: block;
}

.card-topic:hover {
  border-color: var(--color-primary);
}

.icon {
  font-size: 2.5rem;
  margin-bottom: var(--spacing-md);
}

.icon-large {
  font-size: 3rem;
}

.meta {
  font-size: 0.875rem;
  color: var(--color-text-light);
  font-weight: 500;
}

.actions {
  display: flex;
  gap: var(--spacing-md);
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
}

.cta {
  text-align: center;
  padding-top: var(--spacing-xl);
}

/* ========== 按钮 ========== */
.btn {
  padding: var(--spacing-md) var(--spacing-xl);
  font-size: 1rem;
  font-weight: 600;
  border-radius: var(--border-radius-md);
  text-decoration: none;
  transition: all 0.2s ease;
  cursor: pointer;
  border: none;
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.btn-primary {
  background: var(--color-primary);
  color: var(--color-text-inverse);
  box-shadow: var(--shadow-sm);
}

.btn-primary:hover {
  background: var(--color-primary-hover);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.btn-outline {
  background: transparent;
  color: var(--color-text-primary);
  border: 2px solid var(--color-border);
}

.btn-outline:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.btn-link {
  background: transparent;
  color: var(--color-text-secondary);
  text-decoration: underline;
  text-underline-offset: 4px;
  padding: var(--spacing-md) var(--spacing-lg);
}

.btn-link:hover {
  color: var(--color-primary);
}

/* ========== Hero ========== */
.hero {
  padding: var(--spacing-3xl) var(--spacing-lg);
  background: linear-gradient(135deg, var(--color-bg-primary) 0%, var(--color-bg-secondary) 100%);
}

.hero .container {
  max-width: 800px;
  text-align: center;
}

.hero h1 {
  font-size: 3rem;
  font-weight: 800;
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-md);
  letter-spacing: -0.02em;
}

.hero .subtitle {
  font-size: 1.25rem;
  color: var(--color-text-secondary);
  margin: 0 0 var(--spacing-xl);
  font-weight: 400;
}

/* ========== 特殊区块 ========== */
.intro {
  font-size: 1.25rem;
  color: var(--color-text-secondary);
  text-align: center;
  line-height: 1.8;
  max-width: 800px;
  margin: 0 auto var(--spacing-2xl);
}

.mission {
  padding: var(--spacing-xl);
  background: linear-gradient(135deg, var(--color-bg-primary) 0%, var(--color-bg-secondary) 100%);
  border-radius: var(--border-radius-lg);
  text-align: center;
  margin-bottom: var(--spacing-2xl);
}

.mission h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-md);
}

.mission p {
  font-size: 1.125rem;
  color: var(--color-text-secondary);
  line-height: 1.7;
  margin: 0;
}

.note {
  padding: var(--spacing-xl);
  background: var(--color-bg-white);
  border-radius: var(--border-radius-lg);
  border: 1px solid var(--color-border-light);
  max-width: 600px;
  margin: var(--spacing-2xl) auto 0;
}

.note p {
  margin: 0;
  font-size: 1rem;
  color: var(--color-text-secondary);
  line-height: 1.7;
}

/* ========== 响应式 ========== */
@media (max-width: 768px) {
  .hero {
    padding: var(--spacing-2xl) var(--spacing-md);
  }

  .hero h1 {
    font-size: 2.25rem;
  }

  .hero .subtitle {
    font-size: 1.125rem;
  }

  .hero .actions {
    flex-direction: column;
    align-items: stretch;
  }

  .hero .btn {
    justify-content: center;
  }

  .section {
    padding: var(--spacing-2xl) var(--spacing-md);
  }

  .section-title {
    font-size: 2rem;
  }

  .section-subtitle {
    font-size: 1rem;
  }

  .grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
  }

  .intro {
    font-size: 1.125rem;
  }
}

@media (max-width: 480px) {
  .hero h1 {
    font-size: 2rem;
  }

  .hero .subtitle {
    font-size: 1rem;
  }
}
</style>
