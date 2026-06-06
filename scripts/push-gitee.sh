#!/bin/bash
# 推送代码到 Gitee 并触发 Pages 部署
set -e
cd "$(dirname "$0")/.."

if ! git remote get-url gitee &>/dev/null; then
  echo "请先添加 Gitee 远程仓库："
  echo "  git remote add gitee https://gitee.com/你的用户名/jack-blog.git"
  exit 1
fi

git push gitee main
echo ""
echo "已推送到 Gitee，请在仓库「服务 → Gitee Pages」中查看部署状态"
echo "访问地址一般为：https://你的用户名.gitee.io/jack-blog/"
