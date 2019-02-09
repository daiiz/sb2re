const {uniq} = require('lodash')
const {getTopics} = require('../reader/readTopics')
const {readPages} = require('../reader/readJsons')
const {writeTxtFile, writeReviewFile, writeCatalogYaml} = require('../writer')
const {parseLines} = require('../tiny-parser/')
const {getGyazoUrlList, detectIconGyazoIds} = require('../tiny-parser/gyazo')
const {renderReview} = require('../renderer')
const {getGyazoIds} = require('../gyazo')
const gyazoDir = './out/images'

const topics = getTopics()

const pages = readPages(topics)

const gyazoUrls = []
const iconGyazoIds = []

for (const page of pages) {
  const [res, gyazoId] = parseLines(page.lines)

  // ダウンロードすべきGyazoのURLを収集
  const urls = getGyazoUrlList(res)
  gyazoUrls.push(...urls)

  // Re:VIEW記法に変換
  const re = renderReview(page.title, res, gyazoId)
  writeReviewFile(page.title, re)
}

console.log('----')
// iconやリンクを反映させるために2周目を実行する
for (const page of pages) {
  const [res, gyazoId] = parseLines(page.lines)

  // ダウンロードすべきアイコンGyazoIdsを収集
  const {iconIds, iconNameLcs} = detectIconGyazoIds(res, topics)
  iconGyazoIds.push(...iconIds)

  // Re:VIEW記法に変換
  const links = topics.topics
  const re = renderReview(page.title, res, gyazoId, {links, iconIds, iconNameLcs})
  writeReviewFile(page.title, re)
}

console.log('=====')
writeTxtFile(`${gyazoDir}/urls.txt`, uniq(gyazoUrls))
writeTxtFile(`${gyazoDir}/gyazo-ids.txt`, getGyazoIds(gyazoUrls))
writeTxtFile(`${gyazoDir}/gyazo-icon-ids.txt`, iconGyazoIds)
writeCatalogYaml(topics)
