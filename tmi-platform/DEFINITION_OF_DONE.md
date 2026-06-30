# Definition of Done (LOCKED 2026-06-25)

**Authority**: Build Director (Marcel Dickens)  
**Purpose**: Feature is not "done" until ALL of these are true  
**Standard**: Applied to every feature, system, and module

---

## What "Done" Means

A feature is **DONE** when it meets ALL ten criteria below.

If ANY criterion is not met, the feature is **NOT DONE**, even if it looks perfect visually.

---

## The Ten Criteria

### 1. Functional with Real Data ✅

- [ ] Feature works with real data from canonical systems
- [ ] No hardcoded values
- [ ] No mock data (except in tests)
- [ ] Reads from and writes to authoritative sources (registries, APIs, databases)
- [ ] Handles null/empty data gracefully

**Test**: Turn on a data logging tool. Verify every value came from a real source.

**Not acceptable**:
```jsx
<span>{performer.name || "John Doe"}</span>  // ❌ hardcoded fallback
<RevenueDisplay revenue={6420} />             // ❌ mock number
const FAKE_USERS = [{id: 1, name: "Test"}];  // ❌ seed data shown as real
```

**Acceptable**:
```jsx
<span>{performer?.name}</span>  // ✅ real or empty
<RevenueDisplay revenue={performerData.revenue} />  // ✅ real data
// No seed data in production files
```

---

### 2. Connected to Canonical Runtime ✅

- [ ] Uses the canonical system (from CANONICAL_SYSTEMS.md)
- [ ] Doesn't create a duplicate
- [ ] Integrated with other systems that depend on it
- [ ] Data flows to/from the right place
- [ ] Part of the larger system, not isolated

**Test**: Trace the data backwards. Where does it come from? Is that the canonical source?

**Not acceptable**:
```tsx
// Creating a new "live sessions" system instead of using GlobalLiveSessionRegistry
const [localLiveSessions, setLocalLiveSessions] = useState([]);
```

**Acceptable**:
```tsx
// Using the canonical GlobalLiveSessionRegistry
const liveSessions = useGlobalLiveSessionRegistry();
```

---

### 3. Responsive on Desktop and Mobile ✅

- [ ] Works on 1440px (desktop standard)
- [ ] Works on 834px (tablet)
- [ ] Works on 375px (mobile)
- [ ] No content cut off or hidden
- [ ] Touch targets are ≥48px (mobile)
- [ ] Text is readable at all sizes
- [ ] Layouts adapt, not shrink

**Test**: Test in browser dev tools at 375px, 834px, 1440px.

**Not acceptable**:
```css
/* Text unreadable on mobile */
font-size: 10px;

/* Touch targets too small */
width: 24px; height: 24px;

/* Content cut off */
max-width: 200px; /* on mobile */
```

**Acceptable**:
```css
/* Readable at all sizes */
font-size: clamp(14px, 4vw, 16px);

/* Touch targets mobile-friendly */
min-width: 48px; min-height: 48px;

/* Responsive layout */
@media (max-width: 600px) { width: 100%; }
```

---

### 4. Error Handling Implemented ✅

- [ ] Network failures handled
- [ ] Missing data handled
- [ ] Invalid states handled
- [ ] User sees meaningful error message (not a crash or blank screen)
- [ ] Retry or alternative path available

**Test**: Simulate failures (network down, API returns 404, data malformed).

**Not acceptable**:
```tsx
const data = apiCall();
return <Display data={data} />; // ❌ crashes if apiCall fails
```

**Acceptable**:
```tsx
try {
  const data = await apiCall();
  return <Display data={data} />;
} catch (error) {
  return <ErrorMessage>Unable to load data. <RetryButton /></ErrorMessage>;
}
```

---

### 5. Loading and Empty States Implemented ✅

- [ ] Loading state shown while data fetches
- [ ] Empty state shown when no data exists (honest, not a placeholder)
- [ ] Both are visually polished (not debugging text)
- [ ] User understands what's happening

**Test**: Clear data, watch loading state. Delete all data, see empty state.

**Not acceptable**:
```jsx
{data ? <Display /> : <div>loading...</div>}  // ❌ no empty state
{data ? <Display /> : <img src="placeholder.jpg" />}  // ❌ fake empty
```

**Acceptable**:
```jsx
if (isLoading) return <LoadingSpinner />;
if (!data || data.length === 0) return <EmptyState message="No items yet. Create your first item." />;
return <Display data={data} />;
```

---

### 6. Performance Acceptable ✅

- [ ] Loads in <2 seconds on 4G
- [ ] Renders at 60fps (no jank)
- [ ] No memory leaks (run 50 cycles, memory stable)
- [ ] No N+1 queries (batch load, don't loop)
- [ ] Images optimized (WebP, lazy loaded)

**Test**: Use Lighthouse, React DevTools Profiler, Chrome DevTools Performance.

**Not acceptable**:
```tsx
// N+1 query: loads user, then for each user loads their profile
{users.map(user => <UserCard user={user} key={user.id} />)}
// Inside UserCard:
const profile = await fetch(`/api/user/${user.id}/profile`);
```

**Acceptable**:
```tsx
// Batch load: one query for users, one for all profiles
const users = await fetch(`/api/users`);
const profiles = await fetch(`/api/users/profiles`);
{users.map(user => <UserCard user={user} profile={profiles[user.id]} />)}
```

---

### 7. Accessible ✅

- [ ] Keyboard navigable (tab through all controls)
- [ ] Screen reader friendly (semantic HTML, ARIA labels)
- [ ] Color contrast ≥4.5:1 (WCAG AA)
- [ ] No flashing/seizure triggers
- [ ] Form labels associated with inputs

**Test**: Keyboard only (no mouse). Screen reader (NVDA, JAWS, VoiceOver).

**Not acceptable**:
```jsx
<div onClick={handleClick}>Click me</div>  // ❌ not keyboard accessible
<button style={{ color: '#999', background: '#f0f0f0' }}>Submit</button>  // ❌ low contrast
<input type="text" />  // ❌ no label
```

**Acceptable**:
```jsx
<button onClick={handleClick} onKeyPress={handleKeyPress}>Click me</button>
<button style={{ color: '#000', background: '#fff' }}>Submit</button>  // 21:1 contrast
<label htmlFor="name">Name</label>
<input id="name" type="text" />
```

---

### 8. No Duplicate Implementation ✅

- [ ] Checked CANONICAL_SYSTEMS.md
- [ ] Uses the canonical system, not a parallel one
- [ ] No similar code elsewhere in codebase
- [ ] If found, consolidated, not both maintained

**Test**: Search codebase for similar logic. Should find ONE implementation.

**Not acceptable**:
```tsx
// Two different "followers" systems
followers.ts
followers_service.ts
followersList.ts
```

**Acceptable**:
```tsx
// One canonical system
// lib/engines/social/SocialGraphEngine.ts (followers, following, blocking all here)
```

---

### 9. No Mock Data ✅

- [ ] No seed data that looks like real data
- [ ] No STUB_ constants
- [ ] No fake user IDs scattered in code
- [ ] No placeholder images presented as real
- [ ] No hardcoded test data in production files

**Test**: Search for "SEED_", "STUB_", "FAKE_", "TODO_", "TEST_" in production code.

**Not acceptable**:
```tsx
const SEED_PERFORMERS = [{id: 1, name: "John Doe", verified: true}];
return <PerformerGrid performers={SEED_PERFORMERS} />;
```

**Acceptable**:
```tsx
const performersQuery = useQuery('performers', fetchPerformers);
if (performersQuery.isLoading) return <Loading />;
if (!performersQuery.data?.length) return <EmptyState />;
return <PerformerGrid performers={performersQuery.data} />;
```

---

### 10. Appears in Certification Report ✅

- [ ] Feature is tested in certification
- [ ] Passes Level 1 Runtime Certification (if applicable)
- [ ] Passes Level 2 Integration Certification (if applicable)
- [ ] Documented in completion report
- [ ] No known issues remaining

**Test**: Run relevant certification suites, feature is included and passes.

**Not acceptable**: Feature exists but isn't in certification scope.

**Acceptable**: Feature is part of a certified system or test suite.

---

## The Checklist

Use this checklist for every feature before marking it done:

```markdown
- [ ] Functional with real data
- [ ] Connected to canonical runtime
- [ ] Responsive (desktop, tablet, mobile)
- [ ] Error handling implemented
- [ ] Loading and empty states
- [ ] Performance acceptable
- [ ] Accessible
- [ ] No duplicate implementation
- [ ] No mock data
- [ ] In certification report
```

---

## Example: Feature Not Done

**Feature**: Performer Revenue Dashboard

**Visually looks**: Complete and polished ✓  
**Functionally**:
- [ ] Loads from API ❌ (hardcoded values)
- [ ] Connected to UnifiedRevenueEngine ❌ (reads from old API)
- [ ] Responsive ✓
- [ ] Error handling ❌ (no fallback if data missing)
- [ ] Empty state ❌ (shows placeholder)
- [ ] Performance ✓
- [ ] Accessible ❌ (no screen reader labels)
- [ ] No duplicates ❌ (similar code in 3 places)
- [ ] No mock data ✓
- [ ] In certification ❌ (not tested yet)

**Result**: NOT DONE (7/10 criteria met)

**Fix**: Wire to real API, implement error/empty states, add accessibility, consolidate duplicates, add to tests.

---

## Example: Feature Done

**Feature**: Fan Collections Module

**Visually looks**: Complete ✓  
**Functionally**:
- [x] Loads from canonical SocialGraphEngine
- [x] Connected to User Profile Runtime
- [x] Responsive on all devices
- [x] Shows error if fetch fails
- [x] Shows "No collections yet" if empty
- [x] 60fps animations, <2s load time
- [x] Keyboard accessible, screen reader friendly
- [x] No duplicate code (only implementation in codebase)
- [x] All data from real source
- [x] Passes Level 2 certification

**Result**: DONE (10/10 criteria met)

**Ship it.**

---

## Who Enforces This

- **Claude**: Ensures code meets 1-2, 8-9 (runtime, duplicates)
- **Copilot**: Ensures code meets 3, 7 (responsive, accessible)
- **Blackbox**: Ensures code meets 4-6, 8-10 (errors, performance, testing)
- **Build Director**: Accepts or rejects based on all criteria

---

## Locked & Immutable

This standard applies to EVERY feature until soft launch.

A feature is not done until all ten criteria are met.

No exceptions.

Visually beautiful is not enough.

Functionally complete is the standard.
