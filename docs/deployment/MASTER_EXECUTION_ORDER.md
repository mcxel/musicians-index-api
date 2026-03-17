# MASTER EXECUTION ORDER (Finish Mode / Zero Drift)

Purpose: lock runtime build sequence so The Musician's Index launches in the right order without scope drift.

## Priority Lock
- `themusiciansindex.com` = TMI frontend
- `www.themusiciansindex.com` = TMI frontend
- `api.themusiciansindex.com` = TMI backend
- `ai.themusiciansindex.com` = AI generator backend

No widening scope ahead of these proof gates:
1. backend identity
2. homepage
3. admin bootstrap
4. activation email
5. onboarding + persistence
6. artist profile article auto-create

## Phase Order (Mandatory)

### Phase A — Identity + Deploy Lock
- Make `api.themusiciansindex.com` serve TMI API only.
- Move AI API to `ai.themusiciansindex.com`.
- Make `themusiciansindex.com` serve TMI web app.
- Canonical frontend API env: `API_BASE_URL=https://api.themusiciansindex.com`.

Proof:
- `/api/healthz` and `/api/readyz` green on production API domain.
- Homepage loads from production domain.

### Phase B — Core Product Proof
- Homepage, auth pages, and nav functional.
- Marcel admin and J. Paul admin bootstrap + login proof.
- Invite/activation/reset email proof (SPF/DKIM/DMARC + inbox click-through).

Proof:
- Admin session persists and `/admin` opens for both users.
- Activation flow converts account to active.

### Phase C — Onboarding Completion Chain
- Artist onboarding and fan onboarding complete.
- Originality note appears in required surfaces.
- Profile save/reload confirmed.
- Artist signup auto-creates profile article page and links it.

Proof:
- New artist has user record, profile, article slug route, and dashboard link.

### Phase D — Founding and Billboard Test Lane
- Gate 0: internal admin only.
- Gate 1: first 10 founding artists occupy initial spots.
- Gate 2: founding fans admitted.
- Gate 3: dynamic chart transition based on participation thresholds.
- Billboard + Julius verification lane must pass before broader rollout.

Proof:
- Founding chart renders + transitions correctly; rollback/freeze works.

### Phase E — Sponsor/Advertiser Intake
- `/for-sponsors`, `/for-advertisers`, `/media-kit`, intake forms, approval queue, placement inventory.
- Sponsor and advertiser campaign models + creative moderation flow live.

Proof:
- Lead capture routes to admin queue and can be approved to active placement.

### Phase F — Controlled Bot Activation
Bots remain inactive until all prior phases are green.
- Artist discovery bot
- Fan growth bot
- Sponsor scout bot
- Advertiser scout bot
- Placement match + analytics bots

Proof:
- Dry-run logs approved; low-limit production rollout passes compliance checks.

## Global Kill Switch Matrix (Required)
Must support independent toggles for:
- signup
- onboarding (artist/fan/sponsor/advertiser)
- charts/voting/polls
- article auto-create
- sponsor placements/ads
- bot outreach
- email sending

## Non-Negotiable Rule
If any active phase fails proof, stop and fix the active blocker before moving to the next phase.

## Reference Docs
- `docs/deployment/LAUNCH_PROOF_LADDER.md`
- `docs/deployment/ONBOARDING_PROOF_LADDER.md`
- `docs/deployment/ADMIN_BOOTSTRAP_AND_RECOVERY.md`
- `docs/deployment/EMAIL_DELIVERY_AND_ACTIVATION.md`
- `docs/deployment/BOT_ACTIVATION_RULES.md`
- `docs/MASTER_BLUEPRINT.md`
- `docs/PAGE_FLOW_MAP.md`
