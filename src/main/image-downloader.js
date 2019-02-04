const {getGyazoIds} = require('../reader/readImageList')
const {downloadImages} = require('../downloader')

// XXX: Gyazoのみ対応
const gayzoIds = getGyazoIds()
downloadImages(gayzoIds, null)