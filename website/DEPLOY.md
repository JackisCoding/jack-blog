# 部署指南 — 让手机通过公网访问

## 当前部署方式：gh-pages 分支（推荐，最稳定）

推送代码后，GitHub Actions 会自动把 `website/` 文件夹部署到 `gh-pages` 分支。

### 一次性设置（在 GitHub 网页操作）

1. 打开：https://github.com/JackisCoding/jack-blog/settings/pages
2. **Build and deployment** → **Source** 选择 **Deploy from a branch**
3. **Branch** 选 **gh-pages**，文件夹选 **/ (root)**
4. 点击 **Save**

> 注意：不要选 GitHub Actions，也不要点 Jekyll / Static HTML 的 Configure。

### 推送代码

```bash
cd ~/CLionProjects/Jack
git push origin main
```

### 手机访问地址

部署成功后（约 1–2 分钟），用手机浏览器打开：

**https://jackiscoding.github.io/jack-blog/**

---

## 本地预览

```bash
cd website
python3 -m http.server 8888
```

访问 `http://localhost:8888`（不要用 file:// 打开 HTML）。

---

## 新增文章

1. 在 `website/posts/` 添加 `.md` 文件
2. 运行 `python3 website/scripts/generate-manifest.py`
3. `git add . && git commit -m "新增文章" && git push`
