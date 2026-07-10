import { _ as __nuxt_component_0 } from './nuxt-link-DQpUrDUS.mjs';
import { computed, mergeProps, withCtx, createTextVNode, openBlock, createBlock, createVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderList, ssrRenderStyle, ssrInterpolate, ssrRenderComponent, ssrRenderClass } from 'vue/server-renderer';
import { _ as _export_sfc } from './_plugin-vue_export-helper-1tPrXgE0.mjs';
import { f as useHead } from './server.mjs';
import '../_/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import 'vue-router';
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
        icon: "\u{1F4D0}",
        title: "\u7CFB\u7EDF\u5316\u8BFE\u7A0B",
        desc: "\u4ECE\u4EE3\u6570\u51E0\u4F55\u5230\u6982\u7387\u7EDF\u8BA1\uFF0C\u5B8C\u6574\u8986\u76D6\u4E2D\u5B66\u6570\u5B66\u77E5\u8BC6\u4F53\u7CFB\uFF0C\u6BCF\u4E2A\u9636\u6BB5\u90FD\u6709\u6E05\u6670\u7684\u5B66\u4E60\u76EE\u6807\u548C\u8DEF\u5F84\u89C4\u5212",
        size: "lg",
        bg: "#EEF2FF"
      },
      {
        icon: "\u270F\uFE0F",
        title: "\u4EA4\u4E92\u5F0F\u7EC3\u4E60",
        desc: "\u5355\u9009\u9898\u3001\u586B\u7A7A\u9898\u7B49\u591A\u79CD\u9898\u578B\uFF0C\u5373\u65F6\u5224\u9898\u53CD\u9988\uFF0C\u8FB9\u5B66\u8FB9\u7EC3\u5DE9\u56FA\u77E5\u8BC6",
        size: "md",
        bg: "#ECFDF5"
      },
      {
        icon: "\u{1F4CA}",
        title: "\u5B66\u4E60\u8FFD\u8E2A",
        desc: "\u5B9E\u65F6\u8BB0\u5F55\u5B66\u4E60\u8FDB\u5EA6\uFF0C\u53EF\u89C6\u5316\u5C55\u793A\u77E5\u8BC6\u638C\u63E1\u7A0B\u5EA6",
        size: "md",
        bg: "#FFF7ED"
      },
      {
        icon: "\u{1F52C}",
        title: "\u516C\u5F0F\u6E32\u67D3",
        desc: "KaTeX \u9A71\u52A8\u7684\u6570\u5B66\u516C\u5F0F\u6E32\u67D3\uFF0C\u8BA9\u590D\u6742\u7684\u6570\u5B66\u8868\u8FBE\u5F0F\u6E05\u6670\u5448\u73B0",
        size: "md",
        bg: "#FDF2F8"
      },
      {
        icon: "\u{1F4F1}",
        title: "\u591A\u7AEF\u9002\u914D",
        desc: "\u54CD\u5E94\u5F0F\u8BBE\u8BA1\uFF0C\u624B\u673A\u3001\u5E73\u677F\u3001\u7535\u8111\u968F\u65F6\u968F\u5730\u5B66\u4E60",
        size: "lg",
        bg: "#F0F9FF"
      }
    ];
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<section${ssrRenderAttrs(mergeProps({ class: "landing__features" }, _attrs))} data-v-af528b76><div class="landing__section-inner" data-v-af528b76><div class="landing__section-header" data-v-af528b76><span class="landing__section-tag" data-v-af528b76>\u6838\u5FC3\u4F18\u52BF</span><h2 class="landing__section-title" data-v-af528b76>\u4E3A\u6570\u5B66\u5B66\u4E60<br data-v-af528b76>\u91CF\u8EAB\u6253\u9020</h2><p class="landing__section-desc" data-v-af528b76>\u4E0D\u53EA\u662F\u89C6\u9891\u548C\u6587\u5B57\uFF0C\u800C\u662F\u771F\u6B63\u53EF\u4EA4\u4E92\u7684\u5B66\u4E60\u4F53\u9A8C</p></div><div class="landing__features-grid" data-v-af528b76><!--[-->`);
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
  _push(`<section${ssrRenderAttrs(mergeProps({ class: "landing__cta" }, _attrs))} data-v-e5c46453><div class="landing__cta-inner" data-v-e5c46453><div class="landing__cta-deco" data-v-e5c46453>\u2211</div><h2 class="landing__cta-title" data-v-e5c46453>\u51C6\u5907\u597D\u5F00\u59CB\u4E86\u5417\uFF1F</h2><p class="landing__cta-desc" data-v-e5c46453>\u6570\u5B66\u7684\u4E16\u754C\u7B49\u4F60\u63A2\u7D22\uFF0C\u4ECE\u7B2C\u4E00\u6B65\u5F00\u59CB</p>`);
  _push(ssrRenderComponent(_component_NuxtLink, {
    to: "/course",
    class: "landing__btn landing__btn--primary landing__btn--lg"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(` \u7ACB\u5373\u5F00\u59CB\u5B66\u4E60 <svg width="16" height="16" viewBox="0 0 16 16" fill="none" data-v-e5c46453${_scopeId}><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-v-e5c46453${_scopeId}></path></svg>`);
      } else {
        return [
          createTextVNode(" \u7ACB\u5373\u5F00\u59CB\u5B66\u4E60 "),
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
      title: "Dexin Labs \xB7 \u7528\u6570\u5B66\u7406\u89E3\u4E16\u754C"
    });
    const floatingSymbols = computed(() => {
      const chars = ["\u03C0", "\u2211", "\u222B", "\u221A", "\u221E", "\u0394", "\u03B8", "\u03BB", "\u03C6", "\u03B1", "\u03B2", "\u2202"];
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
        title: "\u9009\u62E9\u8BFE\u7A0B",
        desc: "\u6839\u636E\u4F60\u7684\u6C34\u5E73\u548C\u5174\u8DA3\uFF0C\u9009\u62E9\u5408\u9002\u7684\u6570\u5B66\u8BFE\u7A0B\u5F00\u59CB\u5B66\u4E60"
      },
      {
        title: "\u9605\u8BFB\u4E0E\u7EC3\u4E60",
        desc: "\u7CFB\u7EDF\u5316\u7684\u7AE0\u8282\u5185\u5BB9\u914D\u5408\u4EA4\u4E92\u5F0F\u7EC3\u4E60\uFF0C\u52A0\u6DF1\u5BF9\u6BCF\u4E2A\u77E5\u8BC6\u70B9\u7684\u7406\u89E3"
      },
      {
        title: "\u6301\u7EED\u8FDB\u9636",
        desc: "\u5B8C\u6210\u8BFE\u7A0B\u540E\u81EA\u52A8\u8FFD\u8E2A\u8FDB\u5EA6\uFF0C\u63A8\u8350\u4E0B\u4E00\u6B65\u5B66\u4E60\u5185\u5BB9\uFF0C\u6301\u7EED\u63D0\u5347"
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
      _push(`<!--]--></div><div class="landing__hero-content" data-v-a169d8f0><div class="landing__hero-badge" data-v-a169d8f0><span class="landing__hero-badge-dot" data-v-a169d8f0></span> \u514D\u8D39\u5F00\u653E \xB7 \u6301\u7EED\u66F4\u65B0 </div><h1 class="landing__hero-title" data-v-a169d8f0> \u7528\u6570\u5B66<br data-v-a169d8f0><span class="landing__hero-title-accent" data-v-a169d8f0>\u7406\u89E3\u4E16\u754C</span></h1><p class="landing__hero-desc" data-v-a169d8f0> \u4ECE\u7B97\u672F\u5230\u5FAE\u79EF\u5206\uFF0C\u7CFB\u7EDF\u5316\u7684\u5B66\u4E60\u8DEF\u5F84\u4E0E\u4EA4\u4E92\u5F0F\u7EC3\u4E60\uFF0C\u8BA9\u6BCF\u4E00\u4E2A\u6570\u5B66\u6982\u5FF5\u90FD\u53D8\u5F97\u6E05\u6670\u53EF\u89E6 </p><div class="landing__hero-actions" data-v-a169d8f0>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/course",
        class: "landing__btn landing__btn--primary"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` \u5F00\u59CB\u5B66\u4E60 <svg width="16" height="16" viewBox="0 0 16 16" fill="none" data-v-a169d8f0${_scopeId}><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-v-a169d8f0${_scopeId}></path></svg>`);
          } else {
            return [
              createTextVNode(" \u5F00\u59CB\u5B66\u4E60 "),
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
            _push2(` \u6D4F\u89C8\u8BFE\u7A0B `);
          } else {
            return [
              createTextVNode(" \u6D4F\u89C8\u8BFE\u7A0B ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div><div class="landing__hero-stats" data-v-a169d8f0><div class="landing__hero-stat" data-v-a169d8f0><span class="landing__hero-stat-num" data-v-a169d8f0>1</span><span class="landing__hero-stat-label" data-v-a169d8f0>\u6838\u5FC3\u8BFE\u7A0B</span></div><div class="landing__hero-stat-divider" data-v-a169d8f0></div><div class="landing__hero-stat" data-v-a169d8f0><span class="landing__hero-stat-num" data-v-a169d8f0>2</span><span class="landing__hero-stat-label" data-v-a169d8f0>\u7AE0\u8282\u5185\u5BB9</span></div><div class="landing__hero-stat-divider" data-v-a169d8f0></div><div class="landing__hero-stat" data-v-a169d8f0><span class="landing__hero-stat-num" data-v-a169d8f0>\u221E</span><span class="landing__hero-stat-label" data-v-a169d8f0>\u7EC3\u4E60\u9898\u5E93</span></div></div></div><div class="landing__hero-visual" data-v-a169d8f0><div class="landing__hero-card landing__hero-card--1" data-v-a169d8f0><div class="landing__hero-card-icon" data-v-a169d8f0>\u222B</div><div class="landing__hero-card-body" data-v-a169d8f0><span class="landing__hero-card-label" data-v-a169d8f0>\u5FAE\u79EF\u5206\u57FA\u7840</span><div class="landing__hero-card-bar" data-v-a169d8f0><div class="landing__hero-card-fill" style="${ssrRenderStyle({ "width": "35%" })}" data-v-a169d8f0></div></div></div></div><div class="landing__hero-card landing__hero-card--2" data-v-a169d8f0><div class="landing__hero-card-icon" data-v-a169d8f0>\u2206</div><div class="landing__hero-card-body" data-v-a169d8f0><span class="landing__hero-card-label" data-v-a169d8f0>\u5E73\u9762\u51E0\u4F55</span><div class="landing__hero-card-bar" data-v-a169d8f0><div class="landing__hero-card-fill" style="${ssrRenderStyle({ "width": "60%" })}" data-v-a169d8f0></div></div></div></div><div class="landing__hero-card landing__hero-card--3" data-v-a169d8f0><div class="landing__hero-card-icon" data-v-a169d8f0>x\xB2</div><div class="landing__hero-card-body" data-v-a169d8f0><span class="landing__hero-card-label" data-v-a169d8f0>\u4EE3\u6570\u5165\u95E8</span><div class="landing__hero-card-bar" data-v-a169d8f0><div class="landing__hero-card-fill" style="${ssrRenderStyle({ "width": "80%" })}" data-v-a169d8f0></div></div></div></div><div class="landing__hero-equation" data-v-a169d8f0><span class="landing__hero-eq-part" data-v-a169d8f0>f(x)</span><span class="landing__hero-eq-op" data-v-a169d8f0>=</span><span class="landing__hero-eq-part" data-v-a169d8f0>lim</span><span class="landing__hero-eq-sub" data-v-a169d8f0>h\u21920</span><span class="landing__hero-eq-frac" data-v-a169d8f0><span class="landing__hero-eq-num" data-v-a169d8f0>f(x+h) \u2212 f(x)</span><span class="landing__hero-eq-den" data-v-a169d8f0>h</span></span></div></div></section>`);
      _push(ssrRenderComponent(_component_HomeFeatureGrid, null, null, _parent));
      _push(`<section class="landing__how" data-v-a169d8f0><div class="landing__section-inner" data-v-a169d8f0><div class="landing__section-header" data-v-a169d8f0><span class="landing__section-tag" data-v-a169d8f0>\u5B66\u4E60\u65B9\u5F0F</span><h2 class="landing__section-title" data-v-a169d8f0>\u4E09\u6B65\u5F00\u542F<br data-v-a169d8f0>\u6570\u5B66\u4E4B\u65C5</h2></div><div class="landing__how-steps" data-v-a169d8f0><!--[-->`);
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
//# sourceMappingURL=index-D6fhRzvw.mjs.map
