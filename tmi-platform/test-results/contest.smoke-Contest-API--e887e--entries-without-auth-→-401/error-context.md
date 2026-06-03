# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: contest.smoke.spec.ts >> Contest API Endpoints >> POST /api/contest/entries without auth → 401
- Location: tests\e2e\contest.smoke.spec.ts:99:7

# Error details

```
Error: apiRequestContext.post: connect ECONNREFUSED ::1:4000
Call log:
  - → POST http://localhost:4000/api/contest/entries
    - user-agent: Playwright/1.60.0 (x64; windows 10.0) node/24.16
    - accept: */*
    - accept-encoding: gzip,deflate,br
    - content-type: application/json
    - content-length: 40

```