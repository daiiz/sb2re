const fs = require('fs')
const {uniq} = require('lodash')
const {toLc} = require('../writer/')
const {getGyazoId} = require('../gyazo')

const reDir = './out/re'

const getGyazoUrlList = pageRes => {
  const gayzoUrls = []
  for (const res of pageRes) { // page
    const toks = res.toks
    for (const tok of toks) { // line
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
    for (const tok of toks) { // line
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

const detectGyazoIdsInLine = toks => {
  const res = []
  for (const tok of toks) {
    switch (tok.type) {
      case 'gyazo': {
        res.push(getGyazoId(tok.text))
        break
      }
      case 'gyazoWithLabel': {
        res.push(getGyazoId(tok.text.url))
        break
      }
    }
  }
  return res
}


module.exports = {getGyazoUrlList, detectIconGyazoIds, detectGyazoIdsInLine}
