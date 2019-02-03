const fs = require('fs')
const {uniq} = require('lodash')
const {getTopics} = require('./reader/readTopics')
const {readPages} = require('./reader/readJsons')
const {writeTxtFile, writeReviewFile} = require('./writer/')
const {parseLines, getGyazoUrlList} = require('./tiny-parser/')
const gyazoDir = './out/gyazo'

const topics = getTopics()

const pages = readPages(topics)

const gyazoUrls = []
for (const page of pages) {
  const res = parseLines(page.lines)
  // console.log('index.js', page.title)
  writeReviewFile(page.title, res)

  // ダウンロードすべきGyazoのURLをファイルに出力
  const urls = getGyazoUrlList(res)
  gyazoUrls.push(...urls)
}
writeTxtFile(`${gyazoDir}/urls.txt`, uniq(gyazoUrls))
