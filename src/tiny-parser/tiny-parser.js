const {flattenDeep} = require('lodash')
const {getIndentSize, splitToBracketToks, parseBackquotes} = require('./parser')
const {detectGyazoIdsInLine} = require('./gyazo')

class TinyParser {
  constructor() {
    this.initBlockState()
    this._res = []
    this.topGyazoId = null
  }

  get result () {
    return this._res
  }

  initBlockState () {
    this._opendBlock = null // 'codeblock'
    this._blockIndent = 0
    this._blockPool = []
  }

  parseBlock (indent, text, isStart) {
    if (!isStart && indent <= this._blockIndent) {
      // block終了
      this._res.push({
        block: this._opendBlock,
        indent: this._blockIndent,
        toks: this._blockPool
      })
      this.initBlockState()
    } else {
      // 先頭の空白を1個だけ除去
      this._blockPool.push(text.replace(/^\s/, ''))
    }
  }

  parseNewLine (text) {
    const [indent, isQuote, trimedText] = getIndentSize(text)

    let blockStart = false
    if (trimedText.startsWith('code:')) {
      blockStart = true
      this._blockIndent = indent
      this._opendBlock = 'codeblock'
      text = text.replace(/code:/, '')
    }

    if (this._opendBlock) {
      this.parseBlock(indent, text, blockStart)
      // 直前のparseでblockがcloseされている可能性があるので再度確認
      if (this._opendBlock) return
    }

    const toks = splitToBracketToks(trimedText)
    if (!this.topGyazoId) {
      const gyazoIds = detectGyazoIdsInLine(toks)
      if (gyazoIds.length > 0) this.topGyazoId = gyazoIds[0]
    }
    parseBackquotes(toks)

    this._res.push({indent, isQuote, toks: flattenDeep(toks)})
  }
}

module.exports = TinyParser
