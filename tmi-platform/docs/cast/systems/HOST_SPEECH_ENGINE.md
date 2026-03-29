# HOST_SPEECH_ENGINE.md
## Dynamic Script Generation and Delivery System

---

## PURPOSE
Controls how hosts speak, what they say, and ensures every delivery is fresh,
in-character, and event-appropriate.

---

## SPEECH COMPONENTS

### 1. Script Generator
Generates fresh lines for:
- Show intros
- Contestant greetings
- Performance reactions
- Score reveals
- Round transitions
- Sponsor mentions
- Winner announcements
- Elimination commentary
- Outro lines

### 2. Tone Controller
Each event type applies a tone profile:

| Event | Tone | Pace | Energy |
|---|---|---|---|
| Deal or Feud | Classic, warm | Medium | High |
| Circles & Squares | Sharp, strategic | Medium | Medium |
| Monthly Idol | Musical, personal | Slow-Med | Medium-High |
| Monday Night Stage | Electric, bold | Fast | Max |
| Battles | Reactive, hype | Fast | High |
| Cyphers | Street, musical | Fast | High |
| Dirty Dozen | Competitive | Fast | High |

### 3. Anti-Repetition Filter
- Track last 10 used phrases per host
- Block any phrase used in last 5 sessions
- Flag overused catchphrases for retirement
- Inject variation in phrasing patterns

### 4. Pacing Engine
- Short lines: battle/fast events
- Medium lines: standard show flow
- Long intros: Monthly Idol, special events
- Filler lines: for smooth transitions

---

## PERSONALITY FILTER

Every line passes through a personality filter before delivery:

Bobby: warm, experienced, crowd-tested, classic
Timothy: precise, strategic, witty
Meridicus: smooth, musical, stylish
Aiko: bright, expressive, supportive
Zahra: elegant, composed, commanding
Nova: electric, bold, crowd-igniting

---

## FALLBACK SYSTEM

If script generation is weak:
1. Pull from approved fallback line bank
2. Use crowd acknowledgment bridge
3. Transition to next segment
4. Never leave dead air > 3 seconds

---

*Host Speech Engine v1.0 — BerntoutGlobal XXL*
