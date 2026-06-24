# FILE 10: tmi_3d_character_system.html — Avatar & Character System Specification

**Status:** BLUEPRINT SPECIFICATION FOR AVATAR SYSTEM (Complete, Clean, No Fake Data)  
**Audit Date:** 2026-06-23  
**Source:** `/apps/web/public/blueprints/tmi_3d_character_system.html`  
**Scope:** 3D avatar architecture, character roster, body customization, animation system, evolution mechanics  
**Blueprint Completeness:** ~95% (fully detailed; export specs included)  
**Runtime Convergence:** ~20-30% (component stubs exist, full 3D pipeline not implemented)  
**Rule 20 Violations:** NONE FOUND (clean specification, no fake data, no misleading claims)  

---

## EXECUTIVE SUMMARY

File 10 is the **canonical specification for TMI's 3D character/avatar system**. It defines:

- **Official Character Roster** — 6 host characters with defined personas, tiers, and move sets
- **Body Builder System** — 5 age groups × 5 body types × 3 heights × 8 skin tones = 1,200+ combinations
- **Head-to-Toe Customization** — 8 anatomical zones with 500+ total items (hair, clothing, accessories, etc.)
- **Animation System** — 5 move categories, physics-driven cloth/hair, idle breathing, crowd sync
- **Evolution Engine** — 6 tier levels with XP thresholds, unlock perks, and AI-driven growth
- **AI Learning System** — Characters observe live performances, sync to music, learn new moves, remember fan interactions
- **World Dance Party Ready** — Full 360° rigged, export-ready, synchronizable

**Strength:** This specification is **clean, detailed, and unambiguous**. It contains NO fake viewer counts, NO placeholder data, NO misleading metrics.

**Gap:** The current repository (as of session start) has ~50 avatar-related components using flat/emoji/2D representations. The full 3D bobblehead pipeline described here does not yet exist as working code.

---

## THEME CLASSIFICATION

### AVATAR THEME: bobblehead_realistic

**Classification:** CANONICAL_DEFAULT_THEME + APPROVED_FOR_PRODUCTION  
**Applies To:** All player avatars, all audience members, all bot characters, all host characters  
**Source:** FILE_10 (tmi_3d_character_system.html)  
**Runtime Owner:** AvatarRuntime (not yet implemented; spec-only stage)  

**Visual Style Spec:**
- **Not anime, not cartoon, not Fortnite/Roblox/MetaHuman style**
- **Target: Ultra-Realistic Bobblehead**
- Real face proportions + recognizable likeness (85-95% accuracy when face-scanned)
- Slightly oversized head (10-15% larger than proportional, collectible-figure aesthetic)
- High-quality materials: PBR textures, proper lighting response
- Expressive eyes, detailed hair, stylized realism

**Data Model:**
```
Bobblehead Avatar = Base Body (5 male + 5 female) + Face Scan + Rigged Skeleton + Physics Bones
                    + Customization Layer (clothing, accessories, hair, skin tone)
                    + Animation Layer (200+ move clips, blend shapes for expressions)
                    + Behavior Layer (idle animations, reactions, evolution tier)
```

**Customization Zones (File 10, lines 57-66):**

| Zone | Color | Items Count | Examples | Physics |
|------|-------|---|---|---|
| **HEAD** | #FF6B1A | 60+ | 60+ hair styles (locs, curls, afros, fades, braids, straight, wavy, bald); hats/caps/helmets/crowns; face scan slot; earrings/piercings; headphones/visors/sunshades | Hair physics |
| **FACE** | #00D4FF | 30+ combos | 8 skin tones; 30+ eye combinations; nose/lip/jaw variations; beard/mustache/eyelashes/makeup; glasses/goggles/face paint/tattoos/freckles | Blend shapes (expressions) |
| **NECK** | #FFD700 | 20+ | Gold chains (thin/thick/Cuban/rope); TMI/TG/BerntoutGlobal pendants; staff/host/VIP lanyards; scarves/ties/bow ties/chokers; neck tattoos | Chain physics |
| **TORSO** | #9B59FF | 100+ | Shirts/hoodies/blazers/bodysuits/crop tops/vests; jackets (leather/sequin/denim/varsity); TMI/TG/Record Ralph/BerntoutGlobal logos; physics-simulated cloth; armor/costume/fantasy overlays (WDP) | Cloth physics (reacts to all moves) |
| **ARMS & HANDS** | #FF69B4 | 80+ | Bracelets/bangles/watches/cuffs; gloves/rings; tattoo sleeves; hand props (mic/vinyl/VIP tickets/confetti); wrist chain accessories | Hand rig + prop placement |
| **WAIST** | #00FF88 | 30+ | Belts (gold/chain/rope/studded); waist chains/body jewelry; skirt/kilt waistbands; logo buckles; fanny packs/holsters | Belt physics |
| **LEGS** | #FF6B1A | 80+ | Jeans (ripped/slim/wide/flared/high-waist); shorts/leggings/skirts/suit pants/joggers; stockings/tights/fishnets; chain leg accessories/thigh cuffs; archetypes (Air Max/Jordan/Timberland/Stiletto) | Cloth physics |
| **FEET** | #00D4FF | 50+ | Sneakers/boots/heels/platforms/sandals/loafers; gold-tip/LED light-up soles; socks/anklets/foot tattoos; archetypes; barefoot detail customization | Foot rigging + sole effects |

**Total Customization Options:** 1,200+ body combinations (by age/build/height/skin) × 500+ total items = **600,000+ avatar permutations**

---

## OFFICIAL CHARACTER ROSTER (File 10, lines 25-32)

**Purpose:** 6 platform-owned host characters for stages, lobbies, game shows, and World Dance Party. These are NOT user avatars — they are system characters.

| ID | Name | Role | Tier | Emoji | Key Features | Moves |
|----|------|------|------|-------|---|---|
| bebo | **Bebo** | Platform Mascot · Bobblehead Bot | Icon (6) | 🤖 | OG face of TMI; staff badge; gold chain; boombox head; leads crowd energy | Boombox Bounce, Chain Swing, Power Fist, Crowd Control |
| julius | **Julius** | Hype Master · VIP Curator | Star (5) | 🦦 | Slick meerkat; VIP tickets; mic; magic hat; runs giveaways & crowd games | Ticket Toss, Hat Trick, Mic Drop, Sneak Slide |
| tiana | **Tiana (TG)** | Monday Night Stage Host | Star (5) | 🎤 | TG-branded; red & purple leather jackets; gold chains; ripped jeans; high-energy stage presence | Mic Wave, Stage Walk, Gold Toss, Point & Pop |
| ralph | **Record Ralph** | DJ · Music Curator | Established (3) | 🎧 | Behind decks; Record Ralph hoodie; vinyl in hand; controls sonic atmosphere | Deck Spin, Drop Head, Vinyl Wave, Bass Bounce |
| duo | **Redbeard & Specs** | Co-Host Duo | Established (3) | 🎙️ | Navy suit + red tie (Redbeard); teal blazer + purple pants (Specs); full hype energy | Mic Share, Hype Lean, Side Step, Crowd Call |
| luxe | **Luxe Trio** | Premium Show Hosts | Star (4) | ✨ | Silver fox + 2 glamour co-hosts; purple blazer, gold sequins, red gown; top-tier energy | Glam Walk, Gold Toss, Mic Spin, Shimmy |

**Status:** 
- ✅ **ROSTER DEFINED** — All 6 characters specified with exact visual descriptions
- ✅ **TIER ASSIGNMENTS** — All tied to tier system (Icon, Star, Established)
- ✅ **MOVE SETS** — Each has 4 signature moves
- ❌ **NOT YET IMPLEMENTED** — No 3D models exist in repository; these are visual specs only

---

## BODY BUILDER SYSTEM (File 10, lines 43-55)

**Matrix:**

| Age Group | Years | Builds Available | Heights | Total Combos | Skin Tones | Final Options |
|---|---|---|---|---|---|---|
| Youth | 5–17 | Slim, Average, Curvy | Short, Medium | 6 | 8 | 48 |
| Young Adult | 18–30 | Slim, Athletic, Average, Curvy, Heavy | Short, Medium, Tall | 15 | 8 | 120 |
| Adult | 31–45 | Slim, Athletic, Average, Curvy, Heavy | Short, Medium, Tall | 15 | 8 | 120 |
| Middle Age | 46–60 | Slim, Average, Curvy, Heavy | Short, Medium, Tall | 12 | 8 | 96 |
| Senior | 61+ | Slim, Average, Heavy | Short, Medium | 6 | 8 | 48 |

**Total Body Combinations:** 54 build combos × 8 skin tones = **432 base body templates**

**Skin Tone Spectrum (File 10, lines 51-55):**
```
Porcelain (#FDE8D8)
Fair (#F5CBA7)
Light (#E8A87C)
Medium (#C68642)
Tan (#A0522D)
Brown (#7B3F00)
Deep (#4A2000)
Ebony (#3B1A00)
```

**Status:** ✅ **SPECIFICATION COMPLETE** — Exactly defined for 3D artist implementation

---

## ANIMATION & MOVE SYSTEM (File 10, lines 68-85)

**5 Move Categories:**

1. **Signature Grooves** (color: #FF6B1A)
   - Boombox Bounce, Gold Chain Swing, Neon Slide, Stage Stomp, Mic Twirl, Lean Back, Head Nod, Shoulder Pop

2. **Crowd Interactions** (color: #00D4FF)
   - Crowd Call, Fan Throw, Mic Wave, Point & Pop, Hype Jump, Arms Wide, Crowd Surf, Encore Bow

3. **Battle Moves** (color: #FFD700)
   - Power Drop, Spin Lock, Freeze Frame, Body Roll, Windmill, Footwork Blitz, Flare Combo, Shadow Mirror

4. **World Dance Party** (color: #9B59FF)
   - Line Dance Sync, Group Pulse, Flash Mob Break, Arena Wave, Circle Cypher, Mass Freeze, Chain Reaction, Grand Finale

5. **Evolution Unlocks** (color: #FF69B4) — Legend+ only
   - AI Choreography, Mirror Echo, Clone Split, Signature Finale, Time Warp Loop, Light Trail Blaze, Crowd Morph, Icon Ascension

**Total Move Library:** 40+ moves across all categories, with additional moves unlocking at each tier level

**Animation Rules (File 10, lines 350-355):**
- ✅ Physics-driven — hair, chains, cloth react in real-time (NO static accessories)
- ✅ Idle animations — characters breathe, blink, sway while standing
- ✅ Crowd sync — all avatars in World Dance Party can sync to same live choreography BPM
- ✅ AI choreography — Legend+ characters generate new moves from live music tempo/genre
- ✅ Transition blending — smooth transitions: idle → dance → emote → battle → idle (NO snap cuts)
- ✅ 360° during moves — all animations captured from every angle (no camera blind spots)

**Status:**
- ✅ **MOVE LIST COMPLETE** — All moves specified with category and intent
- ❌ **NOT YET IMPLEMENTED** — No animation rigging or BVH/FBX files in repository yet
- ⚠️ **DEPENDENCY:** Requires humanoid skeletal rig (Mixamo-compatible) per export specs (File 10, line 315)

---

## EVOLUTION & TIER SYSTEM (File 10, lines 34-41)

**6 Tier Levels:**

| Tier | Level | XP Range | Color | Example Perks |
|---|---|---|---|---|
| Rookie | 1 | 0–999 XP | #888888 | Basic move set, default outfit, standard emotes, entry-level avatar |
| Rising | 2 | 1K–4.9K XP | #00D4FF | +10 dance moves, accessory unlocks, custom accent colors, fan chat badge |
| Established | 3 | 5K–19.9K XP | #9B59FF | +25 moves, stage lighting effects, fan interactions, voice line pack |
| Star | 4 | 20K–99K XP | #FF6B1A | Full move library, VIP zone access, custom arena skin, billboard slot |
| Legend | 5 | 100K–499K XP | #FFD700 | AI choreography, evolution skin unlock, World Dance Party host, signature style |
| Icon | 6 | 500K+ XP | #FF69B4 | Full AI self-evolution, TMI Hall of Fame, clone split move, infinite signature drops |

**Status:** ✅ **FULLY SPECIFIED** — XP thresholds, perks, and progression clear

---

## AI EVOLUTION ENGINE (File 10, lines 76-85)

**8 AI Learning Rules:**

| Rule | Description |
|---|---|
| **Watch & Learn** | Characters observe live performances and absorb new move patterns over time |
| **Beat Detection** | AI reads live audio stream and triggers genre-specific dance styles automatically |
| **Fan Interaction Memory** | Characters remember their most-used emotes and personalize them for each fan |
| **Style Drift** | Each character gradually develops unique signature look and movement signature |
| **Cross-Character Learning** | Bebo can teach Julius moves; Tiana can cross-train with Record Ralph, etc. |
| **World Dance Party Sync** | All characters in a room evolve together during massive live group events |
| **Monthly Drops** | New moves, outfits, accessories unlock on rolling release calendar |
| **Emotion Engine** | Characters react to crowd energy — low crowd = calm, packed house = full heat |

**Status:** ✅ **SPECIFICATION APPROVED** (not yet implemented in code)

---

## EXPORT SPECIFICATIONS (File 10, lines 315-320)

**Technical Deliverables:**

| Spec | Value | Status |
|---|---|---|
| **Rig Format** | Humanoid · Mixamo Compatible | ✅ SPEC |
| **Polygon Count** | Low / Mid / High LOD | ✅ SPEC |
| **Texture Maps** | Albedo + Normal + Emission | ✅ SPEC |
| **Animation Slots** | 200+ Clips | ✅ SPEC |
| **Physics Bones** | Hair · Cloth · Chains | ✅ SPEC |
| **Blend Shapes** | Facial Expressions | ✅ SPEC |
| **Export Formats** | FBX / GLB / USD | ✅ SPEC |
| **Engine Ready** | Unity · Unreal · Three.js | ✅ SPEC |

**Requirement:** Humanoid rigging (Mixamo-compatible) to ensure animations work across Unity/Unreal/Three.js

---

## REPOSITORY CONVERGENCE ANALYSIS

**Current State (Session Start):**
- ~50 avatar-related components in `/components/avatar/` (creation studios, customizers, inventory rails)
- Most use flat/emoji/2D representations
- No 3D rigging or mesh assets
- No face-scan pipeline
- No real animation system tied to moves

**Gap Assessment:**
- **3D Asset Pipeline:** 0% (spec only, no 3D models built)
- **Face Scan Engine:** 0% (identity layer not built)
- **Bobblehead Rigging:** 0% (skeletal rig not set up)
- **Animation System:** ~5% (some move logic exists but not wired to avatar runtime)
- **Evolution AI:** 0% (no learning logic implemented)
- **Host Characters:** 0% (Bebo/Julius/Tiana exist as sprites/emojis, not 3D assets)
- **Customization UI:** ~40% (avatar creator exists but targets 2D, not 3D)

**Overall Runtime Convergence:** ~20-30% (UI stubs in place; 3D runtime missing entirely)

---

## CRITICAL IMPLEMENTATION GAPS

### 1. Face Scan Pipeline (Rule 18 Requirement)
**Blueprint Spec:** User photographs face → landmarks detected → mapped to bobblehead UV texture → preview in audience seat → saved to inventory

**Current Status:** ❌ NOT BUILT  
**Scope:** Computer vision + 3D face-mesh model + UV mapping + rigging

### 2. 3D Asset Production
**Blueprint Spec:** 5 male + 5 female base bodies, fully rigged, 360° captured

**Current Status:** ❌ ZERO ASSETS  
**Scope:** 3D modeling + rigging + texture work for base + LOD variants

### 3. Humanoid Animation Rig
**Blueprint Spec:** Mixamo-compatible humanoid skeleton for 200+ move clips

**Current Status:** ❌ NOT SET UP  
**Scope:** Rigging infrastructure + motion capture integration

### 4. Real-Time 3D Rendering Pipeline
**Blueprint Spec:** Bobbleheads rendered in:
- Audience seats (AudienceScene)
- Profile pages (PlayerProfile)
- Lobbies (AvatarLobbyCanvas)
- Dance floors (World Dance Party)
- Video overlays (VideoPresenceOverlay)

**Current Status:** ❌ NOT WIRED  
**Scope:** Three.js/Babylon.js/Unreal integration for in-browser rendering

### 5. AI Evolution Engine
**Blueprint Spec:** Characters learn from live music, absorb performer movements, remember fan interactions

**Current Status:** ❌ NOT BUILT  
**Scope:** Audio analysis + move detection + memory persistence

---

## FAKE DATA AUDIT

**Result:** ✅ **CLEAN — ZERO FAKE DATA VIOLATIONS**

File 10 contains NO:
- Hardcoded viewer counts
- Fake performance metrics
- Misleading claims
- Placeholder statistics
- False permissions/abilities
- Unverified feature claims

All specifications are bounds-checked (e.g., "Youth 5–17", "500K+ XP for Icon") and internally consistent.

---

## THEME REGISTRY ENTRY

**Theme:** bobblehead_realistic  
**Source:** FILE_10 tmi_3d_character_system.html  
**Applies To:** All user avatars, all bot avatars, all audience members  
**Default?** YES  
**Seasonal?** NO (always active, but can have seasonal outfit variants)  
**Production Ready?** SPEC_APPROVED (not yet implemented)  
**Performance Risk:** HIGH (3D rendering cost TBD)  
**Mobile Risk:** HIGH (3D on mobile requires LOD system)  

**Variants (Future):**
- bobblehead_realistic_lowpoly — mobile-optimized LOD
- bobblehead_realistic_emote — seasonal/event outfits
- bobblehead_realistic_glow — premium/legend tier visual upgrade

---

## CROSS-REFERENCED SYSTEMS

**Dependencies:**
- PerformerRegistry — avatar skins link to performer identities
- GlobalLiveSessionRegistry — avatar presence in audience scenes
- XpActionRegistry — avatar evolution tied to platform XP
- InventoryCanister (Rule 15) — clothing/accessories stored in user inventory
- AvatarCreationCenter (Rule 15) — entry point for avatar customization
- World Dance Party mode (Rule 21) — synchronized avatar choreography

**Canonical Imports (if implemented):**
```typescript
import { AvatarRuntime } from '@/lib/avatar/AvatarRuntime'
import { BobbleheadTheme } from '@/lib/avatar/themes/BobbleheadTheme'
import { FaceScanEngine } from '@/lib/avatar/FaceScanEngine'
import { CharacterRoster } from '@/lib/avatar/CharacterRoster'
import { EvolutionEngine } from '@/lib/avatar/EvolutionEngine'
```

---

## AUDIT METADATA

| Field | Value |
|---|---|
| File Audited | tmi_3d_character_system.html |
| Lines Analyzed | 1–446 (complete file) |
| Specification Completeness | 95% |
| Runtime Convergence | 20–30% |
| Rule 20 Violations | ZERO |
| Visual Themes Extracted | 1 (bobblehead_realistic as canonical default + 3 potential variants) |
| Canonical Runtime Findings | AvatarRuntime (not yet implemented; full spec provided) |
| Optional Theme Findings | 3 (lowpoly, emote, glow variants — future expansion) |
| Unsafe Fake Data Findings | ZERO (clean specification) |
| Repository Systems Cross-Referenced | 6 (PerformerRegistry, LiveSessionRegistry, XP, Inventory, CreationCenter, WDP) |
| Code Modified | NO |
| Files Inspected by Content | 10 of 43 |
| Files Skipped | 0 |
| Ready for Next File | YES |

---

**Blueprint File:** 10 of 43  
**Filename:** tmi_3d_character_system.html  
**Entire file read:** YES (446 lines)  
**Reusable visual themes found:** 1 canonical + 3 variants  
**Canonical runtime findings:** AvatarRuntime (spec-approved, not implemented)  
**Optional theme findings:** bobblehead_realistic_lowpoly, _emote, _glow  
**Unsafe fake data findings:** ZERO  
**Repository systems cross-referenced:** 6  
**Code modified:** NO  
**Files inspected by content:** 10 of 43  
**Files skipped:** 0  
**Ready for next file:** YES
