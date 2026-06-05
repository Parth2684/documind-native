#!/usr/bin/env bash
set -e

# Clean old builds
rm -rf package documind-linux-x86_64.tar.gz
mkdir -p package

# Build Tauri binary without bundling into .deb/.appimage
bun tauri build --no-bundle

# Stage files
cp src-tauri/target/release/documind package/
cp documind.desktop package/
cp src-tauri/icons/128x128.png package/128x128.png
cp src-tauri/icons/32x32.png package/32x32.png
cp src-tauri/icons/128x128@2x.png package/128x128@2.png

# Copy models if they exist
if [ -d "src-tauri/models" ]; then
  cp -r src-tauri/models package/
fi

# Copy voices if they exist
if [ -d "src-tauri/voices" ]; then
  cp -r src-tauri/voices package/
fi

# Create tarball (flat structure)
tar -czf documind-linux-x86_64.tar.gz -C package .

echo "Tarball created successfully!"