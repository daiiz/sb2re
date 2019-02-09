const {getGyazoId} = require('../gyazo')
const {toLc} = require('../writer/')

const renderReview = (title, lines, gyazoId, opts={links: [], iconIds: [], iconNameLcs: []}) => {
  const res = []
  if (gyazoId) {
    // ページの代表Gyazo画像idを記録
    res.push(`#@# ${gyazoId} #@#`)
    res.push('')
  }
  res.push(`= ${title}`)

  let lastIndent = 0
  for (const line of lines) {
    const [indentSize, re] = renderLine(lastIndent, line, opts)
    lastIndent = indentSize
    res.push(re)
  }

  return res
}

const renderLine = (lastIndentSize, line, opts) => {
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

  if (indent > 0) text += `  ${'*'.repeat(indent)} `
  // Ref. tiny-parser/parser.js
  for (const tok of toks) {
    switch (tok.type) {
      case 'gyazo': {
        const url = tok.text
        text = [
          `//image[${getGyazoId(url)}][][scale=0.5]{`, // [fileName][Caption]
          '//}'
        ].join('\n')
        break
      }
      case 'gyazoWithLabel': {
        const url = tok.text.url
        text = [
          `//image[${getGyazoId(url)}][][scale=0.5]{`, // [fileName][Caption]
          '//}'
        ].join('\n')
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
        const linkLc = toLc(tok.text)
        if (opts.links.includes(linkLc)) {
          text += `@<ttb>{${tok.text}} [@<chap>{${linkLc}}]`
        } else {
          text += `@<ttb>{${tok.text}}`
        }
        break
      }
      case 'externalLink': {
        text += `@<href>{${tok.text}}`
        break
      }
      case 'externalLinkWithLabel': {
        const { url, label } = tok.text
        text += `@<href>{${url}, ${label}}`
        break
      }
      case 'icon': {
        const iconNameLc = toLc(tok.text)
        const idx = opts.iconNameLcs.indexOf(iconNameLc)
        if (idx >= 0) {
          const gyazoId = opts.iconIds[idx]
          text += `@<icon>{icon-${gyazoId}}`
        } else {
          text += `(${tok.text})`
        }
        break
      }
      case 'inlineCode': {
        text += `@<code>{${tok.text}}`
        break
      }
      case 'math': {
        text += `(${tok.text})`
        break
      }
      default: {
        // plainなど
        text += tok.text
      }
    }
  }


  if (isQuote) {
    text = [`//quote{`, text.replace(/^\s+\*+\s+/, ''), `//}`].join('\n')
  } else {
    if (lastIndentSize === 0 && indent > 0) {
      text = ['', text].join('\n')
    }
  }

  return [indent, text]
}

module.exports = {renderReview}
