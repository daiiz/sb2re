# scrapbox2review
https://scrapbox.io/teamj/ScrapboxコンテンツをReVIEW記法に変換

## Build
```
$ npm install
```

## Usage
Please place json files exported from [Scrapbox](https://scrapbox.io/product) in `./scrapbox/:projectName/`.

Edit topics.txt then run the following script.
```
$ npm run convert
```

Re:VIEW files will be generated at `./out/re/`.<br>
A URL list of Gyazo images to download will be generated at `./out/images/gyazo-ids.txt` and `./out/images/gyazo-icons-ids.txt`.
Run following to download the images.
```
$ npm run download-images
```

