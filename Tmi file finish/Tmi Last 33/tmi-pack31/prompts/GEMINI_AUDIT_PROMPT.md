# GEMINI_AUDIT_PROMPT.md
## Paste to Gemini After Each Copilot Slice — Audit + Fix
### BerntoutGlobal XXL / The Musician's Index

---

```
GEMINI — TMI PLATFORM AUDIT

Copilot has wired a slice. Your job: audit, find errors, fix them.

AUDIT CHECKLIST:

1. BUILD AUDIT
   pnpm -C apps/api typecheck    → must exit 0
   pnpm -C apps/web typecheck    → must exit 0
   pnpm -C apps/web build        → must exit 0

2. ROUTE AUDIT
   Find all page.tsx files: find apps/web/src/app -name "page.tsx"
   Check each has exactly ONE default export
   Check no code exists outside component functions
   Check no duplicate component definitions in same file

3. DISCOVERY AUDIT (critical)
   pnpm test:discovery
   → Must pass. If it fails: check /api/rooms?sort=viewers_asc
   → 0-viewer artist must appear at position 1 in lobby wall
   → This blocks all deploys if failing

4. PROVIDER AUDIT
   grep -r "AudioProvider" apps/web/src/app -l
   → Must appear in ONLY ONE file (root layout.tsx)
   Same check for SharedPreviewProvider, TurnQueueProvider

5. IMPORT AUDIT
   Any missing imports → TypeScript will report them
   Any circular imports → trace with: pnpm -C apps/web build 2>&1 | grep "circular"

6. RUNTIME AUDIT
   curl http://localhost:4000/health
   curl http://localhost:4000/api/readyz
   → Both must return 200

7. KEY ROUTES AUDIT
   curl -I http://localhost:3000/              → 200
   curl -I http://localhost:3000/dashboard/artist → redirect to /login if not authed
   curl -I http://localhost:3000/stations/test → 200
   curl -I http://localhost:3000/articles/test → 200

8. SAFETY AUDIT
   Check canSendMessage() is applied to POST /api/messages
   Check ticket anti-bot check on POST /api/tickets/purchase-check
   Check child account route blocking in middleware

9. VISUAL AUDIT
   Check page backgrounds are #0D0520 (not white)
   Check no generic SaaS styling crept in
   Check Bebas Neue/Oswald fonts loading on key pages

REPORT FORMAT:
  ✅ BUILD: passing/failing + specific errors
  ✅ ROUTES: count of pages, any with errors
  ✅ DISCOVERY TEST: passing/failing
  ✅ PROVIDERS: singleton count for each
  ✅ RUNTIME: health endpoints status
  ✅ SAFETY: canSendMessage present Y/N
  ⚠️ ISSUES FOUND: list with file + line number
  🔧 FIXES APPLIED: list what was changed

Fix all issues before reporting back.
Do not proceed to next slice until this audit passes.
```
