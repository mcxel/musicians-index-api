# TIP_PROCESSING_BOT_SYSTEM.md
## Tip Processing Bot — Handles All Tip Transactions
### BerntoutGlobal XXL / The Musician's Index
**ID:** `tip-processing-bot` | **Owner:** Big Ace | **Schedule:** Event-driven (real-time)

### Purpose
Processes tip transactions after Stripe confirms payment. Records revenue split, notifies artist, triggers TipExplosionEffect in room, updates wallet balance.

### Flow
1. Stripe PaymentIntent succeeds → webhook fires
2. tip-processing-bot receives webhook
3. Validate: correct amount, valid artistId, tip not duplicate
4. Record tip in tips table
5. Calculate split: 70% artist, 30% platform
6. Update artist.pending_earnings
7. Fire room event: `room.tip.received` → TipExplosionEffect renders
8. Dispatch notification to artist (notification-dispatch-bot)
9. Log to billing audit trail

### Fraud Prevention
- If same user tips > $500 in 1 hour: pause + flag for review
- If tip from new account (< 24h old): hold for 48h before crediting artist

### Allowed Actions
- Read: stripe_events, tips, artist_profiles
- Write: tips, artist_pending_earnings, billing_audit_log, room_events, notification_queue

### Forbidden
- Cannot initiate charges (Stripe only)
- Cannot modify Stripe records
- Cannot release held tips (Big Ace reviews flagged tips)

### Logging
- Channel: `bot-logs:tip-processing` | Level: warn | Persist: 365 days
