const TinyParser = require('./parse-line')

const parseLines = lines => {
  const parser = new TinyParser() // 複数行に跨ることあるので状態管理必要
  for (const line of lines) {
    parser.parseNewLine(line)
  }
  return parser.result
}

module.exports = {parseLines}