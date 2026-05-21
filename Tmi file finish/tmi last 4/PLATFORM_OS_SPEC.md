# PLATFORM OS SPEC
# TMI Platform — BerntoutGlobal XXL — The Musician's Index
# The master document connecting every subsystem

---

## WHAT THIS PLATFORM IS

The Musician's Index is a live entertainment and creator platform combining:
- a magazine-style content hub
- a contest/talent show engine
- a live room + interview + podcast infrastructure
- a sponsor economy
- a creator economy
- a fan economy
- a shared replay/archive system
- an AI bot orchestration layer
- an admin and operator control plane

Everything connects through shared auth, shared room infrastructure, shared sponsor logic, and shared replay/archive.

---

## PLATFORM MODULES MAP

```
┌─────────────────────────────────────────────────────────────────────┐
│                        THE MUSICIAN'S INDEX                          │
│                        BerntoutGlobal XXL                           │
├─────────────────────┬───────────────────────┬───────────────────────┤
│   CONTENT LAYER     │    LIVE LAYER          │   ECONOMY LAYER       │
│                     │                        │                       │
│  Magazine           │  Live Concert/Show     │  Sponsor System       │
│  Articles           │  Contest Engine        │  Creator Economy      │
│  Highlights         │  Interview Stage       │  Fan Rewards          │
│  Replay Archive     │  Podcast Room          │  Prize System         │
│  Creator Profiles   │  Watch Party           │  Revenue Sharing      │
│  Artist Pages       │  Livestream            │  Tipping/Gifting      │
│  Discovery Hub      │  Premiere Room         │  Sponsor Overlays     │
├─────────────────────┴───────────────────────┴───────────────────────┤
│                       SHARED INFRASTRUCTURE                          │
│                                                                      │
│  Auth / Session (LOCKED Phase 17.5)                                 │
│  Live Room Core (shared base for all live event types)              │
│  Sponsor + Overlay Engine (shared across all surfaces)              │
│  Replay / Archive Pipeline (shared across all event types)          │
│  Notification System                                                 │
│  Analytics + Telemetry                                               │
│  Bot Orchestration Layer (Big Ace / Brian / Nova + department bots)  │
│  Admin Control Plane                                                 │
│  Moderator Tools                                                     │
│  Discovery + Search                                                  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## MODULE CONNECTION MATRIX

| From Module | Connects To | Via | Direction |
|---|---|---|---|
| Contest Engine | Sponsor System | SponsorContribution + package tiers | Both |
| Contest Engine | Live Room Core | Grand Finals live event | Contest uses room |
| Contest Engine | Replay Pipeline | Auto-archive after season | Contest feeds archive |
| Contest Engine | Admin Plane | ContestModule + admin pages | Admin controls contest |
| Interview Stage | Live Room Core | Room type = interview | Interview extends room |
| Interview Stage | Sponsor System | PresentedBySlate + sponsor overlay | Interview shows sponsors |
| Interview Stage | Replay Pipeline | Auto-archive episode | Interview feeds archive |
| Podcast Room | Live Room Core | Room type = podcast | Podcast extends room |
| Watch Party | Live Room Core | Room type = watch_party | Watch party extends room |
| Magazine | Content Layer | Article pages | One-way: content displays |
| Creator Profile | Contest Engine | Contest entry + sponsor tracking | Profile shows contest |
| Creator Profile | Sponsor System | Sponsor discovery | Profile shows sponsors |
| Fan | Contest Engine | Voting system | Fan votes |
| Fan | Live Room Core | Audience mode | Fan watches |
| Replay Archive | All live modules | Auto-snapshot triggers | Archive receives from all |
| Admin Plane | All modules | Admin pages per module | Admin controls all |
| Bot Layer | All modules | Event bus subscriptions | Bots respond to events |

---

## SHARED COMPONENTS (used across 2+ modules)

| Component | Used By |
|---|---|
| `StageSponsorOverlay.tsx` | Contest, Interview, Podcast, Livestream |
| `PresentedBySlate.tsx` | Contest, Interview, Podcast, Premiere |
| `SponsorBadge.tsx` | Contest, Creator Profile, Sponsor Page |
| `SponsorROIAnalytics.tsx` | Contest Admin, Sponsor Dashboard |
| `ReplayPublishPanel.tsx` | Contest Archive, Interview Archive, Podcast Archive |
| `AudienceRequestPanel.tsx` | Interview, Podcast, Watch Party |
| `GuestQueuePanel.tsx` | Interview, Podcast, Watch Party |

---

## MODULES THAT REMAIN SEPARATE

| Module | Why Separate |
|---|---|
| Ray Journey Host System | Contest-specific identity — never reused in interview/podcast |
| WinnerRevealPanel | Contest-specific flow — no overlap with interview/podcast |
| ContestBanner | Artist profile + contest only |
| SeasonCountdownPanel | Contest season timing only |
| Admin layout.tsx | One per module group — contest admin ≠ interview admin |

---

## PLATFORM NAVIGATION MAP

```
/ (homepage + magazine)
├── /contest
│   ├── /contest/qualify
│   ├── /contest/rules
│   ├── /contest/leaderboard
│   ├── /contest/host        ← Ray Journey stage
│   ├── /contest/sponsors
│   ├── /contest/season/[id]
│   ├── /contest/season/[id]/archive
│   └── /contest/admin/**    ← guarded by admin/layout.tsx
│
├── /interviews
│   ├── /interviews (discovery grid)
│   ├── /interviews/[id]     ← live interview room
│   └── /interviews/[id]/replay
│
├── /podcasts
│   ├── /podcasts (discovery grid)
│   ├── /podcasts/[id]       ← podcast room
│   └── /podcasts/[id]/replay
│
├── /watch
│   ├── /watch/[roomId]      ← active watch party room
│   └── /watch/replay/[id]   ← replay room
│
├── /live                    ← livestream discovery + rooms
│   └── /live/[id]
│
├── /creators
│   ├── /creators/[artistId]
│   └── /creators/[artistId]/schedule
│
├── /sponsors
│   ├── /sponsors (discover sponsors)
│   └── /sponsors/dashboard  ← sponsor control panel
│
├── /search
│   └── /search?q=&type=
│
├── /replay
│   ├── /replay (highlights)
│   └── /replay/[clipId]
│
├── /admin/**                ← platform admin (separate from contest admin)
│
└── /auth                   ← login / onboarding (LOCKED Phase 17.5)
```

---

## PLATFORM LIFECYCLE STATES

Every live event (contest round, interview, podcast, watch party) follows one lifecycle:

```
DRAFT → SCHEDULED → PRE_LIVE → LIVE → COOLDOWN → REPLAY_READY → ARCHIVED → PUBLISHED_HIGHLIGHT
```

| State | Description |
|---|---|
| DRAFT | Created, not announced |
| SCHEDULED | Published date/time, registration open |
| PRE_LIVE | Waiting room active, host/guests joining |
| LIVE | Room is live, audience active |
| COOLDOWN | Stream ended, data processing |
| REPLAY_READY | Replay available, clips extractable |
| ARCHIVED | Permanent archive, tagging complete |
| PUBLISHED_HIGHLIGHT | Featured on homepage/discovery |

---

## BOT LAYER — FULL REGISTRY

### Platform OS Bots
| Bot | Role |
|---|---|
| Big Ace | CEO Coordinator — top-level platform oversight |
| Brian | CTO — technical orchestration and monitoring |
| Nova | Creative Director — visual/content governance |

### Contest Bots (coded in ContestBots.ts)
| Bot | Role |
|---|---|
| ContestQualificationBot | Guide artists through qual steps |
| SponsorVerificationBot | Verify sponsor payments |
| SponsorMatchBot | Suggest sponsors to artists |
| HostScriptBot | Generate Ray Journey cues |
| PrizeFulfillmentBot | Track prize delivery |
| ContestAnalyticsBot | Contest engagement analytics |
| RuleEnforcementBot | Anti-abuse + fraud detection |

### Live Room Bots
| Bot | Role |
|---|---|
| Room Lifecycle Bot | Manages state: draft→live→archive |
| Presence Bot | Tracks who is in room + their role |
| Audience Call-Up Bot | Manages guest request queue |
| Watch Party Moderator Bot | Chat + audio moderation |
| Interview Room Bot | Guest queue + question management |
| Podcast Queue Bot | Episode queue + guest scheduling |

### Media & Archive Bots
| Bot | Role |
|---|---|
| Clip Export Bot | Handles recording export requests |
| Replay Archive Bot | Stores + tags replay snapshots |
| Media Rights Bot | Checks export/repost permissions |
| Guest Consent Bot | Manages recording consent state |
| Content Pipeline Bot | Moves content from live → archive → featured |

### Ops & Safety Bots
| Bot | Role |
|---|---|
| Proof Runner Bot | build + readiness + playwright sequence |
| Rollback Bot | Restores last stable state |
| Phase Gate Bot | Blocks wave advancement until proof passes |
| Import Fix Bot | Fixes broken imports after file placement |
| Placement Bot | Validates files went to correct paths |
| Route Guard Bot | Checks admin/layout guards are in place |
| Visual Drift Bot | Checks neon TMI style alignment |
| Moderation Bot | Live chat + audio escalation |
| Security Audit Bot | Permission drift + role escalation checks |
| Schema Guard Bot | Ensures Prisma additions are append-only |

### Analytics Bots
| Bot | Role |
|---|---|
| Transition Analyst Bot | Scores reveal transition performance |
| Notification Bot | Triggers user alerts per event |
| Reward Engine Bot | Processes engagement rewards |
| Discovery Bot | Surfaces trending + featured content |
| Monitoring Bot | Request latency + error tracking |

---

*BerntoutGlobal XXL | TMI Platform | Platform OS Spec | Phase 19*
