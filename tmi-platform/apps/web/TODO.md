# TMI Execution TODO (Approved Plan)

## Phase 1 — Canon Scan & Alignment (IN PROGRESS)
- [x] Scan `apps/web/src/lib/editorial/NewsArticleModel.ts`
- [x] Scan `Homapge and battle challange and cyphers/tmi_complete_all_four_dashboards_v2.html`
- [x] Scan `Homapge and battle challange and cyphers/AudienceScene.jsx`
- [x] Scan `Homapge and battle challange and cyphers/BillboardLiveWall.tsx`
- [x] Scan `Homapge and battle challange and cyphers/articles-performer-slug-page.tsx`
- [x] Scan `Homapge and battle challange and cyphers/tmi_3d_theater_audience_scene.html`
- [x] Scan `Homapge and battle challange and cyphers/VENUE_SYSTEM_README.md`
- [x] Scan `Homapge and battle challange and cyphers/tmiTokens.js`
- [x] Scan `Homapge and battle challange and cyphers/TMI_TheaterAudience_3D.html`
- [x] Scan `Homapge and battle challange and cyphers/tmi_orbital_toggleable_panels.html`
- [x] Scan `Homapge and battle challange and cyphers/TMI_MagazinePageSystem_CopilotDirective.md`
- [x] Scan `Homapge and battle challange and cyphers/tmi_arena_triangle_battles_cyphers_challenges.html`
- [x] Scan `Homapge and battle challange and cyphers/tmi_3d_page_turn_engine.html`
- [x] Scan `Homapge and battle challange and cyphers/tmi_3d_character_system.html`
- [x] Scan `Homapge and battle challange and cyphers/preview_converted_all.html`
- [x] Scan `Homapge and battle challange and cyphers/MaskedVideoTile.tsx`
- [x] Scan `Homapge and battle challange and cyphers/Home1CoverPage.tsx`

## Phase 2 — Active Code Mapping (NEXT)
- [ ] Align active `apps/web/src/components/home/Home1CoverPage.tsx` with canon
- [ ] Align active Billboard live wall + masked tile chain with canon behavior
- [ ] Add/align performer article route at `apps/web/src/app/articles/performer/[slug]/page.tsx`
- [ ] Confirm editorial model integration for article/ticker flows
- [ ] Token consistency pass from `tmiTokens.js` into active components

## Phase 3 — Build Blocker Resolution (NEXT)
- [ ] Fix `/404` + `/500` prerender React #130 blocker
- [ ] Re-run `pnpm -C apps/web typecheck`
- [ ] Re-run `pnpm -C apps/web build` until clean

## Phase 4 — Home Route Stabilization
- [ ] Verify `/home/1`
- [ ] Verify `/home/1-2`
- [ ] Verify `/home/2`
- [ ] Verify `/home/3`
- [ ] Verify `/home/4`
- [ ] Verify `/home/5`

## Phase 5 — Full Completion Matrix (Phased)
- [ ] Accounts/Auth/roles/session hardening
- [ ] Profile completion lanes (fan/performer/artist/venue/sponsor/advertiser/promoter)
- [ ] WebRTC + media capture + upload + live wall + go-live continuity
- [ ] Stripe/ticketing/subscriptions/revenue telemetry
- [ ] Email delivery + queue + retry + protection
- [ ] Admin/overseer dashboards + stats + monitors + alerts
- [ ] Magazine/news/slugs/monthly rotation
- [ ] 3D audience/venue + performance/LOD + visual polish
- [ ] Bots/governors/sentinels/automation lanes
- [ ] Security/data protection + privacy gating
