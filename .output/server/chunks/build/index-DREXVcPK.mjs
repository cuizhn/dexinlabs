import { _ as __nuxt_component_0 } from './nuxt-link-CqUKJX5j.mjs';
import { computed, mergeProps, withCtx, createVNode, toDisplayString, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderClass, ssrRenderList, ssrRenderComponent } from 'vue/server-renderer';
import { u as useCourse } from './useCourse-BgmDCYcG.mjs';
import { e as useRoute, u as useHead } from './server.mjs';
import { _ as _export_sfc } from './_plugin-vue_export-helper-1tPrXgE0.mjs';
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

const _sfc_main = {
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    const route = useRoute();
    const { getCourse } = useCourse();
    const course = computed(() => getCourse(route.params.slug));
    useHead(() => ({
      title: course.value ? course.value.title : "课程未找到"
    }));
    function getDifficultyLabel(difficulty) {
      const labels = { beginner: "入门", intermediate: "进阶", advanced: "高级" };
      return labels[difficulty] || "未知";
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "course-detail-page" }, _attrs))} data-v-b2f7e2c6>`);
      if (course.value) {
        _push(`<section class="course-detail-page__hero" data-v-b2f7e2c6><div class="container" data-v-b2f7e2c6><div class="course-detail-page__hero-inner" data-v-b2f7e2c6><div class="course-detail-page__icon" data-v-b2f7e2c6>${ssrInterpolate(course.value.icon)}</div><div class="course-detail-page__hero-text" data-v-b2f7e2c6><h1 class="course-detail-page__title" data-v-b2f7e2c6>${ssrInterpolate(course.value.title)}</h1><p class="course-detail-page__description" data-v-b2f7e2c6>${ssrInterpolate(course.value.description)}</p><div class="course-detail-page__meta" data-v-b2f7e2c6><span class="course-detail-page__meta-item" data-v-b2f7e2c6>📖 ${ssrInterpolate(course.value.chapters.length)} 个章节</span><span class="${ssrRenderClass([`course-detail-page__difficulty--${course.value.difficulty}`, "course-detail-page__difficulty"])}" data-v-b2f7e2c6>${ssrInterpolate(getDifficultyLabel(course.value.difficulty))}</span></div></div></div></div></section>`);
      } else {
        _push(`<!---->`);
      }
      if (course.value) {
        _push(`<section class="course-detail-page__content" data-v-b2f7e2c6><div class="container" data-v-b2f7e2c6><div class="course-detail-page__grid" data-v-b2f7e2c6><div class="course-detail-page__chapters" data-v-b2f7e2c6><h2 class="course-detail-page__section-title" data-v-b2f7e2c6>课程章节</h2><div class="course-detail-page__chapter-list" data-v-b2f7e2c6><!--[-->`);
        ssrRenderList(course.value.chapters, (chapter) => {
          _push(ssrRenderComponent(_component_NuxtLink, {
            key: chapter.slug,
            to: `/courses/${course.value.id}/${chapter.slug}`,
            class: "course-detail-page__chapter-card"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<span class="course-detail-page__chapter-order" data-v-b2f7e2c6${_scopeId}>${ssrInterpolate(chapter.order)}</span><div class="course-detail-page__chapter-info" data-v-b2f7e2c6${_scopeId}><h3 class="course-detail-page__chapter-title" data-v-b2f7e2c6${_scopeId}>${ssrInterpolate(chapter.title)}</h3><span class="course-detail-page__chapter-action" data-v-b2f7e2c6${_scopeId}>开始学习 →</span></div>`);
              } else {
                return [
                  createVNode("span", { class: "course-detail-page__chapter-order" }, toDisplayString(chapter.order), 1),
                  createVNode("div", { class: "course-detail-page__chapter-info" }, [
                    createVNode("h3", { class: "course-detail-page__chapter-title" }, toDisplayString(chapter.title), 1),
                    createVNode("span", { class: "course-detail-page__chapter-action" }, "开始学习 →")
                  ])
                ];
              }
            }),
            _: 2
          }, _parent));
        });
        _push(`<!--]--></div></div><aside class="course-detail-page__sidebar" data-v-b2f7e2c6><div class="course-detail-page__info-card" data-v-b2f7e2c6><h3 class="course-detail-page__info-title" data-v-b2f7e2c6>课程信息</h3><ul class="course-detail-page__info-list" data-v-b2f7e2c6><li class="course-detail-page__info-item" data-v-b2f7e2c6><span class="course-detail-page__info-label" data-v-b2f7e2c6>难度</span><span class="course-detail-page__info-value" data-v-b2f7e2c6>${ssrInterpolate(getDifficultyLabel(course.value.difficulty))}</span></li><li class="course-detail-page__info-item" data-v-b2f7e2c6><span class="course-detail-page__info-label" data-v-b2f7e2c6>章节</span><span class="course-detail-page__info-value" data-v-b2f7e2c6>${ssrInterpolate(course.value.chapters.length)} 章</span></li></ul>`);
        if (course.value.chapters.length) {
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: `/courses/${course.value.id}/${course.value.chapters[0].slug}`,
            class: "course-detail-page__start-btn"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(` 开始学习 `);
              } else {
                return [
                  createTextVNode(" 开始学习 ")
                ];
              }
            }),
            _: 1
          }, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(`</div></aside></div></div></section>`);
      } else {
        _push(`<!---->`);
      }
      if (!course.value) {
        _push(`<section class="course-detail-page__not-found" data-v-b2f7e2c6><div class="container container-sm text-center" data-v-b2f7e2c6><h2 class="course-detail-page__not-found-title" data-v-b2f7e2c6>课程未找到</h2><p class="course-detail-page__not-found-text" data-v-b2f7e2c6>请检查课程链接是否正确</p>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/courses",
          class: "course-detail-page__back-link"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`返回课程列表`);
            } else {
              return [
                createTextVNode("返回课程列表")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div></section>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/courses/[slug]/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-b2f7e2c6"]]);

export { index as default };
//# sourceMappingURL=index-DREXVcPK.mjs.map
