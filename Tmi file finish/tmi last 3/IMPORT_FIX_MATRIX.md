# IMPORT FIX MATRIX
# TMI Platform — BerntoutGlobal XXL
# Corrected import paths for every file in all 3 drops.
# Use this AFTER placing files. Fix each broken import as listed.

---

## HOW TO USE

After each wave placement, run:
```powershell
pnpm -C apps/web build 2>&1 | Select-String "error"
pnpm -C apps/api build 2>&1 | Select-String "error"
```
If errors appear, fix imports using this matrix before proceeding to next wave.

---

## WAVE 2 — Component Import Fixes

### WinnerRevealPanel.tsx
```typescript
// NEEDS: WinnerLineupStrip, WinnerReactionBurst must be in same directory
import { WinnerLineupStrip } from './WinnerLineupStrip';
import { WinnerReactionBurst } from './WinnerLineupStrip'; // exported from same file
```

### WinnerCameraDirector.tsx
```typescript
// NEEDS: reveal.presets.ts (place Wave 3 first, or use local stub)
// If reveal.presets.ts not yet placed, add this stub at top of WinnerCameraDirector.tsx:
const CAMERA_PRESETS: any[] = [];
// Remove stub and add real import after Wave 3:
import { CAMERA_PRESETS, type CameraPreset, type TransitionPreset } from '../../config/reveal.presets';
```

### HostCuePanel.tsx (Drop 1)
```typescript
// NEEDS: RayJourneyAvatarSpec.ts in same directory
import { RAY_SCRIPT_TEMPLATES, type RayScriptType } from './RayJourneyAvatarSpec';
```

### SponsorInvitePanel.tsx (Drop 1)
```typescript
// No external component imports — self-contained
// Uses lucide-react: import { Search, Star, Users, Send, ChevronDown, CheckCircle } from 'lucide-react';
```

### ContestBanner.tsx (Drop 1)
```typescript
// No external component imports — self-contained
// Uses lucide-react: import { Trophy, Star, Zap, Users, ChevronRight, Flame } from 'lucide-react';
```

### SponsorContestPanel.tsx (Drop 2)
```typescript
// No external component imports — self-contained
// Uses lucide-react only
```

### SponsorROIAnalytics.tsx (Drop 2)
```typescript
// SponsorLeaderboard is exported from same file — no extra import needed
// If split: import { SponsorLeaderboard } from './SponsorLeaderboard';
```

### ContestDiscoveryGrid (split from ContestComponents)
```typescript
// No external component imports — self-contained
```

### VoteNowPanel (split from ContestComponents)
```typescript
// No external component imports — self-contained
```

### SponsorProgressCard (split from ContestComponents)
```typescript
// No external imports
import { Zap } from 'lucide-react';
```

### ContestEntryCard (split from ContestComponents)
```typescript
import { ChevronRight } from 'lucide-react';
```

### ContestQualificationStatus (split from ContestComponents)
```typescript
import { CheckCircle, Target } from 'lucide-react';
```

### ContestProgressBanner (split from ContestComponents)
```typescript
// No external imports
```

### SponsorBadge (split from SponsorComponents)
```typescript
// No external imports
```

### SponsorArtistCard (split from SponsorComponents)
```typescript
import { ChevronRight } from 'lucide-react';
```

---

## WAVE 3 — Config Import Fixes

### reveal.presets.ts
```typescript
// No imports needed — standalone type/const file
```

### feature.flags.ts (split version)
```typescript
// No imports — export const FEATURE_FLAGS = { ... }
export type FeatureFlag = keyof typeof FEATURE_FLAGS;
export function isEnabled(flag: FeatureFlag): boolean {
  return FEATURE_FLAGS[flag] === true;
}
```

### game.types.ts (split from feature.flags)
```typescript
// No imports — standalone types + config
```

### sponsor.tiers.ts (split from feature.flags)
```typescript
// No imports — standalone
```

### contest.routes.ts (split from ContestEntities)
```typescript
// No imports — pure const object
```

---

## WAVE 4 — Page Import Fixes

### apps/web/src/app/contest/page.tsx
```typescript
// If using server components (default in Next.js 14 App Router):
import type { Metadata } from 'next';
// Client components must be in separate files or use 'use client' directive

// Contest page uses these components — must be placed in Wave 2 first:
// import { ContestBanner } from '@/components/contest/ContestBanner';
// import { SeasonCountdownPanel } from '@/components/contest/SeasonCountdownPanel';
// import { SponsorPackageTierCard } from '@/components/sponsor/SponsorPackageTierCard';
```

### apps/web/src/app/contest/admin/layout.tsx (CRITICAL)
```typescript
// Replace with your actual auth method:
import { redirect } from 'next/navigation';
// Option A (NextAuth):
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
// Option B (custom session):
// import { getSession } from '@/lib/session';

// The guard pattern:
export default async function ContestAdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions); // swap for your method
  if (!session?.user || (session.user as any).role !== 'admin') {
    redirect('/auth');
  }
  return <>{children}</>;
}
```

### apps/web/src/app/contest/qualify/page.tsx
```typescript
import type { Metadata } from 'next';
// Components used (must be Wave 2 first):
// import { SponsorProgressCard } from '@/components/contest/SponsorProgressCard';
// import { ContestQualificationStatus } from '@/components/contest/ContestQualificationStatus';
// import { SponsorInvitePanel } from '@/components/sponsor/SponsorInvitePanel';
// import { SeasonCountdownPanel } from '@/components/contest/SeasonCountdownPanel';
```

### apps/web/src/app/contest/host/page.tsx
```typescript
'use client';
import { useState } from 'react';
import { RayJourneyHost } from '@/components/host/RayJourneyHost';
import { HostCuePanel } from '@/components/host/HostCuePanel';
```

### apps/web/src/app/contest/admin/reveal/page.tsx
```typescript
import type { Metadata } from 'next';
// WinnerCameraDirector used in admin mode only:
// import { WinnerCameraDirector } from '@/components/contest/WinnerCameraDirector';
```

---

## WAVE 5 — API Import Fixes

### contest.module.ts (Drop 1)
```typescript
import { Module } from '@nestjs/common';
import { ContestController } from './contest.controller';
import { ContestService } from './contest.service';
// Uncomment when PrismaModule available:
// import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    // PrismaModule,
  ],
  controllers: [ContestController],
  providers: [ContestService],
  exports: [ContestService],
})
export class ContestModule {}
```

### contest.service.ts (Drop 1)
```typescript
import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import {
  CreateContestEntryDto,
  InviteSponsorDto,
  CastVoteDto,
  CreateSeasonDto,
  UpdateEntryStatusDto,
  AdminApprovalDto,
} from './dto/contest.dto'; // Note: moved to dto/ subfolder
```

### winner-reveal.service.ts (Drop 3)
```typescript
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import type { UpdateRevealConfigDto } from '../dto/update-reveal-config.dto';
// The WinnerRevealConfigEntity is defined in the same file — no extra import
```

### contest.env.contract.ts (split from ContestEntities)
```typescript
// No imports — pure function
// Wire to: contest.module.ts onModuleInit():
// import { validateContestEnv } from './contest.env.contract';
// onModuleInit() { validateContestEnv(); }
```

### apps/api/src/app.module.ts — THE ONLY CHANGE HERE
```typescript
// ADD THIS ONE LINE to the imports array:
import { ContestModule } from './modules/contest/contest.module';

// In @Module({ imports: [...existing..., ContestModule] })
// DO NOT change anything else in this file
```

---

## WAVE 6 — Prisma Append Fix

### packages/db/prisma/schema.prisma — APPEND ONLY
```
// DO NOT replace this file
// DO NOT modify any existing model
// ONLY paste contest.schema.prisma contents at the very END of the file

// Append exactly this (in order):
// model ContestSeason { ... }
// model ContestEntry { ... }
// model SponsorContribution { ... }
// model SponsorPackage { ... }
// model ContestRound { ... }
// model ContestVote { ... }
// model ContestPrize { ... }
// model PrizeFulfillment { ... }
// model RayJourneyScript { ... }
// model HostCue { ... }
// model WinnerRevealConfig { ... }  ← ADD this model too (from Drop 3)

// After appending:
// npx prisma generate
// npx prisma migrate dev --name add_contest_system
```

---

## WAVE 7 — Test Import Fix

### tests/e2e/contest.smoke.spec.ts
```typescript
import { test, expect } from '@playwright/test';

// Playwright config should already handle baseURL
// If not, use:
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3001';
const API_URL = process.env.TEST_API_URL || 'http://localhost:4000';
```

---

## ENV VARS TO ADD — apps/api/.env

```env
# Contest System — required by contest.env.contract.ts
CONTEST_REGISTRATION_DAY=8
CONTEST_REGISTRATION_MONTH=8
CONTEST_MAX_LOCAL_SPONSORS=10
CONTEST_MAX_MAJOR_SPONSORS=10
CONTEST_SEASON_NAME=Grand Platform Contest — Season 1
```

---

## COMMON BROKEN IMPORT PATTERNS TO WATCH FOR

| Bad Pattern | Fix |
|---|---|
| `import { X } from '../../../components/contest/X'` | `import { X } from '@/components/contest/X'` |
| `import { X } from './reveal.presets'` in component | `import { X } from '../../config/reveal.presets'` |
| `import { getServerSession } from 'next-auth'` without authOptions | Add `import { authOptions } from '@/lib/auth'` |
| `import { PrismaService } from '../prisma/...'` commented out | Leave commented until Prisma wave |
| `import { ContestModule } from '...'` in app.module.ts | Check path matches actual module location |

---

*BerntoutGlobal XXL | TMI Platform | Import Fix Matrix | Phase 19*
