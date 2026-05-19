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

## Remaining
- [ ] Marcel: set DAILY_API_KEY in Vercel dashboard (from dashboard.daily.co)
- [ ] Marcel: set Cloudflare SSL to "Full (Strict)" to prevent redirect loops
- [ ] Lorenzo McCoy real email (replace lorenzomccoy@themusiciansindex.com placeholder)
- [ ] Magazine Issue 1 — wire contentRegistry + 5 articles live
- [ ] Beat Locker — performer upload pipeline
