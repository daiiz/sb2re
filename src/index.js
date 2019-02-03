const {getTopics} = require('./reader/readTopics')
const {readPages} = require('./reader/readJsons')

const topics = getTopics()

const pages = readPages(topics)

console.log(pages)
