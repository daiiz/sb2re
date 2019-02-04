const fs = require('fs')
const {uniq} = require('lodash')
const gyazoList = './out/images/gyazo-ids.txt'

const getGyazoIds = () => {
  const gyazoIds = fs.readFileSync(gyazoList, 'utf-8').split('\n')
  return uniq(gyazoIds)
}

module.exports = {getGyazoIds}