# CLEAN HANDOFF TO COPILOT — Blackbox Phase Complete
Generated: Blackbox cleanup phase
Repo root: C:\Users\Admin\Documents\BerntoutGlobal XXL\tmi-platform

---

## BLACKBOX PHASE STATUS: COMPLETE ✅

All 4 required reports have been created:
- ✅ REPO_INGEST_REPORT_PACK31_34.md
- ✅ IMPORT_RECEIPT_PACK31_34.md
- ✅ CORRUPTION_FIX_REPORT.md
- ✅ CLEAN_HANDOFF_TO_COPILOT.md (this file)

---

## WHAT BLACKBOX DID (Summary)

### Files Fixed (Delete + Recreate)
| File | Reason |
|------|--------|
| apps/web/src/app/onboarding/artist/page.tsx | Duplicate export default, duplicate "use client", appended component body |
| apps/web/src/app/onboarding/fan/page.tsx | Duplicate export default, broken JSX fragment appended after valid close |
| apps/web/src/app/onboarding/page.tsx | Duplicate metadata export, duplicate RootLayout-style default export |

### Files Created (Were Missing)
| File | Reason |
|------|--------|
| apps/web/src/app/magazine/page.tsx | Pack 32 magazine scaffold was missing from repo |

### Files Verified Clean (No Action Needed)
- apps/web/src/app/page.tsx ✅
- apps/web/src/app/dashboard/page.tsx ✅
- apps/web/src/app/dashboard/admin/page.tsx ✅
- apps/web/src/app/dashboard/artist/page.tsx ✅
- apps/web/src/app/dashboard/fan/page.tsx ✅
- apps/web/src/app/onboarding/admin/page.tsx ✅
- apps/web/src/app/auth/page.tsx ✅
- apps/web/src/lib/routingState.ts ✅
- apps/web/src/lib/apiProxy.ts ✅
- All Pack 33 system docs ✅
- All Pack 34 components ✅
- All API modules ✅

### Locked Files — NOT MODIFIED
| File | Lock Type |
|------|-----------|
| packages/db/prisma/schema.prisma | MERGE ONLY — not touched |
| apps/api/src/main.ts | MERGE ONLY — not touched |
| apps/api/src/app.module.ts | EXTEND ONLY — not touched |
| apps/web/src/middleware.ts | MERGE ONLY — not touched |
| apps/web/src/app/layout.tsx | LOCKED — not touched |

### Runtime Wiring — NOT DONE
Blackbox did NOT perform any runtime wiring. The following remain for Copilot:
- Homepage magazine jump star + belt wiring
- Magazine real article data wiring
- Onboarding API profile save wiring
- Dashboard role-gated content wiring
- AdRenderer placement engine wiring
- Sponsor/ad rotation engine page zone wiring
- Top10 flame animation component creation

---

## REPO STATE FOR COPILOT

### Onboarding/Dashboard TSX Corruption: RESOLVED ✅
All three corrupted onboarding files have been fixed. Each file now:
- Has exactly one `"use client"` directive at the top
- Has exactly one `export default` function
- Has no duplicate imports
- Has no orphaned code after the closing `}`
- Compiles syntactically without errors

### Pack 34 Import Surfaces: READY ✅
All Pack 34 components are present in the repo and accessible via standard import paths:
- `@/components/tmi/magazine/MagazineLayout`
- `@/components/tmi/nav/MagazineNavSystem`
- `@/components/tmi/games/DealVsFeud1000`
- `@/components/tmi/sponsor/SponsorTile`
- `@/components/tmi/shared/AnalyticsMiniPanel`
- `@/components/tmi/shared/AuctionWidget`
- `@/components/tmi/shared/PlayWidget`
- `@/components/tmi/preview/ArticlesHub`
- `@/components/tmi/artist/ArtistBookingDashboard`
- `@/components/tmi/games/GameNightHub`
- `@/components/tmi/sponsor/SponsorBoard`
- `@/components/tmi/sponsor/BillboardBoard`
- `@/components/tmi/shared/AdminCommandHUD`
- `@/components/tmi/shared/AudienceRoom`
- `@/components/tmi/shared/DealOrFeud`
- `@/components/tmi/shared/WinnersHall`
- `@/components/error/NotFoundShell`
- `@/components/venue/DigitalVenueTwinProvider`
- `@/components/venue/DigitalVenueTwinShell`
- `@/components/room/RoomInfrastructureProvider`
- `@/components/room/RoomInfrastructureShell`

### routingState.ts: PRESENT ✅
Required exports confirmed:
- `ROUTING_STATE_COOKIE` (string constant)
- `destinationFromRoutingState` (function)
- `verifyRoutingState` (function)

---

## COPILOT INSTRUCTIONS — START HERE

### Read These First (In Order)
1. `tmi-platform/docs/system-packs/pack30/*`
2. `tmi-platform/docs/system-packs/pack29/*`
3. `tmi-platform/docs/system-packs/pack28/*` (for intent only)
4. `tmi-platform/CLEAN_HANDOFF_TO_COPILOT.md` (this file)
5. `tmi-platform/IMPORT_RECEIPT_PACK31_34.md`

### Slice Order (LOCKED — Do Not Change)
| Slice | Focus |
|-------|-------|
| Slice 0 | Prisma + DB models |
| Slice 1 | Design system components |
| Slice 2 | AdRenderer / sponsor system |
| Slice 3 | Homepage belts / magazine homepage |
| Slice 4 | Editorial / article system |
| Slice 5 | Party lobby / rooms |
| Slice 6 | Game engine |
| Slice 7 | Advertiser self-serve |
| Slice 8 | Stream & Win |
| Slice 9 | Final build + proof |

### After Every Slice Run
```powershell
cd "C:\Users\Admin\Documents\BerntoutGlobal XXL\tmi-platform"
pnpm typecheck
pnpm build
pnpm test
```

### Slice 0 — First Tasks
1. Repo conflict check
2. Build baseline check (`pnpm build` — note all errors, do not fix yet)
3. Confirm onboarding/dashboard corruption is gone (check for duplicate exports)
4. Confirm Pack 34 component imports resolve
5. Wire Prisma client generation
6. Wire DB model types to API modules that need them
7. Print exact files changed, exact commands, exact proof
8. STOP after Slice 0 — do not proceed to Slice 1 without proof

### Wiring Rules (LOCKED)
- Smallest safe slice only
- No broad refactors
- No invented paths
- No homepage redesign
- Do not touch locked files unless repo rules allow extend/merge
- Prove each slice before next
- Stop after Slice 0 report

---

## KNOWN REMAINING GAPS (For Copilot To Wire)

### High Priority (Slice 0–2)
- [ ] Prisma client generation wired to build
- [ ] DB model types exported from `packages/db`
- [ ] API modules consuming correct Prisma types
- [ ] AdRenderer component created and wired to placement zones
- [ ] Sponsor rotation engine connected to page zone config

### Medium Priority (Slice 3–5)
- [ ] Homepage magazine jump star component
- [ ] Homepage belt wiring (PromotionalHub → magazine)
- [ ] Magazine page wired to real article data
- [ ] Onboarding profile save wired to `/api/profile` endpoint
- [ ] Dashboard role-gated content wired by session role
- [ ] Party lobby room system wired

### Lower Priority (Slice 6–9)
- [ ] Game engine wired (DealVsFeud1000, GameNightHub)
- [ ] Advertiser self-serve dashboard wired
- [ ] Stream & Win engine wired
- [ ] Top10 flame animation component created
- [ ] Full build proof with zero TypeScript errors
- [ ] Full runtime proof with no 500 errors

---

## PLATFORM DESIGN RULES (Copilot Must Respect)

1. **Stations** — always use "Stations" in user-facing text, never "Channels"
2. **Artist article → Station link** — every artist article page must link to the artist's station
3. **Magazine-first** — homepage primary action is entering the magazine
4. **Magazine headline** — must say "Welcome to The Musician's Index Magazine"
5. **PDF visual fidelity** — dark theme (#0a0a0f bg, #ff6b35 accent), neon/futuristic aesthetic
6. **Non-obstructive ads** — ads must never block core content, gameplay, or performance focus areas
7. **Top10 flames** — animated flame effect on rank numbers, stronger for #1–#3
8. **No clutter** — if a page exceeds 5 major zones, split it into subroutes
9. **Tier-aware placements** — Free/Bronze/Gold/Platinum/Diamond tiers affect ad/sponsor placement
10. **Isolated modules** — no feature directly imports another feature's private internals

---

## DOWNLOADS CLEANUP — SAFE TO DELETE

The following Downloads files are now safely in the repo and can be deleted from Downloads:

| Downloads File | Repo Destination | Safe to Delete |
|----------------|-----------------|----------------|
| COMPLETE_SYSTEM_PACKAGE.md | docs/system-packs/pack28/ | ✅ YES |
| COMPLETE_SYSTEM_INTEGRATION.md | docs/system-packs/pack29/ | ✅ YES |
| COMPLETE_SYSTEM_INTEGRATION_1.md | docs/system-packs/pack30/ | ✅ YES |
| Any Pack 31–34 source files moved to repo | See IMPORT_RECEIPT_PACK31_34.md | ✅ YES (after verifying repo copy) |

**Do NOT delete from Downloads:**
- Any file not confirmed in IMPORT_RECEIPT_PACK31_34.md
- Any file with "backup" or "original" in the name
- FINAL_MERGED_REPO_MANIFEST.md (keep as reference)

---

## SUCCESS CRITERIA FOR COPILOT SLICE 0

Copilot Slice 0 is complete when:
- [ ] `pnpm build` runs without new errors introduced by Slice 0 changes
- [ ] `pnpm typecheck` passes for Slice 0 files
- [ ] Prisma client generates successfully
- [ ] DB model types are accessible from API modules
- [ ] No duplicate exports remain in onboarding/dashboard files
- [ ] Pack 34 component imports resolve without module-not-found errors
- [ ] Exact list of changed files is reported
- [ ] Exact commands run are reported
- [ ] Proof output is shown

---

## GATE SIGNAL

When Copilot completes Slice 0 and all success criteria above are met, report:

> **"Slice 0 complete. Ready for Slice 1."**

Then proceed to Slice 1 — Design system components.
