# PACK30_SLICE_BY_SLICE_ROLLBACK.md
## If a Slice Breaks — Exact Rollback Commands
### BerntoutGlobal XXL / The Musician's Index

Every slice has its own rollback. Only roll back what broke.
Never roll back previous green slices.

---

## RULE: ROLLBACK SMALLEST UNIT POSSIBLE

```
If Slice 3 fails → roll back Slice 3 files only
Do not touch Slice 0/1/2 which are already green
Re-run Slice 3 proof after fix
Only proceed to Slice 4 when Slice 3 is green
```

---

## ROLLBACK: SLICE 0 — PRISMA MODELS

```bash
# If migration fails or schema is invalid:

# Option A: Revert migration (if it partially ran)
npx prisma migrate reset --skip-seed --force
# WARNING: This drops all data. Only use in dev environment.
# Then re-run: npx prisma migrate dev --name pack29_all_new_models

# Option B: Roll back only the appended models
# (Manually remove the appended model blocks from packages/db/prisma/schema.prisma)
# Then validate: npx prisma validate
# Then re-attempt migration

# Option C: If seed fails (migration was fine, seed broke)
# Fix seed.ts and re-run: pnpm seed
# Migration stays in place.

git checkout packages/db/prisma/schema.prisma  # reverts schema to last commit
git checkout packages/db/prisma/seed.ts
```

---

## ROLLBACK: SLICE 1 — DESIGN SYSTEM COMPONENTS

```bash
# Typecheck failing on new components?
git checkout apps/web/src/components/tmi-design/
# Or roll back specific file:
git checkout apps/web/src/components/tmi-design/TMICountdownTimer.tsx

# Verify previous slices still pass:
npx prisma validate  # Slice 0 still green
```

---

## ROLLBACK: SLICE 2 — AD RENDERER

```bash
# If ad renderer breaks existing features:
git checkout apps/api/src/modules/monetization/
git checkout apps/api/src/app.module.ts  # undo module registration
git checkout apps/web/src/components/monetization/

# Re-run: pnpm -C apps/api typecheck
# Verify Slices 0-1 still green
```

---

## ROLLBACK: SLICE 3 — HOMEPAGE BELT SYSTEM

```bash
# If homepage breaks or test:discovery fails:
git checkout apps/web/src/app/\(main\)/page.tsx  # restore previous homepage
git checkout apps/web/src/components/home/
git checkout apps/api/src/modules/home-composition/
git checkout apps/api/src/app.module.ts  # undo module registration

# CRITICAL: Verify test:discovery still passes after rollback
pnpm test:discovery
# If it now passes → Slice 3 had a bug, fix and retry
# If it still fails → problem was pre-existing, check baseline

# Note: DO NOT roll back the belt components if only the page.tsx is broken.
# Roll back the smallest unit that caused the failure.
```

---

## ROLLBACK: SLICE 4 — EDITORIAL

```bash
git checkout apps/api/src/modules/editorial/
git checkout apps/web/src/app/editorial/
git checkout apps/api/src/app.module.ts
```

---

## ROLLBACK: SLICE 5 — PARTY LOBBY

```bash
git checkout apps/api/src/modules/party-lobby/
git checkout apps/web/src/app/party/
git checkout apps/web/src/components/party-lobby/
git checkout apps/api/src/app.module.ts

# Prisma Party models stay — they don't break anything if no code references them.
# If you need to remove them from schema:
# Remove model Party, PartyMember, PartyMessage blocks from schema.prisma
# Then: npx prisma migrate dev --name remove_party_models
```

---

## ROLLBACK: SLICE 6 — GAME ENGINE

```bash
git checkout apps/api/src/modules/games/
git checkout apps/web/src/app/games/
git checkout apps/web/src/components/games/
git checkout apps/api/src/app.module.ts

# Same note as Party: Prisma models stay unless you need them removed.
```

---

## ROLLBACK: SLICE 7 — ADVERTISER SELF-SERVE

```bash
git checkout apps/api/src/modules/advertiser/
git checkout apps/api/src/modules/sales-crm/
git checkout apps/api/src/modules/monetization/campaign.service.ts
git checkout apps/api/src/modules/monetization/billing.service.ts
git checkout apps/web/src/app/advertise/
git checkout apps/web/src/app/dashboard/advertiser/
git checkout apps/web/src/app/admin/campaigns/
git checkout apps/api/src/app.module.ts
```

---

## ROLLBACK: SLICE 8 — STREAM & WIN + SCENES

```bash
git checkout apps/api/src/modules/stream-win/
git checkout apps/web/src/components/scenes/
git checkout apps/web/src/components/stream-win/
git checkout apps/api/src/app.module.ts
```

---

## FULL RESET (NUCLEAR OPTION — LAST RESORT)

Only use if multiple slices are tangled and individual rollback isn't working.

```bash
# Go back to pre-import tag
git stash  # save any unsaved work first
git checkout pre-pack28-29-import

# Verify everything is back to green
pnpm -C apps/api typecheck
pnpm -C apps/web build
pnpm test:discovery

# Now restart from Slice 0 more carefully
```

---

## WHAT NOT TO ROLL BACK

```
NEVER roll back:               WHY:
packages/db/prisma/schema.prisma existing models    Breaking existing features
apps/web/src/app/(main)/layout.tsx                  Breaks provider chain
apps/web/src/features/rooms/RoomInfrastructureProvider.tsx
apps/web/src/features/live/SharedStageProvider.tsx  Breaks live engine
apps/web/src/features/live/StageQueueProvider.tsx
docs/ folder                                        No code impact
```

---

## AFTER ANY ROLLBACK — VERIFY PLATFORM STILL WORKS

```bash
# These must always be true after any rollback:
curl http://localhost:4000/health                    # 200 ok
pnpm test:discovery                                 # MUST pass
pnpm -C apps/web build                              # exit 0
pnpm -C apps/api typecheck                          # exit 0

# If any of these fail after rollback:
# The problem pre-dates Pack 28/29. Check git log for recent breaking change.
```
