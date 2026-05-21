# PACK29_API_CONTRACTS.md
## Exact API Contracts — All New Pack 28+29 Endpoints
### BerntoutGlobal XXL / The Musician's Index

Format: METHOD path (AUTH_ROLE)
BODY: exact fields | RESPONSE: exact shape | ERRORS: code → message

---

## HOME COMPOSITION

```
GET /api/home/composition           (PUBLIC)
→ 200 {
    belts: [
      { id: 'BELT_COVER', order: 0, data: CoverBeltData },
      { id: 'BELT_LIVE_WORLD', order: 1, data: LiveWorldData },
      { id: 'BELT_EDITORIAL', order: 2, data: EditorialData },
      { id: 'BELT_DISCOVERY', order: 3, data: DiscoveryData },
      { id: 'BELT_MARKETPLACE', order: 4, data: MarketplaceData },
      { id: 'BELT_TRENDS', order: 5, data: TrendsData },
      { id: 'BELT_ADVERTISER', order: 6, data: AdvertiserBeltData },
      { id: 'BELT_PARTY_TEASER', order: 7, data: PartyTeaserData },
    ],
    coverWeek: { weekId: string; crownArtistId: string; artistGrid: ArtistSlot[] }
  }
Cache: Redis, TTL 15 minutes. Invalidated on feature flag change.

GET /api/home/cover                 (PUBLIC)
→ 200 { artistGrid: ArtistSlot[9]; crownArtistId: string; weekLabel: string }
Cache: Redis, TTL until Sunday midnight.
```

---

## AD SLOT RENDERING

```
GET /api/ads/slot/:slotId           (PUBLIC — rate limited 60/min per IP)
QUERY: { surface: string; userId?: string; geo?: string; genre?: string }
→ 200 {
    type: 'paid' | 'sponsor' | 'house' | 'empty',
    creative?: {
      headline: string; bodyText: string; ctaLabel: string; ctaUrl: string;
      imageUrl?: string; videoUrl?: string; brandName: string;
      campaignId: string; reservationId: string;
    },
    disclosure: 'Ad' | 'Sponsored' | 'Presented by' | null
  }
→ The response is ALWAYS 200 — never throws. Empty inventory returns type:'house'.

POST /api/ads/impression            (PUBLIC — fire and forget)
BODY: { slotId: string; campaignId: string; surface: string; sessionId?: string }
→ 202 { recorded: true }

POST /api/ads/click                 (PUBLIC — fire and forget)
BODY: { slotId: string; campaignId: string; ctaUrl: string }
→ 202 { recorded: true; redirect: string }
```

---

## ADVERTISER ENDPOINTS

```
POST /api/advertiser/register       (AUTH — any authenticated user)
BODY: { companyName; contactEmail; contactName?; website?; category; monthlyBudget? }
→ 201 { advertiser: AdvertiserProfile; message: 'Welcome to TMI Advertising' }
→ 409 { error: 'advertiser_exists' }  — if user already has advertiser account

GET /api/advertiser/me              (AUTH, ADVERTISER)
→ 200 { advertiser: AdvertiserProfile; campaigns: CampaignSummary[]; balance: number }

POST /api/advertiser/campaigns      (AUTH, ADVERTISER)
BODY: {
  name: string;
  packageTier: 'starter'|'basic'|'standard'|'premium'|'takeover';
  surfaces: string[];
  startDate: string;  // ISO date
  endDate: string;
  targetingJson?: { genre?: string; geo?: string; ageGroup?: string }
}
→ 201 { campaign: Campaign; checkoutUrl: string }  — Stripe checkout for payment
→ 400 { error: 'invalid_dates' | 'invalid_surfaces' | 'budget_too_low' }

GET /api/advertiser/campaigns/:id   (AUTH, ADVERTISER — own campaigns only)
→ 200 { campaign: Campaign; reservations: Reservation[]; analytics: Analytics }

POST /api/advertiser/campaigns/:id/creative  (AUTH, ADVERTISER)
BODY: FormData { file: File; headline: string; bodyText: string; ctaLabel: string; ctaUrl: string; brandName: string }
→ 201 { creative: Creative; status: 'pending_review' }
→ 400 { error: 'invalid_creative_dimensions' | 'file_too_large' | 'unsupported_format' }

DELETE /api/advertiser/campaigns/:id  (AUTH, ADVERTISER)
→ 200 { status: 'cancelled'; refundCents?: number }
→ 400 { error: 'campaign_already_active' }  — cannot cancel running campaign
```

---

## ADMIN CAMPAIGN MANAGEMENT

```
GET /api/admin/campaigns            (AUTH, ADMIN)
QUERY: { status?: string; advertiserId?: string; page?: number }
→ 200 { campaigns: Campaign[]; total: number }

POST /api/admin/campaigns/:id/approve  (AUTH, ADMIN)
→ 200 { status: 'approved' }

POST /api/admin/campaigns/:id/reject   (AUTH, ADMIN)
BODY: { reason: string }
→ 200 { status: 'rejected' }

GET /api/admin/slots/inventory      (AUTH, ADMIN)
QUERY: { surface?: string; status?: string }
→ 200 { slots: SlotInventory[]; utilizationRate: number }

GET /api/admin/creatives/pending    (AUTH, ADMIN)
→ 200 { creatives: Creative[]; count: number }
```

---

## SALES CRM

```
GET /api/admin/sales/leads          (AUTH, ADMIN)
QUERY: { status?: LeadStatus; assignedTo?: string; page?: number }
→ 200 { leads: CRMEntry[]; total: number }

POST /api/admin/sales/leads         (AUTH, ADMIN)
BODY: { companyName; contactEmail; source; estimatedValue? }
→ 201 { crmEntry: CRMEntry }

POST /api/admin/sales/proposals     (AUTH, ADMIN | BOT)
BODY: { crmEntryId; tier; slots: string[]; priceCents; discountPct?; expiresInDays? }
→ 201 { proposal: Proposal }
→ 403 { error: 'discount_requires_approval' }  — if discountPct > 10

POST /api/admin/sales/proposals/:id/approve  (AUTH, ADMIN)
→ 200 { proposal: Proposal; status: 'approved' }

POST /api/admin/sales/contracts     (AUTH, ADMIN)
BODY: { sponsorName; sponsorEmail; slotId; priceCents; startDate; endDate; isExclusive? }
→ 201 { contract: Contract }
→ 403 { error: 'exclusivity_requires_admin_approval' }
```

---

## PARTY LOBBY

```
GET /api/party                      (PUBLIC)
QUERY: { isPublic?: true; page?: number }
→ 200 { parties: PartyPreview[]; total: number }

POST /api/party                     (AUTH)
BODY: { name?: string; isPublic?: boolean; themeScene?: string }
→ 201 { party: Party; inviteCode: string; inviteUrl: string }

GET /api/party/:id                  (AUTH — member only)
→ 200 { party: Party; members: PartyMember[]; recentMessages: PartyMessage[] }

POST /api/party/:id/join            (AUTH)
BODY: { inviteCode?: string }  — required if party is private
→ 200 { partyMember: PartyMember }
→ 403 { error: 'invalid_invite_code' | 'party_full' }
→ 404 { error: 'party_not_found' }

DELETE /api/party/:id/leave         (AUTH — own membership)
→ 200 { disbanded?: boolean }  — disbanded: true if host left and no co-host

POST /api/party/:id/ready           (AUTH — own membership)
BODY: { isReady: boolean }
→ 200 { readyCount: number; totalMembers: number }

POST /api/party/:id/transport       (AUTH — host or co-host only)
BODY: { destinationId: string; destinationType: 'room'|'game'|'show'|'contest' }
→ 200 { joinUrl: string }  — sent to all ready members via WebSocket party:transport
→ 403 { error: 'not_host_or_cohost' }
```

---

## GAMES

```
GET /api/games/sessions             (PUBLIC)
QUERY: { gameType?: string; status?: 'lobby'|'active'; page?: number }
→ 200 { sessions: GameSessionPreview[]; total: number }

POST /api/games/sessions            (AUTH)
BODY: { gameType: string; isRanked?: boolean; maxPlayers?: number }
→ 201 { session: GameSession; roomId: string }

GET /api/games/sessions/:id         (PUBLIC)
→ 200 { session: GameSession; players: GamePlayer[]; currentQuestion?: Question }

POST /api/games/sessions/:id/join   (AUTH)
→ 200 { gamePlayer: GamePlayer }
→ 409 { error: 'session_full' | 'already_joined' | 'session_ended' }

POST /api/games/sessions/:id/answer (AUTH, GAME PLAYER)
BODY: { answer: string; timeMs: number }
→ 200 { correct: boolean; points: number; totalScore: number }
```

---

## EDITORIAL

```
GET /api/editorial                  (PUBLIC)
QUERY: { category?: string; page?: number; limit?: number }
→ 200 { articles: Article[]; total: number; featured?: Article }

GET /api/editorial/:slug            (PUBLIC)
→ 200 { article: Article; adSlots: AdSlotConfig[]; related: Article[] }

POST /api/editorial                 (AUTH, EDITOR | ADMIN)
BODY: { title; subtitle?; bodyMd; category; tags?; coverImageUrl?; templateId? }
→ 201 { article: Article; slug: string }

PUT /api/editorial/:id/publish      (AUTH, EDITOR | ADMIN)
→ 200 { article: Article; status: 'published' }

PUT /api/editorial/:id/unpublish    (AUTH, ADMIN)
→ 200 { article: Article; status: 'unpublished' }
```

---

## STREAM & WIN

```
POST /api/stream-win/event         (AUTH)
BODY: { eventType: 'stream_listen'|'room_join'|'show_attend'|'game_play'|'daily_login'|'follow_artist' }
→ 200 { pointsEarned: number; newScore: number; newStreak: number }

GET /api/stream-win/score           (AUTH)
→ 200 { weeklyScore: number; lifetimeScore: number; rank: number; streak: number }

GET /api/stream-win/leaderboard     (PUBLIC)
→ 200 { entries: LeaderboardEntry[]; totalParticipants: number }
```

---

## WEBSOCKET EVENTS — PARTY LOBBY (/ws/party/:partyId)

```typescript
// Client → Server
'party:join'              { partyId: string }
'party:leave'             {}
'party:message'           { content: string; type?: 'text'|'reaction' }
'party:ready-toggle'      { isReady: boolean }
'party:video-toggle'      { enabled: boolean }
'party:mic-toggle'        { enabled: boolean }
'party:destination-pick'  { destinationId: string; destinationType: string }
'party:pin-destination'   { destinationId: string; destinationType: string }  // host only
'party:join-together'     {}  // host only, triggers transport for ready members

// Server → Client
'party:state'             { members: PartyMember[]; messages: PartyMessage[5]; readyCount: number }
'party:member-join'       { member: PartyMember }
'party:member-leave'      { userId: string; newHost?: string }
'party:member-update'     { userId: string; presenceStatus: string; destinationType?: string }
'party:message-new'       { message: PartyMessage }
'party:ready-count'       { count: number; total: number }
'party:destination-pinned'{ destinationId: string; pinnedBy: string; destinationType: string }
'party:transport'         { destinationId: string; destinationType: string; joinUrl: string }
'party:disbanded'         { reason: 'host_left'|'empty_timeout'|'admin_close' }
```

---

## WEBSOCKET EVENTS — GAME (/ws/game/:sessionId)

```typescript
// Client → Server
'game:join'             { sessionId: string }
'game:ready'            {}
'game:answer'           { answer: string; timeMs: number }
'game:buzz'             {}  // Name That Tune only

// Server → Client
'game:state'            { session: GameSession; players: GamePlayer[] }
'game:countdown'        { seconds: number }
'game:round-start'      { round: number; question: Question }
'game:buzz-winner'      { userId: string; displayName: string }  // NTT only
'game:answer-result'    { correct: boolean; correctAnswer: string; scores: ScoreMap }
'game:round-end'        { scores: ScoreMap; leaderboard: PlayerRank[] }
'game:intermission'     { durationMs: number; adSlot?: AdSlotData }
'game:ended'            { winner: PlayerSummary; finalScores: ScoreMap; awardedPoints: number }
```
