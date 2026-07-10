import { _ as __nuxt_component_0$1 } from './nuxt-link-MAa4oXM8.mjs';
import { useSSRContext, mergeProps, withCtx, createTextVNode, ref, computed, createVNode, toDisplayString } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderSlot, ssrRenderList, ssrInterpolate, ssrRenderClass } from 'vue/server-renderer';
import { x as useRoute } from './server.mjs';
import { _ as _export_sfc } from './_plugin-vue_export-helper-1tPrXgE0.mjs';
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
import 'drizzle-orm';
import 'drizzle-orm/pg-core';
import 'node:process';
import 'drizzle-orm/neon-serverless';
import '@neondatabase/serverless';
import 'marked';
import '@vue/shared';

const _sfc_main$2 = {
  __name: "AppHeader",
  __ssrInlineRender: true,
  setup(__props) {
    const navItems = [
      { path: "/", label: "首页", exact: true },
      { path: "/course", label: "课程中心" }
    ];
    const isMenuOpen = ref(false);
    const route = useRoute();
    const currentPath = computed(() => route.path);
    function isActive(item) {
      if (item.exact) return currentPath.value === item.path;
      return currentPath.value === item.path || currentPath.value.startsWith(`${item.path}/`);
    }
    function closeMenu() {
      isMenuOpen.value = false;
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0$1;
      _push(`<header${ssrRenderAttrs(mergeProps({ class: "app-header" }, _attrs))} data-v-16538138><div class="app-header__container" data-v-16538138>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/",
        class: "app-header__logo"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<span class="app-header__logo-icon" data-v-16538138${_scopeId}>∑</span><span class="app-header__logo-text" data-v-16538138${_scopeId}>Dexin Labs</span>`);
          } else {
            return [
              createVNode("span", { class: "app-header__logo-icon" }, "∑"),
              createVNode("span", { class: "app-header__logo-text" }, "Dexin Labs")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<nav class="app-header__nav" data-v-16538138><!--[-->`);
      ssrRenderList(navItems, (item) => {
        _push(ssrRenderComponent(_component_NuxtLink, {
          key: item.path,
          to: item.path,
          class: ["app-header__nav-item", { "app-header__nav-item--active": isActive(item) }]
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
      _push(`<!--]--></nav><button class="app-header__menu-btn" aria-label="切换导航菜单" data-v-16538138><span class="${ssrRenderClass([{ "app-header__menu-icon--open": isMenuOpen.value }, "app-header__menu-icon"])}" data-v-16538138></span></button></div><nav class="${ssrRenderClass([{ "app-header__mobile-nav--open": isMenuOpen.value }, "app-header__mobile-nav"])}" data-v-16538138><!--[-->`);
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
const __nuxt_component_0 = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["__scopeId", "data-v-16538138"]]);
const _sfc_main$1 = {};
function _sfc_ssrRender$1(_ctx, _push, _parent, _attrs) {
  const _component_NuxtLink = __nuxt_component_0$1;
  _push(`<footer${ssrRenderAttrs(mergeProps({ class: "app-footer" }, _attrs))} data-v-257c11a0><div class="app-footer__container" data-v-257c11a0><div class="app-footer__brand" data-v-257c11a0><span class="app-footer__logo" data-v-257c11a0>∑</span><span class="app-footer__name" data-v-257c11a0>Dexin Labs</span><p class="app-footer__desc" data-v-257c11a0>理解为先，应用为本。让学习真正得心应手。</p></div><div class="app-footer__links" data-v-257c11a0><div class="app-footer__group" data-v-257c11a0><h4 class="app-footer__group-title" data-v-257c11a0>开始学习</h4>`);
  _push(ssrRenderComponent(_component_NuxtLink, {
    to: "/study",
    class: "app-footer__link"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`同步学习`);
      } else {
        return [
          createTextVNode("同步学习")
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(ssrRenderComponent(_component_NuxtLink, {
    to: "/course",
    class: "app-footer__link"
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
  _push(ssrRenderComponent(_component_NuxtLink, {
    to: "/methods",
    class: "app-footer__link"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`学习方法`);
      } else {
        return [
          createTextVNode("学习方法")
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</div><div class="app-footer__group" data-v-257c11a0><h4 class="app-footer__group-title" data-v-257c11a0>关于</h4>`);
  _push(ssrRenderComponent(_component_NuxtLink, {
    to: "/about",
    class: "app-footer__link"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`品牌故事`);
      } else {
        return [
          createTextVNode("品牌故事")
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(ssrRenderComponent(_component_NuxtLink, {
    to: "/course",
    class: "app-footer__link"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`联系与反馈`);
      } else {
        return [
          createTextVNode("联系与反馈")
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</div></div></div><div class="app-footer__bottom" data-v-257c11a0><div class="app-footer__bottom-container" data-v-257c11a0><p class="app-footer__copyright" data-v-257c11a0>Dexin Labs · 得心实验室 — 理解为先，应用为本</p></div></div></footer>`);
}
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/app/Footer.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_1 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$1, [["ssrRender", _sfc_ssrRender$1], ["__scopeId", "data-v-257c11a0"]]), { __name: "AppFooter" });
const _sfc_main = {};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs) {
  const _component_AppHeader = __nuxt_component_0;
  const _component_AppFooter = __nuxt_component_1;
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "layout" }, _attrs))} data-v-b55586bc>`);
  _push(ssrRenderComponent(_component_AppHeader, null, null, _parent));
  _push(`<main class="layout__content" data-v-b55586bc>`);
  ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
  _push(`</main>`);
  _push(ssrRenderComponent(_component_AppFooter, null, null, _parent));
  _push(`</div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("layouts/default.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const _default = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender], ["__scopeId", "data-v-b55586bc"]]);

export { _default as default };
//# sourceMappingURL=default-z6y_m6xI.mjs.map
