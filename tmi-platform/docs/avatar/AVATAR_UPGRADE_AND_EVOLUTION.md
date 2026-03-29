# AVATAR UPGRADE AND EVOLUTION
## TMI Platform — The Musicians Index

---

## Overview

The Avatar Evolution System allows avatars to grow over time based on platform activity. As users earn points, their avatar tier increases, unlocking new costumes, props, zones, and visual effects.

---

## Evolution Tiers

| Tier | Label | Points Required | Glow Color |
|------|-------|----------------|-----------|
| starter | Starter | 0 | #888888 |
| rising | Rising | 500 | #ff6b35 |
| established | Established | 2,000 | #ffd700 |
| featured | Featured | 7,500 | #c0c0ff |
| legendary | Legendary | 25,000 | #ff00ff |

---

## Points Sources

| Activity | Points Earned |
|----------|--------------|
| Join a room | 5 |
| Watch a full show | 25 |
| Tip an artist | 10 per tip |
| Win a contest | 500 |
| Enter a contest | 50 |
| Vote in a contest | 10 |
| Complete onboarding | 100 |
| Daily login | 10 |
| Refer a member | 200 |
| Sponsor placement | 1,000 |
| Article published | 150 |
| Reach leaderboard top 10 | 300 |

---

## Tier Unlock Summary

### Starter (0 pts)
- Costume: casual-default
- Props: mic-standard, glow-stick
- Zones: audience-seat, venue-walkway
- Perks: Basic avatar customization, standard reactions

### Rising (500 pts)
- Costume: + stage-performer, cypher-street
- Props: + mic-wireless, glow-wristband, sign-fan
- Zones: + front-row, cypher-circle
- Perks: Animated glow items, front row access

### Established (2,000 pts)
- Costume: + vip-elite, formal-gala
- Props: + sign-glowing, guitar-electric, guitar-acoustic
- Zones: + vip-balcony, backstage-zone
- Perks: VIP balcony, instrument props, priority seating

### Featured (7,500 pts)
- Costume: + contest-champion
- Props: + mic-golden, dj-headphones, trophy
- Zones: + green-room, sponsor-booth
- Perks: Golden mic, trophy prop, featured profile badge

### Legendary (25,000 pts)
- Costume: + legendary-icon (animated)
- Props: + confetti-cannon
- Zones: + stage-mark, contest-platform, interview-chair
- Perks: Animated aura, confetti cannon, legendary profile badge, priority in all rooms

---

## Memory / Personality System

The avatar memory system stores:

- Preferred pose style
- Preferred costume
- Preferred props
- Favorite venue zones
- Reaction history
- Attention patterns
- Crowd behavior preferences

This data is used to:
- Auto-select default pose on room join
- Suggest costume upgrades
- Personalize idle behavior
- Inform NPC crowd behavior patterns

---

## Copilot Wiring Notes

- Wire `getTierForPoints(points)` to user wallet/points balance
- Wire `getNextTier(tier)` to avatar upgrade notification
- Wire `getPointsToNextTier(tier, points)` to progress bar UI
- Wire tier change to costume/prop unlock notification
- Wire `AvatarMemoryProfile` to user profile save/load
- Wire memory profile to idle behavior defaults
