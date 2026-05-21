# PACK30_IMPORT_COMMANDS.md
## Exact Shell Commands — Copy-Paste for Each Import Step
### BerntoutGlobal XXL / The Musician's Index

These are the exact commands Copilot should run at each step.
No interpretation needed — copy, paste, run, check exit code.

---

## BEFORE ANYTHING

```bash
# From repo root — verify starting state
cd tmi-platform
git status               # must be clean or stashed
git tag pre-pack28-29-import  # bookmark this point

# Verify build is currently green
pnpm -C apps/web build && echo "BUILD GREEN ✅" || echo "BUILD BROKEN ❌ — fix before starting"
```

---

## MOVE DOCS INTO REPO

```bash
# Pack 26 — closure + owner finance
cp -r ~/Downloads/tmi-pack26-final-closure/closure/. docs/system/
cp -r ~/Downloads/tmi-pack26-final-closure/finance/. docs/system/finance/
mkdir -p docs/copilot
cp ~/Downloads/tmi-pack26-final-closure/copilot/. docs/copilot/
cp ~/Downloads/tmi-pack26-final-closure/README.md docs/pack26-README.md

# Pack 27 — ops safeguards
cp ~/Downloads/tmi-pack27-ops/*.md docs/system/

# Pack 28 — design system + expansion specs
mkdir -p docs/pack28/design-system docs/pack28/systems docs/pack28/routes
cp ~/Downloads/tmi-pack28-design-and-systems/design-system/. docs/pack28/design-system/
cp ~/Downloads/tmi-pack28-design-and-systems/systems/. docs/pack28/systems/
cp ~/Downloads/tmi-pack28-design-and-systems/routes/. docs/pack28/routes/
cp ~/Downloads/tmi-pack28-design-and-systems/copilot/. docs/copilot/

# Pack 29 — implementation companion
cp ~/Downloads/tmi-pack29-implementation/*.md docs/system/
cp ~/Downloads/tmi-pack29-implementation/README.md docs/pack29-README.md

# Pack 30 — this pack
cp ~/Downloads/tmi-pack30/*.md docs/system/

git add docs/
git commit -m "docs: import pack26-30 system documentation"
echo "Docs committed ✅"
```

---

## SLICE 0 — PRISMA MIGRATION

```bash
# 1. Append new models (Copilot does this manually by reading PACK29_PRISMA_DATA_MODEL_MAP.md)
# After models are appended:

# 2. Validate schema before migrating
npx prisma validate
echo "Schema valid: $?"  # must be 0

# 3. Run migration
npx prisma migrate dev --name pack29_all_new_models
echo "Migration status: $?"  # must be 0

# 4. Generate client
npx prisma generate
echo "Generate status: $?"  # must be 0

# 5. Run seed
pnpm seed
echo "Seed status: $?"  # must be 0

# 6. Quick verify
npx prisma db pull --print 2>/dev/null | grep "^model " | wc -l
echo "Total models in DB (check against baseline + 21 new)"

# 7. Commit
git add packages/db/
git commit -m "feat(db): add pack29 prisma models - advertiser, party, games, editorial, stream-win"
echo "Slice 0 committed ✅"
```

---

## SLICE 1 — DESIGN SYSTEM COMPONENTS

```bash
# After Copilot creates all components in apps/web/src/components/tmi-design/:

# Typecheck
pnpm -C apps/web typecheck
echo "Typecheck: $?"  # must be 0

# Verify all component files exist
ls apps/web/src/components/tmi-design/
# Expected: 11 .tsx files + any .ts config

git add apps/web/src/components/tmi-design/
git commit -m "feat(ui): add TMI design system components - Logo, BeltHeader, LiveBadge, etc."
echo "Slice 1 committed ✅"
```

---

## SLICE 2 — AD RENDERER

```bash
# After Copilot creates monetization module + AdRenderer component:

# Test the key endpoint
curl -s http://localhost:4000/api/ads/slot/HOME_ADV_TILE_1 | python3 -m json.tool
# Expected: { "type": "house", "creative": {...}, "disclosure": null }

# Verify it never returns empty
for slot in HOME_ADV_TILE_1 HOME_ADV_TILE_2 HOME_EDITORIAL_SPONSOR_STRIP ART_INLINE_1 GAME_LOBBY; do
  status=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:4000/api/ads/slot/$slot)
  echo "$slot: HTTP $status"  # all must be 200
done

pnpm -C apps/api typecheck && pnpm -C apps/web typecheck
git add apps/api/src/modules/monetization/ apps/web/src/components/monetization/
git commit -m "feat(ads): add ad renderer, house ad fallback, slot registry service"
echo "Slice 2 committed ✅"
```

---

## SLICE 3 — HOMEPAGE BELT SYSTEM

```bash
# After Copilot wires HomeSectionRenderer and all belt components:

# Start dev server and verify
curl -s http://localhost:4000/api/home/composition | python3 -m json.tool | head -30
# Expected: { "belts": [ { "id": "BELT_COVER", ... }, ... ] }

# Run discovery test (CRITICAL — must pass before continuing)
pnpm test:discovery
echo "Discovery test: $?"  # MUST be 0 — blocks everything if not

pnpm -C apps/web build
echo "Web build: $?"  # must be 0

git add apps/web/src/app/\(main\)/page.tsx apps/web/src/components/home/ apps/api/src/modules/home-composition/
git commit -m "feat(homepage): wire 8-belt homepage composition system"
echo "Slice 3 committed ✅"
```

---

## SLICE 4 — EDITORIAL

```bash
curl -s http://localhost:4000/api/editorial | python3 -m json.tool | grep '"title"'
# Expected: titles of seeded articles visible

pnpm -C apps/api typecheck && pnpm -C apps/web typecheck
git add apps/api/src/modules/editorial/ apps/web/src/app/editorial/
git commit -m "feat(editorial): add article system with ad slot integration"
echo "Slice 4 committed ✅"
```

---

## SLICE 5 — PARTY LOBBY

```bash
# Create test party
curl -s -X POST http://localhost:4000/api/party   -H "Authorization: Bearer $TEST_JWT"   -H "Content-Type: application/json"   -d '{"name":"Test Party","isPublic":true}' | python3 -m json.tool
# Expected: { "party": { "id": "...", "inviteCode": "..." } }

pnpm -C apps/api typecheck && pnpm -C apps/web typecheck
git add apps/api/src/modules/party-lobby/ apps/web/src/app/party/ apps/web/src/components/party-lobby/
git commit -m "feat(party): add persistent party lobby system with WebSocket gateway"
echo "Slice 5 committed ✅"
```

---

## SLICE 6 — GAME ENGINE

```bash
curl -s -X POST http://localhost:4000/api/games/sessions   -H "Authorization: Bearer $TEST_JWT"   -H "Content-Type: application/json"   -d '{"gameType":"trivia","maxPlayers":8}' | python3 -m json.tool
# Expected: { "session": { "id": "...", "status": "LOBBY" } }

pnpm -C apps/api typecheck && pnpm -C apps/web typecheck
git add apps/api/src/modules/games/ apps/web/src/app/games/ apps/web/src/components/games/
git commit -m "feat(games): add game session engine with WebSocket gateway and ad integration"
echo "Slice 6 committed ✅"
```

---

## SLICE 7 — ADVERTISER SELF-SERVE

```bash
curl -s -X POST http://localhost:4000/api/advertiser/register   -H "Authorization: Bearer $TEST_JWT"   -H "Content-Type: application/json"   -d '{"companyName":"Test Brand","contactEmail":"test@example.com","category":"music_gear"}' | python3 -m json.tool
# Expected: { "advertiser": { "id": "..." }, "message": "Welcome to TMI Advertising" }

pnpm -C apps/api typecheck && pnpm -C apps/web typecheck
git add apps/api/src/modules/advertiser/ apps/api/src/modules/sales-crm/         apps/web/src/app/advertise/ apps/web/src/app/dashboard/advertiser/         apps/web/src/app/admin/campaigns/ apps/web/src/app/admin/advertisers/
git commit -m "feat(advertiser): add self-serve campaign flow, CRM, creative approval"
echo "Slice 7 committed ✅"
```

---

## SLICE 8 — STREAM & WIN + SCENES

```bash
curl -s -X POST http://localhost:4000/api/stream-win/event   -H "Authorization: Bearer $TEST_JWT"   -H "Content-Type: application/json"   -d '{"eventType":"daily_login"}' | python3 -m json.tool
# Expected: { "pointsEarned": 5, "newScore": 55, "newStreak": 2 }

pnpm -C apps/api typecheck && pnpm -C apps/web typecheck
git add apps/api/src/modules/stream-win/ apps/web/src/components/scenes/ apps/web/src/components/stream-win/
git commit -m "feat(stream-win,scenes): add Stream & Win scoring and 8 room scene backgrounds"
echo "Slice 8 committed ✅"
```

---

## SLICE 9 — FINAL BUILD + PROOF

```bash
# Full clean build
pnpm install --frozen-lockfile
pnpm -C packages/db run build
pnpm -C apps/api typecheck
pnpm -C apps/api run build
pnpm -C apps/web typecheck
pnpm -C apps/web run build

echo "=== CRITICAL PROOF ==="
pnpm test:discovery   # MUST pass
pnpm test:smoke       # MUST pass

# Final tag
git add -A
git commit -m "feat: pack28-29 complete — design system, homepage, ads, party, games, editorial, advertiser"
git tag pack29-complete
echo "Pack 29 wiring complete ✅"
echo "Tag: pack29-complete"
```
