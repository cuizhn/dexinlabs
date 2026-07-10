import { mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs } from 'vue/server-renderer';
import { f as useHead } from './server.mjs';
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
import '@vue/shared';

const _sfc_main = {
  __name: "about",
  __ssrInlineRender: true,
  setup(__props) {
    useHead({ title: "\u5173\u4E8E Dexin Labs" });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "about-page" }, _attrs))} data-v-d9fd05e4><section class="about-page__hero" data-v-d9fd05e4><div class="container about-page__hero-inner" data-v-d9fd05e4><span class="about-page__brand" data-v-d9fd05e4>Dexin Labs</span><h1 class="about-page__title" data-v-d9fd05e4>\u7406\u89E3\u4E3A\u5148\uFF0C\u5E94\u7528\u4E3A\u672C\u3002<br data-v-d9fd05e4><span class="about-page__accent" data-v-d9fd05e4>\u8BA9\u5B66\u4E60\u771F\u6B63\u5F97\u5FC3\u5E94\u624B\u3002</span></h1><p class="about-page__slogan" data-v-d9fd05e4>\u300C \u6570\u5B57\u6D41\u52A8\u5904\uFF0C\u601D\u7EF4\u751F\u957F\u65F6 \u300D</p></div></section><section class="about-page__story" data-v-d9fd05e4><div class="container about-page__container" data-v-d9fd05e4><div class="story-block" data-v-d9fd05e4><span class="story-block__tag" data-v-d9fd05e4>\u6211\u4EEC\u7684\u6545\u4E8B</span><h2 class="story-block__title" data-v-d9fd05e4>\u4E3A\u4EC0\u4E48\u505A\u8FD9\u4E2A\u5E73\u53F0</h2><p class="story-block__para" data-v-d9fd05e4> Dexin Labs\uFF0C\u4E2D\u6587\u540D\u4E3A\u300C\u5F97\u5FC3\u5B9E\u9A8C\u5BA4\u300D\uFF0C\u540D\u5B57\u6765\u6E90\u4E8E\u6838\u5FC3\u7406\u5FF5\u300C\u5F97\u5FC3\u5E94\u624B\u300D\u3002 \u6211\u4EEC\u76F8\u4FE1\uFF0C\u771F\u6B63\u7684\u5B66\u4E60\u4E0D\u662F\u88AB\u52A8\u5730\u63A5\u6536\u77E5\u8BC6\uFF0C\u800C\u662F\u8BA9\u77E5\u8BC6\u4E0E\u601D\u7EF4\u5728\u5FC3\u4E2D\u751F\u957F\uFF0C \u6700\u7EC8\u8FBE\u5230\u300C\u8FD0\u7528\u81EA\u5982\uFF0C\u5F97\u5FC3\u5E94\u624B\u300D\u7684\u5883\u754C\u3002 </p><p class="story-block__para" data-v-d9fd05e4> \u592A\u591A\u5B66\u751F\u628A\u6570\u5B66\u7B49\u540C\u4E8E\u5237\u9898\u548C\u8BB0\u5FC6\u516C\u5F0F\u3002\u6211\u4EEC\u60F3\u6539\u53D8\u8FD9\u4E00\u70B9\u3002 \u5728 Dexin Labs\uFF0C\u6BCF\u4E00\u4E2A\u6982\u5FF5\u90FD\u4ECE\u300C\u4E3A\u4EC0\u4E48\u300D\u5F00\u59CB\uFF0C\u6BCF\u4E00\u9053\u7EC3\u4E60\u90FD\u662F\u4E00\u6B21\u601D\u7EF4\u8BAD\u7EC3\uFF0C \u6BCF\u4E00\u4E2A\u7AE0\u8282\u7684\u7EC8\u70B9\u4E0D\u662F\u300C\u6211\u8BB0\u4F4F\u4E86\u300D\uFF0C\u800C\u662F\u300C\u6211\u7406\u89E3\u4E86\uFF0C\u6211\u4F1A\u7528\u4E86\u300D\u3002 </p></div><div class="story-block" data-v-d9fd05e4><span class="story-block__tag" data-v-d9fd05e4>\u6211\u4EEC\u7684\u539F\u5219</span><div class="principles-grid" data-v-d9fd05e4><div class="principle-card" data-v-d9fd05e4><h3 data-v-d9fd05e4>\u7406\u89E3\u4E3A\u5148</h3><p data-v-d9fd05e4>\u6BCF\u4E2A\u6982\u5FF5\u4ECE\u672C\u8D28\u8BB2\u8D77\uFF0C\u4E0D\u8BB2\u6E05\u695A\u4E3A\u4EC0\u4E48\u7684\u5185\u5BB9\uFF0C\u4E0D\u653E\u8FDB\u8BFE\u7A0B\u3002</p></div><div class="principle-card" data-v-d9fd05e4><h3 data-v-d9fd05e4>\u5E94\u7528\u4E3A\u672C</h3><p data-v-d9fd05e4>\u6570\u5B66\u4E0D\u662F\u7EB8\u4E0A\u8C08\u5175\u3002\u6BCF\u4E2A\u77E5\u8BC6\u70B9\u90FD\u8981\u6709\u771F\u5B9E\u7684\u95EE\u9898\u548C\u5E94\u7528\u573A\u666F\u3002</p></div><div class="principle-card" data-v-d9fd05e4><h3 data-v-d9fd05e4>\u957F\u671F\u53EF\u6301\u7EED</h3><p data-v-d9fd05e4>\u4E2A\u4EBA\u5F00\u53D1\u8005\u9879\u76EE\uFF0C\u4E0D\u9760\u878D\u8D44\u9A71\u52A8\u7528\u6237\u7126\u8651\uFF0C\u53EA\u9760\u5185\u5BB9\u8D28\u91CF\u8D62\u5F97\u4FE1\u4EFB\u3002</p></div><div class="principle-card" data-v-d9fd05e4><h3 data-v-d9fd05e4>\u79D1\u5B66 + \u6559\u80B2 + \u5B9E\u9A8C\u5BA4</h3><p data-v-d9fd05e4>\u7528\u79D1\u5B66\u5BB6\u7684\u4E25\u8C28\u505A\u8BFE\u7A0B\uFF0C\u7528\u8BBE\u8BA1\u5E08\u7684\u5BA1\u7F8E\u505A\u4F53\u9A8C\uFF0C\u7528\u5B9E\u9A8C\u5BA4\u7684\u5FC3\u6001\u505A\u5B9E\u9A8C\u3002</p></div></div></div></div></section></div>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/about.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const about = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-d9fd05e4"]]);

export { about as default };
//# sourceMappingURL=about-bFpWGKD9.mjs.map
