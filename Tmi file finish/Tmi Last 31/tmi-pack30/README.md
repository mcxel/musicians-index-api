# TMI PACK 30 — OPERATIONAL SAFETY PACK
## Pre-Flight, Import Commands, and Rollback Procedures
### BerntoutGlobal XXL / The Musician's Index

Pack 30 is a tiny operational helper — 3 files, no new architecture.

---

## FILES

| File | When to Use |
|---|---|
| PACK30_REPO_CONFLICT_CHECKLIST.md | Run BEFORE touching any Pack 28/29 files |
| PACK30_IMPORT_COMMANDS.md | Exact copy-paste shell commands for each slice |
| PACK30_SLICE_BY_SLICE_ROLLBACK.md | If any slice breaks — exact rollback per slice |

---

## MOVE DESTINATION

```
All 3 .md files → tmi-platform/docs/system/
README.md       → tmi-platform/docs/pack30-README.md
```

---

## THE COMPLETE HANDOFF ORDER

```
1. Run PACK30_REPO_CONFLICT_CHECKLIST.md (all 11 checks green before starting)
2. Move all pack docs into repo (PACK30_IMPORT_COMMANDS.md → MOVE DOCS section)
3. Follow PACK29_SAFE_WIRING_ORDER.md slice by slice
4. Use PACK30_IMPORT_COMMANDS.md for exact shell commands per slice
5. If anything breaks: PACK30_SLICE_BY_SLICE_ROLLBACK.md → roll back that slice only
6. pnpm test:discovery must pass at Slice 3 before continuing
7. pnpm test:smoke must pass at Slice 9 before tagging pack29-complete
```

---

## EVERYTHING COPILOT NEEDS

```
Pack 28: docs/pack28/ (design system + architecture specs)
Pack 29: docs/system/PACK29_*.md (repo map, models, contracts, states, permissions, proofs, seed, wiring order)
Pack 30: docs/system/PACK30_*.md (pre-flight, commands, rollback)
```

---

## COPILOT HANDOFF COMMAND

Paste this exactly to Copilot:

```
We are moving from Pack 28+29 Claude architecture into repo wiring.

Before starting:
  Read: PACK30_REPO_CONFLICT_CHECKLIST.md
  Run all 11 checks. Report results.
  Only proceed if all checks are green.

Wiring order:
  Follow: PACK29_SAFE_WIRING_ORDER.md
  Use: PACK30_IMPORT_COMMANDS.md for exact shell commands
  If broken: PACK30_SLICE_BY_SLICE_ROLLBACK.md

Rules:
  Smallest safe patch only
  No broad refactors
  No invented file paths — use PACK29_REPO_FILE_PLACEMENT_MAP.md
  Respect LOCKED files — never touch them
  Proof gate between every slice
  If Slice N fails: stop, rollback Slice N only, fix, re-prove, then continue

Start: Run the pre-flight checklist and report all 11 results.
```

*BerntoutGlobal LLC — "This is your stage, be original."*
