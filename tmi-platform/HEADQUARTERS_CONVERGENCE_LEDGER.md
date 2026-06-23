# HEADQUARTERS_CONVERGENCE_LEDGER

Date: 2026-06-21

## Canonical Headquarters Routes
- Fan HQ: /hub/fan
- Performer HQ: /hub/performer

## Required Always-Visible Zones
- Identity Zone
- Avatar Widget
- Media Command Center
- Memory Wall
- Communication Hub
- Quick Actions
- Activity Rail

## Current State

| Zone | Fan HQ | Performer HQ | Status |
|---|---|---|---|
| Identity Zone | Present (but demo values in places) | Present (but current-user static values in places) | Partial |
| Avatar Widget | Present | Present | Partial (identity source not fully unified) |
| Media Command Center | Present but mixed seeded cards | Present but multiple static cards | Partial |
| Memory Wall | Present | Present | Partial |
| Communication Hub | Present (overlay dock added) | Present (overlay dock added) | Partial (voice/video runtime not certified) |
| Quick Actions | Present | Present | Partial |
| Activity Rail | Present but seed-heavy | Present but static-heavy | Partial |

## Keep / Merge / Rewire / Upgrade

### KEEP
- FanHubShell and PerformerHubDashboard core shells
- Communication dock overlays
- MemoryWall and Playlist artifact integration points

### MERGE
- Duplicate seeded fan activity blocks into real engine-backed feeds
- Static performer panel cards into canonical real feeds

### REWIRE
- Replace demo-fan/current-user literals with authenticated session identity
- Route seeded cards to real generated routes only

### UPGRADE
- Convert static monitor panels to real panel feed resolver
- Apply cinematic transitions after data integrity pass

## P0 Action Sequence
1. Remove seed-driven route cards in Fan HQ.
2. Replace demo identity literals with session-driven identity.
3. Bind performer static stats to real APIs or honest empty cards.
4. Certify communication overlay actions (chat/voice/video/invite) against runtime availability.
