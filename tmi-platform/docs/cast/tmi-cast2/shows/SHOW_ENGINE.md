# SHOW_ENGINE.md
## Show Runtime Execution Engine

---

## PURPOSE
Controls how shows start, run, transition, and end.
Every show goes through this engine regardless of type.

---

## SHOW LIFECYCLE

```
SHOW_INIT
    ↓
VENUE_LOAD        (load room shell, seating, stage)
    ↓
CAST_ASSIGN       (load host + Julius mode + VEX standby)
    ↓
AUDIO_PRIME       (load show-specific soundtrack)
    ↓
INTRO_SEQUENCE    (curtain, lighting intro, host entrance)
    ↓
SHOW_ACTIVE       (round loop: prompt → response → judge → score)
    ↓
TRANSITION        (between rounds or segments)
    ↓
ELIMINATION       (if applicable: VEX trigger, contestant exit)
    ↓
OUTRO_SEQUENCE    (winner reveal, crowd, closing theme)
    ↓
SHOW_END          (analytics log, state save, audience release)
```

---

## ROUND LOOP ENGINE

```
HOST_PROMPT
    ↓
CONTESTANT_INPUT (text/voice/action)
    ↓
HOST_RECEIVE
    ↓
HOST_EVALUATE
    ↓
HOST_RESPOND (in character)
    ↓
[FOLLOW_UP? → max depth check → respond or conclude]
    ↓
SCORE_UPDATE
    ↓
CROWD_REACT
    ↓
[ELIMINATION_CHECK? → VEX_TRIGGER if needed]
    ↓
NEXT_ROUND or OUTRO
```

---

## EVENT HOOKS (GLOBAL)

| Event | Triggers |
|---|---|
| `show:start` | Curtain open, intro theme, host entrance |
| `show:round_start` | Round lighting, host prompt |
| `show:contestant_input` | Host receive, crowd attention |
| `show:correct` | Win sound, crowd cheer, score flash |
| `show:wrong` | Fail sound (show-specific), crowd react |
| `show:elimination` | VEX warning audio start |
| `show:winner` | Winner reveal lighting, celebration theme |
| `show:end` | Closing theme, curtain close, analytics log |

---

## INTEGRATION

- AUDIO_ENGINE → receives show event hooks
- VEX_SYSTEMS → receives elimination trigger
- JULIUS_BEHAVIOR_ENGINE → receives crowd/hype/assist triggers
- CAST_COMMAND_CENTER → reads active host assignment
- SCORING_ENGINE → receives score updates

---

*Show Engine v1.0 — BerntoutGlobal XXL*
