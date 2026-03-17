Here is the completed Step 2 Security Pass report.

### A. Phase 11 Security-Pass Verdict

**FAIL.** The current implementation contains critical security vulnerabilities and is not production-grade. The backend is functional but must not be integrated with the frontend or considered for production deployment in its current state. The most severe issue is the use of unsalted `sha256` for password hashing, which is equivalent to storing passwords in a trivially reversible format.

**Blockers:**
*   Critically insecure password storage.
*   Non-persistent, in-memory session and user storage.
*   Insecure default cookie configuration.
*   Incorrect auth API contract for duplicate registration.

### B. Auth Contract Verdict

The API contract is mostly functional but has a significant flaw in the registration flow.

*   **`POST /api/auth/register`:** **FAIL.** Returns a `201 Created` status code even when the user already exists. It should return a `409 Conflict`. The current response body of `{ ok: false, error: "..." }` on a 201 status code is non-standard and will lead to incorrect client-side handling.
*   **`POST /api/auth/login`:** **PASS.** Correctly returns a `200 OK` on success and `401 Unauthorized` on failure.
*   **`POST /api/auth/logout`:** **PASS.** The contract is acceptable.
*   **`GET /api/auth/session`:** **PASS.** The contract correctly returns session data or an unauthenticated payload/401 error.

### C. Security Findings

This area contains multiple critical failures.

1.  **Password Hashing:** **CRITICAL FAILURE.** The implementation uses unsalted `sha256`. This is not a secure password hashing mechanism. It is vulnerable to rainbow table attacks and is computationally inexpensive, making brute-force attacks trivial.
2.  **Error Leakage:** **PASS.** No significant information leakage was found in the error paths. Error messages like "Invalid credentials" do not leak whether a user account exists, which is good practice.
3.  **Source Ownership:** **PASS.** The logic is present in `apps/api/src` and is not dependent on patches to the `dist` directory.

### D. Cookie/Session Findings

1.  **Session Storage:** **CRITICAL FAILURE.** The session and user stores are in-memory `Map` objects. All user and session data will be lost upon application restart, making the system unsuitable for any real-world use.
2.  **Cookie Security:** **FAIL.** The session cookie is set with `secure: false`, meaning it will be sent over unencrypted HTTP connections. In a production environment behind a TLS-terminating load balancer, this flag must be `true`.
3.  **Logout Invalidation:** **PASS.** The logout logic correctly deletes the session from the in-memory store. However, this will need to be adapted once a persistent session store is implemented.

### E. Readyz/Health Findings

*   **`GET /api/healthz`:** **PASS.** This endpoint correctly reports the process status.
*   **`GET /api/readyz`:** **FAIL.** This endpoint is a duplicate of `healthz` and performs no dependency checks (e.g., database connection). It does not provide a meaningful signal of the application's readiness to serve traffic, defeating its purpose in a container orchestration environment.

### F. Launch Blockers

The following are absolute blockers for closing Phase 11 and proceeding to a production-ready state:
1.  **Insecure Password Storage:** Must be replaced with a modern, salted hashing algorithm (Argon2 or bcrypt).
2.  **In-Memory Data Stores:** User and session data must be moved to a persistent database (PostgreSQL, via Prisma).
3.  **Insecure Cookie Configuration:** The `secure` flag must be set conditionally for production environments.
4.  **Meaningless Readiness Probe:** The `readyz` endpoint must be implemented to check database connectivity.
5.  **Incorrect Registration Contract:** The `register` endpoint must return the correct HTTP status code (`409`).

### G. Required Code Changes

The following changes must be made in `apps/api/src`:

1.  **In `auth.service.ts`:**
    *   Remove the in-memory `users` and `sessions` maps.
    *   Inject the `PrismaService` and use `prisma.user` and `prisma.session` (or a similar model) for all data access.
    *   Replace `createHash("sha256")` with a library like `argon2`. The `register` method should hash passwords with `argon2.hash()`. The `login` method should use `argon2.verify()`.
    *   Modify the `register` method to throw a `ConflictException` when a user already exists.
2.  **In `auth.controller.ts`:**
    *   The `register` method should be decorated with `@HttpCode(201)`. The thrown `ConflictException` from the service will automatically result in a `409` response.
    *   The `res.cookie` call in the `login` method should have its `secure` flag set based on the environment (e.g., `secure: process.env.NODE_ENV === 'production'`).
3.  **In `health.controller.ts`:**
    *   The `readyz` method must be updated to check for database connectivity, likely by calling a new method in a `PrismaService`.
4.  **In `main.ts`:**
    *   Add `app.use(helmet())`.
    *   Add `app.enableCors()` with a restrictive configuration (e.g., allowing only the web app's origin).
5.  **In `prisma/schema.prisma`:**
    *   Ensure `User` and `Session`/`RefreshToken` models exist to support persistent storage.

### H. What Copilot Must Fix Next

Copilot's primary task is to apply the fixes identified in this report. The work is exclusively in the backend `apps/api/src` directory.

1.  **Implement Argon2:** Replace the `sha256` logic with `argon2` for password hashing and verification.
2.  **Implement Persistent Storage:** Remove all in-memory maps and integrate `PrismaService` for all user and session operations.
3.  **Fix Registration Contract:** Change the `register` flow to throw a `ConflictException` for duplicate users, resulting in a `409` status code.
4.  **Harden Cookie:** Make the `secure` cookie flag environment-aware.
5.  **Implement `readyz`:** Add a database connectivity check to the `/api/readyz` endpoint.
6.  **Add Middleware:** Enable `helmet()` and `cors()` in `main.ts`.

### I. Whether Web Fallback Auth Can Now Be Removed

**No.** The backend authentication system is critically insecure. The web fallback must remain in place until all the required fixes in this report have been implemented and verified. Removing it now would expose users to an insecure login mechanism.

### J. Final Go / No-Go for Phase 11 Closure

**NO-GO.** Phase 11 cannot be closed. The backend API fails the security pass due to fundamental flaws in password and session management. Proceeding to frontend integration (Copilot wiring) would be irresponsible and build upon a dangerously insecure foundation.
