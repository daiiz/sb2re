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
        lines: this._blockPool
      })
      this.initBlockState()
    } else {
      this._blockPool.push(text)
    }
  }

  parseNewLine (text) {
    if (this._opendBlock) {
      this.parseBlock(text)
      return
    }
    const [indent, isQuote, trimedText] = getIndentSize(text)
    const toks = splitToBracketToks(trimedText)
    parseBackquotes(toks)

    console.log(indent, isQuote, toks)
    this._res.push({indent, isQuote, toks})
  }
}

module.exports = TinyParser
