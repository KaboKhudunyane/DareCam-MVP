# DareCam database plan

Production uses Supabase Postgres. The mock app mirrors these entities in localStorage.

## Tables
- `profiles(id uuid primary key references auth.users, role text check (role in ('player','host','admin')), display_name, age_verified_at, consent_version, created_at)`
- `queue_entries(id, player_id, status, joined_at, left_at)`
- `sessions(id, host_id, player_id, status, started_at, ended_at, consent_version)`
- `cards(id, category, prompt, steps jsonb, points integer, is_active, created_by)`
- `session_cards(id, session_id, card_id, position, state, verified_at)`
- `chat_messages(id, session_id, sender_id, body, created_at, expires_at)`
- `points_ledger(id, player_id, session_id, card_id, host_id, points, reason, idempotency_key unique, created_at)`
- `leaderboard_daily(day_sast, player_id, total_points, rank, reward_status)`
- `reports(id, session_id, reporter_id, reason, details, status, created_at)`
- `audit_log(id, session_id, actor_id, action, metadata jsonb, created_at)`

## RLS and trusted writes
Players can read their own profile/session/chat, and can insert their own queue entry and report. Session participants can read session cards and non-expired chat. Hosts can read their assigned session and issue commands only through `verify_card`, `advance_card`, `end_turn`, and `send_warning` RPCs. Only those RPCs can insert ledger rows; `verify_card` locks the card, checks host/session ownership, rejects a used idempotency key, and writes an audit row in one transaction. Admins can review reports, audit events and bans.

Daily ranking uses a SAST date key (UTC+2, with DST policy fixed by the service) and sums the ledger, never client-supplied totals. A scheduled job marks one winner after the day closes. Chat/video retention is short and documented; no media blobs are stored.

## Mock mapping
The demo uses `localStorage` for consent, queue, chat, cards and ledger. All mock trusted commands still validate role, card state and duplicate verification so game rules can be tested offline.
