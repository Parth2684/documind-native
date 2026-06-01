#!/usr/bin/env bash
set -e

rm -rf package
mkdir -p package

bun tauri build --no-bundle

cp src-tauri/target/release/documind package/
cp documind.desktop package/
cp src-tauri/icons/128x128.png package/documind.png
cp -r src-tauri/models package/

tar -czf documind-linux-x86_64.tar.gz -C package .