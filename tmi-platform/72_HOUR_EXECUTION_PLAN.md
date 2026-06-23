# 72-Hour Execution — Go Live + Avatar Merge + HQ Data Audit

**Start**: Now (2026-06-22)  
**Completion Target**: 2026-06-25  
**Allocation**: 40% A1 | 25% A2 | 15% A3 | 10% B1 | 10% C1

---

## A1: Go Live Certification (Next 48 Hours)

**Mission**: Prove this loop works end-to-end.

```
Performer clicks GO LIVE
  ↓ Video stream starts
  ↓ GlobalLiveSessionRegistry records the session
  ↓ Home 1 orbital wheel updates (performer appears in ring)
  ↓ Home 1-2 billboard shows preview card
  ↓ Home 3 live world shows room tile
  ↓ Fan clicks room from any of those surfaces
  ↓ Fan joins lobby
  ↓ Fan sees audience scene with live video
  ↓ Performer sees audience count update in real-time
  ↓ Performer goes offline
  ↓ Registry clears
  ↓ Room disappears from all discovery surfaces
```

### Test Scenario 1: Single Performer, Single Broadcast (2 hours)

**Setup**:
- Login as performer (e.g., "steel-echo" from PerformerRegistry)
- Open `/go-live` or equivalent route

**Execute**:

| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | Click "Start Broadcasting" | Broadcast modal appears, stream initializes | [ ] |
| 2 | Wait 2 seconds | Home 1 orbital wheel updates (performer appears in live ring) | [ ] |
| 3 | Open new tab, navigate to `/home/1` | Performer visible in orbital wheel live performers section | [ ] |
| 4 | Open third tab, navigate to `/home/1-2` | Performer visible in billboard preview (video preview shows) | [ ] |
| 5 | Open fourth tab, navigate to `/home/3` | Room tile appears in live world wall | [ ] |
| 6 | In billboard tab, click performer's preview card | Modal or route to `/live/rooms/[id]` opens | [ ] |
| 7 | Login as fan in new browser window (or private tab) | Fan account ready | [ ] |
| 8 | In fan browser, navigate to `/live/lobby` | Lobby entry flow shows available rooms; performer's room visible | [ ] |
| 9 | Fan clicks performer's room tile | Route to `/live/rooms/[id]` loads | [ ] |
| 10 | Wait for lobby entry (avatar + seat assignment) | Fan avatar appears in audience scene; performer's audience count increases | [ ] |
| 11 | In performer browser, check audience display | Shows 1 audience member; real-time update visible | [ ] |
| 12 | In fan browser, send tip (any amount) | Tip modal appears → Stripe modal → complete test charge | [ ] |
| 13 | In performer browser, check notifications | Tip notification appears | [ ] |
| 14 | In performer browser, click "End Broadcast" | Stream stops; broadcasts recorded to analytics | [ ] |
| 15 | Refresh Home 1 / Home 1-2 / Home 3 in all tabs | Performer no longer in discovery; room no longer in live world | [ ] |

**Pass Condition**: All 15 steps pass. Any failure → investigate, fix, repeat.

**Evidence**: Screenshots of each step (especially steps 2, 4, 5, 10, 11 which are the propagation verification).

---

### Test Scenario 2: Multiple Performers, Staggered Broadcasts (4 hours)

**Setup**: Repeat Scenario 1 with 3 different performers (e.g., "rize-crew", "dj-solar", "laughtrack-mike") starting at different times.

**Execute**:
- Performer 1 goes live at T=0
- Wait 30 seconds, Performer 2 goes live at T=30
- Wait 30 seconds, Performer 3 goes live at T=60
- Verify all 3 appear on Home 1 / Home 1-2 / Home 3
- Verify each room can be joined independently
- Verify discovery shows correct audience count per room (real-time)

**Pass Condition**: All 3 performers visible simultaneously. Discovery updates accurately. No missing rooms.

**Evidence**: Screenshot showing all 3 rooms on Home 3 live wall simultaneously.

---

### Test Scenario 3: Stress — Multiple Fans Joining (4 hours)

**Setup**: Performer goes live. 5-10 fans join the same room (from different browser tabs or windows).

**Execute**:
- Performer starts broadcast at T=0
- Fan 1 joins at T=5
- Fan 2 joins at T=10
- Fan 3 joins at T=15
- ... (continue until 5-10 fans in room)
- Verify audience count matches actual fans (no ghost seats)
- Verify each fan sees the same live video feed
- Verify performer sees accurate audience count
- Each fan sends a tip
- Verify all tips recorded

**Pass Condition**: Audience count accurate. No broken seats. All tips recorded.

**Evidence**: Screenshot showing performer's audience count, then screenshot showing that many fans actually in room + their tip notifications.

---

### Test Scenario 4: Edge Cases (4 hours)

**Case A: Performer starts, stops, restarts**
- Go live → wait 30s → end → immediate restart
- Verify room is created fresh (no residual state from previous broadcast)
- Verify old room disappears from discovery before new room appears

**Case B: Fan joins, then performer ends broadcast**
- Fan is in room
- Performer ends broadcast
- Verify fan's view gracefully shows "Room ended" (not 404 or blank)
- Verify fan can still see replay or is redirected to related performers

**Case C: Multiple concurrent broadcasts in same genre**
- 3 performers in Hip-Hop genre go live simultaneously
- Verify all appear in Hip-Hop category on discovery
- Verify each can be joined independently
- Verify audience counts don't cross-contaminate

**Pass Condition**: All edge cases handle gracefully (no crashes, no data loss, no cross-contamination).

---

### A1 Gate Pass Condition

**After 48 hours, A1 passes if:**

```
✓ Scenario 1: All 15 steps pass
✓ Scenario 2: Multiple performers visible simultaneously
✓ Scenario 3: Audience count accurate with 5-10 concurrent fans
✓ Scenario 4: All edge cases handle without errors
✓ No console errors during any scenario
✓ No database inconsistencies (verify via admin panel or logs)
```

**If any scenario fails**: Fix root cause → repeat that scenario only → continue.

---

## A2: Media Certification (Parallel, 24 Hours)

**Mission**: Prove upload → storage → playback works end-to-end.

### Test 1: Song Upload (8 hours)

**Setup**:
- Login as performer
- Navigate to profile upload section or `/hub/performer`

**Execute**:

| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | Click "Upload Song" | Modal/form appears | [ ] |
| 2 | Select test MP3 file (e.g., 5MB, 2 min duration) | File selected, name appears in form | [ ] |
| 3 | Enter song metadata (title, artist, genre) | Form validates | [ ] |
| 4 | Click "Upload" | Upload begins, progress bar appears | [ ] |
| 5 | Wait for upload to complete | File stored; confirmation appears | [ ] |
| 6 | Wait for transcoding (if applicable) | Processing completes within 5 min | [ ] |
| 7 | Refresh profile | Song appears in Playlist section | [ ] |
| 8 | Click song in profile playlist | MediaPlayer or PlaylistPlayer opens | [ ] |
| 9 | Click play button | Audio plays without stuttering | [ ] |
| 10 | Verify song metadata displays (title, duration, artist) | Correct metadata shown | [ ] |
| 11 | Test seek bar (skip to 1:00) | Audio seeks to correct position | [ ] |
| 12 | Test volume control | Volume adjusts | [ ] |
| 13 | View song from Magazine (if featured) | Song tile appears + plays | [ ] |
| 14 | View song from Discovery Rail (if matched to fan) | Song discoverable + plays | [ ] |

**Pass Condition**: All 14 steps pass. Song plays identically from Profile, Magazine, Discovery, and Playlist contexts.

**Evidence**: Screenshots of upload → profile → playback across all surfaces.

---

### Test 2: Video Upload (8 hours)

Same as Test 1, but with 20-30 second video file.

**Additional checks**:
- Video thumbnail displays correctly
- Video plays in preview (if applicable) before download/full playback
- Transcoding completes without errors

---

### A2 Gate Pass Condition

**After 24 hours, A2 passes if:**

```
✓ Test 1: Song uploads, stores, plays correctly on all surfaces
✓ Test 2: Video uploads, stores, plays correctly
✓ Seek bar works
✓ Volume control works
✓ Metadata displays correctly
✓ No audio distortion or stuttering
```

---

## A3: Route Certification (Parallel, 18 Hours)

**Mission**: Zero dead links. Every clickable element navigates or acts correctly.

### Priority Routes (Test All)

**Home Pages**:
- [ ] `/home/1` → Home 1 loads, orbital wheel visible, performers clickable
- [ ] `/home/1-2` → Billboard loads, cards clickable
- [ ] `/home/2` → Magazine loads, articles clickable
- [ ] `/home/3` → Live world loads, rooms clickable
- [ ] `/home/4` → Marketplace loads, items clickable
- [ ] `/home/5` → Arena loads, events clickable

**Profile Pages**:
- [ ] `/performers/[slug]` → Profile loads + all canisters load (playlist, memories, booking, messages, store, avatar, inventory, lobby)
- [ ] Click performer's song → Plays
- [ ] Click performer's booking button → Booking modal opens
- [ ] Click performer's tip button → Tip modal opens
- [ ] Click performer's fan club button → Subscription modal opens

**Discovery**:
- [ ] Magazine article clicks resolve to `/magazine/article/[slug]`
- [ ] Articles load with content, related articles, related performers
- [ ] Sponsor tiles click through to `/sponsors/[id]`
- [ ] Battle tiles click through to `/battles/live` or `/games/[id]`
- [ ] Live room tiles click through to `/live/rooms/[id]`

**Transactions**:
- [ ] `/pricing` loads; subscription buttons clickable
- [ ] `/shop/[slug]` loads; merch items clickable
- [ ] Cart icon functional; checkout route works
- [ ] `/ticketing` loads; ticket purchase flow completes

**Admin**:
- [ ] `/admin/observatory` loads; telemetry displays
- [ ] All admin panels load without errors

### Automation (Optional)

If time allows, create simple Playwright script:

```javascript
// pseudo-code
const routes = [
  '/home/1', '/home/1-2', '/home/2', '/home/3', '/home/4', '/home/5',
  '/performers/steel-echo', '/performers/dj-solar',
  '/magazine/article/[some-article]',
  '/live/rooms/[some-room]',
  '/pricing', '/shop/merch-item-1',
  '/admin/observatory'
];

for (const route of routes) {
  const response = await fetch(route);
  console.log(`${route}: ${response.status}`);
  assert(response.status === 200, `Route ${route} returned ${response.status}`);
}
```

**Pass Condition**: All priority routes return 200. No 404s. No console errors.

**Evidence**: Grep output confirming zero `href="#"` in production code + test results screenshot.

---

## B1: AvatarLobbyCanvas Merge (Parallel, 2-4 Hours)

**Mission**: Consolidate 3 copies into 1 canonical version.

### Execution

**Step 1: Find all copies (15 min)**
```bash
find . -name "AvatarLobbyCanvas.tsx"
```

Expected output:
```
./components/avatars/AvatarLobbyCanvas.tsx
./components/lobbies/AvatarLobbyCanvas.tsx
./app/web/src/components/AvatarLobbyCanvas.tsx
```

**Step 2: Audit copies (30 min)**
- Compare all 3 files for differences
- Check if any copy has unique logic/features
- If all identical → proceed to consolidation
- If differences exist → document them; decide which copy is canonical

**Step 3: Choose canonical location (15 min)**
- Recommend: `components/avatars/AvatarLobbyCanvas.tsx`
- Reasoning: Most semantic (avatars folder, not lobbies or root)

**Step 4: Update all imports (45 min)**
```bash
grep -r "AvatarLobbyCanvas" --include="*.tsx" --include="*.ts"
```

Replace all imports:
```
import AvatarLobbyCanvas from '...' → import AvatarLobbyCanvas from '@/components/avatars/AvatarLobbyCanvas'
```

**Step 5: Delete duplicate files (5 min)**
```bash
rm ./components/lobbies/AvatarLobbyCanvas.tsx
rm ./app/web/src/components/AvatarLobbyCanvas.tsx
```

**Step 6: Test (30 min)**
- Compile TypeScript (`pnpm typecheck`)
- Test all avatar-related surfaces (profiles, lobbies, live rooms, discovery)
- Verify no visual regressions

**Step 7: Commit (5 min)**
```bash
git add .
git commit -m "Consolidate AvatarLobbyCanvas: 3 copies → 1 canonical in components/avatars/"
```

**Pass Condition**: Typecheck passes. All avatar surfaces work identically. One canonical version confirmed.

---

## C1: HQ Data Audit (Parallel, 6 Hours)

**Mission**: Verify Fan HQ and Performer HQ can receive real data before building visualizations.

### Fan HQ Backend Audit

**Question 1**: Can Fan HQ receive XP data?
- [ ] XpActionRegistry exists and is callable
- [ ] Current user's XP is queryable (e.g., via `/api/user/xp` or similar)
- [ ] User's tier is derivable from XP
- [ ] Tier progression is calculable (e.g., "2,450 / 5,000 XP to Gold")

**Question 2**: Can Fan HQ receive rewards data?
- [ ] RewardsEngine or similar exists
- [ ] Claimed/unclaimed rewards are queryable per user
- [ ] Reward history is available

**Question 3**: Can Fan HQ receive collection data?
- [ ] Fan's playlists are queryable
- [ ] Fan's memories/saved moments are queryable
- [ ] Fan's cosmetics/inventory is queryable
- [ ] Fan's tickets are queryable

**Question 4**: Can Fan HQ receive ranking data?
- [ ] User's current rank is queryable
- [ ] Leaderboard is accessible (fans ranked by XP)
- [ ] Next-rank-up threshold is calculable

**Question 5**: Can Fan HQ receive live discovery data?
- [ ] GlobalLiveSessionRegistry is queryable
- [ ] Current live performers are filterable by genre/friend status
- [ ] Live room data (performer name, audience count, stream preview URL) is complete

**Question 6**: Can Fan HQ receive subscription data?
- [ ] User's fan club memberships are queryable
- [ ] Subscription status (active, auto-renewal date) is available per subscription
- [ ] Member-exclusive content flags exist

---

### Performer HQ Backend Audit

**Question 1**: Can Performer HQ receive revenue data?
- [ ] TipEngine or similar tracks tips received (by performer, by date range)
- [ ] SubscriptionEngine tracks subscribers + recurring revenue
- [ ] TicketEngine tracks ticket sales (if performer hosts events)
- [ ] MerchEngine tracks merch sales
- [ ] BookingEngine tracks booking fees

**Question 2**: Can Performer HQ receive audience stats?
- [ ] GlobalLiveSessionRegistry tracks viewer history (for trend graph)
- [ ] PerformerRegistry tracks follower count
- [ ] AnalyticsEngine or similar tracks watch time + shares + engagement

**Question 3**: Can Performer HQ receive recent activity?
- [ ] NotificationEngine surfaces fan subscriptions, tips, bookings
- [ ] ActivityTimelineCanister provides recent actions on performer's content

**Question 4**: Can Performer HQ receive opportunity data?
- [ ] OpportunityEngine suggests sponsorships based on performer tier/audience
- [ ] SponsorRegistry surfaces available sponsor offers

**Question 5**: Can Performer HQ receive booking requests?
- [ ] BookingEngine queries incoming booking requests
- [ ] Calendar integration is available (show when bookings are scheduled)

**Question 6**: Can Performer HQ receive media library data?
- [ ] Performer's uploaded songs are queryable
- [ ] Performer's uploaded videos are queryable
- [ ] Performer's playlists are queryable

---

### C1 Pass Condition

**For each question above, answer "yes" or "no"**:

```
Fan HQ:
  Q1 (XP): [YES/NO]
  Q2 (Rewards): [YES/NO]
  Q3 (Collections): [YES/NO]
  Q4 (Rankings): [YES/NO]
  Q5 (Live Discovery): [YES/NO]
  Q6 (Subscriptions): [YES/NO]

Performer HQ:
  Q1 (Revenue): [YES/NO]
  Q2 (Audience): [YES/NO]
  Q3 (Activity): [YES/NO]
  Q4 (Opportunities): [YES/NO]
  Q5 (Bookings): [YES/NO]
  Q6 (Media): [YES/NO]
```

**If any question is NO**:
- Document what's missing
- Create a task to implement the missing backend
- Do NOT build visualization widget for data that doesn't exist yet

**If all questions are YES**:
- Proceed with HQ widget building in next phase
- You know the data exists; visualization is just the render layer

---

## 72-Hour Checkpoint (2026-06-25)

### Status Report Required

**A1 (Go Live)**:
- [ ] Scenario 1 complete? (PASS/FAIL)
- [ ] Scenario 2 complete? (PASS/FAIL)
- [ ] Scenario 3 complete? (PASS/FAIL)
- [ ] Scenario 4 complete? (PASS/FAIL)
- If any FAIL: What broke? What's the fix?

**A2 (Media)**:
- [ ] Song upload complete? (PASS/FAIL)
- [ ] Video upload complete? (PASS/FAIL)
- If any FAIL: What broke? What's the fix?

**A3 (Routes)**:
- [ ] All priority routes return 200? (PASS/FAIL)
- [ ] Zero console errors? (PASS/FAIL)
- [ ] Grep confirms zero dead links? (PASS/FAIL)

**B1 (AvatarLobbyCanvas)**:
- [ ] Consolidated to 1 file? (YES/NO)
- [ ] All imports updated? (YES/NO)
- [ ] Typecheck passes? (YES/NO)

**C1 (HQ Data Audit)**:
- [ ] Fan HQ: YES answers: 6/6 or [specify which are NO]
- [ ] Performer HQ: YES answers: 6/6 or [specify which are NO]

---

## If 72 Hours Isn't Enough

**Priority order for next 48 hours**:

1. **Finish A1** (Go Live) — this is the blocker
2. **Finish A2** (Media) — this is the blocker
3. Finish A3 (Routes)
4. Finish B1 (Avatar merge)
5. Finish C1 (HQ audit)

Do not start on new features. Finish certification gates.

---

## Success Looks Like

At end of 72 hours:

```
✓ Performer goes live → appears on Home 1 → Fan joins → Tips working
✓ Performer uploads song → appears on profile → Fan plays it
✓ Every button navigates correctly (zero dead links)
✓ AvatarLobbyCanvas consolidated (zero duplicates)
✓ HQ backend data verified (ready for visualization phase)

Platform ready for A4 (Revenue detailed testing) + Track B/C continuation.
```

This is the immediate path to proving the core loop works.
