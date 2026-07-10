import { ref, computed, watch, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderSlot, ssrRenderClass } from 'vue/server-renderer';
import { getEngine } from './index-BVTkTKBe.mjs';
import { _ as _export_sfc } from './_plugin-vue_export-helper-1tPrXgE0.mjs';

const _sfc_main = {
  __name: "Markdown",
  __ssrInlineRender: true,
  props: {
    value: { type: Object, default: () => ({}) },
    document: { type: Object, default: null },
    ast: { type: Object, default: null },
    content: { type: String, default: "" },
    theme: { type: String, default: "default" },
    fallback: { type: Boolean, default: true }
  },
  setup(__props) {
    const props = __props;
    const renderedHtml = ref("");
    const enhancedAST = ref(null);
    const loading = ref(false);
    const markdownString = computed(() => {
      if (typeof props.content === "string" && props.content.trim()) {
        return props.content;
      }
      if (props.ast && typeof props.ast.content === "string" && props.ast.content.trim()) {
        return props.ast.content;
      }
      const source = props.document || props.value || {};
      if (typeof source === "string") return source;
      if (typeof source.body === "string" && source.body.trim()) {
        return source.body;
      }
      if (typeof source.content === "string" && source.content.trim()) {
        return source.content;
      }
      return "";
    });
    watch(() => markdownString.value, async (md) => {
      if (!md) {
        renderedHtml.value = "";
        enhancedAST.value = null;
        return;
      }
      loading.value = true;
      try {
        const engine = getEngine();
        const result = await engine.run(md, { renderTarget: "html" });
        renderedHtml.value = result.rendered || "";
        enhancedAST.value = result.enhancedAST;
      } catch (e) {
        renderedHtml.value = "";
      } finally {
        loading.value = false;
      }
    }, { immediate: true });
    const frontmatter = computed(() => {
      if (enhancedAST.value?.frontmatter && typeof enhancedAST.value.frontmatter === "object") {
        return enhancedAST.value.frontmatter;
      }
      const source = props.document || props.value || {};
      if (source.frontmatter && typeof source.frontmatter === "object") return source.frontmatter;
      if (props.ast?.frontmatter && typeof props.ast.frontmatter === "object") return props.ast.frontmatter;
      return {};
    });
    const toc = computed(() => {
      if (Array.isArray(enhancedAST.value?.toc) && enhancedAST.value.toc.length > 0) {
        return enhancedAST.value.toc;
      }
      const source = props.document || props.value || {};
      if (Array.isArray(source._toc) && source._toc.length > 0) return source._toc;
      if (Array.isArray(props.ast?.toc)) return props.ast.toc;
      return [];
    });
    const readingTime = computed(() => {
      if (enhancedAST.value?.readingTime != null) return enhancedAST.value.readingTime;
      const source = props.document || props.value || {};
      if (source._readingTime != null) return source._readingTime;
      if (props.ast?.readingTime != null) return props.ast.readingTime;
      return null;
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
        class: wrapperClass.value,
        "data-ce-markdown-renderer": ""
      }, _attrs))} data-v-4d65b530>`);
      ssrRenderSlot(_ctx.$slots, "header", {
        toc: toc.value,
        frontmatter: frontmatter.value
      }, null, _push, _parent);
      _push(`<div class="${ssrRenderClass([innerClass.value, "ce-content-body"])}" data-v-4d65b530>`);
      ssrRenderSlot(_ctx.$slots, "body-start", {}, null, _push, _parent);
      if (renderedHtml.value) {
        _push(`<div class="ce-markdown" data-v-4d65b530>${renderedHtml.value ?? ""}</div>`);
      } else {
        _push(`<!---->`);
      }
      ssrRenderSlot(_ctx.$slots, "body-end", {}, null, _push, _parent);
      if (!renderedHtml.value && !loading.value) {
        ssrRenderSlot(_ctx.$slots, "empty", {}, null, _push, _parent);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      ssrRenderSlot(_ctx.$slots, "footer", {
        toc: toc.value,
        frontmatter: frontmatter.value,
        readingTime: readingTime.value
      }, null, _push, _parent);
      _push(`</div>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/markdown/Markdown.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const Markdown = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main, [["__scopeId", "data-v-4d65b530"]]), { __name: "Markdown" });

export { Markdown as M };
//# sourceMappingURL=Markdown-Bjx8TwwA.mjs.map
