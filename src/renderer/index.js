const {parse} = require('url')
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
  res.push('')

  const renderer = new Renderer()
  for (const line of lines) {
    const re = renderer.renderLine(line, opts)
    res.push(re)
  }

  return res
}

class Renderer {
  constructor() {
    this.lastIndent = 0
  }

  prependEmptyLineIfNeeded (text, indent) {
    if (this.lastIndent === 0 && indent > 0) {
      text = ['', text].join('\n')
    }
    return text
  }

  getImageOptions (label) {
    const queries = Object.create({
      caption: '',
      scale: '0.5'
    })
    if (/^https?:\/\//.test(label)) {
      const {query} = parse(label)
      if (query) {
        query.split('&').map(kv => kv.split('='))
          .filter(a => a.length === 2)
          .map(a => queries[a[0]] = a[1])
      }
    }
    return queries
  }

  renderLine (line, opts) {
    let { indent, isQuote, isShell, toks, block } = line
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
              '', toks.join(''), '',
              `====[/column]`,
              ''
            ].join('\n')
          } else {
            text += [
              `//source[${head}]{`, ...toks, `//}`,
              ''
            ].join('\n')
          }
          break
        }
      }
      return text
    }

    if (isShell) {
      text = `  ${'*'.repeat(indent)} @<tt>{$ ${toks.map(tok => tok.text).join('')}}`
      text = this.prependEmptyLineIfNeeded(text, indent)
      this.lastIndent = indent
      return text
    }

    if (indent > 0) text += `  ${'*'.repeat(indent)} `
    // Ref. tiny-parser/parser.js
    for (const tok of toks) {
      switch (tok.type) {
        case 'gyazo': {
          const url = tok.text
          text = [`//image[${getGyazoId(url)}][][scale=0.5]{`, '//}'].join('\n')
          break
        }
        case 'gyazoWithLabel': {
          const {label, url} = tok.text
          const queries = this.getImageOptions(label)
          text = [`//image[${getGyazoId(url)}][${queries.caption}][scale=${queries.scale}]{`, '//}', ''].join('\n')
          break
        }
        case 'bold': {
          if (text.length === 0) {
            // 見出しとして解釈
            text = [`== ${tok.text}`, ''].join('\n')
          } else {
            text += `@<tt>{${tok.text}}`
          }
          break
        }
        case 'italic': {
          text += `@<i>{${tok.text}}`
          break
        }
        case 'internalLink': {
          const linkLc = toLc(tok.text)
          if (opts.links.includes(linkLc)) {
            text += `@<u>{${tok.text}} [@<chap>{${linkLc}}]`
          } else {
            text += tok.text
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
          text += `@<m>{${tok.text}}`
          break
        }
        default: {
          // plainなど
          text += tok.text
        }
      }
    }

    if (indent === 0 && text.length === 0) {
      text += ['', `//blankline`, ''].join('\n')
    }

    if (isQuote) {
      text = [`//quote{`, text.replace(/^\s+\*+\s+/, ''), `//}`].join('\n')
    } else {
      text = this.prependEmptyLineIfNeeded(text, indent)
    }
    this.lastIndent = indent
    return text
  }
}

module.exports = {renderReview}
