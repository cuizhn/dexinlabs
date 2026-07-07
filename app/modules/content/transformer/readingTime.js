const CJK_CHAR_RATE = 1.8
const WPM_CN = 300
const WPM_EN = 200

export const ReadingTimeTransformer = {
  async transform(ast, context = {}) {
    const content = typeof ast?.content === 'string' ? ast.content : ''
    const cjkChars = (content.match(/[\u4e00-\u9fa5]/g) || []).length
    const enWords = content
      .replace(/[\u4e00-\u9fa5]/g, ' ')
      .split(/\s+/)
      .filter(Boolean).length

    const minutes = Math.max(
      1,
      Math.round(cjkChars / WPM_CN + enWords / WPM_EN)
    )
    const cjkRate = (cjkChars * CJK_CHAR_RATE) / Math.max(1, content.length)
    ast.readingTime = {
      minutes,
      seconds: minutes * 60,
      words: Math.round(enWords + cjkChars * CJK_CHAR_RATE),
      cjkChars,
      enWords,
      cjkRate: Number(cjkRate.toFixed(2))
    }
    return ast
  }
}

export default ReadingTimeTransformer
