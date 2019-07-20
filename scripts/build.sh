#!/bin/bash

# build
cd src/popup && yarn build && cd ../..
rm -rf dist/ 

# copy to dist
mkdir -p dist/popup/build/
cp -r src/popup/build/ dist/popup/build/
cp -r src/background/ dist/background/
cp -r src/content/ dist/content/
cp -r src/util/ dist/util/
cp src/manifest.json dist/manifest.json