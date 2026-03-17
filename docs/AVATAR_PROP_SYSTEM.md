# AVATAR PROP SYSTEM

## Overview

The Avatar Prop System defines how audience members and artists interact with virtual props during live performances. Props enhance audience engagement and create a more immersive experience.

---

## Prop Categories

### Audience Props
- **Basic**: candles, lighters, glow sticks, phones, flags
- **Celebration**: confetti, fireworks, champagne, balloons
- **Music Culture**: instruments, records, DJ gear
- **Battle**: roast cards, clap meters, vote torches
- **Seasonal**: holiday-themed props

### Artist Props
- Performance-specific props
- Signature items
- Stage accessories

---

## Prop Behavior

| Behavior | Description | Trigger |
|----------|-------------|---------|
| idleAnimation | Subtle movement when not in use | Always on |
| raiseAnimation | Prop raised/activated | On trigger |
| waveAnimation | Prop waved side to side | On trigger |
| directionalControl | Pointable/aimable | Drag gesture |
| colorVariants | Different color options | Inventory |
| seasonPassVariant | Premium/seasonal variants | Subscription |

---

## Prop Lifecycle

1. **Acquire** - Earned, purchased, or gifted
2. **Equip** - Added to active loadout (max 3)
3. **Activate** - Triggered by user action
4. **Animate** - Plays animation + effects
5. **Cooldown** - Brief cooldown between uses
6. **Deactivate** - Returns to idle state

---

## Prop Effects

| Prop Type | Visual Effect | Audio Effect |
|-----------|---------------|--------------|
| candle | flame glow | crackle |
| glow-stick | neon trail | none |
| confetti | particle burst | pop |
| fireworks | launch + explode | boom |
| heart | float up | none |
| fire | flame animation | crackle |

---

## Crowd Safety Rules

- No offensive prop combinations
- Props must be crowd-safe (no projectiles)
- Mobile fallback for low-end devices
- Mature content filtering

---

## Files Reference

- `data/props/registry.json` - Prop definitions
- `data/inventory/registry.json` - Inventory system
- `data/avatar/widget-layouts.json` - Avatar UI layouts
