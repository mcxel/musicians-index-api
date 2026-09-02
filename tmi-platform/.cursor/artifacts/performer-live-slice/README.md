# Performer Live presentation slice artifacts

**Gate:** `PERFORMER_LIVE_PRESENTATION_SLICE`  
**Doc:** `docs/audit/PERFORMER_LIVE_PRESENTATION_SLICE.md`

## Harness

```bash
node .cursor/artifacts/performer-live-slice/cert-performer-live.mjs
```

Env: `E2E_BASE_URL` / `TMI_BASE_URL` (default `http://localhost:3000`), cert performer credentials.

## Expected checks

- publication_post / fabric_canary_observatory (canary preserved)
- **production_presentation** — `__TMI_PERFORMER_LIVE_PROGRAM__.surfaceKind=production` + DOM `data-performer-live-presentation=production`
- slot_swap_continuity — same session id after SWAP
- teardown — END LIVE clears canary + program

Screenshots: `01-hub-before.png`, `02-after-golive.png`, `03-after-end.png`
