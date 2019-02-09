const {isGyazoUrl} = require('../gyazo')

const shiftText = (strText, shiftNum) => {
  const text = strText.split('')
  for (let i = 0; i < shiftNum; i++) text.shift()
  return text.join('')
}

const isUrl = text => {
  return /^https?:\/\//.test(text)
}

// output: [type, value]
const divideText = text => {
  const parts = text.split(/\s+/)
  const texts = []
  const urls = []
  const gyazoUrls = []
  for (const part of parts) {
    if (/https?:\/\//.test(part)) {
      if (isGyazoUrl(part)) {
        gyazoUrls.push(part)
      } else {
        urls.push(part)
      }
    } else {
      texts.push(part)
    }
  }

  switch (urls.length) {
    case 0: {
      if (gyazoUrls.length === 0) {
        return ['internalLink', texts.join(' ').trim()]
      } else {
        return ['gyazo', gyazoUrls[0]]
      }
    }
    case 1: {
      if (gyazoUrls.length === 0) {
        return ['externalLinkWithLabel', {
          label: texts.join(' ').trim(),
          url: urls[0]
        }]
      } else {
        return ['gyazoWithLabel', {
          label: urls[0],
          url: gyazoUrls[0]
        }]
      }
    }
    default: {
      return ['externalLink', urls[0]]
    }
  }
}

module.exports = {shiftText, isUrl, divideText}
