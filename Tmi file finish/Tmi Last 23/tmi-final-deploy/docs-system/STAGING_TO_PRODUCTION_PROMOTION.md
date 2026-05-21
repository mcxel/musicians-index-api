# STAGING_TO_PRODUCTION_PROMOTION.md
## How Code Moves From Dev → Preview → Production
### BerntoutGlobal XXL / The Musician's Index

---

## BRANCH AND ENVIRONMENT MAPPING

| Branch | Environment | Auto-Deploy | URL |
|---|---|---|---|
| `main` | Production | Yes | themusiciansindex.com |
| `staging` | Staging | Yes | staging.themusiciansindex.com |
| `feature/*` | Preview | Yes (Cloudflare Pages preview) | preview-{hash}.pages.dev |
| `develop` | Development | Local only | localhost:3000 |

---

## PROMOTION CHECKLIST

### Feature → Staging
- [ ] PR opened against `staging`
- [ ] Code review completed
- [ ] Lint + typecheck pass
- [ ] Unit tests pass
- [ ] No CONSOLE.LOG commits
- [ ] No hardcoded URLs
- [ ] PR merged → auto-deploys to staging

### Staging → Production
- [ ] All staging proofs pass (see PLATFORM_PROOF_MATRIX.md)
- [ ] Load test run on staging
- [ ] No active incidents on staging
- [ ] Feature flags configured correctly for production
- [ ] Database migrations tested on staging first
- [ ] PR opened: staging → main
- [ ] Final review
- [ ] Merge → auto-deploys to production

---

## DATABASE MIGRATION STRATEGY

Never run untested migrations directly in production.

Process:
1. Test migration on local dev
2. Run migration on staging database first
3. Verify application works on staging
4. Run migration on production database (during low-traffic window)
5. Deploy API to production

If migration fails in production:
→ Roll back API to previous version (Render rollback)
→ Run `prisma migrate resolve --rolled-back {name}`
→ Investigate
