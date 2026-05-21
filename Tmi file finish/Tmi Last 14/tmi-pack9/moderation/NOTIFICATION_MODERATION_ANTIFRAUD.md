# NOTIFICATION · MODERATION · ANTI-FRAUD SYSTEMS

---

# NOTIFICATION_SYSTEM.md
## How the Platform Communicates With Users

---

## NOTIFICATION TYPES

| Type | Channel | Trigger |
|---|---|---|
| Artist going live | Push + In-app | Followed artist starts stream |
| Event starting (15 min) | Push + Email | Registered for event |
| Event starting (1 min) | Push | Final reminder |
| New article | In-app | Followed artist publishes |
| Tip received | In-app | Real-time |
| Points milestone | In-app | Crossing tier threshold |
| Tier upgrade | In-app + Email | Room/membership upgrade |
| Show result | In-app | Show your artist was in ends |
| Monthly Idol round | Email | Weekly round begins |
| Payout processed | Email | Artist payout sent |
| Platform announcement | All channels | Big Ace broadcasts |
| Emergency alert | Push + Banner | Platform emergency |

---

## NOTIFICATION PREFERENCES (User Controls)

Users can toggle per-channel:
- Push notifications: ON/OFF per category
- Email: ON/OFF per category
- In-app: always ON (cannot disable)
- Digest mode: one email per day vs real-time

---

## NOTIFICATION RULES

1. No notification spam — same artist max 1 push per hour
2. Quiet hours (user timezone): no push between 11pm–7am unless opted in
3. Julius delivers in-app notifications (in-character voice)
4. Emergency alerts bypass all preferences

---

## JULIUS NOTIFICATION DELIVERY

When an in-app notification fires:
- Julius appears briefly with the notification
- Speaks in character: "Hey! [Artist] just went live!"
- User can dismiss or jump in
- Julius retreats after 4 seconds if no interaction

---

# MODERATION_SYSTEM.md
## Chat, Content, and Safety Controls

---

## CHAT MODERATION

### Auto-Filter (Immediate)
Immediately blocked without review:
- Slurs and hate speech (word list maintained)
- Sexual content / explicit
- URLs / links (not from platform)
- Phone numbers / personal info
- Repeated identical messages (spam)

### Human Review Queue
Flagged for manual review:
- Reported messages
- Messages near the auto-filter threshold
- Accounts with 3+ reports

### Auto-Mute Rules
User auto-muted from chat for:
- 3 identical messages in 60 seconds
- 1 confirmed slur hit
- 5 reports from different users in 24h

---

## CONTENT MODERATION

### Artist Content
Artist uploads (audio, video, images) pass through:
1. Auto-scan (copyright + explicit detection)
2. Flagging queue if uncertain
3. Manual review if flagged
4. Approved or removed

### User-Generated
- Chat messages: auto-filter + report system
- Reaction messages: no content risk
- Profile names: auto-filter on signup

---

## REPORT SYSTEM

Users can report:
- Chat message
- Artist profile
- Specific content
- Show/event

Report flow:
1. User taps Report
2. Selects reason (hate speech / spam / explicit / harassment / other)
3. Optional note
4. Submitted to moderation queue
5. Reported item flagged in queue
6. Action taken within 24h

---

## MODERATION ROLES

| Role | Access |
|---|---|
| Moderation Bot | Auto-filter + auto-mute |
| Mod Queue (human) | Review flagged items |
| Big Ace | Override any mod decision |

---

# ANTI_FRAUD_ENGINE.md
## Platform Integrity — Fake Views, Fake Tips, Bot Protection

---

## PURPOSE
Protect artists and fans from fake engagement, artificial rank manipulation, and payment fraud.

---

## FAKE VIEW DETECTION

Signals that flag a viewer as suspicious:
- Same IP with 5+ accounts
- Joining and leaving within 30 seconds (repeated)
- No profile, no history, first action is watching
- Viewer count inflates faster than platform referral data supports
- Account created within 24h of event

**Action**: Suspicious viewers still see the event but their view count contribution is withheld pending verification.

---

## FAKE TIP DETECTION

Signals that flag a tip as suspicious:
- Tip from account created in last 24 hours
- Tip via payment method with no prior verified transactions
- Multiple tips in rapid succession from same IP
- Refund pattern on prior events

**Action**: Tip held in escrow for 72 hours before adding to artist earnings. High-risk tips flagged for manual review.

---

## FAKE RANK MANIPULATION

Signals that a rank is being artificially manipulated:
- Sudden follower spike (1000+ in 24h) from new/empty accounts
- Points accumulation inconsistent with any event history
- IP cluster following the same artist in bulk

**Action**: Rank flagged for audit. Suspicious followers quarantined. Artist notified.

---

## BOT DETECTION

Platform checks for bot behavior:
- Reaction at mathematically consistent intervals
- Never scrolling or browsing (direct-to-event bots)
- No real device fingerprint
- Headless browser signals

**Action**: Bot accounts silently downgraded. Cannot vote, tip, or affect energy meter.

---

## PAYMENT FRAUD

Rules:
- Stripe fraud detection integrated
- 3DS required for tips $50+
- Chargeback triggers account review
- 3 chargebacks = account suspended

---

## ARTIST PROTECTION RULES

Artists are never penalized for fraud they didn't cause.
If a fake view or tip is detected:
- Points/rank from the fraudulent engagement are reversed
- Artist earnings already paid are NOT clawed back (fraud insurance pool covers)
- Artist is notified of what happened

---

*Notification + Moderation + Anti-Fraud v1.0 — BerntoutGlobal XXL*
