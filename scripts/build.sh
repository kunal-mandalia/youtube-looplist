#!/bin/bash

# build
cd src/popup && yarn build && cd ../..
rm -rf dist/

# copy to dist
mkdir -p dist/popup/build/
cp -r src/popup/build/ dist/popup/build/
rm dist/popup/build/manifest.json
cp -r src/background/ dist/background/
cp -r src/content/ dist/content/
cp -r src/util/ dist/util/
cp src/manifest.json dist/manifest.json

# create artifact
cd dist/
VERSION="$(git rev-parse HEAD | head -c 7)"
zip -r youtube-looplist.${VERSION}.zip ./*