Here is the requested audit and recommendation report.

### A. Phase 11 Closeout Verdict

This audit confirms that the project is at a stabilization checkpoint, not completion. Phase 11 cannot be considered closed until the following gaps are addressed.

*   **What is Complete:**
    *   Basic service availability is confirmed for the web and API layers.
    *   `GET /api/healthz` is stable on both web and API, confirming process health.
    *   A controlled, temporary fallback for `GET /api/auth/session` on the web layer provides a predictable unauthenticated state, preventing uncontrolled errors.

*   **What is Incomplete:**
    *   **Real Backend Authentication:** The backend has no authentication or session management logic. The current state is a placeholder.
    *   **Backend `readyz` Probe:** The backend is missing a formal `/api/readyz` endpoint to verify the health of its dependencies (e.g., database).
    *   **Source Code Discrepancies:** Critical fixes were made directly in compiled `dist` output. These must be migrated to the TypeScript source to ensure they are not lost on the next build.
    *   **`BotLog` Schema Mismatch:** Runtime code expects a `prisma.botLog` model, which does not exist in the `schema.prisma` file, representing a critical runtime risk.
    *   **Production Environment Hardening:** `DATABASE_URL` and other secrets are not yet managed correctly for a production environment.

*   **What Must Happen Before Phase 11 is Truly Closed:**
    1.  Implement a robust, secure authentication system in the backend API.
    2.  Create a formal, dependency-aware `/api/readyz` endpoint in the backend.
    3.  Reconcile the `BotLog` schema and runtime mismatch.
    4.  Identify and migrate all "dist-only" fixes back into the TypeScript source code.
    5.  Remove the temporary auth fallback from the web layer once the real backend auth is consumed.
    6.  Establish a clear, long-term routing and proxy strategy.

### B. Auth Contract Recommendation

The following contract is recommended for the **backend API (NestJS)**. It is designed to be stateless from the server's perspective, relying on JWTs delivered via secure cookies.

*   **Session Strategy:** JWT (Access Token) + Refresh Token.
    *   **Access Token:** Short-lived (e.g., 15 minutes), stored in a secure, `HttpOnly`, `SameSite=Strict` cookie. Contains user ID and roles.
    *   **Refresh Token:** Long-lived (e.g., 7 days), stored in a separate secure, `HttpOnly`, `SameSite=Strict` cookie. Used to obtain a new access token. Stored in the database and can be revoked.

*   **Route Contract:**

    *   **`POST /api/auth/register`**
        *   **Request Body:** `{ "email": "...", "password": "...", "name": "..." }`
        *   **Response (201 Created):** `{ "id": "...", "email": "...", "name": "...", "role": "USER" }`
        *   **Response (409 Conflict):** `{ "statusCode": 409, "message": "Email already exists" }`

    *   **`POST /api/auth/login`**
        *   **Request Body:** `{ "email": "...", "password": "..." }`
        *   **Action:** Validates credentials. On success, sets `access_token` and `refresh_token` cookies.
        *   **Response (200 OK):** `{ "id": "...", "email": "...", "name": "...", "role": "USER" }`
        *   **Response (401 Unauthorized):** `{ "statusCode": 401, "message": "Invalid credentials" }`

    *   **`POST /api/auth/logout`**
        *   **Action:** Invalidates the refresh token in the database. Clears the `access_token` and `refresh_token` cookies.
        *   **Response (204 No Content):** (Empty Body)

    *   **`GET /api/auth/session`**
        *   **Action:** This is a protected route. It validates the `access_token` JWT. If expired, it will attempt to use the `refresh_token` to issue a new one.
        *   **Response (200 OK):** `{ "user": { "id": "...", "email": "...", "name": "...", "role": "USER" }, "authenticated": true }`
        *   **Response (401 Unauthorized):** `{ "user": null, "authenticated": false }` (if no valid session or refresh token).

    *   **`POST /api/auth/refresh`** (Internal/Optional)
        *   **Action:** Consumes a valid `refresh_token` from cookies to issue a new `access_token`.
        *   **Response (204 No Content):** Sets new `access_token` cookie.

### C. Security Requirements

The following must be implemented as part of the real authentication system.

*   **Must-Have Protections:**
    *   **Password Hashing:** Use `bcrypt` (already in `package.json`) with a sufficient salt round count (10-12).
    *   **Secure Cookies:** All session-related cookies **must** use the `HttpOnly`, `Secure` (in production), and `SameSite=Strict` flags to prevent XSS and CSRF attacks.
    *   **Logout Invalidation:** Logout must invalidate the refresh token on the server-side (in the database) to prevent token replay. Simply clearing cookies is insufficient.
    *   **CORS:** Configure a strict CORS allowlist in the NestJS API to only accept requests from the web app's domain. Do not use `*`.
    *   **Helmet:** Use the `helmet` library (already in `package.json`) to set various security-related HTTP headers.
    *   **Input Validation:** Use `class-validator` and `class-transformer` (already in `package.json`) on all request bodies (`DTOs`) to prevent injection and data-type attacks.

*   **Recommended Protections:**
    *   **Rate Limiting:** Implement rate limiting on sensitive endpoints like `login` and `register` to mitigate brute-force attacks.
    *   **CSRF Protection:** While `SameSite=Strict` cookies are the primary defense, NestJS's built-in CSRF protection can be added as a secondary defense-in-depth measure.
    *   **Error Leakage:** Ensure that 500-level server errors do not leak stack traces or sensitive infrastructure information in the response body. NestJS handles this well by default.

*   **Mistakes to Avoid:**
    *   Storing tokens in `localStorage`.
    *   Sending tokens in URL query parameters.
    *   Returning sensitive information (e.g., password hashes) in any API response.
    *   Implementing a "remember me" feature without a full understanding of the security implications of long-lived sessions.

### D. Health/Ready Contract

*   **`GET /api/healthz`**
    *   **Purpose:** To confirm the API process is running and can respond to HTTP requests.
    *   **Checks:** It should **not** check dependencies like the database.
    *   **Response (200 OK):** `{ "status": "ok", "timestamp": "2026-03-09T12:00:00.000Z" }`

*   **`GET /api/readyz`**
    *   **Purpose:** To confirm the API is fully operational and ready to accept traffic, including all critical dependencies.
    *   **Checks:**
        1.  **Database Connectivity:** It **must** perform a simple, fast query (e.g., `SELECT 1` or using `prisma.$queryRaw` `SELECT 1`) to verify a live connection to the database.
        2.  **Other Critical Services:** If the API relies on any other essential services to function (e.g., a Redis cache, an external API), it should check for their availability.
    *   **Response (200 OK):** `{ "status": "ready", "dependencies": { "database": "ok" } }`
    *   **Response (503 Service Unavailable):** `{ "status": "unavailable", "dependencies": { "database": "error: connection failed" } }`

### E. BotLog Recommendation

The `schema.prisma` file confirms there is no `BotLog` model, while runtime code expects one. This is a critical bug.

*   **Recommendation: Add Model Now.**
    *   **Rationale:** The existence of bot-related scripts (`bot:monitor`, `bot:triage`) and data files (`data/bots/*`) implies bots are a core part of the system's architecture for monitoring, recovery, and health. Operating without a log is a major observability blind spot that increases risk. Launching without this is unsafe.
    *   **Action:** A `BotLog` model should be added to `schema.prisma`. It should be designed for high-volume writes and be simple to query.

*   **Proposed `BotLog` Schema:**
    ```prisma
    model BotLog {
      id        String    @id @default(cuid())
      timestamp DateTime  @default(now())
      botName   String    // e.g., "system-health-bot", "rollback-bot"
      level     String    // "INFO", "WARN", "ERROR"
      message   String
      details   Json?     // For structured metadata like target IDs, error codes
    
      @@index([timestamp])
      @@index([botName])
    }
    ```

### F. Route/Proxy Architecture Recommendation

A clear separation between the web and backend concerns is essential for security and scalability.

*   **Web Layer (Next.js):**
    *   Should primarily be responsible for UI rendering and user session management via `next-auth`.
    *   It should **not** contain business logic.
    *   Local routes should be for pages (`/dashboard`, `/profile`) and the `next-auth` handler (`/api/auth/[...nextauth]`).

*   **Backend API (NestJS):**
    *   Should contain all business logic, database interaction, and serve as the single source of truth.

*   **Proxy Strategy:**
    *   The Next.js web application should be configured to proxy all requests from `/api/*` (except its own `/api/auth/[...nextauth]` route) directly to the NestJS backend API (`http://localhost:4000/api/*`). This can be done in `next.config.js`.
    *   The temporary web-based `/api/auth/session` and `/api/readyz` fallbacks **must be removed** once the backend is providing the real implementation. The web app's `readyz` should be a simple health check, not a proxy for the backend's readiness.

### G. Remaining Launch Blockers

The following items are critical blockers preventing a safe production launch for member upload and onboarding flows.

1.  **Missing Real Authentication:** The single most critical blocker. No user can securely register, log in, or maintain a session.
2.  **Missing Database Migrations:** The `BotLog` model needs to be added and a new migration generated and deployed.
3.  **Incomplete Onboarding Persistence:** The Prisma schema has models for `User`, `Artist`, `Subscription`, etc., but the API endpoints to create and manage these during an onboarding flow do not exist yet.
4.  **Missing Admin Role Bootstrapping:** There is no defined process for creating the first `ADMIN` user. This needs a seeding script or a special, one-time registration process.
5.  **Environment Hardening:** Secrets management (e.g., `DATABASE_URL`, `JWT_SECRET`, Stripe keys) is not production-ready. These must not be stored in plaintext `.env` files in a production environment.
6.  **Missing Critical Smoke Tests:** While some health checks exist, comprehensive smoke tests for the full authentication and onboarding loop are missing.

### H. Recommended Execution Order After This Audit

To ensure a stable and secure path to closing Phase 11, work should proceed in this strict order:

*   **Blackbox (Backend Focus):**
    1.  **Source Code Reconciliation:** Immediately find all temporary fixes made in `dist/` directories and migrate them to the TypeScript source in `src/`.
    2.  **Add `BotLog` Schema:** Add the `BotLog` model to `schema.prisma`, generate a new migration (`prisma migrate dev`), and apply it.
    3.  **Implement Backend `readyz`:** Create the real `/api/readyz` endpoint in the NestJS API with a database connectivity check.
    4.  **Implement Backend Auth:** Build the `register`, `login`, `logout`, and `session` endpoints in the NestJS API according to the contract in section **B**, including all security measures from section **C**.
    5.  **Implement Seeding:** Create a Prisma seed script to bootstrap necessary data, such as the first ADMIN user.

*   **Copilot (Frontend & Integration Focus):**
    1.  **Configure Proxy:** Set up the `next.config.js` in the `web` app to proxy `/api/*` requests to the backend.
    2.  **Integrate `next-auth`:** Configure `next-auth` to use the `Credentials` provider, calling the new backend login/session endpoints. The `@next-auth/prisma-adapter` is for database sessions, which can be deferred if using JWTs as the primary method.
    3.  **Remove Fallbacks:** Delete the temporary `/api/auth/session` and `/api/readyz` handlers from the `web` app's source code.
    4.  **Build Onboarding UI:** Create the frontend pages and components for registration and onboarding that consume the (now-proxied) backend API endpoints.
    5.  **Write Smoke Tests:** Add end-to-end Playwright tests that cover the full user journey: registration -> login -> session validation -> logout.

Following this sequence will ensure that the frontend is built on a solid, secure, and persistent backend foundation, correctly closing out Phase 11 and preparing the application for production readiness.
