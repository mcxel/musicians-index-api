# MASTER SESSION SUMMARY
# TMI Platform — BerntoutGlobal XXL — The Musician's Index
# Complete record of everything built across all planning + coding sessions.
# Use this to brief Copilot, ChatGPT, Gemini, or Blackbox at the start of any session.

---

## PLATFORM IDENTITY

**Platform:** The Musician's Index (TMI)
**Company:** BerntoutGlobal LLC (EIN: 41-3495660)
**Brand:** BerntoutGlobal XXL
**CEO/Owner:** Marcel — Managing Member
**Repo:** `C:\Users\Admin\Documents\BerntoutGlobal XXL\tmi-platform`
**Checkpoint:** `21aa9b2` (Phase 17.5 — LOCKED baseline)
**API:** `:4000` | **Web:** `:3001`
**Stack:** Next.js 14 (pnpm monorepo) + NestJS API + Prisma + PostgreSQL

---

## WHAT HAS BEEN BUILT (ALL SESSIONS COMBINED)

### Phase 15.x — Auth, RBAC, Security (LOCKED)
Full authentication system, role-based access control, CSRF protection, session management. All files locked — DO NOT MODIFY.

### Phase 16.x — Onboarding, CSRF, Rollout (LOCKED)
Onboarding recovery, stale state fix, rollout gate logic, alert dedupe, contract versioning, rollout metrics. All locked.

### Phase 17.x — Env Contract, Pipeline, Health Identity (LOCKED)
Env contract sweep, deployment pipeline gate, rollback trigger, onboarding recovery hardening, CI expansion, build/release identity metadata. Health module at `/api/healthz` + `/api/readyz`. All locked.

---

### Contest System — Drop 1 (Core)
16 files covering:
- `contest.controller.ts` — 25+ API endpoints
- `contest.service.ts` — full business logic + August 8 rule
- `contest.module.ts` — NestJS module
- `contest.dto.ts` — all DTOs
- `ContestBanner.tsx` — artist profile banner
- `SeasonCountdownPanel.tsx` — countdown to August 8
- `SponsorInvitePanel.tsx` — sponsor invite flow
- `SponsorPackageTierCard.tsx` — 7 tier cards
- `HostCuePanel.tsx` — Ray Journey cue panel
- `RayJourneyHost.tsx` — SVG avatar host (6 emotions)
- `RayJourneyAvatarSpec.ts` — avatar spec + script templates
- `page.tsx` — contest home page
- `ContestBots.ts` — 7 contest bots
- `contest.schema.prisma` — 10 Prisma models (append-only)
- `MASTER_MANIFEST.md` — phase manifest
- `COPILOT_WIRING_GUIDE.md` — Copilot context

### Contest System — Drop 2 (Add-On Bundle)
12 combined files (require splitting):
- `ContestComponents.tsx` → 9 split: WinnerRevealPanel (basic), VoteNowPanel, ScoreboardOverlay, ContestDiscoveryGrid, ContestEntryCard, ContestQualificationStatus, ContestRulesCard, ContestProgressBanner, SponsorProgressCard
- `HostComponents.tsx` → 7 split: SponsorCuePanel, PrizeRevealControlPanel, HostScriptPanel, CoHostHandoffPanel, CrowdPromptPanel, HostSoundboardPanel, HostStageCard
- `SponsorComponents.tsx` → 8 split: SponsorBadge, SponsorSplashCard, SponsorActivationButton, StageSponsorOverlay, PresentedBySlate, SponsorArtistCard, SponsorSpotlightCard, SponsorPackageSelector
- `GameComponents.tsx` → 3 split: MysteryBoxReveal, SoundClueTrigger, AudienceGuessPanel
- `ContestPages.ts` → 9 page files (qualify, rules, leaderboard, host, admin, admin/layout.tsx, season/[id], archive, sponsors)
- `ContestEntities.ts` → 8 split: 6 entity classes, contest.env.contract, CONTEST_PERMISSIONS
- `SponsorContestPanel.tsx` — standalone component
- `SponsorROIAnalytics.tsx` — ROI analytics + leaderboard
- `contest.smoke.spec.ts` — Playwright E2E smoke test
- `FILE_PLACEMENT_GUIDE.md` — split instructions
- `CHATGPT_SEQUENCING_BRIEF.md` — ChatGPT briefing doc
- `GEMINI_AUDIT_BRIEF.md` — Gemini audit instructions

### Contest System — Drop 3 (Control Layer + Multi-Winner Reveal)
12 files — all pre-split, one per final path:
- `WinnerRevealPanel.tsx` — SUPERSEDES Drop 2 version — full multi-winner (1–10, 3 modes, group hold, hero zoom)
- `WinnerLineupStrip.tsx` — Winner lineup + WinnerReactionBurst
- `WinnerCameraDirector.tsx` — Adaptive camera preset system with audit log
- `admin-reveal-page.tsx` — Admin reveal controls page
- `reveal.presets.ts` — 8 camera presets + 6 transitions (single source of truth)
- `feature.flags.ts` — contains feature.flags + game.types + sponsor.tiers (split into 3 files)
- `winner-reveal.service.ts` — contains entity + DTO + full NestJS service
- `SAFE_WAVE_INSTALL_ORDER.md` — 5-wave install order with proofs
- `LOCKED_FILE_TOUCH_RULES.md` — 3 rules, locked file list, safe terminal commands
- `PROGRAM_SUCCESS_CRITERIA.md` — what "done" means per system
- `MULTI_WINNER_REVEAL_SPEC.md` — full reveal system spec
- `SYSTEM_STATE_MAP.md` — every system: ✅LOCKED/🟡PARTIAL/🔴MISSING + bot registry

### Install Control Layer
10 files covering all 3 drops:
- `CONTEST_DROP_MASTER_MATRIX.md` — collision prevention + which version wins per file
- `IMPORT_FIX_MATRIX.md` — corrected imports for every file in all 3 drops
- `INSTALL_MATRIX.md` — 7-wave install order (V1)
- `admin/layout.tsx` — critical admin route guard (pre-split)
- `SponsorProgressCard.tsx` — pre-split component
- `contest.routes.ts` — route constants (single source of truth)
- `contest.env.contract.ts` — August 8 enforcement + env validation
- `contest.permissions.ts` — 20+ actions × 6 roles permission map
- `all-entities.ts` — 6 entity classes (split into individual files)
- `winner-reveal-config.prisma` — 2 extra Prisma models for Drop 3

### Platform OS Layer
8 files:
- `INSTALL_MATRIX_V2.md` — corrected Wave 5/6 safety (CHECK THEN CREATE, MERGE AFTER REVIEW)
- `REPO_INVENTORY_AND_PROOF_GATE.md` — Wave 4.5 inventory + schema checklist + runtime proof gate
- `PLATFORM_OS_SPEC.md` — master platform architecture diagram + all module connections + bot registry
- `PLATFORM_COMPLETENESS_CHECKLIST.md` — master "are we done" document with checkboxes per phase
- `LIVE_ROOM_CORE_SPEC.md` — shared live room foundation + interview/podcast specs + recording flow
- `INTERACTIVE_MEDIA_EXPANSION_MATRIX.md` — capability matrix + wave order + media rights rules
- `InterviewStage.tsx` — interview room component (Wave 8 — after contest minimum complete)
- `WatchPartyPanel.tsx` — watch party + GuestQueuePanel (Wave 8)

### Phase 18 — Operator Layer (This Session)
7 files covering upload + onboarding:
- `PHASE18_RESTORE.ps1` — one-command local session restore
- `PHASE18_PROOF_GATE.ps1` — pre-upload proof gate (exits 0 or 1)
- `PHASE18_SMOKE_PACK.ps1` — evidence capture script
- `DEPLOYMENT_RUNBOOK.md` — exact deploy steps for Render + Vercel + Cloudflare + IONOS
- `ROLLBACK_RUNBOOK.md` — 3-level rollback (soft/wave/hard + production rollback)
- `OPERATOR_SHEET.md` — one-page printable quick reference
- `UPLOAD_TODAY_CHECKLIST.md` — A→J phases for going live today
- `FIRST_MEMBER_ONBOARDING.md` — admin + artist + sponsor + fan + season setup
- `FINAL_ENV_CHECKLIST.md` — every env var for local + Render + Vercel
- `MASTER_SESSION_SUMMARY.md` — this file

---

## TOTAL FILES CREATED (ALL SESSIONS)

| Session | Files | Status |
|---|---|---|
| Drop 1 (Core contest) | 16 | Ready to place |
| Drop 2 (Add-on bundle) | 12 (split into ~40) | Ready to place |
| Drop 3 (Control layer) | 12 | Ready to place |
| Install control | 10 | Ready to place |
| Platform OS | 8 | Ready to place |
| Phase 18 (Upload/Ops) | 10 | Ready to place |
| **Total** | **~68 files** | |

---

## KEY RULES — ALWAYS ENFORCE

1. **August 8 registration rule** — contest opens August 8 every year. Non-negotiable.
2. **Sponsor requirements** — 10 local + 10 major = 20 to qualify. Non-negotiable.
3. **Never paste prose into PowerShell** — "Enter : not recognized" = chat text pasted.
4. **Proof gate before upload** — `PHASE18_PROOF_GATE.ps1` must exit 0.
5. **Wave order** — UI → config → pages → API → Prisma → tests. Never reverse.
6. **Prisma is append-only** — never replace schema.prisma.
7. **app.module.ts** — add 1 import line only.
8. **Do not touch locked files** — middleware.ts, auth/*, onboarding/*, ci.yml, health/*.
9. **Drop 3 WinnerRevealPanel wins** — supersedes Drop 2 basic version.
10. **Contest minimum complete before interview/podcast/watch-party** — Wave 8+ waits.

---

## CONTEST SPONSOR TIERS

| Tier | Price | Type |
|---|---|---|
| Local Bronze | $50 | local |
| Local Silver | $100 | local |
| Local Gold | $250 | local |
| Major Bronze | $1,000 | major |
| Major Silver | $5,000 | major |
| Major Gold | $10,000 | major |
| Title Sponsor | $25,000+ | major |

---

## BOT LEADERSHIP

**Big Ace** — CEO Coordinator
**Brian** — CTO
**Nova** — Creative Director

Plus 35+ department bots (see PLATFORM_OS_SPEC.md → BOT LAYER)

---

*BerntoutGlobal XXL | TMI Platform | Master Session Summary | Phase 18 Complete*
