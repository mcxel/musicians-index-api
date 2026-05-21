# TICKET_ANTI_BOT_RULES.md
## Ticket Purchase Limits and Anti-Bot Protection
### BerntoutGlobal XXL / The Musician's Index

---

## HARD PURCHASE LIMITS

```
Per event, per user account:         MAX 8 TICKETS
Per event, per payment method:       MAX 8 TICKETS
Per event, per device fingerprint:   MAX 8 TICKETS
Per event, per IP address:           MAX 16 TICKETS (slightly higher for households)
```

These limits are non-configurable at the product level.
Only Big Ace can override per-event limits (e.g., for high-demand charity events).

---

## ANTI-BOT STACK

### Layer 1: Cloudflare Turnstile (invisible, no friction for real users)
```typescript
// Every ticket purchase attempt must include turnstileToken
// Verify server-side before any inventory is touched
const result = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
  method: 'POST',
  body: JSON.stringify({ secret: process.env.TURNSTILE_SECRET, response: turnstileToken }),
});
if (!result.success) throw new Error('bot_detected');
```

### Layer 2: Purchase velocity check
```typescript
// Redis: track purchase attempts per IP per event
const key = `ticket:velocity:${ip}:${eventId}`;
const attempts = await redis.incr(key);
await redis.expire(key, 300);  // 5-minute window
if (attempts > 20) throw new Error('velocity_exceeded');
```

### Layer 3: Account age check
```typescript
// Accounts created < 24 hours ago get an additional CAPTCHA challenge
const accountAgeHours = (Date.now() - user.createdAt.getTime()) / 3600000;
if (accountAgeHours < 24) requireHardCAPTCHA();
```

### Layer 4: Purchase history anomaly
```typescript
// If same user purchased for >3 different events in 1 hour: flag for review
const recentPurchases = await countRecentTicketPurchases(userId, 3600000);
if (recentPurchases > 3) await flagForReview(userId, 'velocity_anomaly');
```

---

## QUEUE MODE (HOT EVENTS)

For events where ticket demand is expected to exceed inventory:

```
Event is flagged as 'hot_event' by Big Ace or by system when:
  - >1000 page views in 10 minutes before sale start
  - Listed price >$9.99 (premium tier)
  - Artist with Diamond tier or Crown status performing

Hot event behavior:
  1. Virtual queue enabled before sale start
  2. Users join queue → receive position number
  3. Position counted every 30 seconds
  4. Users notified when it's their turn (WebSocket + push)
  5. Reservation window: 5 minutes to complete purchase
  6. Expired reservations go back to queue
```

---

## RESALE/TRANSFER POLICY

```
Ticket transfer: allowed up to 24 hours before event
Ticket resale: BLOCKED — no secondary marketplace
If original buyer can't attend: transfer to one person per ticket via /tickets/transfer
Transfer via: /my-tickets → Transfer → enter recipient email
```

---

## SUSPICIOUS PURCHASE REVIEW PATH

```
If purchase is flagged (velocity, age, fingerprint):
  1. Purchase goes to 'held' status (not confirmed, not refunded)
  2. Purchaser sees: "Your purchase is being reviewed (< 1 hour)"
  3. content-moderation-bot reviews + approves/denies
  4. If approved: tickets confirmed, payment captured
  5. If denied: payment intent cancelled, user notified
  6. If not reviewed in 1 hour: auto-approve (avoid false positives)
```
