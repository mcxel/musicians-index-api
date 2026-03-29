# PACK_INDEX_AND_CHECKSUMS.md
## Complete Pack Inventory — Verify Nothing Got Lost During Move
### BerntoutGlobal XXL / The Musician's Index

Use this to confirm every pack is intact before telling Copilot to start.

---

## PACK INVENTORY

| Pack | Zip File | Key Contents | File Count |
|---|---|---|---|
| Pack 15 | tmi-pack15-final-completion.zip | Master governance, world simulation, lifecycle, bots (10), component shells | ~10 |
| Pack 16 | tmi-pack16-repo-ready-normalization.zip | 75 docs, 76 components, 100 page shells, 11 bot specs, placement guide | 263 |
| Final Deploy | tmi-final-deploy-layer.zip | 23 deployment docs (Render, Cloudflare, Hostinger, WebSocket, SSL, DNS, Stripe) | 26 |
| Pack 23 | tmi-pack23-manifest-and-checksums.zip | PACK23_FILE_MANIFEST.md (299 entries), PACK23_CHECKSUMS.md | 2 |
| Pack 24 | tmi-pack24-supercharge.zip | 18 system docs, 7 bots, 27 components, 26 page shells + 6 special files | 84 |
| Pack 25 | tmi-pack25-final-closure.zip | API contracts, Prisma schema delta, WebSocket map, Stripe wiring, safety rules | 21 |
| Pack 26 | tmi-pack26-final-closure.zip | Repo move plan, conflict audit, owner finance (8 docs), Copilot wiring prompt | 18 |
| Pack 27 | tmi-pack27-ops.zip | This pack: 6 operational safeguard files | 6 |

---

## QUICK COUNT VERIFICATION

Before starting the repo move, verify these counts match your Downloads folder:

```bash
# Run in each extracted pack folder:

# Pack 16 (largest)
find tmi-pack16 -type f | wc -l
# Expected: 263

# Pack 24 (components + pages)
find tmi-pack24 -type f | wc -l
# Expected: 84

# Pack 25 (contracts)
find tmi-pack25 -type f | wc -l
# Expected: 21

# Pack 26 (closure + finance)
find tmi-pack26 -type f | wc -l
# Expected: 18
```

If counts don't match: re-extract from the zip before moving.

---

## KEY FILE VERIFICATION (Most Critical)

These specific files must exist and be intact before moving:

```
✓ tmi-pack16/docs-system/PACK15_PLACEMENT_AND_WIRING_GUIDE.md
✓ tmi-pack25/docs-system/contracts/API_CONTRACTS.md
✓ tmi-pack25/docs-system/prisma/PRISMA_SCHEMA_DELTA.md
✓ tmi-pack25/docs-system/WEBSOCKET_EVENT_MAP.md
✓ tmi-pack25/docs-system/STRIPE_WIRING_PLAN.md
✓ tmi-pack25/docs-system/FAMILY_KID_SAFETY_RULES.md
✓ tmi-pack25/docs-system/TICKET_ANTI_BOT_RULES.md
✓ tmi-pack26/closure/COPILOT_REPO_MOVE_AND_WIRING_PLAN.md
✓ tmi-pack26/finance/OWNER_PROFIT_DISTRIBUTION_SYSTEM.md
✓ tmi-pack26/finance/OWNER_PAYOUT_CLOSURE_PACK.md
✓ tmi-pack26/copilot/MASTER_COPILOT_WIRING_PROMPT.md
✓ tmi-pack27-ops/REPO_IMPORT_ORDER.md
✓ tmi-pack27-ops/FILE_REPLACE_VS_MERGE_MATRIX.md
✓ tmi-pack27-ops/ENV_VAR_MASTER_LIST.md
✓ tmi-pack27-ops/WEBHOOK_SECRET_AND_PROVIDER_CHECKLIST.md
✓ tmi-pack27-ops/POST_MOVE_SMOKE_TEST_ORDER.md
```

---

## AFTER MOVE — FINAL REPO COUNT

After all packs are moved into the repo, verify the docs/system folder:
```bash
find tmi-platform/docs/system -name "*.md" | wc -l
# Expected: 120+ files (all packs combined)

find tmi-platform/apps/web/src/components -name "*.tsx" | wc -l
# Expected: 100+ files (Packs 15-16 + Pack 24 components)

find tmi-platform/apps/web/src/app -name "page.tsx" | wc -l
# Expected: 110+ routes (Pack 16 100 shells + Pack 24 26 shells + existing)
```
