# WIRING GUIDE — PACKS 62-66
## Characters, Battles, Shows, Avatars, Billboard, Sponsors

---

## PACK 62: Character System

### File placement
```
apps/web/src/lib/characters/character.registry.ts
apps/web/src/lib/julius/julius.engine.ts
apps/web/src/lib/hosts/host.engine.ts
```

### Wire character.registry into host engine
```typescript
// host.engine.ts already imports character.registry
// No additional wiring needed
```

### Wire Julius into Homepage 1 (via scheduler)
```typescript
// In HomePage1Scheduler.tsx, add Julius CTA support:
import { getJuliusPromptsForEvent } from "@/lib/julius/julius.engine";

// When magazine scene starts:
const juliusPrompts = getJuliusPromptsForEvent("magazine_cta");
// Render Julius component with these prompts
```

### Wire host engine into battle/show routes
```typescript
// In /battles/[matchId]/page.tsx:
import { getHostForEvent } from "@/lib/hosts/host.engine";
const today = new Date().getDay();
const assignment = getHostForEvent("weekly_battle", today);
// Render assignment.host character
```

---

## PACK 63: Battle + Contest System

### File placement
```
apps/web/src/lib/battles/battleRole.registry.ts
apps/web/src/lib/contests/contestSeason.engine.ts
apps/web/src/lib/voting/audienceVoting.engine.ts
```

### Wire battle role validation
```typescript
// Before creating any battle:
import { canBattle } from "@/lib/battles/battleRole.registry";
if (!canBattle(roleA, roleB)) throw new Error("Role mismatch — battles must match roles");
```

### Wire score calculation
```typescript
import { calculateContestScore } from "@/lib/contests/contestSeason.engine";
const score = calculateContestScore("weekly", { audienceVote:75, performanceScore:80, retentionRate:60, seasonPoints:0, finalsBonus:0 });
```

---

## PACK 64: Marcel's Monday Night Stage

### File placement
```
apps/web/src/lib/shows/monday-night/booMeter.engine.ts
apps/web/src/lib/shows/monday-night/beboCostume.registry.ts
apps/web/src/lib/shows/monday-night/marcelsMondayNight.engine.ts
```

### Wire boo meter to crowd vote input
```typescript
// In the Monday Night stage room:
import { updateBooMeter } from "@/lib/shows/monday-night/booMeter.engine";
const newState = updateBooMeter(currentState, { boo: booVotes, cheer: cheerVotes });

// Emit to performer's audio — they HEAR the boos getting louder
audioEngine.setVolume("crowd_boo", newState.booIntensity);

// Trigger Kira dialogue based on state
if (newState.kirasNextAction === "warn") {
  // Show Kira warning
}
if (newState.kirasNextAction === "call_bebo") {
  const costume = pickBeboCostume();
  // Trigger Bebo entrance animation with costume
}
```

### Route to verify
```
/stages/marcels-monday-night  → MondayNightStageScene.tsx
/shows/monday-night           → Same
```

---

## PACK 65: Avatar System

### File placement
```
apps/web/src/lib/avatars/avatarIdentity.engine.ts
apps/web/src/lib/avatars/roomPresence.engine.ts
```

### Wire avatars into venues
```typescript
import { distributeSeatsFill } from "@/lib/avatars/roomPresence.engine";
// When room loads, distribute current viewers into seats
const seatsWithAvatars = distributeSeatsFill(currentViewers, venueLayout.seats);
// Render each occupied seat with avatar bubble
```

### Wire reactions to events
```typescript
import { triggerSeatedReaction } from "@/lib/avatars/roomPresence.engine";
// When crown is awarded:
const reactions = triggerSeatedReaction(seats, "cheer", 0.9); // 90% of crowd cheers
// Animate each reacting avatar
```

---

## PACK 66: Billboard + Sponsor Reveals

### File placement
```
apps/web/src/lib/billboard/billboard.engine.ts
apps/web/src/lib/sponsors/artistSponsorReveal.engine.ts
```

### Wire billboard to homepage scene selection
```typescript
import { getBillboardScene } from "@/lib/billboard/billboard.engine";
const topArtist = await fetchTopBillboardArtist();
const scene = getBillboardScene(topArtist.rank, topArtist.isCrownHolder);
// Pass scene to homepage scheduler as priority scene
scheduler.signal(topArtist.rank === 1 ? "crown_winner" : "live_started");
```

### Wire sponsor reveal to artist intro
```typescript
import { buildSponsorReveal, SPONSOR_STACK_ANIMATION } from "@/lib/sponsors/artistSponsorReveal.engine";

// In artist intro component:
const reveal = buildSponsorReveal(artist.id, artist.sponsors);
// Inject SPONSOR_STACK_ANIMATION into component styles
// Render .sponsor-stack div during artist_intro phase only
// Remove/fade after revealDurationMs (3000ms default)
```

### Wire timeline to show flow
```typescript
import { SPONSOR_TIMELINE } from "@/lib/sponsors/artistSponsorReveal.engine";
// During each show phase, check SPONSOR_TIMELINE[phase].showAds etc.
// NEVER show performance ads during "performance" phase
```

---

## COMPLETE CHARACTER PLACEMENT MAP

| Character | Home | Surfaces |
|---|---|---|
| Julius | Everywhere | Homepage, onboarding, game rooms, battles, rewards, shop |
| Danny Green | Battles | Weekly battles (Mon/Wed/Fri), monthly finals, yearly host |
| Eddie LaRocca | Battles | Weekly battles (Tue/Thu/Sat), monthly finals, yearly co-host |
| Bobby Stanley | Deal or Feud | /games/deal-or-feud only |
| Kira | Monday Night | /stages/marcels-monday-night |
| Bebo | Monday Night | /stages/marcels-monday-night (triggered by boo meter) |

## DEAL OR FEUD 1000 — BOBBY STANLEY SCENE SPEC
- Skin: `game-show-box`
- Host: Bobby Stanley
- Stage: center podium
- Deal Zone panel: left
- Feud Board: right
- Sponsor logos: bottom ticker (Nike, Frito-Lay, Delta, Chevrolet visible in assets)
- Audience: bobblehead grid (2 panels) visible in Host 2 asset

## DANNY + EDDIE DUO STAGE SPEC
- FROM ASSET: Host 3 — red-haired white male (Danny) + dark-skinned male in teal suit (Eddie)
- Layout: Danny left, Eddie right, center reveal lane
- Both hold microphones
- Background: neon arena stage with confetti and rays
- Finals mode: center co-host position, both facing camera
