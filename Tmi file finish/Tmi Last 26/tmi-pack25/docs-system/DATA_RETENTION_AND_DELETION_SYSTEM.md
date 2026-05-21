# DATA_RETENTION_AND_DELETION_SYSTEM.md
## What Data Is Kept, For How Long, and How to Delete It
### BerntoutGlobal XXL / The Musician's Index

---

## RETENTION PERIODS

| Data Type | Retention | Reason |
|---|---|---|
| Active user accounts | Until deletion requested | Ongoing service |
| Deleted user accounts (personal data) | 30-day grace period, then hard delete | User-controlled |
| Financial transaction records | 7 years | Tax/legal compliance |
| Anonymized analytics events | Indefinitely | Platform improvement |
| Chat messages | 90 days | Moderation + safety |
| Moderation audit logs | 365 days | Safety |
| Family/kid activity logs | 365 days | Child safety legal requirement |
| Media files (active) | Until account deleted | Service delivery |
| Media files (deleted user) | 30 days after account deletion | Grace period |
| Backup snapshots | 30 days | Recovery |
| Application logs | 30 days | Debugging |

---

## DELETION FLOW

### User-Initiated Account Deletion

```
Day 0:  User requests deletion
        → account flagged: deletionRequestedAt, deletionScheduledAt = Day 30
        → email sent: "Deleting in 30 days. You can cancel."
        → account stays fully functional during grace period

Day 1-29: User can cancel by visiting /settings/account → Cancel Deletion

Day 30: account-deletion-bot runs nightly
        → checks all accounts where deletionScheduledAt < now()
        → executes deletion:
           1. Soft-delete all posts, articles, comments
           2. Remove media from R2 (queue deletion job)
           3. Anonymize transactions (keep for tax, remove personal data)
           4. Delete wallet, notification prefs, settings
           5. Delete user row
           6. Revoke all sessions
```

### Admin-Initiated Deletion

Big Ace can force-delete accounts (e.g., CSAM violation):
- Immediate hard delete (no grace period)
- Route: /admin/users → Delete Account

---

## EXPORT DATA PACK CONTENTS

When user requests export (/api/settings/export-data):

```
profile.json          → profile data, settings, preferences
content.json          → articles, posts, comments authored
transactions.json     → all transaction history
messages.json         → DM history (last 90 days only, per chat retention)
follows.json          → following/follower lists
playlists.json        → playlist data
notifications.json    → notification history (30 days)
media-urls.txt        → list of media file URLs (not the files themselves)
```

Download link expires after 48 hours. User can request once per 30 days.
