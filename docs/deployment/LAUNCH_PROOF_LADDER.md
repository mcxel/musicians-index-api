# Launch Proof Ladder

This is the master checklist for the launch of The Musician's Index. The platform is not considered "live" or "launched" until every item on this ladder is complete and verified.

This document aggregates the final proof steps from other, more detailed documents.

## Phase A: Infrastructure and Identity

| # | Item | Verification | Status |
| :--- | :--- | :--- | :--- |
| A.1 | **Backend Deployed** | The TMI Backend is successfully deployed on Render. | `[ ]` |
| A.2 | **Backend Identity Locked** | `api.themusiciansindex.com` successfully serves the TMI Backend. | `[ ]` |
| A.3 | **AI Generator Separated** | The AI Generator API is no longer served from `api.themusiciansindex.com`. | `[ ]` |
| A.4 | **Frontend Deployed** | The TMI Frontend is successfully deployed on Vercel/other. | `[ ]` |
| A.5 | **Frontend Domain Locked**| `themusiciansindex.com` successfully serves the TMI Frontend. | `[ ]` |

## Phase B: Core Pages & Smoke Test

| # | Item | Verification | Status |
| :--- | :--- | :--- | :--- |
| B.1 | **Homepage Loads** | `https://themusiciansindex.com/` loads correctly with no console errors. | `[ ]` |
| B.2 | **Login Page Loads** | The `/auth` or `/login` page loads with a functional form. | `[ ]` |
| B.3 | **Signup Page Loads** | The `/signup` page loads with a functional form. | `[ ]` |
| B.4 | **API Health** | `https://api.themusiciansindex.com/api/healthz` returns `"ok": true`. | `[ ]` |
| B.5 | **API Readiness** | `https://api.themusiciansindex.com/api/readyz` returns `"ok": true` with successful DB checks. | `[ ]` |

## Phase C: Admin Bootstrap

| # | Item | Verification | Status |
| :--- | :--- | :--- | :--- |
| C.1 | **Admin Seed Script Run**| The `seed:admin` script has been successfully executed against the production DB. | `[ ]` |
| C.2 | **Marcel Admin Login** | Marcel can log in and access the `/admin` dashboard. | `[ ]` |
| C.3 | **J. Paul Admin Login** | J. Paul Sanchez can log in and access the `/admin` dashboard. | `[ ]` |
| C.4 | **Admin Session Works** | Admin sessions persist after closing and reopening the browser. | `[ ]` |

## Phase D: Email and Activation

| # | Item | Verification | Status |
| :--- | :--- | :--- | :--- |
| D.1 | **DNS Verified** | SPF, DKIM, and DMARC records are in place for the sending domain. | `[ ]` |
| D.2 | **Activation Email Works**| New user signup triggers an activation email, and the link correctly verifies the account. | `[ ]] `|
| D.3 | **Password Reset Works**| The "Forgot Password" flow sends a working reset link. | `[ ]` |

## Phase E: Member Onboarding

| # | Item | Verification | Status |
| :--- | :--- | :--- | :--- |
| E.1 | **Fan Onboarding** | A new "Fan" account can complete the entire onboarding flow as defined in `ONBOARDING_PROOF_LADDER.md`. | `[ ]` |
| E.2 | **Artist Onboarding** | A new "Artist" account can complete the entire onboarding flow, including the "Originality Sticky Note" agreement. | `[ ]` |
| E.3 | **Profile Persistence** | All profile data entered during onboarding is successfully saved and reloaded. | `[ ]` |

---
**LAUNCH COMPLETE:** `[ Date: ______________ ]` `[ Signed Off By: ______________ ]`
