# Relay

Relay is a portfolio and learning project focused on building a modern messaging app. It is an ongoing project: new features and improved versions will be added as it develops.

## Current features

- Account registration and login with an HTTP-only JWT cookie
- Authenticated username search
- One-to-one conversations
- Text message history and sending
- A protected dashboard with a conversation sidebar; each chat has its own URL (`/dashboard/<conversationId>`)
- Loading older messages

## Project structure

- `backend/` — Express API and MongoDB data layer
- `frontend/` — Next.js App Router interface

## Run locally

1. Copy `backend/.env.example` to `backend/.env` and fill in `MONGO_URL` and `JWT_SECRET`.
2. In `backend/`, install dependencies and run `npm run dev`.
3. Copy `frontend/.env.example` to `frontend/.env.local` (`BACKEND_URL=http://localhost:5000`).
4. In `frontend/`, install dependencies and run `npm run dev`.
5. Open `http://localhost:3000`.

## API

All routes are under `/api/v1`: `/api/v1/users/...` for accounts and search, `/api/v1/conversations/...` for chats and messages. `GET /` returns a "Relay API is running" message.

## Deploying

- **Backend (Render):** set `MONGO_URL`, `JWT_SECRET`, `NODE_ENV=production`, and `CLIENT_URL` to your Vercel URL. `CLIENT_URL` can be a comma-separated list, e.g. `https://your-app.vercel.app,http://localhost:3000`. Render provides `PORT`.
- **Frontend (Vercel):** set `BACKEND_URL` to the Render URL (origin only, e.g. `https://your-api.onrender.com`), then redeploy. Don't set `NEXT_PUBLIC_API_URL`: HTTP requests go through the Next.js proxy (`/api/v1` → `BACKEND_URL`, see `next.config.mjs`), so the login cookie belongs to the frontend's domain. The socket connects straight to Render (`next.config.mjs` passes `BACKEND_URL` to the browser as `SOCKET_URL`) and logs in with a short-lived ticket from `GET /api/v1/users/socket-token`.
