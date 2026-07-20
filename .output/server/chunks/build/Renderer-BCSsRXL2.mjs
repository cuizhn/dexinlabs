import { ref, computed, watch, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderSlot, ssrRenderClass } from 'vue/server-renderer';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkFrontmatter from 'remark-frontmatter';
import remarkSlug from 'remark-slug';
import rehypeKatex from 'rehype-katex';
import { _ as _export_sfc } from './_plugin-vue_export-helper-1tPrXgE0.mjs';

let plugins = [];
function registerPlugin(plugin, order = 100) {
  const existingIndex = plugins.findIndex((p) => p.name === plugin.name);
  if (existingIndex >= 0) {
    plugins[existingIndex] = { ...plugin, order: plugin.order ?? order };
  } else {
    plugins.push({ ...plugin, order: plugin.order ?? order });
  }
  plugins.sort((a, b) => (a.order ?? 100) - (b.order ?? 100));
}
function getPlugins() {
  return [...plugins];
}
async function renderToHTML$1(content) {
  const processor = unified().use(remarkParse);
  const plugins2 = getPlugins();
  for (const plugin of plugins2) {
    if (plugin.remark) {
      processor.use(plugin.remark, plugin.options || {});
    }
  }
  processor.use(remarkRehype, { allowDangerousHtml: true });
  for (const plugin of plugins2) {
    if (plugin.rehype) {
      processor.use(plugin.rehype, plugin.options || {});
    }
  }
  processor.use(rehypeStringify, { allowDangerousHtml: true });
  const file = await processor.process(content);
  return String(file);
}
const BUILTIN_PLUGINS = {
  gfm: {
    name: "gfm",
    remark: remarkGfm,
    order: 10
  },
  math: {
    name: "math",
    remark: remarkMath,
    rehype: rehypeKatex,
    order: 20
  },
  frontmatter: {
    name: "frontmatter",
    remark: remarkFrontmatter,
    options: ["yaml"],
    order: 5
  },
  headingSlug: {
    name: "headingSlug",
    remark: remarkSlug,
    order: 30
  }
};
function registerBuiltinPlugins(enabledPlugins) {
  const toEnable = ["gfm", "math", "frontmatter", "headingSlug"];
  for (const name of toEnable) {
    const plugin = BUILTIN_PLUGINS[name];
    if (plugin) {
      registerPlugin(plugin, plugin.order);
    }
  }
}
registerBuiltinPlugins();
async function renderToHTML(content) {
  return renderToHTML$1(content);
}
const _sfc_main = {
  __name: "ContentRenderer",
  __ssrInlineRender: true,
  props: {
    value: { type: Object, default: () => ({}) },
    content: { type: String, default: "" },
    theme: { type: String, default: "default" }
  },
  setup(__props) {
    const props = __props;
    const renderedHtml = ref("");
    const loading = ref(false);
    const markdownString = computed(() => {
      if (typeof props.content === "string" && props.content.trim()) {
        return props.content;
      }
      const source = props.value || {};
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
        return;
      }
      loading.value = true;
      try {
        renderedHtml.value = await renderToHTML(md);
      } catch (e) {
        renderedHtml.value = "";
      } finally {
        loading.value = false;
      }
    }, { immediate: true });
    const frontmatter = computed(() => ({}));
    const toc = computed(() => []);
    const readingTime = computed(() => null);
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
      }, _attrs))} data-v-ec55d4df>`);
      ssrRenderSlot(_ctx.$slots, "header", {
        toc: toc.value,
        frontmatter: frontmatter.value
      }, null, _push, _parent);
      _push(`<div class="${ssrRenderClass([innerClass.value, "ce-content-body"])}" data-v-ec55d4df>`);
      ssrRenderSlot(_ctx.$slots, "body-start", {}, null, _push, _parent);
      if (renderedHtml.value) {
        _push(`<div class="ce-markdown" data-v-ec55d4df>${renderedHtml.value ?? ""}</div>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/content/Renderer.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const ContentRenderer = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-ec55d4df"]]);

export { ContentRenderer as C };
//# sourceMappingURL=Renderer-BCSsRXL2.mjs.map
