# DareCam MVP

A local mock demo for the DareCam MVP concept: a host-controlled live game where a host runs cards with a single player, tracks points, and uses a chat panel for reward suggestions.

## Stack

- React
- React Router
- Vite
- TypeScript
- CSS

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Pages

- `/` landing page with product overview
- `/onboard` age gate and consent flow
- `/lobby` queue preview and start session CTA
- `/session` live host/player session mock

## Notes

This is the first working vertical slice: onboarding gate, role switching, live session panel, card flow, leaderboard, chat and reward suggestions. The app is intentionally mock-mode and designed to be replaced with Supabase + LiveKit adapters in production.
