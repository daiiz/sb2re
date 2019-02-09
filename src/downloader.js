const request = require('request')
const jimp = require('jimp')
const fs = require('fs')
const imagesDir = './out/images'

const skipIfExists = true

const getExt = contentType => {
  switch (contentType) {
    case 'image/png':
      return 'png'
    case 'image/jpeg':
    case 'image/jpg':
      return 'jpg'
    default:
      return null
  }
}

const existsImage = (prefix, gyazoId) => {
  return fs.existsSync(`${imagesDir}/${prefix}${gyazoId}.png`)
}

const downloadImages = (gyazoIds, callback, {size, prefix}) => {
  prefix = prefix || ''
  if (gyazoIds.length === 0) {
    if (callback) callback()
  } else {
    const gyazoId = gyazoIds.pop()
    // すでにfetch済みであればskip
    if (!gyazoId || (skipIfExists && existsImage(prefix, gyazoId))) {
      if (gyazoId) console.log(`> skip (${gyazoId})`)
      downloadImages(gyazoIds, callback, {size, prefix})
    } else {
      const url = `https://gyazo.com/${gyazoId}/thumb/${size}`
      request.get(url, {
        method: 'GET',
        encoding: null
      }, (err, res, body) => {
          const contentType = res.headers['content-type']
          const ext = getExt(contentType)
          if (!ext) {
            console.log('> Not supported format:', contentType, url)
          } else {
            const imagePath = `${imagesDir}/${prefix}${gyazoId}.${ext}`
            fs.writeFileSync(imagePath, body, 'binary')
            if (ext === 'jpg') {
              // jpgを扱うとなぜかreview-pdfmakerがエラーを出す。詳細不明。
              // 仕方ないのでpngに変換する。
              jimp.read(imagePath, (err, img) => {
                img.write(`${imagesDir}/${prefix}${gyazoId}.png`)
                fs.unlinkSync(imagePath)
              })
            }
            console.log(`> (${gyazoIds.length}) ${imagesDir}/${prefix}${gyazoId}`)
          }
          downloadImages(gyazoIds, callback, {size, prefix})
      })
    }
  }
}

module.exports = {downloadImages}
