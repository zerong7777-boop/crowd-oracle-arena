# Crowd Oracle Arena

[中文 README](./README.zh-CN.md)

> Crowd Oracle Arena is a multiplayer AI party game where the crowd answers absurd trials and an AI oracle judges them live.

Crowd Oracle Arena is a spectator-friendly multiplayer AI party game. A host creates a room, players join from their phones and submit one-line answers, and an AI oracle reveals live verdicts, commentary, scores, awards, and a leaderboard on the big screen.

The project was built solo by Ron through vibe coding, covering the concept, gameplay, visual direction, realtime multiplayer flow, AI judging, and deployment-ready Node stack.

## Live Demo

- Railway: `https://crowd-oracle-arena-production.up.railway.app`
- Local preview: `http://localhost:3000/host`

## Highlights

- Phone-first joining
- Live big-screen viewing
- AI oracle judging
- Suspenseful verdict reveals
- Built for party sharing

## Gameplay Flow

1. The host opens `/host` and creates a room.
2. The host opens the big-screen page at `/screen/<roomCode>`.
3. Players join through `/join/<roomCode>` and enter nicknames.
4. The host chooses a trial prompt and starts the round.
5. Players submit one-line answers.
6. The host closes submissions and asks the oracle to judge.
7. The big screen reveals verdict cards one by one.
8. The host shows the leaderboard and starts another round.

## Use Cases

- Party warmups and tabletop game nights
- Classroom, community, and event icebreakers
- Livestream audience interaction games

## Tech Stack

- React 19
- Vite
- TypeScript
- Express
- Socket.IO
- OpenAI-compatible API
- Railway-ready Node deployment

## Local Development

```powershell
npm install
npm run dev
```

Development URLs:

- Host: `http://localhost:5173/host`
- Join: `http://localhost:5173/join`
- Screen: opened from the host page after room creation

## Environment Variables

Copy `.env.example` to `.env`, then configure:

```text
OPENAI_API_KEY=
OPENAI_BASE_URL=https://zxai.work/v1
OPENAI_MODEL=gpt-5.4
PORT=3000
NODE_ENV=development
```

Notes:

- If `OPENAI_API_KEY` is empty, the app uses the local fallback oracle.
- `OPENAI_BASE_URL` supports OpenAI-compatible services.
- If you use the official OpenAI API, remove `OPENAI_BASE_URL` and set a supported OpenAI model.

## Build and Run

```powershell
npm run build
npm run start
```

The production server runs at:

```text
http://localhost:3000
```

## Railway Deployment

This project deploys as a single Node service. Recommended Railway variables:

```text
OPENAI_API_KEY=<your-key>
OPENAI_BASE_URL=https://zxai.work/v1
OPENAI_MODEL=gpt-5.4
NODE_ENV=production
```

Railway uses the start command in `railway.json`:

```text
npm run start
```

Run the build before deployment, or configure Railway to run:

```powershell
npm run build
```

## Verification

```powershell
npm run test
npm run typecheck
npm run build
```

## License

MIT
