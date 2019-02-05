const fs = require('fs')
const {uniq} = require('lodash')
const TinyParser = require('./parse-line')
const {toLc} = require('../writer/')

const reDir = './out/re'

const parseLines = lines => {
  const parser = new TinyParser() // 複数行に跨ることあるので状態管理必要
  for (const line of lines) {
    parser.parseNewLine(line)
  }
  return [parser.result, parser.topGyazoId]
}

const getGyazoUrlList = pageRes => {
  const gayzoUrls = []
  // page
  for (const res of pageRes) {
    const toks = res.toks
    // line
    for (const tok of toks) {
      if (typeof tok === 'string') continue
      if (tok.type === 'gyazo') {
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
      if (typeof tok === 'string') continue
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

module.exports = {parseLines, getGyazoUrlList, detectIconGyazoIds}
