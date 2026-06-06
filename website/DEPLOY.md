# 部署指南 — 国内访问推荐

## ⚠️ 关于 Gitee Pages

**Gitee Pages 已于 2024 年 5 月正式下线**，官方已移除入口，所以在仓库「服务」菜单里**找不到 Gitee Pages 是正常的**，不是操作问题。

详见 [Gitee 官方反馈](https://gitee.com/oschina/git-osc/issues/IJR1TI)。

---

## 推荐方案（国内无需翻墙）

### 方案 A：EdgeOne Pages（推荐，免费 + 国内快）

腾讯云 EdgeOne 提供的免费静态托管，适合个人博客。

1. 打开 [EdgeOne Pages](https://pages.edgeone.ai/)
2. 注册 / 登录
3. 选择 **Pages Drop** 或 **上传部署**
4. 打包网站：

```bash
cd ~/CLionProjects/Jack
chmod +x scripts/package-website.sh
./scripts/package-website.sh
```

5. 将生成的 `jack-blog-site.zip` 或整个 `website/` 文件夹拖入上传
6. 获得类似 `https://xxx.edgeone.app` 的访问链接，手机可直接打开

---

### 方案 B：上码 Upma（国内线路优化）

1. 打开 [upma.cn](https://www.upma.cn/)
2. 注册账号
3. 新建项目 → 上传 `website/` 文件夹或 `jack-blog-site.zip`
4. 获得访问链接，可绑定自定义域名

---

### 方案 C：Cloudflare Pages（连接 GitHub 自动部署）

国内访问比 GitHub Pages 略好，推送代码后自动更新。

1. 打开 [Cloudflare Pages](https://pages.cloudflare.com/)
2. **Create a project** → 连接 GitHub 账号
3. 选择仓库 `JackisCoding/jack-blog`
4. 构建设置：
   - **Framework preset**：None
   - **Build command**：（留空）
   - **Build output directory**：`website`
5. 部署完成后获得 `https://jack-blog.pages.dev` 类似链接

---

### 方案 D：GitHub Pages（已配置，国内不稳定）

已自动部署，地址：

**https://jackiscoding.github.io/jack-blog/**

国内有时能打开、有时慢或超时，**不适合作为国内主要访问方式**。网站资源已本地化，若偶尔能连上 GitHub 则体验尚可。

---

## 本地预览

```bash
cd website
python3 -m http.server 8888
```

浏览器访问 `http://localhost:8888`

---

## 更新网站内容

```bash
cd ~/CLionProjects/Jack

# 新增文章后生成索引
python3 website/scripts/generate-manifest.py

git add .
git commit -m "更新内容"
git push origin main          # 更新 GitHub Pages
```

若使用 EdgeOne / Upma 拖拽部署，更新后重新打包上传即可：

```bash
./scripts/package-website.sh
# 再到平台上传新的 zip
```

---

## 国内优化（已完成）

- ✅ 字体：系统字体，不依赖 Google Fonts
- ✅ Tailwind / marked.js：本地 `js/vendor/`，不依赖境外 CDN
- ✅ 图片、文章：全部在仓库内，无外部依赖
