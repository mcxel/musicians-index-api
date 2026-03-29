# SHOW_FLOW.md
## Show Sequence Rules — What Happens in What Order

---

## UNIVERSAL SHOW SEQUENCE

```
1. LOAD       → venue shell, seating, stage assets
2. PRIME      → audio primed, host loaded, Julius mode set
3. INTRO      → curtain animation, lighting intro
4. ENTRANCE   → host walk-on, crowd acknowledgment
5. OPEN       → host opening line, show setup
6. ROUND(S)   → host prompt → contestant → response → judge → score
7. TRANSITION → between rounds
8. CLIMAX     → final round or elimination
9. RESOLVE    → winner declared
10. OUTRO     → winner moment, closing line, closing theme
11. RELEASE   → audience release, analytics log, state save
```

---

## TIMING STANDARDS

| Phase | Duration |
|---|---|
| Intro sequence | 8–15 seconds |
| Host entrance | 3–6 seconds |
| Opening line | 5–10 seconds |
| Round prompt | 3–8 seconds |
| Contestant response window | 15–60 seconds |
| Host reply | 5–15 seconds |
| Score update | 2–4 seconds |
| Crowd reaction | 2–5 seconds |
| Elimination (VEX) | 10–20 seconds |
| Winner reveal | 6–12 seconds |
| Closing sequence | 8–15 seconds |

---

## AUDIO HOOKS AT EACH STAGE

| Stage | Audio Action |
|---|---|
| `load` | Ambient room tone |
| `intro` | Opening theme begins |
| `entrance` | Host walk-on stinger |
| `round_start` | Light tension loop |
| `correct` | Success sting + crowd cheer |
| `wrong` | Show-specific fail sound |
| `elimination` | VEX proximity warning begins |
| `winner` | Winner reveal sting + celebration |
| `outro` | Closing theme |
| `release` | Fade out |

---

*Show Flow v1.0 — BerntoutGlobal XXL*
