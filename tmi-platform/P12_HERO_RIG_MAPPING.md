# P12 HERO RIG MAPPING BLUEPRINT
## The Musician's Index — 3D Hero Character Export Specification
### BerntoutGlobal LLC · For 3D Artists (Blender / Maya / Cinema4D)

---

> **This document is the handoff spec for 3D asset production.**
> Follow it exactly. The platform's HeroRigController, AvatarVenueAnchor,
> and HeroPresenceRegistry are all pre-wired to these exact file names,
> CDN paths, and animation clip names.
> Any deviation from this spec will break the hero spawner.

---

## PLATFORM ARCHITECTURE CONTEXT

The platform renders heroes using this chain:

```
HeroRegistry (heroId)
      ↓
HeroPresenceRegistry (venue + position)
      ↓
HeroAudienceSpawner (seat assignment)
      ↓
AvatarVenueAnchor (canvas overlay)
      ↓
HeroRigController (asset renderer)
      ↓
[ P11A: emoji placeholder ]    ← current
[ P12: GLB rig from CDN   ]    ← what you are building
```

The P12 upgrade path in HeroRigController.tsx:
```tsx
// P11A (now):
{hero.emoji}

// P12 (your work):
<GLBHeroRig
  src={`https://cdn.themusiciansindex.com/rigs/${hero.id}.glb`}
  animClip={animState}
  scale={HERO_SCALE[hero.id]}
/>
```

---

## GLOBAL EXPORT REQUIREMENTS

### File Format
- **Format:** GLB (binary GLTF 2.0)
- **NOT accepted:** FBX, OBJ, GLTF+bin split, Collada
- **Compression:** Draco mesh compression enabled
- **Max file size:** 8 MB per hero (12 MB for Luxe Trio / Redbeard & Specs duos)

### Scale & Orientation
- **Scale:** 1 unit = 1 meter (do not apply scale transforms, apply all before export)
- **Up axis:** Y-up
- **Forward:** -Z (character faces -Z)
- **Origin:** at ground level, centered on character feet
- **Bounding box:** character should fit within 2m height × 0.8m width

### Materials
- **Shader:** PBR metallic-roughness (GLTF standard)
- **Texture resolution:** 1024×1024 max (512×512 for accessories)
- **Texture channels required:** baseColor, normal, roughness, emissive (for glow accents)
- **Emissive:** use for accent color zones (eyes, costume details) — matches hero.accentColor
- **No baked lighting** — the platform applies its own venue lighting
- **Vertex colors:** optional, only if needed for toon shading

### Rigging Requirements
- **Skeleton:** humanoid rig (Mixamo-compatible bone naming preferred)
- **Required bones:** Hips, Spine, Chest, Neck, Head, LeftArm, RightArm, LeftLeg, RightLeg
- **Face rig:** blend shapes for: smile, open mouth, blink_L, blink_R (minimum)
- **Finger bones:** optional — hand poses can be static in P12
- **No IK rigs in export** — bake to FK before GLB export

---

## ANIMATION CLIP SPECIFICATIONS

Every hero must include ALL 5 animation clips in the same GLB file.
Clip names are case-sensitive — these are the exact names the engine calls.

| Clip Name | Duration | Loop | Description |
|---|---|---|---|
| `idle` | 2–4s | **LOOP** | Subtle breathing, slight weight shift. Calm presence. |
| `wave` | 1.5s | **ONE-SHOT** | Single friendly wave to audience. Returns to idle pose. |
| `celebrate` | 1.2s | **LOOP** | Jump/fist pump/victory. Plays on win events. |
| `dance` | 2–3s | **LOOP** | On-beat groove. For World Dance Party and music events. |
| `signature_move` | 0.8–1.2s | **ONE-SHOT** | Each hero's unique signature animation (see below). Returns to idle. |

### Signature Move Specs Per Hero

| Hero | `signature_move` clip description |
|---|---|
| **Bebo** | Robot-Lock: freeze frame → pop → lock into robot pose → return |
| **Julius** | Break-Spin: step back → 360° spin → land and point to crowd |
| **Tiana TG** | Crown-Dip: slow dip/lean back → rise → crown gesture with hands |
| **Record Ralph** | Vinyl-Scratch-Wave: DJ scratch motion with one hand, wave with other |
| **Redbeard** | High-Five-Reach: reach toward Specs position, hold |
| **Specs** | High-Five-Return: reach toward Redbeard, complete the five |
| **Luxe Trio** | Formation-Glide: synchronized 3-step glide left, pose, glide right |

---

## HERO-BY-HERO SPECIFICATIONS

---

### 1. BEBO
**File name:** `bebo.glb`
**CDN path:** `https://cdn.themusiciansindex.com/rigs/bebo.glb`
**Fallback emoji:** 🤖
**Hero ID:** `bebo`

**Character description:**
Futuristic humanoid robot. Clean, minimal design. Mix of matte metal and glowing cyan panels. Think: friendly, approachable machine with musical soul. NOT scary or industrial.

**Visual specs:**
- **Body:** Humanoid, athletic build, smooth rounded form
- **Height:** 1.7m
- **Primary material:** Matte dark metal (#1a1a2e) with polished chrome trim
- **Accent color:** Cyan (#00FFFF) — emissive glow on: eye visor, chest panel, joint rings
- **Secondary:** White/silver trim on shoulders and hands
- **Head:** Rectangular visor-style faceplate with horizontal cyan LED line (the "eyes")
- **Chest:** Small glowing TMI logo panel (emissive cyan)
- **Hands:** 3-fingered (stylized, not creepy)
- **Movement style:** Slightly robotic — precise, popped, mechanical but rhythmic

**Venue presence:**
- World Concert: front_row_center
- World Dance Party: stage (dance animation)

**Scale in scene:** 1.0 (baseline)

---

### 2. JULIUS
**File name:** `julius.glb`
**CDN path:** `https://cdn.themusiciansindex.com/rigs/julius.glb`
**Fallback emoji:** 🎙️
**Hero ID:** `julius`

**Character description:**
The MC. Charismatic Black man, adult (30s), natural confidence. Sharp dresser. The voice and energy of the platform. When Julius is in the room, the crowd listens.

**Visual specs:**
- **Body:** Athletic/average build, slight lean-forward posture (performer stance)
- **Height:** 1.85m
- **Skin:** Medium-dark brown
- **Hair:** Low fade, clean cut
- **Outfit:** TMI Gold tracksuit with black accents, gold chain, white fresh sneakers
- **Accent color:** Gold (#FFD700) — emissive on chain links, suit trim, mic base
- **Secondary:** Black (#000) on jacket shoulders and pants stripe
- **Prop:** Handheld mic (attached to right hand, geometry — not a separate asset)
- **Expression:** Confident smirk in idle, open smile in celebrate

**Venue presence:**
- Battle Arena: front_row_center
- Challenge Arena: front_row_center

**Scale in scene:** 1.0

---

### 3. TIANA TG
**File name:** `tiana-tg.glb`
**CDN path:** `https://cdn.themusiciansindex.com/rigs/tiana-tg.glb`
**Fallback emoji:** 🎤
**Hero ID:** `tiana-tg`

**Character description:**
Multi-genre performer. Black woman, young adult (mid-20s). Natural, effortless, magnetic stage presence. Equal parts R&B elegance and hip-hop fire. Crown is her signature.

**Visual specs:**
- **Body:** Slim build, poised posture
- **Height:** 1.72m
- **Skin:** Medium brown
- **Hair:** Long natural locs with gold tips (physics-simulated in idle — subtle sway)
- **Outfit:** Pink/fuchsia performance bodysuit, flowing thigh-slit skirt layer, platform boots
- **Accent color:** Pink (#FF2DAA) — emissive on: hair tips, suit trim, crown (when celebrating)
- **Secondary:** Purple (#AA2DFF) on skirt lining
- **Prop:** Small crystal crown (on head, separate mesh parented to head bone)
- **Expression:** Focused + fierce in idle, wide smile in celebrate

**Venue presence:**
- Cypher Arena: front_row_center
- Challenge Arena: front_row_left

**Scale in scene:** 1.0

---

### 4. RECORD RALPH
**File name:** `record-ralph.glb`
**CDN path:** `https://cdn.themusiciansindex.com/rigs/record-ralph.glb`
**Fallback emoji:** 💿
**Hero ID:** `record-ralph`

**Character description:**
The beat architect. DJ-producer persona. Heavy-set Latino man, adult (40s), deep in his craft. Old-school respect for the music. Quiet power. The decks are his instrument.

**Visual specs:**
- **Body:** Heavy/stocky build, relaxed stance
- **Height:** 1.75m
- **Skin:** Medium tan/olive
- **Hair:** Short dark hair, full beard with some grey
- **Outfit:** Classic DJ outfit — black oversized hoodie (TMI logo embroidered), gold chain, cargos, Timberlands
- **Accent color:** Purple (#AA2DFF) — emissive on: hoodie cuffs, spinning record prop, headphone trim
- **Secondary:** Cyan (#00FFFF) on record label geometry
- **Prop:** Spinning vinyl record disc (separate rotating mesh, parented to right hand or floating nearby)
  - Record spins continuously in idle (rotate Y-axis animation embedded in mesh)
- **Expression:** Focused, eyes down, slight nod in idle

**Venue presence:**
- Monday Night Stage: dj_booth

**Scale in scene:** 1.0

---

### 5. REDBEARD & SPECS
**File names:** `redbeard.glb` + `specs.glb` (two separate files, load as a pair)
**CDN paths:**
- `https://cdn.themusiciansindex.com/rigs/redbeard.glb`
- `https://cdn.themusiciansindex.com/rigs/specs.glb`
**Fallback emoji:** 🧔🤓
**Hero ID:** `redbeard-and-specs`

> Note: These are a DUO. Both files must be loaded and positioned together.
> The spawner positions Redbeard at seat [judge_panel_index] and Specs at [+1].
> Their signature_move animations are synchronized via timestamp matching.

**REDBEARD specs:**
- **Body:** Heavy-set, tall (1.9m), big personality energy
- **Skin:** Light (redhead/freckled)
- **Hair:** Big red curly hair + thick red beard
- **Outfit:** Loud orange/red Hawaiian-ish shirt, khaki pants, boat shoes
- **Accent color:** Orange (#FF6B35) — emissive on beard tips (subtle) and shirt pattern highlights
- **Expression:** Big grin, always looks like he's about to laugh

**SPECS specs:**
- **Body:** Slim, average height (1.72m), slightly hunched (intellectual posture)
- **Skin:** Dark (East African features)
- **Hair:** Short natural + round thick-rimmed glasses (geometry, parented to head)
- **Outfit:** Neat purple blazer over white shirt, dark jeans, white sneakers
- **Accent color:** Gold (#FFD700) on glasses frames, blazer buttons
- **Expression:** Thoughtful smirk, raises eyebrow in idle

**Venue presence:**
- Dirty Dozens: judge_panel (Redbeard at panel_L, Specs at panel_R)

**Scale in scene:** Both 1.0

---

### 6. LUXE TRIO
**File name:** `luxe-trio.glb` (all 3 characters in one file, pre-positioned)
**CDN path:** `https://cdn.themusiciansindex.com/rigs/luxe-trio.glb`
**Fallback emoji:** ✨
**Hero ID:** `luxe-trio`

> Note: All 3 characters export together in one GLB.
> They are pre-arranged in formation (left/center/right).
> The signature_move is a synchronized trio animation — do not separate.

**The Trio:**
Three performers of different backgrounds — the platform's diversity trio.
Each has their own style but their movements are synchronized.

**Member A (Center/Lead):**
- Black woman, young adult, commanding presence
- White metallic bodysuit with gold TMI crown emblem
- Natural updo with gold accessories
- Height: 1.74m

**Member B (Left):**
- Latina woman, young adult, fierce energy
- Purple/magenta two-piece performance outfit
- Long straight dark hair with purple streaks
- Height: 1.70m

**Member C (Right):**
- Asian man, young adult, smooth and precise
- Black fitted jacket with gold trim and white pants
- Clean modern fade
- Height: 1.78m

**Shared accent color:** Gold (#FFD700) — each member has gold emissive elements
**Secondary:** Each member has their own secondary color in outfit (white/purple/black)

**Formation in idle:** Triangle formation, slight angle toward viewer
**Formation distance:** 0.8m between each member center-to-center

**Venue presence:**
- World Concert: vip_booth
- World Dance Party: dj_booth (formation-glide dance)

**Scale in scene:** 1.0 for the entire group asset

---

## CDN STRUCTURE

Upload completed assets to:

```
https://cdn.themusiciansindex.com/rigs/
  bebo.glb
  julius.glb
  tiana-tg.glb
  record-ralph.glb
  redbeard.glb
  specs.glb
  luxe-trio.glb
```

Staging environment (test before production):
```
https://cdn-staging.themusiciansindex.com/rigs/
```

---

## INTEGRATION CHECKLIST (For Marcel to verify after each hero delivery)

For each delivered GLB file:

- [ ] File opens in https://gltf-viewer.donmccurdy.com/ without errors
- [ ] Scale is correct (character fits within 2m × 0.8m)
- [ ] All 5 animation clips present: `idle`, `wave`, `celebrate`, `dance`, `signature_move`
- [ ] Clip names match exactly (case-sensitive)
- [ ] `idle` and `dance` loop seamlessly (no visible seam at loop point)
- [ ] `wave` and `signature_move` return to idle pose at end
- [ ] Accent color emissive is visible in the GLTF viewer
- [ ] File size is under 8 MB (12 MB for duo/trio)
- [ ] Draco compression applied (check in viewer: Mesh → Draco present)
- [ ] No scale transform on root node (all transforms applied)
- [ ] Face blend shapes present: smile, open_mouth, blink_L, blink_R
- [ ] Upload to CDN staging URL
- [ ] Test in platform at `/avatar-center` (hero preview page)
- [ ] Verify hero spawns in correct venue (see Venue Presence section per hero)
- [ ] Verify `signature_move` triggers on click via HeroRigController

---

## HOW THE CODE SWITCHES FROM EMOJI TO GLB

When you are ready to inject a completed asset, update `HeroRigController.tsx`:

```tsx
// Find this block:
// P12: replace emoji rendering with GLB
// <GLBHeroRig src={`https://cdn.../rigs/${hero.id}.glb`} animClip={animState} />

// Replace the emoji div with:
import { Canvas } from "@react-three/fiber";
import { useGLTF, useAnimations } from "@react-three/drei";

function GLBHeroRig({ heroId, animClip }: { heroId: string; animClip: string }) {
  const { scene, animations } = useGLTF(`https://cdn.themusiciansindex.com/rigs/${heroId}.glb`);
  const { actions } = useAnimations(animations, scene);
  useEffect(() => {
    Object.values(actions).forEach(a => a?.stop());
    actions[animClip]?.play();
  }, [animClip, actions]);
  return <primitive object={scene} />;
}
```

This is the only code change needed when assets arrive. No venue logic changes. No registry changes. Just swap the render function.

---

## ESTIMATED PRODUCTION ORDER

Recommend building in this order to test the pipeline:

1. **Bebo** — simplest (robot, no hair physics, clear forms)
2. **Julius** — test human characters + prop (mic)
3. **Tiana TG** — test hair physics + crown prop
4. **Record Ralph** — test spinning prop (vinyl record)
5. **Redbeard & Specs** — test duo sync
6. **Luxe Trio** — test group sync + formation

---

*BerntoutGlobal LLC · The Musician's Index*
*P12 Hero Rig Mapping Blueprint — locked 2026-06-01*
*Hand to 3D artists only after this document is approved by Marcel Dickens*
