# HOST_LIPSYNC_SYSTEM.md
## Lip Sync and Facial Animation During Speech

---

## PURPOSE
Ensures every host's mouth, face, and body stay in sync with generated speech.

---

## PHONEME AND VISEME SYSTEM

### Core Viseme Set (minimum)
| Viseme | Phoneme Group | Description |
|---|---|---|
| V_Silence | Pause | Closed, relaxed |
| V_PP | p, b, m | Lips pressed |
| V_FF | f, v | Lower lip to upper teeth |
| V_TH | th | Tongue to teeth |
| V_DD | d, t, n | Tongue tip |
| V_kk | k, g, ng | Back of mouth |
| V_CH | ch, j, sh | Lips rounded forward |
| V_SS | s, z | Slight smile, tight |
| V_nn | n, l | Tongue to roof |
| V_RR | r | Rounded mid |
| V_AA | a, ah | Wide open |
| V_EE | e, i | Smile-open |
| V_OO | o, u | Rounded |

---

## EMOTION-AWARE LIP SYNC

Mouth shape is modified by emotional state:

| Emotion | Lip Modification |
|---|---|
| Happy | Slight upward curve throughout |
| Excited | More open, wider smile |
| Serious | Tighter, less movement |
| Hype/Shouting | Fully open, exaggerated |
| Whisper | Very small, subtle movement |

---

## SYNC CHAIN

```
Generated Script Text
    ↓
Phoneme Extraction
    ↓
Viseme Sequence Generation
    ↓
Emotion State Read
    ↓
Face Rig Animation
    ↓
Body Language Sync (head bob, brow, eyes)
    ↓
Mic Position Sync
    ↓
Audio Playback Trigger
```

---

## SUPPORTING ANIMATIONS DURING SPEECH

While speaking, hosts also animate:
- Brow raises for emphasis
- Eye contact shifts
- Head tilt during questions
- Subtle head nod during rhythm
- Blink every 3–6 seconds
- Ear micro-movement (subtle)
- Shoulder shifts on emphasis

---

## FALLBACK

If lip sync generation is unavailable:
- Use simplified open/close mouth cycle
- Maintain emotional expression
- Keep body language synced to speech length
- Never freeze face completely

---

*Host Lipsync System v1.0 — BerntoutGlobal XXL*
