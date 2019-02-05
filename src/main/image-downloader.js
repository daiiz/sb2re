const {getGyazoIds} = require('../reader/readImageList')
const {downloadImages} = require('../downloader')
const {GYAZO_IMAGE_SIZE, GYAZO_ICON_SIZE} = require('../gyazo')

// XXX: Gyazoのみ対応
const gayzoIds = getGyazoIds('./out/images/gyazo-ids.txt')
downloadImages(gayzoIds, null, {size: GYAZO_IMAGE_SIZE})

const gayzoIconIds = getGyazoIds('./out/images/gyazo-icon-ids.txt')
downloadImages(gayzoIconIds, null, {size: GYAZO_ICON_SIZE, prefix: 'icon-'})
