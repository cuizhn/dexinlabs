import { _ as __nuxt_component_0$1 } from './nuxt-link-CqUKJX5j.mjs';
import { useSSRContext, mergeProps, withCtx, createTextVNode, ref, computed, createVNode, toDisplayString } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderSlot, ssrRenderList, ssrInterpolate, ssrRenderClass } from 'vue/server-renderer';
import { e as useRoute } from './server.mjs';
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

const _sfc_main$2 = {
  __name: "AppHeader",
  __ssrInlineRender: true,
  setup(__props) {
    const navItems = [
      { path: "/", label: "首页" },
      { path: "/courses", label: "课程" },
      { path: "/practice", label: "练习" },
      { path: "/knowledge", label: "知识图谱" }
    ];
    const isMenuOpen = ref(false);
    const route = useRoute();
    const currentPath = computed(() => route.path);
    function closeMenu() {
      isMenuOpen.value = false;
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0$1;
      _push(`<header${ssrRenderAttrs(mergeProps({ class: "app-header" }, _attrs))} data-v-9969d8ef><div class="app-header__container" data-v-9969d8ef>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/",
        class: "app-header__logo"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<span class="app-header__logo-icon" data-v-9969d8ef${_scopeId}>∑</span><span class="app-header__logo-text" data-v-9969d8ef${_scopeId}>Edu Platform</span>`);
          } else {
            return [
              createVNode("span", { class: "app-header__logo-icon" }, "∑"),
              createVNode("span", { class: "app-header__logo-text" }, "Edu Platform")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<nav class="app-header__nav" data-v-9969d8ef><!--[-->`);
      ssrRenderList(navItems, (item) => {
        _push(ssrRenderComponent(_component_NuxtLink, {
          key: item.path,
          to: item.path,
          class: ["app-header__nav-item", { "app-header__nav-item--active": currentPath.value === item.path }]
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(item.label)}`);
            } else {
              return [
                createTextVNode(toDisplayString(item.label), 1)
              ];
            }
          }),
          _: 2
        }, _parent));
      });
      _push(`<!--]--></nav><button class="app-header__menu-btn" aria-label="切换导航菜单" data-v-9969d8ef><span class="${ssrRenderClass([{ "app-header__menu-icon--open": isMenuOpen.value }, "app-header__menu-icon"])}" data-v-9969d8ef></span></button></div><nav class="${ssrRenderClass([{ "app-header__mobile-nav--open": isMenuOpen.value }, "app-header__mobile-nav"])}" data-v-9969d8ef><!--[-->`);
      ssrRenderList(navItems, (item) => {
        _push(ssrRenderComponent(_component_NuxtLink, {
          key: item.path,
          to: item.path,
          class: "app-header__mobile-nav-item",
          onClick: closeMenu
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(item.label)}`);
            } else {
              return [
                createTextVNode(toDisplayString(item.label), 1)
              ];
            }
          }),
          _: 2
        }, _parent));
      });
      _push(`<!--]--></nav></header>`);
    };
  }
};
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/app/Header.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const __nuxt_component_0 = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["__scopeId", "data-v-9969d8ef"]]);
const _sfc_main$1 = {};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs) {
  const _component_NuxtLink = __nuxt_component_0$1;
  _push(`<footer${ssrRenderAttrs(mergeProps({ class: "app-footer" }, _attrs))} data-v-ca9fdb8e><div class="app-footer__container" data-v-ca9fdb8e><div class="app-footer__brand" data-v-ca9fdb8e><span class="app-footer__logo" data-v-ca9fdb8e>∑</span><span class="app-footer__name" data-v-ca9fdb8e>Edu Platform</span><p class="app-footer__desc" data-v-ca9fdb8e>让数学变得简单</p></div><div class="app-footer__links" data-v-ca9fdb8e><div class="app-footer__group" data-v-ca9fdb8e><h4 class="app-footer__group-title" data-v-ca9fdb8e>课程</h4>`);
  _push(ssrRenderComponent(_component_NuxtLink, {
    to: "/courses",
    class: "app-footer__link"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`全部课程`);
      } else {
        return [
          createTextVNode("全部课程")
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(ssrRenderComponent(_component_NuxtLink, {
    to: "/courses",
    class: "app-footer__link"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`代数入门`);
      } else {
        return [
          createTextVNode("代数入门")
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(ssrRenderComponent(_component_NuxtLink, {
    to: "/courses",
    class: "app-footer__link"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`平面几何`);
      } else {
        return [
          createTextVNode("平面几何")
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</div><div class="app-footer__group" data-v-ca9fdb8e><h4 class="app-footer__group-title" data-v-ca9fdb8e>学习</h4>`);
  _push(ssrRenderComponent(_component_NuxtLink, {
    to: "/practice",
    class: "app-footer__link"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`练习中心`);
      } else {
        return [
          createTextVNode("练习中心")
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(ssrRenderComponent(_component_NuxtLink, {
    to: "/knowledge",
    class: "app-footer__link"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`知识图谱`);
      } else {
        return [
          createTextVNode("知识图谱")
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</div></div></div><div class="app-footer__bottom" data-v-ca9fdb8e><div class="app-footer__bottom-container" data-v-ca9fdb8e><p class="app-footer__copyright" data-v-ca9fdb8e>Edu Platform - 数学学习平台</p></div></div></footer>`);
}
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/app/Footer.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_1 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$1, [["ssrRender", _sfc_ssrRender], ["__scopeId", "data-v-ca9fdb8e"]]), { __name: "AppFooter" });
const _sfc_main = {
  __name: "default",
  __ssrInlineRender: true,
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      const _component_AppHeader = __nuxt_component_0;
      const _component_AppFooter = __nuxt_component_1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "layout" }, _attrs))} data-v-7e1f2f60>`);
      _push(ssrRenderComponent(_component_AppHeader, null, null, _parent));
      _push(`<main class="layout__content" data-v-7e1f2f60>`);
      ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
      _push(`</main>`);
      _push(ssrRenderComponent(_component_AppFooter, null, null, _parent));
      _push(`</div>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("layouts/default.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const _default = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-7e1f2f60"]]);

export { _default as default };
//# sourceMappingURL=default-5blll6zm.mjs.map
