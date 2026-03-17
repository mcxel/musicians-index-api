# COPILOT WIRING GUIDE — TMI Grand Platform Contest System
# BerntoutGlobal XXL
# For: VS Code Copilot integration after Claude file package generation

---

## HOW TO USE THIS GUIDE

This guide tells Copilot **exactly** what to wire, extend, and connect — without recreating anything.
Claude has already created all the missing files. Copilot wires them into the live repo.

**Rule:** If a file is in this guide's DO NOT TOUCH list → only import from it, never rewrite it.

---

## WAVE 1 — Core Contest Pages + Banner System
**Wire first. Lowest risk. Highest visibility.**

### Step 1.1 — Artist Profile Page
File: `apps/web/src/app/artist/[id]/page.tsx` (EXISTING — extend only)

Add import:
```tsx
import { ContestBanner } from '@/components/contest/ContestBanner';
```

Add to artist profile layout (below bio, above discography):
```tsx
{artistData.isContestEligible && (
  <ContestBanner
    artistId={artistData.id}
    artistName={artistData.name}
    localSponsors={contestEntry?.localSponsorCount ?? 0}
    majorSponsors={contestEntry?.majorSponsorCount ?? 0}
    isQualified={contestEntry?.status === 'qualified'}
    seasonDeadline={activeSeason?.registrationEndDate}
    onFindSponsors={() => router.push('/contest/sponsors')}
    onInviteSponsors={() => setShowInvitePanel(true)}
    onViewContest={() => router.push('/contest')}
  />
)}
```

Data to fetch: add `contestEntry` and `activeSeason` to artist page data fetching.

### Step 1.2 — Contest Route Registration
File: `apps/web/src/app/contest/` — this entire directory is NEW.
Action: Place all contest page files Claude generated under this directory.

No routing config needed in App Router — directory = route.

### Step 1.3 — SponsorInvitePanel Modal
File: `apps/web/src/app/artist/[id]/page.tsx` (EXISTING — extend)

Add modal state:
```tsx
const [showInvitePanel, setShowInvitePanel] = useState(false);
```

Add modal render:
```tsx
{showInvitePanel && (
  <Modal onClose={() => setShowInvitePanel(false)}>
    <SponsorInvitePanel
      artistId={artistData.id}
      artistName={artistData.name}
      contestEntryId={contestEntry?.id ?? ''}
      availableSponsors={[]} // TODO: fetch from /api/contest/sponsors
      onSendInvite={handleSponsorInvite}
    />
  </Modal>
)}
```

---

## WAVE 2 — API Module Integration

### Step 2.1 — Register ContestModule
File: `apps/api/src/app.module.ts` (EXISTING — extend only)

Add import:
```ts
import { ContestModule } from './modules/contest/contest.module';
```

Add to imports array:
```ts
@Module({
  imports: [
    // ... existing imports
    ContestModule,
  ],
})
```

### Step 2.2 — Place API files
Place all files from Claude's `/api/contest/` output into:
`apps/api/src/modules/contest/`

### Step 2.3 — Wire PrismaService
In `contest.service.ts`, uncomment the PrismaService injection:
```ts
constructor(private readonly prisma: PrismaService) {}
```

Replace all `// TODO: return this.prisma...` lines with real Prisma calls.

### Step 2.4 — Add Prisma Models
File: `prisma/schema.prisma` (EXISTING — APPEND ONLY)

Copy all models from `contest.schema.prisma` and paste at the end of the existing schema file.

Run:
```bash
npx prisma generate
npx prisma migrate dev --name add_contest_system
```

---

## WAVE 3 — Analytics + Admin + Bots

### Step 3.1 — Register Contest Bots
File: `apps/api/src/bots/` (create if not exists)

Place `ContestBots.ts` in this directory.

Wire bots as NestJS providers or call them directly from `contest.service.ts`:
```ts
import { ContestBots } from '../../bots/ContestBots';
```

### Step 3.2 — Admin Pages
Place Claude's admin page files under:
`apps/web/src/app/contest/admin/`

Protect with admin auth check in middleware or layout:
```tsx
// apps/web/src/app/contest/admin/layout.tsx
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth'; // or your auth method

export default async function AdminLayout({ children }) {
  const session = await getServerSession();
  if (!session?.user?.role !== 'admin') redirect('/');
  return <>{children}</>;
}
```

### Step 3.3 — Event Emitter (Analytics)
In `contest.service.ts`, uncomment EventEmitter2 injection and events.
This requires `@nestjs/event-emitter` package:
```bash
npm install @nestjs/event-emitter
```

Add `EventEmitterModule.forRoot()` to `app.module.ts` imports.

---

## WAVE 4 — Host System

### Step 4.1 — Host Stage Page
Place `apps/web/src/app/contest/host/page.tsx` in correct location.

### Step 4.2 — Host Dashboard (Admin)
The HostCuePanel should only appear in admin/host views.

Suggested placement: `apps/web/src/app/contest/admin/host/page.tsx`

Wire to live WebSocket for real-time cue triggering:
```tsx
// Example WebSocket cue trigger
const handleTriggerCue = async (type, text) => {
  await fetch('/api/contest/host/cue', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ scriptId: type, resolvedText: text }),
  });
  // Also emit via WebSocket for live overlay
  socket.emit('host:cue', { type, text });
};
```

### Step 4.3 — Ray Journey Avatar on Contest Pages
Import `RayJourneyHost` into contest/host/page.tsx and pass live script data.

---

## WAVE 5 — Sponsor Overlays + Visual Polish

### Step 5.1 — Stage Sponsor Overlay
Create `StageSponsorOverlay.tsx` from manifest.
Wire to sponsor data from contest entry.

### Step 5.2 — Season Countdown
Add `SeasonCountdownPanel` to contest home page using `activeSeason.registrationEndDate`.

### Step 5.3 — Sponsor Leaderboard
Wire `SponsorLeaderboard` component to `/api/contest/sponsor-leaderboard` endpoint.

---

## IMPORTANT WIRING RULES

1. **Never rewrite** — only extend existing files
2. **Always check** `MASTER_MANIFEST.md` before creating any file
3. **Prisma** — append models, never replace existing schema
4. **app.module.ts** — add ContestModule to imports, nothing else
5. **Route guard** — admin pages need auth checks
6. **Wave order matters** — complete Wave 1 and 2 proofs before Wave 3

---

## PROOF CHECKLIST (run after each wave)

### Wave 1 Proof
- [ ] `/contest` page loads without error
- [ ] Artist profile shows ContestBanner for eligible artists
- [ ] SponsorInvitePanel opens and closes
- [ ] Contest pages don't break existing pages

### Wave 2 Proof
- [ ] `GET /api/contest/entries` returns 200
- [ ] `POST /api/contest/entries` creates entry
- [ ] `GET /api/contest/sponsor-packages` returns package list
- [ ] Prisma migrations applied cleanly

### Wave 3 Proof
- [ ] Admin pages accessible only with admin role
- [ ] Contest bots callable without errors
- [ ] Analytics endpoint returns data shape

### Wave 4 Proof
- [ ] Host page renders Ray Journey avatar
- [ ] HostCuePanel triggers cue via API
- [ ] Cue panel admin-only protected

---

*End of Copilot Wiring Guide — TMI Grand Platform Contest System*
*BerntoutGlobal XXL*
