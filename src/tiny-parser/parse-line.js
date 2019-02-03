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

  parseBlock (text) {
    if (text.length === 0) {
      this._res.push({
        block: this._opendBlock,
        indent: this._blockIndent,
        lines: this._blockPool
      })
      this.initBlockState()
    } else {
      this._blockPool.push(text.trim())
    }
  }

  parseNewLine (text) {
    const [indent, isQuote, trimedText] = getIndentSize(text)

    if (trimedText.startsWith('code:')) {
      this._blockIndent = indent
      this._opendBlock = 'codeblock'
      text = text.split(':')[1]
    }

    if (this._opendBlock) {
      this.parseBlock(text)
      return
    }

    const toks = splitToBracketToks(trimedText)
    parseBackquotes(toks)

    //console.log("$$", indent, isQuote, toks)
    this._res.push({indent, isQuote, toks})
  }
}

module.exports = TinyParser
