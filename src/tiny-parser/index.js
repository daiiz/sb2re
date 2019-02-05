const TinyParser = require('./parse-line')

const parseLines = lines => {
  const parser = new TinyParser() // 複数行に跨ることあるので状態管理必要
  for (const line of lines) {
    parser.parseNewLine(line)
  }
  return [parser.result, parser.topGyazoId]
}

const getGyazoUrlList = pageRes => {
  const gayzoUrls = []
  // page
  for (const res of pageRes) {
    const toks = res.toks
    // line
    for (const tok of toks) {
      if (typeof tok === 'string') continue
      if (tok.type === 'gyazo') {
        gayzoUrls.push(tok.text.url || tok.text)
      }
    }
  }
  return gayzoUrls
}

module.exports = {parseLines, getGyazoUrlList}
