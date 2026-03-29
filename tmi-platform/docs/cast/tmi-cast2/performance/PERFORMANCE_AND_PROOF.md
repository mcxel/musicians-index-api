# PERFORMANCE_ENGINE.md
## System Performance Rules and Optimization

---

## GLOBAL LIMITS

| Resource | Max Value | Downgrade Trigger |
|---|---|---|
| Full avatars on screen | 4 | >80% CPU |
| Active audio layers | 3 | >70% memory |
| Active FX streams | 2 | Network lag >500ms |
| Active lip-sync rigs | 2 | Mobile device |
| Julius clones | 4 total | Any constraint hit |
| Moving lights | 6 | Performance warning |
| Crowd animated rows | 4 | Low-power mode |

---

## DOWNGRADE CASCADE

```
Level 1: PREMIUM
All avatars, FX, lighting, lip sync, crowd motion, audio all active

Level 2: STANDARD
Reduce crowd motion to rows 1-2
Cap FX to 1 active stream

Level 3: SPRITE-ASSISTED
Replace full avatars with sprites
Reduce audio to 2 layers
No crowd animation

Level 4: LITE
All sprites, static expressions
1 audio layer (background only)
No FX, no particles

Level 5: FALLBACK
Static sprites, text-only speech
Ambient audio only
No Julius, no VEX FX
```

---

## PER-PAGE LIMITS

| Page Type | Max Characters | Max FX | Max Audio Layers |
|---|---|---|---|
| Homepage/Cover | 6 avatars | 2 | 2 |
| Show stage | 4 characters | 3 | 3 |
| Monthly Idol | 5 characters | 2 | 3 |
| Battle Arena | 4 characters | 2 | 2 |
| Article page | 1 (Julius only) | 1 | 1 |
| Dashboard | 0 (no avatars) | 0 | 0 |

---

# FALLBACK_SYSTEM.md
## Graceful Degradation Rules

---

## FALLBACK TRIGGERS

| Condition | Action |
|---|---|
| CPU > 80% | Switch to sprites |
| Memory > 70% | Disable background FX |
| Network lag > 500ms | Reduce clone count |
| Mobile device | Auto lite mode |
| User: reduced motion | No animation |
| User: muted | No audio |

---

## JULIUS FALLBACK SPECIFICALLY

Full → Sprite → Static + expression → Text-only helper

---

## HOST FALLBACK

Full avatar → Sprite host → Host text panel only

---

# TEST_MATRIX.md
## Proof Gates for All Systems

---

## CAST SYSTEM PROOF GATES

### Host Gates
- [ ] All 6 hosts load without error
- [ ] Lip sync triggers on speech generation
- [ ] Chatbot responds in character
- [ ] Rotation assigns correct host per event
- [ ] Monthly Idol hosts stay seated in Idol mode
- [ ] Hosts roam in rotation events
- [ ] Outfit changes between events
- [ ] No outfit repeated back-to-back

### Julius Gates
- [ ] Julius appears on correct pages
- [ ] Julius does not spam actions
- [ ] Julius split works and resolves
- [ ] Julius sound plays on correct triggers
- [ ] Julius enters quiet mode on article pages
- [ ] Julius fallback sprite works

### VEX Gates
- [ ] VEX proximity audio scales correctly (not instant blast)
- [ ] VEX enters only on elimination trigger
- [ ] VEX costume changes between appearances
- [ ] VEX exits cleanly after escort

### Show Gates
- [ ] Show lifecycle completes without error
- [ ] Audio plays at each lifecycle event
- [ ] Fail sounds differ per show type
- [ ] Winner reveal sequence completes
- [ ] VEX triggered correctly on elimination shows

### Performance Gates
- [ ] No more than 4 full avatars on screen simultaneously
- [ ] Downgrade cascade triggers correctly
- [ ] Sprite fallback renders correctly
- [ ] Audio layers stay within budget

---

# VALIDATION_RULES.md
## How Proof Is Verified

---

## VALIDATION PROTOCOL

For every system marked complete:
1. Run the specific test gates
2. Log pass/fail result
3. Record timestamp and commit SHA
4. Note environment (local/CI/Cloudflare/live)
5. If fail: log exact failure + root cause
6. Fix → re-run proof → confirm pass
7. Only mark complete after proof confirmed

---

## ENVIRONMENT LABELS

Every proof line must include:
- `local` — ran on dev machine
- `CI` — ran in GitHub Actions
- `Cloudflare` — ran post-deploy
- `live` — ran on production URL

---

## COMPLETION LAW

A feature is ONLY complete when it has:
- [ ] Canon entry in correct file
- [ ] Route/component binding confirmed
- [ ] Data source confirmed
- [ ] Role access confirmed
- [ ] Proof gate passed
- [ ] Performance budget checked

---

*Performance Engine + Fallback + Test Matrix + Validation v1.0 — BerntoutGlobal XXL*
