import { marked } from 'marked';

function parseFrontmatter(raw = "") {
  if (typeof raw !== "string") return { data: raw || {}, content: "" };
  const marker = "---";
  const start = raw.indexOf(marker);
  if (start !== 0) return { data: {}, content: raw };
  const end = raw.indexOf(marker, marker.length);
  if (end === -1) return { data: {}, content: raw };
  const block = raw.slice(marker.length, end).trim();
  const content = raw.slice(end + marker.length);
  const data = {};
  block.split(/\r?\n/).forEach((line) => {
    const idx = line.indexOf(":");
    if (idx === -1) return;
    const k = line.slice(0, idx).trim();
    let v = line.slice(idx + 1).trim();
    if (v.startsWith('"') && v.endsWith('"') || v.startsWith("'") && v.endsWith("'")) {
      v = v.slice(1, -1);
    }
    if (k) data[k] = v;
  });
  return { data, content };
}
function adapterConvertBlockTokens(tokens) {
  const nodes = [];
  for (const token of tokens) {
    const node = convertBlockToken(token);
    if (node) nodes.push(node);
  }
  return nodes;
}
function convertBlockToken(token) {
  switch (token.type) {
    case "heading":
      return {
        type: "heading",
        depth: token.depth || 1,
        children: adapterConvertInlineTokens(token.tokens || [{ type: "text", text: token.text || "" }])
      };
    case "paragraph":
      return {
        type: "paragraph",
        children: adapterConvertInlineTokens(token.tokens || [{ type: "text", text: token.text || "" }])
      };
    case "code":
      return {
        type: "code",
        lang: token.lang || "",
        value: token.text || ""
      };
    case "blockquote":
      return {
        type: "blockquote",
        children: adapterConvertBlockTokens(token.tokens || [])
      };
    case "list":
      return {
        type: "list",
        ordered: !!token.ordered,
        children: (token.items || []).map((item) => convertListItem(item)).filter(Boolean)
      };
    case "hr":
      return { type: "thematicBreak" };
    case "table":
      return convertTable(token);
    case "html":
      return { type: "html", value: token.text || token.raw || "" };
    case "space":
      return null;
    default:
      if (token.text) {
        return { type: "paragraph", children: adapterConvertInlineTokens(token.tokens || [{ type: "text", text: token.text }]) };
      }
      return null;
  }
}
function convertListItem(item) {
  if (!item) return null;
  const children = adapterConvertBlockTokens(item.tokens || []);
  if (item.task) {
    return {
      type: "listItem",
      checked: !!item.checked,
      children
    };
  }
  return { type: "listItem", children };
}
function convertTable(token) {
  const headerCells = (token.header || []).map((cell, i) => ({
    type: "tableCell",
    align: token.align?.[i] || null,
    children: adapterConvertInlineTokens(cell.tokens || [{ type: "text", text: cell.text || "" }])
  }));
  const rows = (token.rows || []).map((row) => ({
    type: "tableRow",
    children: row.map((cell, i) => ({
      type: "tableCell",
      align: token.align?.[i] || null,
      children: adapterConvertInlineTokens(cell.tokens || [{ type: "text", text: cell.text || "" }])
    }))
  }));
  return {
    type: "table",
    children: [{ type: "tableRow", children: headerCells }, ...rows]
  };
}
function adapterConvertInlineTokens(tokens) {
  const nodes = [];
  for (const token of tokens) {
    const node = convertInlineToken(token);
    if (node) nodes.push(node);
  }
  return nodes.length > 0 ? nodes : [{ type: "text", value: "" }];
}
function convertInlineToken(token) {
  switch (token.type) {
    case "text":
      if (token.tokens && token.tokens.length > 0) {
        return { type: "text", value: token.text || "", children: adapterConvertInlineTokens(token.tokens) };
      }
      return { type: "text", value: token.text || "" };
    case "strong":
      return { type: "strong", children: adapterConvertInlineTokens(token.tokens || []) };
    case "em":
      return { type: "emphasis", children: adapterConvertInlineTokens(token.tokens || []) };
    case "del":
      return { type: "delete", children: adapterConvertInlineTokens(token.tokens || []) };
    case "link":
      return {
        type: "link",
        href: token.href || "",
        title: token.title || void 0,
        children: adapterConvertInlineTokens(token.tokens || [{ type: "text", text: token.text || "" }])
      };
    case "image":
      return {
        type: "image",
        url: token.href || "",
        alt: token.text || "",
        title: token.title || void 0
      };
    case "codespan":
      return { type: "inlineCode", value: token.text || "" };
    case "br":
      return { type: "html", value: "<br/>" };
    case "escape":
      return { type: "text", value: token.text || "" };
    case "html":
      return { type: "html", value: token.text || token.raw || "" };
    default:
      return token.text ? { type: "text", value: token.text } : null;
  }
}
function adapterInjectMathNodes(children) {
  for (const node of children) {
    if (node.children && Array.isArray(node.children)) {
      adapterInjectMathNodes(node.children);
    }
    if (typeof node.value === "string") {
      const mathNodes = adapterExtractMathFromText(node.value);
      if (mathNodes) {
        const idx = children.indexOf(node);
        if (idx !== -1) {
          children.splice(idx, 1, ...mathNodes);
        }
      }
    }
  }
}
function adapterExtractMathFromText(text) {
  if (!text.includes("$")) return null;
  const nodes = [];
  let remaining = text;
  let hasMath = false;
  const displayRe = /\$\$([\s\S]+?)\$\$/;
  const inlineRe = /\$([^\$\n]+?)\$/;
  while (remaining.length > 0) {
    const displayMatch = remaining.match(displayRe);
    const inlineMatch = remaining.match(inlineRe);
    let match = null;
    let display = false;
    if (displayMatch && (!inlineMatch || (displayMatch.index ?? 0) <= (inlineMatch.index ?? 0))) {
      match = displayMatch;
      display = true;
    } else if (inlineMatch) {
      match = inlineMatch;
      display = false;
    }
    if (!match || match.index === void 0) break;
    if (match.index > 0) {
      nodes.push({ type: "text", value: remaining.slice(0, match.index) });
    }
    nodes.push({
      type: display ? "math" : "inlineMath",
      value: (match[1] ?? "").trim(),
      display
    });
    hasMath = true;
    remaining = remaining.slice(match.index + match[0].length);
  }
  if (!hasMath) return null;
  if (remaining.length > 0) {
    nodes.push({ type: "text", value: remaining });
  }
  return nodes;
}
function buildInternalRoot(tokens, content, frontmatter, meta) {
  const children = meta.passthrough ? [{ type: "text", value: content }] : adapterConvertBlockTokens(tokens);
  const root = {
    type: "root",
    children,
    frontmatter,
    content
  };
  if (meta.source === "marked-lexer") {
    root.__parseSource = "marked-lexer";
    root.__parsedAt = meta.parsedAt || Date.now();
  }
  if (meta.parseError) {
    root.__parseError = meta.parseError;
    root.__passthrough = true;
  }
  if (meta.passthrough) {
    root.__passthrough = true;
  }
  return root;
}
marked.setOptions({ gfm: true, breaks: true });
async function parseMarkdown(raw, opts = {}) {
  if (typeof raw !== "string") {
    return buildInternalRoot(
      [],
      raw?.body || raw?.content || "",
      raw?.frontmatter || {},
      { source: "passthrough", passthrough: true }
    );
  }
  const parseFm = opts.parseFrontmatter !== false;
  const { data: frontmatter, content } = parseFm ? parseFrontmatter(raw) : { data: {}, content: raw };
  try {
    const tokens = marked.lexer(content);
    if (opts.math) {
      const temp = buildInternalRoot(tokens, content, frontmatter, { source: "marked-lexer" });
      adapterInjectMathNodes(temp.children);
      temp.__parseSource = "marked-lexer";
      temp.__parsedAt = Date.now();
      return temp;
    }
    return buildInternalRoot(tokens, content, frontmatter, {
      source: "marked-lexer",
      parsedAt: Date.now()
    });
  } catch (e) {
    return buildInternalRoot([], content, frontmatter, {
      source: "passthrough",
      parseError: e instanceof Error ? e.message : String(e),
      passthrough: true
    });
  }
}
const registry = /* @__PURE__ */ new Map();
function registerPlugin(plugin, order = 100) {
  if (!plugin || typeof plugin.name !== "string" || typeof plugin.transform !== "function") {
    throw new Error("[PluginRegistry] Invalid plugin: must have { name, transform }");
  }
  registry.set(plugin.name, { name: plugin.name, order, plugin });
}
function unregisterPlugin(name) {
  registry.delete(name);
}
function getPlugins() {
  return Array.from(registry.values()).sort((a, b) => a.order - b.order);
}
function clearPlugins() {
  registry.clear();
}
async function runPlugins(ast, context = {}) {
  let current = ast;
  for (const def of getPlugins()) {
    try {
      current = await def.plugin.transform(current, context);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.warn(`[PluginRegistry] Plugin "${def.name}" failed: ${msg}`);
    }
  }
  return current;
}
function compileToRenderTree(root, context = {}) {
  const children = (root.children || []).map((child) => compileNode(child)).filter(Boolean);
  return {
    type: "Root",
    props: {
      theme: context.theme || "default",
      class: ["ce-markdown", `ce-theme-${context.theme || "default"}`],
      "data-md-root": true
    },
    children
  };
}
function compileNode(node) {
  if (!node || typeof node !== "object") return null;
  switch (node.type) {
    case "heading": {
      const raw = node;
      return {
        type: "Heading",
        props: {
          level: Number(raw.depth || 1),
          id: typeof raw.id === "string" ? raw.id : void 0
        },
        children: compileChildren(node.children)
      };
    }
    case "paragraph":
      return {
        type: "Paragraph",
        children: compileChildren(node.children)
      };
    case "text": {
      const value = typeof node.value === "string" ? node.value : "";
      return {
        type: "Text",
        props: { value }
      };
    }
    case "strong":
      return { type: "Strong", children: compileChildren(node.children) };
    case "emphasis":
      return { type: "Emphasis", children: compileChildren(node.children) };
    case "delete":
      return { type: "Delete", children: compileChildren(node.children) };
    case "link": {
      const raw = node;
      return {
        type: "Link",
        props: {
          href: String(raw.href || ""),
          target: typeof raw.target === "string" ? raw.target : void 0,
          rel: typeof raw.rel === "string" ? raw.rel : void 0,
          title: typeof raw.title === "string" ? raw.title : void 0
        },
        children: compileChildren(node.children)
      };
    }
    case "image": {
      const raw = node;
      return {
        type: "Image",
        props: {
          src: String(raw.url || raw.href || ""),
          alt: String(raw.value || raw.alt || "")
        }
      };
    }
    case "code": {
      const raw = node;
      const lang = String(raw.lang || "");
      const value = typeof raw.value === "string" ? raw.value : "";
      return {
        type: "Code",
        props: { lang, value }
      };
    }
    case "inlineCode": {
      const value = typeof node.value === "string" ? node.value : "";
      return {
        type: "InlineCode",
        props: { value }
      };
    }
    case "list": {
      const raw = node;
      return {
        type: "List",
        props: { ordered: !!raw.ordered },
        children: compileChildren(node.children)
      };
    }
    case "listItem":
      return { type: "ListItem", children: compileChildren(node.children) };
    case "blockquote":
      return { type: "Blockquote", children: compileChildren(node.children) };
    case "thematicBreak":
      return { type: "ThematicBreak" };
    case "html": {
      const value = typeof node.value === "string" ? node.value : "";
      return {
        type: "Html",
        props: { value }
      };
    }
    case "math": {
      const display = node.display !== false;
      return {
        type: "Math",
        props: {
          formula: typeof node.value === "string" ? node.value : "",
          display
        }
      };
    }
    case "inlineMath":
      return {
        type: "InlineMath",
        props: {
          formula: typeof node.value === "string" ? node.value : "",
          display: false
        }
      };
    case "table":
      return { type: "Table", children: compileChildren(node.children) };
    case "tableRow":
      return { type: "TableRow", children: compileChildren(node.children) };
    case "tableCell": {
      const raw = node;
      return {
        type: "TableCell",
        props: { align: raw.align },
        children: compileChildren(node.children)
      };
    }
    default:
      return node.value != null ? { type: "Text", props: { value: String(node.value) } } : null;
  }
}
function compileChildren(children) {
  if (!children || children.length === 0) return "";
  return children.map((child) => compileNode(child)).filter(Boolean);
}
function extractTextFromNode(node) {
  if (!node) return "";
  if (typeof node.value === "string") return node.value;
  if (Array.isArray(node.children)) {
    return node.children.map((child) => extractTextFromNode(child)).join("");
  }
  return "";
}
function slugifyHeading(text = "") {
  return String(text).trim().toLowerCase().replace(/[\s]+/g, "-").replace(/[^a-z0-9_\-\u4e00-\u9fa5]/g, "").replace(/-+/g, "-").replace(/^-|-$/g, "");
}
const HeadingTransformer = {
  async transform(ast, context = {}) {
    if (!ast || ast.__headingInjected) return ast;
    let idCounter = 0;
    const headings = [];
    const inject = (node) => {
      if (!node || typeof node !== "object") return;
      if (node.type === "heading" && !node.id) {
        const text = extractTextFromNode(node);
        node.id = slugifyHeading(text) || `h-${idCounter++}`;
        headings.push({
          id: String(node.id),
          text,
          level: Number(node.depth || 1)
        });
      }
      if (Array.isArray(node.children)) node.children.forEach(inject);
    };
    if (Array.isArray(ast.children)) ast.children.forEach(inject);
    ast.__headingInjected = true;
    ast.headings = headings;
    return ast;
  }
};
function renderTreeToHTML(tree, _context = {}) {
  const root = Array.isArray(tree) ? tree : tree.children;
  return root.map((n) => renderNode(n)).join("\n");
}
function renderNode(node) {
  if (typeof node === "string") return escapeHtml$1(node);
  if (!node || !node.type) return "";
  switch (node.type) {
    case "Root": {
      const children = node.children;
      const cls = Array.isArray(node.props?.class) ? ` class="${node.props?.class?.join(" ")}"` : "";
      return `<div${cls} data-md-root="true">${children.map((c) => renderNode(c)).join("")}</div>`;
    }
    case "Heading": {
      const level = Number(node.props?.level || 1);
      const id = typeof node.props?.id === "string" ? node.props.id : (() => {
        const text = getTextFromChildren(node.children);
        return text ? slugifyHeading(text) : void 0;
      })();
      const idAttr = id ? ` id="${id}"` : "";
      return `<h${level}${idAttr}>${renderChildren(node.children)}</h${level}>
`;
    }
    case "Paragraph":
      return `<p>${renderChildren(node.children)}</p>
`;
    case "Text": {
      const value = typeof node.props?.value === "string" ? node.props.value : "";
      return escapeHtml$1(value);
    }
    case "Strong":
      return `<strong>${renderChildren(node.children)}</strong>`;
    case "Emphasis":
      return `<em>${renderChildren(node.children)}</em>`;
    case "Delete":
      return `<del>${renderChildren(node.children)}</del>`;
    case "Link": {
      const href = escapeAttr(String(node.props?.href || ""));
      const target = typeof node.props?.target === "string" ? ` target="${escapeAttr(node.props.target)}"` : "";
      const rel = typeof node.props?.rel === "string" ? ` rel="${escapeAttr(node.props.rel)}"` : "";
      const title = typeof node.props?.title === "string" ? ` title="${escapeAttr(node.props.title)}"` : "";
      return `<a href="${href}"${target}${rel}${title}>${renderChildren(node.children)}</a>`;
    }
    case "Image": {
      const src = escapeAttr(String(node.props?.src || ""));
      const alt = escapeAttr(String(node.props?.alt || ""));
      return `<img src="${src}" alt="${alt}"/>`;
    }
    case "Code": {
      const lang = typeof node.props?.lang === "string" ? node.props.lang : "";
      const value = typeof node.props?.value === "string" ? node.props.value : "";
      const langAttr = lang ? ` data-lang="${escapeAttr(lang)}"` : "";
      return `<pre${langAttr}><code${langAttr}>${escapeHtml$1(value)}</code></pre>
`;
    }
    case "InlineCode": {
      const value = typeof node.props?.value === "string" ? node.props.value : "";
      return `<code>${escapeHtml$1(value)}</code>`;
    }
    case "List": {
      const tag = node.props?.ordered ? "ol" : "ul";
      return `<${tag}>
${renderChildren(node.children)}
</${tag}>
`;
    }
    case "ListItem":
      return `<li>${renderChildren(node.children)}</li>`;
    case "Blockquote":
      return `<blockquote>
${renderChildren(node.children)}
</blockquote>
`;
    case "ThematicBreak":
      return `<hr/>
`;
    case "Html": {
      const value = typeof node.props?.value === "string" ? node.props.value : "";
      return value;
    }
    case "Math":
    case "InlineMath": {
      const formula = typeof node.props?.formula === "string" ? node.props.formula : "";
      const display = node.type === "Math" && node.props?.display !== false;
      const delim = display ? "$$" : "$";
      return `<span class="math math-${display ? "display" : "inline"}" data-display="${display ? "true" : "false"}">${delim}${escapeHtml$1(formula)}${delim}</span>`;
    }
    case "Table":
      return `<table>${renderChildren(node.children)}</table>
`;
    case "TableRow":
      return `<tr>${renderChildren(node.children)}</tr>`;
    case "TableCell": {
      const align = typeof node.props?.align === "string" ? node.props.align : null;
      const style = align ? ` style="text-align:${escapeAttr(align)}"` : "";
      return `<td${style}>${renderChildren(node.children)}</td>`;
    }
    default:
      return "";
  }
}
function renderChildren(children) {
  if (typeof children === "string") return escapeHtml$1(children);
  if (!children || children.length === 0) return "";
  return children.map((c) => renderNode(c)).join("");
}
function getTextFromChildren(children) {
  if (typeof children === "string") return children;
  if (!children || children.length === 0) return "";
  return children.map((c) => {
    if (typeof c === "string") return c;
    if (c.type === "Text") return String(c.props?.value || "");
    return getTextFromChildren(c.children);
  }).join("");
}
function escapeHtml$1(s = "") {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function escapeAttr(s = "") {
  return escapeHtml$1(s);
}
async function renderToHTML$1(ast, context = {}) {
  if (!ast) return "";
  const content = typeof ast.content === "string" ? ast.content : "";
  if (!content) return "";
  try {
    const tree = compileToRenderTree(ast, { theme: context.theme });
    return renderTreeToHTML(tree, context);
  } catch {
    return escapeHtml(content);
  }
}
function escapeHtml(s = "") {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function renderTreeToVNode(tree, context = {}) {
  const root = Array.isArray(tree) ? { props: { theme: context.theme || "default" }, children: tree } : tree;
  return adaptRoot(root, context);
}
function adaptRoot(root, context) {
  const children = (root.children || []).map((c) => adaptNode(c)).filter(Boolean);
  return {
    type: "root",
    is: "div",
    props: {
      class: Array.isArray(root.props?.class) ? root.props.class : ["ce-markdown", `ce-theme-${context.theme || "default"}`],
      "data-md-root": true
    },
    children
  };
}
function adaptNode(node) {
  if (typeof node === "string") {
    return { type: "text", is: "#text", props: { nodeValue: node } };
  }
  if (!node || !node.type) return null;
  switch (node.type) {
    case "Heading": {
      const level = Number(node.props?.level || 1);
      return {
        type: "heading",
        is: `h${level}`,
        props: { id: typeof node.props?.id === "string" ? node.props.id : void 0 },
        children: adaptChildren(node.children)
      };
    }
    case "Paragraph":
      return {
        type: "paragraph",
        is: "p",
        children: adaptChildren(node.children)
      };
    case "Text": {
      const value = typeof node.props?.value === "string" ? node.props.value : "";
      return { type: "text", is: "#text", props: { nodeValue: value } };
    }
    case "Strong":
      return { type: "strong", is: "strong", children: adaptChildren(node.children) };
    case "Emphasis":
      return { type: "emphasis", is: "em", children: adaptChildren(node.children) };
    case "Delete":
      return { type: "delete", is: "del", children: adaptChildren(node.children) };
    case "Link": {
      return {
        type: "link",
        is: "a",
        props: {
          href: String(node.props?.href || ""),
          target: typeof node.props?.target === "string" ? node.props.target : void 0,
          rel: typeof node.props?.rel === "string" ? node.props.rel : void 0,
          title: typeof node.props?.title === "string" ? node.props.title : void 0
        },
        children: adaptChildren(node.children)
      };
    }
    case "Image": {
      return {
        type: "image",
        is: "img",
        props: {
          src: String(node.props?.src || ""),
          alt: String(node.props?.alt || "")
        }
      };
    }
    case "Code": {
      const lang = typeof node.props?.lang === "string" ? node.props.lang : "";
      const value = typeof node.props?.value === "string" ? node.props.value : "";
      return {
        type: "code",
        is: "pre",
        props: { "data-lang": lang },
        children: [
          {
            type: "code",
            is: "code",
            props: { "data-lang": lang },
            children: [{ type: "text", is: "#text", props: { nodeValue: value } }]
          }
        ]
      };
    }
    case "InlineCode": {
      const value = typeof node.props?.value === "string" ? node.props.value : "";
      return { type: "inlineCode", is: "code", props: { nodeValue: value } };
    }
    case "List": {
      const ordered = !!node.props?.ordered;
      return {
        type: "list",
        is: ordered ? "ol" : "ul",
        children: adaptChildren(node.children)
      };
    }
    case "ListItem":
      return { type: "listItem", is: "li", children: adaptChildren(node.children) };
    case "Blockquote":
      return { type: "blockquote", is: "blockquote", children: adaptChildren(node.children) };
    case "ThematicBreak":
      return { type: "thematicBreak", is: "hr" };
    case "Html": {
      const value = typeof node.props?.value === "string" ? node.props.value : "";
      return { type: "html", is: "div", props: { innerHTML: value } };
    }
    case "Math": {
      const formula = typeof node.props?.formula === "string" ? node.props.formula : "";
      node.props?.display !== false;
      return {
        type: "math",
        is: "KatexElement",
        props: { formula, display: true }
      };
    }
    case "InlineMath": {
      const formula = typeof node.props?.formula === "string" ? node.props.formula : "";
      return {
        type: "inlineMath",
        is: "KatexElement",
        props: { formula, display: false }
      };
    }
    case "Table":
      return { type: "table", is: "table", children: adaptChildren(node.children) };
    case "TableRow":
      return { type: "tableRow", is: "tr", children: adaptChildren(node.children) };
    case "TableCell":
      return { type: "tableCell", is: "td", children: adaptChildren(node.children) };
    default: {
      const v = node.props?.value;
      return v != null ? { type: String(node.type || "text"), is: "#text", props: { nodeValue: String(v) } } : null;
    }
  }
}
function adaptChildren(children) {
  if (typeof children === "string") return "";
  if (!children || children.length === 0) return "";
  return children.map((child) => adaptNode(child)).filter(Boolean);
}
async function renderToVNode$1(ast, context = {}) {
  if (!ast) return null;
  const tree = compileToRenderTree(ast, { theme: context.theme });
  return renderTreeToVNode(tree, context);
}
async function runRenderPipeline(rawContent, opts = {}) {
  const result = {
    raw: rawContent,
    ast: null,
    enhancedAST: null,
    rendered: null,
    errors: []
  };
  try {
    let ast = null;
    if (typeof rawContent === "string") {
      ast = await parseMarkdown(rawContent, opts.parserOptions || {});
    } else if (rawContent && typeof rawContent === "object") {
      const obj = rawContent;
      if (obj.type === "root" || obj.ast) {
        ast = obj.ast || obj;
      } else if (typeof obj.body === "string") {
        ast = await parseMarkdown(obj.body, opts.parserOptions || {});
      } else {
        ast = rawContent;
      }
    } else {
      ast = rawContent;
    }
    result.ast = ast;
    let enhanced = ast;
    result.enhancedAST = enhanced;
    if (enhanced) {
      enhanced = await runPlugins(enhanced, opts.transformerContext || {});
      result.enhancedAST = enhanced;
    }
    if (enhanced) {
      if (opts.renderTarget === "html") {
        result.rendered = await renderToHTML$1(enhanced, opts.rendererContext || {});
      } else {
        result.rendered = await renderToVNode$1(enhanced, opts.rendererContext || {});
      }
    }
  } catch (e) {
    result.errors.push(e instanceof Error ? e : new Error(String(e)));
  }
  return result;
}
async function renderToHTML(rawContent, opts = {}) {
  const r = await runRenderPipeline(rawContent, { ...opts, renderTarget: "html" });
  return r.rendered || "";
}
async function renderToVNode(rawContent, opts = {}) {
  const r = await runRenderPipeline(rawContent, { ...opts, renderTarget: "vnode" });
  return r.rendered || null;
}
const TocTransformer = {
  async transform(ast, context = {}) {
    const toc = [];
    const walk = (node, depth = 0) => {
      if (!node || typeof node !== "object") return;
      if (node.type === "heading") {
        toc.push({
          id: String(node.id || ""),
          level: Number(node.depth || depth),
          text: extractTextFromNode(node)
        });
      }
      if (Array.isArray(node.children)) node.children.forEach((child) => walk(child, depth + 1));
    };
    if (ast && Array.isArray(ast.children)) {
      ast.children.forEach((n) => walk(n, 0));
    }
    if (ast) ast.toc = toc;
    return ast;
  }
};
const LinksTransformer = {
  async transform(ast, context = {}) {
    const rewrite = (node) => {
      if (!node) return;
      if (node.type === "link" && typeof node.href === "string") {
        if (node.href.startsWith("/") && !node.href.startsWith("/api")) {
          node.__rewrite = "internal-route";
        } else if (/^https?:\/\//.test(node.href)) {
          node.target = node.target || "_blank";
          node.rel = node.rel || "noopener noreferrer";
          node.__rewrite = "external";
        }
      }
      if (Array.isArray(node.children)) node.children.forEach(rewrite);
    };
    if (ast && Array.isArray(ast.children)) {
      ast.children.forEach((n) => rewrite(n));
    }
    if (ast) ast.__linksProcessed = true;
    return ast;
  }
};
const ExcerptTransformer = {
  async transform(ast, context = {}) {
    const content = ast && typeof ast.content === "string" ? ast.content : "";
    const plain = content.replace(/[#*`>\[\]\n]+/g, " ").replace(/\s+/g, " ").trim();
    const excerptLimit = context.excerptLimit || 140;
    if (ast) {
      ast.excerpt = plain.length > excerptLimit ? plain.slice(0, excerptLimit) + "…" : plain;
    }
    return ast;
  }
};
const CJK_CHAR_RATE = 1.8;
const WPM_CN = 300;
const WPM_EN = 200;
const ReadingTimeTransformer = {
  async transform(ast, context = {}) {
    const content = ast && typeof ast.content === "string" ? ast.content : "";
    const cjkChars = (content.match(/[\u4e00-\u9fa5]/g) || []).length;
    const enWords = content.replace(/[\u4e00-\u9fa5]/g, " ").split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.round(cjkChars / WPM_CN + enWords / WPM_EN));
    const cjkRate = cjkChars * CJK_CHAR_RATE / Math.max(1, content.length);
    const info = {
      minutes,
      seconds: minutes * 60,
      words: Math.round(enWords + cjkChars * CJK_CHAR_RATE),
      cjkChars,
      enWords,
      cjkRate: Number(cjkRate.toFixed(2))
    };
    if (ast) {
      ast.readingTime = info;
      ast.readingTimeMinutes = minutes;
    }
    return ast;
  }
};
const ReferenceTransformer = {
  async transform(ast, context = {}) {
    if (ast) {
      ast.references = ast.references || [];
      ast.__referencesProcessed = true;
    }
    return ast;
  }
};
const headingPlugin = {
  name: "heading",
  version: "1.0.0",
  transform: (ast, ctx) => HeadingTransformer.transform(ast, ctx)
};
const tocPlugin = {
  name: "toc",
  version: "1.0.0",
  transform: (ast, ctx) => TocTransformer.transform(ast, ctx)
};
const linksPlugin = {
  name: "links",
  version: "1.0.0",
  transform: (ast, ctx) => LinksTransformer.transform(ast, ctx)
};
const excerptPlugin = {
  name: "excerpt",
  version: "1.0.0",
  transform: (ast, ctx) => ExcerptTransformer.transform(ast, ctx)
};
const readingTimePlugin = {
  name: "readingTime",
  version: "1.0.0",
  transform: (ast, ctx) => ReadingTimeTransformer.transform(ast, ctx)
};
const referencePlugin = {
  name: "reference",
  version: "1.0.0",
  transform: (ast, ctx) => ReferenceTransformer.transform(ast, ctx)
};
const BUILTIN_PLUGINS = [
  { name: "heading", order: 10, plugin: headingPlugin },
  { name: "toc", order: 20, plugin: tocPlugin },
  { name: "links", order: 30, plugin: linksPlugin },
  { name: "excerpt", order: 40, plugin: excerptPlugin },
  { name: "readingTime", order: 50, plugin: readingTimePlugin },
  { name: "reference", order: 100, plugin: referencePlugin }
];
function registerBuiltinPlugins(enabled) {
  const enabledSet = enabled ? new Set(enabled) : null;
  const registered = [];
  for (const def of BUILTIN_PLUGINS) {
    if (enabledSet && !enabledSet.has(def.name)) continue;
    registerPlugin(def.plugin, def.order);
    registered.push(def.name);
  }
  return registered;
}
function renderTreeToJSON(tree, _context = {}, opts = {}) {
  const pretty = opts.pretty !== false;
  const indent = typeof opts.indent === "number" ? opts.indent : 2;
  const safe = JSON.parse(JSON.stringify(tree));
  return pretty ? JSON.stringify(safe, null, indent) : JSON.stringify(safe);
}
function parseJSONToRenderTree(json) {
  return JSON.parse(json);
}
function createEngine(config = {}) {
  clearPlugins();
  registerBuiltinPlugins(config.plugins);
  if (config.customPlugins) {
    for (const p of config.customPlugins) {
      registerPlugin(p, p.order || 100);
    }
  }
  return {
    async parse(md, opts = {}) {
      return parseMarkdown(md, { ...config.parserOptions, ...opts });
    },
    async render(content, opts = {}) {
      const target = opts.target || "html";
      if (target === "html") {
        return renderToHTML(content, opts);
      }
      return renderToVNode(content, opts);
    },
    async compile(md, opts = {}) {
      const htmlResult = await runRenderPipeline(md, {
        ...opts,
        renderTarget: "html"
      });
      const vnodeResult = await runRenderPipeline(md, {
        ...opts,
        renderTarget: "vnode"
      });
      return {
        ast: htmlResult.ast,
        enhancedAST: htmlResult.enhancedAST,
        html: htmlResult.rendered || "",
        vnode: vnodeResult.rendered || null,
        errors: [...htmlResult.errors, ...vnodeResult.errors]
      };
    },
    registerPlugin(plugin, order = 100) {
      registerPlugin(plugin, order);
    },
    unregisterPlugin(name) {
      unregisterPlugin(name);
    },
    listPlugins() {
      return getPlugins().map((p) => p.name);
    },
    run(content, opts) {
      return runRenderPipeline(content, opts);
    }
  };
}
let defaultEngine = null;
function getEngine() {
  if (!defaultEngine) {
    defaultEngine = createEngine();
  }
  return defaultEngine;
}
function setEngine(engine) {
  defaultEngine = engine;
}
const index = { createEngine, getEngine, parseMarkdown, renderToHTML, renderToVNode, compileToRenderTree };

export { adapterConvertBlockTokens, adapterConvertInlineTokens, adapterInjectMathNodes, buildInternalRoot, clearPlugins, compileToRenderTree, createEngine, index as default, getEngine, getPlugins, parseJSONToRenderTree, parseMarkdown, registerBuiltinPlugins, registerPlugin, renderToHTML, renderToVNode, renderTreeToHTML, renderTreeToJSON, renderTreeToVNode, runRenderPipeline, setEngine, unregisterPlugin };
//# sourceMappingURL=index-BVTkTKBe.mjs.map
