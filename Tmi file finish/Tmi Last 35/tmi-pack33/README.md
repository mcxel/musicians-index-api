# TMI PACK 33 — FINAL SYSTEMS LAYER
## Placement Engine + Tier Logic + Chains + Freshness + Coaching
### BerntoutGlobal XXL / The Musician's Index

---

## WHAT THIS PACK ADDS

| File | What It Provides |
|---|---|
| `tiers/tier-engine.ts` | 6 tiers (free→diamond) with every feature gate, limit, discovery weight, and ranking boost. Permanent Diamond users hardcoded. |
| `placements/page-zone-registry.ts` | 30+ named ad/sponsor zones across homepage/article/live/game/contest with dimensions, pricing, frequency caps, cooldown rules. |
| `engines/freshness-engine.ts` | Rotation memory + scoring so same content never repeats too quickly. Prevents homepage and magazine from feeling stale. |
| `engines/earnings-coaching-engine.ts` | 10 contextual coaching notes that appear as sticky cards on artist dashboard — sponsor tasks, promotion reminders, local sponsor loop, earnings alerts. |
| `chains/ARTIST_CREATION_CHAIN.md` | 9-step documented flow from registration → profile → article auto-create → station → ranking → billing-integrity → coaching. |
| `chains/ARTICLE_PUBLISH_CHAIN.md` | 9-step flow from validation → ad slot assignment → station link injection → magazine rotation → follower notify. |
| `chains/LIVE_SHOW_CHAIN.md` | 10-step flow from Go Live → sponsor overlays → viewer tracking → tips → replay → clips → archive → analytics → earnings. |
| `chains/SPONSOR_CAMPAIGN_CHAIN.md` | 10-step local sponsor loop: discovery → artist match → proposal → activation → artist tasks → store analytics → renewal. |
| `docs/MASTER_SYSTEM_INVENTORY.md` | Complete status tracker: 33 engines, 20 pipelines, 35 bots, 8 chains, 18 scenes, 6 tiers, 30+ page zones. |

---

## THE LOCAL SPONSOR LOOP (core business model)

```
Local store → sponsors artist → artist promotes store → community finds store
→ store renews → artist earns more → everyone wins
```

This loop is documented in SPONSOR_CAMPAIGN_CHAIN.md and enforced by:
- sponsor-matching-bot (pairs local businesses with local artists)
- renewal-bot (fires 7 days before campaign ends)
- earnings-coaching-engine (reminds artist to thank and promote sponsor)
- page-zone-registry (reserves sponsor placement zones for that artist's surfaces)

---

## MOVE DESTINATIONS

```
tiers/tier-engine.ts                   → apps/web/src/systems/tiers/
placements/page-zone-registry.ts       → apps/web/src/config/
engines/freshness-engine.ts            → apps/api/src/engines/
engines/earnings-coaching-engine.ts    → apps/web/src/systems/coaching/
chains/*.md                            → docs/system/chains/
docs/MASTER_SYSTEM_INVENTORY.md       → docs/system/
README.md                              → docs/pack33-README.md
```

---

## COMPLETE PACK DELIVERY (all sessions)

| Pack | Files | Key Contribution |
|---|---|---|
| 25 | 21 | API contracts, Prisma 49+ models, WebSocket, Stripe, safety |
| 26 | 18 | Owner finance, Marcel+Jay Paul payouts, Copilot prompt |
| 27 | 6 | Import order, conflict matrix, smoke tests |
| 28 | 11 | UI design system (from PDFs), homepage belts, monetization |
| 29 | 13 | File placement, state machines, permissions, wiring order |
| 30 | 4 | Pre-flight, import commands, rollback procedures |
| 31 | 109 | Fixed corrupted pages + 98-page platform scaffold |
| 32 | 12 | Full homepage (all belts), magazine entry scene, scene/bot/pipeline registries |
| **33** | **9** | **Tier engine, page zones, freshness, coaching, 4 full chains** |
| **TOTAL** | **203** | **The complete TMI platform architecture** |

*BerntoutGlobal LLC — "This is your stage, be original."*
