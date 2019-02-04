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

const shiftText = (strText, shiftNum) => {
  const text = strText.split('')
  for (let i = 0; i < shiftNum; i++) text.shift()
  return text.join('')
}

const isUrl = text => {
  return /^https?:\/\//.test(text)
}

const isGyazoUrl = text => {
  return /^https:\/\/gyazo\.com\//.test(text)
}

// 括弧に囲まれた文字列を受け取り、記法の種類を特定する
// 装飾記号を除いたtextを返す
const detectBracketType = bracketText => {
  if (bracketText.endsWith('.icon')) return ['icon', bracketText.replace(/\.icon$/, '')]
  if (bracketText.startsWith('*')) return ['bold', bracketText.replace(/^\*+\s+/, '')]
  if (bracketText.startsWith('/')) return ['italic', bracketText.replace(/^\/+\s+/, '')]
  if (bracketText.startsWith('-')) return ['strike', bracketText.replace(/^\-\s+/, '')]
  if (bracketText.startsWith('$')) return ['math', bracketText.replace(/^\$\s+/, '')]
  if (!bracketText.includes(' ')) {
    if (isUrl(bracketText)) {
      return [isGyazoUrl(bracketText) ? 'gyazo' : 'externalLink', bracketText]
    }
    return ['internalLink', bracketText]
  }
  if (bracketText.includes(' ') && bracketText.split(' ').length >= 2) {
    // ラベル付きリンク
    const [a, b] = bracketText.split(' ')
    if (isUrl(a)) {
      return [isGyazoUrl(a) ? 'gyazoWithLabel' : 'externalLinkWithLabel', {url: a, label: b}]
    } else if (isUrl(b)) {
      return [isGyazoUrl(b) ? 'gyazoWithLabel' : 'externalLinkWithLabel', {url: b, label: a}]
    } else {
      return ['internalLink', bracketText]
    }
  }
  return ['bracket', bracketText]
}

const detectBackquoteType = bracketText => {
  return ['backquote', bracketText]
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
      toks.push(text)
      text = ''
      break
    }

    const plainText = text.substring(0, posOpen)
    text = shiftText(text, plainText.length + bracketOpenLen)

    if (plainText.length > 0) toks.push(plainText)

    const posClose = text.search(bracketClose)
    if (posClose === -1) {
      toks.push({type: '', text})
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

module.exports = {getIndentSize, splitToBracketToks, parseBackquotes}
