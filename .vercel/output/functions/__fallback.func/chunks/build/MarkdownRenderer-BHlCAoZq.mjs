import { computed, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderSlot, ssrRenderClass } from 'vue/server-renderer';
import { marked } from 'marked';
import { _ as _export_sfc } from './_plugin-vue_export-helper-1tPrXgE0.mjs';

const _sfc_main = {
  __name: "MarkdownRenderer",
  __ssrInlineRender: true,
  props: {
    value: { type: Object, default: () => ({}) },
    document: { type: Object, default: null },
    ast: { type: Object, default: null },
    theme: { type: String, default: "default" },
    fallback: { type: Boolean, default: true }
  },
  setup(__props) {
    marked.setOptions({
      gfm: true,
      breaks: true,
      mangle: false,
      headerIds: true
    });
    const props = __props;
    const source = props.document || props.value || {};
    const frontmatter = computed(() => {
      if (source.frontmatter && typeof source.frontmatter === "object") return source.frontmatter;
      if (props.ast?.frontmatter && typeof props.ast.frontmatter === "object") return props.ast.frontmatter;
      return {};
    });
    const toc = computed(() => {
      if (Array.isArray(source._toc) && source._toc.length > 0) return source._toc;
      if (Array.isArray(props.ast?.toc)) return props.ast.toc;
      return [];
    });
    const readingTime = computed(() => {
      if (source._readingTime != null) return source._readingTime;
      if (props.ast?.readingTime != null) return props.ast.readingTime;
      return null;
    });
    const markdownString = computed(() => {
      if (typeof props.ast?.content === "string" && props.ast.content.trim()) {
        return props.ast.content;
      }
      if (typeof source.body === "string" && source.body.trim()) {
        return source.body;
      }
      if (typeof source.content === "string" && source.content.trim()) {
        return source.content;
      }
      if (typeof source === "string") return source;
      return "";
    });
    const renderedHtml = computed(() => {
      const md = markdownString.value;
      if (!md) return "";
      try {
        return marked.parse(md) || "";
      } catch (e) {
        return "";
      }
    });
    const wrapperClass = computed(() => [
      "ce-markdown-renderer",
      `ce-theme-${props.theme}`
    ]);
    const innerClass = computed(() => [
      "ce-content",
      "prose",
      "prose-neutral",
      "dark:prose-invert",
      "max-w-none"
    ]);
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({
        class: unref(wrapperClass),
        "data-ce-markdown-renderer": ""
      }, _attrs))} data-v-d42a2f5d>`);
      ssrRenderSlot(_ctx.$slots, "header", {
        toc: unref(toc),
        frontmatter: unref(frontmatter)
      }, null, _push, _parent);
      _push(`<div class="${ssrRenderClass([unref(innerClass), "ce-content-body"])}" data-v-d42a2f5d>`);
      ssrRenderSlot(_ctx.$slots, "body-start", {}, null, _push, _parent);
      if (unref(renderedHtml)) {
        _push(`<div class="ce-markdown" data-v-d42a2f5d>${unref(renderedHtml) ?? ""}</div>`);
      } else {
        _push(`<!---->`);
      }
      ssrRenderSlot(_ctx.$slots, "body-end", {}, null, _push, _parent);
      if (!unref(renderedHtml)) {
        ssrRenderSlot(_ctx.$slots, "empty", {}, null, _push, _parent);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      ssrRenderSlot(_ctx.$slots, "footer", {
        toc: unref(toc),
        frontmatter: unref(frontmatter),
        readingTime: unref(readingTime)
      }, null, _push, _parent);
      _push(`</div>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("modules/content/renderer/theme/MarkdownRenderer.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const MarkdownRenderer = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-d42a2f5d"]]);

export { MarkdownRenderer as M };
//# sourceMappingURL=MarkdownRenderer-BHlCAoZq.mjs.map
