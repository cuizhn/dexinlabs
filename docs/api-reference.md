# API 参考文档

> 所有模块、组合式函数和 API 端点的完整参考

## 目录

- [课程模块 (useCourse)](#课程模块-usecourse)
- [练习模块 (useExercise)](#练习模块-useexercise)
- [数学工具模块 (useMath)](#数学工具模块-usemath)
- [服务端 API](#服务端-api)
- [内容集合 Schema](#内容集合-schema)

---

## 课程模块 (useCourse)

**文件**: `modules/course/useCourse.js`

课程数据查询与导航的组合式函数。

### 使用方式

```javascript
import { useCourse } from '~/modules/course/useCourse.js'

const { getCourse, getAllCourses, getChapter, getChapterNavigation } = useCourse()
```

### getCourse

获取单个课程的完整数据。

**签名**:
```typescript
function getCourse(courseSlug: string): Course | null
```

**参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `courseSlug` | `string` | 是 | 课程唯一标识，如 `'algebra'` |

**返回值**:

```typescript
interface Course {
  id: string;              // 课程 ID
  title: string;           // 课程标题
  description: string;     // 课程描述
  icon: string;            // 课程图标
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  order: number;           // 排序权重
  chapters: Chapter[];     // 章节列表
}

interface Chapter {
  slug: string;            // 章节 URL 标识
  title: string;           // 章节标题
  order: number;           // 章节排序
}
```

**示例**:
```javascript
const course = getCourse('algebra')
// 返回 algebra 课程的完整数据，不存在时返回 null
```

### getAllCourses

获取所有课程列表，按 `order` 升序排列。

**签名**:
```typescript
function getAllCourses(): Course[]
```

**返回值**: `Course[]` 课程数组

**示例**:
```javascript
const courses = getAllCourses()
// 返回 [algebra, geometry, trigonometry, probability, statistics]
```

### getChapter

获取指定课程的某个章节信息。

**签名**:
```typescript
function getChapter(courseSlug: string, chapterSlug: string): Chapter | null
```

**参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `courseSlug` | `string` | 是 | 课程 ID |
| `chapterSlug` | `string` | 是 | 章节 URL 标识 |

**返回值**: `Chapter | null`

**示例**:
```javascript
const chapter = getChapter('algebra', '01-introduction')
// 返回 { slug: '01-introduction', title: '代数基础与方程', order: 1 }
```

### getChapterNavigation

获取章节的前后导航信息。

**签名**:
```typescript
function getChapterNavigation(
  courseSlug: string,
  chapterSlug: string
): { prev: Chapter | null, next: Chapter | null }
```

**参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `courseSlug` | `string` | 是 | 课程 ID |
| `chapterSlug` | `string` | 是 | 当前章节 URL 标识 |

**返回值**:

```typescript
{
  prev: Chapter | null,  // 上一章，如果是第一章则为 null
  next: Chapter | null   // 下一章，如果是最后一章则为 null
}
```

**示例**:
```javascript
const nav = getChapterNavigation('algebra', '01-introduction')
// { prev: null, next: { slug: '02-functions', title: '函数与图像', order: 2 } }
```

---

## 练习模块 (useExercise)

**文件**: `modules/exercise/useExercise.js`

练习题数据管理和判题逻辑的组合式函数。

### 使用方式

```javascript
import { useExercise } from '~/modules/exercise/useExercise.js'

const { getExercises, checkChoice, checkInput } = useExercise()
```

### getExercises

获取指定课程的练习题列表。

**签名**:
```typescript
function getExercises(courseSlug: string): Exercise[]
```

**参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `courseSlug` | `string` | 是 | 课程 ID |

**返回值**:

```typescript
type Exercise = ChoiceExercise | InputExercise

interface ChoiceExercise {
  id: number;
  type: 'choice';
  question: string;          // 题目（支持 LaTeX 公式）
  options: string[];         // 选项列表
  correctIndex: number;      // 正确选项的索引（从 0 开始）
}

interface InputExercise {
  id: number;
  type: 'input';
  question: string;          // 题目（支持 LaTeX 公式）
  correctAnswer: string;     // 正确答案
}
```

**示例**:
```javascript
const exercises = getExercises('algebra')
// 返回代数课程的所有练习题
```

### checkChoice

判断选择题答案是否正确。

**签名**:
```typescript
function checkChoice(selectedIndex: number, correctIndex: number): boolean
```

**参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `selectedIndex` | `number` | 是 | 用户选择的选项索引 |
| `correctIndex` | `number` | 是 | 正确选项索引 |

**返回值**: `boolean` 是否正确

**示例**:
```javascript
checkChoice(1, 1)  // true - 选择正确
checkChoice(0, 1)  // false - 选择错误
```

### checkInput

判断填空题答案是否正确。

**签名**:
```typescript
function checkInput(userAnswer: string, correctAnswer: string): boolean
```

**参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `userAnswer` | `string` | 是 | 用户输入的答案 |
| `correctAnswer` | `string` | 是 | 正确答案 |

**返回值**: `boolean` 是否正确

**判题规则**:
- 忽略首尾空格
- 忽略大小写差异
- 精确匹配（不支持模糊匹配）

**示例**:
```javascript
checkInput('3', '3')      // true
checkInput(' 3 ', '3')    // true - 忽略空格
checkInput('ABC', 'abc')  // true - 忽略大小写
checkInput('4', '3')      // false
```

---

## 数学工具模块 (useMath)

**文件**: `composables/useMath.js`

数学公式处理工具的组合式函数。

### 使用方式

```javascript
import { useMath } from '~/composables/useMath.js'

const { hasMathFormula } = useMath()
```

### hasMathFormula

检测文本是否包含 LaTeX 数学公式。

**签名**:
```typescript
function hasMathFormula(text: string): boolean
```

**参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `text` | `string` | 是 | 待检测的文本 |

**返回值**: `boolean` 是否包含数学公式

**检测规则**:
- 行内公式：匹配 `$...$` 模式
- 块级公式：匹配 `$$...$$` 模式

**示例**:
```javascript
hasMathFormula('解方程 $x + 1 = 2$')   // true
hasMathFormula('$$\\frac{1}{2}$$')     // true
hasMathFormula('这是一个普通文本')      // false
```

---

## 服务端 API

### GET `/api/content/:slug/:chapter`

获取指定章节的 Markdown 内容。

**请求参数**:

| 参数 | 位置 | 类型 | 必填 | 说明 |
|------|------|------|------|------|
| `slug` | Path | `string` | 是 | 课程 ID |
| `chapter` | Path | `string` | 是 | 章节 URL 标识 |

**请求示例**:
```
GET /api/content/algebra/01-introduction
```

**成功响应** (200):
```json
{
  "content": { ... },
  "title": "代数基础与方程",
  "meta": {
    "order": 1,
    "course": "algebra",
    "chapterType": "lesson",
    "duration": 30
  }
}
```

**错误响应**:

| 状态码 | 说明 |
|--------|------|
| `400` | 缺少 `slug` 或 `chapter` 参数 |
| `404` | 章节不存在 |
| `500` | 服务器内部错误 |

```json
{
  "statusCode": 404,
  "statusMessage": "Chapter not found"
}
```

---

## 内容集合 Schema

### courses 集合

**文件**: `content.config.ts`

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `id` | `string` | 是 | - | 课程唯一标识 |
| `title` | `string` | 是 | - | 课程标题 |
| `description` | `string` | 否 | - | 课程描述 |
| `icon` | `string` | 否 | - | 课程图标（字符） |
| `difficulty` | `enum` | 是 | - | `beginner` \| `intermediate` \| `advanced` |
| `order` | `number` | 否 | `0` | 排序权重，越小越靠前 |

### chapters 集合

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `title` | `string` | 是 | 章节标题 |
| `order` | `number` | 是 | 章节排序 |
| `course` | `string` | 是 | 所属课程 ID |
| `chapterType` | `enum` | 否 | `lesson` \| `exercise` |
| `duration` | `number` | 否 | 预计学习时长（分钟） |
