# JULIUS_BEHAVIOR_ENGINE.md
## Julius the Meerkat — Complete Behavior System

---

## CHARACTER SUMMARY
Julius is a playful, curious, mischievous AR-style meerkat assistant.
He is not a mascot. He is a living interactive character system.

**Slogan connection**: "This is your stage, be original."
Julius embodies that spirit — always fresh, never repeating.

---

## CORE BEHAVIOR RULES

1. Julius must NEVER loop the same animation predictably
2. Julius must NEVER spam actions
3. Julius must NEVER interrupt user interaction
4. Julius must ALWAYS feel like he is choosing to act — not looping
5. Julius is periodic, not constant
6. Julius is context-aware — he adapts to the page he's on

---

## BEHAVIOR TIMING SYSTEM

### Tier 1: Micro Idle (every 2–6 seconds, randomized)
- Blink
- Breath cycle
- Subtle head tilt
- Eye movement
- Tail flick
- Weight shift

### Tier 2: Passive Actions (every 6–15 seconds, randomized)
- Look left
- Look right
- Neck stretch (meerkat lookout pose)
- Subtle smile variation
- Small hand/paw motion
- Foot tap
- Glance at user
- Head bob

### Tier 3: Active Personality Beats (every 20–45 seconds, randomized)
- Small joke motion
- Mini prop flick (coin, ticket)
- Shrug or smirk
- Quick playful gesture
- Peek around a card or panel
- Scamper burst

### Tier 4: Engagement Triggers (event-based, NOT timed)
**Triggers**: hover, click, inactivity, milestone, page load
**Actions**:
- Point at a button
- Show tip card
- Wave
- Nod
- "Hey you" motion
- Neck stretch alert pose

### Tier 5: Performance Moments (every 1–3 minutes, randomized + cooldown)
- Full prop deployment
- Dance burst
- Magic trick
- Scoreboard reveal
- Spotlight scan
- Split-pop clone mode

---

## MEERKAT-SPECIFIC BEHAVIORS

Julius must move like a real meerkat, not a cartoon:

- **Lookout Stretch**: Head stretches upward, neck extends, slight chin push forward. Slow hold. Gradual return.
- **Side Scan**: Head swings left, pauses, swings right. Not robotic — slightly organic timing.
- **Alert Freeze**: Head snaps to direction, body tenses, then relaxes.
- **Curiosity Lean**: Forward body lean, head tilt, slight sniff motion.
- **Scamper**: Quick 2–4 step burst, stops suddenly.
- **Belly Crawl**: Low profile movement mode.

---

## ANIMATION LIBRARY

### Locomotion
idle, idle-alert, walk, fast-walk, jog, run, sprint-burst, sneak, tiptoe, crawl, belly-crawl, hop, jump, long-jump, land-soft, land-hard, slide-stop, spin-turn, stumble-recover

### Character Actions
laugh, giggle, smirk, point, shrug, wave, clap, snap-fingers, celebrate, dance-groove-1, dance-groove-2, goofy-dance, mic-host-pose, VIP-ticket-show, coin-toss, rubber-chicken-react, magician-hat-reveal, ta-da, crowd-hype

### Expressive Physical
bounce-on-heels, chest-puff, shoulder-sway, tail-flick, foot-tap, head-bob, playful-crouch, peek-corner, little-scamper, curious-sniff, surprised-freeze, awkward-recovery

---

## EMOTION SYSTEM

Emotions control face + posture + intensity:

| Emotion | Brows | Eyes | Mouth | Body | Tail |
|---|---|---|---|---|---|
| Happy | Raised | Wide | Big smile | Upright | Up/wagging |
| Excited | High | Very wide | Open smile | Forward lean | Fast wag |
| Curious | One raised | Narrowed | Slight open | Head tilt | Slow sway |
| Mischievous | Low/angled | Squinted | Smirk | Low crouch | Flick |
| Proud | High | Normal | Confident smile | Chest puff | Still-up |
| Surprised | Max high | Max wide | Open | Freeze | Spike |
| Playful | Dynamic | Bright | Grin | Bouncy | Wag |
| Focused | Low/furrowed | Narrowed | Neutral | Still | Down |

---

## MODES

| Mode | Description | Activity Level |
|---|---|---|
| Idle | Default background mode | Low |
| Passive | Light personality — subtle actions | Low-Medium |
| Curious | Exploring environment/content | Medium |
| Helper | Highlighting UI, guiding user | Medium-High |
| Host | Supporting a show host | High |
| Comedy | Gags, funny reactions | High |
| Crowd | Reacting to audience events | High |
| Quiet | Minimal motion, respectful | Very Low |
| Explorer | Crawling, peeking, wandering | Medium |

---

## ANTI-REPETITION RULES

- Do not repeat same animation within last 5 actions
- Do not use same prop twice in a row
- Performance moments have 60–120 second cooldown
- Same emotion cannot loop more than 2 cycles
- Track last action type — avoid back-to-back same category

---

## CONTEXT-AWARE BEHAVIOR

| Page Type | Julius Mode | Activity Level |
|---|---|---|
| Homepage/Cover | Explorer + Curious | Medium |
| Artist Dashboard | Helper + Passive | Medium |
| Monthly Idol | Quiet + Passive | Low (respect the hosts) |
| Game Night / Battle | Crowd + Comedy | High |
| Onboarding | Helper | High |
| Article Page | Passive | Low |
| Admin | Helper + Quiet | Low-Medium |
| Winner Reveal | Crowd + Celebrate | Very High (brief) |

---

*Julius Behavior Engine v1.0 — BerntoutGlobal XXL*
