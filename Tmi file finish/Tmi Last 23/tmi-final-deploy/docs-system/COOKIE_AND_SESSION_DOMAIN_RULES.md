# COOKIE_AND_SESSION_DOMAIN_RULES.md
## How Sessions and Cookies Work Across themusiciansindex.com
### BerntoutGlobal XXL / The Musician's Index

---

## SESSION ARCHITECTURE

NextAuth handles sessions on the web app.
NestJS API verifies JWTs separately.

```
User logs in via NextAuth (/api/auth/signin)
       ↓
NextAuth creates encrypted session cookie
       ↓
Session cookie: domain=.themusiciansindex.com, httpOnly, secure, sameSite=lax
       ↓
Every page request: NextAuth validates cookie server-side
       ↓
API calls: NextAuth session used to get JWT for API
```

---

## COOKIE SETTINGS TABLE

| Setting | Value | Why |
|---|---|---|
| `domain` | `.themusiciansindex.com` | Shared across web + api subdomains |
| `secure` | `true` | HTTPS only (production) |
| `httpOnly` | `true` | Prevents XSS token theft |
| `sameSite` | `lax` | Allows redirect flows, prevents CSRF |
| `maxAge` | 7 days | Balance security with UX |

---

## LOCAL DEV COOKIE RULES

For local development:
```env
# .env.local
NEXTAUTH_URL=http://localhost:3000
# Cookies work on localhost without domain= setting
# Do NOT set domain= in local dev — it breaks localhost
```

---

## SESSION IN LIVE ROOMS

When user enters a live room, the room gateway needs their session.
Authentication flow:
1. Web app calls `/api/auth/session` → gets JWT
2. Sends JWT to WebSocket gateway on connect
3. NestJS validates JWT
4. User is authenticated in room for duration of connection

Session refresh: If JWT expires during room session (>1hr session), re-authenticate silently.
