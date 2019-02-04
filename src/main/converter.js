const {uniq} = require('lodash')
const {getTopics} = require('../reader/readTopics')
const {readPages} = require('../reader/readJsons')
const {writeTxtFile, writeReviewFile, writeCatalogYaml} = require('../writer')
const {parseLines, getGyazoUrlList} = require('../tiny-parser')
const {renderReview} = require('../renderer')
const gyazoDir = './out/images'

const topics = getTopics()

const pages = readPages(topics)

const gyazoUrls = []
for (const page of pages) {
  const res = parseLines(page.lines)

  // ダウンロードすべきGyazoのURLを収集
  const urls = getGyazoUrlList(res)
  gyazoUrls.push(...urls)

  // Re:VIEW記法に変換
  const re = renderReview(page.title, res)
  writeReviewFile(page.title, re)
}

writeTxtFile(`${gyazoDir}/urls.txt`, uniq(gyazoUrls))
writeCatalogYaml(topics)
