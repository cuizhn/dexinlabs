const coursesData = {
  algebra: {
    id: "algebra",
    // 课程唯一标识
    title: "代数入门",
    // 课程显示标题
    description: "用字母表示数，掌握方程与不等式的解法",
    // 课程简介
    icon: "x",
    // 图标标识，对应数学符号 x
    difficulty: "beginner",
    // 难度等级：入门
    order: 1,
    // 排序权重，排在第 1 位
    chapters: [
      { slug: "01-introduction", title: "代数基础与方程", order: 1 },
      // 第 1 章：代数基础与方程
      { slug: "02-functions", title: "函数与图像", order: 2 }
      // 第 2 章：函数与图像
    ]
  }
};
function useCourse() {
  function getCourse(courseSlug) {
    return coursesData[courseSlug] || null;
  }
  function getAllCourses() {
    return Object.values(coursesData).sort((a, b) => a.order - b.order);
  }
  function getChapter(courseSlug, chapterSlug) {
    const course = coursesData[courseSlug];
    if (!course) return null;
    return course.chapters.find((ch) => ch.slug === chapterSlug) || null;
  }
  function getChapterNavigation(courseSlug, chapterSlug) {
    const course = coursesData[courseSlug];
    if (!course) return { prev: null, next: null };
    const index = course.chapters.findIndex((ch) => ch.slug === chapterSlug);
    return {
      prev: index > 0 ? course.chapters[index - 1] : null,
      // 非第一章时返回上一章
      next: index < course.chapters.length - 1 ? course.chapters[index + 1] : null
      // 非最后一章时返回下一章
    };
  }
  return {
    getCourse,
    getAllCourses,
    getChapter,
    getChapterNavigation
  };
}

export { useCourse as u };
//# sourceMappingURL=useCourse-BgmDCYcG.mjs.map
