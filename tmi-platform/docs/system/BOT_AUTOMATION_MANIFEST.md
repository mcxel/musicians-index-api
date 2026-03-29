# BOT_AUTOMATION_MANIFEST.md
# Bot Automation Manifest — Operator Reference
# For engine architecture, see: docs/system/BOT_ORCHESTRATION_SYSTEM.md

## Purpose

This document defines:
- Which bots are operational
- Their trigger conditions
- Their fail-safe behavior
- Operator override procedures
- Escalation steps when bots fail

---

## Operational Bot Registry

| Bot Name | Type | Schedule / Trigger | Critical? |
|----------|------|-------------------|-----------|
| WeeklyResetBot | Cron | Monday 00:00 UTC | YES |
| LeaderboardSnapshotBot | Cron | Sunday 23:55 UTC | YES |
| PointsExpiryBot | Cron | Daily 00:00 UTC | NO |
| OnboardingBot | Event: `user.onboarding.complete` | On event | NO |
| StreamEventBot | Event: `stream.event.recorded` | On event | YES |
| ArtistProfileBot | Event: `artist.profile.created` | On event | NO |
| GameEndBot | Event: `game.session.ended` | On event | YES |
| CypherEndBot | Event: `cypher.session.ended` | On event | YES |
| IssuePublishBot | Manual / Scheduled | Admin trigger | NO |

---

## Fail-Safe Rules (All Bots)

1. Every bot run is wrapped in try/catch — a single bot failure cannot crash the API
2. Every bot run is logged to `BotRunLog` with success/fail and error detail
3. Failed bot does NOT retry automatically (safe default — manual re-run required)
4. If a CRITICAL bot fails 3 consecutive runs → admin notification is sent
5. No bot sends external HTTP requests without a 10-second timeout enforced

---

## Bot-Specific Fail-Safe Behavior

### WeeklyResetBot
- **On failure**: Leaderboard is NOT reset. Users retain their current scores.
- **Safe?**: Yes — data is preserved, no corruption.
- **Operator action**: Investigate BotRunLog, fix root cause, manually trigger from Admin Command Center.
- **Fallback**: Leaderboard is reset next scheduled run.

### LeaderboardSnapshotBot
- **On failure**: No snapshot for that week. Historical record has a gap.
- **Safe?**: Yes — no data corruption, but weekly history is incomplete.
- **Operator action**: If missed, run manually before WeeklyResetBot runs.

### PointsExpiryBot
- **On failure**: No points are expired that day. Users retain full balance.
- **Safe?**: Yes — conservative fail (no data loss).
- **Operator action**: Manual re-run or accept one day's skip.

### StreamEventBot
- **On failure**: Stream event is not validated, points NOT awarded.
- **Safe?**: Yes — conservative fail (no incorrect points awarded).
- **Operator action**: User may report missing points — admin can manually award via `/api/points/admin/award`.
- **Fallback**: Log event for retry. Implement Bull queue for retry in later build.

### GameEndBot / CypherEndBot
- **On failure**: Prize points NOT distributed. Scores recorded but not rewarded.
- **Safe?**: Yes — conservative fail.
- **Operator action**: Admin can manually award points to affected users via admin panel.

### OnboardingBot
- **On failure**: Welcome email not sent, starter points not awarded.
- **Safe?**: Yes — user can still use the platform.
- **Operator action**: Admin can manually trigger onboarding rewards.

### ArtistProfileBot
- **On failure**: Profile article stub not auto-created.
- **Operator action**: Admin manually creates profile article.

---

## Operator Override Procedure

### Via Admin Command Center (Preferred)
1. Log in as ADMIN
2. Navigate to `/admin` → "Bots" tab
3. Select bot by name
4. Click "Manual Run"
5. Watch inline log output
6. Confirm BotRunResult shows `success: true`

### Via API (Emergency)
```bash
curl -X POST https://[your-api]/api/admin/bots/WeeklyResetBot/run \
  -H "Authorization: Bearer [admin-token]" \
  -H "Content-Type: application/json"
```

Expected response:
```json
{ "success": true, "itemsProcessed": 42, "durationMs": 1230 }
```

---

## Escalation Path

| Scenario | Response |
|----------|---------|
| Bot failed once | Log review → manual re-run if critical |
| Bot failed 3× consecutively | Admin notified → root cause investigation → fix → re-run |
| Bot scheduled window missed (no log entry) | Check API health → check cron scheduler initialized → restart API |
| Bot causing DB corruption | STOP API → rollback DB → investigate → fix before restart |
| Bot causing excessive DB writes | Kill bot process (disable in BotRegistry) → investigate → fix |

---

## Bot Health Dashboard (Admin View)

Admin Command Center → Bots tab shows:

| Column | Description |
|--------|-------------|
| Bot Name | Bot identifier |
| Last Run | Timestamp of most recent run |
| Status | ✅ Success / ❌ Failed / ⏳ Pending |
| Items Processed | How many records were affected |
| Duration | Run time in ms |
| Consecutive Failures | Count of consecutive failures |
| Action | "Manual Run" button |
