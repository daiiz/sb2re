const request = require('request')
const fs = require('fs')
const imagesDir = './out/images'

const skipIfExists = false

const downloadImages = (gyazoIds, callback, {size, prefix}) => {
  prefix = prefix || ''
  if (gyazoIds.length === 0) {
    if (callback) callback()
  } else {
    const gyazoId = gyazoIds.pop()
    // すでにfetch済みであればskip
    if (skipIfExists && fs.existsSync(`${imagesDir}/${prefix}${gyazoId}.png`)) {
      console.log(`> skip (${gyazoId})`)
      downloadImages(gyazoIds, callback, {size, prefix})
    } else {
      const url = `https://gyazo.com/${gyazoId}/thumb/${size}`
      request.get(url)
        .on('response', res => {
          // const contentType = res.headers['content-type']
        })
        .pipe(fs.createWriteStream(`${imagesDir}/${prefix}${gyazoId}.png`))
        .on('close', () => {
          console.log(`> (${gyazoIds.length}) ${imagesDir}/${prefix}${gyazoId}`)
          downloadImages(gyazoIds, callback, {size, prefix})
        })
    }
  }
}

module.exports = {downloadImages}
