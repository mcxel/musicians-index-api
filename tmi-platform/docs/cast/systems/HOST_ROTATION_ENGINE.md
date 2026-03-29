# HOST_ROTATION_ENGINE.md
## Host Rotation and Event Assignment System

---

## PURPOSE
Defines how hosts are assigned to events, how rotation works for shared events,
and how to prevent repetition while keeping each show fresh.

---

## PRIMARY SHOW LOCKS (PERMANENT)

These assignments cannot be overridden:

| Host | Locked Show |
|---|---|
| Bobby Stanley | Deal or Feud 1000 |
| Timothy Hadley | Circles & Squares |
| Meridicus James | Monthly Idol (panel) |
| Aiko Starling | Monthly Idol (panel) |
| Zahra Voss | Monthly Idol (panel) |
| Nova Blaze | Marcel's Monday Night Stage |

---

## SECONDARY EVENT ROTATION POOL

All 6 human hosts are eligible for:
- Singer vs Singer Battle
- Drummer vs Drummer Battle
- Dancer vs Dancer Battle
- Comedian vs Comedian Battle
- Pianist vs Pianist Battle
- Any musical genre battle
- Cyphers
- Dirty Dozen

**Julius**: Eligible for assist/support in all events (not primary host)
**VEX**: Eligible for elimination moments in any event

---

## ROTATION ALGORITHM

### Step 1: Eligible Pool
Build pool of all 6 hosts for the event category.

### Step 2: Filter Recent Use
Remove any host used in the last event of the same type.
Remove any host used twice in the last 5 rotation events.

### Step 3: Energy Match
Score remaining hosts by energy match for event type:

| Event Type | High Match | Low Match |
|---|---|---|
| Rap Battle | Meridicus, Nova | Zahra |
| Dance Battle | Aiko, Nova | Timothy |
| Comedy | Bobby, Timothy | Zahra |
| Pianist | Zahra, Timothy | Nova |
| Singer | Meridicus, Zahra, Aiko | Bobby |
| Drummer | Nova, Bobby | Zahra |
| Cypher | Meridicus, Nova, Aiko | Timothy |
| Dirty Dozen | Bobby, Nova, Meridicus | Zahra |

### Step 4: Weighted Random Selection
Pick from remaining eligible hosts with weight applied.
High match = 70% selection weight
Low match = 30% selection weight

### Step 5: Confirm + Assign
Log selection to rotation history.

---

## ANTI-REPETITION RULES

1. Same host cannot host two consecutive rotation events
2. Same host cannot appear more than 2x in any rolling window of 5 rotation events
3. High-energy events (battles) must not be assigned to low-energy hosts 3+ times in a row
4. Monthly Idol panel members must be given preference for vocalist/singer battles
5. Bobby Stanley and Timothy Hadley retain strong preference for strategic/game formats

---

## MONTHLY IDOL HOST BEHAVIOR IN ROTATION EVENTS

When Meridicus, Aiko, or Zahra host a rotation event:
- They shift to Class A mobility (full roam)
- Their speaking style stays the same (no identity change)
- Their show type awareness changes:
  - In a battle: more reactionary, crowd-energized
  - In a cypher: more performer-mode, hype-aware
  - In Dirty Dozen: more judge-mode, critical but encouraging

---

## DUO-HOST COMPATIBILITY

Some events may use two hosts together.

**Compatible pairs:**
| Pair | Chemistry | Best For |
|---|---|---|
| Bobby + Timothy | Contrast/witty | Puzzle, Strategic, Deal formats |
| Aiko + Meridicus | Musical synergy | Vocalist, Idol-adjacent |
| Nova + Bobby | Energy contrast | High-energy with gravitas |
| Zahra + Meridicus | Premium duo | Prestige battles |
| Aiko + Nova | Young energy | Dance, cypher |

**Incompatible pairings** (avoid):
- Zahra + Nova (energy mismatch — Zahra loses gravitas)
- Timothy + Meridicus (both smooth — lacks contrast)

---

## HOST ASSIGNMENT LOGGING

Every assignment stored in rotation log:
```
{
  event_id: "cypher_042",
  event_type: "cypher",
  host_assigned: "Nova Blaze",
  date: "2026-03-17",
  energy_match_score: 9.5,
  selection_reason: "high_energy_match + recent_rest"
}
```

This log feeds the memory system for future improvement.

---

*Host Rotation Engine v1.0 — BerntoutGlobal XXL*
