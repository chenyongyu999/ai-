# 📋 成就库

互联网职场项目管理工具，支持产品/运营/广告销售/市场/数据/技术六大行业，内置 AI 面试模拟。

## 🚀 一键启动（macOS）

```bash
# 1. 解压后进入文件夹
cd portfolio-app

# 2. 给脚本执行权限（只需一次）
chmod +x start.sh

# 3. 启动
./start.sh
```

脚本会自动：
- 检查并安装 Node.js
- 引导你填入 Anthropic API Key
- 安装依赖
- 打开浏览器

---

## ⚙️ 手动配置

### API Key（面试模拟功能）

```bash
# 复制模板
cp .env.example .env.local

# 编辑，填入你的 Key
open -e .env.local
```

Key 获取地址：https://console.anthropic.com

### 手动启动

```bash
npm install
npm run dev
```

---

## 📁 项目结构

```
portfolio-app/
├── src/
│   ├── App.jsx       # 主应用（所有功能在这一个文件里）
│   └── main.jsx      # 入口
├── index.html
├── .env.example      # API Key 模板
├── .env.local        # 你的本地配置（不提交到 git）
├── start.sh          # 一键启动脚本
└── package.json
```

## 💾 数据存储

项目数据自动保存在浏览器 `localStorage`，刷新不丢失。
清除浏览器数据会重置为示例项目。

## 🌐 部署到公网（可选）

```bash
# 构建
npm run build

# 部署到 Vercel（需要先 npm i -g vercel）
vercel --prod
```
