import { _ as __nuxt_component_0 } from './nuxt-link-DP061rWi.mjs';
import { defineComponent, computed, withAsyncContext, mergeProps, unref, withCtx, createTextVNode, createVNode, toDisplayString, openBlock, createBlock, createCommentVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList } from 'vue/server-renderer';
import { a as useRoute, u as useHead } from './server.mjs';
import { u as useChapter } from './useChapter-DS2E0xUy.mjs';
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
  __name: "index",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const route = useRoute();
    const chapterSlug = Array.isArray(route.params.chapter) ? route.params.chapter[0] : route.params.chapter;
    useHead({
      title: computed(() => currentChapter.value ? `${currentChapter.value.title} · 章节` : "章节")
    });
    const { currentChapter, loading, loadChapter } = useChapter();
    if (chapterSlug) [__temp, __restore] = withAsyncContext(() => loadChapter(chapterSlug)), await __temp, __restore();
    const lessons = computed(() => {
      const ch = currentChapter.value;
      return ch && Array.isArray(ch.lessons) ? ch.lessons : [];
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "chapter-detail" }, _attrs))} data-v-f0470af4>`);
      if (unref(currentChapter)) {
        _push(`<!--[--><section class="chapter-detail__header" data-v-f0470af4><div class="container" data-v-f0470af4><nav class="chapter-detail__breadcrumb" data-v-f0470af4>`);
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
        _push(`<span class="chapter-detail__bc-sep" data-v-f0470af4>/</span><span class="chapter-detail__bc-current" data-v-f0470af4>${ssrInterpolate(unref(currentChapter).title)}</span></nav><h1 class="chapter-detail__title" data-v-f0470af4>${ssrInterpolate(unref(currentChapter).title)}</h1>`);
        if (unref(currentChapter).description) {
          _push(`<p class="chapter-detail__desc" data-v-f0470af4>${ssrInterpolate(unref(currentChapter).description)}</p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></section><section class="chapter-detail__body" data-v-f0470af4><div class="container chapter-detail__layout" data-v-f0470af4><div class="chapter-detail__main" data-v-f0470af4><h2 class="chapter-detail__section-title" data-v-f0470af4>课时内容</h2>`);
        if (unref(loading)) {
          _push(`<div class="chapter-detail__empty" data-v-f0470af4>加载中...</div>`);
        } else if (lessons.value.length) {
          _push(`<ol class="lesson-list" data-v-f0470af4><!--[-->`);
          ssrRenderList(lessons.value, (lesson, idx) => {
            _push(`<li class="lesson-list__item" data-v-f0470af4>`);
            _push(ssrRenderComponent(_component_NuxtLink, {
              to: `/course/${unref(chapterSlug)}/${lesson.slug}`,
              class: "lesson-list__link"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`<span class="lesson-list__index" data-v-f0470af4${_scopeId}>${ssrInterpolate(String(idx + 1).padStart(2, "0"))}</span><div class="lesson-list__info" data-v-f0470af4${_scopeId}><span class="lesson-list__title" data-v-f0470af4${_scopeId}>${ssrInterpolate(lesson.title)}</span>`);
                  if (lesson.description) {
                    _push2(`<span class="lesson-list__desc" data-v-f0470af4${_scopeId}>${ssrInterpolate(lesson.description)}</span>`);
                  } else {
                    _push2(`<!---->`);
                  }
                  _push2(`</div><span class="lesson-list__arrow" data-v-f0470af4${_scopeId}>→</span>`);
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
          _push(`<div class="chapter-detail__empty" data-v-f0470af4>暂无课时内容</div>`);
        }
        _push(`</div><aside class="chapter-detail__side" data-v-f0470af4>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: `/exercise/${unref(chapterSlug)}`,
          class: "exercise-card"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<div class="exercise-card__icon" data-v-f0470af4${_scopeId}>✦</div><div class="exercise-card__body" data-v-f0470af4${_scopeId}><h3 class="exercise-card__title" data-v-f0470af4${_scopeId}>章节练习</h3><p class="exercise-card__desc" data-v-f0470af4${_scopeId}>巩固所学，训练数学思维</p></div><span class="exercise-card__cta" data-v-f0470af4${_scopeId}>开始练习 →</span>`);
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
        _push(`<section class="chapter-detail__empty" data-v-f0470af4><div class="container text-center" data-v-f0470af4><h2 data-v-f0470af4>章节未找到</h2>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/course/[chapter]/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-f0470af4"]]);

export { index as default };
//# sourceMappingURL=index-axANhMSu.mjs.map
