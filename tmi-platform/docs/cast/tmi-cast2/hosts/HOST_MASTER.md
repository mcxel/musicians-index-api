# HOST_MASTER.md
## Complete Host System — Master Reference

---

## PURPOSE
Single truth file for all human hosts in The Musician's Index platform.
All agents must reference this before building any host-related feature.

---

## COMPLETE HOST ROSTER

| Host | Show Lock | Age | Class | Voice Family | Seated? |
|---|---|---|---|---|---|
| Bobby Stanley | Deal or Feud 1000 | 56 | Free-Roam | Warm/Classic | No |
| Timothy Hadley | Circles & Squares | ~45 | Free-Roam | Sharp/Strategic | No |
| Meridicus James | Monthly Idol | 56 | Anchored+Hybrid | Smooth/Musical | Yes (Idol) |
| Aiko Starling | Monthly Idol | 30 | Anchored+Hybrid | Bright/Expressive | Yes (Idol) |
| Zahra Voss | Monthly Idol | 42 | Anchored+Hybrid | Elegant/Rich | Yes (Idol) |
| Nova Blaze | Monday Night Stage | ~35 | Free-Roam | Electric/Bold | No |

---

## HOST SYSTEM REQUIREMENTS

Every host must support:
- 360-degree avatar rotation (8 direction minimum)
- Full animation library (walk, sit, stand, gesture, react, celebrate, disappoint)
- Emotion system (face + posture + intensity)
- Lip sync to dynamically generated scripts
- Chatbot engine (ask → listen → respond → follow up)
- Wardrobe system (rotating outfits, context-aware)
- Memory + learning loop (session and long-term)
- Context-aware behavior by page/show type
- Fallback modes (sprite, low-power, silent)
- Co-host compatibility logic

---

## SECONDARY EVENT ELIGIBILITY

All 6 hosts rotate into:
- Battles (singer, drummer, dancer, comedian, pianist)
- Cyphers
- Dirty Dozen
- Any genre-specific battle

**Primary shows are immovable.**

---

## INTEGRATION POINTS

| System | How Hosts Connect |
|---|---|
| HOST_CHATBOT_ENGINE | AI conversation layer |
| HOST_ROTATION_ENGINE | Event assignment logic |
| HOST_LIPSYNC_SYSTEM | Mouth/face animation |
| HOST_SPEECH_ENGINE | Script generation |
| CAST_MEMORY_CORE | Learning and improvement |
| CAST_WARDROBE_ENGINE | Outfit rotation |
| STAGE_ZONE_MAP | Physical movement bounds |
| VEX_SYSTEMS | VEX trigger authority (Nova only) |
| JULIUS_BEHAVIOR_ENGINE | Julius support/assist |

---

*Host Master v1.0 — BerntoutGlobal XXL*
