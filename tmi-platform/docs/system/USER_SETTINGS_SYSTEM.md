# USER_SETTINGS_SYSTEM.md
## User Settings — All Configurable Preferences
### BerntoutGlobal XXL / The Musician's Index

---

## SETTINGS SECTIONS

### Profile Settings
- Display name
- Username (slug) — must be unique
- Avatar (upload)
- Banner (upload)
- Bio (500 char max)
- Genre tags (up to 5)
- City/Region
- Links (website, social, music)

### Notification Settings
(Managed by NotificationPreferencesPanel)
- Per-type, per-channel toggles
- Weekly digest on/off

### Privacy Settings
- Profile visibility: Public / Followers only / Private
- Show online status: On / Off
- Allow direct messages: Everyone / Followers only / Nobody
- Allow friend requests: On / Off
- Data export (generate download link)

### Billing Settings
- Current subscription tier
- Payment methods (view/add/remove)
- Subscription history
- Fan credits balance
- Payout settings (artist only)

### Account Settings
- Change email
- Change password
- Two-factor authentication (future Phase 2)
- Delete account (30-day grace period)
- Download my data

---

## ACCOUNT DELETION FLOW

```
1. User initiates: POST /api/settings/account/delete { confirm: 'DELETE', password }
2. Platform sets: deletionRequestedAt = now(), deletionScheduledAt = now() + 30 days
3. Email sent: "Your account will be deleted in 30 days. Cancel at any time."
4. User can cancel: DELETE /api/settings/account/delete-cancel within 30 days
5. After 30 days: account-deletion-bot runs nightly and deletes accounts past deadline
6. Data deleted: user row, all content, media purged from R2
7. What's kept: anonymized transaction records (legal requirement, 7 years)
```

---

## DATA EXPORT

```
1. User requests: POST /api/settings/export-data
2. Platform generates download package asynchronously (export-data-bot)
3. Package includes: profile data, content, transaction history, messages
4. Email sent when ready with download link (expires 48 hours)
5. Route: /settings/account → "Download My Data" button
```
