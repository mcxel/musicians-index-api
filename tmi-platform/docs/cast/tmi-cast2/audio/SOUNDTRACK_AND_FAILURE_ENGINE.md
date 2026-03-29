# SOUNDTRACK_CORE.md
## Global Show Soundtrack System

---

## THREE BASE THEMES

Every show selects ONE base theme and applies show-specific remixes.

### ENERGY_THEME
- Character: High tempo, competition, excitement
- Use for: Deal or Feud, Battles, Monday Night Stage, Cyphers
- Instruments: Brass, percussion, synthesizer, crowd
- Variants:
  - ENERGY_THEME_CLASSIC (warm, brass-led)
  - ENERGY_THEME_ELECTRIC (bass-heavy, modern)
  - ENERGY_THEME_STRATEGIC (precise, rhythmic)

### DRAMA_THEME
- Character: Suspense, tension, emotion, stakes
- Use for: Monthly Idol, Elimination rounds, Dirty Dozen finals
- Instruments: Strings, deep bass, cinematic percussion
- Variants:
  - DRAMA_THEME_LUSH (full orchestral)
  - DRAMA_THEME_MINIMAL (stripped, tense)
  - DRAMA_THEME_PRESTIGE (award-show feel)

### CELEBRATION_THEME
- Character: Victory, reward, success, joy
- Use for: Winner reveals, prize moments, closing sequences
- Instruments: Full ensemble, crowd, brass stab, sparkle
- Variants:
  - CELEBRATION_THEME_WARM (classic, Bobby-era)
  - CELEBRATION_THEME_ELECTRIC (Nova-era)
  - CELEBRATION_THEME_PRESTIGE (Zahra/Idol-era)
  - CELEBRATION_THEME_SHARP (Timothy-era)

---

## AUDIO STACK LAYERS

Every show runs audio in these simultaneous layers:

| Layer | Description | Priority |
|---|---|---|
| `background_music` | Base show theme loop | Lowest |
| `tension_loop` | Mid-round suspense layer | Medium |
| `event_sfx` | One-shot event reactions | High |
| `character_audio` | Host speech, Julius sounds | Highest |
| `crowd_audio` | Crowd reactions | Blends with event |

**Rule**: `event_sfx` overrides `background_music` briefly.
**Rule**: `character_audio` never competes with `event_sfx` — they stack.

---

## SHOW-SPECIFIC SOUND ASSIGNMENTS

| Show | Opening | Closing | Fail | Win | Crowd |
|---|---|---|---|---|---|
| Deal or Feud | ENERGY_CLASSIC | CELEBRATION_WARM | Buzzer + groan | Brass sting | Classic game show |
| Circles & Squares | ENERGY_STRATEGIC | CELEBRATION_SHARP | Clock-out buzz | Precision sting | Analytical murmur |
| Monthly Idol | DRAMA_LUSH | CELEBRATION_PRESTIGE | Soft sympathetic | Musical swell | Emotional crowd |
| Monday Night Stage | ENERGY_ELECTRIC | CELEBRATION_ELECTRIC | VEX warning | Full crowd drop | Monday night crowd |
| Battles | ENERGY_ELECTRIC | CELEBRATION_ELECTRIC | Battle buzz | Battle sting | Battle crowd |
| Cyphers | ENERGY_CLASSIC | CELEBRATION_WARM | Beat stop | Flow crown | Cypher crowd |
| Dirty Dozen | DRAMA_MINIMAL | CELEBRATION_SHARP | Elimination sting | Champion stab | Competition crowd |

---

# FAILURE_FEEDBACK_ENGINE.md
## Fail Sound + Reaction System Per Show Type

---

## PURPOSE
When something goes wrong, the reaction must match the show.
No show should use the same generic buzzer.

---

## FAILURE TYPES

| Type | Feel | Sound | Julius Reaction | VEX? |
|---|---|---|---|---|
| SOFT_FAIL | Light, recoverable | Subtle buzz | Light chirp, shrug | No |
| HARD_FAIL | Clear, elimination | Loud buzzer | Surprised freeze | Possible |
| COMEDIC_FAIL | Funny, playful | Comedic sound | Split-pop, laugh | No |
| DRAMATIC_FAIL | Tense, emotional | Silence → impact | Still, respectful | No |
| ELIMINATION_FAIL | Stage removal | VEX warning chain | Crowd hype mode | YES |

---

## PER-SHOW FAIL MAPPING

| Show | Default Fail Type | Fail Sound Description |
|---|---|---|
| Deal or Feud | HARD_FAIL | Classic buzzer + crowd groan |
| Circles & Squares | SOFT_FAIL | Clock-out buzz, analytical tone |
| Monthly Idol | DRAMATIC_FAIL | Soft tone, no harsh buzz |
| Monday Night Stage | ELIMINATION_FAIL | VEX proximity warning chain begins |
| Battles | COMEDIC or HARD | Depends on battle type |
| Cyphers | SOFT_FAIL | Beat stutter, crowd "ooh" |
| Dirty Dozen | ELIMINATION_FAIL | Countdown sting, VEX optional |

---

## JULIUS FAIL INTEGRATION

When fail occurs:
- SOFT_FAIL → Julius shows light chirp + shrug animation
- HARD_FAIL → Julius surprised freeze + sympathetic sound
- COMEDIC_FAIL → Julius split-pop + chuckle burst
- ELIMINATION_FAIL → Julius shifts to crowd mode, VEX takes over stage

---

*Soundtrack Core + Failure Feedback Engine v1.0 — BerntoutGlobal XXL*
