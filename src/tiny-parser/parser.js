const { isGyazoUrl, getGyazoId } = require('../gyazo')
const { isUrl, shiftText, divideText } = require('./lib')

// 字下げ幅と引用であるかを把握する
const getIndentSize = text => {
  const pattern = /^\s+/
  const matched = text.match(pattern)
  const indentSize = !matched ? 0 : matched[0].length
  text = text.replace(pattern, '')

  const quotePattern = /^>\s*/
  const isQuote = quotePattern.test(text)
  text = text.replace(quotePattern, '')

  return [indentSize, isQuote, text]
}

// 括弧に囲まれた文字列を受け取り、記法の種類を特定する
// 装飾記号を除いたtextを返す
const detectBracketType = bracketText => {
  if (bracketText.endsWith('.icon')) return ['icon', bracketText.replace(/\.icon$/, '')]
  if (bracketText.startsWith('*')) return ['bold', bracketText.replace(/^\*+\s+/, '')]
  if (bracketText.startsWith('/')) return ['italic', bracketText.replace(/^\/+\s+/, '')]
  if (bracketText.startsWith('-')) return ['strike', bracketText.replace(/^\-\s+/, '')]
  if (bracketText.startsWith('$')) return ['math', bracketText.replace(/^\$\s+/, '')]
  if (bracketText.includes(' ')) {
    // type: internalLink | gyazoWithLabel | externalLinkWithLabel | externalLink
    const [type, value] = divideText(bracketText)
    return [type, value]
  } else {
    if (isUrl(bracketText)) {
      return [isGyazoUrl(bracketText) ? 'gyazo' : 'externalLink', bracketText]
    }
    return ['internalLink', bracketText]
  }
}

const detectBackquoteType = bracketText => {
  return ['inlineCode', bracketText]
}

// "[","]"で囲まれた文字列の記法を特定しながら行をparseする
const splitToBracketToks = text => {
  return splitToToks(text, /\[/, /\]/, 1, 1, detectBracketType)
}

const splitToBackquoteToks = text => {
  return splitToToks(text, /`/, /`/, 1, 1, detectBackquoteType)
}

const splitToToks = (text, bracketOpen, bracketClose, bracketOpenLen, bracketCloseLen, detecter) => {
  const toks = []

  while (text.length > 0) {
    const posOpen = text.search(bracketOpen)
    if (posOpen === -1) {
      toks.push({type: 'plain', text})
      text = ''
      break
    }

    const plainText = text.substring(0, posOpen)
    text = shiftText(text, plainText.length + bracketOpenLen)

    if (plainText.length > 0) toks.push(plainText)

    const posClose = text.search(bracketClose)
    if (posClose === -1) {
      toks.push({type: 'plain', text})
      text = ''
      break
    }

    bracketText = text.substring(0, posClose)
    text = shiftText(text, bracketText.length + bracketCloseLen)

    const [type, bodyText] = detecter(bracketText)
    toks.push({type, text: bodyText})
  }

  return toks
}


// splitToBracketToksによってplainText判定されたtokをさらに調べる
const parseBackquotes = toks => {
  for (let i = 0; i < toks.length; i++) {
    const tok = toks[i]
    if (typeof tok !== 'string') continue
    toks[i] = splitToBackquoteToks(tok)
  }
}

// 行に含まれる画像のGyazoIdsを返す
const detectGyazoIdsInLine = toks => {
  const res = []
  for (const tok of toks) {
    switch (tok.type) {
      case 'gyazo': {
        res.push(getGyazoId(tok.text))
        break
      }
      case 'gyazoWithLabel': {
        res.push(getGyazoId(tok.text.url))
        break
      }
    }
  }
  return res
}

module.exports = {
  getIndentSize, splitToBracketToks, parseBackquotes,
  detectGyazoIdsInLine
}
