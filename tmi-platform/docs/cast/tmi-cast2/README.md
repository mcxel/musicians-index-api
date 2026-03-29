# TMI CAST SYSTEM — PACK 2
## Completion Pack for Empty Sections + New Systems

---

## STATUS

This pack completes the sections that were EMPTY in the first cast pack:
- `hosts/` — Complete host profiles + behavior + master
- `shows/` — Show engine, formats, flow, audio
- `wardrobe/` — Wardrobe engine + style rules
- `performance/` — Performance limits + fallback system
- `proof/` — Test matrix + validation + proof index
- `venues/` — Complete venue engine with all room types
- `audio/` — Soundtrack core + failure feedback engine
- `systems/governance/` — System governance + role matrix + execution lock
- `repo/bindings/` — All binding matrices + canon index

---

## HOW TO INTEGRATE

### Drop into repo at:
```
tmi-platform/docs/cast/
```

### Merge with first pack (tmi-cast-system.zip):
- `hosts/` → merge with empty hosts/ folder
- `shows/` → merge with empty shows/ folder
- `wardrobe/` → merge with empty wardrobe/ folder
- `performance/` → merge with empty performance/ folder
- `proof/` → merge with empty proof/ folder
- `venues/` → NEW folder
- `audio/` → ADD to existing audio/
- `systems/governance/` → NEW subfolder
- `repo/bindings/` → NEW subfolder

---

## KEY FILES IN THIS PACK

| File | Purpose |
|---|---|
| `hosts/HOST_MASTER.md` | Complete host roster + system requirements |
| `hosts/HOST_PERSONALITIES.md` | Full per-host personality specs (all 6) |
| `shows/SHOW_ENGINE.md` | Show lifecycle runtime engine |
| `shows/SHOW_FORMATS.md` | All 7 show formats fully defined |
| `shows/SHOW_FLOW.md` | Timing and sequence rules |
| `audio/SOUNDTRACK_AND_FAILURE_ENGINE.md` | 3 base themes + per-show sound + fail types |
| `wardrobe/WARDROBE_AND_STYLE.md` | Outfit slots + hybrid style rules |
| `performance/PERFORMANCE_AND_PROOF.md` | Budget limits + fallback cascade + test matrix |
| `venues/VENUE_ENGINE.md` | All venue types + seating + sightlines + evolution |
| `systems/governance/GOVERNANCE_AND_EXECUTION_LOCK.md` | 3-layer architecture + role matrix + execution law |
| `repo/bindings/BINDINGS_AND_REGISTRY.md` | Route bindings + system map + canon index |
| `proof/PROOF_SYSTEM.md` | Host behavior engine + proof index + checklist |

---

## BUILD ORDER (THIS PACK + PACK 1)

1. Commit CAST_CANON_LOCK.md (from Pack 1) FIRST
2. Commit HOST_MASTER.md + HOST_PERSONALITIES.md
3. Commit SHOW_FORMATS.md + SHOW_ENGINE.md + SHOW_FLOW.md
4. Commit VENUE_ENGINE.md
5. Commit WARDROBE_AND_STYLE.md
6. Commit SOUNDTRACK_AND_FAILURE_ENGINE.md
7. Commit PERFORMANCE_AND_PROOF.md
8. Commit GOVERNANCE_AND_EXECUTION_LOCK.md
9. Commit BINDINGS_AND_REGISTRY.md
10. Commit PROOF_SYSTEM.md

---

## CURRENT ACTIVE BLOCKER

**Cloudflare Pages** — musicians-index-api and musicians-index-web

Do NOT build more features until Cloudflare is green.

Paste first 30–50 lines of Cloudflare error to fix it.

---

*TMI Cast System Pack 2 — BerntoutGlobal XXL*
*"This is your stage, be original."*
