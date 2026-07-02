import { _ as __nuxt_component_0 } from './nuxt-link-B-wZu7nJ.mjs';
import { defineComponent, computed, mergeProps, unref, withCtx, createTextVNode, createVNode, toDisplayString, openBlock, createBlock, createCommentVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList } from 'vue/server-renderer';
import { a as useRoute, b as useFetch, u as useHead } from './server.mjs';
import { _ as _export_sfc } from './_plugin-vue_export-helper-1tPrXgE0.mjs';
import '../_/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'better-sqlite3';
import 'node:crypto';
import 'vue-router';
import '@vue/shared';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "[chapter]",
  __ssrInlineRender: true,
  setup(__props) {
    const route = useRoute();
    const chapterSlug = computed(
      () => Array.isArray(route.params.chapter) ? route.params.chapter[0] : route.params.chapter
    );
    const { data: chapter, pending: loading } = useFetch(
      () => `/api/chapter/${chapterSlug.value}`,
      {
        // key 随 chapterSlug 变化，不同 slug 生成独立缓存条目
        key: computed(() => `chapter-${chapterSlug.value}`),
        // slug 有效时才启用请求
        enabled: computed(() => !!chapterSlug.value)
      }
    );
    useHead({
      title: computed(() => chapter.value ? `${chapter.value.title} · 章节` : "章节")
    });
    const lessons = computed(() => {
      const ch = chapter.value;
      return ch && Array.isArray(ch.lessons) ? ch.lessons : [];
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "chapter-detail" }, _attrs))} data-v-3752f5ae>`);
      if (unref(chapter)) {
        _push(`<!--[--><section class="chapter-detail__header" data-v-3752f5ae><div class="container" data-v-3752f5ae><nav class="chapter-detail__breadcrumb" data-v-3752f5ae>`);
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
        _push(`<span class="chapter-detail__bc-sep" data-v-3752f5ae>/</span><span class="chapter-detail__bc-current" data-v-3752f5ae>${ssrInterpolate(unref(chapter).title)}</span></nav><h1 class="chapter-detail__title" data-v-3752f5ae>${ssrInterpolate(unref(chapter).title)}</h1>`);
        if (unref(chapter).description) {
          _push(`<p class="chapter-detail__desc" data-v-3752f5ae>${ssrInterpolate(unref(chapter).description)}</p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></section><section class="chapter-detail__body" data-v-3752f5ae><div class="container chapter-detail__layout" data-v-3752f5ae><div class="chapter-detail__main" data-v-3752f5ae><h2 class="chapter-detail__section-title" data-v-3752f5ae>课时内容</h2>`);
        if (unref(loading)) {
          _push(`<div class="chapter-detail__empty" data-v-3752f5ae>加载中...</div>`);
        } else if (lessons.value.length) {
          _push(`<ol class="lesson-list" data-v-3752f5ae><!--[-->`);
          ssrRenderList(lessons.value, (lesson, idx) => {
            _push(`<li class="lesson-list__item" data-v-3752f5ae>`);
            _push(ssrRenderComponent(_component_NuxtLink, {
              to: `/course/${chapterSlug.value}/${lesson.slug}`,
              class: "lesson-list__link"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`<span class="lesson-list__index" data-v-3752f5ae${_scopeId}>${ssrInterpolate(String(idx + 1).padStart(2, "0"))}</span><div class="lesson-list__info" data-v-3752f5ae${_scopeId}><span class="lesson-list__title" data-v-3752f5ae${_scopeId}>${ssrInterpolate(lesson.title)}</span>`);
                  if (lesson.description) {
                    _push2(`<span class="lesson-list__desc" data-v-3752f5ae${_scopeId}>${ssrInterpolate(lesson.description)}</span>`);
                  } else {
                    _push2(`<!---->`);
                  }
                  _push2(`</div><span class="lesson-list__arrow" data-v-3752f5ae${_scopeId}>→</span>`);
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
          _push(`<div class="chapter-detail__empty" data-v-3752f5ae>暂无课时内容</div>`);
        }
        _push(`</div><aside class="chapter-detail__side" data-v-3752f5ae>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: `/exercise/${chapterSlug.value}`,
          class: "exercise-card"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<div class="exercise-card__icon" data-v-3752f5ae${_scopeId}>✦</div><div class="exercise-card__body" data-v-3752f5ae${_scopeId}><h3 class="exercise-card__title" data-v-3752f5ae${_scopeId}>章节练习</h3><p class="exercise-card__desc" data-v-3752f5ae${_scopeId}>巩固所学，训练数学思维</p></div><span class="exercise-card__cta" data-v-3752f5ae${_scopeId}>开始练习 →</span>`);
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
      } else if (!unref(loading)) {
        _push(`<section class="chapter-detail__empty" data-v-3752f5ae><div class="container text-center" data-v-3752f5ae><h2 data-v-3752f5ae>章节未找到</h2>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/course",
          class: "chapter-detail__back"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`返回课程中心`);
            } else {
              return [
                createTextVNode("返回课程中心")
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
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/course/[chapter].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const _chapter_ = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-3752f5ae"]]);

export { _chapter_ as default };
//# sourceMappingURL=_chapter_-BVqU0uyp.mjs.map
