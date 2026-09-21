# DareCam architecture

## Product boundary
DareCam is a two-party, host-controlled live game: one host runs a session with one player. There are no spectators or multi-host rooms in the MVP. The session ID is the boundary for queue, media, chat, card events and audit data, so future room types do not require a rewrite.

## Local/mock mode
The browser app runs without external accounts. A seeded in-memory/localStorage store provides a demo host, player, queue, cards, chat and leaderboard. Camera access is optional and represented by a clearly labelled preview when unavailable. Production replaces the mock media adapter and trusted actions with LiveKit/Supabase adapters.

## System flow
```text
Browser (player/host)
  -> consent + role guard
  -> queue store (local mock / Supabase Realtime)
  -> session store (session-scoped state)
       |-> media adapter (mock / LiveKit room)
       |-> chat events (mock / Realtime, short retention)
       |-> card events (mock / Realtime)
       |-> trusted commands (mock / Edge Function + RPC)
                         |-> append-only points ledger
                         |-> audit log
                         |-> daily leaderboard (SAST midnight)
```

The host selects a card, the player sees it, and the host can verify it once. Verification emits an idempotent event keyed by session/card/player, then awards points through the trusted command boundary. Next advances the card only after verification or an explicit skip. UI state is optimistic only for presentation; production state is server authoritative.

## Security and safety
- Role and ownership checks belong in Supabase RLS and RPCs; the client never decides whether points are valid.
- Every host action is audited. Reports contain the session and actor, but video/audio are never recorded by default.
- Consent is shown before every session. Skip, leave, block and report are always available.
- Card creation uses the same blocklist on client and server; production server filtering is authoritative.

## Adapter seams
`MediaAdapter`, `GameStore`, and `TrustedCommand` are intentionally separate concepts. Mock mode uses deterministic seed data. Production needs LiveKit token issuance via an Edge Function, Supabase Auth, Realtime channels, Postgres RPCs, rate limiting, and retention jobs. API keys must remain server-side.
