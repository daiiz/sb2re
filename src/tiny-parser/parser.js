const { isGyazoUrl } = require('../gyazo')
const { isUrl, shiftText, divideText } = require('./lib')
const { toLc } = require('../writer/')

const scrapboxUrl = 'https://scrapbox.io'

const BOLD = /^\*+\s+/
const ITALIC = /^\/+\s+/
const STRIKE = /^\-\s+/
const MATH = /^\$\s+/
const ICON = /\.icon$/

// 字下げ幅, 引用, Shellであるかを把握する
const getIndentSize = text => {
  const pattern = /^\s+/
  const matched = text.match(pattern)
  const indentSize = !matched ? 0 : matched[0].length
  text = text.replace(pattern, '')

  const quotePattern = /^>\s*/
  const isQuote = quotePattern.test(text)
  text = text.replace(quotePattern, '')

  const shellPattetn = /^\$\s+/
  const isShell = shellPattetn.test(text)
  text = text.replace(shellPattetn, '')

  return [indentSize, isQuote, isShell, text]
}

// 括弧に囲まれた文字列を受け取り、記法の種類を特定する
// 装飾記号を除いたtextを返す
const detectBracketType = bracketText => {
  if (BOLD.test(bracketText)) return ['bold', bracketText.replace(BOLD, '')]
  if (ITALIC.test(bracketText)) return ['italic', bracketText.replace(ITALIC, '')]
  if (STRIKE.test(bracketText)) return ['strike', bracketText.replace(STRIKE, '')]
  if (MATH.test(bracketText)) return ['math', bracketText.replace(MATH, '')]
  if (ICON.test(bracketText)) return ['icon', bracketText.replace(ICON, '')]
  if (bracketText.startsWith('/')) {
    return ['externalLinkWithLabel', {
      label: bracketText,
      url: `${scrapboxUrl}${toLc(bracketText)}`
    }]
  }
  if (bracketText.includes(' ')) {
    // type: internalLink | gyazoWithLabel | externalLinkWithLabel | externalLink
    return divideText(bracketText)
  } else {
    return isUrl(bracketText)
      ? [isGyazoUrl(bracketText) ? 'gyazo' : 'externalLink', bracketText]
      : ['internalLink', bracketText]
  }
}

const detectBackquoteType = bracketText => ['inlineCode', bracketText]

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
      break
    }

    const plainText = text.substring(0, posOpen)
    text = shiftText(text, plainText.length + bracketOpenLen)

    if (plainText.length > 0) {
      toks.push({type: 'plain', text: plainText})
    }

    const posClose = text.search(bracketClose)
    if (posClose === -1) {
      toks.push({type: 'plain', text})
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
    if (tok.type === 'plain') toks[i] = splitToBackquoteToks(tok.text)
  }
}

module.exports = {getIndentSize, splitToBracketToks, parseBackquotes}
