const {flattenDeep} = require('lodash')
const {getIndentSize, splitToBracketToks, parseBackquotes} = require('./lib')

class TinyParser {
  constructor() {
    this.initBlockState()
    this._res = []
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

    // if (text.length === 0 || text.length === this._blockIndent) {
    if (!isStart && (indent === 0 || indent === this._blockIndent)) {
      this._res.push({
        block: this._opendBlock,
        indent: this._blockIndent,
        toks: this._blockPool
      })
      this.initBlockState()
    } else {
      this._blockPool.push(text.trim())
    }
  }

  parseNewLine (text) {
    const [indent, isQuote, trimedText] = getIndentSize(text)

    let blockStart = false
    if (trimedText.startsWith('code:')) {
      this._blockIndent = indent
      this._opendBlock = 'codeblock'
      blockStart = true
      text = text.replace(/code:/, '')
    }

    if (this._opendBlock) {
      this.parseBlock(indent, text, blockStart)
      if (this._opendBlock) return
    }

    const toks = splitToBracketToks(trimedText)
    parseBackquotes(toks)

    //console.log("$$", indent, isQuote, toks)
    // console.log("#####", toks)
    this._res.push({indent, isQuote, toks: flattenDeep(toks)})
  }
}

module.exports = TinyParser
