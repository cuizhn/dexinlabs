import { _ as __nuxt_component_0 } from './nuxt-link-DP061rWi.mjs';
import { computed, withAsyncContext, mergeProps, unref, withCtx, createTextVNode, createVNode, toDisplayString, openBlock, createBlock, createCommentVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList } from 'vue/server-renderer';
import { a as useRoute, u as useHead } from './server.mjs';
import { u as useChapter } from './useChapter-DMJS9RZb.mjs';
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

const _sfc_main = {
  __name: "[chapter]",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const route = useRoute();
    const chapterSlug = Array.isArray(route.params.chapter) ? route.params.chapter[0] : route.params.chapter;
    useHead({
      title: computed(() => currentChapter.value ? `${currentChapter.value.title} · 章节` : "章节")
    });
    const { currentChapter, loadChapter } = useChapter();
    if (chapterSlug) [__temp, __restore] = withAsyncContext(() => loadChapter(chapterSlug)), await __temp, __restore();
    const lessons = computed(() => {
      const ch = currentChapter.value;
      return ch && Array.isArray(ch.lessons) ? ch.lessons : [];
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "chapter-detail" }, _attrs))} data-v-5c231116>`);
      if (unref(currentChapter)) {
        _push(`<!--[--><section class="chapter-detail__header" data-v-5c231116><div class="container" data-v-5c231116><nav class="chapter-detail__breadcrumb" data-v-5c231116>`);
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
        _push(`<span class="chapter-detail__bc-sep" data-v-5c231116>/</span><span class="chapter-detail__bc-current" data-v-5c231116>${ssrInterpolate(unref(currentChapter).title)}</span></nav><h1 class="chapter-detail__title" data-v-5c231116>${ssrInterpolate(unref(currentChapter).title)}</h1>`);
        if (unref(currentChapter).description) {
          _push(`<p class="chapter-detail__desc" data-v-5c231116>${ssrInterpolate(unref(currentChapter).description)}</p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></section><section class="chapter-detail__body" data-v-5c231116><div class="container chapter-detail__layout" data-v-5c231116><div class="chapter-detail__main" data-v-5c231116><h2 class="chapter-detail__section-title" data-v-5c231116>课时内容</h2>`);
        if (lessons.value.length) {
          _push(`<ol class="lesson-list" data-v-5c231116><!--[-->`);
          ssrRenderList(lessons.value, (lesson, idx) => {
            _push(`<li class="lesson-list__item" data-v-5c231116>`);
            _push(ssrRenderComponent(_component_NuxtLink, {
              to: `/course/${unref(chapterSlug)}/${lesson.slug}`,
              class: "lesson-list__link"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`<span class="lesson-list__index" data-v-5c231116${_scopeId}>${ssrInterpolate(String(idx + 1).padStart(2, "0"))}</span><div class="lesson-list__info" data-v-5c231116${_scopeId}><span class="lesson-list__title" data-v-5c231116${_scopeId}>${ssrInterpolate(lesson.title)}</span>`);
                  if (lesson.description) {
                    _push2(`<span class="lesson-list__desc" data-v-5c231116${_scopeId}>${ssrInterpolate(lesson.description)}</span>`);
                  } else {
                    _push2(`<!---->`);
                  }
                  _push2(`</div><span class="lesson-list__arrow" data-v-5c231116${_scopeId}>→</span>`);
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
          _push(`<div class="chapter-detail__empty" data-v-5c231116>暂无课时内容</div>`);
        }
        _push(`</div><aside class="chapter-detail__side" data-v-5c231116>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: `/exercise/${unref(chapterSlug)}`,
          class: "exercise-card"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<div class="exercise-card__icon" data-v-5c231116${_scopeId}>✦</div><div class="exercise-card__body" data-v-5c231116${_scopeId}><h3 class="exercise-card__title" data-v-5c231116${_scopeId}>章节练习</h3><p class="exercise-card__desc" data-v-5c231116${_scopeId}>巩固所学，训练数学思维</p></div><span class="exercise-card__cta" data-v-5c231116${_scopeId}>开始练习 →</span>`);
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
        _push(`<div class="chapter-detail__empty" data-v-5c231116>暂未找到该章节</div>`);
      }
      _push(`</div>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/course/[chapter].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const _chapter_ = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-5c231116"]]);

export { _chapter_ as default };
//# sourceMappingURL=_chapter_-DzAl_zVx.mjs.map
