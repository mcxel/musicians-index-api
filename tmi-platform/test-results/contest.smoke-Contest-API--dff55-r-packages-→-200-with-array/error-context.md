# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: contest.smoke.spec.ts >> Contest API Endpoints >> GET /api/contest/sponsor-packages → 200 with array
- Location: tests\e2e\contest.smoke.spec.ts:79:7

# Error details

```
Error: apiRequestContext.get: connect ECONNREFUSED ::1:4000
Call log:
  - → GET http://localhost:4000/api/contest/sponsor-packages
    - user-agent: Playwright/1.60.0 (x64; windows 10.0) node/24.16
    - accept: */*
    - accept-encoding: gzip,deflate,br

```