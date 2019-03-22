#!/bin/bash

set -e

if [[ "$1" == "--help" ]] || [[ "$1" == "help" ]] || [[ "$1" == "-h" ]]; then
 echo -e "Build script for SAS Powerschool Enhancement Suite\n\n    Usage: ./build.sh OPTION\n\nOptions:\n    firefox            Build packaged version for Firefox\n    chromium           Build packaged version for Chromium\n    chromiumtest       Create folder to load unpackaged into Chromium\n    chromiumtestremove Remove folder made by './build.sh chromiumtest' command\n\n SAS Powerschool Enhancement Suite is licensed under GPL-3.0."

elif [[ "$1" == "chromium" ]]; then
    mkdir tmp
    cp ./src/{chromium,css,icons,js,lib,ui,'manifest - chromium.json'} ./tmp -r
    mv "./tmp/manifest - chromium.json" "./tmp/manifest.json"
    cd tmp
    zip -r9 ../chromium_build.zip ./
    cd ..
    rm -r ./tmp
    echo -e "Chromium build complete. Saved as chromium_build.zip"

elif [[ "$1" == "firefox" ]]; then
    mkdir tmp
    cp ./src/{css,icons,js,lib,ui,manifest.json} ./tmp -r
    cd tmp
    zip -r9 ../firefox_build.zip ./
    cd ..
    rm -r ./tmp
    echo -e "Firefox build complete. Saved as firefox_build.zip"

elif [[ "$1" == "chromiumtest" ]]; then
    mkdir chromiumtest
    cp ./src/{chromium,css,icons,js,lib,ui,'manifest - chromium.json'} ./chromiumtest -r
    mv "./chromiumtest/manifest - chromium.json" "./chromiumtest/manifest.json"
    echo -e "Chromium test folder made"

elif [[ "$1" == "chromiumtestremove" ]]; then
    rm -r ./chromiumtest
    echo -e "Chromium test folder removed"
else
    echo -e "Usage: ./build.sh OPTION\nTry './build.sh --help' for more information."
fi