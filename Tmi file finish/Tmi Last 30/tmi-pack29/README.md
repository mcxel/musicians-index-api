# TMI PACK 29 — IMPLEMENTATION COMPANION
## Repo-Grounded Wiring Guide for Copilot
### BerntoutGlobal XXL / The Musician's Index

Pack 29 bridges Pack 28's architecture vision to actual repo wiring.
Give both packs to Copilot together. Follow PACK29_SAFE_WIRING_ORDER.md exactly.

---

## FILE INDEX

| File | Purpose |
|---|---|
| PACK29_REPO_FILE_PLACEMENT_MAP.md | Every file: path, NEW/EDIT/LOCKED/APPEND |
| PACK29_PRISMA_DATA_MODEL_MAP.md | All new Prisma models with exact fields/relations/indexes |
| PACK29_API_CONTRACTS.md | Exact REST + WebSocket contracts for all new endpoints |
| PACK29_STATE_MACHINES.md | Every stateful system: states + transitions + triggers |
| PACK29_PERMISSIONS_MATRIX.md | Who can do what: full RBAC matrix + bot autonomy rules |
| PACK29_BOT_AUTOMATION_BOUNDARIES.md | What each bot does autonomously vs needs human approval |
| PACK29_ACCEPTANCE_TEST_MATRIX.md | Proof gate for every feature — what "done" looks like |
| PACK29_SEED_CONTENT_AND_FIXTURES.md | Demo data for visual proofs |
| PACK29_SAFE_WIRING_ORDER.md | 9 slices: Foundations → Design → Ads → Belts → Editorial → Party → Games → Advertiser → StreamWin |
| PACK29_ENV_VARS_ADDITIONAL.md | Additional env vars for Pack 28+29 systems |
| PACK29_WEBSOCKET_EVENT_REGISTRY.md | Every WS event across all 7 namespaces |
| PACK29_ERROR_CODE_REGISTRY.md | Consistent error codes for all new systems |

---

## MOVE DESTINATIONS

```
All PACK29_*.md files → tmi-platform/docs/system/
README.md             → tmi-platform/docs/pack29-README.md
```

---

## WIRING ORDER (give Copilot this sequence)

```
Slice 0:  Prisma models + seed data (30 min)
Slice 1:  TMI design system components (1 hr)
Slice 2:  Ad Renderer + House Ads (2 hr)
Slice 3:  Homepage Belt System (3 hr)
Slice 4:  Editorial System (2 hr)
Slice 5:  Party Lobby System (3 hr)
Slice 6:  Game Engine (3 hr)
Slice 7:  Advertiser Self-Serve (3 hr)
Slice 8:  Stream & Win + Scenes (2 hr)
Slice 9:  Final build + proof gate
```

Proof gate between every slice. Never skip.

---

## WHAT BOTS DO vs WHAT NEEDS BIG ACE

```
✅ Bots can close:        standard packages ≤$99.99/week, ≤10% discount
❌ Big Ace required for:  >$99.99/week, >10% discount, exclusivity, custom terms
```

---

## NEW PRISMA MODELS (12 total)

```
Advertiser, AdCampaign, AdSlotReservation, AdCreative,
AdImpression, AdClick, HouseAd,
SponsorLead, SponsorContract,
SalesCRMEntry, SalesNote, CampaignProposal,
Party, PartyMember, PartyMessage,
GameSession, GamePlayer,
Article, ArticleAdSlot,
StreamWinScore, StreamWinEvent
```

---

## CRITICAL RULES (carry forward from all packs)

```
1. Discovery-first: 0 viewers = position 1 in lobby ALWAYS
2. Permanent Diamond: Marcel Dickens + B.J. M Beat's — forever
3. Kids only talk to kids — canSendMessage() on ALL message flows
4. Max 8 tickets per buyer per event
5. ONE AudioProvider. ONE SharedPreviewProvider. ONE TurnQueueProvider.
6. Owner payouts from net profit only
7. TMI visual identity: #0D0520 bg, Bebas Neue, cyan/gold/pink — never generic SaaS
8. GET /api/ads/slot/:slotId ALWAYS returns 200 — never blank container
9. Party persists when members enter/exit rooms
10. All bot actions > $99.99 or custom terms → Big Ace approval queue
```

*BerntoutGlobal LLC — "This is your stage, be original."*
