# AVATAR_SYSTEM_COMPLETE.md
## Face-Scan Avatar · Bobblehead Physics · Audience Engine · Cosmetic Studio

---

# FACE_SCAN_ENGINE.md
## How Users Create Their Face-Scanned Avatar

---

## PURPOSE
Every user gets a personal 3D bobblehead avatar.
It looks like them, moves like them (basic expression sync), and represents them in:
- Audience seats during live events
- Lobby walls
- Cypher reactions
- Profile
- Dashboard

---

## HOW FACE SCAN WORKS

```
STEP 1: User opens Avatar Creator
STEP 2: Camera permission requested
STEP 3: AI maps 68 facial landmarks (MediaPipe Face Landmarker)
STEP 4: Facial features applied to Bobblehead_Base.glb
STEP 5: Preview shown to user
STEP 6: User confirms or retakes
STEP 7: Avatar saved as UserAvatar_[id].glb
STEP 8: Avatar deployed to:
  - Profile page
  - Audience seat in any joined venue
  - Lobby wall if artist
  - Crown celebration if winner
```

---

## WHAT THE FACE SCAN CAPTURES

| Feature | Mapped To | Notes |
|---|---|---|
| Face shape | Head geometry morph | Rounded, narrow, etc. |
| Skin tone | Base texture | Auto-applied |
| Eye shape | Eye morph targets | |
| Hair color | Approximated | User can override |
| Facial proportions | Overall head scale | |

**Privacy rule**: All face processing happens locally in browser (no images sent to server).
Only the `.glb` avatar file is saved. Raw photo is never stored.

---

## AVATAR CUSTOMIZATION (After Face Scan)

User can modify:

| Category | Options |
|---|---|
| Hair | Multiple styles + colors |
| Accessories | Hats, glasses, headphones, chains |
| Outfits | Genre-specific wardrobe options |
| Avatar skin (cosmetic) | Neon glow, chrome, etc. |
| Expression default | Happy, hype, cool, etc. |
| Badge/frame | Tier color (green/bronze/gold/diamond) |
| Special items | VEX costume items, crown frame, etc. |

---

## DESIGN BOT (Avatar Suggestion Engine)

The Design Bot suggests style based on:
- User's genre preferences
- Artist tier
- Current issue theme
- Top performing styles on platform

```
DesignBot says: "Based on your Hip Hop profile, 
here are 3 starter looks..." → [Look 1] [Look 2] [Look 3]
```

---

# BOBBLEHEAD_PHYSICS.md
## How Avatars Move in Venues

---

## BOBBLEHEAD BASE MODEL

All avatars use the same base proportions:
- Oversized head (bobblehead style)
- Simplified body
- Platform-branded uniform base
- Customizations sit on top

---

## PHYSICS SYSTEM

### Jiggle Physics (Passive)
When an avatar card is dragged, the head lags behind and springs back.

```
Physics parameters:
  stiffness: 200
  damping: 15  
  mass: 1
  
Head springs back with slight overshoot then settles.
This gives the "bobblehead" feel.
```

### Idle Animation States

| State | Animation | Trigger |
|---|---|---|
| Watching | Subtle head bob | Default in venue |
| Hype | Faster bob + arm raise | Crowd energy > 60% |
| Peak | Jump + clap | Crowd energy > 90% |
| Sad/Fail | Slow head shake | Fail moment |
| Win | Full celebration jump | Winner announced |
| Cheer | Arms raised forward | Manual reaction |
| Boo (battle) | Head shake + thumbs down | Battle boo action |
| Stand | Rises from seat | Manual stand action |
| Crown transfer | Full celebration + confetti | Weekly crown update |

---

## EXPRESSION SYNC (Live Mode)

When user has camera active (opt-in):
- MediaPipe tracks 52 facial blendshapes
- Avatar mirrors basic expressions in real time
- Smile → avatar smiles
- Eyebrow raise → avatar eyebrow raises
- Open mouth cheer → avatar open mouth

**This is purely opt-in. Camera off = idle animation only.**

---

# AUDIENCE_SIMULATION_ENGINE.md
## How the Virtual Stadium Works

---

## PURPOSE
Instead of video chat squares, fans appear as their face-scanned bobblehead avatars in actual venue seats.
Performers look out and see a real crowd of personalized avatars.

---

## AUDIENCE RENDERING

### Performance Strategy (GPU Instancing)
```
Viewers 1–30:      Full 3D bobblehead, full animation
Viewers 31–100:    Full 3D, simplified animation  
Viewers 101–500:   Simplified mesh, key animations only
Viewers 500–2000:  Crowd wave system
Viewers 2000+:     Particle crowd + density waves
```

### Seat Assignment
- Every joining user gets a seat coordinate (row, slot)
- Avatar renders at that coordinate
- Front rows = most engaged fans (highest points/tips in this session)
- VIP users = VIP box coordinates
- Late arrivals fill from back

---

## CROWD REACTION CHAIN

```
USER ACTION → AVATAR REACTION → CROWD SOUND
Fan clicks "Cheer" → Avatar arms up → Crowd cheer audio rises
Fan tips $50+ → Avatar stands + waves → Coin shower effect
Fan sends emoji → Emoji float + avatar face reaction
Fan clicks "Boo" (battle only) → Avatar boo pose → Soft boo sound
```

---

## HYPE METER → CROWD VISUAL SYNC

```
0%   → Avatars idle, murmur
30%  → Subtle swaying
60%  → More movement, arms starting to rise
80%  → Full section movement, standing front rows
90%  → Stadium wave starts spontaneously
100% → FULL ERUPTION → neon storm VFX + confetti + avatar jump
```

---

## CROWD WAVE SYSTEM

When Hype hits 90%+ or broadcaster triggers it:
1. Front row starts wave animation
2. Wave ripples back row by row
3. Each row triggers 0.3 seconds after previous
4. All 1000+ avatars in motion
5. Sound: synchronized crowd swell

---

## PERFORMER PERSPECTIVE

When artist is performing, they can switch to:
- **Stage View**: Looking out at audience (sees their crowd)
- **Heat Map Mode**: Shows which sections are most hype
- **Fan Spotlight**: Click any section → see top fan's avatar close-up
- **Crowd Stats**: Viewer count per venue (World Concert mode)

---

## SPATIAL AUDIO (CROWD)

Each avatar's sounds come from their seat position:
- Front-left fan cheers → audio pans left, closer
- Back-right fan claps → audio pans right, farther/quieter
- Creates realistic stadium feel

---

## LOOT DROP SYSTEM

During live events, the Crown Bot or artist can trigger:
```
GOLDEN CRATE drops into random seat section
Users in that section see crate appear
First to click → wins reward (cosmetic or points)
Animation: Crate spins, glows, then opens
Sound: Chime + crowd reaction
```

---

## GUARDIAN BOT (Audience Safety)

| Behavior | Action |
|---|---|
| Toxic chat | Auto-mute from chat |
| Avatar harassment | Avatar enters "ghost mode" (invisible to others) |
| Spam reactions | Slow-mode applied |
| Repeated violations | Auto-moved to overflow venue |

---

*Avatar System Complete v1.0 — BerntoutGlobal XXL*
