const fs = require('fs')
const {uniq} = require('lodash')

const getGyazoIds = (filePath) => {
  const gyazoIds = fs.readFileSync(filePath, 'utf-8').split('\n')
  return uniq(gyazoIds)
}

module.exports = {getGyazoIds}
