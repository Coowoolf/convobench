# ConvoBench

> 专业的对话式 AI Agent 评测平台 | AI Agent Evaluation Platform

🌐 **Live Demo**: [convobench.org](https://convobench.org)

## 功能特性

- 📊 **仪表盘** - 实时监控评测状态和通过率趋势
- 📝 **任务管理** - 创建、编辑和管理评测任务
- 🎯 **评测套件** - 组织任务为逻辑套件
- ▶️ **运行评测** - 一键执行评测并查看实时进度
- 📜 **轨迹查看** - 详细查看对话轨迹和指标
- 📈 **分析报告** - 深入分析评测数据

## 技术栈

- **Framework**: Next.js 15 (App Router)
- **Database**: SQLite + Drizzle ORM
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **State**: React Context + SWR

## 快速开始

```bash
# 安装依赖
npm install

# 初始化数据库
npx drizzle-kit push

# 启动开发服务器
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 环境变量

复制 `.env.example` 到 `.env.local` 并配置：

```env
# Agora Conversational AI
AGORA_APP_ID=your_app_id
AGORA_APP_CERT=your_app_cert
AGORA_BASIC_AUTH_KEY=your_key
AGORA_BASIC_AUTH_SECRET=your_secret

# LLM for simulation & grading
LLM_API_URL=https://api.openai.com/v1
LLM_API_KEY=your_api_key
LLM_MODEL=gpt-4
```

## 部署

已部署到 Vercel: [convobench.org](https://convobench.org)

## License

MIT
