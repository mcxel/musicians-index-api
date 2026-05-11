# Phase 2.5: Visual Authority Enforcement - Implementation Guide

## Framework Complete ✅

All enforcement infrastructure is now in place:

### Files Created

1. **Hooks** (`src/lib/hooks/useVisualAuthority.ts`):
   - `useImageSlot()` - Generic image hydration
   - `useMagazineSlot()` - Magazine authority
   - `usePerformerPortrait()` - Motion portrait authority
   - `useVenueReconstruction()` - Venue 3D authority
   - `useVisualRouting()` - Generic visual router
   - `useVisualRetry()` - Manual retry for recovery center

2. **Wrapper Components** (`src/components/visual-enforcement/`):
   - `MagazineSlotWrapper.tsx` - Magazine enforcement
   - `PerformerPortraitWrapper.tsx` - Portrait enforcement
   - `VenueReconstructionWrapper.tsx` - Venue enforcement
   - `ImageSlotWrapper.tsx` - Generic image enforcement (includes batch mode)
   - `index.ts` - Central exports

### Enforcement Rules (NO BYPASS ALLOWED)

**BANNED PATTERNS:**
```tsx
// ❌ Direct image rendering (bypasses authority)
<img src={imageUrl} />
{imageUrl && <img src={imageUrl} />}
style={{ backgroundImage: `url(${imageUrl})` }}
<video src={videoUrl} />
```

**REQUIRED PATTERNS:**
```tsx
// ✅ Magazine slot (covers, articles, sponsor inserts)
<MagazineSlotWrapper 
  slotId="cover_001"
  roomId={roomId}
  imageUrl={imageUrl}
/>

// ✅ Performer portrait (motion portraits, avatars)
<PerformerPortraitWrapper 
  performerId={performerId}
  roomId={roomId}
  displayName={name}
  kind="artist"
/>

// ✅ Venue reconstruction (3D environments)
<VenueReconstructionWrapper 
  venueId={venueId}
  roomId={roomId}
  venueName={venueName}
  venueType="theater"
/>

// ✅ Generic image (articles, homepage, tickets)
<ImageSlotWrapper 
  imageId={imageId}
  roomId={roomId}
  priority="high"
/>

// ✅ Batch images (carousel/grid)
<ImageBatchWrapper 
  imageIds={[id1, id2, id3]}
  roomId={roomId}
  renderImage={(id, url, isLoading) => (
    <div>{url ? <img src={url} /> : <Skeleton />}</div>
  )}
/>
```

## Deployment Order - P0 Priority (8 slots)

Each slot in this order:

### 1. Magazine Slots (2)
**Time est: 1-2 hours**

- [ ] `src/components/tmi/magazine/MagazineLayout.tsx`
  - Find: `PageRenderer` component
  - Replace direct `<img>` with `<MagazineSlotWrapper>`
  - Wrap cover, article hero, sponsor insert rendering

- [ ] `src/components/MagazineCover.tsx`
  - Find: issue tile `<img>` tags
  - Replace with `<ImageSlotWrapper>` (magazine covers are generic images)
  - Use imageId = `magazine_cover_{issue.id}`

### 2. Sponsor Slots (3)
**Time est: 1-2 hours**

- [ ] `src/components/sponsor/SponsorTile.tsx`
  - Find: logo rendering `{logoUrl ? <img src={logoUrl} />}`
  - Replace with `<ImageSlotWrapper imageId={sponsorId} roomId={roomId} />`

- [ ] `src/components/tmi/sponsor/SponsorBoard.jsx`
  - Find: tile rendering loop
  - Replace `<SponsorTile>` children with authority wrappers
  - Already using SponsorTile, so no new wrapping needed if SponsorTile is updated

- [ ] `src/components/home/belts/SponsorBelt.tsx`
  - Find: carousel/grid image rendering
  - Replace with `<ImageSlotWrapper>` batch mode
  - Use `<ImageBatchWrapper imageIds={sponsorIds} />`

### 3. Homepage Slots (2)
**Time est: 1.5-2 hours**

- [ ] `src/components/home/HomepageCanvas.tsx`
  - Find: SECTION_COMPONENTS mapping
  - Each carousel/image needs wrapping
  - Magazine carousel → use `<MagazineSlotWrapper>` for magazine images
  - Featured artist → use `<ImageSlotWrapper>`
  - Trending artists → use `<ImageSlotWrapper>`
  - etc.

- [ ] `src/components/home/belts/FeaturedArtist.tsx`
  - Find: hero image rendering
  - Replace with `<ImageSlotWrapper imageId={artistId}>`

### 4. Venue/Performer Slots (3)
**Time est: 2-3 hours**

- [ ] `src/components/venue/DigitalVenueTwinShell.tsx`
  - Find: any visual rendering
  - Replace with `<VenueReconstructionWrapper venueId={venueId} />`

- [ ] `src/components/performer/PerformerCard.tsx`
  - Find: portrait/avatar rendering
  - Replace with `<PerformerPortraitWrapper performerId={performerId} kind="artist" />`

- [ ] `src/components/artist/ArtistProfile.tsx`
  - Find: profile hero/background image
  - Replace with `<PerformerPortraitWrapper>` or `<ImageSlotWrapper>`

## TypeScript Validation After Each Slot

```bash
pnpm exec tsc --noEmit
```

## Testing After Enforcement

**Manual testing:**
1. Open `/admin/visual-observatory` - should see metrics updating
2. Check blocked visuals count - should be 0-2 initially (normal hydration delays)
3. Monitor recovery rate - should be >85% (most visuals resolve on first try)
4. Check authority conflicts - should be 0

**Proof gates validation:**
```
✅ No dead conductors
✅ No orphan routes
✅ No static fallback dependence (all degraded renders are temporary)
✅ No authority bypasses (all visuals route through wrappers)
```

## Git Commits

After completing each section, commit:

```bash
git add src/components/tmi/magazine/ src/components/sponsor/ # example
git commit -m "Enforce magazine + sponsor visual authority (P0 phase 1 of 2)"
```

## Timeline

- P0 Magazine: ~2 hours
- P0 Sponsor: ~2 hours
- P0 Homepage: ~2 hours  
- P0 Venue/Performer: ~3 hours
- **Total P0: ~9 hours**

Then P1 (articles, tickets, games, dashboard): ~5-6 hours

## Fallback Behavior (Automatic - NO MANUAL CONFIG NEEDED)

Each wrapper handles:

1. **Loading state** (0-500ms typical)
   - Shows degraded render (pulsing, animated icon)
   - User sees: "Resolving visual..." or "Animating..."

2. **Authority claim** 
   - Gateway acquires lease in relevant domain
   - Blocks conflicting claims (prevents visual duplication)

3. **Hydration**
   - Retrieves cached assets OR queues for generation
   - Visual recovery coordinator watching

4. **Fallback cascade** (if blocked)
   - Cached <1h old: use cached version
   - Degraded render: show placeholder temporarily
   - Queue for retry: background recovery loop
   - Escalate: manual intervention from recovery center

5. **Error state** (after all retries exhausted)
   - Shows error badge: "⚠ Visual resolution failed"
   - Admin can see in recovery center
   - User not impacted (degraded render shows instead)

---

## Critical: No Bypass Rendering

Search for and eliminate:

```bash
# Find all <img> tags that bypass authority
grep -r "<img " src/components --include="*.tsx" --include="*.jsx"

# Find all backgroundImage bypasses
grep -r "backgroundImage" src/components --include="*.tsx" --include="*.jsx"

# Find all direct imageUrl usage
grep -r "imageUrl &&" src/components --include="*.tsx" --include="*.jsx"
```

Every result must either:
1. Use authority wrapper, OR
2. Be marked as `<!-- OK: static SVG/icon, not visual content -->`

---

Next step: Begin P0 magazine slot wrapping.
