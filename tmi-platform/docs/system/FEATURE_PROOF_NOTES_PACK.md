# FEATURE_PROOF_NOTES_PACK.md
## Every New Feature — File, Route, Provider, Contract, DB, WS, Proof
### BerntoutGlobal XXL / The Musician's Index

---

## FORMAT
```
FEATURE: [name]
FILE:     [exact path]
ROUTE:    [URL]
PROVIDER: [context provider or 'none — React Query']
API:      [endpoint method + path]
DB:       [Prisma model(s)]
WS:       [WebSocket event or 'none']
EMPTY:    [empty state behavior]
PROOF:    [exact test step]
```

---

FEATURE: Global Search
FILE:     apps/web/src/components/search/GlobalSearchBar.tsx
ROUTE:    /search?q={query}
PROVIDER: none — React Query
API:      GET /api/search?q={q}&type={type}
DB:       search_index (Postgres full-text)
WS:       none (live room boost via Redis)
EMPTY:    "No results for..." + suggested categories
PROOF:    Type "artist" → results appear < 1s → LIVE rooms show first → Enter navigates to /search

---

FEATURE: Notification Bell
FILE:     apps/web/src/components/notifications/NotificationBell.tsx
ROUTE:    /notifications (full page)
PROVIDER: none — SWR polling every 60s
API:      GET /api/notifications/count, GET /api/notifications
DB:       Notification, NotificationPreference
WS:       notification:new → badge increments
EMPTY:    "No notifications yet"
PROOF:    Follow a room → get live notification → bell badge +1 → open panel → mark read → badge 0

---

FEATURE: Tip in Room
FILE:     apps/web/src/components/economy/TipJarWidget.tsx
ROUTE:    (in-room, not standalone)
PROVIDER: none — hook calls /api/tips/intent
API:      POST /api/tips/intent → Stripe webhook
DB:       Tip, Wallet, Transaction
WS:       room:tip_received → TipExplosionEffect
EMPTY:    n/a — button always visible
PROOF:    Open room → Tip $5 → Stripe test payment → TipExplosionEffect floats in room → artist wallet +$3.50

---

FEATURE: Wallet Dashboard
FILE:     apps/web/src/components/economy/WalletPanel.tsx
ROUTE:    /wallet
PROVIDER: WalletProvider
API:      GET /api/wallet, POST /api/wallet/payout-request
DB:       Wallet, Transaction, Payout
WS:       none
EMPTY:    "$0.00 available — start earning by going live"
PROOF:    Login as artist → /wallet → balances show → payout button disabled below $20 → enabled at $20+

---

FEATURE: Fan Credits Purchase
FILE:     apps/web/src/components/economy/FanCreditWidget.tsx
ROUTE:    /credits
PROVIDER: WalletProvider
API:      GET /api/credits/balance, POST /api/credits/purchase
DB:       Wallet (fanCredits field)
WS:       none
EMPTY:    "0 credits — buy a pack to unlock exclusive fan perks"
PROOF:    Select 100-credit bundle → Stripe test payment → balance shows 100

---

FEATURE: Fan Club Join
FILE:     apps/web/src/pages/fan-club/[artistSlug]/join/
ROUTE:    /fan-club/[slug]/join
PROVIDER: none — server component
API:      POST /api/fan-clubs/:slug/join → Stripe checkout
DB:       FanClub, FanClubTier, FanClubMembership
WS:       none
EMPTY:    n/a — form always visible
PROOF:    Open fan club → Join VIP → Stripe test checkout → membership created → VIP badge shows on profile

---

FEATURE: Beat Marketplace
FILE:     apps/web/src/components/economy/BeatMarketplaceShell.tsx
ROUTE:    /beats
PROVIDER: none — React Query
API:      GET /api/beats, POST /api/beats/:id/preview-play
DB:       Beat
WS:       none
EMPTY:    "No beats match your filters — try adjusting genre or BPM"
PROOF:    Open /beats → beats load → genre filter narrows → play button streams tagged preview

---

FEATURE: Beat License Purchase
FILE:     apps/web/src/pages/beats/[slug]/
ROUTE:    /beats/[slug]
PROVIDER: none
API:      POST /api/beats/:id/license → Stripe PaymentIntent
DB:       BeatLicense
WS:       none
EMPTY:    n/a — purchase button always visible
PROOF:    Buy Basic license → Stripe test payment → BeatLicense created → download link accessible 24h

---

FEATURE: Competition Register
FILE:     apps/web/src/pages/competitions/[slug]/register/
ROUTE:    /competitions/[slug]/register
PROVIDER: none
API:      POST /api/competitions/:slug/register
DB:       CompetitionRegistration
WS:       none
EMPTY:    n/a — registration form
PROOF:    Open competition → Register → success state → name appears in bracket

---

FEATURE: Season Rankings
FILE:     apps/web/src/pages/seasons/[slug]/
ROUTE:    /seasons/[slug]
PROVIDER: none — ISR (revalidate: 300)
API:      GET /api/seasons/:slug/rankings
DB:       Season, RankEntry
WS:       leaderboard:update
EMPTY:    "No rankings yet — season starts [date]"
PROOF:    Open /seasons/current → rankings load → my rank shows if logged in

---

FEATURE: Room Scene Background
FILE:     apps/web/src/components/scenes/RoomSceneBackground.tsx
ROUTE:    (in-room)
PROVIDER: none — useRoomScene(roomId) hook
API:      GET /api/rooms/:id/scene, PUT /api/rooms/:id/scene (host only)
DB:       Room (sceneId field)
WS:       room:scene_change
EMPTY:    default scene for room type loads
PROOF:    Host opens ScenePickerPanel → selects new scene → all participants see scene change

---

FEATURE: Activity Feed
FILE:     apps/web/src/components/feed/ActivityFeedPanel.tsx
ROUTE:    /feed
PROVIDER: none — React Query infinite scroll
API:      GET /api/feed
DB:       FeedItem
WS:       none (feed refreshes on notification)
EMPTY:    "Follow artists and producers to see activity here"
PROOF:    Follow an artist → artist goes live → LiveStartCard appears in feed

---

FEATURE: Error Pages
FILE:     apps/web/src/app/not-found.tsx, error.tsx, global-error.tsx
ROUTE:    any 404/500
PROVIDER: none
API:      none
DB:       none
WS:       none
EMPTY:    n/a — they ARE the fallback
PROOF:    Navigate to /this-page-does-not-exist → NotFoundShell renders → lobby link works

---

FEATURE: Kid Communication Safety
FILE:     apps/api/src/middleware/message-safety.middleware.ts
ROUTE:    all messaging routes
PROVIDER: none — middleware
API:      used by POST /api/messages, room:chat WebSocket
DB:       ChildAccount, FamilyAccount
WS:       none (blocks at middleware)
EMPTY:    n/a
PROOF:    Adult sends DM to child account → 403 Forbidden → message NOT delivered
PROOF:    Kid fan sends message to kid performer → 200 OK → message delivered

---

FEATURE: Ticket Purchase Anti-Bot
FILE:     apps/api/src/modules/tickets/anti-bot.service.ts
ROUTE:    POST /api/tickets/purchase-check
PROVIDER: none — service
API:      POST /api/tickets/purchase-check
DB:       TicketPurchase (count check)
WS:       ticket:queue_position (hot events)
EMPTY:    n/a
PROOF:    Attempt to buy 9 tickets → 429 limit_exceeded → purchase blocked
PROOF:    Submit without Turnstile token → 400 bot_detected

---

FEATURE: Owner Profit Dashboard
FILE:     apps/web/src/app/admin/finance/profit/page.tsx
ROUTE:    /admin/finance/profit
PROVIDER: none — server component
API:      GET /api/admin/finance/profit-snapshot
DB:       OwnerProfitSnapshot, OwnerPayout
WS:       none
EMPTY:    "No profit distribution has been calculated yet"
PROOF:    Login as Big Ace → /admin/finance/profit → gross/fees/reserves/net profit all show → distribution calculator works
