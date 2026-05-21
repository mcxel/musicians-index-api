# MASTER_GLOSSARY_AND_NAMING_LAW.md
## Official Names for Everything — Locked

---

## WHY THIS EXISTS
If Copilot calls a room "venue" in one file and "room" in another, drift starts.
If a service is called "economy" in the API and "billing" in the frontend, bugs happen.
This file locks every official name.

---

## ROOM NAMES (Official)

| Code | Official Name | NEVER Use |
|---|---|---|
| ROOM_FREE_01 | The Living Room | "home room", "starter room", "basic room" |
| ROOM_FREE_02 | The Circle | "cypher room", "round room" |
| ROOM_FREE_03 | The Loft | "basement", "brick room" |
| ROOM_BRONZE_01 | The Back Room | "bar room", "pub room" |
| ROOM_BRONZE_02 | The Creator Studio | "studio", "recording room" |
| ROOM_BRONZE_03 | The Meeting Hall | "conference room", "hall" |
| ROOM_GOLD_01 | The Nightclub | "club", "dance room" |
| ROOM_GOLD_02 | The Showcase Lounge | "lounge", "showcase room" |
| ROOM_DIAMOND_01 | The Premium Club | "diamond club" |
| ROOM_DIAMOND_02 | The Mini Concert Hall | "small hall", "mini hall" |
| ROOM_SIG_01 | The Concert Hall | "main hall", "big hall" |
| ROOM_SIG_02 | The Amphitheater | "outdoor venue", "amphitheatre" |
| ROOM_SIG_03 | The Arena | "battle arena", "cypher arena" |
| ROOM_SIG_04 | The Premiere Theater | "theater", "premiere room" |
| ROOM_SIG_WORLD | The World Stage | "global stage", "main stage" |

---

## HOST NAMES (Official — NEVER SHORTEN OR CHANGE)

| Official Name | Role | NEVER Use |
|---|---|---|
| Bobby Stanley | Deal or Feud host | "Bobby", "Stanley" |
| Timothy Hadley | Circles & Squares host | "Tim", "Hadley" |
| Meridicus James | Monthly Idol host | "Meridius", "James" |
| Aiko Starling | Monthly Idol host | "Aiko", "Starling" |
| Zahra Voss | Monthly Idol host | "Zahra", "Voss" |
| Nova Blaze | Marcel's Monday Night Stage | "Nova", "Blaze" |
| Julius | AR meerkat | "July", "the meerkat", "mascot" |
| VEX | Stage Sweeper Robot | "VEX-9", "the robot", "bot" |

---

## SHOW NAMES (Official)

| Official Name | Host |
|---|---|
| Deal or Feud 1000 | Bobby Stanley |
| Circles & Squares | Timothy Hadley |
| Monthly Idol | Meridicus, Aiko, Zahra |
| Marcel's Monday Night Stage | Nova Blaze |
| Dirty Dozen | Rotation |
| Battle Night | Rotation |
| Cypher Circle | Rotation |

---

## ROLE NAMES (Official)

| Name | Access Level |
|---|---|
| Big Ace | Full control — never "admin", "superuser", "root" |
| Marcel Dickens | Analytics + suggestions — never "owner", "CEO view" |
| Jay Paul Sanchez | View only — never "investor", "advisor view" |

---

## MODULE NAMES (Official → Code Keys)

| Display Name | Code Key | DB Table Prefix |
|---|---|---|
| Points Engine | `economy.points` | `points_` |
| Subscription System | `economy.subscription` | `sub_` |
| Payout System | `economy.payout` | `payout_` |
| Follow System | `social.follow` | `follow_` |
| Fan Club | `social.fanclub` | `fanclub_` |
| Watch Party | `social.watchparty` | `watchparty_` |
| Search | `social.search` | (index-based) |
| Discovery | `social.discovery` | (algorithm) |
| Notification | `notification` | `notification_` |
| Moderation | `moderation` | `mod_` |
| Fraud Detection | `moderation.fraud` | `fraud_` |
| Season Engine | `show.season` | `season_` |
| Clip System | `artist.clip` | `clip_` |
| Onboarding | `onboarding` | `onboard_` |
| Sponsor | `sponsor` | `sponsor_` |
| Emergency | `integrity.emergency` | `emergency_` |
| Waitlist | `integrity.waitlist` | `waitlist_` |

---

## FILE NAMING LAW

| Type | Convention | Example |
|---|---|---|
| API service | camelCase.service.ts | `points.service.ts` |
| API module | camelCase.module.ts | `economy.module.ts` |
| API controller | camelCase.controller.ts | `billing.controller.ts` |
| Web component | PascalCase.tsx | `PointsBalance.tsx` |
| Web page | page.tsx in folder | `app/dashboard/artist/page.tsx` |
| Contract | camelCase.ts | `economy.ts` |
| Registry | camelCase-registry.ts | `season-registry.ts` |
| Bot | kebab-case.json | `economy-bot.json` |
| Spec doc | SCREAMING_SNAKE.md | `ECONOMY_ENGINE.md` |

---

*Master Glossary and Naming Law v1.0 — BerntoutGlobal XXL*

---
---
---

# PACK_MERGE_MASTER.md
## How All 10 Packs Fit Together Without Duplication

---

## PACK HIERARCHY (Superseding Rule)

Later packs supersede earlier packs when they cover the same topic.
Earlier packs still contain valid code — just use the newer spec for future wiring.

| If you see conflict between... | Use THIS one |
|---|---|
| Pack 1 components vs Pack 2 components | Pack 2 (explicit supersede) |
| Pack 4 cast vs Pack 5 cast | Pack 5 (completion) |
| Pack 6 live events vs Pack 7 rooms | BOTH (different scope) |
| Pack 8 state vs Pack 9 economy | BOTH (different scope) |
| Pack 9 onboarding vs Pack 10 onboarding | Pack 10 (authoritative) |
| Pack 9 deploy vs Pack 10 deploy | Pack 10 (authoritative) |

---

## WHAT EACH PACK OWN (NO OVERLAP)

| System | Authoritative Pack |
|---|---|
| UI base components | Pack 2 |
| Magazine navigation | Pack 3 |
| Cast system | Packs 4 + 5 |
| Live event types | Pack 6 |
| Room specs | Pack 7 |
| System integrity (state/sync/AI) | Pack 8 |
| Economy/social/moderation | Pack 9 |
| Pack 9 wiring instructions | Pack 9 Wiring |
| Deploy/onboarding/completion board | Pack 10 |
| Visual completion / drift audit | Pack 10 |
| Governance / naming / ownership | Pack 10 |

---

## DO NOT REBUILD — ALREADY EXISTS

| System | Where it lives | Do NOT rebuild |
|---|---|---|
| MagazineNav | Pack 3 | ✋ Wire it, don't rebuild |
| Julius behavior | Pack 4 | ✋ Wire it, don't rebuild |
| VEX proximity audio | Pack 4 | ✋ Wire it, don't rebuild |
| Room specs (all 15) | Pack 7 | ✋ Design locked, build from spec |
| Tier transformation | Pack 7/8 | ✋ Design locked, implement only |
| Global state engine | Pack 8 | ✋ Implement from spec |
| Contracts blueprint | Pack 9 Wiring | ✋ Copy-paste into repo |

---

*Pack Merge Master v1.0 — BerntoutGlobal XXL*

---
---
---

# DATA_MODEL_MASTER.md
## Every Core Entity in the Database

---

## CORE ENTITIES

| Entity | DB Table | Key Fields | Relations |
|---|---|---|---|
| User | `users` | id, email, role, createdAt | → Profile, Subscription, Session |
| ArtistProfile | `artist_profiles` | userId, stageName, slug, rankNumber, momentumScore, tier | → User, Articles, Events |
| FanProfile | `fan_profiles` | userId, displayName, pointsBalance, tier | → User, Follows, FanClubs |
| Article | `articles` | id, artistId, title, slug, status, publishedAt | → ArtistProfile |
| LiveEvent | `live_events` | id, artistId, type, venueId, status, startedAt | → ArtistProfile, Venue |
| Venue | `venues` | id, code, name, tier, capacity | Referenced by LiveEvent |
| ContestRound | `contest_rounds` | id, showType, seasonId, status | → Season, Artists |
| Season | `seasons` | id, number, startDate, endDate, status | → ContestRounds |
| PointsTransaction | `points_transactions` | id, userId, amount, action, eventId | → User |
| Subscription | `subscriptions` | id, userId, tier, status, periodEnd | → User |
| ArtistEarnings | `artist_earnings` | artistId, pendingBalance, totalEarned | → ArtistProfile |
| Payout | `payouts` | id, artistId, amount, status | → ArtistProfile |
| Follow | `follows` | id, fanId, artistId, createdAt | → FanProfile, ArtistProfile |
| FanClubMembership | `fanclub_memberships` | id, fanId, artistId, tier | → FanProfile, ArtistProfile |
| Notification | `notifications` | id, userId, type, read, createdAt | → User |
| ModerationReport | `moderation_reports` | id, reporterId, targetType, targetId, status | → User |
| FraudFlag | `fraud_flags` | id, userId, flagType, confidence, status | → User |
| ArtistClip | `artist_clips` | id, artistId, eventId, status | → LiveEvent |
| OnboardingProgress | `onboarding_progress` | id, userId, userType, completedSteps, percentComplete | → User |
| SponsorCampaign | `sponsor_campaigns` | id, brandName, placementType, status, approvedBy | → User |
| EmergencyBroadcast | `emergency_broadcasts` | id, level, active, triggeredBy | → User |
| WaitlistEntry | `waitlist_entries` | id, fanId, eventId, queuePosition, status | → User, LiveEvent |
| PromoCode | `promo_codes` | id, code, type, usedCount, maxUses, expiresAt, createdBy | → User |

---

## ENTITY RELATIONSHIPS (SIMPLIFIED)

```
User ──── ArtistProfile ──── Articles
                          └── LiveEvents ──── Venue
                          └── ArtistEarnings
                          └── ArtistClips

User ──── FanProfile ──── Follows ──── ArtistProfile
                      └── FanClubMemberships
                      └── PointsTransactions

User ──── Subscription
User ──── Notifications
User ──── ModerationReports
User ──── OnboardingProgress

Season ──── ContestRounds ──── ArtistProfile (competitors)

Admin (User) ──── SponsorCampaigns (approved by)
Admin (User) ──── EmergencyBroadcasts (triggered by)
Admin (User) ──── PromoCodes (created by)
```

---

*Data Model Master v1.0 — BerntoutGlobal XXL*
