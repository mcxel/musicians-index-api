# CAST_FOLDER_STRUCTURE.md
## Official Repo Placement for All Cast Files

---

```
tmi-platform/
└── docs/
    └── cast/
        │
        ├── core/
        │   ├── CAST_BIBLE_MASTER.md
        │   ├── CAST_CANON_LOCK.md
        │   ├── CAST_SOUND_CANON.md
        │   ├── CAST_COMMAND_CENTER.md
        │   ├── CAST_MEMORY_CORE.md
        │   └── CAST_ANALYTICS_AND_SCORING.md
        │
        ├── hosts/
        │   ├── BOBBY_STANLEY.md
        │   ├── TIMOTHY_HADLEY.md
        │   ├── MERIDICUS_JAMES.md
        │   ├── AIKO_STARLING.md
        │   ├── ZAHRA_VOSS.md
        │   └── NOVA_BLAZE.md
        │
        ├── julius/
        │   ├── JULIUS_BEHAVIOR_ENGINE.md
        │   ├── JULIUS_SPLIT_AND_SOUND.md
        │   ├── JULIUS_360_AVATAR_SPEC.md (future)
        │   └── JULIUS_PROP_LIBRARY.md (future)
        │
        ├── vex/
        │   └── VEX_SYSTEMS.md
        │       (contains: Costume Engine, Approach Audio,
        │        Escort Sequence, Costume Audio Map)
        │
        ├── systems/
        │   ├── HOST_CHATBOT_ENGINE.md
        │   ├── HOST_CONVERSATION_SYSTEMS.md
        │   ├── HOST_LIPSYNC_SYSTEM.md
        │   ├── HOST_MOBILITY_RULES.md
        │   ├── HOST_MOBILITY_EXTENDED.md
        │   ├── HOST_ROTATION_ENGINE.md
        │   ├── HOST_RESPONSE_INTELLIGENCE.md
        │   ├── HOST_SPEECH_ENGINE.md
        │   └── SHOW_AND_PERFORMANCE_SYSTEMS.md
        │       (contains: Show Format Library, Stage Zone Map,
        │        Performance Budget, Fallback Hierarchy)
        │
        ├── wardrobe/
        │   └── WARDROBE_SYSTEMS.md
        │       (contains: Wardrobe Engine, Production Pipeline,
        │        Costume Rotation Rules)
        │
        ├── audio/
        │   ├── CAST_SOUND_CANON.md
        │   ├── AUDIO_ASSET_STRUCTURE.md
        │   └── HOST_VOICE_IDENTITY_MAP.md
        │
        └── proof/
            ├── CAST_BUILD_ORDER.md
            ├── CAST_REPO_INTEGRATION_PLAN.md
            └── CANON_FILTER_RULES.md
```

---

# CAST_BUILD_ORDER.md
## Correct Sequence to Build the Cast System

---

## PHASE 1: CANON LOCK
1. CAST_BIBLE_MASTER.md — finalize
2. CAST_CANON_LOCK.md — commit
3. CAST_SOUND_CANON.md — commit
4. CANON_FILTER_RULES.md — apply

## PHASE 2: INDIVIDUAL HOST FILES
5. Create one file per host:
   - Bobby Stanley, Timothy Hadley, Meridicus James
   - Aiko Starling, Zahra Voss, Nova Blaze
   - Include: appearance, voice, mobility, chatbot personality, wardrobe

## PHASE 3: SYSTEM FILES
6. Host Chatbot Engine
7. Host Speech Engine + Lipsync
8. Host Mobility + Seated System
9. Host Rotation Engine
10. Host Conversation Systems

## PHASE 4: VEX SYSTEM
11. VEX Costume Engine
12. VEX Approach Audio
13. VEX Escort Sequence

## PHASE 5: JULIUS SYSTEM
14. Julius Behavior Engine
15. Julius Split System + Sound Bank
16. Julius 360 Avatar Spec (future)

## PHASE 6: SHOWS + STAGE
17. Show Format Library
18. Stage Zone Map
19. Monthly Idol Panel Blocking

## PHASE 7: WARDROBE + ASSETS
20. Cast Wardrobe Engine
21. Wardrobe Production Pipeline
22. Audio Asset Structure
23. Host Voice Identity Map

## PHASE 8: PERFORMANCE + FALLBACK
24. Cast Performance Budget
25. Cast Fallback Hierarchy

## PHASE 9: MEMORY + ANALYTICS
26. Cast Memory Core
27. Cast Analytics and Scoring
28. Cast Command Center

## PHASE 10: REPO + PROOF
29. Cast Folder Structure
30. Cast Repo Integration Plan
31. Proof gate passes

---

# CAST_REPO_INTEGRATION_PLAN.md
## How Cast System Files Land in the Repo

---

## TARGET LOCATION
All cast docs live in:
```
tmi-platform/docs/cast/
```

## INTEGRATION STEPS

**Step 1**: Copy all cast markdown files into correct subfolders (see CAST_FOLDER_STRUCTURE)

**Step 2**: Add cast docs reference to root README.md

**Step 3**: Add cast system reference to MASTER_ARCHITECTURE.md

**Step 4**: Link host profiles to their corresponding avatar/sprite asset paths

**Step 5**: Wire Host Rotation Engine to event assignment logic in:
```
tmi-platform/apps/api/src/services/cast/host-rotation.service.ts
```

**Step 6**: Wire Host Chatbot Engine to chat module:
```
tmi-platform/apps/api/src/services/cast/host-chatbot.service.ts
```

**Step 7**: Wire VEX Approach Audio to stage event system

**Step 8**: Wire Julius behavior to frontend animation controller

**Step 9**: Update PROOF_MATRIX.md with cast system proof gate

---

# AUDIO_ASSET_STRUCTURE.md
## Where Audio Assets Live in the Repo

---

```
tmi-platform/apps/web/public/
└── tmi/
    └── audio/
        ├── hosts/
        │   ├── bobby-stanley/
        │   │   ├── intros/       (intro line clips)
        │   │   ├── reactions/    (reaction sounds)
        │   │   ├── fallbacks/    (emergency filler)
        │   │   └── crowd/        (crowd callout lines)
        │   ├── timothy-hadley/   (same structure)
        │   ├── meridicus-james/
        │   ├── aiko-starling/
        │   ├── zahra-voss/
        │   └── nova-blaze/
        │
        ├── julius/
        │   ├── chirps/
        │   ├── chuckles/
        │   ├── movement/
        │   ├── performance/
        │   └── split/
        │
        ├── vex/
        │   ├── warning/          (proximity zones)
        │   ├── costume-stings/   (per outfit category)
        │   └── escort/           (removal sequences)
        │
        ├── shows/
        │   ├── intros/
        │   ├── stingers/
        │   └── transitions/
        │
        └── ui/
            ├── page-swipe/
            ├── hover/
            └── notifications/
```

---

# HOST_VOICE_IDENTITY_MAP.md
## Voice Personality Per Host — Engineering Reference

---

| Host | Age Voice | Warmth | Speed | Rhythm | Musicality | Authority | Humor Style |
|---|---|---|---|---|---|---|---|
| Bobby Stanley | 56, seasoned | High | Medium | Measured | Low | High | Dry wit |
| Timothy Hadley | 45, sharp | Medium | Medium-fast | Crisp | Low | Medium-high | Intellectual |
| Meridicus James | 56, smooth | High | Medium-slow | Musical | High | Medium | Suave |
| Aiko Starling | 30, bright | High | Fast | Dynamic | Medium | Medium | Playful |
| Zahra Voss | 42, rich | Medium-high | Slow | Deliberate | Medium-high | Very high | Dry/refined |
| Nova Blaze | 35, electric | Medium | Very fast | Punchy | Medium | High | Bold/loud |

## TTS/Voice Generation Config Notes
- Bobby: warm broadcaster tone, no upspeak
- Timothy: clean articulation, slight competitive edge
- Meridicus: melodic phrasing, musical timing
- Aiko: expressive range, bright peaks
- Zahra: low resonance, clear authority
- Nova: high energy compression, crowd projection

---

# CANON_FILTER_RULES.md
## Anti-Drift Validation Rules

---

## AUTOMATED CHECKS

Before any cast file is committed:
- [ ] Character name matches CAST_CANON_LOCK.md
- [ ] Age matches CAST_CANON_LOCK.md
- [ ] Primary show matches CAST_CANON_LOCK.md
- [ ] Mobility class matches CAST_CANON_LOCK.md
- [ ] Voice identity matches CAST_SOUND_CANON.md
- [ ] No new hosts invented
- [ ] No merged or split characters
- [ ] No style contradictions vs PDF visual canon
- [ ] No conflicting show assignments

## HUMAN REVIEW REQUIRED FOR
- Any new costume category
- Any new personality mode
- Any script style change
- Any new prop type
- Any new split/clone behavior

## DRIFT REJECTION RULES
If any of the following appear in a cast file, reject immediately:
- Wrong name spelling
- Age outside defined range
- "Host of [wrong show]"
- New character not in CAST_CANON_LOCK
- Mobility class that conflicts with table

---

*Repo Integration + Voice + Canon Filter v1.0 — BerntoutGlobal XXL*
