# TMI Platform — AGENTS Instruction File
# The Musician's Index | BernoutGlobal LLC
# Last updated: 2026-04-26

## NON-NEGOTIABLES FOR ALL AI AGENTS

These rules apply to every AI tool working in this repo: Claude, Copilot, Gemini, CodeGPT, BlackBox.

### 1. ASSEMBLY ONLY — DO NOT BUILD NEW SYSTEMS
Everything is already built. Your job is to:
- Connect existing files
- Wire existing components to existing routes
- Fix imports and exports
- Create minimal glue files when something is missing
- NEVER redesign, NEVER architect from scratch

### 2. TMI VISUAL CANON IS LAW
The TMI PDF designs and converted image assets are the visual truth.
- Do not change colors, layouts, or design choices without explicit approval
- Neon palette: cyan (#00FFFF), fuchsia (#FF2DAA), gold (#FFD700), purple (#AA2DFF)
- Background: deep space (#050510 / #06070d)
- Magazine-shell homepage is the permanent structural frame — do not remove

### 3. REVENUE PATHS ARE ALWAYS PRIORITY 1
If two things need doing, always do the money path first:
- Subscriptions → Stripe → wallet
- Tips → Stripe → artist wallet
- Sponsor placements → Stripe → placement engine
- Advertiser slots → Stripe → ad rotation
- Booking fees → Stripe → revenue ledger

### 4. DO NOT BREAK THE BUILD
- Run `pnpm typecheck` before calling any task done
- Never add code that introduces TS errors to files that were previously clean
- Never delete files without explicit instruction
- If in doubt, create a new file rather than overwrite

### 5. ROUTE INTEGRITY
- Every button, link, chevron, and card must have a real destination
- Dead routes (`href="/"` on something that should go elsewhere) are bugs
- `/coming-soon` is acceptable as a placeholder for Phase 2 items
- Never leave `href="#"` in production code

### 6. BOT SAFETY CONTRACT
- All bots must use `botTransparencyPolicy.ts`
- All bots labeled as bots — NO human impersonation ever
- Public rooms only unless forced by policy escalation
- No real money transfers from bots
- All bot actions logged in `permanentBotOperationsEngine.ts`

### 7. DO NOT SCATTER
Each AI has one lane:
- **Claude Code**: repo-wide assembly, multi-file wiring, missing glue files
- **Copilot**: fix exact TypeScript/import errors only
- **CodeGPT**: generate visual-only shells for new missing pages
- **Gemini**: audit/verify routes, PASS/FAIL only, no code writing
- **BlackBox**: locked one-pass bulk tasks with explicit scope only

### 8. THE ONE REASON RULE (PRODUCT COHERENCE)
Every homepage must be describable in one sentence. If a new visitor cannot explain what a page is for in 5 seconds, the page fails certification.
- **Home 1**: Join the network. *(Recruitment, Crown Holder, Discovery, Sign Up)*
- **Home 1-2**: Discover who's winning. *(Charts, Rankings, Rising Artists)*
- **Home 2**: Read the magazine. *(Articles, Interviews, News)*
- **Home 3**: Watch live. *(Live rooms, Upcoming shows, Audience wall)*
- **Home 4**: Buy, advertise, sponsor. *(Ads, Sponsors, Tickets, Marketplace)*
- **Home 5**: Compete and win. *(Battles, Challenges, Cyphers, Belts)*

### 9. AUDIT ORDER: COHERENCE THEN CLOSURE
Before writing any code or wiring a module, you must perform two audits in this exact order:
1. **Priority -2: Product Coherence Audit**: Does this page obey the "One Reason Rule"? Remove or relocate any module that violates the page's core identity.
2. **Priority -1: Loop Closure Audit**: Verify the data path (Database → API → Context Provider → Component Props → UI). No visual shells without data binding.

### 10. CENTRAL SERVICE REGISTRY
Every component belongs to ONE of these engines. Do not mix pieces blindly:
- **Broadcast Engine**: Lobby walls, rotations, live tiles
- **Media Engine**: WebRTC, video capture, streams
- **Ranking Engine**: Charts, crowns, divisions
- **Battle Engine**: Challenges, belts, trophies
- **Revenue Engine**: Stripe, ads, tickets, sponsors
- **Magazine Engine**: Articles, news, interviews
- **Profile Engine**: Fans, performers, venues
- **Admin Engine**: KPI dashboard, analytics
- **Notification Engine**: Email, alerts, messaging
- **Automation Engine**: Bots, maintenance agents

---

## PACKAGE STRUCTURE

```
tmi-platform/
  apps/
    web/          ← Main TMI platform (Next.js 14, App Router)
    api/          ← NestJS backend API
    bernoutglobal-llc/ ← Corporate ops layer
  packages/
    contracts/    ← Shared type contracts (FIXED — build passing)
    db/           ← Prisma database layer
    ui/           ← Shared UI components
    shared/       ← Shared utilities
    core-domain/  ← Domain models
    module-runtime/ ← Module runtime (FIXED)
    hud-core/     ← HUD core engine
    rewards/      ← Rewards system
```

## CRITICAL FILES

| File | Purpose |
|------|---------|
| `apps/web/src/middleware.ts` | Auth gating — protect all role-specific routes |
| `apps/web/src/lib/auth/adapter.ts` | NextAuth Prisma adapter |
| `apps/web/src/lib/auth/session.ts` | Session management helpers |
| `apps/web/src/lib/auth/roles.ts` | Role → permission matrix |
| `apps/web/src/lib/stripe/client.ts` | Stripe client factory |
| `apps/web/src/lib/stripe/products.ts` | Product + price ID constants |
| `apps/web/src/lib/bots/botDutyRegistry.ts` | Bot duties and registry |
| `apps/web/src/lib/bots/permanentBotOperationsEngine.ts` | Bot operations engine |
| `apps/web/src/artifacts/homepages/homepageArtifactRegistry.ts` | Homepage artifact map |

## ENVIRONMENT VARIABLES NEEDED

```env
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PUBLISHABLE_KEY=pk_...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://themusiciansindex.com
NEXT_PUBLIC_API_URL=https://tmi-api.themusiciansindex.com
DATABASE_URL=...
```

## COMPLETION TARGETS

| System | Target |
|--------|--------|
| Auth activation | 100% |
| Stripe revenue paths | 100% |
| Homepage 1–5 visual | 100% |
| Admin hub | 100% |
| Bot minimum stack (62 bots) | 100% |
| Onboarding flows all 6 roles | 100% |
| Magazine Issue 1 | 100% |
| Profile generation | 100% |

---

## 11. BERNOUTGLOBAL EXECUTIVE HIERARCHY & MEMORY CANON

### Executive Split of Authority
- **Big Ace**: Group CEO and parent executive intelligence for the entire BerntoutGlobal portfolio. Governs macro strategy, financial health, risk evaluation, and cross-company integration. Never participates in low-level page-specific components directly.
- **Michael Charlie**: President and General Manager of TMI (The Musician's Index). Direct manager of TMI rooms, match history, user counters, and visual templates. Reports key summaries up to Big Ace.

### Memory Boundaries
- Do not mingle executive knowledge bases. Big Ace has the `Enterprise Umbrella Memory Spine` covering all company registries. Michael Charlie has the `TMI Memory Vault` covering local competition data.
- Both executives must support local procedural execution (RAG + offline templates) to maintain operations if external APIs are unavailable.

---

## 13. TMI ANTI-BLOAT LAW, CERTIFICATION LAW & MASTER ACCEPTANCE TEMPLATES

### TMI Anti-Bloat Law (Permanent Repo Law)
> **TMI should grow by evolving canonical master files and registries, not by endlessly creating new files, duplicate logs, temporary variants, and binary dumps.**

```text
CONSOLIDATE BEFORE CREATE.
REFERENCE BEFORE COPY.
PROMOTE BEFORE COMMIT.
OPTIMIZE BEFORE STORE.
REGISTER BEFORE DUPLICATE.
MASTER FILES EVOLVE IN PLACE.
LARGE BINARIES STAY OUT OF GIT.
TEMPORARY OUTPUT STAYS OUT OF GIT.
GIT IS SOURCE HISTORY, NOT A FILE WAREHOUSE.
```

### The 5-Point File Creation Test
Before creating ANY new file, every AI agent must evaluate:
1. **Does a canonical file already own this responsibility?**
2. **Can this be added to an existing registry/runtime/master ledger?**
3. **Is this temporary output that belongs in `.gitignore`?**
4. **Is this a large binary that belongs outside Git?**
5. **Is this actually a distinct module with a durable responsibility?**
*Only if #5 is genuinely true should a new permanent file be created.*

### Asset & Memory Management Laws
- **Durable Authorities**: Merge discoveries into master files (`MASTER_PROJECT_MEMORY`, `MASTER_CERTIFICATION_LEDGER`, `MASTER_ARCHITECTURE_REGISTRY`, `MASTER_ASSET_REGISTRY`, `MASTER_ROUTE_REGISTRY`) rather than creating temporary handoff files.
- **Large Binary References**: Keep heavy reference handoffs (`TMI-Mobile-Handoff-v2/`, `.zip` archives, `Profiles/`, `Sounds Pack/`, `Yopho Bases/`) locally on disk in `.gitignore`. Promote ONLY individual optimized production assets into canonical app paths.
- **No Duplicate Copies**: Reference single canonical asset IDs across all components.
- **Never Broad `git add -A`**: Identify, classify, and promote files intentionally.

---

### Certification Law
```text
CODE EXISTS ≠ FEATURE CERTIFIED
AUTOMATED TEST PASSES ≠ PHYSICAL CERTIFICATION
PHYSICAL PASS = exact required behavior observed on real device/runtime without hidden workarounds.
If a physical test FAILS: record exact failing step first, then modify ONLY the failing execution path. Do not redesign frozen architecture.
```

---

### Universal Acceptance Template

```text
ACCEPTANCE TEMPLATE

STATUS:
⏳ OPEN / 🟡 BLOCKED / 🔴 FAIL / 🟢 PASS

DEVICE:
<desktop / phone / tablet / console / headset>

DEVICE MODEL:
<exact model if physical certification>

OS:
<Windows / iOS / Android / etc.>

BROWSER:
<Chrome / Safari / Edge / Firefox + version if known>

BUILD / SHA:
<exact candidate commit or deployed build>

ROUTE:
<exact URL / roomId>

MODULE / GATE:
<module name>

TEST STEP:
<exact numbered step>

EXPECTED:
<what should have happened>

ACTUALLY OBSERVED:
<only what was physically visible/heard>

AUDIO CONTINUITY:
PASS / FAIL / N/A

VIDEO / WEBRTC CONTINUITY:
PASS / FAIL / N/A

ROOM ID / SESSION CONTINUITY:
PASS / FAIL / N/A

PLAYER STATE PRESERVED:
PASS / FAIL / N/A

LAYOUT / COLLISION:
PASS / FAIL / N/A

CONSOLE / NETWORK ERROR:
<exact error if captured>

SCREENSHOT / RECORDING:
<attached evidence>

FINAL RESULT:
🟢 PASS
or
🔴 FAIL AT STEP <n>

FOLLOW-UP RULE:
If FAIL, patch only the observed failing execution path.
Do not redesign frozen architecture.
```

