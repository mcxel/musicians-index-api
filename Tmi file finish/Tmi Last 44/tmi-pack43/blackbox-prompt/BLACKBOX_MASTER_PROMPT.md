# BLACKBOX MASTER PROMPT — PASTE THIS TO START IMPLEMENTATION
## The Musician's Index (TMI) — BerntoutGlobal LLC

---

## READ FIRST — CRITICAL

You are implementing The Musician's Index platform. The architecture is 100% complete across Packs 25-43 (298 files). Your job is to fill in business logic, NOT redesign architecture.

**Golden Rules (never break these):**
1. One module at a time. Build → test → commit → next.
2. One import line per wave in app.module.ts
3. Never touch: middleware.ts, auth/*, ci.yml, health/*
4. Prisma schema: APPEND ONLY — never remove models
5. GET /api/ads/slot/:zoneId MUST always return HTTP 200 (Platform Law #7)
6. Room list MUST sort ORDER BY viewer_count ASC NULLS FIRST (Platform Law #1)
7. All payouts REQUIRE Big Ace approval — never auto-release (Platform Law #5)
8. canSendMessage() MUST run before every chat emit (Platform Law #3)
9. Marcel Dickens (berntmusic33@gmail.com) + BJ M Beat's = permanent Diamond (Law #2)
10. pnpm test:discovery MUST PASS before any deploy

---

## STARTING POINT

```bash
# 1. Start infrastructure
docker-compose up -d

# 2. Install dependencies
pnpm install

# 3. Migrate database (Pack 37 schema — all 55+ models)
cd packages/db
pnpm prisma migrate dev --name pack37_full_schema
pnpm prisma generate
pnpm prisma db seed

# 4. Start API
cd ../..
pnpm --filter api start:dev

# 5. Verify
curl http://localhost:4000/api/healthz  # must return ok:true
curl http://localhost:4000/api/readyz   # must return ok:true
curl http://localhost:4000/api/ads/slot/HOME1_HERO  # must return HTTP 200

# 6. Start web
pnpm --filter web dev

# 7. Open http://localhost:3001 — homepage must render
```

---

## IMPLEMENTATION ORDER (Waves)

**Wave 1 — Database** ✓ (commands above)

**Wave 2 — Backend modules** (implement in this exact order):
```
feature-flags → auth → users → profiles → artists → wallet → points
→ notifications → media → articles → ads → rooms → livestream → chat
→ events → tickets → store → economy → games → scoring → venues
→ bots → admin → analytics → device-pairing
```

Each module needs: controller.ts + service.ts + module.ts + repository.ts + dto/ + spec.ts
Register ONE module per commit in app.module.ts.

**Wave 3 — WebSocket gateways**: rooms → games → chat → notifications → crown → hype → ads

**Wave 4 — Frontend routes**: wire pages to real API data (start with homepage → lobby wall)

**Wave 5 — Real-time**: viewer counts updating live, game scores syncing

**Wave 6 — Payments**: Stripe test mode tickets → store → subscriptions

**Wave 7 — Media pipeline**: upload → FFmpeg transcode → CDN delivery

**Wave 8 — Bots**: start house-ad-fallback → billing-integrity → health-monitor → rest

**Wave 9 — Deploy**: Render (API) + Vercel (web) + Cloudflare R2 + Mux

**Wave 10 — VR**: Three.js + WebXR → lobby scene → stadium last

---

## ARCHITECTURE REFERENCES

| Need | Read This Pack |
|---|---|
| Database schema (55+ models) | Pack 37 |
| Core engines (realtime, broadcast, scoring, etc.) | Pack 38 |
| VR engine + Stadium (10,000 avatars) | Pack 39 |
| Integration map + 5 event flows | Pack 40 |
| Complete repo tree + 25 module scaffolds | Pack 41 |
| All 12 system chains (138 steps) | Pack 41 |
| All 15 platform laws + enforcement | Pack 41 |
| Docker + .env + 55 bots + 24 cron jobs | Pack 42 |
| CI/CD + seed script + PWA + page shells | Pack 43 |

---

## KEY PLATFORM LAWS IN CODE

```typescript
// Law #1 — DISCOVERY-FIRST (rooms.repository.ts)
async getLobbyRooms() {
  return this.prisma.room.findMany({
    where: { isActive: true },
    orderBy: { viewerCount: "asc" },  // 0 viewers = position 1 ALWAYS
  });
}

// Law #7 — ADS ALWAYS 200 (ads.service.ts)
async getSlot(zone: PlacementZone): Promise<AdCreative> {
  return (
    await this.getPaidCampaignForZone(zone) ||   // Level 1
    await this.getAnyActiveCampaign() ||          // Level 2
    await this.getCrownWinnerCard() ||            // Level 3
    await this.getUndiscoveredArtistCard() ||     // Level 4
    this.getTMIBrandCard()                        // Level 5 — never null
  );
}

// Law #3 — KID SAFETY (chat.gateway.ts)
async handleMessage(@MessageBody() dto, @ConnectedSocket() socket) {
  const canSend = await this.chatService.canSendMessage(dto.senderId, dto.conversationId);
  if (!canSend) { socket.emit("error", { code: "CANNOT_SEND_MESSAGE" }); return; }
  // proceed with message
}

// Law #5 — BIG ACE GATE (wallet.service.ts)
async requestPayout(userId: string, amountCents: number) {
  // NEVER auto-process. Always create pending record.
  return this.prisma.transaction.create({
    data: { userId, type: "PAYOUT", amountCents, requiresBigAce: true, approvedByBigAce: false }
  });
}

// Law #2 — PERMANENT DIAMOND (billing-integrity.bot.ts — runs every 4h)
const PERMANENT_DIAMOND_EMAILS = ["berntmusic33@gmail.com"]; // + BJ M Beat's email
for (const email of PERMANENT_DIAMOND_EMAILS) {
  await prisma.user.updateMany({
    where: { email },
    data: { tier: "DIAMOND", isPermanentDiamond: true }
  });
}
```

---

## SUCCESS PROOF PER WAVE

```
Wave 1: pnpm prisma migrate status → all applied
Wave 2: curl /api/healthz → ok:true + curl /api/ads/slot/HOME1_HERO → 200
Wave 3: wscat -c ws://localhost:4000/rooms → connects
Wave 4: Homepage loads + lobby sorted viewers_asc
Wave 5: pnpm test:discovery → PASS ← CRITICAL GATE
Wave 6: Stripe test purchase completes + ticket created
Wave 7: Upload image → CDN URL returned
Wave 8: /admin/bots shows all bots ACTIVE
Wave 9: themusiciansindex.com loads + /api/healthz → ok
Wave 10: /stadium renders + VREntryPoint shows correct button
```
