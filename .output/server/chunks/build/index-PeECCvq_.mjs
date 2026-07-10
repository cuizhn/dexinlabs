import { _ as __nuxt_component_0 } from './nuxt-link-MAa4oXM8.mjs';
import { computed, mergeProps, withCtx, createTextVNode, openBlock, createBlock, createVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderList, ssrRenderStyle, ssrInterpolate, ssrRenderComponent, ssrRenderClass } from 'vue/server-renderer';
import { _ as _export_sfc } from './_plugin-vue_export-helper-1tPrXgE0.mjs';
import { w as useHead } from './server.mjs';
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
import 'drizzle-orm';
import 'drizzle-orm/pg-core';
import 'drizzle-orm/neon-serverless';
import '@neondatabase/serverless';
import 'marked';
import '@vue/shared';

const _sfc_main$2 = {
  __name: "HomeFeatureGrid",
  __ssrInlineRender: true,
  props: {
    features: { type: Array, default: () => [] }
  },
  setup(__props) {
    const features = [
      {
        icon: "📐",
        title: "系统化课程",
        desc: "从代数几何到概率统计，完整覆盖中学数学知识体系，每个阶段都有清晰的学习目标和路径规划",
        size: "lg",
        bg: "#EEF2FF"
      },
      {
        icon: "✏️",
        title: "交互式练习",
        desc: "单选题、填空题等多种题型，即时判题反馈，边学边练巩固知识",
        size: "md",
        bg: "#ECFDF5"
      },
      {
        icon: "📊",
        title: "学习追踪",
        desc: "实时记录学习进度，可视化展示知识掌握程度",
        size: "md",
        bg: "#FFF7ED"
      },
      {
        icon: "🔬",
        title: "公式渲染",
        desc: "KaTeX 驱动的数学公式渲染，让复杂的数学表达式清晰呈现",
        size: "md",
        bg: "#FDF2F8"
      },
      {
        icon: "📱",
        title: "多端适配",
        desc: "响应式设计，手机、平板、电脑随时随地学习",
        size: "lg",
        bg: "#F0F9FF"
      }
    ];
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<section${ssrRenderAttrs(mergeProps({ class: "landing__features" }, _attrs))} data-v-af528b76><div class="landing__section-inner" data-v-af528b76><div class="landing__section-header" data-v-af528b76><span class="landing__section-tag" data-v-af528b76>核心优势</span><h2 class="landing__section-title" data-v-af528b76>为数学学习<br data-v-af528b76>量身打造</h2><p class="landing__section-desc" data-v-af528b76>不只是视频和文字，而是真正可交互的学习体验</p></div><div class="landing__features-grid" data-v-af528b76><!--[-->`);
      ssrRenderList(features, (feat, i) => {
        _push(`<div class="${ssrRenderClass([`landing__feature--${feat.size}`, "landing__feature"])}" data-v-af528b76><div class="landing__feature-icon" style="${ssrRenderStyle({ backgroundColor: feat.bg })}" data-v-af528b76><span data-v-af528b76>${ssrInterpolate(feat.icon)}</span></div><h3 class="landing__feature-title" data-v-af528b76>${ssrInterpolate(feat.title)}</h3><p class="landing__feature-desc" data-v-af528b76>${ssrInterpolate(feat.desc)}</p></div>`);
      });
      _push(`<!--]--></div></div></section>`);
    };
  }
};
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/home/FeatureGrid.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const __nuxt_component_1 = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["__scopeId", "data-v-af528b76"]]);
const _sfc_main$1 = {};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs) {
  const _component_NuxtLink = __nuxt_component_0;
  _push(`<section${ssrRenderAttrs(mergeProps({ class: "landing__cta" }, _attrs))} data-v-e5c46453><div class="landing__cta-inner" data-v-e5c46453><div class="landing__cta-deco" data-v-e5c46453>∑</div><h2 class="landing__cta-title" data-v-e5c46453>准备好开始了吗？</h2><p class="landing__cta-desc" data-v-e5c46453>数学的世界等你探索，从第一步开始</p>`);
  _push(ssrRenderComponent(_component_NuxtLink, {
    to: "/course",
    class: "landing__btn landing__btn--primary landing__btn--lg"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(` 立即开始学习 <svg width="16" height="16" viewBox="0 0 16 16" fill="none" data-v-e5c46453${_scopeId}><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-v-e5c46453${_scopeId}></path></svg>`);
      } else {
        return [
          createTextVNode(" 立即开始学习 "),
          (openBlock(), createBlock("svg", {
            width: "16",
            height: "16",
            viewBox: "0 0 16 16",
            fill: "none"
          }, [
            createVNode("path", {
              d: "M3 8h10M9 4l4 4-4 4",
              stroke: "currentColor",
              "stroke-width": "2",
              "stroke-linecap": "round",
              "stroke-linejoin": "round"
            })
          ]))
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</div></section>`);
}
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/home/CTASection.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_2 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$1, [["ssrRender", _sfc_ssrRender], ["__scopeId", "data-v-e5c46453"]]), { __name: "HomeCTASection" });
const _sfc_main = {
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    useHead({
      title: "Dexin Labs · 用数学理解世界"
    });
    const floatingSymbols = computed(() => {
      const chars = ["π", "∑", "∫", "√", "∞", "Δ", "θ", "λ", "φ", "α", "β", "∂"];
      return chars.map((char, i) => ({
        id: i,
        char,
        style: {
          "--x": `${5 + i * 8 % 90}%`,
          "--y": `${10 + i * 17 % 75}%`,
          "--delay": `${i * 0.7}s`,
          "--duration": `${4 + i % 4}s`,
          "--size": `${0.8 + i % 3 * 0.4}rem`,
          "--rotate": `${i * 30 % 360}deg`,
          opacity: 0.06 + i % 3 * 0.03
        }
      }));
    });
    const steps = [
      {
        title: "选择课程",
        desc: "根据你的水平和兴趣，选择合适的数学课程开始学习"
      },
      {
        title: "阅读与练习",
        desc: "系统化的章节内容配合交互式练习，加深对每个知识点的理解"
      },
      {
        title: "持续进阶",
        desc: "完成课程后自动追踪进度，推荐下一步学习内容，持续提升"
      }
    ];
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      const _component_HomeFeatureGrid = __nuxt_component_1;
      const _component_HomeCTASection = __nuxt_component_2;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "landing" }, _attrs))} data-v-a169d8f0><section class="landing__hero" data-v-a169d8f0><div class="landing__hero-bg" data-v-a169d8f0><div class="landing__hero-grid" data-v-a169d8f0></div><div class="landing__hero-glow landing__hero-glow--1" data-v-a169d8f0></div><div class="landing__hero-glow landing__hero-glow--2" data-v-a169d8f0></div><!--[-->`);
      ssrRenderList(floatingSymbols.value, (sym) => {
        _push(`<span class="landing__hero-symbol" style="${ssrRenderStyle(sym.style)}" data-v-a169d8f0>${ssrInterpolate(sym.char)}</span>`);
      });
      _push(`<!--]--></div><div class="landing__hero-content" data-v-a169d8f0><div class="landing__hero-badge" data-v-a169d8f0><span class="landing__hero-badge-dot" data-v-a169d8f0></span> 免费开放 · 持续更新 </div><h1 class="landing__hero-title" data-v-a169d8f0> 用数学<br data-v-a169d8f0><span class="landing__hero-title-accent" data-v-a169d8f0>理解世界</span></h1><p class="landing__hero-desc" data-v-a169d8f0> 从算术到微积分，系统化的学习路径与交互式练习，让每一个数学概念都变得清晰可触 </p><div class="landing__hero-actions" data-v-a169d8f0>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/course",
        class: "landing__btn landing__btn--primary"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` 开始学习 <svg width="16" height="16" viewBox="0 0 16 16" fill="none" data-v-a169d8f0${_scopeId}><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-v-a169d8f0${_scopeId}></path></svg>`);
          } else {
            return [
              createTextVNode(" 开始学习 "),
              (openBlock(), createBlock("svg", {
                width: "16",
                height: "16",
                viewBox: "0 0 16 16",
                fill: "none"
              }, [
                createVNode("path", {
                  d: "M3 8h10M9 4l4 4-4 4",
                  stroke: "currentColor",
                  "stroke-width": "2",
                  "stroke-linecap": "round",
                  "stroke-linejoin": "round"
                })
              ]))
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/course",
        class: "landing__btn landing__btn--ghost"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` 浏览课程 `);
          } else {
            return [
              createTextVNode(" 浏览课程 ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div><div class="landing__hero-stats" data-v-a169d8f0><div class="landing__hero-stat" data-v-a169d8f0><span class="landing__hero-stat-num" data-v-a169d8f0>1</span><span class="landing__hero-stat-label" data-v-a169d8f0>核心课程</span></div><div class="landing__hero-stat-divider" data-v-a169d8f0></div><div class="landing__hero-stat" data-v-a169d8f0><span class="landing__hero-stat-num" data-v-a169d8f0>2</span><span class="landing__hero-stat-label" data-v-a169d8f0>章节内容</span></div><div class="landing__hero-stat-divider" data-v-a169d8f0></div><div class="landing__hero-stat" data-v-a169d8f0><span class="landing__hero-stat-num" data-v-a169d8f0>∞</span><span class="landing__hero-stat-label" data-v-a169d8f0>练习题库</span></div></div></div><div class="landing__hero-visual" data-v-a169d8f0><div class="landing__hero-card landing__hero-card--1" data-v-a169d8f0><div class="landing__hero-card-icon" data-v-a169d8f0>∫</div><div class="landing__hero-card-body" data-v-a169d8f0><span class="landing__hero-card-label" data-v-a169d8f0>微积分基础</span><div class="landing__hero-card-bar" data-v-a169d8f0><div class="landing__hero-card-fill" style="${ssrRenderStyle({ "width": "35%" })}" data-v-a169d8f0></div></div></div></div><div class="landing__hero-card landing__hero-card--2" data-v-a169d8f0><div class="landing__hero-card-icon" data-v-a169d8f0>∆</div><div class="landing__hero-card-body" data-v-a169d8f0><span class="landing__hero-card-label" data-v-a169d8f0>平面几何</span><div class="landing__hero-card-bar" data-v-a169d8f0><div class="landing__hero-card-fill" style="${ssrRenderStyle({ "width": "60%" })}" data-v-a169d8f0></div></div></div></div><div class="landing__hero-card landing__hero-card--3" data-v-a169d8f0><div class="landing__hero-card-icon" data-v-a169d8f0>x²</div><div class="landing__hero-card-body" data-v-a169d8f0><span class="landing__hero-card-label" data-v-a169d8f0>代数入门</span><div class="landing__hero-card-bar" data-v-a169d8f0><div class="landing__hero-card-fill" style="${ssrRenderStyle({ "width": "80%" })}" data-v-a169d8f0></div></div></div></div><div class="landing__hero-equation" data-v-a169d8f0><span class="landing__hero-eq-part" data-v-a169d8f0>f(x)</span><span class="landing__hero-eq-op" data-v-a169d8f0>=</span><span class="landing__hero-eq-part" data-v-a169d8f0>lim</span><span class="landing__hero-eq-sub" data-v-a169d8f0>h→0</span><span class="landing__hero-eq-frac" data-v-a169d8f0><span class="landing__hero-eq-num" data-v-a169d8f0>f(x+h) − f(x)</span><span class="landing__hero-eq-den" data-v-a169d8f0>h</span></span></div></div></section>`);
      _push(ssrRenderComponent(_component_HomeFeatureGrid, null, null, _parent));
      _push(`<section class="landing__how" data-v-a169d8f0><div class="landing__section-inner" data-v-a169d8f0><div class="landing__section-header" data-v-a169d8f0><span class="landing__section-tag" data-v-a169d8f0>学习方式</span><h2 class="landing__section-title" data-v-a169d8f0>三步开启<br data-v-a169d8f0>数学之旅</h2></div><div class="landing__how-steps" data-v-a169d8f0><!--[-->`);
      ssrRenderList(steps, (step, i) => {
        _push(`<div class="landing__how-step" data-v-a169d8f0><div class="landing__how-number" data-v-a169d8f0>${ssrInterpolate(String(i + 1).padStart(2, "0"))}</div><div class="landing__how-content" data-v-a169d8f0><h3 class="landing__how-title" data-v-a169d8f0>${ssrInterpolate(step.title)}</h3><p class="landing__how-desc" data-v-a169d8f0>${ssrInterpolate(step.desc)}</p></div></div>`);
      });
      _push(`<!--]--></div></div></section>`);
      _push(ssrRenderComponent(_component_HomeCTASection, null, null, _parent));
      _push(`</div>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-a169d8f0"]]);

export { index as default };
//# sourceMappingURL=index-PeECCvq_.mjs.map
