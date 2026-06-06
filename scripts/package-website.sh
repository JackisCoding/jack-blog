#!/bin/bash
# 打包 website 目录，用于 EdgeOne Pages / 上码 等平台的拖拽上传
set -e
cd "$(dirname "$0")/.."
OUT="jack-blog-site.zip"
rm -f "$OUT"
cd website
zip -r "../$OUT" . -x "*.DS_Store"
cd ..
echo "已生成: $(pwd)/$OUT"
echo ""
echo "上传方式："
echo "  1. EdgeOne Pages: https://pages.edgeone.ai/ → 拖入 zip 或 website 文件夹"
echo "  2. 上码 Upma:     https://www.upma.cn/ → 上传 zip"
