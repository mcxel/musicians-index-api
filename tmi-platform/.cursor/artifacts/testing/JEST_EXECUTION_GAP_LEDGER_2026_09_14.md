# Jest Execution-Gap Ledger — 2026-09-14

**Scope honesty**: this is a documentation/audit artifact only. No test files were modified to produce this ledger, and no files were converted from Category A/B/C to a working Jest suite — that is deliberate, explicit follow-up work, not done here. All 58 zero-collection files were classified by reading their content (invocation pattern + failure-signal pattern), not by guessing from filenames.

**Core distinction this ledger exists to preserve**: *"Jest found the file"* is not the same claim as *"Jest executed a meaningful test."* A `.test.ts` filename sitting in `src/tests/` is not certification by itself — several of the files below only print to the console or are never invoked at all, meaning no prior "PASS" claim that cited them as evidence was actually backed by an executed assertion.

## Ground truth (from an actual `npx jest --config jest.config.js src/tests` run, not static inspection)

```
TOTAL_DISCOVERED_TEST_FILES   = 93
REAL_JEST_COLLECTION          = 35
ZERO_TEST_COLLECTION          = 58
CURRENT_PASSING_SUITES        = 26
CURRENT_FAILING_REAL_SUITES   = 7   (27 individual failing test cases across those 7 files)
```

`jest.config.js` was checked directly: no custom `testMatch`, no project-boundary restriction, no unusual `testPathIgnorePatterns` beyond the standard `.next/` and `node_modules/`. **Root cause is 100% content, not configuration** — every one of the 58 files is discovered correctly by the standard `.test.ts` naming convention; none of them use Jest's `describe`/`test`/`it` API anywhere in the file. They are a legacy "plain script certification" pattern (predating this repo's move to Jest for this directory) that happens to share the same file-naming convention as real Jest suites, which is exactly what makes a `.test.ts` filename here an unreliable signal on its own.

## Classification methodology

For each of the 58 files: checked for (1) a module-scope invocation of the file's own test function — either unconditional (`fnName();` at top level) or gated behind `require.main === module`, and (2) a real failure signal — `throw new Error(...)` or `process.exit(...)`/`process.exitCode = 1`. Risk is assessed from filename/content semantics (does it protect safety, money, or entitlement logic vs. a smaller UI/interaction demo) — this is a judgment call stated as such, not a full downstream product-impact audit of all 58 files' call sites.

---

## Category totals

```
A — EXPORT_ONLY_ZERO_INVOCATION   = 25
B — INVOKED_SIGNALS_FAILURE       = 19
C — INVOKED_LOG_ONLY              = 14
D — UNCLASSIFIED                  = 0   (all 58 resolved — see note below)
                                     ----
TOTAL                             = 58
```

**On the originally-reported "4 unclassified" files**: the earlier same-day estimate (54 classified + "~4 unclassified") undercounted by one — re-running classification directly against the authoritative 58-file Jest ground truth (rather than a static-grep pre-filter, which produced false negatives on files using `require.main === module` guards or containing an unrelated `.test(...)` regex-method call that isn't Jest's `test()`) found **5** stragglers, all now fully resolved into Category B or C below: `runAdSensePriceFirstCertification.test.ts`, `runAvatarLobbyCanvasNoFakeCrowd.test.ts`, `runLiveDomainAdSenseGate.test.ts`, `runRealLoungeMountIntegration.test.ts`, `runRealStatFreeTierHonesty.test.ts`.

### Category A — EXPORT_ONLY_ZERO_INVOCATION

Function(s) with real assertion logic are defined and exported, but **nothing in the file ever calls them** — not Jest, not a bare module-scope invocation, not even a `require.main === module` guard. These do not run under any circumstance today, including a plain `node`/`ts-node` invocation. This is the most severe category — it includes safety-critical logic (`runYouthSocialGuard.test.ts` — the 16/17-vs-18+ protected-minor boundary) that has never actually been executed by any runtime, only verified by direct code read in a prior session.

| # | File | Folder | Lines | Jest Collects Tests | Module-Scope Invocation | Failure Signal | Risk | Recommended Remediation |
|---|---|---|---|---|---|---|---|---|
| 1 | `runAdSenseReadinessAudit.test.ts` | `src/tests` | 66 | NO | Function(s) defined and exported; never called anywhere in the file | console-only / none | HIGH | Wrap existing logic in `describe`/`it`; call the existing function inside the `it` block and assert on its result |
| 2 | `runBattleArenaElasticityCert.test.ts` | `src/tests` | 245 | NO | Function(s) defined and exported; never called anywhere in the file | console-only / none | MEDIUM | Wrap existing logic in `describe`/`it`; call the existing function inside the `it` block and assert on its result |
| 3 | `runBeatAssignmentPersistence.test.ts` | `src/tests` | 93 | NO | Function(s) defined and exported; never called anywhere in the file | throw/exit — real, just gated from Jest | HIGH | Wrap existing logic in `describe`/`it`; call the existing function inside the `it` block and assert on its result |
| 4 | `runCanisterAuthHydration.test.ts` | `src/tests` | 63 | NO | Function(s) defined and exported; never called anywhere in the file | console-only / none | MEDIUM | Wrap existing logic in `describe`/`it`; call the existing function inside the `it` block and assert on its result |
| 5 | `runCanisterAuthHydrationIntegration.test.ts` | `src/tests` | 120 | NO | Function(s) defined and exported; never called anywhere in the file | console-only / none | MEDIUM | Wrap existing logic in `describe`/`it`; call the existing function inside the `it` block and assert on its result |
| 6 | `runChallengeACGBROperationalCertification.test.ts` | `src/tests` | 341 | NO | Function(s) defined and exported; never called anywhere in the file | throw/exit — real, just gated from Jest | MEDIUM | Wrap existing logic in `describe`/`it`; call the existing function inside the `it` block and assert on its result |
| 7 | `runChannelMixerDirector.test.ts` | `src/tests` | 301 | NO | Function(s) defined and exported; never called anywhere in the file | console-only / none | MEDIUM | Wrap existing logic in `describe`/`it`; call the existing function inside the `it` block and assert on its result |
| 8 | `runDatingExperiencePolicy.test.ts` | `src/tests` | 104 | NO | Function(s) defined and exported; never called anywhere in the file | console-only / none | HIGH | Wrap existing logic in `describe`/`it`; call the existing function inside the `it` block and assert on its result |
| 9 | `runExperienceRoomTopology.test.ts` | `src/tests` | 126 | NO | Function(s) defined and exported; never called anywhere in the file | console-only / none | MEDIUM | Wrap existing logic in `describe`/`it`; call the existing function inside the `it` block and assert on its result |
| 10 | `runFourSidedJumbotronAndAdSurfaceCertification.test.ts` | `src/tests` | 291 | NO | Function(s) defined and exported; never called anywhere in the file | throw/exit — real, just gated from Jest | MEDIUM | Wrap existing logic in `describe`/`it`; call the existing function inside the `it` block and assert on its result |
| 11 | `runInteractiveVenueHud.test.ts` | `src/tests` | 63 | NO | Function(s) defined and exported; never called anywhere in the file | console-only / none | MEDIUM | Wrap existing logic in `describe`/`it`; call the existing function inside the `it` block and assert on its result |
| 12 | `runLaneCChallengeOperationalCertification.test.ts` | `src/tests` | 421 | NO | Function(s) defined and exported; never called anywhere in the file | throw/exit — real, just gated from Jest | MEDIUM | Wrap existing logic in `describe`/`it`; call the existing function inside the `it` block and assert on its result |
| 13 | `runLiveEffectsAndMagazineEngine.test.ts` | `src/tests` | 101 | NO | Function(s) defined and exported; never called anywhere in the file | throw/exit — real, just gated from Jest | MEDIUM | Wrap existing logic in `describe`/`it`; call the existing function inside the `it` block and assert on its result |
| 14 | `runLoungeContextRingIntegration.test.ts` | `src/tests` | 105 | NO | Function(s) defined and exported; never called anywhere in the file | console-only / none | MEDIUM | Wrap existing logic in `describe`/`it`; call the existing function inside the `it` block and assert on its result |
| 15 | `runMasterHudSuite.test.ts` | `src/tests` | 99 | NO | Function(s) defined and exported; never called anywhere in the file | console-only / none | MEDIUM | Wrap existing logic in `describe`/`it`; call the existing function inside the `it` block and assert on its result |
| 16 | `runMediaSurfaceLayoutDirector.test.ts` | `src/tests` | 351 | NO | Function(s) defined and exported; never called anywhere in the file | console-only / none | MEDIUM | Wrap existing logic in `describe`/`it`; call the existing function inside the `it` block and assert on its result |
| 17 | `runMediaTransitionDirector.test.ts` | `src/tests` | 42 | NO | Function(s) defined and exported; never called anywhere in the file | console-only / none | MEDIUM | Wrap existing logic in `describe`/`it`; call the existing function inside the `it` block and assert on its result |
| 18 | `runMessagingAgeAttribution.test.ts` | `src/tests` | 108 | NO | Function(s) defined and exported; never called anywhere in the file | throw/exit — real, just gated from Jest | HIGH | Wrap existing logic in `describe`/`it`; call the existing function inside the `it` block and assert on its result |
| 19 | `runMessagingGate.test.ts` | `src/tests` | 39 | NO | Function(s) defined and exported; never called anywhere in the file | console-only / none | HIGH | Wrap existing logic in `describe`/`it`; call the existing function inside the `it` block and assert on its result |
| 20 | `runPersonalMediaRouter.test.ts` | `src/tests` | 244 | NO | Function(s) defined and exported; never called anywhere in the file | console-only / none | MEDIUM | Wrap existing logic in `describe`/`it`; call the existing function inside the `it` block and assert on its result |
| 21 | `runProfileMediaPlayerSecurity.test.ts` | `src/tests` | 86 | NO | Function(s) defined and exported; never called anywhere in the file | throw/exit — real, just gated from Jest | HIGH | Wrap existing logic in `describe`/`it`; call the existing function inside the `it` block and assert on its result |
| 22 | `runRealLoungeMountIntegration.test.ts` | `src/tests` | 235 | NO | Function(s) defined and exported; never called anywhere in the file | console-only / none | MEDIUM | Wrap existing logic in `describe`/`it`; call the existing function inside the `it` block and assert on its result |
| 23 | `runRehearsalAudio.test.ts` | `src/tests` | 39 | NO | Function(s) defined and exported; never called anywhere in the file | console-only / none | MEDIUM | Wrap existing logic in `describe`/`it`; call the existing function inside the `it` block and assert on its result |
| 24 | `runYoPhoOnboardingPoints.test.ts` | `src/tests` | 111 | NO | Function(s) defined and exported; never called anywhere in the file | throw/exit — real, just gated from Jest | MEDIUM | Wrap existing logic in `describe`/`it`; call the existing function inside the `it` block and assert on its result |
| 25 | `runYouthSocialGuard.test.ts` | `src/tests` | 111 | NO | Function(s) defined and exported; never called anywhere in the file | console-only / none | HIGH | Wrap existing logic in `describe`/`it`; call the existing function inside the `it` block and assert on its result |

### Category B — INVOKED_SIGNALS_FAILURE

The file runs its own assertions at module scope (either unconditionally, or gated behind `require.main === module`) and correctly signals failure via `throw new Error(...)` or `process.exit(1)` when run as a standalone script. Jest still collects zero tests because the assertions are never expressed as `describe`/`test`/`it`/`expect()` calls — Jest has no test API surface to hook into. **This is the lowest-risk, highest-confidence category to convert**: the pass/fail logic already exists and is already exercised correctly outside Jest.

| # | File | Folder | Lines | Jest Collects Tests | Module-Scope Invocation | Failure Signal | Risk | Recommended Remediation |
|---|---|---|---|---|---|---|---|---|
| 1 | `runActiveRoomInventoryCreateRoom.test.ts` | `src/tests` | 70 | NO | Invoked unconditionally at module scope on import | throw/exit — real, just gated from Jest | HIGH | Wrap in `describe`/`it`; existing throw/exit logic converts directly to `expect(...).toBe(true)` assertions |
| 2 | `runAdSensePriceFirstCertification.test.ts` | `src/tests` | 418 | NO | Invoked only under `require.main === module` (never true when Jest imports the file) | throw/exit — real, just gated from Jest | HIGH | Wrap in `describe`/`it`; existing throw/exit logic converts directly to `expect(...).toBe(true)` assertions |
| 3 | `runCompareRank.mj.test.ts` | `src/tests` | 110 | NO | Invoked unconditionally at module scope on import | throw/exit — real, just gated from Jest | MEDIUM | Wrap in `describe`/`it`; existing throw/exit logic converts directly to `expect(...).toBe(true)` assertions |
| 4 | `runCreateRoomE2EChain.test.ts` | `src/tests` | 86 | NO | Invoked unconditionally at module scope on import | throw/exit — real, just gated from Jest | HIGH | Wrap in `describe`/`it`; existing throw/exit logic converts directly to `expect(...).toBe(true)` assertions |
| 5 | `runEntitlementMatrix.test.ts` | `src/tests` | 67 | NO | Invoked unconditionally at module scope on import | throw/exit — real, just gated from Jest | HIGH | Wrap in `describe`/`it`; existing throw/exit logic converts directly to `expect(...).toBe(true)` assertions |
| 6 | `runGauntletWinnerStays.test.ts` | `src/tests` | 68 | NO | Invoked unconditionally at module scope on import | throw/exit — real, just gated from Jest | MEDIUM | Wrap in `describe`/`it`; existing throw/exit logic converts directly to `expect(...).toBe(true)` assertions |
| 7 | `runGoogleRoleChoiceAuthority.test.ts` | `src/tests` | 159 | NO | Invoked only under `require.main === module` (never true when Jest imports the file) | throw/exit — real, just gated from Jest | HIGH | Wrap in `describe`/`it`; existing throw/exit logic converts directly to `expect(...).toBe(true)` assertions |
| 8 | `runLiveDomainAdSenseGate.test.ts` | `src/tests` | 227 | NO | Invoked only under `require.main === module` (never true when Jest imports the file) | throw/exit — real, just gated from Jest | HIGH | Wrap in `describe`/`it`; existing throw/exit logic converts directly to `expect(...).toBe(true)` assertions |
| 9 | `runLivingJumbotronMediaLawCertification.test.ts` | `src/tests` | 241 | NO | Invoked only under `require.main === module` (never true when Jest imports the file) | throw/exit — real, just gated from Jest | MEDIUM | Wrap in `describe`/`it`; existing throw/exit logic converts directly to `expect(...).toBe(true)` assertions |
| 10 | `runMagazinePnrRotation.test.ts` | `src/tests` | 133 | NO | Invoked unconditionally at module scope on import | throw/exit — real, just gated from Jest | MEDIUM | Wrap in `describe`/`it`; existing throw/exit logic converts directly to `expect(...).toBe(true)` assertions |
| 11 | `runProfileIdentity.test.ts` | `src/tests` | 77 | NO | Invoked unconditionally at module scope on import | throw/exit — real, just gated from Jest | MEDIUM | Wrap in `describe`/`it`; existing throw/exit logic converts directly to `expect(...).toBe(true)` assertions |
| 12 | `runRealStatFreeTierHonesty.test.ts` | `src/tests` | 86 | NO | Invoked unconditionally at module scope on import | throw/exit — real, just gated from Jest | HIGH | Wrap in `describe`/`it`; existing throw/exit logic converts directly to `expect(...).toBe(true)` assertions |
| 13 | `runRevenueGoLive.test.ts` | `src/tests` | 72 | NO | Invoked unconditionally at module scope on import | throw/exit — real, just gated from Jest | HIGH | Wrap in `describe`/`it`; existing throw/exit logic converts directly to `expect(...).toBe(true)` assertions |
| 14 | `runSavedPerformanceRetentionPolicy.test.ts` | `src/tests` | 321 | NO | Invoked unconditionally at module scope on import | throw/exit — real, just gated from Jest | HIGH | Wrap in `describe`/`it`; existing throw/exit logic converts directly to `expect(...).toBe(true)` assertions |
| 15 | `runTierResolution.test.ts` | `src/tests` | 94 | NO | Invoked unconditionally at module scope on import | throw/exit — real, just gated from Jest | HIGH | Wrap in `describe`/`it`; existing throw/exit logic converts directly to `expect(...).toBe(true)` assertions |
| 16 | `runVenueCurtainDirector.test.ts` | `src/tests` | 81 | NO | Invoked only under `require.main === module` (never true when Jest imports the file) | throw/exit — real, just gated from Jest | MEDIUM | Wrap in `describe`/`it`; existing throw/exit logic converts directly to `expect(...).toBe(true)` assertions |
| 17 | `runVenuePlatformGlue.test.ts` | `src/tests` | 143 | NO | Invoked unconditionally at module scope on import | throw/exit — real, just gated from Jest | MEDIUM | Wrap in `describe`/`it`; existing throw/exit logic converts directly to `expect(...).toBe(true)` assertions |
| 18 | `runVenueSkinEconomy.test.ts` | `src/tests` | 54 | NO | Invoked unconditionally at module scope on import | throw/exit — real, just gated from Jest | MEDIUM | Wrap in `describe`/`it`; existing throw/exit logic converts directly to `expect(...).toBe(true)` assertions |
| 19 | `runVenueToolsPolicy.test.ts` | `src/tests` | 60 | NO | Invoked only under `require.main === module` (never true when Jest imports the file) | throw/exit — real, just gated from Jest | HIGH | Wrap in `describe`/`it`; existing throw/exit logic converts directly to `expect(...).toBe(true)` assertions |

### Category C — INVOKED_LOG_ONLY

The file runs its own logic at module scope and prints a result via `console.log`, but never asserts or fails — even run standalone, these cannot fail a CI pipeline or block a merge. **This is the weakest category and should not be converted by mechanical wrapper alone**: wrapping these in `describe`/`it` would make Jest "collect" them, but every one would report a false PASS immediately, since nothing in the file currently checks its own logged output against an expectation. Real `expect()` assertions have to be authored first.

| # | File | Folder | Lines | Jest Collects Tests | Module-Scope Invocation | Failure Signal | Risk | Recommended Remediation |
|---|---|---|---|---|---|---|---|---|
| 1 | `runArrival.test.ts` | `src/tests` | 22 | NO | Invoked unconditionally at module scope on import | console-only / none | LOW | Needs real assertions added, not just a describe/it wrapper |
| 2 | `runAvatarLobbyCanvasNoFakeCrowd.test.ts` | `src/tests` | 76 | NO | Invoked unconditionally at module scope on import | console-only / none | LOW | Needs real assertions added, not just a describe/it wrapper |
| 3 | `runBubble.test.ts` | `src/tests` | 16 | NO | Invoked unconditionally at module scope on import | console-only / none | LOW | Needs real assertions added, not just a describe/it wrapper |
| 4 | `runCamera360.test.ts` | `src/tests` | 30 | NO | Invoked unconditionally at module scope on import | console-only / none | LOW | Needs real assertions added, not just a describe/it wrapper |
| 5 | `runCommunication.test.ts` | `src/tests` | 29 | NO | Invoked unconditionally at module scope on import | console-only / none | LOW | Needs real assertions added, not just a describe/it wrapper |
| 6 | `runCompanionProfileProvisioning.test.ts` | `src/tests` | 109 | NO | Invoked unconditionally at module scope on import | console-only / none | HIGH | Needs real assertions added, not just a describe/it wrapper |
| 7 | `runEntrance.thorough.test.ts` | `src/tests` | 45 | NO | Invoked unconditionally at module scope on import | console-only / none | LOW | Needs real assertions added, not just a describe/it wrapper |
| 8 | `runHubBoard.test.ts` | `src/tests` | 15 | NO | Invoked unconditionally at module scope on import | console-only / none | LOW | Needs real assertions added, not just a describe/it wrapper |
| 9 | `runIdentityFallbackHardening.test.ts` | `src/tests` | 140 | NO | Invoked unconditionally at module scope on import | console-only / none | HIGH | Needs real assertions added, not just a describe/it wrapper |
| 10 | `runKaraoke.test.ts` | `src/tests` | 61 | NO | Invoked unconditionally at module scope on import | console-only / none | LOW | Needs real assertions added, not just a describe/it wrapper |
| 11 | `runPresence.test.ts` | `src/tests` | 20 | NO | Invoked unconditionally at module scope on import | console-only / none | LOW | Needs real assertions added, not just a describe/it wrapper |
| 12 | `runReaction.test.ts` | `src/tests` | 16 | NO | Invoked unconditionally at module scope on import | console-only / none | LOW | Needs real assertions added, not just a describe/it wrapper |
| 13 | `runSeating2.test.ts` | `src/tests` | 56 | NO | Invoked unconditionally at module scope on import | console-only / none | LOW | Needs real assertions added, not just a describe/it wrapper |
| 14 | `runYoPhoFreeLayerGate.test.ts` | `src/tests` | 48 | NO | Invoked unconditionally at module scope on import | console-only / none | MEDIUM | Needs real assertions added, not just a describe/it wrapper |

**Decision on Category C, recorded per Marcel (2026-09-14)**: leave these 14 alone for now. Wrapping them in `test()` would make Jest report execution, but that would be a false signal of its own — reporting a PASS without the file ever having checked anything. Real remediation requires turning the logged conditions into assertions first, which is authorship work, not a ledger task.

---

## The 7 real Jest suites currently failing (separate problem — do not conflate with zero-collection)

These 7 files **do** use `describe`/`it`/`expect` correctly and **are** collected by Jest. Their failures are a different kind of problem entirely — either a real product/test mismatch or a missing environment variable in this shell — not a Category A/B/C execution-gap issue.

| Test File | Failure Class | DB-Dependent | Actual Failure Summary | Repair Lane |
|---|---|---|---|---|
| `runStoreItemOwnershipPersistence.test.ts` | Environment | YES | All 4 tests: `FATAL: DATABASE_URL is missing from the environment` — Prisma client cannot initialize in this Jest process | Provide a reachable `DATABASE_URL` to the Jest process (this repo's `.env.local` is Next.js-loaded, not Jest-loaded) — not a code defect |
| `runUniversalCartPersistence.test.ts` | Environment | YES | All 10 tests: same `DATABASE_URL` missing error | Same as above |
| `runFulfillmentRecoveryWorker.test.ts` | Environment | YES | All 3 tests: same `DATABASE_URL` missing error | Same as above |
| `runBillingGraceEngine.test.ts` | Environment | YES | 1 test: same `DATABASE_URL` missing error | Same as above |
| `runVenueAssetBinding.test.ts` | Real assertion failure | NO | 1 test: `expect(received).toBe(expected)` — expected `true`, received `false`, at line 218 — unrelated to DB or env | Needs direct investigation against the Step 4 Slice 2 `CertifiedVenuePackage` binding logic — separate repair lane, not touched in this ledger pass |
| `runLobbyConvRecordHonesty.test.ts` | Real assertion failure | NO | 1 of 15 tests: expects `data-record-state="unavailable"` to be present in `CommandCenterMediaStack.tsx` source; the component correctly disables/alerts on RECORD but does not set that specific `data-record-state` attribute | Either add the `data-record-state="unavailable"` attribute to the real RECORD control, or correct the test's expected attribute name — needs a decision on which is the source of truth, not made in this ledger pass |
| `runRevenueTicketsTipsSponsorReconnect.test.ts` | Real path-construction bug | NO | All 7 tests: `ENOENT` — the test reads source files at paths missing the `src/` segment (e.g. it reads `apps/web/app/api/tickets/create/route.ts`, but the real route lives at `apps/web/src/app/api/tickets/create/route.ts`) | This looks like a bug in the test's own path construction, not a missing route — the routes it's checking for may well exist under `src/`; needs verification against real file locations, not touched in this ledger pass |

---

## Recorded separately, per Marcel (2026-09-14)

```
FanChallengeRail XP copy
= RULE 8 / DATA-AUTHORITY FOLLOW-UP
= NOT RULE 20
= TARGET AUTHORITY: XpActionRegistry
= NO CHANGE IN THIS COMMIT
```

`apps/web/src/components/homepage/density/FanChallengeRail.tsx` hardcodes four challenge/reward-copy entries (e.g. "Answer 5 trivia prompts +45 XP"). These are task/quest *descriptions*, not activity claims about something that already happened — classified as static copy, not a Rule 20 fake-data violation. But the specific XP amounts should ideally be sourced from `XpActionRegistry.ts` (Rule 8, single source of truth for XP values) rather than hand-typed in the component, so the displayed reward always matches what's actually granted. Not changed as part of the Home 1 honest-data purge commit — flagged here as separate follow-up work.
