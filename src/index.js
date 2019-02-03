const {getTopics} = require('./reader/readTopics')
const {readPages} = require('./reader/readJsons')
const {parseLines} = require('./tiny-parser/')

const topics = getTopics()

const pages = readPages(topics)

for (const page of pages) {
  const res = parseLines(page.lines)
}


