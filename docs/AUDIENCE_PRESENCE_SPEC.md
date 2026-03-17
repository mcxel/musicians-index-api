# AUDIENCE PRESENCE SPEC

## Overview

The Audience Presence System manages how viewers appear and interact in live rooms. It handles avatar representation, spatial positioning, and real-time updates.

---

## Presence Types

| Type | Avatar | Animation | Interaction |
|------|--------|-----------|-------------|
| spectator | bobblehead | idle, clap | emotes only |
| participant | full avatar | reactions | emotes, tips |
| VIP | premium avatar | exclusive | all features |
| backstage | private avatar | hidden | none |

---

## Spatial Layouts

### Standard Room
- Stage: center, elevated
- Floor: general admission, standing
- Balcony: elevated rows
- VIP Box: side sections

### Arena Layout
- Pit: front of stage
- Floor: general standing
- Lower bowl: seated
- Upper bowl: high view
- Luxury suites: private

---

## Viewer Positions

| Zone | Max Viewers | Camera Access | Chat |
|------|-------------|---------------|------|
| front-row | 50 | close-up | enabled |
| general | unlimited | standard | enabled |
| vip | 200 | premium | priority |
| backstage | 20 | none | private |

---

## Real-Time Updates

- Position sync: 2Hz
- Avatar state: 5Hz
- Reaction broadcast: 10Hz
- Presence heartbeat: 1Hz

---

## Files Reference

- `data/audience/presence-layouts.json` - Layout definitions
- `data/audience/control-modes.json` - Viewer controls
- `data/environments/viewer-positions.json` - Position data
