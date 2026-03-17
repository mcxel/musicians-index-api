# AVATAR MOTION, REACTION, PRESENCE, AND LIVE TRENDS ENGINE

## Overview

This module turns avatars into active platform participants instead of static profile decorations. It governs movement, speaking indicators, emotes, room presence, camera variation, motion monetization, and room-level energy orchestration.

---

## Purpose

- Make avatars feel alive in rooms, stages, interviews, battles, and fan spaces.
- Tie motion systems directly to identity, communication, monetization, and retention.
- Keep motion expressive without making rooms chaotic, inaccessible, or too expensive to render.

---

## Engine Layers

### 1. Motion Sync Layer
- Head bob to beat
- Head sway to rhythm
- Shoulder bounce
- Idle groove
- Crowd bounce
- Hype burst reaction

### 2. Presence and Speaker Layer
- Active speaker detection
- Talking outline
- Glow ring / mic pulse
- Floating name highlight
- Speaker spotlight bias for camera system

### 3. Lip Sync Layer
- Open / close mouth states for v1
- Small phoneme-family groups
- Voice reactive bounce
- Speaking badge / glow overlay

### 4. Behavior Simulation Layer
- Idle
- Talking
- Listening
- Cheering
- Dancing
- Entering room
- Exiting room
- Performing
- Celebrating
- Sad / disappointed
- Thinking / questioning

### 5. Camera Variation Layer
- Slightly varied exit timing
- Alternative zoom stop points
- Varied pan duration
- Alternate cut timing
- Ending pools with weighted anti-repeat selection

### 6. Fun Orchestration Layer
- Periodic motion bursts
- Timed crowd waves
- Synchronized audience reactions
- Trivia pop-ins
- Hype spikes
- Artist call-and-response prompts

---

## Motion Classes

### Free Defaults
- Basic bob
- Basic sway
- Idle groove

### Unlockable Motions
- Premium bob packs
- Premium sway packs
- Dance loops
- Victory motions
- Room entrance animations

### Contextual Motions
- Music-triggered motion
- Room energy-triggered motion
- Chat/emote-triggered reactions
- Fan milestone-triggered reactions
- Contest / battle state reactions

---

## Emote and Reaction Economy

### Product Types
- Motion emotes
- Head-bob emotes
- Sway emotes
- Crowd burst emotes
- Applause emotes
- Glow effects
- Aura effects
- Stage effects
- Reaction packs

### Access Models
- Free starter pack
- Earned pack
- Store pack
- Event-exclusive pack
- Artist-branded pack
- Premium tier unlock
- Points redemption

### Commerce Hooks
- Motion preview studio before purchase
- Favorite motion memory per user
- Artist signature emote packs
- Fan loyalty reaction unlocks
- Seasonal motion bundles
- Surprise-me animation mode

---

## Talk Detection and Lip Sync

### v1 Target
- Detect active speaker
- Drive mouth open / close states
- Group sounds into simple phoneme families
- Highlight talking avatar in crowded rooms

### Clarity Requirements
- Lip sync visible from standard room zoom
- Speaker ring and active mic pulse available even in low-motion mode
- Name highlight should remain readable on mobile

### High-Value Use Cases
- Artist rooms
- Fan rooms
- Battle rooms
- Interviews
- Group sessions
- Channels

---

## Camera Variation and Ending Pools

### Rules
- Use bounded randomness only
- Select from approved ending pools
- Avoid repeating the same ending twice in a row
- Bias toward unseen endings within the current session
- Cool down recently used endings

### Example Endings
- Wink
- Nod
- Sway out
- Glow pulse
- Shoulder bounce
- Laugh pose

---

## Safety and Moderation

### Hard Limits
- Cap simultaneous emotes
- Cap overlapping room overlays
- Cap camera motion density
- Cap crowd burst frequency
- Cap talking indicator count in crowded rooms

### Moderation Rules
- Offensive customizations blocked
- Spam-triggered reaction cooldowns
- Unsafe overlays disabled automatically
- Premium effects cannot bypass room safety caps

---

## Accessibility and Performance

### Accessibility Controls
- Reduced motion toggle
- Static avatar fallback
- Simplified effects mode
- Lip sync off toggle
- Reduced camera variation toggle
- Effect intensity slider

### Performance Ladder

| Mode | Motion | Lip Sync | Camera Variation | Reactive Effects |
|------|--------|----------|------------------|------------------|
| high | full | full | full | full |
| medium | reduced | simple | reduced | reduced |
| low | static / minimal | speaker indicator only | off | minimal |

---

## Data Structures To Add

### Avatar Motion Profile
- default idle pack
- default music sync pack
- purchased motion packs
- equipped emotes
- lip sync enabled
- reduced motion enabled
- favorite motions

### Room Behavior Profile
- camera variation level
- crowd effect level
- active speaker style
- motion intensity
- reaction density
- room theme sync

### Learning Profile
- most-used emotes
- most-purchased motion packs
- reactions with highest engagement lift
- preferred endings
- retention impact by behavior pack

---

## Bot Roles

- Motion Curator Bot: recommends/equips motion packs based on room type and user taste.
- Speaker Clarity Bot: protects readability in multi-speaker rooms.
- Reaction Cooldown Bot: suppresses spam and overload.
- Camera Variation Bot: rotates endings and camera beats within approved pools.
- Engagement Optimizer Bot: tracks which motion/reaction patterns increase participation.

---

## Build Order

### Phase A
- Avatar persistence
- Basic sprite display
- Basic idle motion
- Speaker highlight

### Phase B
- Head bob / sway
- Simple lip sync
- Emote triggers
- Purchased motion inventory

### Phase C
- Room reactions
- Camera variation
- Ending pools
- Poll / trivia live hooks

### Phase D
- Adaptive learning
- Advanced choreography
- Premium motion economy
- Trend / engagement bots

---

## Connected Systems

- Avatar Engine
- Lip Sync Engine
- Expression Engine
- Animation Engine
- Realtime Engine
- Store / Rewards / Inventory
- Live Stage / Room Presence
- Polls / Trivia / Editorial systems

---

## Files Reference

- `data/emotes/registry.json`
- `data/audience/reaction-modes.json`
- `data/avatar/widget-layouts.json`
- `data/props/registry.json`
- `data/inventory/registry.json`
- `docs/AVATAR_CREATION_CENTER.md`
- `docs/AUDIENCE_PRESENCE_SPEC.md`
- `docs/PERFORMANCE_BUDGETS.md`