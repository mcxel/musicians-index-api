# CAST_MEMORY_CORE.md
## Central Memory System for All Cast Members

---

## PURPOSE
Stores and manages what the cast has learned, what has worked, and what to avoid.
Memory improves performance without breaking character.

---

## MEMORY TYPES

### Session Memory (clears each show session)
- Contestant name and prior answer
- Running score/status
- Emotional state established
- Strong crowd reaction callbacks
- Lines already used this session

### Event Memory (persists across rotation events)
- Which host fits which event type best
- Strongest intro/outro patterns
- Joke styles that landed
- Scripts that felt flat
- Effective pacing per event

### Long-Term Memory (persistent, logged)
- Best-performing intro styles per host
- Most-used scripts (flag for retirement)
- Strongest host-event pairings
- Crowd retention signals
- Wardrobe performance (VEX costume clicks)
- Julius assist effectiveness

---

## MEMORY PER CAST MEMBER

Each character has their own memory partition:
```
memory/
  bobby_stanley.json
  timothy_hadley.json
  meridicus_james.json
  aiko_starling.json
  zahra_voss.json
  nova_blaze.json
  julius.json
  vex.json
```

---

## UPDATE RULES

- Memory updates after every completed event segment
- No update during active performance (performance safety)
- Quality gate: only update if performance score meets threshold
- Identity lock: memory CANNOT change character personality — only improve delivery

---

## MEMORY IMPROVEMENT RULES

| Memory Type | Can Improve | Cannot Change |
|---|---|---|
| Script patterns | Yes | Host personality |
| Timing/pacing | Yes | Age, name, role |
| Event preference | Yes | Primary show assignment |
| Joke style | Yes | Character voice identity |
| Wardrobe | Yes | Character visual canon |

---

*Cast Memory Core v1.0 — BerntoutGlobal XXL*
