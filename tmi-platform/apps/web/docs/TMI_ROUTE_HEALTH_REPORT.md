# TMI ROUTE HEALTH REPORT
> Generated: April 23, 2026

---

## VERIFIED PASSING ROUTES

| Route | Method | Proof | Date |
|---|---|---|---|
| /home/1 | GET | Page loads, artist orbit renders | April 23, 2026 |
| /home/1 → /artists/kai-drift | Click | Playwright: home1ArtistFrameClickOk: true | April 23, 2026 |
| /home/5 | GET | Page loads, leaderboard renders | April 23, 2026 |
| /admin | GET | Unified Overseer system loads (BackButton + 6 live cards + feed fields) | April 23, 2026 |
| /admin/leaderboards | GET + Click | Playwright: leaderboardItemClickOk: true | April 23, 2026 |
| /admin/style-debug | GET | Page loads | April 23, 2026 |
| /artists/kai-drift | GET | Route resolves, data loads | April 23, 2026 |
| /artists/sora-wave | GET | Route resolves (tab open) | April 23, 2026 |
| check-route-integrity.mjs | Script | 0 unresolved refs, 373 known routes | April 23, 2026 |
| check-home1-artifact-routes.mjs | Script | PASS | April 23, 2026 |

---

## ROUTES THAT NEED VERIFICATION

| Route | Expected Status | Known Issue |
|---|---|---|
| /admin | ✅ | Phase 1.5 resolved: unified system shell mounted |
| /home/2 | ⚠️ | ArtifactSystem may not render |
| /home/3 | ⚠️ | ArtifactSystem may not render |
| /home/4 | ⚠️ | ArtifactSystem may not render |
| /home/1-2 | ⚠️ | Open magazine state incomplete |
| /artists/:slug | ⚠️ | Resolves but text-only UI |
| /signup | ⚠️ | Generic form only |
| /season-pass | 🔲 | Stub |
| /shows/monday-night-stage | 🆕 | Route doesn't exist yet |
| /shows/battle-of-the-bands | 🆕 | Route doesn't exist yet |
| /shows/yearly-contest | 🆕 | Route doesn't exist yet |
| /venues/brick-house | 🆕 | Route doesn't exist yet |

---

## PORT CONSISTENCY
- Dev server: localhost:3000 ONLY
- Port 3000 pinned in package.json `dev` script
- Port 3001 tabs still open in browser — must close or ignore
- All Playwright tests must target port 3000

---

## KNOWN NON-BLOCKING ISSUES
- WebSocket ws://localhost:8080 — feed socket not running — UI works without it, fallback to static feed state
- globals.css side-effect import warning in layout.tsx — pre-existing, non-blocking
- Repo-wide TypeScript errors outside Phase 1.5 scope remain pre-existing

---

## PHASE 1.5 PROOF SNAPSHOT (April 23, 2026)

| Check | Result |
|---|---|
| /admin loads on localhost:3000 | PASS |
| BackButton visible in viewport at load | PASS |
| LIVE SYSTEM GRID cards (>=6) | PASS (6) |
| Live cards clickable | PASS |
| Feed fields phase/genre/featuredId/timestamp | PASS |
| Feed disconnected fallback text/state | PASS |
| Live stats update every 2-5s | PASS |
| /admin/leaderboards load + back link | PASS |
| /home/1 artist click chain | PASS |
| /home/5 artist click chain | PASS |
| Route integrity | PASS (0 unresolved) |
| pnpm build with dev server OFF | PASS |

---

## ROUTE INTEGRITY SCRIPT RESULTS
```
check-route-integrity.mjs: PASS
  Unresolved refs: 0
  Known routes: 373
  Files scanned: 996
```

---

## NEXT AUDIT TRIGGER
Run full audit after each Phase completion:
```powershell
cd "C:\Users\Admin\Documents\BerntoutGlobal XXL\tmi-platform\apps\web"
node scripts/check-route-integrity.mjs
node scripts/check-home1-artifact-routes.mjs
pnpm build
```
