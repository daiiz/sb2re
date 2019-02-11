const fs = require('fs')
const {toLc} = require('../writer/')

const jsonBaseDir = './json'
const getJsonDirPath = ({projectName}) => {
  return `${jsonBaseDir}/${projectName}`
}

const detectJsonFilePaths = projectName => {
  const dirPath = getJsonDirPath({ projectName })
  const paths = fs.readdirSync(dirPath)
  const jsonPaths = []
  for (let path of paths) {
    path = `${dirPath}/${path}`
    if (fs.statSync(path).isFile() && path.endsWith('.json')) {
      jsonPaths.push(path)
    }
  }
  return jsonPaths
}

const readPages = ({projectName, topics}) => {
  const jsonPaths = detectJsonFilePaths(projectName)
  const topicsLc = topics.map(topic => toLc(topic))
  const targetPages = []

  for (const path of jsonPaths) {
    // pageを一気に読み込む
    const {pages} = JSON.parse(fs.readFileSync(path, 'utf-8'))
    for (const page of pages) {
      const {title, lines} = page
      if (!title || !lines) continue
      const titleLc = toLc(title)
      // topicsに列挙されていないpageは対象外である
      if (!topicsLc.includes(titleLc)) continue
      lines.shift()
      const pageText = {
        title,
        lines: lines.map(line => {
          if (typeof line === 'string') return line
          return line.text
        })
      }
      targetPages.push(pageText)
    }
  }
  return targetPages
}

// 参照があったがtopicsに含まれていないlinkToをHintとして出力したい
// 勝手に含めるのはマズイ

module.exports = {readPages}
