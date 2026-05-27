# Maimemo Desktop

墨墨背单词 Windows 桌面伴侣应用，基于 Tauri 2 + Vue 3 + TypeScript 构建。

## 功能

- **悬浮单词卡片**：始终置顶的迷你窗口，自动轮播今日单词，被动式记忆
- **睡前回顾**：速览 → 自测 → 强化的完整回顾流程
- **仪表盘**：今日学习进度、学习时长、单词统计
- **云词本管理**：创建/编辑/删除云词本
- **单词详情**：查看释义、助记、例句
- **学习统计**：学习数据分析和可视化

## 开发环境准备

### 前置条件

- [Node.js](https://nodejs.org/) >= 18
- [Rust](https://rustup.rs/) (Tauri 需要)
- Windows 10/11

### 安装依赖

```bash
npm install
```

### 配置 API Token

1. 在墨墨背单词 App 中申请开放 API Token
2. 复制 `.env.example` 为 `.env`
3. 在 `.env` 中填入你的 Token：

```
VITE_MAIMEMO_API_TOKEN=your_token_here
```

> **注意：`.env` 文件包含敏感信息，绝不要提交到 Git！**

### 开发模式

```bash
npm run tauri dev
```

### 构建

```bash
npm run tauri build
```

## 技术栈

- [Tauri 2](https://tauri.app/) - 轻量级桌面应用框架
- [Vue 3](https://vuejs.org/) - 前端框架
- [TypeScript](https://www.typescriptlang.org/) - 类型安全
- [Pinia](https://pinia.vuejs.org/) - 状态管理
- [Vue Router](https://router.vuejs.org/) - 路由
- [Axios](https://axios-http.com/) - HTTP 客户端

## API 限制

- 频控：10s/20次、60s/40次、5h/2000次
- 学习数据接口为公测状态，需在 App 中开启自动同步
