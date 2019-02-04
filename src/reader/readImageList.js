const fs = require('fs')
const {uniq} = require('lodash')
const {parse} = require('url')

const imageList = './out/images/urls.txt'

const getGyazoId = url => {
  const { host, pathname} = parse(url)
  if (!/gyazo\.com$/.test(host)) return null
  return pathname.split('/')[1]
}

const getGyazoIds = () => {
  const lines = fs.readFileSync(imageList, 'utf-8').split('\n')
  const gyazoIds = lines.map(line => getGyazoId(line)).filter(id => !!id)
  return uniq(gyazoIds)
}

module.exports = {getGyazoIds}