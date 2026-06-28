import { _ as __nuxt_component_0 } from './nuxt-link-DP061rWi.mjs';
import { _ as __nuxt_component_1 } from './ContentRenderer-DxkgV8b8.mjs';
import { defineComponent, computed, withAsyncContext, mergeProps, withCtx, createTextVNode, unref, toDisplayString, ref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate } from 'vue/server-renderer';
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
import 'property-information';
import 'minimark/hast';
import 'vue-router';
import '@vue/shared';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';

const ExerciseRepository = {
  // 异步方法：根据练习 slug 查询单个练习的完整详情（含题目列表）
  // 流程步骤：
  //   1. 直接调用 $fetch 发起 GET 请求，slug 作为路径参数
  //   2. 捕获请求异常，异常时返回 null 降级
  // API 地址：GET /api/exercise/{slug}，slug 为 URL 路径参数
  // query params 结构：无额外查询参数
  // 返回 Promise<Exercise | null>：成功返回 Exercise 完整对象（含 questions 数组），失败返回 null
  async findBySlug(slug) {
    try {
      return await $fetch(`/api/exercise/${slug}`);
    } catch {
      return null;
    }
  }
};
function useExercise() {
  const exercise = ref(null);
  const loading = ref(false);
  const loadExercise = async (slug) => {
    loading.value = true;
    try {
      exercise.value = await ExerciseRepository.findBySlug(slug);
    } finally {
      loading.value = false;
    }
  };
  return {
    exercise,
    loading,
    loadExercise
  };
}
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "[chapter]",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const route = useRoute();
    const chapterSlug = Array.isArray(route.params.chapter) ? route.params.chapter[0] : route.params.chapter;
    useHead({
      title: computed(() => chapterTitle.value ? `${chapterTitle.value} · 练习` : "章节练习")
    });
    const { exercise, loading, loadExercise } = useExercise();
    const { currentChapter, loadChapter } = useChapter();
    if (chapterSlug) {
      [__temp, __restore] = withAsyncContext(() => loadChapter(chapterSlug)), await __temp, __restore();
      [__temp, __restore] = withAsyncContext(() => loadExercise(chapterSlug)), await __temp, __restore();
    }
    const chapterTitle = computed(() => currentChapter.value?.title);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      const _component_ContentRenderer = __nuxt_component_1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "exercise-page" }, _attrs))} data-v-41b832ae><section class="exercise-page__header" data-v-41b832ae><div class="container" data-v-41b832ae><nav class="exercise-page__breadcrumb" data-v-41b832ae>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/course",
        class: "exercise-page__bc-link"
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
      _push(`<span class="exercise-page__bc-sep" data-v-41b832ae>/</span>`);
      if (unref(chapterSlug)) {
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: `/course/${unref(chapterSlug)}`,
          class: "exercise-page__bc-link"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(chapterTitle.value || "章节")}`);
            } else {
              return [
                createTextVNode(toDisplayString(chapterTitle.value || "章节"), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`<span class="exercise-page__bc-sep" data-v-41b832ae>/</span><span class="exercise-page__bc-current" data-v-41b832ae>章节练习</span></nav><h1 class="exercise-page__title" data-v-41b832ae>${ssrInterpolate(chapterTitle.value ? `${chapterTitle.value} · 练习` : "章节练习")}</h1><p class="exercise-page__desc" data-v-41b832ae> 思考 → 尝试 → 提示 → 修正 → 理解 → 总结 → 迁移。让每一次练习都成为思维的生长。 </p></div></section><section class="exercise-page__body" data-v-41b832ae><div class="container exercise-page__container" data-v-41b832ae>`);
      if (unref(loading)) {
        _push(`<div class="exercise-page__empty" data-v-41b832ae>练习内容加载中...</div>`);
      } else if (unref(exercise)) {
        _push(`<!--[--><h2 class="exercise-page__section-title" data-v-41b832ae>${ssrInterpolate(unref(exercise).title || "练习题")}</h2>`);
        if (unref(exercise).description) {
          _push(`<div class="exercise-page__intro" data-v-41b832ae>${ssrInterpolate(unref(exercise).description)}</div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(exercise)) {
          _push(ssrRenderComponent(_component_ContentRenderer, {
            value: unref(exercise)
          }, null, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(`<!--]-->`);
      } else {
        _push(`<div class="exercise-page__placeholder" data-v-41b832ae><div class="placeholder-card" data-v-41b832ae><div class="placeholder-card__icon" data-v-41b832ae>✎</div><h3 class="placeholder-card__title" data-v-41b832ae>练习内容准备中</h3><p class="placeholder-card__desc" data-v-41b832ae> 本章节的交互练习正在精心设计中。请先完成课时学习，扎实掌握每个概念。 </p>`);
        if (unref(chapterSlug)) {
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: `/course/${unref(chapterSlug)}`,
            class: "placeholder-card__back"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(` ← 返回章节页 `);
              } else {
                return [
                  createTextVNode(" ← 返回章节页 ")
                ];
              }
            }),
            _: 1
          }, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div>`);
      }
      _push(`</div></section></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/exercise/[chapter].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const _chapter_ = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-41b832ae"]]);

export { _chapter_ as default };
//# sourceMappingURL=_chapter_-B9IRUWrB.mjs.map
