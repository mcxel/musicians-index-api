# API dev helpers

This folder contains a small dev-only tickets HTTP server used by the web UI
when a live database or Prisma migrations are not available.

Usage
-----

- DEV mode (recommended for local UI work):

```powershell
cd "C:\Users\Admin\Documents\BerntoutGlobal XXL\tmi-platform"
$env:DEV_TICKETS = "true"
$env:PORT = "4000"  # optional — default 4000
node apps/api/dev-tickets-server.cjs
```

- The server exposes two endpoints used by the scanner UI:
  - `POST /api/tickets/verify` — verify a token
  - `POST /api/tickets/checkin` — mark token as checked-in

Environment
-----------

- `DEV_TICKETS` — when set to `true` the server will accept requests; if not set,
  the server returns 503 to avoid interfering with production APIs.
- `PORT` — port to listen on (defaults to 4000).

Notes
-----

- The server keeps data in-memory and is only intended for local UI development.
- The project includes a small patch to auto-load a root `.env` using `dotenv` if
  present — this is a convenience for local development.

If you want a permanent production ticketing API, wire the `tickets` endpoints
to the real backend and run Prisma migrations with a configured `DATABASE_URL`.

## Phase 11 auth/session scope and limitations

- Auth endpoints in `src/modules/auth/*` now use bcrypt-based password hashing.
- Session handling is intentionally isolated to an in-memory store for local Phase 11 closure.
- In-memory sessions are not production-safe because sessions are lost on restart and do not scale across instances.
- `GET /api/readyz` reports this as a blocker in production mode (`NODE_ENV=production`).

For production onboarding, replace the in-memory session store with a persistent store and rotate cookie/session secrets using environment-managed configuration.
