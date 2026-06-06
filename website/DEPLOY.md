# 部署指南 — 让手机通过公网访问

本网站是纯静态页面，部署后可通过 **HTTPS 链接** 在任何手机浏览器中打开。

## 推荐方式：GitHub Pages（免费）

你的 GitHub 账号：[JackisCoding](https://github.com/JackisCoding)

### 第一步：创建仓库并推送代码

在项目根目录（`Jack/`，不是 `website/`）执行：

```bash
cd ~/CLionProjects/Jack

git init
git add .
git commit -m "初始化个人博客网站"

# 在 GitHub 网页上新建仓库，例如命名为 jack-blog（不要勾选 README）
git branch -M main
git remote add origin https://github.com/JackisCoding/jack-blog.git
git push -u origin main
```

> 若希望域名是 `https://jackiscoding.github.io`（无子路径），仓库名须为 **JackisCoding.github.io**。

### 第二步：开启 GitHub Pages

1. 打开仓库 → **Settings** → **Pages**
2. **Source** 选择 **GitHub Actions**
3. 推送代码后，Actions 会自动部署（约 1–2 分钟）

### 第三步：手机访问

部署完成后访问：

- 项目站点：`https://jackiscoding.github.io/jack-blog/`
- 用户站点（仓库名 `JackisCoding.github.io`）：`https://jackiscoding.github.io/`

用手机浏览器直接打开上述链接即可，无需安装 App。

---

## 其他免费部署方式

| 平台 | 特点 |
|------|------|
| [Cloudflare Pages](https://pages.cloudflare.com/) | 拖拽 `website` 文件夹上传，全球 CDN |
| [Netlify](https://www.netlify.com/) | 拖拽部署，自动 HTTPS |
| [Vercel](https://vercel.com/) | 连接 GitHub 自动部署 |

上传/部署目录均为 **`website/`** 文件夹内的全部内容。

---

## 本地预览（开发用）

```bash
cd website
python3 -m http.server 8888
```

电脑浏览器访问 `http://localhost:8888`。**不要用 file:// 直接打开 HTML**，否则文章加载会失败。

---

## 新增文章后

1. 在 `website/posts/` 添加 `.md` 文件
2. 运行 `python3 website/scripts/generate-manifest.py`
3. `git add . && git commit -m "新增文章" && git push`

推送后网站会自动更新。
