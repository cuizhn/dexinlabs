import { mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs } from 'vue/server-renderer';
import { u as useHead } from './server.mjs';
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

const _sfc_main = {
  __name: "about",
  __ssrInlineRender: true,
  setup(__props) {
    useHead({ title: "关于 Dexin Labs" });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "about-page" }, _attrs))} data-v-fdbaeb6d><section class="about-page__hero" data-v-fdbaeb6d><div class="container about-page__hero-inner" data-v-fdbaeb6d><span class="about-page__brand" data-v-fdbaeb6d>Dexin Labs</span><h1 class="about-page__title" data-v-fdbaeb6d>理解为先，应用为本。<br data-v-fdbaeb6d><span class="about-page__accent" data-v-fdbaeb6d>让学习真正得心应手。</span></h1><p class="about-page__slogan" data-v-fdbaeb6d>「 数字流动处，思维生长时 」</p></div></section><section class="about-page__story" data-v-fdbaeb6d><div class="container about-page__container" data-v-fdbaeb6d><div class="story-block" data-v-fdbaeb6d><span class="story-block__tag" data-v-fdbaeb6d>我们的故事</span><h2 class="story-block__title" data-v-fdbaeb6d>为什么做这个平台</h2><p class="story-block__para" data-v-fdbaeb6d> Dexin Labs，中文名为「得心实验室」，名字来源于核心理念「得心应手」。 我们相信，真正的学习不是被动地接收知识，而是让知识与思维在心中生长， 最终达到「运用自如，得心应手」的境界。 </p><p class="story-block__para" data-v-fdbaeb6d> 太多学生把数学等同于刷题和记忆公式。我们想改变这一点。 在 Dexin Labs，每一个概念都从「为什么」开始，每一道练习都是一次思维训练， 每一个章节的终点不是「我记住了」，而是「我理解了，我会用了」。 </p></div><div class="story-block" data-v-fdbaeb6d><span class="story-block__tag" data-v-fdbaeb6d>我们的原则</span><div class="principles-grid" data-v-fdbaeb6d><div class="principle-card" data-v-fdbaeb6d><h3 data-v-fdbaeb6d>理解为先</h3><p data-v-fdbaeb6d>每个概念从本质讲起，不讲清楚为什么的内容，不放进课程。</p></div><div class="principle-card" data-v-fdbaeb6d><h3 data-v-fdbaeb6d>应用为本</h3><p data-v-fdbaeb6d>数学不是纸上谈兵。每个知识点都要有真实的问题和应用场景。</p></div><div class="principle-card" data-v-fdbaeb6d><h3 data-v-fdbaeb6d>长期可持续</h3><p data-v-fdbaeb6d>个人开发者项目，不靠融资驱动用户焦虑，只靠内容质量赢得信任。</p></div><div class="principle-card" data-v-fdbaeb6d><h3 data-v-fdbaeb6d>科学 + 教育 + 实验室</h3><p data-v-fdbaeb6d>用科学家的严谨做课程，用设计师的审美做体验，用实验室的心态做实验。</p></div></div></div></div></section></div>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/about.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const about = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-fdbaeb6d"]]);

export { about as default };
//# sourceMappingURL=about-BcQsr6-s.mjs.map
