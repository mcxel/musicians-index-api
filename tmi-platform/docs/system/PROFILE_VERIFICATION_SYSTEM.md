# PROFILE_VERIFICATION_SYSTEM.md
## Verification Tiers — What They Mean and How to Get Them
### BerntoutGlobal XXL / The Musician's Index

---

## VERIFICATION TYPES

| Type | Badge | Who Gets It | How |
|---|---|---|---|
| Verified Artist | ✓ (blue) | Artists with established presence | Apply + Big Ace review |
| Verified Venue | ✓ (purple) | Real venues with events | Apply + business docs |
| Verified Sponsor | ✓ (gold) | Companies with active campaigns | Sponsor onboarding |
| Diamond | 💎 (cyan) | Marcel Dickens + BJ M Beat's | Permanent — hardcoded |
| Rising Artist | ↑ (green) | Discovery-first: fast-growing low-viewer artists | Automatic (algorithm) |
| OG | ⭐ (white) | Season 1 founding members | Automatic on launch cohort |

---

## VERIFICATION APPLICATION FLOW

1. Artist submits application: `/settings/profile → Request Verification`
2. Fields: stage name, links to music, social following, notable achievements
3. Big Ace reviews in admin moderation queue
4. Approved: `verified: true` + verification type added to profile
5. Denied: notification with reason

---

## RISING ARTIST (ALGORITHMIC — DISCOVERY-FIRST HONORIFIC)

Rising badge is awarded by world-simulation-bot when:
- Viewer count is low (< 50 per room) — undiscovered
- Growth rate is high (following growing > 10% week-over-week)
- Active on platform (3+ rooms per week)

This badge honors the discovery-first platform law by highlighting undiscovered artists.
Rising badge is removed when artist reaches > 200 regular viewers.

---

## PERMANENT DIAMOND

Marcel Dickens and B.J. M Beat's have permanent Diamond tier.
This is hard-coded in the profile rendering and verified by billing-integrity-bot every 4 hours.
NO code change can remove this without approval from Big Ace.
