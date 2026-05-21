# CHARACTER + HOST WIRING GUIDE
## How to wire Packs 62-63 into the repo
## Blackbox: read this before touching any files

---

## CHARACTER REGISTRY WIRING

### Step 1: Copy files
```bash
cp tmi-pack62/characters/character.registry.ts apps/web/src/engines/characters/
cp tmi-pack62/hosts/host.engine.ts apps/web/src/engines/hosts/
cp tmi-pack62/shows/marcelsMondayNight.engine.ts apps/web/src/engines/shows/
cp tmi-pack62/billboard/billboard.engine.ts apps/web/src/engines/billboard/
cp tmi-pack62/avatars/avatarIdentity.engine.ts apps/web/src/engines/avatars/
cp tmi-pack62/battles/battleRole.registry.ts apps/web/src/engines/battles/
cp tmi-pack62/battles/battleSchedule.engine.ts apps/web/src/engines/battles/
cp tmi-pack63/sponsor/sponsorSurface.registry.ts apps/web/src/engines/sponsor/
```

### Step 2: Wire hosts into show pages
```typescript
// apps/web/src/app/stages/marcels-monday-night/page.tsx
import { getCharacter } from "@/engines/characters/character.registry";
import { getKiraLine, selectBeboCostume, EPISODE_TEMPLATE } from "@/engines/shows/marcelsMondayNight.engine";

const kira = getCharacter("kira");
// Use kira.assetPath to load character assets
// Use kira.voice.language for TTS
// Use EPISODE_TEMPLATE to run episode flow
```

### Step 3: Wire hosts into battle pages
```typescript
// apps/web/src/app/battles/page.tsx
import { getHostAssignment } from "@/engines/hosts/host.engine";
import { getTodaysBattleSchedule } from "@/engines/battles/battleSchedule.engine";

const today = getTodaysBattleSchedule();
const hosting = getHostAssignment(today?.eventType ?? "weekly_battle");
// hosting.primary = which host is active
// hosting.mode = "solo" | "duo"
// if duo: show DUO_EXCHANGES for banter scripts
```

### Step 4: Wire battles to role-based matchmaking
```typescript
// apps/api/src/modules/battles/battles.service.ts
import { BATTLE_ROLE_REGISTRY, canBattleEachOther } from "@/engines/battles/battleRole.registry";

async createBattle(role1: BattleRole, artist1Id: string, role2: BattleRole, artist2Id: string) {
  if (!canBattleEachOther(role1, role2)) {
    throw new Error(`Cannot match ${role1} vs ${role2}`);
  }
  const config = BATTLE_ROLE_REGISTRY[role1];
  // Use config.roomScene for environment
  // Use config.scoringWeights for judging
}
```

### Step 5: Wire billboard to homepage
```typescript
// In homepageScheduler.engine.ts, add:
import { getBillboardVisualTrigger } from "@/engines/billboard/billboard.engine";

const top = await fetchTopBillboardEntry("top_artist");
const trigger = getBillboardVisualTrigger(top);
if (trigger.triggerHomepageHero) {
  scheduler.signal("crown_awarded");  // triggers neon-announcement-stage
}
```

### Step 6: Wire sponsor stacks to artist intros
```typescript
// In any artist intro component:
import { buildArtistSponsorStack } from "@/engines/sponsor/sponsorSurface.registry";

const stack = buildArtistSponsorStack(artistId, ["Nike","Sony","TMI"]);
// stack.sponsors.forEach → animate in order, 3.5s total, clean fade
// RULE: Never block artist face, never exceed 4s
```

### Step 7: Wire Julius as platform assistant
```typescript
// apps/web/src/components/julius/JuliusAssistant.tsx
import { getCharacter, shouldJuliusAssist } from "@/engines/characters/character.registry";
import { getCharacter as char } from "@/engines/characters/character.registry";

// Julius appears when: user_onboarding, rule_question, achievement_unlock, etc.
// Julius assetPath: /public/characters/julius/
// Julius voice: en-US, warm, 1.0 speech rate
```

### Step 8: Wire Monday Night Boo System
```typescript
// apps/web/src/app/stages/marcels-monday-night/page.tsx
import { BOO_THRESHOLDS, getKiraLine, selectBeboCostume } from "@/engines/shows/marcelsMondayNight.engine";

// Track booPercent in state
// At 30% → getKiraLine("mild") → display Kira warning
// At 55% → getKiraLine("danger") → red lights, danger UI
// At 75% → getKiraLine("elimination") → selectBeboCostume() → Bebo enters
// Recovery window: 15s to drop below 40%
```

---

## KEY PUBLIC ASSET PATHS (create these folders)
```
public/
  characters/
    danny_green/        ← Host 1 assets (white, red hair, glasses, navy suit)
    eddie_larocca/      ← Host assets (Middle Eastern, teal suit, East LA)
    julius/             ← Julius the meerkat AR assistant
    kira/               ← Monday Night host (Black woman, Australian)
    bebo/               ← Elimination robot (rotating costumes)
    idol_host_1/
    idol_host_2/
    idol_host_3/
  sponsors/
    [sponsor_name]/
      logo.png
  audio/
    characters/
      danny_green/
      eddie_larocca/
      julius/
      kira/
      bebo/
```

---

## DANNY GREEN — VISUAL SPEC
From Host 1 image (Deal or Feud 1000 poster):
- **Race**: Black man
- **Build**: Stocky, friendly, approachable
- **Glasses**: Large square black frames (signature look)
- **Beard**: Short, neat
- **Hair**: Short, clean fade
- **Outfit**: Navy/dark blue suit, red tie
- **Expression**: Wide smile, animated eyebrows
- **Holding**: Microphone (right hand)
- **Style**: Bobblehead proportions, 3D stylized, neon game-show world backdrop
- **Accent Color**: Cyan (#00E5FF)
- **Show**: Deal or Feud 1000 main host + Battle host

Note: The repo has Host 1.png (Deal or Feud poster with Bobby Stanley).
In TMI canon: **Danny Green** replaces Bobby Stanley as the host.
Same visual style, same energy, but now named Danny Green.

---

## EDDIE LAROCCA — VISUAL SPEC
- **Race**: Middle Eastern (Pakistani heritage)
- **Build**: Lean, energetic, expressive
- **Hair**: Black, medium wavy, slight volume
- **No glasses**
- **Outfit**: Teal/purple gradient suit, gold chain accent, neon lapel glow
- **Expression**: Bigger, more exaggerated than Danny — wider smile
- **Accent Color**: Pink (#FF2D78)
- **Voice**: East LA Mexican-American dialect, fast speech, hype energy
- **Style**: Same bobblehead world as Danny, but more animated expressions

---

## JULIUS — VISUAL SPEC (from Julius.png)
- **Species**: Meerkat (anthropomorphic)
- **Style**: Full TMI branded suit, professional
- **Role**: Platform-wide AR assistant — PlayStation mascot equivalent
- **Can**: Appear anywhere, react to events, guide users, trigger UI
- **Voice**: American, warm, helpful, 1.0 speech rate
- **Accent Color**: Gold (#FFB800)

---

## BEBO COSTUME ROTATION
On every entrance, Bebo wears a different outfit:
referee | security_guard | tuxedo_butler | neon_janitor | ringmaster |
disco_robot | knight | firefighter | retro_game_show_assistant | chef

The costume is randomized per entrance so every appearance feels fresh.
