# SYSTEM STATE MAP
# TMI Platform — BerntoutGlobal XXL
# Every major system: what exists, what is partial, what is missing, what is locked.

---

## STATUS KEY
- ✅ LOCKED — complete, do not modify
- 🟡 PARTIAL — exists but not fully wired
- 🔴 MISSING — needs to be created
- 🔵 EXPERIMENTAL — exists but not production-ready
- ⚫ DO NOT TOUCH — locked system, hands off

---

## CORE PLATFORM SYSTEMS

| System | Status | Notes |
|---|---|---|
| Auth / Session | ✅ LOCKED | Phase 15.x — middleware.ts, auth/* |
| Onboarding Flow | ✅ LOCKED | Phase 17.3 — onboarding/* |
| RBAC / Role Guards | ✅ LOCKED | Phase 15.x |
| CSRF Protection | ✅ LOCKED | Phase 16.3 |
| Health Module | ✅ LOCKED | Phase 17.5 — /api/healthz, /api/readyz |
| Build Identity | ✅ LOCKED | Phase 17.5 — build hash in health output |
| CI Pipeline | ✅ LOCKED | Phase 17.4 — .github/workflows/ci.yml |
| Rollback Trigger | ✅ LOCKED | Phase 17.2 |
| Readiness Contract | ✅ LOCKED | Phase 16.4 |
| Env Contract Sweep | ✅ LOCKED | Phase 17.0 |
| Deployment Pipeline Gate | ✅ LOCKED | Phase 17.1 |

---

## CONTEST SYSTEM

| System | Status | Notes |
|---|---|---|
| Contest home page | 🟡 PARTIAL | page.tsx exists, needs real data |
| Contest rules page | 🔴 MISSING | Wave B |
| Contest leaderboard page | 🔴 MISSING | Wave B |
| Contest qualify page | 🔴 MISSING | Wave B |
| Contest sponsors page | 🔴 MISSING | Wave B |
| Contest host page | 🔴 MISSING | Wave C |
| Contest admin pages | 🔴 MISSING | Wave C (needs admin/layout.tsx first) |
| Contest admin/reveal page | 🔴 MISSING | Wave C |
| Season pages | 🔴 MISSING | Wave B |
| Archive pages | 🔴 MISSING | Wave B |
| ContestBanner component | 🟡 PARTIAL | Built, needs profile page wiring |
| SponsorProgressCard | 🔴 MISSING | Wave A |
| WinnerRevealPanel | 🟡 PARTIAL | Built single mode, multi-winner needs wiring |
| WinnerLineupStrip | 🔴 MISSING | Wave A |
| WinnerReactionBurst | 🔴 MISSING | Wave A |
| WinnerCameraDirector | 🔴 MISSING | Wave A |
| ContestEntryCard | 🔴 MISSING | Wave A |
| ContestQualificationStatus | 🔴 MISSING | Wave A |
| ContestDiscoveryGrid | 🟡 PARTIAL | Built, needs real data wiring |
| VoteNowPanel | 🟡 PARTIAL | Built, needs API wiring |
| ScoreboardOverlay | 🟡 PARTIAL | Built, needs data wiring |
| ContestProgressBanner | 🔴 MISSING | Wave A |
| ContestRulesCard | 🔴 MISSING | Wave A |
| SeasonCountdownPanel | 🟡 PARTIAL | Built, targets Aug 8 |

---

## SPONSOR SYSTEM

| System | Status | Notes |
|---|---|---|
| SponsorInvitePanel | 🟡 PARTIAL | Built, needs API wiring |
| SponsorPackageTierCard | 🟡 PARTIAL | Built, needs API wiring |
| SponsorContestPanel | 🔴 MISSING | Wave A |
| SponsorProgressCard | 🔴 MISSING | Wave A |
| SponsorBadge | 🔴 MISSING | Wave A |
| SponsorSplashCard | 🔴 MISSING | Wave A |
| SponsorActivationButton | 🔴 MISSING | Wave A |
| StageSponsorOverlay | 🔴 MISSING | Wave F |
| PresentedBySlate | 🔴 MISSING | Wave F |
| SponsorArtistCard | 🔴 MISSING | Wave B |
| SponsorLeaderboard | 🔴 MISSING | Wave F |
| SponsorSpotlightCard | 🔴 MISSING | Wave F |
| SponsorROIAnalytics | 🔴 MISSING | Wave E |
| SponsorPackageSelector | 🔴 MISSING | Wave B |
| Sponsor slot cap enforcement | 🔴 MISSING | Wave D (API) |

---

## HOST SYSTEM (Ray Journey)

| System | Status | Notes |
|---|---|---|
| RayJourneyHost (avatar) | 🟡 PARTIAL | SVG built, needs live cue wiring |
| RayJourneyAvatarSpec | ✅ Done | Design tokens complete |
| HostCuePanel | 🟡 PARTIAL | Built, needs WebSocket wiring |
| SponsorCuePanel | 🔴 MISSING | Wave C |
| PrizeRevealControlPanel | 🔴 MISSING | Wave C |
| HostScriptPanel | 🔴 MISSING | Wave C |
| CoHostHandoffPanel | 🔴 MISSING | Wave C |
| CrowdPromptPanel | 🔴 MISSING | Wave C |
| HostSoundboardPanel | 🔴 MISSING | Wave C |
| HostStageCard | 🔴 MISSING | Wave C |
| Ray Journey live WebSocket | 🔴 MISSING | Future — ElevenLabs/TTS |

---

## GAME ENGINE

| System | Status | Notes |
|---|---|---|
| MysteryBoxReveal | 🔴 MISSING | Wave A |
| SoundClueTrigger | 🔴 MISSING | Wave A |
| AudienceGuessPanel | 🔴 MISSING | Wave A |

---

## API MODULES

| System | Status | Notes |
|---|---|---|
| contest.controller | 🟡 PARTIAL | Endpoints written, auth guards commented |
| contest.service | 🟡 PARTIAL | Methods stubbed with TODO: prisma |
| contest.module | 🟡 PARTIAL | Written, not registered in app.module.ts yet |
| contest.dto | ✅ Done | All DTOs written |
| contest.env.contract | 🔴 MISSING | Wave D |
| contest.permissions | 🔴 MISSING | Wave D |
| winner-reveal.service | 🔴 MISSING | Wave D |
| winner-reveal-config.entity | 🔴 MISSING | Wave D |
| update-reveal-config.dto | 🔴 MISSING | Wave D |
| All entity files | 🔴 MISSING | Wave D |
| Prisma models (10 contest models) | 🔴 MISSING | Wave D (append only) |
| ContestModule in app.module.ts | 🔴 MISSING | Wave D (one import line) |

---

## CONFIG FILES

| System | Status | Notes |
|---|---|---|
| contest.routes.ts | 🔴 MISSING | Wave D |
| reveal.presets.ts | 🔴 MISSING | Wave B |
| feature.flags.ts | 🔴 MISSING | Wave B |
| game.types.ts | 🔴 MISSING | Wave B |
| sponsor.tiers.ts | 🔴 MISSING | Wave B |

---

## TESTING

| System | Status | Notes |
|---|---|---|
| phase13_5 E2E | ✅ LOCKED | Passes with services running |
| phase14_onboarding E2E | ✅ LOCKED | Passes with services running |
| phase15_rbac_boundaries E2E | ✅ LOCKED | Passes |
| phase15_4_api_guards E2E | ✅ LOCKED | Passes |
| phase15_5_artist_admin E2E | ✅ LOCKED | Passes |
| contest.smoke.spec.ts | 🔴 MISSING | Wave E |

---

# BOT ROLES REGISTRY
# All bots that should exist in the TMI ecosystem

---

## REPO / BUILD BOTS

| Bot | Role | Status |
|---|---|---|
| Placement Bot | Checks file paths are correct before wiring | Conceptual — checklist-based |
| Import Repair Bot | Fixes broken imports after file placement | Copilot task |
| Route Guard Bot | Checks admin/layout.tsx guard is in place | Playwright test |
| Schema Append Bot | Ensures Prisma additions are append-only | Manual rule (LOCKED_FILE_TOUCH_RULES.md) |
| Guardrail Bot | Warns before touching locked files | Enforced by humans + this doc |
| Proof Runner Bot | Runs build → readiness → Playwright in order | PowerShell script in SAFE_TERMINAL_COMMANDS.md |
| Rollback Bot | Restores last stable checkpoint | `git stash` + `git checkout 21aa9b2` |
| Freeze Avoidance Bot | Suggests smaller waves when editor is straining | Human judgment + SAFE_WAVE_INSTALL_ORDER.md |
| Phase Gate Bot | Stops wave advancement if current wave proof fails | Human enforcement |

## CONTEST BOTS (already coded in ContestBots.ts)

| Bot | Status |
|---|---|
| ContestQualificationBot | ✅ Coded |
| SponsorVerificationBot | ✅ Coded |
| SponsorMatchBot | ✅ Coded |
| HostScriptBot | ✅ Coded |
| PrizeFulfillmentBot | ✅ Coded |
| ContestAnalyticsBot | ✅ Coded |
| RuleEnforcementBot | ✅ Coded |

## REVEAL / VISUAL BOTS

| Bot | Role | Status |
|---|---|---|
| Reveal Director Bot | Tests reveal sequencing (idle→lineup→group→hero→complete) | Playwright test |
| Camera Rhythm Bot | Tunes shot pacing and preset weights | Admin controls |
| Transition Learning Bot | Tracks favorite transitions per analytics | WinnerRevealService.trackRevealAnalytics() |
| Crowd Energy Bot | Manages hype levels and reaction bursts | WinnerReactionBurst component |
| Voice Chaos Bot | Balances overlapping winner chatter | audioMode config in WinnerRevealConfig |
| Sponsor Overlay Bot | Checks sponsor-safe placement timing | StageSponsorOverlay component |
| Replay Clip Bot | Stores final reveal snapshots | TODO: archive service |

## ANALYTICS BOTS

| Bot | Role | Status |
|---|---|---|
| Contest Analytics Bot | Engagement tracking | ContestAnalyticsBot (coded) |
| Sponsor Analytics Bot | ROI metrics | WinnerRevealService.trackRevealAnalytics() |
| Transition Analyst Bot | Scores reveal transition performance | AdminRevealPage analytics section |
| Visual Drift Bot | Checks neon TMI design alignment | Manual review |
| Archive Bot | Stores replay metadata | TODO: archive service |

---

*BerntoutGlobal XXL | TMI Platform | System State Map + Bot Roles Registry | Phase 19*
