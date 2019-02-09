const fs = require('fs')

const reviewDir = './out/re'

const toLc = str => {
  return str.toLowerCase().replace(/\s/gi, '_')
}

const writeTxtFile = (path, strArr) => {
  if (path.startsWith('/')) return
  fs.writeFileSync(path, strArr.join('\n'))
  console.log(`[out] ${path}`)
}

const writeReviewFile = (title, rePage) => {
  const path = `${reviewDir}/${toLc(title)}.re`
  writeTxtFile(path, rePage)
}

const writeCatalogYaml = ({topics}) => {
  const path = `${reviewDir}/catalog.yml`
  const txt = [
    'PREDEF:',
    '',
    'CHAPS:',
    topics.map(t => `  - ${toLc(t)}.re`).join('\n'),
    '',
    'APPENDIX:',
    '',
    'POSTDEF:',
    ''
  ]
  writeTxtFile(path, txt)
}

module.exports = {writeTxtFile, writeReviewFile, writeCatalogYaml, toLc}
