const renderReview = (title, lines) => {
  const res = []
  res.push(`= ${title}`)

  let lastIndent = 0
  for (const line of lines) {
    const [indentSize, re] = renderLine(lastIndent, line)
    lastIndent = indentSize
    res.push(re)
  }

  return res
}

const renderLine = (lastIndentSize, line) => {
  let {indent, isQuote, toks, block} = line
  let text = ''

  if (block) {
    switch (block) {
      case 'codeblock': {
        const head = toks[0]
        toks.shift()
        if (head.startsWith('COLUMN')) {
          text += [
            '',
            `====[column] ${head.replace(/^COLUMN:/, '')}`,
            '',
            toks.join(''),
            '',
            `====[/column]`,
            ''
          ].join('\n')
        } else {
          text += [
            `//source[${head}]{`,
            ...toks,
            `//}`,
            ''
          ].join('\n')
        }
        break
      }
    }
    return [indent, text]
  }

  toks = toks.map(t => {
    if (typeof t === 'string') return {type: 'plain', text: t}
    return t
  })

  if (indent > 0) text += `  ${'*'.repeat(indent)} `
  // Ref. tiny-parser/lib.js
  for (const tok of toks) {
    switch (tok.type) {
      case 'gyazo': {
        break
      }
      case 'bold': {
        text += [`== ${tok.text}`, ''].join('\n')
        break
      }
      case 'italic': {
        text += `@<i>{${tok.text}}`
        break
      }
      case 'internalLink': {
        text += `@<ttb>{${tok.text}}`
        break
      }
      case 'externalLink': {
        break
      }
      case 'externalLinkWithLabel': {
        text += tok.text.label
        break
      }
      case 'icon': {
        text += `(${tok.text})`
        break
      }
      case 'backquote': {
        text += `@<tt>{${tok.text}}`
        break
      }
      case 'math': {
        break
      }
      default: {
        // plainなど
        text += tok.text
      }
    }
  }

  if (isQuote) {
    return [`//quote{`, text, `//}`].join('\n')
  } else {
    if (lastIndentSize === 0 && indent > 0) {
      text = ['', text].join('\n')
    }
    // if (text.length === 0) text += '　' + br
  }

  return [indent, text]
}

module.exports = {renderReview}