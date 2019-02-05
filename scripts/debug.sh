cp ./out/re/catalog.yml ~/sandbox/hello/catalog.yml
cp ./out/re/*.re ~/sandbox/hello/pages/
cp ./out/images/* ~/sandbox/hello/images/

cd ~/sandbox/hello && npm run pdf
