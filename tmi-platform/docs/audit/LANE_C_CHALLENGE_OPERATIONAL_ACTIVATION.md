# Lane C — Challenge Operational Activation

**Signal:** Marcel Dickens — execute Lane C (Challenge first proof of ACGBR)  
**Branch:** `eos/vocal-improv-clean`  
**Date:** 2026-09-02  
**Architecture:** [`ACGBR_ARCHITECTURE_CONTRACT.md`](./ACGBR_ARCHITECTURE_CONTRACT.md)  
**Phase 1 compose baseline:** `3df0dff0` (`composeChallengeProgram` + shell)

---

## DONE / OPEN table

| Item | Status | Evidence |
|------|--------|----------|
| Repo safety (no Avatar Studio overwrite) | **DONE** | Isolated to `lib/acgbr/**`, `lib/challenge/**`, Lane C cert, audit docs, matrix Challenge row |
| ChallengeOperationalLifecycle (19-phase SM) | **DONE** | `apps/web/src/lib/challenge/ChallengeOperationalLifecycle.ts` |
| ChallengePresentationPack (FULL/FAST/RECONNECT/REDUCED_MOTION/LOW_DEVICE) | **DONE** | `ChallengePresentationPack.ts` |
| Judgment policies AUDIENCE_VOTE \| AUTHORIZED_JUDGES \| MEASURABLE_RESULT | **DONE** | Lifecycle + Lane C Gates 5 |
| Result ≠ settlement (PENDING until settle) | **DONE** | `finalizeResult` → PENDING/EXEMPT; `settleResult()` → SETTLED |
| Policy skip ATTEMPT_1_COMPLETE → ATTEMPT_2 or JUDGMENT_OPEN | **DONE** | `resolveNextPhaseAfterAttemptComplete()` · Gate 15 |
| composeChallengeProgram / shell / `/rooms/challenge/[roomId]` | **DONE** | Prior Phase 1 · `3df0dff0` |
| ACGBR contracts + Challenge cinematic/scene/timeline/bridge | **DONE** | `apps/web/src/lib/acgbr/**` |
| Four-face Jumbotron plan (N attempt / S objective+timer / E sponsor / W audience) | **DONE** | `ChallengeJumbotronFacePlan.ts` via `JumbotronFaceTargetRegistry` |
| Live mount applies ACGBR face plan | **DONE** (logic) | `VenueAutomatedJumbotronMount` + `resolveChallengeAcgbrFacePlanForMount` + room `__TMI_CHALLENGE_ACGBR_FACES__` + `/rooms/challenge/[roomId]` mount |
| Universal Player PROGRAM audio authority | **DONE** | Lifecycle `initializeOperationalSources` · Gates 8–9 |
| Automated Lane C cert (Gates 1–16) | **DONE** (logic) | `runLaneCChallengeOperationalCertification.test.ts` |
| ACGBR one-way boundary jest suite | **DONE** (logic) | `lib/acgbr/__tests__/acgbrOneWayBoundary.test.ts` (incl. mount resolver + ShowDirector apply) |
| architectureCert | **DONE** | Pack + compose + ACGBR boundary wired |
| logicCert | **PARTIAL→STRONG** | Lifecycle + ACGBR + compose unit tests |
| **experienceCert (physical Chromium)** | **OPEN** | No browser PASS claimed this session — mount wired; physical LOOK-UP four-face observation still required |
| Neural Generation Foundry / lip-sync | **OUT OF SCOPE** | `NEURAL_GENERATION_UNAVAILABLE` |
| Fake crowd fill | **FORBIDDEN** | Rule 20 |

---

## Frozen Challenge state machine

```
READY → CHALLENGER_ARRIVAL → CHALLENGER_IDENTITY_LOCK → CHALLENGED_ARRIVAL → CHALLENGED_IDENTITY_LOCK
→ OBJECTIVE_CONTRACT_ASSEMBLY → RULES_LOCK → JUDGMENT_POLICY_LOCK
→ ATTEMPT_1_COUNTDOWN → ATTEMPT_1_ACTIVE → ATTEMPT_1_COMPLETE
→ (optional ATTEMPT_2_*) → JUDGMENT_OPEN → RESULT_FINALIZED → SETTLEMENT → RESULT_PRESENTATION → COMPLETE
```

Policy-driven skip: `ATTEMPT_1_COMPLETE` → `ATTEMPT_2_COUNTDOWN` **or** `JUDGMENT_OPEN` when `attemptCount < 2`.

---

## Canonical owners (discovery)

| Concern | Owner |
|---------|--------|
| Routes | `/rooms/challenge/[roomId]`, `/live/challenge/[id]` |
| Session / lifecycle | `ChallengeOperationalLifecycle` |
| Presentation compose | `composeChallengeProgram` (`3df0dff0`) |
| Shell | `ChallengePresentationShell` |
| Pack DNA | `ChallengePack` + `ChallengePresentationPack` |
| ACGBR | `lib/acgbr` |
| Jumbotron faces | `JumbotronFaceTargetRegistry` + `ChallengeJumbotronFacePlan` + live `VenueAutomatedJumbotronMount` |
| Universal Player | `CanonicalUniversalPlayerFabric` |
| Matrix | `TMI_EXPERIENCE_COMPLETION_MATRIX.md` § Challenge |

---

## Visual acceptance (Challenge DNA — not green boxes)

Physical / visual PASS requires observing **Challenge DNA**, not debug chrome:

1. **Center of gravity** = objective / contract card (amber-gold), **not** Battle VS collision corners  
2. **No default DUAL / A_DOMINANT / B_DOMINANT** layouts  
3. Identity panels only for **real** challenger / challenged (never invented opponent)  
4. Result card only when **authorized** result exists; winner id must match a known participant  
5. Stake display exact (`NONE` or real) — never invented prize copy  
6. Settlement UI must not claim “paid” solely because result finalized (`PENDING` ≠ payout)  
7. Jumbotron: four **distinct** face roles during active attempt (not one texture cloned 4×)  
8. Universal Player: one PROGRAM audio authority; ISO/jumbotron mirrors muted  
9. Reconnect resumes mid-phase / mid-scene elapsed — does not replay FULL intro from zero  
10. Reduced motion / LOW device: zero-transition camera, no volumetric premium requirement  

Until a Chromium session records these, **experienceCert stays OPEN**.

---

## How to run automated certs

```bash
# Lane C operational runner (tsx)
cd apps/web
npx tsx src/tests/runLaneCChallengeOperationalCertification.test.ts

# ACGBR boundary jest
npx jest --config jest.config.ts src/lib/acgbr/__tests__/acgbrOneWayBoundary.test.ts

# Existing semantic guards (Challenge compose)
npx jest --config jest.config.ts src/lib/experiencePresentation/__tests__/semanticGuards.test.ts -t Challenge
```

---

## Next step after Challenge

1. Physical Chromium experienceCert on `/rooms/challenge/[roomId]` (LOOK UP Jumbotron — confirm four distinct face roles; record PASS evidence)  
2. Next experience DNA under ACGBR (recommended: deepen Cypher circle presentation **or** Concert stage-forward — do **not** start Avatar Studio overwrite / AdSense-3D)  
3. Keep Generation Foundry neural surfaces OUT OF SCOPE until real assets exist  

### Live Jumbotron face wiring (2026-09-02 assembly)

**DONE (logic):** Challenge room publishes `__TMI_CHALLENGE_ACGBR_FACES__` → `resolveChallengeAcgbrFacePlanForMount` (hook first, else `getActiveChallengeProgram`) → `applyChallengeJumbotronFacePlan` on existing `JumbotronShowDirector.getFaceRegistry()` inside `VenueAutomatedJumbotronMount` (CHALLENGE_ARENA only). Geometry + surface renderer receive the plan for distinct N/E/S/W role tints/strip. P1 ACTIVE_ATTEMPT / RESULT outranks sponsor ads (P4). No second Jumbotron runtime. experienceCert remains **OPEN** until Chromium evidence.

---

## Ratification extension alignment (2026-09-02.2)

Lane C remains Challenge-first proof and must stay aligned with:

- ACGBR global scene-chain taxonomy and bounded autonomous showrunner loop
- Fact-envelope-driven dialogue/lip-sync policy
- World-wide execution scope over canonical world/media systems

Authoritative source:

- `ACGBR_ARCHITECTURE_CONTRACT.md` addendum `2026.09.02.2`

Avatar continuity requirement for downstream Studio/Quick Panel integration:

- Shared canonical draft state
- Same rig and motion/facial runtime path
- Bounded certification loop (`PASS | REGENERATE`) before publication

Authoritative source:

- `AVATAR_PREVIEW_PARITY_LAW.md` parity and certification extensions

This alignment note does not change Lane C status gates.
It locks cross-document consistency for future phases.

---

## Isolation note

Avatar Studio → World work may be dirty on this branch. Lane C touched **only** ACGBR + Challenge paths + Challenge matrix honesty. Do not merge conflicting avatar GLB/studio files into this activation.
