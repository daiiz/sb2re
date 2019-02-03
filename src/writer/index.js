const fs = require('fs')

const reviewDir = './out/re'

const writeTxtFile = (path, strArr) => {
  if (path.startsWith('/')) return
  fs.writeFileSync(path, strArr.join('\n'))
}

const writeReviewFile = (title, page) => {
  const path = `${reviewDir}/${title}.re`
  writeTxtFile(path, [title, ...page.map(p => JSON.stringify(p))])
}

module.exports = {writeTxtFile, writeReviewFile}
