# Hub Physical Convergence Cert

**Branch:** `eos/vocal-improv-clean`  
**Date:** 2026-09-02  
**Script:** `scripts/cert-physical-hub-convergence.mjs`  
**Evidence:** `.cursor/artifacts/hub-physical-convergence/`

## Verdict

| Gate | Result |
|------|--------|
| Obsolete secondary nav removed | PASS |
| Canonical command strip (12 controls) | PASS |
| Beta feedback center-left / non-colliding | PASS |
| YoPho canonical in-place (post-hydrate) | PASS |
| Universal player source ownership | PASS (prior full run; re-check when server stable) |
| Fan Hub desktop 1280×800 | PASS |
| Fan Hub mobile 390×844 | PASS |
| Performer Hub desktop / mobile | BLOCKED — Next.dev OOM / connection reset compiling `/hub/performer` |

## YoPho hydrate root cause

Playwright was asserting against **SSR HTML** that already contained `[data-testid="tmi-cast-*"]`.  
`CommandCenterShell` / `CommandCenterMediaStack` client work (`data-shell-build`, `__TMI_OPEN_YOPHO__`, `data-tmi-open-yopho-fn`) only appears after the huge hub client chunk finishes hydrating (~30–60s in dev).

During hydrate there is a blank gap (SSR wiped → remount). Opening YoPho before markers exist no-ops.

### Fix shipped

1. **`CommandCenterShell`** — isolate `useSearchParams` in `HubSearchParamsBridge` behind `<Suspense>` so the shell can mount/hydrate without the whole tree CSR-bailout depending on search params. Stamp `data-shell-build` on client render + effect. Keep `__TMI_OPEN_YOPHO__` assign-every-render bridge.
2. **`CommandCenterMediaStack`** — assign `__TMI_OPEN_YOPHO__` + `data-tmi-open-yopho-fn` every client render (not effect-only).
3. **Hub pages** — Suspense around Fan/Performer mounts.
4. **Cert** — wait for hydrate markers with Playwright `waitForFunction(fn, null, { timeout })` (options are the **third** arg), then call `__TMI_OPEN_YOPHO__()`.

### Physical proof (this session)

```
shellBuild: ccs-2026-08-27-canonical-slice1
openFn: function
drawer: open
yophoNode: true
activePanel: yopho
panels: ["YOPHO"]
intent: 1
btnClick: 1
→ ✔ Hub -> YOPHO opens canonical YoPho drawer in place
```

Focused probe `scripts/probe-yopho-open.mjs` also returned `YOPHO_OK` with canonical workspace + drawer + compact panel.

## How to re-run

```bash
# From repo root, with Next on :3000 (prefer NODE_OPTIONS=--max-old-space-size=8192)
CERT_GOTO_WAIT=commit CERT_NAV_TIMEOUT_MS=300000 node scripts/cert-physical-hub-convergence.mjs
```

## Open blockers

1. **Dev server dies** compiling `/hub/fan` or `/hub/performer` (EADDRINUSE/reset/silent exit) — likely memory pressure from ~33MB hub page chunk. Not a YoPho logic fail.
2. Performer Hub physical screenshots not re-captured in the interrupted full pass after YoPho PASS.
3. Hub chunk size / compile time still causes a long SSR→hydrate gap; Suspense isolation helps shell markers but does not shrink the bundle.
