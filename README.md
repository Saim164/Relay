# Relay

Relay is a one-to-one messaging app, built as a portfolio and learning project. It's an ongoing project: new features will be added as it grows.

## Features

- Sign up and log in, with the session kept in an HTTP-only JWT cookie
- Search for people by username
- One-to-one chats, each with its own URL (`/dashboard/<conversationId>`)
- Real-time messages: the other person sees a message instantly, without refreshing
- Send images (JPEG, PNG, WebP, GIF) and PDFs, up to 10 MB each
- Chat list sorted by latest activity, with a preview of the last message
- Message history with "Load older"
- Works on phones: the chat list or the open chat, with a Back button

## Tech stack

| Part | Tools |
|---|---|
| Backend | Node.js, Express 5, MongoDB + Mongoose, JWT, bcrypt, Zod, Socket.IO, Helmet, CORS, express-rate-limit |
| Frontend | Next.js (App Router), React, Tailwind CSS, socket.io-client |
| Files | Cloudinary |
| Hosting | Render (backend), Vercel (frontend), MongoDB Atlas (database) |

## How it works

- **HTTP:** the browser sends every API request to `/api/v1` on the frontend's own site. Next.js forwards it to the backend (see `frontend/next.config.mjs`), so the login cookie belongs to the frontend's domain, which keeps Safari happy.
- **Real time:** when a message is saved, the backend pushes a `message:new` event through Socket.IO to both people in the chat. The browser connects straight to the backend and logs in with a short-lived ticket from `GET /api/v1/users/socket-token`.
- **Files:** the browser asks the backend for a signed upload ticket, uploads the file straight to Cloudinary, then sends a normal message with the file's id. The backend checks the file with Cloudinary before saving the message.

## Project structure

- `backend/` — Express API, organised as routes → controllers → services → repositories → models
- `frontend/` — Next.js app: pages in `app/`, data hooks in `hooks/`, UI in `components/`, helpers in `lib/`

## Run locally

1. Create a free [Cloudinary](https://cloudinary.com) account, then in its settings:
   - copy your **cloud name**, and an **API key and secret** (the key needs a role that can upload, e.g. Master)
   - under Security, turn on **"Allow delivery of PDF and ZIP files"**
2. Copy `backend/.env.example` to `backend/.env` and fill in `MONGO_URL`, `JWT_SECRET` and the three `CLOUDINARY_...` values.
3. In `backend/`, run `npm install`, then `npm run dev`.
4. Copy `frontend/.env.example` to `frontend/.env.local` (`BACKEND_URL=http://localhost:5000`).
5. In `frontend/`, run `npm install`, then `npm run dev`.
6. Open `http://localhost:3000`.

The backend only reads `.env` when it starts, so restart it after changing `.env`.

## API

All routes are under `/api/v1`. `GET /` returns "Relay API is running".

| Method | Route | What it does |
|---|---|---|
| POST | `/users/register` | create an account |
| POST | `/users/login` | log in (sets the cookie) |
| POST | `/users/logout` | log out (clears the cookie) |
| GET | `/users/me` | the logged-in user |
| GET | `/users/search?username=` | find people |
| GET | `/users/socket-token` | a 1-minute ticket for the socket |
| GET | `/conversations` | my chats, newest first |
| POST | `/conversations` | find or create a chat with someone |
| GET | `/conversations/:id/messages?before=&limit=` | messages, with pagination |
| POST | `/conversations/:id/messages` | send a message (text and/or a file) |
| POST | `/conversations/:id/attachments/sign` | a signed ticket to upload a file to Cloudinary |

Everything except register, login and logout needs you to be logged in. A conversation you're not part of answers 404.

## Deploying

- **Backend (Render):** set `MONGO_URL`, `JWT_SECRET`, `NODE_ENV=production`, the three `CLOUDINARY_...` values, and `CLIENT_URL` to your Vercel URL. `CLIENT_URL` can be a comma-separated list, e.g. `https://your-app.vercel.app,http://localhost:3000`. Render provides `PORT`.
- **Frontend (Vercel):** set `BACKEND_URL` to the Render URL (origin only, e.g. `https://your-api.onrender.com`), then redeploy. It's read at build time, and it's also used as the socket's address.
