# PACK29_SAFE_WIRING_ORDER.md
## Exact Slice-by-Slice Wiring Order for Copilot
### BerntoutGlobal XXL / The Musician's Index

Rules: Complete each slice before starting the next.
Run proof gates after each slice. Never skip ahead.

---

## SLICE 0 — FOUNDATIONS (30 min, no new features)

```
Files:
  packages/db/prisma/schema.prisma   APPEND Group A (Monetization models)
  packages/db/prisma/schema.prisma   APPEND Group B (Party models)
  packages/db/prisma/schema.prisma   APPEND Group C (Game models)
  packages/db/prisma/schema.prisma   APPEND Group D (Editorial models)
  packages/db/prisma/schema.prisma   APPEND Group E (Stream & Win models)
  packages/db/prisma/seed.ts         EDIT  Add seed data from PACK29_SEED_CONTENT_AND_FIXTURES.md

Commands:
  npx prisma migrate dev --name pack29_all_new_models
  npx prisma generate
  pnpm seed

Proof:
  [ ] npx prisma studio opens — all new tables visible
  [ ] pnpm seed exits 0 — demo data visible in DB
  [ ] Existing features still work (auth, rooms, tips, wallet)

Do not touch:
  All existing API code
  All existing frontend code
  Any existing Prisma models
```

---

## SLICE 1 — TMI DESIGN SYSTEM COMPONENTS (1 hr)

```
Files (all NEW):
  apps/web/src/components/tmi-design/TMILogo.tsx
  apps/web/src/components/tmi-design/TMIBeltHeader.tsx
  apps/web/src/components/tmi-design/TMILiveBadge.tsx
  apps/web/src/components/tmi-design/TMIRankOverlay.tsx
  apps/web/src/components/tmi-design/TMICountdownTimer.tsx
  apps/web/src/components/tmi-design/TMIStarCTA.tsx
  apps/web/src/components/tmi-design/TMIGenreHoneycomb.tsx
  apps/web/src/components/tmi-design/TMIGlowCard.tsx
  apps/web/src/components/tmi-design/TMIGoldCard.tsx
  apps/web/src/components/tmi-design/TMICrownBadge.tsx
  apps/web/src/components/tmi-design/TMIAdDisclosure.tsx

Visual style reference: docs/pack28/design-system/TMI_UI_DESIGN_SYSTEM.md
Color palette: #0D0520 bg, #00E5FF cyan, #FFB800 gold, #FF2D78 pink
Fonts: Bebas Neue (display) + Oswald (headings) + Inter (body)

Proof:
  [ ] pnpm -C apps/web typecheck exits 0
  [ ] TMILiveBadge renders with red pulse animation in Storybook or test page
  [ ] TMICrownBadge renders with gold pulse animation
  [ ] TMICountdownTimer counts down correctly in real-time
  [ ] TMIBeltHeader shows gold Bebas Neue label + lightning bolt + divider line

Do not touch:
  Any existing components
  Root layout.tsx
```

---

## SLICE 2 — AD RENDERER + HOUSE ADS (2 hr)

```
Files:
  apps/api/src/modules/monetization/house-ad.service.ts       NEW
  apps/api/src/modules/monetization/ad-renderer.service.ts    NEW
  apps/api/src/modules/monetization/slot-registry.service.ts  NEW
  apps/api/src/modules/monetization/monetization.module.ts    NEW
  apps/api/src/app.module.ts                                  EDIT (add MonetizationModule)
  apps/web/src/components/monetization/AdRenderer.tsx         NEW
  apps/web/src/components/monetization/HouseAdFallback.tsx    NEW
  apps/web/src/components/monetization/AdDisclosureLabel.tsx  NEW

Key rule: GET /api/ads/slot/:slotId ALWAYS returns 200 — never empty or error

Proof:
  [ ] curl /api/ads/slot/HOME_ADV_TILE_1 → 200 { type: 'house', creative: {...} }
  [ ] <AdRenderer slotId="HOME_ADV_TILE_1" /> renders house ad (demo data)
  [ ] <AdRenderer slotId="HOME_ADV_TILE_1" /> renders paid ad when campaign active
  [ ] Ad disclosure label "Ad" visible
  [ ] No empty ad container ever renders

Do not touch:
  Existing tip/wallet/fan-club payment code
  Existing Stripe webhooks
```

---

## SLICE 3 — HOMEPAGE BELT SYSTEM (3 hr)

```
Files:
  apps/api/src/modules/home-composition/home-composition.service.ts  NEW
  apps/api/src/modules/home-composition/home-composition.controller.ts NEW
  apps/api/src/modules/home-composition/home-composition.module.ts    NEW
  apps/web/src/components/home/belts/BeltCover.tsx              NEW
  apps/web/src/components/home/belts/BeltLiveWorld.tsx          NEW
  apps/web/src/components/home/belts/BeltEditorial.tsx          NEW
  apps/web/src/components/home/belts/BeltDiscovery.tsx          NEW
  apps/web/src/components/home/belts/BeltMarketplace.tsx        NEW
  apps/web/src/components/home/belts/BeltTrends.tsx             NEW
  apps/web/src/components/home/belts/BeltAdvertiser.tsx         NEW
  apps/web/src/components/home/belts/BeltPartyTeaser.tsx        NEW
  apps/web/src/components/home/HomeSectionRenderer.tsx          NEW
  apps/web/src/app/(main)/page.tsx                              EDIT (render HomeSectionRenderer)

Proof:
  [ ] Homepage loads all 8 belts in correct order
  [ ] Deep purple background visible
  [ ] Gold belt header labels visible (Bebas Neue)
  [ ] Lobby wall shows artists sorted viewers_asc
  [ ] BeltAdvertiser renders AdRenderer for each slot
  [ ] pnpm test:discovery PASSES

Do not touch:
  Root layout.tsx (provider chain)
  Any existing dashboard or room pages
```

---

## SLICE 4 — EDITORIAL SYSTEM (2 hr)

```
Files:
  apps/api/src/modules/editorial/editorial.module.ts      NEW
  apps/api/src/modules/editorial/editorial.controller.ts  NEW
  apps/api/src/modules/editorial/editorial.service.ts     NEW
  apps/api/src/modules/editorial/article-ads.service.ts   NEW
  apps/web/src/app/editorial/page.tsx                     NEW
  apps/web/src/app/editorial/[slug]/page.tsx              NEW

Proof:
  [ ] GET /api/editorial returns seeded articles
  [ ] /editorial renders article grid
  [ ] Article page renders with ART_INLINE_1 slot after paragraph 2
  [ ] Seeded "Who Took the Crown?" article accessible at /editorial/who-took-the-crown
  [ ] News ticker on homepage (BeltEditorial) shows latest articles

Do not touch:
  Existing article shells from Pack 16
```

---

## SLICE 5 — PARTY LOBBY SYSTEM (3 hr)

```
Files:
  apps/api/src/modules/party-lobby/party-lobby.module.ts      NEW
  apps/api/src/modules/party-lobby/party-lobby.controller.ts  NEW
  apps/api/src/modules/party-lobby/party-lobby.service.ts     NEW
  apps/api/src/modules/party-lobby/party-lobby.gateway.ts     NEW
  apps/web/src/app/party/page.tsx                             NEW
  apps/web/src/app/party/create/page.tsx                      NEW
  apps/web/src/app/party/[partyId]/page.tsx                   NEW
  apps/web/src/components/party-lobby/ (7 components)        ALL NEW

Key rule: Party persists when members enter/exit rooms.
PartyLobbyMini must appear at top of room/game/show screens.

Proof: (all from PACK29_ACCEPTANCE_TEST_MATRIX.md party proofs)
  [ ] POST /api/party creates party with inviteCode
  [ ] Two users join same party via inviteCode
  [ ] Party WS: message sent → received by other member
  [ ] Party WS: member enters room → other member sees IN_ROOM status
  [ ] Party persists when member exits room
  [ ] PartyLobbyMini renders in room screen

Do not touch:
  Room gateway (extend carefully — add PartyLobbyMini integration point only)
```

---

## SLICE 6 — GAME ENGINE (3 hr)

```
Files:
  apps/api/src/modules/games/games.module.ts     NEW
  apps/api/src/modules/games/games.controller.ts NEW
  apps/api/src/modules/games/games.service.ts    NEW
  apps/api/src/modules/games/games.gateway.ts    NEW
  apps/web/src/app/games/page.tsx                NEW
  apps/web/src/app/games/[type]/page.tsx         NEW
  apps/web/src/app/games/[type]/[sessionId]/page.tsx NEW
  apps/web/src/components/games/ (6 components) ALL NEW

Proof: (game proofs from acceptance matrix)
  [ ] POST /api/games/sessions creates LOBBY session
  [ ] 3 users join → session.players.length === 3
  [ ] Game countdown fires 3-2-1
  [ ] Correct answer scores points
  [ ] Final round → game:ended with winner
  [ ] Intermission shows GAME_INTERMISSION ad slot

Do not touch:
  Battle/cypher room logic
  Existing competitive room code
```

---

## SLICE 7 — ADVERTISER SELF-SERVE (3 hr)

```
Files:
  apps/api/src/modules/advertiser/advertiser.module.ts    NEW
  apps/api/src/modules/advertiser/advertiser.controller.ts NEW
  apps/api/src/modules/advertiser/advertiser.service.ts   NEW
  apps/api/src/modules/advertiser/creative.service.ts     NEW
  apps/api/src/modules/monetization/campaign.service.ts   NEW
  apps/api/src/modules/monetization/campaign.controller.ts NEW
  apps/api/src/modules/monetization/billing.service.ts    NEW
  apps/web/src/app/advertise/page.tsx                     NEW
  apps/web/src/app/advertise/packages/page.tsx            NEW
  apps/web/src/app/dashboard/advertiser/page.tsx          NEW
  apps/web/src/app/dashboard/advertiser/campaigns/page.tsx NEW
  apps/web/src/app/admin/campaigns/page.tsx               NEW
  apps/web/src/app/admin/campaigns/approvals/page.tsx     NEW

Proof:
  [ ] /advertise renders pricing packages page
  [ ] POST /api/advertiser/register → Advertiser record created
  [ ] POST /api/advertiser/campaigns → Stripe checkout URL returned
  [ ] Stripe test payment → campaign status PENDING_REVIEW
  [ ] Admin approves → status APPROVED → ads start serving
  [ ] /admin/campaigns shows all campaigns with status
  [ ] /admin/campaigns/approvals shows pending creatives

Do not touch:
  Existing Stripe tip/fan-club webhook handlers
```

---

## SLICE 8 — STREAM & WIN + SCENE SYSTEM (2 hr)

```
Files:
  apps/api/src/modules/stream-win/stream-win.module.ts    NEW
  apps/api/src/modules/stream-win/stream-win.controller.ts NEW
  apps/api/src/modules/stream-win/stream-win.service.ts   NEW
  apps/web/src/components/scenes/ (all scene components)  ALL NEW
  apps/web/src/components/stream-win/ (3 components)     ALL NEW

Proof:
  [ ] POST /api/stream-win/event { daily_login } → points awarded
  [ ] Homepage Trends Belt shows score widget with real data
  [ ] Room scene backgrounds render for all 8 scene types
  [ ] Host can change scene → all participants receive room:scene_change event

Do not touch:
  Existing RoomSceneBackground.tsx (update to use new scene components)
```

---

## SLICE 9 — FINAL BUILD + PROOF GATE

```
Commands:
  pnpm install --frozen-lockfile
  pnpm -C packages/db run build
  pnpm -C apps/api typecheck
  pnpm -C apps/api run build
  pnpm -C apps/web typecheck
  pnpm -C apps/web run build         # must exit 0

  pnpm test:discovery                # CRITICAL — blocks deploy if fails
  pnpm test:smoke                    # full suite

Manual proofs (in browser):
  [ ] Visit / — all 8 belts render, deep purple bg, gold headers
  [ ] Visit /artists/berntmusic33 — Diamond badge shows
  [ ] Visit /editorial — 5 seeded articles visible
  [ ] Open game lobby — join trivia — complete 3 rounds
  [ ] Create party — invite link — second user joins — send message
  [ ] Visit /advertise/packages — pricing visible
  [ ] Visit /admin/campaigns — campaign list loads

Commit + tag:
  git add -A
  git commit -m "feat: pack28-29 wired — design system, homepage belts, ads, party, games, editorial"
  git tag pack29-complete
```

---

## WHAT TO DO IF A SLICE BREAKS

```
1. STOP immediately — do not start next slice
2. Roll back that slice's files only (git checkout -- file1 file2)
3. Fix the specific error (typecheck output shows exact file + line)
4. Re-run proof for that slice
5. Only proceed when proof passes
6. Do not merge broken slice with next slice work
```
