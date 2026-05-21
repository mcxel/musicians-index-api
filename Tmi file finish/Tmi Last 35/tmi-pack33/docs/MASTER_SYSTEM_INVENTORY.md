# MASTER_SYSTEM_INVENTORY.md
## Every System, Engine, Pipeline, Bot, Chain, and Environment
### BerntoutGlobal XXL / The Musician's Index

The complete inventory of what exists, what is scaffolded, and what remains.

---

## ENGINES (33 total)

| Engine | Status | Location |
|---|---|---|
| MagazineEngine | ✅ scaffolded | homepage + magazine routes |
| ArticleEngine | ✅ scaffolded | /articles/* + editorial API |
| ProfileEngine | ✅ scaffolded | /profile/* + profiles API |
| StationEngine | ✅ scaffolded | /stations/* + station routes |
| LiveEngine | ✅ scaffolded | /live/* + room gateway |
| LobbyEngine | ✅ scaffolded | /lobby/* + room listing |
| RoomEngine | ✅ wired (Slices 13-17) | room runtime |
| ClipEngine | ✅ scaffolded | /clips/* + clip pipeline |
| ReplayEngine | ✅ scaffolded | /shows/*/replay |
| ContestEngine | ✅ scaffolded | /contest/* |
| GameEngine | ✅ scaffolded | /games/* |
| SponsorEngine | ✅ scaffolded | /sponsors/* |
| AdvertiserEngine | ✅ scaffolded | /advertisers/* |
| CampaignEngine | ✅ documented | monetization module |
| TierEngine | ✅ **PACK 33** | tier-engine.ts |
| WalletEngine | ✅ wired | wallet module (Pack 25) |
| PaymentEngine | ✅ wired | Stripe module (Pack 25) |
| RankingEngine | ✅ documented | season rankings |
| RecommendationEngine | ⚠️ spec only | recommendation bot |
| AnalyticsEngine | ⚠️ spec only | analytics module |
| NotificationEngine | ✅ wired | notification gateway (Pack 25) |
| TimelineEngine | ⚠️ spec only | timeline bot |
| MediaEngine | ✅ scaffolded | media upload pipeline |
| SceneEngine | ✅ **PACK 32** | scene-registry.ts |
| LayoutEngine | ✅ **PACK 32** | design-tokens.ts |
| OverlayEngine | ⚠️ spec only | overlay components |
| AnimationEngine | ⚠️ spec only | CSS animation system |
| AudioEngine | ⚠️ spec only | scene audio loops |
| SearchEngine | ⚠️ spec only | search-index-bot |
| ModerationEngine | ✅ documented | moderation module |
| BotEngine | ✅ **PACK 32** | bot-registry.ts |
| AutomationEngine | ✅ **PACK 33** | pipeline-registry.ts |
| FreshnessEngine | ✅ **PACK 33** | freshness-engine.ts |
| EarningsCoachingEngine | ✅ **PACK 33** | earnings-coaching-engine.ts |

---

## PIPELINES (20 total)

| Pipeline | Status | Location |
|---|---|---|
| article-auto-create | ✅ documented | Pack 33 chain |
| article-publish | ✅ documented | Pack 32 + Pack 33 chain |
| story-rotation | ✅ documented | Pack 32 pipeline-registry |
| media-upload | ✅ documented | Pack 32 pipeline-registry |
| video-encode | ✅ documented | Pack 32 pipeline-registry |
| clip-generate | ✅ documented | Pack 32 pipeline-registry |
| clip-share-export | ✅ documented | Pack 32 pipeline-registry |
| stream-live | ✅ documented | Pack 33 chain |
| show-replay | ✅ documented | Pack 33 chain |
| sponsor-campaign | ✅ documented | Pack 32 + Pack 33 chain |
| ad-placement | ✅ documented | Pack 33 page-zone-registry |
| notification-delivery | ✅ wired | notification gateway |
| earnings-calculate | ✅ documented | Pack 32 pipeline-registry |
| payout-process | ✅ documented | Pack 26 + Pack 32 |
| fraud-score | ✅ documented | Pack 32 pipeline-registry |
| search-index | ✅ documented | search-index-bot |
| analytics-ingest | ⚠️ spec only | analytics bot |
| ranking-update | ✅ documented | ranking-bot |
| backup | ✅ documented | backup-bot |
| deploy | ✅ documented | CI/CD pipeline |

---

## BOTS (35 total)

See bot-registry.ts (Pack 32) for full spec.

| Category | Bots |
|---|---|
| Content (6) | cover-generator, editorial-assembly, homepage-rotation, featured-story, article-freshness, headline-ticker |
| Monetization (13) | sponsor-matching, sponsor-reminder, local-sponsor-match, ad-placement, ad-rotation, brand-safety, ctr-optimizer, renewal, house-ad-fallback, prospect-scout, outreach, proposal, campaign-expiration |
| Discovery (3) | clip-highlight, trending, recommendation |
| Competition (3) | contest-ops, leaderboard, ranking |
| Platform (9) | notification, timeline, search-index, moderation, fraud-sentinel, analytics, payout, billing-integrity, owner-finance |
| Ops (4) | media-qc, scene-preset, station-activity, backup, health-monitor |

---

## SYSTEM CHAINS (8 total)

| Chain | Status | Location |
|---|---|---|
| Magazine Entry | ✅ Pack 32 | chain-inventory.md |
| Artist Growth | ✅ **PACK 33** | ARTIST_CREATION_CHAIN.md |
| Article Publish | ✅ **PACK 33** | ARTICLE_PUBLISH_CHAIN.md |
| Live Show | ✅ **PACK 33** | LIVE_SHOW_CHAIN.md |
| Local Sponsor Loop | ✅ **PACK 33** | SPONSOR_CAMPAIGN_CHAIN.md |
| Contest → Crown | ✅ Pack 32 | chain-inventory.md |
| Advertiser Self-Serve | ✅ Pack 29 | API contracts + state machines |
| Owner Profit Distribution | ✅ Pack 26 | owner finance system |

---

## ENVIRONMENTS / SCENES (18 total)

See scene-registry.ts (Pack 32) — all 18 scenes defined with backgrounds, audio, particles.

---

## TIERS (6 levels)

See tier-engine.ts (Pack 33) — free, starter, pro, gold, platinum, diamond.

PERMANENT DIAMOND: Marcel Dickens + B.J. M Beat's — hardcoded, verified every 4h.

---

## PAGE ZONES (30+ defined)

See page-zone-registry.ts (Pack 33) — all 30+ ad/sponsor zones with pricing.

---

## PLATFORM LAWS (permanent — never change)

```
1. Discovery-first: 0 viewers = position 1 in lobby ALWAYS
2. Permanent Diamond: Marcel Dickens + B.J. M Beat's — forever
3. Kids only talk to kids (canSendMessage middleware)
4. Max 8 tickets per buyer per event
5. Owner payouts from NET PROFIT only
6. TMI visual identity: #0D0520, Bebas Neue, cyan/gold/pink
7. GET /api/ads/slot/:id ALWAYS returns 200 (never blank)
8. Party persists when members enter/exit rooms
9. Article pages ALWAYS link to artist station
10. "Stations" not "Channels" in all public UI
11. Coaching sticky notes on artist dashboard
12. No system should break another system — isolated modules only
13. If a page exceeds 5 major zones, create child routes
14. Artist articles auto-create on profile completion
15. Freshness engine prevents same content repeating on same surface
```
