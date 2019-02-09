const TinyParser = require('./tiny-parser')

const parseLines = lines => {
  const parser = new TinyParser()
  for (const line of lines) {
    parser.parseNewLine(line)
  }
  return [parser.result, parser.topGyazoId]
}

module.exports = {parseLines}
