# ENVIRONMENT LIBRARY - Complete Specification

## Overview

The BerntoutGlobal XXL Environment Library defines all live performance venues, audience spaces, and special environments for the platform. Every environment must follow the completion rule.

---

## Venue Classes

### 1. Underground / Raw
- basement show
- garage set
- warehouse cypher
- rehearsal room
- hole-in-the-wall country bar
- alley pop-up

### 2. Local Rise-Up
- neighborhood bar stage
- open mic venue
- community theater
- dance hall
- battle lounge
- indie coffeehouse stage

### 3. Premium / Polished
- concert hall
- casino showroom
- luxury rooftop venue
- black-tie performance room
- theater hall
- televised showcase set

### 4. Massive Spectacle
- amphitheater
- arena bowl
- festival grounds
- world music summit stage
- championship cypher coliseum
- international dance party stage

### 5. Social / Fan-First
- watch party lounge
- fan club room
- listening room
- replay theater
- afterparty club
- meet-and-greet lobby

### 6. Battle / Game
- rap battle pit
- dance battle floor
- cypher circle
- judge-panel arena
- elimination room
- winner walk stage

### 7. Backstage / Support
- green room
- dressing room
- cue room
- host prep room
- moderation room
- control room

---

## Environment Completion Rule (MANDATORY)

No environment is complete unless it has ALL of:
- route
- scene
- script
- venue type
- zone map
- seating model
- standing model
- avatar viewer positions
- sound profile
- lighting/mood profile
- camera profile
- sponsor/ad zone map
- host/judge/artist zones
- commerce hooks
- recap/archive path
- mobile fallback
- validation coverage

---

## Zone System

Every environment must include these zones:
- stage
- front-row
- standing-floor
- seated-floor
- booths
- balcony
- VIP
- sponsor-zone
- host-zone
- judge-zone
- merch-zone
- backstage
- green-room
- entry-gate
- exit-path

---

## Viewer Positions

| Position | Capacity | Type | Premium |
|----------|----------|------|---------|
| standing-floor | unlimited | standing | no |
| seated-chair | 50 | seated | no |
| booth-seating | 8 | seated | yes |
| VIP-balcony | 20 | seated | yes |
| judge-table | 5 | stationary | no |
| host-desk | 2 | stationary | no |

---

## Performance Modes

Every environment supports these modes:
- concert
- battle
- dance-battle
- cypher
- game-show
- interview
- listening-session
- watch-party
- sponsor-showcase
- fan-qna
- rehearsal
- private-stream

---

## Mood Packs

- intimate-acoustic
- packed-sweaty
- neon-after-dark
- premium-spotlight
- battle-tension
- celebratory-winner
- sponsor-takeover
- intermission-calm
- festival-sunset

---

## Audience Energy Levels

- calm
- warmed
- hyped
- explosive
- emotional
- battle-tension
- celebration

---

## Progression Ladder

Artists progress through venues:
1. basement → 2. bar → 3. lounge → 4. club → 5. theater → 6. amphitheater → 7. world stage

---

## Sponsor Zones

Every venue must define:
- stage-side boards
- lower-third ads
- intermission takeovers
- branded lounge rooms
- backdrop logo wall
- merch booth sponsorship

---

## Special Environments

- holiday stage
- championship finals arena
- award ceremony room
- midnight cypher room
- charity concert stage
- beach jam
- barn dance
- unplugged room
- gospel hall
- neon city rooftop

---

## Files Reference

- `data/environments/registry.json` - Main venue registry
- `data/environments/zones.json` - Zone definitions
- `data/environments/viewer-positions.json` - Avatar positions
- `data/audience/reaction-modes.json` - Crowd behavior
- `data/shows/formats.json` - Show formats

---

## Next Steps

1. Wire one vertical path: basement → bar → club → theater → amphitheater → world stage
2. Implement zone logic for each venue class
3. Add sponsor zone maps
4. Create audience presence system
5. Add commerce hooks
