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
