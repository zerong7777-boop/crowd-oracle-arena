# 众声神谕竞技场 / Crowd Oracle Arena

[English README](./README.md)

> Crowd Oracle Arena is a multiplayer AI party game where the crowd answers absurd trials and an AI oracle judges them live.

众声神谕竞技场是一个多人围观型 AI 派对游戏。主持人创建房间，玩家用手机加入并提交一句离谱答案，AI 神谕在大屏上逐条裁决、吐槽、打分，最后生成排行榜。

这个项目由 Ron 一人通过 vibe coding 独立完成，从创意、玩法、视觉到实时互动实现，目标是让聚会、课堂、社群活动和直播间快速获得一个能让所有人参与的互动游戏。

## 在线体验

- Railway: `https://crowd-oracle-arena-production.up.railway.app`
- 本地预览: `http://localhost:3000/host`

## 核心亮点

- 手机即入场
- 大屏实时围观
- AI 神谕裁决
- 逐条揭晓制造悬念
- 适合多人派对传播

## 玩法流程

1. 主持人打开 `/host` 创建房间。
2. 主持人打开大屏链接 `/screen/<roomCode>`。
3. 玩家通过 `/join/<roomCode>` 输入昵称加入。
4. 主持人选择审判题并开始本轮。
5. 玩家提交一句答案。
6. 主持人停止提交并点击神谕裁决。
7. 大屏逐条展示裁决卡片。
8. 主持人显示排行榜，继续下一轮。

## 使用场景

- 朋友聚会、桌游暖场
- 课堂、社群、活动破冰
- 直播间观众互动游戏

## 技术栈

- React 19
- Vite
- TypeScript
- Express
- Socket.IO
- OpenAI-compatible API
- Railway-ready Node deployment

## 本地开发

```powershell
npm install
npm run dev
```

开发服务默认入口：

- 主持页: `http://localhost:5173/host`
- 加入页: `http://localhost:5173/join`
- 大屏页: 主持页创建房间后打开

## 环境变量

复制 `.env.example` 为 `.env`，然后填写：

```text
OPENAI_API_KEY=
OPENAI_BASE_URL=https://zxai.work/v1
OPENAI_MODEL=gpt-5.4
PORT=3000
NODE_ENV=development
```

说明：

- `OPENAI_API_KEY` 为空时会使用本地备用神谕。
- `OPENAI_BASE_URL` 支持 OpenAI-compatible 服务。
- 如果使用官方 OpenAI API，可以移除 `OPENAI_BASE_URL` 并设置对应模型。

## 构建与运行

```powershell
npm run build
npm run start
```

生产服务默认运行在：

```text
http://localhost:3000
```

## Railway 部署

这是一个单服务 Node 应用。Railway 中建议设置：

```text
OPENAI_API_KEY=<your-key>
OPENAI_BASE_URL=https://zxai.work/v1
OPENAI_MODEL=gpt-5.4
NODE_ENV=production
```

Railway 会使用 `railway.json` 中的启动命令：

```text
npm run start
```

部署前需要先运行构建，或让 Railway 在部署阶段执行：

```powershell
npm run build
```

## 验证

```powershell
npm run test
npm run typecheck
npm run build
```

## License

MIT
