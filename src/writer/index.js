const fs = require('fs')

const reviewDir = './out/re'

const writeTxtFile = (path, strArr) => {
  if (path.startsWith('/')) return
  fs.writeFileSync(path, strArr.join('\n'))
  console.log(`[out] ${path}`)
}

const writeReviewFile = (title, page) => {
  const path = `${reviewDir}/${title}.re`
  writeTxtFile(path, [title, ...page.map(p => JSON.stringify(p))])
}

const writeCatalogYaml = ({topics}) => {
  const path = `${reviewDir}/catalog.yml`
  const txt = [
    'PREDEF:',
    '',
    'CHAPS:',
    topics.map(t => `  - ${t}.re`),
    '',
    'APPENDIX:',
    '',
    'POSTDEF:',
    ''
  ]
  writeTxtFile(path, txt)
}

module.exports = {writeTxtFile, writeReviewFile, writeCatalogYaml}
