const fs = require('fs')
const {uniq} = require('lodash')
const {getTopics} = require('./reader/readTopics')
const {readPages} = require('./reader/readJsons')
const {parseLines, getGyazoUrlList} = require('./tiny-parser/')
const gyazoDir = './out/gyazo'

const topics = getTopics()

const pages = readPages(topics)

const gyazoUrls = []
for (const page of pages) {
  const res = parseLines(page.lines)
  // console.log('index.js', parser.result)

  // ダウンロードすべきGyazoのURLをファイルに出力
  const urls = getGyazoUrlList(res)
  gyazoUrls.push(...urls)
}
fs.writeFileSync(`${gyazoDir}/urls.txt`, uniq(gyazoUrls).join('\n'))


