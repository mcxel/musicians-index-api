# ROLLBACK RUNBOOK
# TMI Platform — BerntoutGlobal XXL
# Three rollback levels. Use the lowest level that fixes the problem.

---

## LEVEL 1 — SOFT ROLLBACK (broken import, minor build error)

```powershell
# Fix the specific broken file only
pnpm -C apps/api build 2>&1 | Select-String "error"
pnpm -C apps/web build 2>&1 | Select-String "error"
# Identify the file from the error, fix the import, rebuild
```

**Use when:** build fails after placing one or two files

---

## LEVEL 2 — WAVE ROLLBACK (current wave broke the build)

```powershell
cd "C:\Users\Admin\Documents\BerntoutGlobal XXL\tmi-platform"

# Stash current wave changes
git stash

# Verify build is clean without this wave
pnpm -C apps/api build
pnpm -C apps/web build

# If clean: fix only the broken file(s), then:
git stash pop
# Re-fix the broken file(s) only
```

**Use when:** a whole wave (e.g. all of Wave 5) is broken

---

## LEVEL 3 — HARD ROLLBACK (restore last known-good checkpoint)

```powershell
cd "C:\Users\Admin\Documents\BerntoutGlobal XXL\tmi-platform"

# Save anything important
git stash

# Restore to last stable checkpoint
git checkout 21aa9b2

# Reinstall dependencies for this checkpoint
pnpm install

# Verify
pnpm -C apps/api build
pnpm -C apps/web build
```

**Use when:** multiple waves are broken and can't be quickly fixed

---

## PRODUCTION ROLLBACK (Render/Vercel)

### Render API rollback
1. render.com → tmi-api → Events
2. Find last successful deploy
3. Click "Rollback to this deploy"
4. Confirm

### Vercel frontend rollback
1. vercel.com → Project → Deployments
2. Find last successful deployment
3. Click ⋮ → Promote to Production

### Cloudflare Worker rollback
1. Cloudflare → Workers → tmi-worker
2. Deployments tab → find last stable version
3. Click Roll Back

---

## KNOWN CHECKPOINTS

| Checkpoint | Hash | Description |
|---|---|---|
| Last stable baseline | `21aa9b2` | Phase 17.5 — auth/RBAC/health locked |
| After contest install | (update after Wave 7 passes) | Contest system wired |

---

*BerntoutGlobal XXL | TMI Platform | Rollback Runbook | Phase 18.3*
