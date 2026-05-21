# AI_WORKFLOW_GUIDE.md
## The Correct AI Team Workflow — Who Does What and When
### BerntoutGlobal XXL / The Musician's Index

---

## THE TEAM

```
Claude      → Large scaffolds, file generation, architecture docs
Blackbox    → Repo integration, folder structure, file placement
Copilot     → Wiring imports, linking systems, small fixes, API connections
Gemini      → Audits, build errors, runtime errors, test verification
ChatGPT     → Architecture, system design, chain planning
You         → Visual testing, flow testing, decisions
```

---

## THE CORRECT BUILD ORDER (every time you add a system)

```
Step 1: ChatGPT  → Design the system / chain
Step 2: Claude   → Generate scaffold files (clean, compilable)
Step 3: Blackbox → Drop scaffold files into correct repo paths
Step 4: Copilot  → Wire routes, imports, API calls, navigation
Step 5: Gemini   → Audit build + runtime + tests
Step 6: You      → Visual check in browser
Step 7: Repeat   → Move to next system
```

Never skip steps. Never merge broken slices with new work.

---

## CLAUDE'S JOB

Claude generates:
- Clean, compilable scaffold files (like this pack)
- Architecture docs and system specs
- API contracts, Prisma models, state machines
- Bot specs and pipeline definitions
- Copy-paste prompts for other AI tools

Claude does NOT:
- Touch the repo directly
- Guess existing file paths without docs
- Add code after Copilot has already wired something

---

## BLACKBOX'S JOB

Blackbox is best at:
- Dropping scaffold files into correct repo locations
- Fixing file corruption (delete + recreate)
- Creating folder structures
- Connecting modules to app router
- Ensuring project compiles

Blackbox does NOT:
- Architecture decisions
- Complex wiring logic
- API contract decisions
- Audit/testing

---

## COPILOT'S JOB

Copilot wires:
- Navigation buttons and links
- Form submissions to API endpoints
- Dashboard data loading (useEffect / React Query)
- Auth guards (middleware + redirect)
- Import paths between components
- WebSocket connections
- Stripe payment flows

Copilot does NOT:
- Create new architecture
- Decide what pages to build
- Audit builds or find runtime errors

---

## GEMINI'S JOB

Gemini audits:
- TypeScript errors
- Runtime errors
- Missing imports
- Provider duplicates
- Route conflicts
- Build failures
- Test results
- Discovery-first sort verification

---

## THE PLATFORM BUILD ORDER

Build systems in this sequence:

```
Phase 1 (Core):
  Auth → Onboarding → Dashboard → Profile → Article → Magazine

Phase 2 (Live Platform):
  Stations → Lobby → Live → Clips → Archive → Contest

Phase 3 (Monetization):
  Sponsors → Advertisers → Ads → Earnings → Coaching → Local Business

Phase 4 (Visual Systems):
  Scenes → Backgrounds → Display → Audio → Video

Phase 5 (Future — scaffold only):
  Creator Store → Checkout → Licensing → Fraud/Risk

Phase 6 (Automation):
  Bots → Workers → Pipelines → Analytics → Notifications
```

---

## THE MOST IMPORTANT CHAINS

```
Chain 1: signup → onboarding → dashboard → profile → article → station
Chain 2: article → magazine → discovery → trending → station → live → clips
Chain 3: sponsor → artist → promo task → earnings panel → coaching note → renewal
Chain 4: contest → entry → vote → leaderboard → winner → article → station
Chain 5: station → live → replay → clip → share (Twitch/YouTube/etc.)
```

---

## NEVER BREAK THESE RULES

```
1. pnpm test:discovery MUST pass — 0 viewers = position 1 in lobby
2. Diamond: Marcel Dickens + BJ M Beat's — permanent, verified every 4h
3. Kids talk only to kids (canSendMessage middleware)
4. Max 8 tickets per buyer per event
5. ONE AudioProvider, ONE SharedPreviewProvider, ONE TurnQueueProvider
6. Owner payouts from net profit only (never gross)
7. TMI visual identity: #0D0520 bg, Bebas Neue, cyan/gold/pink
8. GET /api/ads/slot/:id ALWAYS returns 200 (never blank)
9. Party persists when members enter/exit rooms
10. Article pages ALWAYS link to artist station
11. Use "Stations" not "Channels" in all public UI
12. No system should break another system — isolated modules only
```

---

## PLATFORM STATS

- 73 documents across Packs 25-30 (architecture layer)
- 104 scaffold files in Pack 31 (implementation layer)
- 130+ routes defined
- 60+ components planned
- 9-slice wiring order (Pack 29)
- 8-tier smoke test matrix (Pack 27)

*BerntoutGlobal LLC — "This is your stage, be original."*
