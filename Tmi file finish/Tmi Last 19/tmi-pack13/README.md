# TMI PACK 13 — IMPLEMENTATION HELPERS
## The Final Practical Layer — Everything Copilot Needs to Wire Immediately

---

## SLOGAN: "This is your stage, be original."

---

## WHAT THIS PACK IS

Pack 12 completed the control and evolution layer.
Pack 13 is the last practical convenience layer.

Not more theory. Not more design.
Just five files that make Copilot faster and prevent wiring mistakes.

---

## FILES IN THIS PACK

### `env-keys/ENV_TEMPLATE_AND_KEYS_MAP.md`
**Every environment variable the platform needs.**

Complete `.env.local` template for `apps/web` and `.env` template for `apps/api`. Every variable has: which app uses it, dev/staging/prod source, and a severity chart showing what breaks if it's missing.

Critical variables and their severity:
- `DATABASE_URL` → 🔴 CRITICAL (app fails to start)
- `NEXTAUTH_SECRET` → 🔴 CRITICAL (all auth broken)
- `STRIPE_SECRET_KEY` → 🟠 HIGH (billing broken)
- `REDIS_URL` → 🟠 HIGH (live sync degrades)
- `ELEVENLABS_API_KEY` → 🟢 LOW (broadcaster silent, graceful fallback)

Production additions for Cloudflare Pages: replace localhost URLs, set NODE_ENV=production, configure R2 storage, enable Resend email.

---

### `starter-manifests/STARTER_MANIFEST_FILES.ts`
**Copy-paste starter config files so Copilot doesn't invent incompatible shapes.**

Contains ready-to-use TypeScript config for:
- `homepage-belts.config.ts` — belt registry for all 3 homepages with section IDs
- `motion.tokens.ts` — all animation constants centralized (page flip 400ms, card hover scale 1.05, crown portrait 6 seconds, VHS scanline 0.03)
- `crown.config.ts` — rotation week limit 8, cooldown 4 weeks, score weights (streams 30%, points 25%, cypher wins 20%, fan votes 15%, watch time 10%), yearly award thresholds
- `discovery.config.ts` — `sortOrder: 'viewers_ascending'` locked, algorithm weights, lobby refresh every 15 seconds
- `sponsor-rules.config.ts` — 60 seconds between ads, banned moments array (winner-reveal, crown-transfer, tier-upgrade), allowed placements per page, no autoplay audio ever
- `crown-bot.manifest.json` — full bot manifest template with schedule, permissions, fallback, logging, Big Ace override field
- `homepage-card-data.example.ts` — shape of crown card, artist ring entry, preview lobby entry, comic insert, issue summary
- `feature-flags.ts` — all 20 feature flags with Phase 1 enabled (homepage, magazine, crown, discovery, stream & win) and Phase 2–4 disabled

---

### `types-contracts/TYPES_AND_CONTRACTS_STARTER.ts`
**All TypeScript interfaces — ready to paste into `packages/contracts/src/`.**

Interfaces defined:
- `XY`, `CanvasCardConfig`, `HomepageBeltConfig`, `HomepageLayoutPersistence` — canvas/card system
- `CrownState`, `ArtistRankEntry`, `CrownHistory`, `ComicInsert` — crown system
- `PreviewLobbyEntry`, `LobbyWallSort` (with `sortedBy: 'viewers_ascending'` immutable field), `WorldPremiereEvent` — live system
- `IssueSummary`, `ArticleSummary` — magazine system
- `SponsorPlacementSurface`, `SponsorPresentation` (with `hasAudio: false` typed as literal false) — sponsor system
- `FanTierLevel`, `FanTierStatus`, `ArtistFanStats` — fan system
- `BotManifest`, `BotRunLog` — bot system
- `ExperimentRecord` (with `rollbackIn5Minutes: true` typed as literal true) — experiment system
- `LayoutPersistencePayload`, `UserHomepageLayout` — layout persistence

---

### `execution/SLICE0_DONE_DEPENDENCIES.md`
**Three documents:**

**SLICE_0_EXECUTION_CHECKLIST:**
9-step checklist: diagnose Cloudflare error → apply Fix A (prebuild script) + Fix B (transpilePackages) + Fix C (stub HUD page) simultaneously → verify local package builds (PowerShell commands) → verify local web build → commit and push → verify GitHub CI green → verify Cloudflare deploy green → smoke test live URLs (/, /register, /login → 200) → confirm env vars in Cloudflare. 8 required screenshots before Slice 0 is declared done.

**DEFINITION_OF_DONE_MASTER:**
12 requirements every feature must pass before it counts as done: builds, route works, auth correct, real data, fallback exists, logging works, proof gate passed, mobile works, editable by Copilot, design matches, role-gated correctly, recovery state. Shortened 8-question daily checklist for PRs.

**DEPENDENCY_RISK_MAP:**
Safe dependencies (use freely): Next.js, React, TypeScript, Prisma, NextAuth, Stripe, framer-motion, react-draggable, Tailwind, zod. Use with caution (evaluate first): Three.js, TensorFlow.js, MediaPipe, socket.io, ElevenLabs SDK. Avoid unless needed: moment.js, lodash full, any unvetted UI library. Rollback substitutes for every risky dependency.

---

### `prompts/COPILOT_PROMPT_PACK.md`
**Paste-ready prompts for every wiring slice.**

8 complete Copilot prompts:
- **Slice 0**: Fix @tmi/hud-runtime with all 3 fixes, local proof commands, report format
- **Slice 1**: Wire shared infrastructure (motion tokens, configs, CanvasCard, Header, PageStrip, CornerPeel)
- **Slice 2**: Wire Homepage 1 crown system with API stubs, fallbacks, proof gate
- **Slice 3**: Wire Homepage 2 live world — includes explicit instruction that LobbyWall MUST sort viewers_ascending
- **Slice 4**: Wire Homepage 3 editorial including sponsor fallback enforcement
- **Slice 5**: Wire auth + onboarding with all 12 proof steps
- **Slice 6**: Wire economy/points/billing
- **Slice 7**: Wire social/follow/search/discovery
- **Final Proof**: Pre-launch checklist with 10 required screenshots before members are invited

---

## THE COMPLETE 13-PACK SYSTEM

| Pack | Core Contents |
|---|---|
| 1–3 | Components + magazine navigation |
| 4–5 | Cast system |
| 6–7 | Live events + 15 rooms |
| 8 | System integrity |
| 9 + 9-W | Product layer + wiring handoff |
| 10 | Deploy + onboarding + completion boards |
| 11 | Three homepages + crown + avatar + broadcaster |
| 12 | Control + learning + evolution + wiring slices |
| **13** | **ENV map + starter configs + types + Slice 0 checklist + Copilot prompts** |

---

## THE CHAIN OF COMMAND (PERMANENT)

```
VISION:      Marcel Dickens (analytics, suggestions)
CONTROL:     Big Ace (authority, approval, override)
DESIGN:      Claude (specs, types, configs, architecture)
EXECUTION:   Copilot (real repo code, wiring, tests)
AUTOMATION:  25 bots (crown, discovery, archive, safety, economy)
MEASUREMENT: Logging + weekly/monthly review bots
EVOLUTION:   Experiment Bot + Algorithm (within frozen boundaries)
PLATFORM:    Mainframe governs, Framework builds, Algorithm adapts
```

---

## THE PLATFORM LAWS (PERMANENT — NEVER BREAK)

1. Discovery-first: highest rank# shown first, least viewers in position 1
2. Crown rotation: 8 weeks max, 4-week cooldown
3. Magazine identity: music-first, editorial, page-flip navigation
4. Design DNA: neon/HUD/80s visual language — OR BETTER only
5. No pay-for-rank without disclosure
6. Sponsors never cover artists or appear at crown/winner moments
7. Big Ace controls all strategic overrides
8. Marcel analytics + suggestions only; Jay Paul view only
9. Every experiment must be reversible in 5 minutes
10. The platform never shows a blank page or crashes

---

## NEXT ACTION

```
PASTE THIS TO COPILOT (Slice 0 prompt from COPILOT_PROMPT_PACK.md)

Then work through Slices 1–Final in order.
One slice at a time. Prove each. Then next.

ACTIVE BLOCKER: Cloudflare build error
WHAT TO PASTE: First 30–50 lines of Cloudflare error log
GitHub CI: ✅ GREEN (commit 3a81795)
```

---

## PLANNING IS COMPLETE.

13 packs. 150+ documents. Every room, show, host, bot, route, component,
contract, config, proof gate, fallback, and evolution rule designed.

Now it's Copilot's turn.

**"This is your stage, be original."**

---

*Pack 13 — Implementation Helpers v1.0*
*BerntoutGlobal XXL / The Musician's Index*
