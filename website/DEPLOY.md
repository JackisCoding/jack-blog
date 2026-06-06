# 部署指南 — Gitee Pages（国内推荐）

本网站是纯静态页面。部署到 **Gitee Pages** 后，国内手机/电脑可直接访问，**无需翻墙**。

## 访问地址

部署成功后：

```
https://你的Gitee用户名.gitee.io/jack-blog/
```

例如：`https://jackiscoding.gitee.io/jack-blog/`

---

## 第一次部署

### 1. 注册并实名认证 Gitee

1. 打开 [gitee.com](https://gitee.com) 注册账号
2. 完成**实名认证**（免费 Pages 必须实名）

### 2. 创建仓库

1. 点击右上角 **+** → **新建仓库**
2. 仓库名：`jack-blog`
3. 选 **公开**
4. **不要**勾选「使用 Readme 初始化」
5. 创建

### 3. 推送代码

在项目根目录执行：

```bash
cd ~/CLionProjects/Jack

# 添加 Gitee 远程（只需一次，用户名改成你的）
git remote add gitee https://gitee.com/你的用户名/jack-blog.git

# 推送
git push -u gitee main
```

> 若提示输入密码，使用 Gitee 账号密码或**私人令牌**（设置 → 私人令牌）。

也可使用脚本：

```bash
chmod +x scripts/push-gitee.sh
./scripts/push-gitee.sh
```

### 4. 开启 Gitee Pages

1. 打开仓库 → **服务** → **Gitee Pages**
2. 选择分支：**main**
3. 部署目录：由 **`.gitee-ci.yml`** 自动处理（`website/` 内容）
4. 点击 **启动** / **更新**

等待 1–3 分钟，状态变为「部署成功」即可访问。

### 5. 手机访问

浏览器打开：`https://你的用户名.gitee.io/jack-blog/`

---

## 更新网站

```bash
cd ~/CLionProjects/Jack

# 若新增了文章，先生成索引
python3 website/scripts/generate-manifest.py

git add .
git commit -m "更新网站内容"
git push gitee main
```

推送后到 **Gitee Pages** 页面点 **更新**，或等待 CI 自动部署。

---

## 本地预览

```bash
cd website
python3 -m http.server 8888
```

浏览器访问 `http://localhost:8888`

---

## 国内优化说明

网站已做国内访问优化：

- 字体使用系统字体（微软雅黑、PingFang 等），不依赖 Google Fonts
- Tailwind、marked.js 已下载到本地 `js/vendor/`，不依赖境外 CDN

---

## GitHub Pages（可选）

GitHub 部署仍保留在 `.github/workflows/deploy.yml`，可同时推送到两个平台：

```bash
git push origin main   # GitHub
git push gitee main    # Gitee（国内推荐）
```
