# CAST_COMMAND_CENTER.md
## Master Control Layer for All Performers

---

## PURPOSE
Single orchestration layer controlling all hosts, Julius, and VEX.
The command center decides who is active, where, in what mode, and what they wear.

---

## SYSTEM HIERARCHY

```
CAST_COMMAND_CENTER
├── Active Host Registry
├── Julius Status Controller
├── VEX Status Controller
├── Event Assignment Engine
├── Outfit/Wardrobe Dispatcher
├── Audio Mode Controller
├── Fallback Monitor
└── Performance Budget Enforcer
```

---

## ACTIVE HOST REGISTRY

At any moment, the system tracks:
```json
{
  "active_primary_host": "Bobby Stanley",
  "active_show": "deal_or_feud_1000",
  "active_rotation_host": null,
  "idol_panel": ["Meridicus James", "Aiko Starling", "Zahra Voss"],
  "julius_status": "passive",
  "vex_status": "standby",
  "mobility_mode": "free_roam"
}
```

---

## EVENT STATES

| State | Description | Who Is Active |
|---|---|---|
| `idle` | No show running | Julius passive |
| `primary_show` | Locked host's show | Primary host only |
| `rotation_event` | Battle/Cypher/Dirty Dozen | Rotation-selected host |
| `monthly_idol` | Monthly Idol is live | All 3 Idol hosts, seated |
| `monday_stage` | Monday Night Stage live | Nova Blaze + VEX ready |
| `multi_host` | Two hosts on stage | Compatibility matrix checked |
| `elimination` | Contestant removal | VEX triggered |
| `intermission` | Between segments | Julius active |

---

## CONTROL RULES

1. Only one primary-show host active at a time in their locked show
2. Rotation events may have 1 or 2 hosts max
3. Julius appears only in appropriate mode for page/event context
4. VEX activates only on elimination trigger from Nova or elimination mechanic
5. No more than 4 cast members on screen simultaneously (performance budget)
6. Command center logs every state change for analytics

---

## FALLBACK HIERARCHY

If active host fails:
1. Check fallback host eligibility
2. If eligible: promote rotation host
3. If no rotation host: Julius covers with helper mode
4. If Julius unavailable: pre-recorded segment plays
5. Log failure event

---

*Cast Command Center v1.0 — BerntoutGlobal XXL*
