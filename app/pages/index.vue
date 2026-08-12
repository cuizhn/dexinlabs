<template>
  <div>
    <!-- Hero 区域 -->
    <section class="home-hero">
      <div class="home-hero__container">
        <h1 class="home-hero__title">得心实验室</h1>
        <p class="home-hero__subtitle">理解，而不是记住。</p>
        
        <div class="home-hero__actions">
          <NuxtLink to="/courses" class="home-hero__btn home-hero__btn--primary">
            直接开始
          </NuxtLink>
          <a href="#why" class="home-hero__btn home-hero__btn--secondary">
            深入了解
          </a>
        </div>
      </div>
    </section>

    <!-- 为什么是得心实验室 -->
    <section id="why" class="why-section">
      <div class="why-section__container">
        <h2 class="why-section__title">为什么是得心实验室？</h2>
        <p class="why-section__subtitle">
          我们相信，学习的本质是理解，而不是记忆。得心实验室致力于帮助学生真正理解数学概念，建立深层的知识连接。
        </p>
        
        <div class="why-section__grid">
          <div class="why-section__card">
            <div class="why-section__icon">🎯</div>
            <h3 class="why-section__card-title">理解优先</h3>
            <p class="why-section__card-text">
              每个知识点都从"为什么"开始，帮助学生建立直觉理解，而不是死记硬背公式。
            </p>
          </div>
          
          <div class="why-section__card">
            <div class="why-section__icon">🔗</div>
            <h3 class="why-section__card-title">知识连接</h3>
            <p class="why-section__card-text">
              展示知识点之间的联系，让学生看到数学是一个整体，而不是零散的概念集合。
            </p>
          </div>
          
          <div class="why-section__card">
            <div class="why-section__icon">💡</div>
            <h3 class="why-section__card-title">启发思考</h3>
            <p class="why-section__card-text">
              通过问题引导和探索式学习，培养学生的数学思维和解决问题的能力。
            </p>
          </div>
          
          <div class="why-section__card">
            <div class="why-section__icon">📈</div>
            <h3 class="why-section__card-title">循序渐进</h3>
            <p class="why-section__card-text">
              精心设计的学习路径，从基础到进阶，每一步都建立在扎实的理解之上。
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- 课程与学习方式 -->
    <section class="feature-grid">
      <div class="feature-grid__container">
        <h2 class="feature-grid__title">课程与学习方式</h2>
        <p class="feature-grid__subtitle">
          不只是视频和文字，而是真正可交互的学习体验
        </p>
        
        <div class="feature-grid__items">
          <div v-for="(feature, index) in features" :key="index" class="feature-grid__item">
            <div class="feature-grid__item-icon">{{ feature.icon }}</div>
            <h3 class="feature-grid__item-title">{{ feature.title }}</h3>
            <p class="feature-grid__item-desc">{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 数学知识地图 -->
    <section class="knowledge-map">
      <div class="knowledge-map__container">
        <h2 class="knowledge-map__title">数学知识地图</h2>
        <p class="knowledge-map__subtitle">
          完整覆盖初中数学知识体系，从数与代数到统计与概率，每个知识点都精心设计。
        </p>
        
        <div class="knowledge-map__topics">
          <NuxtLink 
            v-for="topic in topics" 
            :key="topic.slug" 
            :to="`/courses/${topic.slug}`"
            class="knowledge-map__topic-card"
          >
            <div class="knowledge-map__topic-icon">{{ topic.icon }}</div>
            <h3 class="knowledge-map__topic-title">{{ topic.title }}</h3>
            <p class="knowledge-map__topic-desc">{{ topic.description }}</p>
            <div class="knowledge-map__topic-meta">
              <span>{{ topic.lessonCount }} 个课时</span>
            </div>
          </NuxtLink>
        </div>
        
        <div class="knowledge-map__cta">
          <NuxtLink to="/courses" class="knowledge-map__btn">
            查看全部课程
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- 自由探索课程 -->
    <section class="explore-courses">
      <div class="explore-courses__container">
        <h2 class="explore-courses__title">自由探索课程</h2>
        <p class="explore-courses__subtitle">
          无需注册，立即体验我们的学习课程。选择你感兴趣的主题，开始探索之旅。
        </p>
        
        <div class="explore-courses__actions">
          <NuxtLink to="/courses" class="explore-courses__btn explore-courses__btn--primary">
            浏览所有课程
          </NuxtLink>
          <NuxtLink to="/courses" class="explore-courses__btn explore-courses__btn--secondary">
            查看学习路径
          </NuxtLink>
        </div>
        
        <div class="explore-courses__note">
          <p>💡 提示：注册账号后可以保存学习进度、参与互动练习、获得个性化推荐</p>
        </div>
      </div>
    </section>

    <!-- 关于得心实验室 -->
    <section class="about">
      <div class="about__container">
        <h2 class="about__title">关于得心实验室</h2>
        <div class="about__content">
          <p class="about__intro">
            得心实验室是一个致力于数学教育创新的在线学习平台。我们相信，数学不应该只是公式和计算，而应该是理解世界的一种方式。
          </p>
          
          <div class="about__mission">
            <h3 class="about__mission-title">我们的使命</h3>
            <p class="about__mission-text">
              帮助学生建立深层的数学理解，培养数学思维能力，让每个学生都能发现数学之美。
            </p>
          </div>
          
          <div class="about__values">
            <div class="about__value">
              <div class="about__value-icon">🎯</div>
              <h4 class="about__value-title">理解优先</h4>
              <p class="about__value-text">
                我们追求真正的理解，而不是表面的记忆。每个知识点都从"为什么"开始。
              </p>
            </div>
            
            <div class="about__value">
              <div class="about__value-icon">🔗</div>
              <h4 class="about__value-title">知识连接</h4>
              <p class="about__value-text">
                我们展示知识点之间的联系，帮助学生建立完整的知识网络。
              </p>
            </div>
            
            <div class="about__value">
              <div class="about__value-icon">💡</div>
              <h4 class="about__value-title">启发思考</h4>
              <p class="about__value-text">
                我们通过问题引导和探索式学习，培养学生的数学思维。
              </p>
            </div>
          </div>
          
          <div class="about__cta">
            <NuxtLink to="/courses" class="about__btn">
              开始学习之旅
            </NuxtLink>
          </div>
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
/* ========== Hero ========== */
.home-hero {
  padding: 48px 24px;
  background: linear-gradient(135deg, var(--color-bg-primary) 0%, var(--color-bg-secondary) 100%);
}

.home-hero__container {
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
}

.home-hero__title {
  font-size: 3rem;
  font-weight: 800;
  color: var(--color-text-primary);
  margin: 0 0 12px;
  letter-spacing: -0.02em;
}

.home-hero__subtitle {
  font-size: 1.25rem;
  color: var(--color-text-secondary);
  margin: 0 0 32px;
  font-weight: 400;
}

.home-hero__actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
}

.home-hero__btn {
  padding: 12px 28px;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 8px;
  text-decoration: none;
  transition: all 0.2s ease;
  cursor: pointer;
  border: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.home-hero__btn--primary {
  background: var(--color-primary);
  color: var(--color-text-inverse);
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.15);
}

.home-hero__btn--primary:hover {
  background: var(--color-primary-hover);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(79, 70, 229, 0.25);
}

.home-hero__btn--secondary {
  background: transparent;
  color: var(--color-text-secondary);
  text-decoration: underline;
  text-underline-offset: 4px;
}

.home-hero__btn--secondary:hover {
  color: var(--color-primary);
}

/* ========== Why Section ========== */
.why-section {
  padding: 80px 24px;
  background: var(--color-bg-white);
}

.why-section__container {
  max-width: 1200px;
  margin: 0 auto;
}

.why-section__title {
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--color-text-primary);
  text-align: center;
  margin: 0 0 24px;
}

.why-section__subtitle {
  font-size: 1.125rem;
  color: var(--color-text-secondary);
  text-align: center;
  max-width: 700px;
  margin: 0 auto 48px;
  line-height: 1.7;
}

.why-section__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}

.why-section__card {
  padding: 32px;
  background: var(--color-bg-secondary);
  border-radius: 12px;
  border: 1px solid var(--color-border-light);
  transition: all 0.3s ease;
}

.why-section__card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);
  border-color: var(--color-primary-light);
}

.why-section__icon {
  font-size: 2.5rem;
  margin-bottom: 16px;
}

.why-section__card-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 8px;
}

.why-section__card-text {
  font-size: 1rem;
  color: var(--color-text-secondary);
  line-height: 1.7;
  margin: 0;
}

/* ========== Feature Grid ========== */
.feature-grid {
  padding: 80px 24px;
  background: var(--color-bg-white);
}

.feature-grid__container {
  max-width: 1200px;
  margin: 0 auto;
}

.feature-grid__title {
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--color-text-primary);
  text-align: center;
  margin: 0 0 24px;
}

.feature-grid__subtitle {
  font-size: 1.125rem;
  color: var(--color-text-secondary);
  text-align: center;
  max-width: 700px;
  margin: 0 auto 48px;
  line-height: 1.7;
}

.feature-grid__items {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
}

.feature-grid__item {
  padding: 32px;
  background: var(--color-bg-secondary);
  border-radius: 12px;
  border: 1px solid var(--color-border-light);
  transition: all 0.3s ease;
}

.feature-grid__item:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);
  border-color: var(--color-primary-light);
}

.feature-grid__item-icon {
  font-size: 2.5rem;
  margin-bottom: 16px;
}

.feature-grid__item-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 8px;
}

.feature-grid__item-desc {
  font-size: 1rem;
  color: var(--color-text-secondary);
  line-height: 1.7;
  margin: 0;
}

/* ========== Knowledge Map ========== */
.knowledge-map {
  padding: 80px 24px;
  background: var(--color-bg-white);
}

.knowledge-map__container {
  max-width: 1200px;
  margin: 0 auto;
}

.knowledge-map__title {
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--color-text-primary);
  text-align: center;
  margin: 0 0 24px;
}

.knowledge-map__subtitle {
  font-size: 1.125rem;
  color: var(--color-text-secondary);
  text-align: center;
  max-width: 700px;
  margin: 0 auto 48px;
  line-height: 1.7;
}

.knowledge-map__topics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 24px;
  margin-bottom: 48px;
}

.knowledge-map__topic-card {
  padding: 32px;
  background: var(--color-bg-secondary);
  border-radius: 12px;
  border: 1px solid var(--color-border-light);
  text-decoration: none;
  transition: all 0.3s ease;
  display: block;
}

.knowledge-map__topic-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);
  border-color: var(--color-primary);
}

.knowledge-map__topic-icon {
  font-size: 3rem;
  margin-bottom: 16px;
}

.knowledge-map__topic-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 8px;
}

.knowledge-map__topic-desc {
  font-size: 1rem;
  color: var(--color-text-secondary);
  line-height: 1.7;
  margin: 0 0 16px;
}

.knowledge-map__topic-meta {
  font-size: 0.875rem;
  color: var(--color-text-light);
  font-weight: 500;
}

.knowledge-map__cta {
  text-align: center;
}

.knowledge-map__btn {
  display: inline-block;
  padding: 14px 32px;
  background: var(--color-primary);
  color: var(--color-text-inverse);
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.15);
}

.knowledge-map__btn:hover {
  background: var(--color-primary-hover);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(79, 70, 229, 0.25);
}

/* ========== Explore Courses ========== */
.explore-courses {
  padding: 80px 24px;
  background: var(--color-bg-white);
}

.explore-courses__container {
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
}

.explore-courses__title {
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--color-text-primary);
  text-align: center;
  margin: 0 0 24px;
}

.explore-courses__subtitle {
  font-size: 1.125rem;
  color: var(--color-text-secondary);
  text-align: center;
  line-height: 1.7;
  margin: 0 auto 48px;
  max-width: 700px;
}

.explore-courses__actions {
  display: flex;
  gap: 24px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 48px;
}

.explore-courses__btn {
  padding: 14px 32px;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 8px;
  text-decoration: none;
  transition: all 0.2s ease;
  display: inline-block;
}

.explore-courses__btn--primary {
  background: var(--color-primary);
  color: var(--color-text-inverse);
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.15);
}

.explore-courses__btn--primary:hover {
  background: var(--color-primary-hover);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(79, 70, 229, 0.25);
}

.explore-courses__btn--secondary {
  background: transparent;
  color: var(--color-text-primary);
  border: 2px solid var(--color-border);
}

.explore-courses__btn--secondary:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.explore-courses__note {
  padding: 24px;
  background: var(--color-bg-secondary);
  border-radius: 12px;
  border: 1px solid var(--color-border-light);
  max-width: 600px;
  margin: 0 auto;
}

.explore-courses__note p {
  margin: 0;
  font-size: 1rem;
  color: var(--color-text-secondary);
  line-height: 1.7;
}

/* ========== About ========== */
.about {
  padding: 80px 24px;
  background: var(--color-bg-white);
}

.about__container {
  max-width: 1200px;
  margin: 0 auto;
}

.about__title {
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--color-text-primary);
  text-align: center;
  margin: 0 0 48px;
}

.about__content {
  display: flex;
  flex-direction: column;
  gap: 48px;
}

.about__intro {
  font-size: 1.25rem;
  color: var(--color-text-secondary);
  text-align: center;
  line-height: 1.8;
  max-width: 800px;
  margin: 0 auto;
}

.about__mission {
  padding: 32px;
  background: linear-gradient(135deg, var(--color-bg-primary) 0%, var(--color-bg-secondary) 100%);
  border-radius: 12px;
  text-align: center;
}

.about__mission-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 16px;
}

.about__mission-text {
  font-size: 1.125rem;
  color: var(--color-text-secondary);
  line-height: 1.7;
  margin: 0;
}

.about__values {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}

.about__value {
  padding: 32px;
  background: var(--color-bg-secondary);
  border-radius: 12px;
  border: 1px solid var(--color-border-light);
  transition: all 0.3s ease;
}

.about__value:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);
  border-color: var(--color-primary-light);
}

.about__value-icon {
  font-size: 2.5rem;
  margin-bottom: 16px;
}

.about__value-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 12px;
}

.about__value-text {
  font-size: 1rem;
  color: var(--color-text-secondary);
  line-height: 1.7;
  margin: 0;
}

.about__cta {
  text-align: center;
  padding-top: 24px;
}

.about__btn {
  display: inline-block;
  padding: 14px 32px;
  background: var(--color-primary);
  color: var(--color-text-inverse);
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.15);
}

.about__btn:hover {
  background: var(--color-primary-hover);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(79, 70, 229, 0.25);
}

/* ========== 响应式 ========== */
@media (max-width: 768px) {
  .home-hero {
    padding: 36px 16px;
  }

  .home-hero__title {
    font-size: 2.25rem;
  }

  .home-hero__subtitle {
    font-size: 1.125rem;
    margin-bottom: 24px;
  }

  .home-hero__actions {
    flex-direction: column;
    align-items: stretch;
  }

  .home-hero__btn {
    justify-content: center;
  }

  .why-section {
    padding: 60px 16px;
  }

  .why-section__title {
    font-size: 2rem;
  }

  .why-section__subtitle {
    font-size: 1rem;
  }

  .why-section__grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .feature-grid {
    padding: 60px 16px;
  }

  .feature-grid__title {
    font-size: 2rem;
  }

  .feature-grid__subtitle {
    font-size: 1rem;
  }

  .feature-grid__items {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .knowledge-map {
    padding: 60px 16px;
  }

  .knowledge-map__title {
    font-size: 2rem;
  }

  .knowledge-map__subtitle {
    font-size: 1rem;
  }

  .knowledge-map__topics {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .explore-courses {
    padding: 60px 16px;
  }

  .explore-courses__title {
    font-size: 2rem;
  }

  .explore-courses__subtitle {
    font-size: 1rem;
  }

  .explore-courses__actions {
    flex-direction: column;
    align-items: stretch;
  }

  .explore-courses__btn {
    text-align: center;
  }

  .about {
    padding: 60px 16px;
  }

  .about__title {
    font-size: 2rem;
  }

  .about__intro {
    font-size: 1.125rem;
  }

  .about__values {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}

@media (max-width: 480px) {
  .home-hero__title {
    font-size: 2.5rem;
  }

  .home-hero__subtitle {
    font-size: 1.125rem;
  }
}
</style>
