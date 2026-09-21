You are a senior full-stack engineer, real-time systems architect and Gen-Z product designer. We are building DareCam from scratch. Ignore any previous code.

## What DareCam is
A live, host-controlled video game for young adults (18+, South Africa), inspired by Omegle/OmeTV, but with only two people per session: the HOST (me) and ONE PLAYER.
- The host watches the player live on video. Where the host's face would normally appear, the player sees a CARD instead.
- The host controls the cards. Each card is a task or question (e.g. "wave", "how old are you", "answer 5 questions", "show us your favourite snack"). Multi-step cards show a progress indicator.
- The player does the task on camera. The host watches, verifies it was done, taps Verify (which awards points, default 100 per card, configurable), then taps Next to push the next card.
- A side chat is available between host and player (players can suggest rewards they'd like here)
- Points feed a daily leaderboard across all players (resets at midnight SAST). Only the top scorer of the day wins that day's reward.
- Rewards are placeholders: players suggest reward ideas in chat, and the host/admin picks the daily reward. Never real-money payouts.
- Players wait in a lobby queue, and the host takes one player at a time ("Start with next player" / "End turn")
- Extras: streaks, levels, badges, campaign challenges, celebration animations
It must feel like a cool live game show, not a dating site.

## Two experiences
**Player view:** own camera preview, a large card tile where the host would appear, points bar and daily rank, side chat with a "suggest a reward" feature, celebration effects when points are awarded, queue position and estimated wait while waiting. The player can skip any card without penalty and leave at any time.
**Host console:** the player's video large, current card and card library (categories, favourites, playlists / "run of show"), quick-add custom card, buttons for Verify, Next, Skip, Redo, Warn, End turn and Emergency stop, the queue of waiting players, side chat, live daily leaderboard, and keyboard shortcuts. Host microphone is optional (off by default, toggleable), and the host's camera is off by default.

## Recommended stack (simplest thing that works; challenge it with reasons if you know better)
- Frontend: React + Vite + TypeScript, Tailwind CSS, Framer Motion, TanStack Query, Zustand, React Router
- Video/audio: LiveKit Cloud. The player publishes camera and mic, and the host subscribes. Tokens are issued by a Supabase Edge Function.
- Backend and data: Supabase (Postgres, Auth, Row Level Security, Realtime for queue, chat and card events, Edge Functions and RPCs for trusted logic). No custom server unless you can justify one.
- Roles: player, host, admin. Only the host role can award points, enforced in the database (RLS/RPC), never on the client.
- Zod for validation, pnpm workspace if useful, Vitest and Playwright for tests, ESLint, Prettier, GitHub Actions CI
- Hosting: frontend on Vercel or Cloudflare Pages. Not Netlify.

## Step 1: Plan before code
Do not write application code yet. First produce in /docs: ARCHITECTURE.md (system diagram and data flow for queue, sessions, video, chat, cards and points), DATABASE.md (schema and RLS: users, profiles, sessions, queue_entries, cards, card_categories, session_card_events, points_ledger, daily_scores, reward_suggestions, reward_votes, daily_rewards, campaigns, reports, bans, audit_log), ROADMAP.md (stages, runnable milestones, cost estimates at 100 / 1,000 / 10,000 players per month, risks) and DESIGN_SYSTEM.md. Then stop for my approval.

## Step 2: Build in stages
Start with a thin vertical slice: one host, one player, video, one card flow, verify, points. Then expand.
1. Project setup, tooling, CI, README
2. Design system, landing page, onboarding, 18+ gate and consent screen
3. Auth, roles and profiles
4. Lobby queue and the host/player video session with chat
5. Card engine and host console
6. Points ledger, verification, daily leaderboard and winner
7. Reward suggestions and voting
8. Safety and moderation
9. Admin dashboard: cards, reward decisions, reports, bans
10. Polish, performance, accessibility, testing, deployment guide

## Design direction
Young, aesthetic, Gen-Z: dark mode, neon/gradient accents, glassmorphism, bold type, rounded shapes. Cards flip or slide in, points count up, confetti and sound on verification, progress rings, haptics on mobile. Mobile-first player view, desktop-first host console. Fast, accessible (WCAG AA), reduced-motion support, PWA-installable.

## Game rules
- Points and card state are server-authoritative. Only a verified host action can award points.
- Every points change is an append-only ledger row with player, session, card, host and timestamp. Every host action goes in an audit log.
- Prevent duplicate awards and replay. Rate-limit all events.
- Seed 60+ fun, safe cards across categories (icebreaker, would-you-rather, dare, movement, creative, mini-game). Custom host cards pass through a blocklist filter.

## Safety and trust (non-negotiable)
- Strictly 18+, with an age-verification approach (propose options and trade-offs, recommend one)
- Full transparency: the player must clearly see that the host is watching live and accept consent terms before every session
- Card guardrails: no requests for contact details, address, location, ID, or undressing/sexual tasks, enforced by the filter and card categories
- The player can skip, leave, block and report in one tap. Reports are saved for admin review.
- No recording or storage of video or audio by default. Chat is kept only for a short moderation window.
- Host accountability: audit log, ability for admins to review, and a code of conduct for hosts
- Strike and ban system, community guidelines shown before first use, safe mode by default
- POPIA-compliant privacy policy, terms, cookie consent, and data-deletion flow (placeholders for legal text)
- Daily reward = placeholders for competition rules (free entry, transparent winner selection)

## Future add-ins (NOT part of the MVP, do not build yet)
- **Watch live view:** waiting players in the queue can watch the current player's session as spectators, like a live stream. Spectators would be view-only, with their own consent and moderation rules, and separate from the private host/player chat.
- **Multiple hosts:** support more than one host, each running their own session and queue.

Do not implement these now. Design the architecture so they can be added later without a rewrite: don't hardcode a single host, keep session and room state per-session, and keep chat and card events scoped to a session id so spectators could subscribe to a read-only stream later.

## Working rules
- Ask me instead of guessing when something is ambiguous
- Keep clearly marked placeholders for anything I must supply and list them in /docs/PLACEHOLDERS.md
- After each stage: what changed, how to run and test it, and what's next
- Strict TypeScript, no `any`, tests for game logic and points rules, secrets only in environment variables, and an .env.example
- Prioritise a working, beautiful MVP over feature sprawl. Cut scope before cutting quality or safety.
