import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkFrontmatter from 'remark-frontmatter';
import remarkSlug from 'remark-slug';
import rehypeKatex from 'rehype-katex';

let plugins = [];
function registerPlugin(plugin, order = 100) {
  var _a, _b;
  const existingIndex = plugins.findIndex((p) => p.name === plugin.name);
  if (existingIndex >= 0) {
    plugins[existingIndex] = { ...plugin, order: (_a = plugin.order) != null ? _a : order };
  } else {
    plugins.push({ ...plugin, order: (_b = plugin.order) != null ? _b : order });
  }
  plugins.sort((a, b) => {
    var _a2, _b2;
    return ((_a2 = a.order) != null ? _a2 : 100) - ((_b2 = b.order) != null ? _b2 : 100);
  });
}
function getPlugins() {
  return [...plugins];
}

async function renderToHTML$1(content) {
  const processor = unified().use(remarkParse);
  const plugins = getPlugins();
  for (const plugin of plugins) {
    if (plugin.remark) {
      processor.use(plugin.remark, plugin.options || {});
    }
  }
  processor.use(remarkRehype, { allowDangerousHtml: true });
  for (const plugin of plugins) {
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

export { renderToHTML as r };
//# sourceMappingURL=index.mjs.map
