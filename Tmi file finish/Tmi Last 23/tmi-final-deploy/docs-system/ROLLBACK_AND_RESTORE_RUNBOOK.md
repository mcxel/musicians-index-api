# ROLLBACK_AND_RESTORE_RUNBOOK.md
## How to Roll Back When Something Goes Wrong
### BerntoutGlobal XXL / The Musician's Index

---

## ROLLBACK OPTIONS BY LAYER

### Option 1: Emergency Feature Flag Kill Switch (Fastest — <60 seconds)
```
POST /api/admin/flags { EMERGENCY_READ_ONLY_MODE: true }
→ Platform goes read-only immediately
→ No deploy needed
→ Fix the issue
→ POST /api/admin/flags { EMERGENCY_READ_ONLY_MODE: false }
```

### Option 2: Render API Rollback (<2 minutes)
```
1. Render Dashboard → tmi-api → Deploys
2. Find last successful deploy (green checkmark)
3. Click "Rollback to this deploy"
4. Confirm
5. API is back on previous version
```

### Option 3: Cloudflare Pages Rollback (<2 minutes)
```
1. Cloudflare Dashboard → Pages → tmi-web → Deployments
2. Find last successful deployment
3. Click "..." → "Rollback to this deployment"
4. Confirm
5. Web app is back on previous version
```

### Option 4: Database Rollback (Most careful — use last)
```
1. Only if a migration caused the issue
2. Run: pnpm -C packages/db run db:migrate:rollback
   or: npx prisma migrate resolve --rolled-back {migration_name}
3. Ensure API is rolled back FIRST (DB schema must match API version)
```

---

## ROLLBACK DECISION TREE

```
Issue detected
  ↓
Is it a feature behavior issue?
  YES → Use Feature Flag Kill Switch (Option 1)
  NO  ↓
Is it an API error?
  YES → Option 2 (Render rollback)
  NO  ↓
Is it a web app error?
  YES → Option 3 (Cloudflare rollback)
  NO  ↓
Is it a data/migration error?
  YES → Option 4 (DB rollback — careful)
```

---

## POST-ROLLBACK CHECKLIST

After any rollback:
- [ ] Run health probe: `curl https://api.themusiciansindex.com/health`
- [ ] Run readyz probe: `curl https://api.themusiciansindex.com/api/readyz`
- [ ] Verify homepage loads
- [ ] Verify auth works
- [ ] Disable EMERGENCY_READ_ONLY_MODE if it was enabled
- [ ] Post incident note to /status page
- [ ] Document in INCIDENT_TIMELINE (ops log)
