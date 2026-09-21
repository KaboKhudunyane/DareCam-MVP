# Assumptions

- The requested run covers all listed stages 1–10; future add-ins remain excluded.
- A static Vite app is the safest no-key local mode for this repository; it avoids pretending that browser-only mock state is production security.
- Demo role switching is intentionally visible and is not an authentication mechanism.
- Daily leaderboard date is represented as SAST in production; the demo seeds a current-day result.
- Camera permissions may be unavailable in CI and are therefore optional in mock mode.
