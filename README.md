# Relay

Relay is a portfolio and learning project focused on building a modern messaging app. It is an ongoing project: new features and improved versions will be added as it develops.

## Current features

- Account registration and login with an HTTP-only JWT cookie
- Authenticated username search
- One-to-one conversations
- Text message history and sending
- A protected dashboard with a conversation sidebar

## Project structure

- `backend/` — Express API and MongoDB data layer
- `frontend/` — Next.js App Router interface

## Run locally

1. Configure the backend environment with `MONGO_URL`, `JWT_SECRET`, and `CLIENT_URL`.
2. In `backend/`, install dependencies and run `npm run dev`.
3. Set `NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1` in `frontend/.env.local`.
4. In `frontend/`, install dependencies and run `npm run dev`.
5. Open `http://localhost:3000`.

The frontend uses `/api/v1/users` for account and user routes. Conversation routes are currently mounted at `/api/conversations`.
