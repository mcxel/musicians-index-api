# SLICE_0_EXECUTION_CHECKLIST.md
## The First Wiring Pass — Fix Build and Prove It Green

---

## WHAT THIS IS
Slice 0 is not creative work. It is purely fix-and-prove.
Nothing from Slices 1–10 starts until every item below is checked.

---

## STEP 1 — DIAGNOSE THE CLOUDFLARE ERROR

```bash
# Copilot: Run this locally first to reproduce what Cloudflare sees
cd tmi-platform
pnpm install --frozen-lockfile
pnpm -C apps/web run build

# Capture the output — look for the first error line
# Expected current failure: Module not found: @tmi/hud-runtime
```

---

## STEP 2 — FIX WORKSPACE PACKAGE RESOLUTION

Apply ALL THREE fixes simultaneously:

### Fix A — Add prebuild to apps/web/package.json
```json
{
  "scripts": {
    "prebuild": "pnpm --filter @tmi/hud-core run build && pnpm --filter @tmi/hud-runtime run build && pnpm --filter @tmi/hud-theme run build && pnpm --filter @tmi/hud-tmi run build && pnpm --filter @tmi/contracts run build",
    "build": "next build"
  }
}
```

### Fix B — Add transpilePackages to apps/web/next.config.js
```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    '@tmi/hud-core',
    '@tmi/hud-runtime',
    '@tmi/hud-theme',
    '@tmi/hud-tmi',
    '@tmi/contracts',
    '@tmi/core-domain'
  ]
};
module.exports = nextConfig;
```

### Fix C (Emergency only — if A+B still fail)
Stub the /hud page temporarily:
```tsx
// apps/web/src/app/hud/page.tsx
export default function HudPage() {
  return <div>HUD deploying soon.</div>;
}
```

---

## STEP 3 — VERIFY LOCAL PACKAGE BUILDS

```powershell
# Run from tmi-platform directory in PowerShell
pnpm -C packages/hud-core run build
pnpm -C packages/hud-runtime run build
pnpm -C packages/hud-theme run build
pnpm -C packages/hud-tmi run build

# Verify dist files exist:
Test-Path .\packages\hud-core\dist\index.js
Test-Path .\packages\hud-runtime\dist\index.js
Test-Path .\packages\hud-theme\dist\index.js
Test-Path .\packages\hud-tmi\dist\index.js
# All should return: True
```

---

## STEP 4 — VERIFY LOCAL WEB BUILD

```bash
cd tmi-platform
pnpm -C apps/web run build

# Look for:
# ✓ Compiled successfully
# ✓ No webpack errors
# ✓ Route manifests generated
```

---

## STEP 5 — COMMIT AND PUSH

```bash
git add apps/web/package.json apps/web/next.config.js
git add packages/hud-core packages/hud-runtime packages/hud-theme packages/hud-tmi
git commit -m "fix: resolve workspace package build order for @tmi/hud-runtime"
git push origin main
```

---

## STEP 6 — VERIFY GITHUB CI

```
GitHub Actions → Run → Check status
Expected: ✅ GREEN
Current known green: commit 3a81795 (before this fix)
After push: New commit must also be ✅ GREEN
```

---

## STEP 7 — VERIFY CLOUDFLARE DEPLOY

```
Cloudflare Pages → musicians-index-web → Latest Deploy
Expected: ✅ Success

Cloudflare Pages → musicians-index-api → Latest Deploy
Expected: ✅ Success
```

---

## STEP 8 — SMOKE TEST LIVE URL

```
Test these URLs on the live deployment:

✅ GET / → 200 (homepage loads, not 404)
✅ GET /register → 200 (registration form)
✅ GET /login → 200 (login form)
✅ GET /api/health → 200 (API running)

Fail state → check root directory in Vercel settings:
  Framework: Next.js
  Root Directory: tmi-platform/apps/web
  Install Command: pnpm install --frozen-lockfile
  Build Command: pnpm run build
  Node Version: 20.x
```

---

## STEP 9 — CONFIRM ENV VARS IN CLOUDFLARE

```
Cloudflare → Settings → Environment Variables:
✅ DATABASE_URL  
✅ NEXTAUTH_SECRET
✅ NEXTAUTH_URL (must match production domain exactly)
✅ GITHUB_CLIENT_ID + SECRET
✅ NEXT_PUBLIC_APP_URL
✅ NEXT_PUBLIC_API_URL
✅ NODE_ENV=production
```

---

## SLICE 0 PROOF (Save to /proof/slice-0/)

Before calling Slice 0 done:
- [ ] Screenshot: Local build success (no errors)
- [ ] Screenshot: GitHub CI green
- [ ] Screenshot: Cloudflare musicians-index-web → Success
- [ ] Screenshot: Cloudflare musicians-index-api → Success
- [ ] Screenshot: Live URL / → loads homepage (not 404)
- [ ] Screenshot: Live URL /register → loads
- [ ] Screenshot: Live URL /login → loads
- [ ] Log: dist/index.js exists for all HUD packages

**Slice 0 is done when all 8 screenshots are saved.**
Only then does Slice 1 begin.

---

*Slice 0 Execution Checklist v1.0 — BerntoutGlobal XXL*

---
---
---

# DEFINITION_OF_DONE_MASTER.md
## A Feature Is Only Done When All of These Are True

---

## THE DEFINITION (12 Requirements)

A page, component, service, or feature is DONE when:

1. ✅ **Builds** — TypeScript compiles, no errors
2. ✅ **Route works** — URL returns correct page, not 404/500
3. ✅ **Auth works** — Protected routes require auth; public routes don't
4. ✅ **Data loads** — Real data from API, not placeholder text
5. ✅ **Fallback works** — Empty state, loading skeleton, error state all render
6. ✅ **Logging works** — Events log to the correct channel
7. ✅ **Proof gate passed** — Specific checklist from Pack 12 passed
8. ✅ **Mobile works** — Renders correctly on 375px viewport
9. ✅ **Editable by Copilot later** — Follows editability rules (Pack 12 Law 1–8)
10. ✅ **Design matches** — Matches PDF visual language (Pack 10 drift audit)
11. ✅ **Role-gated correctly** — Marcel/Jay Paul cannot execute; fans cannot access artist tools
12. ✅ **Recovery state** — If it breaks, something renders (never blank)

---

## SHORTENED VERSION FOR DAILY USE

```
Ask for each PR / each new component:
  □ Builds?
  □ Route works?
  □ Auth correct?
  □ Real data?
  □ Fallback exists?
  □ Logged?
  □ Mobile OK?
  □ Matches design?

If all 8: ✅ Done.
If any fail: 🔴 Not done.
```

---

# DEPENDENCY_RISK_MAP.md
## Safe Dependencies vs Risky Ones

---

## SAFE — USE FREELY

| Dependency | Why Safe |
|---|---|
| `next` | Core framework, already in repo |
| `react` + `react-dom` | Core, already in repo |
| `typescript` | Core, already in repo |
| `prisma` | Already in repo, battle-tested |
| `nextauth` | Already in repo |
| `@stripe/stripe-js` | Industry standard |
| `framer-motion` | Specified in architecture, safe animation |
| `react-draggable` | Specified for canvas cards |
| `tailwindcss` | Already in repo |
| `pnpm` (workspace) | Already configured |
| `zod` | Schema validation, standard |

---

## USE WITH CAUTION — EVALUATE BEFORE ADDING

| Dependency | Risk | Mitigation |
|---|---|---|
| `three` (Three.js) | Heavy, affects mobile performance | Feature-flag behind `ENABLE_AUDIENCE_3D` |
| `@react-three/fiber` | Complex setup, GPU dependency | Phase 3+ only |
| `tensorflow/tfjs` | Very heavy (~5MB+) | Lazy load, face-scan phase only |
| `mediapipe` | Large bundle, camera permission UX | Opt-in only, Phase 3 |
| `socket.io` / WebSocket libs | Real-time complexity | Already in platform-kernel spec |
| `bull` (job queue) | Redis dependency | After Redis confirmed |
| ElevenLabs SDK | Paid API, rate limits | Broadcaster only, graceful fallback |

---

## AVOID UNLESS EXPLICITLY NEEDED

| Dependency | Why to Avoid |
|---|---|
| `moment.js` | 300KB bundle, use `date-fns` instead |
| `lodash` (full) | Large, use specific `lodash/[method]` or native |
| Any analytics SDK beyond GA | Data ownership concerns |
| Any state library beyond Zustand | Already configured in repo |
| `jquery` | Not needed in Next.js |
| Firebase / Supabase | Not in platform design (uses Prisma/Postgres) |
| Any unvetted UI library | Risk of style drift from design system |

---

## ROLLBACK SUBSTITUTES

| If This Breaks | Use This Instead |
|---|---|
| ElevenLabs TTS | Pre-recorded broadcaster audio files |
| Three.js audience | Flat avatar image grid |
| Face-scan (MediaPipe) | Manual avatar builder (sliders) |
| Redis (live sync) | Polling fallback (every 5s) |
| Stripe billing | Manual payment processing |
| Live streaming service | Pre-recorded video placeholder |
| Cloudflare R2 storage | Local file system (dev) |

---

*Slice 0 Checklist + Definition of Done + Dependency Risk v1.0*
*BerntoutGlobal XXL / The Musician's Index*
