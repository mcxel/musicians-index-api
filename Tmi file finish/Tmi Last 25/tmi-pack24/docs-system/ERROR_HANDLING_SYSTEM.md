# ERROR_HANDLING_SYSTEM.md
## Platform-Wide Error Handling — Every Failure Has a Recovery Path
### BerntoutGlobal XXL / The Musician's Index

---

## ERROR TYPES AND RESPONSES

| Error | User Sees | System Does |
|---|---|---|
| API unreachable | Network error banner | Retry with backoff, cache stale data |
| Room crashed | "Room connection lost" overlay | SessionRecoveryProvider rejoin flow |
| Auth expired | Session expired modal | Redirect to /login with return URL |
| 404 Not Found | Custom 404 page | Log 404, suggest similar content |
| 500 Server Error | Custom 500 page | Log to Sentry, alert if rate spikes |
| Payment failed | Inline payment error | Stripe error message, retry option |
| Media load failed | PreviewFallbackCard | Fallback to poster, log asset failure |
| WebSocket dropped | Reconnecting badge | Auto-reconnect × 5 then show manual retry |
| Hydration error | Silent recovery | Log to Sentry, full page reload once |

---

## NEXT.JS ERROR PAGES

```
apps/web/src/app/not-found.tsx     ← 404 page
apps/web/src/app/error.tsx         ← Runtime error boundary
apps/web/src/app/loading.tsx       ← Global loading state
apps/web/src/app/global-error.tsx  ← Catastrophic error (replaces RootLayout)
```

---

## ERROR BOUNDARY HIERARCHY

```
RootLayout (global-error.tsx)
  └── PageLayout (error.tsx)
        └── ComponentErrorBoundary (inline)
              └── PreviewFallbackCard (asset errors)
```

Use `error.tsx` at segment level so one broken page doesn't kill the whole app.

---

## RETRY STRATEGY (Exponential Backoff)

```typescript
const retry = async (fn, maxAttempts = 5) => {
  for (let i = 0; i < maxAttempts; i++) {
    try { return await fn(); }
    catch {
      if (i === maxAttempts - 1) throw;
      await new Promise(r => setTimeout(r, Math.min(1000 * 2**i, 30000)));
    }
  }
};
```

---

## OFFLINE STATE

When network is detected as offline:
- Show OfflineStateBanner (top of page)
- Disable room join (graceful message)
- Cache last-seen lobby state for display
- When back online: refresh lobby, reconnect WebSocket
