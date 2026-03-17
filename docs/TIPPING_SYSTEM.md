# TIPPING SYSTEM

## Overview

The Tipping System enables audience members to send virtual tips to artists during live performances. Tips provide direct monetization and fan engagement.

---

## Tip Tiers

| Tier | Amount | Visual Effect | Sound |
|------|--------|---------------|-------|
| spark | $0.99 | small spark | click |
| flame | $4.99 | fire burst | chime |
| inferno | $9.99 | fire tornado | roar |
| supernova | $24.99 | explosion | explosion |
| blackhole | $99.99 | void effect | deep boom |

---

## Tip Events

### On Send
1. Tip animation plays for sender
2. Tip notification appears in chat
3. Artist receives notification
4. Leaderboard updates
5. Reward triggers (if applicable)

### Artist Side
- Toast notification
- Sound effect
- Tip count increment
- Revenue ledger update

---

## Tip Effects

| Effect | Duration | Animation | Zone |
|--------|----------|-----------|------|
| spark | 1s | particle burst | screen corner |
| flame | 2s | fire column | center |
| inferno | 3s | tornado | full screen |
| supernova | 4s | explosion + shockwave | full screen |
| blackhole | 5s | void + gravity | full screen |

---

## Revenue Split

- Platform fee: 30%
- Artist revenue: 70%
- Payout schedule: Weekly

---

## Tip Jar Integration

- Floating button in player corner
- Quick amounts: $1, $5, $10, $25
- Custom amount option
- Tip message (optional)

---

## Leaderboard

- Top tippers per show
- All-time tippers
- Artist-specific leaderboards
- Real-time updates

---

## Files Reference

- `data/tipping/events.json` - Tip events
- `data/tipping/effects.json` - Visual effects
- `data/rewards/registry.json` - Tip rewards
