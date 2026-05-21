# TMI Platform — Soft Launch TODO

## Security Contract Layer
- [x] `apps/web/src/types/security.ts` — AccountTier, FamilyMember, FamilyGroup, ConsensusVote, ConsensusRequest
- [x] `apps/web/src/hooks/useFamilyConsensus.ts` — createRequest, approve, decline, reset, allowConnection gate
- [x] WebRTC signaling gated behind allowConnection (useWebRtcSignaling)
- [x] SecurityShieldMask — state-aware DOM overlay
- [x] LiveStageVideoOverlay — Daily.co allowConnection gate
- [x] Admin overseer panel wired

## Social Backbone
- [x] DiamondInviteEngine — Kreach, KG, Savage Guns, Jason Smith tokens
- [x] seed-testers.ts — Diamond-tier Prisma seed
- [x] messages/page.tsx — VIP cohort pinned in inbox
- [x] messages/[threadId]/page.tsx — VIP contacts + seed messages + auto-replies
- [x] messages/new/page.tsx — VIP cohort in suggested list
- [x] friends/page.tsx — state-driven Accept/Decline/Follow, Video buttons wired

## Video
- [x] DailyVideoEngine.ts — createRoom, createMeetingToken wrappers
- [x] /api/video/rooms route — POST creates Daily.co room
- [x] /video/rooms/new/page.tsx — create & invite flow
- [x] /video/rooms/[roomId]/page.tsx — video room shell
- [x] Friends page Video buttons → /video/rooms/new?inviteId=
- [x] Messages thread "Start Video" → /video/rooms/new

## Bands
- [x] /bands/page.tsx — seeded band list
- [x] /bands/signup/page.tsx — working form
- [x] /api/bands route — POST creates band (with upstream proxy fallback)

## Controlled Strike Pass (Launch-Critical)
- [x] Route audit and hardening for critical paths:
  - [x] `/auth` — session-driven, role → hub redirect
  - [x] `/home/2` — responsive overflow fixed
  - [x] `/home/5` — Vote Now wired, dead links resolved
  - [x] `/artist` → `/hub/artist` redirect
  - [x] `/live/rooms/R-101` — resolves via `/live/rooms/[id]`
  - [x] `/battles/today` — WhatsHappeningTodayEngine wired
  - [x] `/cypher/stage` — SmartCameraDirectorDemo
  - [x] `/challenges` — active challenges + category filter
- [x] Replace launch-visible placeholders:
  - [x] `apps/web/src/components/ads/AdRenderer.tsx` — tier-labeled sponsor slots
  - [x] homepage/dashboard placeholder surfaces — all hub nav links verified live
- [x] Entity link safety pass — all role hubs verified: fan, artist, performer, sponsor, advertiser, venue
- [x] Typecheck + smoke tests — EXIT 0, 951/951 pages built

## Remaining
- [x] `/api/auth/register` — standalone fallback added (no more 503 when API_BASE_URL is unset)
- [ ] Marcel: set DAILY_API_KEY in Vercel dashboard (from dashboard.daily.co)
- [ ] Marcel: set Cloudflare SSL to "Full (Strict)" to prevent redirect loops
- [ ] Marcel: deploy apps/api → set API_BASE_URL in Vercel (enables persistent DB accounts)
- [ ] Lorenzo McCoy real email (replace lorenzomccoy@themusiciansindex.com placeholder)
- [x] Magazine Issue 1 — 10 articles live in magazineIssueData.ts, article pages wired via generateStaticParams
- [x] Beat Marketplace — beats/page.tsx + beats/submit/page.tsx + beats/[slug]/page.tsx all wired
- [x] All user-facing stubs resolved (74 → 0), zero href="#", zero TypeScript errors

## Phase 2 — Post-Launch (DO NOT MERGE BEFORE SOFT LAUNCH CONFIRMED)
- [x] TMIPerformanceIntelligenceEngine — 7 files built, EXIT 0
  - lib/performance/roles.ts — 12 roles, all tag definitions
  - lib/performance/PerformanceScoreEngine.ts — vote storage, composite stats
  - lib/performance/CreatorEvolutionStatsEngine.ts — trend tracking over time
  - lib/performance/WinnerDeclarationEngine.ts — composite contest winner logic
  - lib/performance/FanJudgeReputationEngine.ts — ROOKIE/TRUSTED/ELITE/LEGEND tiers
  - lib/performance/TMIPerformanceIntelligenceEngine.ts — unified re-export barrel
  - components/performance/PerformanceVotePanel.tsx — 5-step vote UI (like → originality → score → tags → return intent)
- [ ] Wire PerformanceVotePanel into: battles, cyphers, challenges, beat auctions, live rooms
- [ ] Add /vote/[performanceId] standalone page
- [ ] Add /results/[performanceId] results page
- [ ] Add /leaderboard/performance and /leaderboard/originality
- [ ] Add /admin/performance-intelligence panel
- [ ] Wire CreatorEvolutionStats into artist/producer/dj/comedian/dancer dashboard stat rails
