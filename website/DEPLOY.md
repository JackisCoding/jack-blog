# 部署说明 — GitHub Pages

网站已配置自动部署，推送到 `main` 分支后约 1–2 分钟自动更新。

## 访问地址

**https://jackiscoding.github.io/jack-blog/**

手机、电脑浏览器直接打开即可（国内访问可能时快时慢）。

---

## 更新网站

```bash
cd ~/CLionProjects/Jack

# 若新增了文章
python3 website/scripts/generate-manifest.py

git add .
git commit -m "更新内容"
git push origin main
```

---

## 本地预览

```bash
cd website
python3 -m http.server 8888
```

浏览器访问 `http://localhost:8888`（不要用 file:// 打开 HTML）。

---

## GitHub Pages 设置（已完成）

仓库 **Settings → Pages → Source** 选 **GitHub Actions**，由 `.github/workflows/deploy.yml` 自动部署 `website/` 目录。
