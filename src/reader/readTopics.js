const fs = require('fs')

const topicFilePath = './topics.txt'

const getTopics = () => {
  const lines = fs.readFileSync(topicFilePath, 'utf-8').split('\n')
  const res = {
    projectName: null,
    topics: []
  }
  for (let line of lines) {
    line = line.trim()
    if (line.length === 0 || line.startsWith('#')) continue
    if (line.startsWith('/')) {
      res.projectName = line.replace(/^\//, '')
      continue
    }
    res.topics.push(line)
  }
  return res
}

module.exports = {getTopics}
