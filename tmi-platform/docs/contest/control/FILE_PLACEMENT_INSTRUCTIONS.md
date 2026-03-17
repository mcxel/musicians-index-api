# SPLIT FILE PLACEMENT INSTRUCTIONS
# TMI Platform — BerntoutGlobal XXL
# Tell Copilot or Blackbox: "Place each file at its exact repo path below."

---

## CONTEST COMPONENTS → apps/web/src/components/contest/

| File in This Package | Final Repo Path |
|---|---|
| `ContestEntryCard.tsx` | `apps/web/src/components/contest/ContestEntryCard.tsx` |
| `ContestQualificationStatus.tsx` | `apps/web/src/components/contest/ContestQualificationStatus.tsx` |
| `ContestRulesCard.tsx` | `apps/web/src/components/contest/ContestRulesCard.tsx` |

> ContestRulesCard.tsx also contains:
> - `ContestProgressBanner` → `apps/web/src/components/contest/ContestProgressBanner.tsx`
> - `ContestDiscoveryGrid` → `apps/web/src/components/contest/ContestDiscoveryGrid.tsx`
> - `VoteNowPanel` → `apps/web/src/components/contest/VoteNowPanel.tsx`
> - `ScoreboardOverlay` → `apps/web/src/components/contest/ScoreboardOverlay.tsx`
>
> Each export in that file must be split into its own file at its path above.
> The `ContestRulesCard.tsx` file itself → `apps/web/src/components/contest/ContestRulesCard.tsx`

---

## HOST COMPONENTS → apps/web/src/components/host/

| File in This Package | Final Repo Path |
|---|---|
| `SponsorCuePanel.tsx` | `apps/web/src/components/host/SponsorCuePanel.tsx` |
| `HostScriptPanel.tsx` | `apps/web/src/components/host/HostScriptPanel.tsx` |

> HostScriptPanel.tsx also contains:
> - `PrizeRevealControlPanel` → `apps/web/src/components/host/PrizeRevealControlPanel.tsx`
> - `CoHostHandoffPanel` → `apps/web/src/components/host/CoHostHandoffPanel.tsx`
> - `CrowdPromptPanel` → `apps/web/src/components/host/CrowdPromptPanel.tsx`
> - `HostSoundboardPanel` → `apps/web/src/components/host/HostSoundboardPanel.tsx`
> - `HostStageCard` → `apps/web/src/components/host/HostStageCard.tsx`
>
> Each export must become its own file. `HostScriptPanel` itself → `HostScriptPanel.tsx`

---

## GAME COMPONENTS → apps/web/src/components/game/

| File in This Package | Final Repo Path |
|---|---|
| `MysteryBoxReveal.tsx` | `apps/web/src/components/game/MysteryBoxReveal.tsx` |
| `SoundClueTrigger.tsx` | `apps/web/src/components/game/SoundClueTrigger.tsx` |

> SoundClueTrigger.tsx also contains:
> - `AudienceGuessPanel` → `apps/web/src/components/game/AudienceGuessPanel.tsx`

---

## CONTEST PAGES → apps/web/src/app/contest/...

| File in This Package | Final Repo Path |
|---|---|
| `qualify-page.tsx` | `apps/web/src/app/contest/qualify/page.tsx` |
| `rules-page.tsx` | `apps/web/src/app/contest/rules/page.tsx` |
| `remaining-pages.tsx` | **Split into individual files:** |
| → `LeaderboardPage` export | `apps/web/src/app/contest/leaderboard/page.tsx` |
| → `SponsorsPage` export | `apps/web/src/app/contest/sponsors/page.tsx` |
| → `HostPage` export | `apps/web/src/app/contest/host/page.tsx` |
| → `AdminPage` export | `apps/web/src/app/contest/admin/page.tsx` |
| → `SeasonPage` export | `apps/web/src/app/contest/season/[seasonId]/page.tsx` |
| → `SeasonArchivePage` export | `apps/web/src/app/contest/season/[seasonId]/archive/page.tsx` |

> IMPORTANT: Each page file must have a single default export.
> Rename the export to `default function Page()` in each file.

---

## ENTITY FILES → apps/api/src/modules/contest/entities/

| File in This Package | Final Repo Path |
|---|---|
| `contest-entry.entity.ts` | `apps/api/src/modules/contest/entities/contest-entry.entity.ts` |
| `sponsor-contribution.entity.ts` | `apps/api/src/modules/contest/entities/sponsor-contribution.entity.ts` |
| `contest-round.entity.ts` | `apps/api/src/modules/contest/entities/contest-round.entity.ts` |
| `contest-vote.entity.ts` | `apps/api/src/modules/contest/entities/contest-vote.entity.ts` |

> contest-vote.entity.ts also contains:
> - `ContestPrizeEntity` → `apps/api/src/modules/contest/entities/contest-prize.entity.ts`
> - `ContestSeasonEntity` → `apps/api/src/modules/contest/entities/contest-season.entity.ts`

---

## IMPORT FIXES TO APPLY AFTER PLACEMENT

### WinnerCameraDirector.tsx
```typescript
// If reveal.presets.ts is not yet placed, add this stub at top of file:
const CAMERA_PRESETS: any[] = [];
// Remove stub after Wave 3 config files are placed, then add:
import { CAMERA_PRESETS, type CameraPreset, type TransitionPreset } from '../../config/reveal.presets';
```

### Each contest page
```typescript
// Add metadata export in each page file:
import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Page Name | Contest | TMI' };
// Make sure only ONE default export per file
export default function Page() { ... }
```

### Entity files
```typescript
// No imports needed — pure class definitions
// Export them individually from an index file if needed:
// apps/api/src/modules/contest/entities/index.ts:
export { ContestEntryEntity } from './contest-entry.entity';
export { SponsorContributionEntity } from './sponsor-contribution.entity';
export { ContestRoundEntity } from './contest-round.entity';
export { ContestVoteEntity } from './contest-vote.entity';
export { ContestPrizeEntity } from './contest-prize.entity';
export { ContestSeasonEntity } from './contest-season.entity';
```

---

## AFTER PLACING ALL FILES — PROOF COMMAND

```powershell
pnpm -C apps/web build
pnpm -C apps/api build
```

If both pass → proceed to Wave 6 (Prisma) and Wave 7 (tests).

---

*BerntoutGlobal XXL | TMI Platform | Split File Placement Instructions | Phase 18*
