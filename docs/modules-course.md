使用 **Nuxt 4 约定式目录**。

---

# 第一部分：最终推荐目录结构

结合你的项目现状：

* Nuxt 4
* Content v3
* 数学课程
* 后续练习系统
* 后续用户系统

我推荐：

```bash
app/
├── components/
├── pages/
├── composables/
│
├── repositories/
│
├── modules/
│   ├── course/
│   ├── exercise/
│   └── user/
│
├── server/
│   └── api/
│
├── content/
│
└── content.config.ts
```

---

# 第二部分：Repository 放哪里？

我建议：

```bash
app/
├── repositories/
│   ├── CourseRepository.js
│   ├── LessonRepository.js
│   └── ExerciseRepository.js
```

---

# 第三部分：useCourse.js 放哪里？

对于 Nuxt：

推荐：

```bash
composables/
│
├── useCourse.js
├── useLesson.js
├── useExercise.js
```

因为：

Nuxt 会自动导入。

你直接：

```js
const { course } = useCourse()
```

即可
---

# 第四部分：你的课程目录

这样：

```bash
content/

courses/

course.yml

algebra/

  rational-number/

    absolute-value.md

    number-line.md

  equation/

    linear-equation.md
```

---

# 第五部分：course.yml

这是课程目录。

```yaml
courses:

  - id: algebra

    slug: algebra

    title: 代数

    description: 数与式、方程、不等式等内容

    icon: ∑

    order: 1

  - id: geometry

    slug: geometry

    title: 几何

    description: 图形与空间关系

    icon: △

    order: 2
```

---

作用：

首页：

```text
课程列表
```

显示：

```text
代数
几何
函数
概率统计
```

全部来自：

```text
course.yml
```

---

# 第六部分：Lesson Frontmatter

例如：

```md
---
id: absolute-value

slug: absolute-value

title: 绝对值

course: algebra

chapter: rational-number

order: 3
---

# 绝对值

定义：

$$
|a|
$$

表示数到原点的距离。
```

---

这里最重要：

```yaml
course: algebra
chapter: rational-number
```

因为：

文件夹名称以后可能改。

但是：

```yaml
course
chapter
```

是稳定的数据。

---

# 第七部分：server/api 层

这是整个系统最重要的一层。

---

例如：

```bash
server/api/

courses/

index.get.js

[id].get.js
```

---

# courses/index.get.js

作用：

```text
获取所有课程
```

```js
import { readFile } from 'node:fs/promises'
import { resolve } from 'pathe'
import yaml from 'yaml'

export default defineEventHandler(async () => {

  const path = resolve(
    process.cwd(),
    'content/courses/course.yml'
  )

  const text = await readFile(path, 'utf8')

  const data = yaml.parse(text)

  return data.courses
})
```

---

返回：

```json
[
  {
    "id": "algebra",
    "slug": "algebra",
    "title": "代数"
  }
]
```

---

# 第八部分：课程详情 API

例如：

```bash
server/api/courses/[id].get.js
```

访问：

```text
/api/courses/algebra
```

---

作用：

返回：

```json
{
  "course": {...},

  "chapters": [

    {
      "id": "rational-number",

      "lessons": [
        ...
      ]
    }
  ]
}
```

---

这里才是真正的：

```text
结构组装层
```

---

# 为什么在这里组装？

因为：

你现在的文件结构：

```text
algebra/

  rational-number/

      absolute-value.md

      number-line.md
```

本身已经表达：

```text
课程
 ↓
章节
 ↓
课时
```

---

所以：

API读取后：

```js
{
  course,

  chapters: [

    {
      id:"rational-number",

      lessons:[]
    }
  ]
}
```

直接返回即可。

---

# 第九部分：CourseRepository

```js
export class CourseRepository {

  async getCourses() {

    return await $fetch('/api/courses')
  }

  async getCourse(id) {

    return await $fetch(
      `/api/courses/${id}`
    )
  }
}
```

---

作用：

统一管理：

```text
所有课程请求
```

---

以后如果：

```text
Nuxt Content
↓
改 Supabase
```

你只改：

```text
Repository
```

即可。

---

# 第十部分：useCourse

真正的业务逻辑。

```js
import { CourseRepository }
from '~/repositories/CourseRepository'

export function useCourse() {

  const repo = new CourseRepository()

  const courses = ref([])

  const loading = ref(false)

  const loadCourses = async () => {

    loading.value = true

    courses.value =
      await repo.getCourses()

    loading.value = false
  }

  return {

    courses,

    loading,

    loadCourses
  }
}
```

---

职责：

```text
loading

error

状态管理

业务逻辑
```

---

# 第十一部分：页面

例如：

```bash
pages/

courses/

index.vue
```

---

代码：

```vue
<script setup>

const {
  courses,
  loadCourses
}
=
useCourse()

await loadCourses()

</script>

<template>

  <div>

    <h1>课程列表</h1>

    <div
      v-for="course in courses"
      :key="course.id"
    >

      <NuxtLink
        :to="`/courses/${course.slug}`"
      >

        {{ course.title }}

      </NuxtLink>

    </div>

  </div>

</template>
```

---

# 最终你应该记住的一句话

对于得心实验室：

```text
Markdown
        ↓
Server API
        ↓
Repository
        ↓
Composable
        ↓
Page
```

其中：

```text
Server API
=
数据组织中心
```

```text
Repository
=
数据访问中心
```

```text
Composable
=
学习逻辑中心
```

如果以后增加：

```text
学习进度
练习系统
错题本
AI分析
```

仍然遵守这一套架构，不需要推倒重来。
