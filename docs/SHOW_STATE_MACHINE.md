# SHOW STATE MACHINE

## Overview

The Show State Machine manages the lifecycle of live shows, from pre-show to post-show, handling transitions, timing, and automated actions.

---

## Show Phases

| Phase | Duration | Activities |
|-------|----------|------------|
| waiting | 0-15 min | waiting room, countdown |
| intro | 30s-2min | host welcome, rules |
| round-1 | 5-15 min | first performance set |
| intermission | 2-5 min | break, sponsor ads |
| round-2 | 5-15 min | second performance set |
| final-round | 5-20 min | championship round |
| judging | 1-3 min | scores calculated |
| winner | 1-2 min | winner announcement |
| recap | 3-10 min | highlights, credits |

---

## State Transitions

```
waiting → intro → round1 → intermission → round2 → final → judging → winner → recap → ended
              ↓              ↓            ↓            ↓
          fallback      fallback      fallback     fallback
```

---

## Fallback States

| State | Trigger | Action |
|-------|---------|--------|
| intermission | technical | extend break |
| pause | host request | freeze timer |
| emergency | safety | end show |
| delay | stream issue | show delay screen |

---

## Events Emitted

- `show:phase-change`
- `show:round-start`
- `show:round-end`
- `show:score-update`
- `show:winner-declared`
- `show:ended`

---

## Files Reference

- `data/shows/formats.json` - Show formats
- `data/bots/registry.json` - Show bots
