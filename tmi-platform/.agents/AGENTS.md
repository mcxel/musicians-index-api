# TMI Platform — Workspace AGENTS Customization File

## 12. CERTIFICATION GATE & PRIORITY LAW (2026-08-05 LOCK)

### Certification Status Rules
Nothing moves into the locked production baseline until each required behavior is verified in the running application, not just in the source code.

Certification Status Checklist:
- ✅ Security plan defined
- ✅ Scope locked
- ✅ Investigation completed
- ✅ Implementation verification (Security Stability Slices A+B — code-enforced admit)
- ⏳ Browser verification pending
- ⏳ Clean console pending
- ⏳ DOM verification pending
- ⏳ Final certification earned

### Priority Execution Stack
1. **Priority 1 — Security (Must Fix First)** — **ADMITTED (code-enforced, 2026-08-20)**:
   - Partner workspace switcher off for normal admin (`includeWorkspaces={false}`; `partnerWorkspaceSwitcherAllowed()`).
   - Workspace never resolved from `?workspace=` (`resolveWorkspaceFromSession` ignores query).
   - Workspace from authenticated session + membership map only.
   - Unauthorized → 403 UI (`data-http-status="403"`) + resolver status 403.
   - Governance override is a separate audited path (`partnerWorkspaceSwitcherAllowed({ governanceOverride: true, ... })`).
   - Cert runner: `apps/web/src/tests/runSecurityStabilityCertification.test.ts` (Slices A+B).
2. **Priority 2 — Floating Widgets**:
   - Trace rendered DOM in DevTools back to React component (Green ADMIN CAM / GO LIVE & Purple mic widget).
   - Remove render path completely at the owning component level instead of hiding with CSS.
3. **Priority 3 — Hydration Errors**:
   - Treat React errors #418, #423, and #425 as production blockers.
   - Verify individually: live clock output, URL-derived state, localStorage, client-only session data, locale/date formatting, notification counts.
4. **Priority 4 — Dead Routes**:
   - Redirect or remove dead routes (e.g. /admin/certification → /admin/runtime-check).
5. **Priority 5 — Control Room Cleanup**:
   - Replace old monitor footer text with real media telemetry, finish status labels, remove placeholder UI, continue Rule 20 cleanup.

### Development Cycle 2 Scope Lock
Do NOT touch or start Development Cycle 2 items until the certification slice above is 100% closed:
- Magazine Runtime v2
- Split Action Framework
- Sound Runtime
- Universal Media Surface
- Venue Runtime
- Media Player Stage 2 enhancements
- Sponsor expansion
- Reward system expansion

---

## 13. TMI ANTI-BLOAT LAW, CERTIFICATION LAW & MASTER ACCEPTANCE TEMPLATES

### TMI Anti-Bloat Law (Permanent Repo Law)
> **TMI should grow by evolving canonical master files and registries, not by endlessly creating new files, duplicate logs, temporary variants, and binary dumps.**

```text
CONSOLIDATE BEFORE CREATE.
REFERENCE BEFORE COPY.
PROMOTE BEFORE COMMIT.
OPTIMIZE BEFORE STORE.
REGISTER BEFORE DUPLICATE.
MASTER FILES EVOLVE IN PLACE.
LARGE BINARIES STAY OUT OF GIT.
TEMPORARY OUTPUT STAYS OUT OF GIT.
GIT IS SOURCE HISTORY, NOT A FILE WAREHOUSE.
```

### The 5-Point File Creation Test
Before creating ANY new file, evaluate:
1. Does a canonical file already own this responsibility?
2. Can this be added to an existing registry/runtime/master ledger?
3. Is this temporary output that belongs in `.gitignore`?
4. Is this a large binary that belongs outside Git?
5. Is this actually a distinct module with a durable responsibility?
*Only if #5 is genuinely true should a new permanent file be created.*

### Certification Law
```text
CODE EXISTS ≠ FEATURE CERTIFIED
AUTOMATED TEST PASSES ≠ PHYSICAL CERTIFICATION
PHYSICAL PASS = exact required behavior observed on real device/runtime without hidden workarounds.
If a physical test FAILS: record exact failing step first, then modify ONLY the failing execution path. Do not redesign frozen architecture.
```