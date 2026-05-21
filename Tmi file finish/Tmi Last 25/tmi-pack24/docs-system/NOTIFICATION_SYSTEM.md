# NOTIFICATION_SYSTEM.md
## In-App, Push, and Email Notifications
### BerntoutGlobal XXL / The Musician's Index

---

## NOTIFICATION TYPES

| Type | Channel | When |
|---|---|---|
| Turn coming up | In-app + Push | 2 turns before yours in queue |
| Battle invite | In-app + Push | Someone challenges you |
| Collab invite | In-app + Push | Artist/producer invites you |
| Booking request | In-app + Email | New booking submitted |
| New follower | In-app | Someone follows your profile |
| Fan club join | In-app + Email | New fan club member |
| Tip received | In-app + Email | Tip from a fan |
| Room going live | Push | Artist you follow starts room |
| Battle result | In-app + Email | Battle outcome confirmed |
| Season rank change | In-app | Your ranking moves |
| Crown earned | In-app + Push + Email | You won the crown |
| Tier upgrade | In-app + Email | Subscription upgraded |
| Beat licensed | In-app + Email | Someone licensed your beat |
| Article published | In-app | You're featured in an article |
| Platform broadcast | In-app + Push | Big Ace announcement |

---

## DELIVERY PIPELINE

```
Event fires (e.g. room.turn.advanced)
     ↓
notification-dispatch-bot picks up event
     ↓
Check user notification preferences
     ↓
Dispatch to enabled channels:
  - In-app: write to notifications table → WebSocket push
  - Push: Web Push API (VAPID) / APNs / FCM
  - Email: Resend API (transactional template)
```

## NOTIFICATION PREFERENCES (Per User)

Users can turn on/off each notification type per channel (in-app/push/email).
Stored in `notification_preferences` table.

## IN-APP NOTIFICATION BELL

- UnreadCount badge on NotificationBell
- Opens NotificationPanel (last 20 notifications)
- Mark individual as read / Mark all as read
- Notification types grouped with icons

## ROUTES

`/notifications` — full notification history
`/settings/notifications` — manage preferences
