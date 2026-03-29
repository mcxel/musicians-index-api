# AVATAR COSTUME AND PROP SYSTEM
## TMI Platform — The Musicians Index

---

## Overview

Costumes and props are the visual identity layer of the avatar system. They are unlocked by evolution tier and role, and can be equipped by the user in the Avatar Center.

---

## Costume Registry

| ID | Label | Tier Required | Category |
|----|-------|--------------|----------|
| casual-default | Casual Default | starter | casual |
| stage-performer | Stage Performer | rising | performance |
| cypher-street | Cypher Street | rising | street |
| vip-elite | VIP Elite | established | vip |
| formal-gala | Formal Gala | established | formal |
| contest-champion | Contest Champion | featured | contest |
| legendary-icon | Legendary Icon | legendary | legendary |

---

## Prop Registry

| ID | Label | Category | Roles |
|----|-------|----------|-------|
| mic-standard | Standard Mic | microphone | host, cohost, guest, artist |
| mic-wireless | Wireless Mic | microphone | host, cohost, guest, artist |
| mic-golden | Golden Mic | microphone | host, artist |
| glow-stick | Glow Stick | glow | fan, audience, vip |
| glow-wristband | Glow Wristband | glow | fan, audience, vip |
| sign-fan | Fan Sign | sign | fan, audience |
| sign-glowing | Glowing Sign | sign | fan, audience, vip |
| guitar-electric | Electric Guitar | instrument | artist |
| guitar-acoustic | Acoustic Guitar | instrument | artist |
| dj-headphones | DJ Headphones | instrument | artist |
| trophy | Trophy | stage | host, artist |
| confetti-cannon | Confetti Cannon | stage | host |

---

## Costume Layers

Each costume is composed of layers rendered in order:

1. Base body
2. Outfit (jacket, suit, dress, etc.)
3. Accessories (hat, glasses, chains)
4. Animated overlay (glow, aura, particles)

---

## Prop Attachment Points

| Prop Category | Attachment Point |
|--------------|-----------------|
| microphone | right hand |
| instrument | both hands |
| glow | left hand |
| sign | both hands raised |
| stage | floor / podium |

---

## Tier Unlock Summary

| Tier | Costumes | Props |
|------|----------|-------|
| starter | casual-default | mic-standard, glow-stick |
| rising | + stage-performer, cypher-street | + mic-wireless, glow-wristband, sign-fan |
| established | + vip-elite, formal-gala | + sign-glowing, guitar-electric, guitar-acoustic |
| featured | + contest-champion | + mic-golden, dj-headphones, trophy |
| legendary | + legendary-icon | + confetti-cannon |

---

## Copilot Wiring Notes

- Wire `getCostumesByTier(tier)` to Avatar Center unlock display
- Wire `getPropsForRole(role)` to prop selection UI
- Wire equipped costume/props to `AvatarIdentity.equippedCostumeId` and `equippedPropIds`
- Wire `AvatarCostumeLayer` to render equipped costume
- Wire `AvatarPropLayer` to render equipped props
