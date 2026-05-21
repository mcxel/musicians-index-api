# PACK30_REPO_CONFLICT_CHECKLIST.md
## Run This Before Touching Anything — Pre-Flight Conflict Check
### BerntoutGlobal XXL / The Musician's Index

Run every command in order. Fix any ❌ before starting Slice 0.

---

## STEP 1 — VERIFY CURRENT BUILD IS GREEN

```bash
cd tmi-platform
pnpm -C apps/api typecheck
# Expected: exit 0 — no errors
# If ❌: stop here. Fix existing errors before any Pack import.

pnpm -C apps/web typecheck
# Expected: exit 0
# If ❌: stop here.

pnpm -C apps/web build
# Expected: exit 0
# If ❌: stop here.
```

---

## STEP 2 — VERIFY BRANCH STATE

```bash
git status
# Expected: clean working tree OR only known untracked files
# If ❌ (unexpected modified files): run git stash or commit before starting

git branch
# Expected: you are on a feature branch (not main/master)
# If ❌: create branch first: git checkout -b pack28-29-import

git log --oneline -5
# Record last 5 commits as rollback reference
```

---

## STEP 3 — CHECK FOR DUPLICATE ROUTES

```bash
find apps/web/src/app -name "page.tsx" | sort > /tmp/existing-pages.txt
cat /tmp/existing-pages.txt

# Cross-check Pack 29 NEW files against this list.
# Any file already in this list = INSPECT FIRST, do not blindly overwrite.
# Pay special attention to:
grep -E "(dashboard|settings|admin)" /tmp/existing-pages.txt
```

---

## STEP 4 — CHECK FOR DUPLICATE PROVIDERS

```bash
grep -r "AudioProvider" apps/web/src/app --include="*.tsx" -l
# Expected: only 1 file (root layout.tsx)
# If ❌ (multiple files): duplicate provider — find and remove before continuing

grep -r "SharedPreviewProvider" apps/web/src/app --include="*.tsx" -l
# Expected: only 1 file

grep -r "TurnQueueProvider" apps/web/src/app --include="*.tsx" -l
# Expected: only 1 file
```

---

## STEP 5 — VERIFY PRISMA BASELINE

```bash
npx prisma migrate status
# Expected: All migrations applied — no pending migrations
# If ❌ (pending migrations): run npx prisma migrate deploy first

npx prisma validate
# Expected: exit 0 — schema is valid
# If ❌: fix schema errors before appending new models
```

---

## STEP 6 — CHECK FOR NAMING CONFLICTS IN SCHEMA

```bash
grep "^model " packages/db/prisma/schema.prisma | sort
# Record all existing model names.
# Compare against Pack 29 new model names:
#   Advertiser, AdCampaign, AdSlotReservation, AdCreative, AdImpression,
#   AdClick, HouseAd, SponsorLead, SponsorContract, SalesCRMEntry,
#   SalesNote, CampaignProposal, Party, PartyMember, PartyMessage,
#   GameSession, GamePlayer, Article, ArticleAdSlot, StreamWinScore, StreamWinEvent
#
# If any name already exists: check if it's the same model or a conflict.
# Same model = skip that append. Conflict = resolve before migrating.
```

---

## STEP 7 — CHECK EXISTING API MODULES

```bash
ls apps/api/src/modules/
# Record existing modules.
# New modules from Pack 29: monetization, advertiser, sponsor, sales-crm,
#   party-lobby, games, editorial, stream-win, home-composition
# Any already exist? → INSPECT FIRST before creating.
```

---

## STEP 8 — VERIFY ENVIRONMENT VARIABLES

```bash
# Check that all REQUIRED vars from Pack 27 ENV_VAR_MASTER_LIST.md exist
node -e "
const required = [
  'DATABASE_URL','REDIS_URL','JWT_SECRET','NEXTAUTH_SECRET',
  'STRIPE_SECRET_KEY','STRIPE_WEBHOOK_SECRET',
  'R2_ACCESS_KEY_ID','R2_SECRET_ACCESS_KEY',
  'RESEND_API_KEY','VAPID_PRIVATE_KEY','CLOUDFLARE_TURNSTILE_SECRET'
];
const missing = required.filter(k => !process.env[k]);
if (missing.length) {
  console.log('MISSING:', missing.join(', '));
  process.exit(1);
} else {
  console.log('All required env vars present ✅');
}
"
# If ❌: add missing vars to .env before starting
```

---

## STEP 9 — TAG CURRENT STATE

```bash
# Always tag before starting a large import
git add -A
git commit -m "chore: pre-pack28-29 import checkpoint" --allow-empty
git tag pre-pack28-29-import
echo "Tagged: pre-pack28-29-import ✅"
# This is your rollback point if anything goes catastrophically wrong
```

---

## PRE-FLIGHT CHECKLIST SUMMARY

```
[ ] pnpm -C apps/api typecheck exits 0
[ ] pnpm -C apps/web typecheck exits 0
[ ] pnpm -C apps/web build exits 0
[ ] On feature branch (not main/master)
[ ] No unexpected modified files in git status
[ ] No duplicate providers in layout
[ ] npx prisma migrate status shows all applied
[ ] npx prisma validate exits 0
[ ] No conflicting model names in schema
[ ] No conflicting module names in apps/api/src/modules/
[ ] All required env vars present
[ ] git tag pre-pack28-29-import created

All 11 checks green → PROCEED to Slice 0
Any check red → STOP and fix before continuing
```
