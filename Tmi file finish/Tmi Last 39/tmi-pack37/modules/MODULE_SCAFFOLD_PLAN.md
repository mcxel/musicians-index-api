# TMI BACKEND MODULE SCAFFOLD PLAN
## Every Module, Every File, Every Route

---

## NAMING CONVENTION
All modules follow NestJS pattern:
```
apps/api/src/modules/[name]/
  [name].controller.ts   — HTTP routes
  [name].service.ts      — business logic
  [name].module.ts       — NestJS module definition
  [name].repository.ts   — Prisma access layer
  dto/
    create-[name].dto.ts
    update-[name].dto.ts
  [name].guard.ts        — auth guard if needed
  [name].spec.ts         — unit tests
```

---

## KEY MODULE ROUTES

### ads module (Platform Law #7 — always 200)
```
GET  /api/ads/slot/:zoneId     → always 200, house ad fallback chain
GET  /api/ads/campaigns        → active campaigns list
POST /api/ads/campaigns        → create campaign (Big Ace approval required if > $99.99/wk)
GET  /api/ads/creatives/:id    → get creative
POST /api/ads/impressions      → record impression
POST /api/ads/clicks           → record click
```

### rooms module (discovery-first — viewers_asc)
```
GET  /api/rooms                → list rooms ORDER BY viewer_count ASC NULLS FIRST
POST /api/rooms                → create room
GET  /api/rooms/:id            → single room
POST /api/rooms/:id/join       → join room
POST /api/rooms/:id/leave      → leave room
GET  /api/rooms/:id/members    → room members
```

### games module
```
GET  /api/games                → list active game sessions
POST /api/games                → create session
GET  /api/games/:id            → session state
POST /api/games/:id/join       → join as player
POST /api/games/:id/vote       → cast audience vote (1 per user per round)
POST /api/games/:id/score      → record score (judge/system only)
POST /api/games/:id/round/next → advance round (host only)
POST /api/games/:id/complete   → finalize winner
```

### wallet module (Big Ace gate on payouts)
```
GET  /api/wallet/mine          → current balance
GET  /api/wallet/transactions  → transaction history
POST /api/wallet/tip           → tip an artist
POST /api/wallet/payout-request → request payout (queues for Big Ace review)
```

### economy module
```
GET  /api/economy/shop         → current shop rotation
GET  /api/economy/shop/:zone   → featured/daily/seasonal
POST /api/economy/purchase     → buy item with points
GET  /api/economy/inventory    → my inventory
POST /api/economy/equip        → equip item to loadout
GET  /api/economy/loadout      → active loadout
POST /api/economy/loadout      → save loadout
```

### device-pairing module
```
POST /api/device/pair/request  → generate pairing code (TV calls this)
POST /api/device/pair/confirm  → confirm code (phone scans QR)
GET  /api/device/pair/:code    → check pairing status
POST /api/device/handoff       → cross-device session handoff
```

### scoring module (universal)
```
GET  /api/scoring/leaderboard/:type → leaderboard by type
GET  /api/scoring/crown             → current crown state
GET  /api/scoring/history/:userId   → user score history
POST /api/scoring/points            → record participation action (internal only)
```
