# TMI Operator Onboarding (Current-State)

This runbook is for the **current soft-launch state** of the platform.

---

## 1) First-day objective

Validate that a new user can:

1. Reach auth
2. Enter hub/home flows
3. Access core live surfaces
4. Navigate without dead ends
5. Trigger support/invite/admin workflows where applicable

---

## 2) Role and identity clarification

### User Account vs Artist Profile

These are separate concepts:

- **User account**: authentication/session identity.
- **Artist profile**: performer-facing brand/profile data tied to a user.

If a flow binds artist name directly to selected user name and blocks typing, that is a UI/data-binding bug (not expected product behavior).

---

## 3) Local startup for operators

From repo root:

```bash
pnpm install
pnpm -C apps/web run dev
```

Open:

- `http://localhost:3000`

Optional API helper references:
- review `apps/api/README.md`

---

## 4) Critical-path checks (recommended first)

## A. Auth and hub

- Go to `/auth`
- Register/sign in
- Confirm transition to `/hub` (or expected role hub)

## B. Home flow continuity

Validate pages load and navigation remains continuous:

- `/home/1`
- `/home/2`
- `/home/3`
- `/home/4`
- `/home/5`

Check for:
- dead links
- blank sections
- obvious route loops/misroutes

## C. Live/video surfaces

- Open live stage / room surfaces in current build
- Confirm media permission prompt appears where expected
- Confirm camera/mic UI states render correctly

## D. Admin/overseer

- Validate admin access behavior for current session role
- Check expected widgets/panels render without crash

---

## 5) API checks (current priority endpoints)

If testing API directly, validate:

- `POST /api/auth/register`
- `POST /api/invites/send`

Include:
- happy path
- required field validation failures
- permission/session-related failures where applicable

---

## 6) What “pass” looks like for soft launch

- Auth usable in current standalone/default mode
- Main navigation reachable without 404/dead-end drift
- Home flow usable end-to-end
- Live surfaces render and request media access correctly
- High-priority APIs return sane success/error responses

---

## 7) Known stabilization focus (current)

Track these if still open in your branch/environment:

1. Artist creation payload integrity (ensure required user linkage is sent)
2. Editable artist naming behavior (no locked input from dropdown binding)
3. Homepage routing correctness (avoid misrouted crown/loop behavior)

---

## 8) Escalation rule

If a blocker breaks core movement (auth, navigation, live entry), treat as launch-blocking and patch before broader rollout.
