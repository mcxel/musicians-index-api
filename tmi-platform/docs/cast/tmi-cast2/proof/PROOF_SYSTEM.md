# HOST_BEHAVIOR_ENGINE.md
## Host Behavior Brain — When Hosts Act and How

---

## CORE RULE
Hosts must NEVER loop predictably.
They act with intention — not on a timer.

---

## BEHAVIOR TIERS

### Tier 1: Micro Idle (2–6 seconds, randomized)
- Blink
- Weight shift
- Subtle smile variation
- Eye contact break/return
- Breath cycle

### Tier 2: Passive Actions (6–15 seconds, randomized)
- Subtle head turn
- Small hand gesture
- Mic adjustment
- Look toward contestant or crowd
- Cross arms or change stance

### Tier 3: Active Personality Beats (20–45 seconds)
- Crowd acknowledge
- Small joke gesture
- Lean toward contestant
- Step forward or back
- Brief crowd scan

### Tier 4: Event-Triggered (NOT timed — event-based)
- Contestant enters → greet
- Answer delivered → host evaluates
- Score changes → host reacts
- Crowd peaks → host amplifies
- Fail occurs → host responds in-character
- Win occurs → host celebrates in-character

---

## HOST MODE SWITCHING

| Context | Mode | Behavior Level |
|---|---|---|
| Pre-show idle | Passive | Very low |
| Show active | Performance | High |
| Contestant responding | Listening | Focused, still |
| Score reveal | Dramatic | Very high |
| Between rounds | Casual | Medium |
| Elimination | Serious | High |
| Winner reveal | Celebration | Peak |
| Co-host moment | Duo | Collaborative |

---

## IDLE SUPPRESSION RULES

When another cast member is speaking:
- Background hosts enter listening pose ONLY
- No micro-actions that steal focus
- Seated hosts: still, facing speaker
- Julius: edge position, minimal motion
- VEX: stage wings only

---

## ANTI-REPETITION RULES

- Do not repeat same body language within last 5 actions
- Do not repeat same verbal opener in same session
- Do not repeat same follow-up style twice in a row
- High-energy moments have 90-second cooldown

---

## CONTEXT MAP

| Page/Show | Host Activity Level |
|---|---|
| Main show | High — performance mode |
| Battle/Cypher | Reactive — fast response |
| Monthly Idol | Measured — deliberate |
| Monday Night Stage | Electric — always on |
| Idle page | Very low — ambient presence |
| Dashboard/Admin | Not present |
| Article page | Not present |

---

# PROOF_INDEX.md
## Where Proof Lives — All Evidence Files

---

## PROOF DIRECTORY

All proof artifacts stored in:
```
tmi-platform/proof/
  ├── logs/               (build logs, error logs, Cloudflare logs)
  ├── screenshots/        (UI proofs)
  ├── curl-outputs/       (API route proofs)
  ├── playwright/         (E2E test results)
  └── cast-system/        (cast-specific proofs)
```

---

## PROOF ENTRY FORMAT

```
SYSTEM: [Name]
DATE: [YYYY-MM-DD]
ENVIRONMENT: [local / CI / Cloudflare / live]
COMMIT SHA: [hash]
RESULT: [PASS / FAIL]
EVIDENCE: [file path or URL]
NOTES: [any relevant context]
BLOCKER IF FAIL: [what must be fixed]
```

---

## CAST PROOF CHECKLIST

Before cast system is marked complete:

### Hosts
- [ ] All 6 host files exist and are validated
- [ ] Host rotation assigns correctly per event type
- [ ] Monthly Idol hosts stay seated in Idol context
- [ ] Chatbot responds in-character per host
- [ ] Outfits change correctly between events

### Julius
- [ ] Behavior is periodic (not constant)
- [ ] Split system activates and resolves
- [ ] Sound bank plays correct sounds
- [ ] Context modes switch correctly per page

### VEX
- [ ] Proximity audio scales with distance
- [ ] Costume changes between appearances
- [ ] Escort sequence runs completely
- [ ] VEX only appears on elimination trigger

### Shows
- [ ] Show lifecycle completes for all 7 show types
- [ ] Audio hooks fire at correct lifecycle events
- [ ] Fail sounds differ per show type
- [ ] Winner sequence runs correctly

### Venues
- [ ] All venue types load without error
- [ ] Sightlines work from all seat positions
- [ ] Room evolution tiers exist for each venue
- [ ] Pack system applies correctly

---

*Host Behavior Engine + Proof Index v1.0 — BerntoutGlobal XXL*
