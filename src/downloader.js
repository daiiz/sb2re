const request = require('request')
const fs = require('fs')
const imagesDir = './out/images'

const downloadImages = (gyazoIds, callback) => {
  if (gyazoIds.length === 0) {
    if (callback) callback()
  } else {
    const gyazoId = gyazoIds.pop()
    // すでにfetch済みであればskip
    if (fs.existsSync(`${imagesDir}/${gyazoId}.png`)) {
      console.log(`> skip (${gyazoId})`)
      downloadImages(gyazoIds, callback)
    } else {
      const url = `https://gyazo.com/${gyazoId}/raw`
      request.get(url)
        .on('response', res => {
          // const contentType = res.headers['content-type']
        })
        .pipe(fs.createWriteStream(`${imagesDir}/${gyazoId}.png`))
        .on('close', () => {
          console.log(`> (${gyazoIds.length}) ${imagesDir}/${gyazoId}`)
          downloadImages(gyazoIds, callback)
        })
    }
  }
}

module.exports = {downloadImages}