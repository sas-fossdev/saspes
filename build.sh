#!/bin/bash

if [[ "$1" == "--help" ]] || [[ "$1" == "help" ]] || [[ "$1" == "-h" ]]; then
    echo "Avaliable Options: [chromium],[firefox],[chromiumtest],[chromiumtestremove]"
fi
if [[ "$1" == "chromium" ]]; then
    mkdir tmp
    cp ./src/{chromium,css,icons,js,lib,ui,'manifest - chromium.json'} ./tmp -r
    mv "./tmp/manifest - chromium.json" "./tmp/manifest.json"
    cd tmp
    zip -r9 ../chromium_build.zip ./
    cd ..
    rm -r ./tmp
    echo Chromium build complete. Saved as chromium_build.zip
fi
if [[ "$1" == "firefox" ]]; then
    mkdir tmp
    cp ./src/{css,icons,js,lib,ui,manifest.json} ./tmp -r
    cd tmp
    zip -r9 ../firefox_build.zip ./
    cd ..
    rm -r ./tmp
    echo Firefox build complete. Saved as firefox_build.zip
fi
if [[ "$1" == "chromiumtest" ]]; then
    mkdir chromiumtest
    cp ./src/{chromium,css,icons,js,lib,ui,'manifest - chromium.json'} ./chromiumtest -r
    mv "./chromiumtest/manifest - chromium.json" "./chromiumtest/manifest.json"
    echo Chromium test folder made
fi
if [[ "$1" == "chromiumtestremove" ]]; then
    rm -r ./chromiumtest
    echo Chromium test folder removed
fi

