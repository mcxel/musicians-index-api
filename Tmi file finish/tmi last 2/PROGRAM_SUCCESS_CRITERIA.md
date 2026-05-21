# PROGRAM SUCCESS CRITERIA
# TMI Platform — BerntoutGlobal XXL
# What "100% done" means for each major system

---

## HOW TO USE THIS FILE

Before marking any phase, wave, page, or feature as complete, check every row in its section.
If even one row is ✗ — it is NOT done. No exceptions.

---

## REPO STABILITY

| Criteria | Done When |
|---|---|
| All E2E tests pass | `pnpm -s exec playwright test` exits 0 |
| API build passes | `pnpm -C apps/api build` exits 0 |
| Web build passes | `pnpm -C apps/web build` exits 0 |
| Readiness contract passes | `pnpm -C apps/api run test:readiness-contract` exits 0 |
| No 404 routes on any linked page | Manual browser check |
| Health identity visible | `GET /api/healthz` returns build hash + release |
| Rollback verified | Test rollback, confirm it restores to known good state |
| CI green | GitHub Actions green on latest commit |

---

## CONTEST FLOW

| Criteria | Done When |
|---|---|
| `/contest` loads | 200, no blank shells |
| `/contest/rules` loads | 200, all 10 rules visible |
| `/contest/qualify` loads | 200, shows sponsor progress for logged-in artist |
| `/contest/leaderboard` loads | 200, shows ranked list or graceful empty state |
| `/contest/host` loads | 200, Ray Journey renders |
| `/contest/sponsors` loads | 200, package tiers visible |
| Contest banner on artist profile | Visible for eligible artists |
| SponsorInvitePanel opens | Opens and closes without errors |
| Sponsor package selection works | Package highlights on click |
| August 8 date rule enforced | API rejects entry if registration not open |
| Contest admin guarded | `/contest/admin/*` redirects non-admin to `/auth` |
| Season countdown shows | Counts to next August 8 |
| Smoke test passes | `pnpm -s exec playwright test tests/e2e/contest.smoke.spec.ts` exits 0 |

---

## WINNER REVEAL SYSTEM

| Criteria | Done When |
|---|---|
| Single winner reveal works | Idle → lineup → hero zoom → complete |
| Small game reveal works | 1–5 winners, group hold, then hero |
| Big contest reveal works | 5–10 winners, group hold, then hero |
| Group reaction hold works | Winners visible together for groupHoldSeconds |
| Hero zoom renders | Featured winner fills screen |
| Voice chatter can be toggled | on/off switch works |
| Camera director runs | Preset switches work within approved pool |
| Adaptive weights update | Weight change logged, reflected next reveal |
| Season lock prevents rotation | No preset changes when seasonLocked = true |
| Admin reset works | Weights restore to defaults |
| Fallback mode works | Single winner shows if config missing |
| Reveal analytics logged | Data stored per reveal event |
| Playwright smoke coverage | Reveal spec passes |

---

## SPONSOR SYSTEM

| Criteria | Done When |
|---|---|
| Sponsor panel renders | SponsorContestPanel shows active + pending |
| Package tiers visible | All 7 tiers display correctly |
| Invite flow works | Send request → status changes to "invited" |
| Sponsor verification works | API accepts/rejects sponsor contributions |
| Local count enforced | Cannot exceed 10 local sponsors |
| Major count enforced | Cannot exceed 10 major sponsors |
| Stage overlay renders | StageSponsorOverlay shows on contest stage |
| Presented-by slate works | PresentedBySlate renders sponsor name |
| ROI analytics render | SponsorROIAnalytics shows real data |
| Leaderboard works | SponsorLeaderboard ranks by artists backed |
| Sponsor slot cap enforced | API rejects when caps are reached |

---

## ADMIN SYSTEM

| Criteria | Done When |
|---|---|
| Admin layout guards all `/contest/admin/*` | Non-admin → /auth redirect |
| Admin overview page loads | Shows queue counts |
| Contestant queue shows | Pending entries listed |
| Sponsor queue shows | Pending contributions listed |
| Season setup page works | Admin can create/edit seasons |
| Reveal admin controls work | Config saves correctly |
| Audit log shows entries | Actions logged with timestamps |
| Host cue panel accessible | Admin/host can trigger Ray Journey cues |
| Payout tracker loads | Prize fulfillment status visible |

---

## VISUAL QUALITY

| Criteria | Done When |
|---|---|
| All pages match TMI neon/dark aesthetic | Dark bg, neon orange/cyan/gold accents |
| No lorem ipsum visible | Real content or proper empty states |
| No [TODO] text visible to users | All placeholder text replaced |
| Loading states exist | Skeleton or spinner on all async loads |
| Empty states exist | Friendly message when no data |
| Error states exist | Clear error message, not blank screen |
| Mobile view is readable | Key content accessible at 375px width |
| Contest banner animates | Glow pulses on artist profile |
| Winner reveal animates | Lineup stagger + hero zoom transition |
| Ray Journey avatar renders | SVG avatar visible in host mode |

---

## UPLOAD READINESS

| Criteria | Done When |
|---|---|
| All proof checks pass | See Master Proof Checklist |
| Deployment runbook exists | Exact steps documented per platform |
| Rollback runbook exists | Exact steps to trigger rollback |
| Operator sheet exists | One-page quick reference complete |
| Upload smoke pack exists | Evidence captured: CI screenshot, health dump, E2E output |
| One-command proof gate exists | Single script runs all checks, exits 0 or 1 |

---

## ONBOARDING READINESS

| Criteria | Done When |
|---|---|
| Login/logout/register stable | No redirect loops |
| Artist onboarding stable | Reaches dashboard after completing steps |
| Contest banner shows for eligible artists | After profile setup |
| First fan can join and vote | Vote flow end-to-end |
| First sponsor can find and back an artist | Invite → verify flow works |
| Admin can create a season | Season appears in frontend |

---

*BerntoutGlobal XXL | TMI Platform | Program Success Criteria | Phase 19*
