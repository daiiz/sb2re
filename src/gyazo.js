const {uniq} = require('lodash')
const {parse} = require('url')

const getGyazoId = url => {
  const {host, pathname} = parse(url)
  if (!/gyazo\.com$/.test(host)) return null
  return pathname.split('/')[1]
}

const getGyazoIds = urls => {
  const ids = urls.map(url => getGyazoId(url)).filter(id => !!id)
  return uniq(ids)
}

module.exports = {getGyazoId, getGyazoIds}