import { computed, ref, mergeProps, withCtx, createVNode, toDisplayString, openBlock, createBlock, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderList, ssrRenderClass, ssrInterpolate, ssrRenderComponent } from 'vue/server-renderer';
import { u as useCourse } from './useCourse-BgmDCYcG.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-CqUKJX5j.mjs';
import { _ as _export_sfc } from './_plugin-vue_export-helper-1tPrXgE0.mjs';
import { u as useHead } from './server.mjs';
import '../_/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:url';
import 'node:path';
import 'better-sqlite3';
import 'node:crypto';
import 'vue-router';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/plugins';
import 'unhead/utils';

const _sfc_main$1 = {
  __name: "CourseCard",
  __ssrInlineRender: true,
  props: {
    /** 课程数据对象，包含 id、icon、title、description、difficulty、chapters 等字段 */
    course: {
      type: Object,
      required: true
    }
  },
  setup(__props) {
    function difficultyLabel(d) {
      const map = { beginner: "入门", intermediate: "进阶", advanced: "高级" };
      return map[d] || d;
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(ssrRenderComponent(_component_NuxtLink, mergeProps({
        to: `/courses/${__props.course.id}`,
        class: "course-card"
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="${ssrRenderClass([`course-card__icon--${__props.course.difficulty}`, "course-card__icon"])}" data-v-e06050a1${_scopeId}>${ssrInterpolate(__props.course.icon)}</div><div class="course-card__body" data-v-e06050a1${_scopeId}><h3 class="course-card__title" data-v-e06050a1${_scopeId}>${ssrInterpolate(__props.course.title)}</h3><p class="course-card__desc" data-v-e06050a1${_scopeId}>${ssrInterpolate(__props.course.description)}</p></div><div class="course-card__meta" data-v-e06050a1${_scopeId}><span class="course-card__chapters" data-v-e06050a1${_scopeId}>${ssrInterpolate(__props.course.chapters.length)} 章节</span><span class="${ssrRenderClass([`course-card__difficulty--${__props.course.difficulty}`, "course-card__difficulty"])}" data-v-e06050a1${_scopeId}>${ssrInterpolate(difficultyLabel(__props.course.difficulty))}</span></div><div class="course-card__arrow" data-v-e06050a1${_scopeId}><svg width="20" height="20" viewBox="0 0 20 20" fill="none" data-v-e06050a1${_scopeId}><path d="M4 10h12M12 6l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" data-v-e06050a1${_scopeId}></path></svg></div>`);
          } else {
            return [
              createVNode("div", {
                class: ["course-card__icon", `course-card__icon--${__props.course.difficulty}`]
              }, toDisplayString(__props.course.icon), 3),
              createVNode("div", { class: "course-card__body" }, [
                createVNode("h3", { class: "course-card__title" }, toDisplayString(__props.course.title), 1),
                createVNode("p", { class: "course-card__desc" }, toDisplayString(__props.course.description), 1)
              ]),
              createVNode("div", { class: "course-card__meta" }, [
                createVNode("span", { class: "course-card__chapters" }, toDisplayString(__props.course.chapters.length) + " 章节", 1),
                createVNode("span", {
                  class: ["course-card__difficulty", `course-card__difficulty--${__props.course.difficulty}`]
                }, toDisplayString(difficultyLabel(__props.course.difficulty)), 3)
              ]),
              createVNode("div", { class: "course-card__arrow" }, [
                (openBlock(), createBlock("svg", {
                  width: "20",
                  height: "20",
                  viewBox: "0 0 20 20",
                  fill: "none"
                }, [
                  createVNode("path", {
                    d: "M4 10h12M12 6l4 4-4 4",
                    stroke: "currentColor",
                    "stroke-width": "1.5",
                    "stroke-linecap": "round",
                    "stroke-linejoin": "round"
                  })
                ]))
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
    };
  }
};
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/course/CourseCard.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const CourseCard = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["__scopeId", "data-v-e06050a1"]]);
const _sfc_main = {
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    useHead({ title: "课程中心" });
    const { getAllCourses } = useCourse();
    const courses = getAllCourses();
    const filters = computed(() => {
      const counts = {
        all: courses.length,
        beginner: courses.filter((c) => c.difficulty === "beginner").length,
        intermediate: courses.filter((c) => c.difficulty === "intermediate").length,
        advanced: courses.filter((c) => c.difficulty === "advanced").length
      };
      return [
        { label: "全部", value: "all", count: counts.all },
        { label: "入门", value: "beginner", count: counts.beginner },
        { label: "进阶", value: "intermediate", count: counts.intermediate },
        { label: "高级", value: "advanced", count: counts.advanced }
      ];
    });
    const activeFilter = ref("all");
    const filteredCourses = computed(() => {
      if (activeFilter.value === "all") return courses;
      return courses.filter((course) => course.difficulty === activeFilter.value);
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "courses-page" }, _attrs))} data-v-ea059fe0><section class="courses-page__header" data-v-ea059fe0><div class="container container-sm" data-v-ea059fe0><h1 class="courses-page__title" data-v-ea059fe0>数学课程</h1><p class="courses-page__description" data-v-ea059fe0> 从基础到高级，系统化的数学学习路径，帮助你建立完整的数学知识体系 </p></div></section><section class="courses-page__filters" data-v-ea059fe0><div class="container" data-v-ea059fe0><div class="courses-page__filter-list" data-v-ea059fe0><!--[-->`);
      ssrRenderList(filters.value, (filter) => {
        _push(`<button class="${ssrRenderClass([{ "courses-page__filter-btn--active": activeFilter.value === filter.value }, "courses-page__filter-btn"])}" data-v-ea059fe0>${ssrInterpolate(filter.label)} <span class="courses-page__filter-count" data-v-ea059fe0>${ssrInterpolate(filter.count)}</span></button>`);
      });
      _push(`<!--]--></div></div></section><section class="courses-page__content" data-v-ea059fe0><div class="container" data-v-ea059fe0><div class="courses-page__grid" data-v-ea059fe0><!--[-->`);
      ssrRenderList(filteredCourses.value, (course) => {
        _push(ssrRenderComponent(CourseCard, {
          key: course.id,
          course
        }, null, _parent));
      });
      _push(`<!--]--></div></div></section>`);
      if (filteredCourses.value.length === 0) {
        _push(`<section class="courses-page__empty" data-v-ea059fe0><div class="container container-sm text-center" data-v-ea059fe0><p class="courses-page__empty-text" data-v-ea059fe0>暂无符合条件的课程</p></div></section>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/courses/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-ea059fe0"]]);

export { index as default };
//# sourceMappingURL=index-D3GEx0zy.mjs.map
