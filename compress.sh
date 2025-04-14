#!/usr/bin/env bash
#!/bin/bash

NODE_VERSION=$(node -p "require('./package.json').version")

ZIP_NAME="v$NODE_VERSION.zip"
FOLDER_NAME="v$NODE_VERSION"

# Create zip archive
echo "Zipping folder: $FOLDER_NAME -> $ZIP_NAME"
zip -r $ZIP_NAME $FOLDER_NAME -x "*.DS_Store" -x "__MACOSX" "*.vite*"
zip -d "$ZIP_NAME" __MACOSX