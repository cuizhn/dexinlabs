import { defineConfig } from 'vitepress'
import container from 'markdown-it-container'

function parseAttrs(info: string): Record<string, string> {
  const match = info.match(/\{([^}]+)\}/)
  if (!match) return {}
  const attrs: Record<string, string> = {}
  match[1].split(',').forEach(pair => {
    const [key, value] = pair.split(':').map(s => s.trim())
    if (key && value) attrs[key] = value
  })
  return attrs
}

export default defineConfig({
  title: '得心实验室',
  lang: 'zh-CN',
  description: '课程内容预览',
  cleanUrls: true,
  srcDir: 'lessons',

  markdown: {
    math: true,
    config(md) {
      // ::: definition{term:xxx}
      md.use(container, 'definition', {
        validate: (params) => params.trim().startsWith('definition'),
        render: (tokens, idx) => {
          if (tokens[idx].nesting === 1) {
            const attrs = parseAttrs(tokens[idx].info)
            const term = attrs.term || ''
            return `<div class="definition">\n<dt class="term">${md.utils.escapeHtml(term)}</dt>\n<dd class="content">\n`
          } else {
            return `</dd>\n</div>\n`
          }
        }
      })

      // ::: example{title:xxx}
      md.use(container, 'example', {
        validate: (params) => params.trim().startsWith('example'),
        render: (tokens, idx) => {
          if (tokens[idx].nesting === 1) {
            const attrs = parseAttrs(tokens[idx].info)
            const title = attrs.title || ''
            return `<div class="example">\n${title ? `<div class="title">${md.utils.escapeHtml(title)}</div>\n` : ''}<div class="body">\n`
          } else {
            return `</div>\n</div>\n`
          }
        }
      })

      // ::: hint{level:info|tip|warning|danger}
      md.use(container, 'hint', {
        validate: (params) => params.trim().startsWith('hint'),
        render: (tokens, idx) => {
          if (tokens[idx].nesting === 1) {
            const attrs = parseAttrs(tokens[idx].info)
            const level = attrs.level || 'info'
            const labelMap: Record<string, string> = {
              info: '💡 信息',
              tip: '✨ 提示',
              warning: '⚠️ 注意',
              danger: '🚨 警告'
            }
            const label = labelMap[level] || labelMap.info
            return `<div class="hint hint--${level}">\n<div class="header">${label}</div>\n<div class="body">\n`
          } else {
            return `</div>\n</div>\n`
          }
        }
      })

      // ::: question{hint:xxx}
      md.use(container, 'question', {
        validate: (params) => params.trim().startsWith('question'),
        render: (tokens, idx) => {
          if (tokens[idx].nesting === 1) {
            return `<div class="question">\n<div class="prompt">\n`
          } else {
            return `</div>\n</div>\n`
          }
        }
      })
    }
  },

  themeConfig: {
    sidebar: [
      {
        text: '一元一次方程',
        items: [
          { text: '认识一元一次方程', link: '/linear-equations/01-basics/01-intro/' }
        ]
      },
      {
        text: '集合',
        items: [
          { text: '为什么数学需要集合？', link: '/sets/01-basics/01-why-sets/' }
        ]
      }
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/cuizhn/dexinlabs' }
    ]
  }
})
