# API_CONTRACTS.md
## Every API Endpoint — Request/Response Contracts
### BerntoutGlobal XXL / The Musician's Index

All endpoints use JSON. Auth endpoints require `Authorization: Bearer {jwt}`.
Copilot implements these in `apps/api/src/`.

---

## SEARCH

```
GET /api/search?q={string}&type={all|artists|rooms|events|articles|beats}&page={n}
→ 200 {
    results: {
      liveRooms:  RoomSummary[],   // viewers_asc sort (discovery-first)
      artists:    ArtistSummary[],
      beats:      BeatSummary[],
      events:     EventSummary[],
      articles:   ArticleSummary[],
    },
    query: string,
    total: number,
  }
```

## NOTIFICATIONS

```
GET  /api/notifications?limit=20&cursor={cursor}   (AUTH)
→ 200 { items: Notification[], nextCursor: string | null }

POST /api/notifications/read-all                   (AUTH)
→ 200 { success: true }

POST /api/notifications/:id/read                   (AUTH)
→ 200 { success: true }

GET  /api/notifications/preferences                (AUTH)
→ 200 { preferences: NotificationPreference[] }

PUT  /api/notifications/preferences                (AUTH)
BODY { type: string; channel: 'app'|'push'|'email'; enabled: boolean }[]
→ 200 { success: true }
```

## ACTIVITY FEED

```
GET /api/feed?limit=20&cursor={cursor}             (AUTH)
→ 200 { items: FeedItem[], nextCursor: string | null }
```

## TIPS

```
POST /api/tips/intent                              (AUTH)
BODY { artistId: string; amount: number; roomId?: string }
→ 200 { clientSecret: string; intentId: string }

GET  /api/tips/history?limit=20                    (AUTH)
→ 200 { tips: Tip[] }
```

## WALLET

```
GET  /api/wallet                                   (AUTH)
→ 200 { available: number; pending: number; lifetime: number; currency: 'usd' }

GET  /api/wallet/transactions?limit=20&cursor={c}  (AUTH)
→ 200 { transactions: Transaction[]; nextCursor: string | null }

POST /api/wallet/payout-request                    (AUTH, ARTIST)
BODY { amount: number }
→ 200 { status: 'queued'; estimatedDate: string }
→ 400 { error: 'below_minimum' | 'no_payout_account' }

GET  /api/wallet/payout-status                     (AUTH, ARTIST)
→ 200 { status: 'not_connected'|'pending'|'active'; stripeAccountId?: string }

POST /api/wallet/payout-onboard                    (AUTH, ARTIST)
→ 200 { onboardingUrl: string }  // Stripe Connect Express onboarding URL
```

## FAN CREDITS

```
GET  /api/credits/balance                          (AUTH)
→ 200 { balance: number }

POST /api/credits/purchase                         (AUTH)
BODY { bundleId: '100'|'500'|'1500' }
→ 200 { clientSecret: string }  // Stripe PaymentIntent

POST /api/credits/spend                            (AUTH)
BODY { amount: number; purpose: 'fan_club'|'exclusive_preview'|'backstage' }
→ 200 { newBalance: number }
→ 400 { error: 'insufficient_credits' }
```

## FAN CLUBS

```
GET  /api/fan-clubs/:artistSlug                    (PUBLIC)
→ 200 { fanClub: FanClub; tiers: FanClubTier[]; memberCount: number }

GET  /api/fan-clubs/:artistSlug/membership         (AUTH)
→ 200 { tier: 'none'|'supporter'|'vip'|'platinum'; since?: string }

POST /api/fan-clubs/:artistSlug/join               (AUTH)
BODY { tierId: string }
→ 200 { clientSecret: string }  // Stripe subscription

DELETE /api/fan-clubs/:artistSlug/membership       (AUTH)
→ 200 { success: true }

GET  /api/fan-clubs/:artistSlug/feed               (AUTH, FAN CLUB MEMBER)
→ 200 { posts: FanClubPost[]; nextCursor: string | null }

POST /api/fan-clubs/:artistSlug/post               (AUTH, ARTIST OWNER)
BODY { content: string; mediaUrl?: string; tier: 'all'|'supporter'|'vip'|'platinum' }
→ 200 { post: FanClubPost }
```

## BEATS MARKETPLACE

```
GET  /api/beats?genre={g}&bpmMin={n}&bpmMax={n}&sort={trending|newest|price}&page={n}
→ 200 { beats: Beat[]; total: number; page: number }

GET  /api/beats/:slug
→ 200 { beat: BeatDetail }

POST /api/beats/:id/preview-play                   (PUBLIC, rate limited)
→ 200 { success: true }  // increments play count

POST /api/beats/:id/license                        (AUTH)
BODY { licenseType: 'basic'|'premium'|'exclusive' }
→ 200 { clientSecret: string }  // Stripe PaymentIntent

POST /api/beats                                    (AUTH, PRODUCER)
BODY { title; genre; bpm; key; tags; basicPrice; premiumPrice; previewUrl; taggedUrl }
→ 201 { beat: Beat }

PUT  /api/beats/:id/publish                        (AUTH, PRODUCER OWNER)
→ 200 { status: 'published' }

PUT  /api/beats/:id/unpublish                      (AUTH, PRODUCER OWNER)
→ 200 { status: 'unpublished' }
```

## COMPETITIONS

```
GET  /api/competitions?status={open|upcoming|past}&page={n}
→ 200 { competitions: Competition[] }

GET  /api/competitions/:slug
→ 200 { competition: CompetitionDetail; bracket: BracketState }

POST /api/competitions/:slug/register              (AUTH, ARTIST)
→ 200 { status: 'registered' }
→ 409 { error: 'already_registered' | 'registration_closed' }

GET  /api/competitions/:slug/bracket
→ 200 { bracket: BracketState }
```

## SEASONS

```
GET  /api/seasons
→ 200 { current: Season; past: Season[] }

GET  /api/seasons/:slug/rankings?page={n}
→ 200 { season: Season; rankings: RankEntry[]; myRank?: RankEntry }
```

## EDITORIAL

```
GET  /api/editorial?category={music|news|tabloid|local|science|trending}&page={n}
→ 200 { articles: Article[]; total: number }

GET  /api/editorial/:slug
→ 200 { article: ArticleDetail; related: Article[] }
```

## USER SETTINGS

```
GET  /api/settings                                 (AUTH)
→ 200 { settings: UserSettings }

PUT  /api/settings                                 (AUTH)
BODY Partial<UserSettings>
→ 200 { settings: UserSettings }

DELETE /api/settings/account                       (AUTH)
BODY { password: string; confirm: 'DELETE' }
→ 200 { success: true }  // begins 30-day deletion grace period

POST /api/settings/export-data                     (AUTH)
→ 200 { downloadUrl: string; expiresAt: string }
```

## TICKET ANTI-BOT CHECK

```
POST /api/tickets/purchase-check                   (AUTH)
BODY { eventId: string; quantity: number; turnstileToken: string }
→ 200 { allowed: true; reservationToken: string; expiresAt: string }
→ 429 { error: 'limit_exceeded'; max: 8; current: number }
→ 400 { error: 'bot_detected' | 'velocity_exceeded' }
```

## FAMILY / KID ACCOUNTS

```
GET  /api/family/accounts                          (AUTH, PARENT)
→ 200 { children: ChildAccount[] }

POST /api/family/accounts                          (AUTH, PARENT)
BODY { username; displayName; birthYear; avatarStyle? }
→ 201 { childAccount: ChildAccount }

POST /api/family/accounts/:childId/performer       (AUTH, PARENT)
→ 200 { performerStatus: 'pending_approval' }

PUT  /api/family/accounts/:childId/performer       (AUTH, PARENT)
BODY { approved: boolean }
→ 200 { performerStatus: 'approved' | 'denied' }

GET  /api/family/accounts/:childId/activity        (AUTH, PARENT)
→ 200 { activity: ChildActivityLog[] }
```

## ADMIN ENDPOINTS

```
GET  /api/admin/health                             (ADMIN)
GET  /api/admin/metrics                            (ADMIN)
GET  /api/admin/logs?level={warn|error}&limit=50   (ADMIN)
GET  /api/admin/flags                              (ADMIN)
PUT  /api/admin/flags/:name                        (ADMIN)
GET  /api/admin/queue-status                       (ADMIN)
POST /api/admin/emergency-broadcast                (ADMIN)
POST /api/admin/room/:roomId/close                 (ADMIN)
```
