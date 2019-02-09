const fs = require('fs')
const {uniq} = require('lodash')
const {toLc} = require('../writer/')

const reDir = './out/re'

const getGyazoUrlList = pageRes => {
  const gayzoUrls = []
  // page
  for (const res of pageRes) {
    const toks = res.toks
    // line
    for (const tok of toks) {
      if (tok.type === 'gyazo' || tok.type === 'gyazoWithLabel') {
        gayzoUrls.push(tok.text.url || tok.text)
      }
    }
  }
  return gayzoUrls
}

// ページに含まれるアイコン記法からページ名(reファイル名)を取得し、
// そのページの代表画像のGyazoIdsを追記する
// すべてのページのreファイルを生成した後に実行するべき
const detectIconGyazoIds = (pageRes, {topics}) => {
  const topicsLc = topics.map(topic => topic.toLowerCase())
  let iconNameLcs = []
  for (const res of pageRes) {
    const toks = res.toks
    // line
    for (const tok of toks) {
      if (tok.type === 'icon') {
        const iconNameLc = toLc(tok.text)
        if (!topicsLc.includes(iconNameLc)) continue
        iconNameLcs.push(iconNameLc)
      }
    }
  }
  iconNameLcs = uniq(iconNameLcs)

  // detect GyazoIds
  const res = {iconIds: [], iconNameLcs: []}
  for (const iconNameLc of iconNameLcs) {
    const lines = fs.readFileSync(`${reDir}/${iconNameLc}.re`, 'utf-8').split('\n')
    const firstLine = lines[0]
    if (!firstLine.startsWith('#@#')) continue
    const gyazoId = firstLine.replace(/#@#/gi, '').trim()
    if (!!gyazoId) {
      res.iconNameLcs.push(iconNameLc)
      res.iconIds.push(gyazoId)
    }
  }

  return res
}

module.exports = {getGyazoUrlList, detectIconGyazoIds}
