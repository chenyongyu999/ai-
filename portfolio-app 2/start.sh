#!/bin/bash
set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo ""
echo -e "${BLUE}📋 成就库 - 启动脚本${NC}"
echo "================================"

# 检查 Node.js
if ! command -v node &> /dev/null; then
  echo -e "${YELLOW}⚠️  未检测到 Node.js，正在通过 Homebrew 安装...${NC}"
  if ! command -v brew &> /dev/null; then
    echo "请先安装 Homebrew: https://brew.sh"
    exit 1
  fi
  brew install node
fi

echo -e "${GREEN}✓ Node.js $(node -v) 已就绪${NC}"

# 创建 .env.local（如果不存在）
if [ ! -f ".env.local" ]; then
  echo ""
  echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${YELLOW}  配置 Anthropic API Key（面试模拟功能）${NC}"
  echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
  echo "  获取地址：https://console.anthropic.com"
  echo ""
  read -p "  请粘贴你的 API Key（直接回车跳过）: " apikey
  echo ""

  if [ -n "$apikey" ]; then
    echo "VITE_ANTHROPIC_API_KEY=$apikey" > .env.local
    echo -e "${GREEN}✓ API Key 已保存到 .env.local${NC}"
  else
    echo "VITE_ANTHROPIC_API_KEY=" > .env.local
    echo -e "${YELLOW}⚠️  跳过 API Key，面试模拟功能暂不可用${NC}"
    echo "   之后可以编辑 .env.local 文件填入 Key"
  fi
fi

# 安装依赖
if [ ! -d "node_modules" ]; then
  echo ""
  echo "📦 安装依赖..."
  npm install --silent
  echo -e "${GREEN}✓ 依赖安装完成${NC}"
fi

echo ""
echo -e "${GREEN}🚀 启动开发服务器...${NC}"
echo -e "   浏览器将自动打开 ${BLUE}http://localhost:3000${NC}"
echo ""
echo "   按 Ctrl+C 停止服务"
echo ""

npm run dev
