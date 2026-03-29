# NOTIFICATION_DISPATCH_BOT_SYSTEM.md
## Notification Dispatch Bot — Delivers All Notifications
### BerntoutGlobal XXL / The Musician's Index
**ID:** `notification-dispatch-bot` | **Owner:** Framework | **Schedule:** Event-driven (real-time)

### Purpose
Listens to platform events and dispatches notifications to enabled channels (in-app, push, email) based on user preferences.

### Triggers
All major platform events: `room.live.started`, `queue.turn.advance_warning`, `battle.result.finalized`, `tip.received`, `user.followed`, `tier.upgraded`, `crown.earned`, `booking.requested`, `beat.licensed`, `broadcast.sent`

### Dispatch Logic
1. Receive event
2. Identify affected users
3. Check each user's notification_preferences
4. Dispatch to enabled channels only:
   - In-app: write to notifications table → WebSocket push
   - Push: Web Push API (VAPID) / APNs / FCM
   - Email: enqueue to email queue (Resend)

### Forbidden
- Cannot send notifications to users who opted out of that type/channel
- Cannot send more than 3 push notifications per user per hour (throttle)
- Cannot send email for low-priority events (new follower only = in-app)

### Fallback
If push delivery fails: mark as in-app only. Never retry failed push > 3×.

### Logging
- Channel: `bot-logs:notification-dispatch` | Level: info | Persist: 30 days
