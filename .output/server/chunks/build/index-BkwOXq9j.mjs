import { _ as __nuxt_component_0 } from './nuxt-link-3cq2DLXo.mjs';
import { withAsyncContext, computed, mergeProps, unref, withCtx, createTextVNode, createVNode, toDisplayString, openBlock, createBlock, createCommentVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList } from 'vue/server-renderer';
import { b as useRoute, u as useHead, a as useAsyncData } from './server.mjs';
import { _ as _export_sfc } from './_plugin-vue_export-helper-1tPrXgE0.mjs';
import '../_/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import 'vue-router';
import '@vue/shared';

async function useChapterPage(slug, options = {}) {
  const key = `chapter-page:${slug || "empty"}`;
  const { data, pending, error, refresh } = await useAsyncData(
    key,
    () => $fetch(`/api/chapter/${slug}`),
    {
      /** 默认值，确保数据结构完整 */
      default: () => ({
        chapter: null,
        course: null,
        lessons: [],
        exercise: null,
        previousChapter: null,
        nextChapter: null
      }),
      /** 服务端预取（默认 true） */
      server: true,
      /** 懒加载模式（默认 false） */
      lazy: options.lazy ?? false
    }
  );
  return {
    chapter: computed(() => data.value?.chapter ?? null),
    course: computed(() => data.value?.course ?? null),
    lessons: computed(() => data.value?.lessons ?? []),
    exercise: computed(() => data.value?.exercise ?? null),
    previousChapter: computed(() => data.value?.previousChapter ?? null),
    nextChapter: computed(() => data.value?.nextChapter ?? null),
    loading: pending,
    error,
    refresh
  };
}
const _sfc_main = {
  __name: "index",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const route = useRoute();
    const chapterSlug = route.params.chapter;
    const { chapter, lessons, loading } = ([__temp, __restore] = withAsyncContext(() => useChapterPage(chapterSlug)), __temp = await __temp, __restore(), __temp);
    useHead({
      title: computed(() => chapter.value ? `${chapter.value.title} · 章节` : "章节")
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "chapter-detail" }, _attrs))} data-v-7d6fc250>`);
      if (unref(chapter)) {
        _push(`<!--[--><section class="chapter-detail__header" data-v-7d6fc250><div class="container" data-v-7d6fc250><nav class="chapter-detail__breadcrumb" data-v-7d6fc250>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/course",
          class: "chapter-detail__bc-link"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`课程中心`);
            } else {
              return [
                createTextVNode("课程中心")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`<span class="chapter-detail__bc-sep" data-v-7d6fc250>/</span><span class="chapter-detail__bc-current" data-v-7d6fc250>${ssrInterpolate(unref(chapter).title)}</span></nav></div></section><section class="chapter-detail__body" data-v-7d6fc250><div class="container chapter-detail__layout" data-v-7d6fc250><div class="chapter-detail__main" data-v-7d6fc250><h2 class="chapter-detail__section-title" data-v-7d6fc250>课时内容</h2>`);
        if (unref(lessons).length) {
          _push(`<ol class="lesson-list" data-v-7d6fc250><!--[-->`);
          ssrRenderList(unref(lessons), (lesson, idx) => {
            _push(`<li class="lesson-list__item" data-v-7d6fc250>`);
            _push(ssrRenderComponent(_component_NuxtLink, {
              to: `/course/${unref(chapterSlug)}/${lesson.slug}`,
              class: "lesson-list__link"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`<span class="lesson-list__index" data-v-7d6fc250${_scopeId}>${ssrInterpolate(String(idx + 1).padStart(2, "0"))}</span><div class="lesson-list__info" data-v-7d6fc250${_scopeId}><span class="lesson-list__title" data-v-7d6fc250${_scopeId}>${ssrInterpolate(lesson.title)}</span>`);
                  if (lesson.description) {
                    _push2(`<span class="lesson-list__desc" data-v-7d6fc250${_scopeId}>${ssrInterpolate(lesson.description)}</span>`);
                  } else {
                    _push2(`<!---->`);
                  }
                  _push2(`</div><span class="lesson-list__arrow" data-v-7d6fc250${_scopeId}>→</span>`);
                } else {
                  return [
                    createVNode("span", { class: "lesson-list__index" }, toDisplayString(String(idx + 1).padStart(2, "0")), 1),
                    createVNode("div", { class: "lesson-list__info" }, [
                      createVNode("span", { class: "lesson-list__title" }, toDisplayString(lesson.title), 1),
                      lesson.description ? (openBlock(), createBlock("span", {
                        key: 0,
                        class: "lesson-list__desc"
                      }, toDisplayString(lesson.description), 1)) : createCommentVNode("", true)
                    ]),
                    createVNode("span", { class: "lesson-list__arrow" }, "→")
                  ];
                }
              }),
              _: 2
            }, _parent));
            _push(`</li>`);
          });
          _push(`<!--]--></ol>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><aside class="chapter-detail__side" data-v-7d6fc250>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: `/exercise/${unref(chapterSlug)}`,
          class: "exercise-card"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<div class="exercise-card__icon" data-v-7d6fc250${_scopeId}>✦</div><div class="exercise-card__body" data-v-7d6fc250${_scopeId}><h3 class="exercise-card__title" data-v-7d6fc250${_scopeId}>章节练习</h3><p class="exercise-card__desc" data-v-7d6fc250${_scopeId}>巩固所学，训练数学思维</p></div><span class="exercise-card__cta" data-v-7d6fc250${_scopeId}>开始练习 →</span>`);
            } else {
              return [
                createVNode("div", { class: "exercise-card__icon" }, "✦"),
                createVNode("div", { class: "exercise-card__body" }, [
                  createVNode("h3", { class: "exercise-card__title" }, "章节练习"),
                  createVNode("p", { class: "exercise-card__desc" }, "巩固所学，训练数学思维")
                ]),
                createVNode("span", { class: "exercise-card__cta" }, "开始练习 →")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</aside></div></section><!--]-->`);
      } else {
        _push(`<div class="chapter-detail__empty" data-v-7d6fc250>暂未找到该章节</div>`);
      }
      _push(`</div>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/course/[chapter]/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-7d6fc250"]]);

export { index as default };
//# sourceMappingURL=index-BkwOXq9j.mjs.map
