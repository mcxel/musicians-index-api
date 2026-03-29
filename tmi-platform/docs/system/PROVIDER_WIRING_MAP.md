# PROVIDER_WIRING_MAP.md
## Which Providers Wrap Which Routes
### BerntoutGlobal XXL / The Musician's Index

This extends the existing provider chain in layout.tsx.
The base chain (established in Slices 13–17) must NOT change:
AudioProvider → HudRuntimeProvider → SharedPreviewProvider → TurnQueueProvider
→ RoomInfrastructureProvider → RoomWatchdogProvider → SessionRecoveryProvider

---

## ROUTE FAMILY → PROVIDER OWNERSHIP

### Search Routes (/search)
No new provider needed. Uses TanStack Query in component.
`GlobalSearchBar` debounces and calls `/api/search` directly.

### Notification Routes (/notifications, bell in header)
No new context provider. Pattern: SWR/React Query for polling.
```typescript
// In nav layout: useUnreadCount() hook polls /api/notifications/count every 60s
// On new notification: WebSocket 'notification:new' invalidates query cache
```

### Feed Routes (/feed)
No new provider. TanStack Query with cursor-based infinite scroll.
```typescript
useInfiniteQuery({ queryKey: ['feed'], queryFn: ({ pageParam }) => fetchFeed(pageParam) })
```

### Economy Routes (/wallet, /credits, /tip/*)
Lightweight context for wallet state that can be shared:
```typescript
// apps/web/src/features/economy/WalletProvider.tsx
// Wraps: /wallet, /credits, /dashboard
// Provides: balance, pendingBalance, fanCredits, refreshWallet()
```

### Fan Club Routes (/fan-club/*)
No provider. Component-level fetching via React Query.

### Beat Marketplace (/beats, /beats/*)
No provider. Server components for listing, client for preview player.

### Competition/Season Routes (/competitions, /seasons)
No provider. Server components with static revalidation.

### Settings Routes (/settings/*)
```typescript
// apps/web/src/features/settings/SettingsProvider.tsx
// Provides: currentSettings, updateSetting(key, value)
// Wraps: all /settings/* routes (via settings layout.tsx)
```

### Family/Kid Routes (/family/*, /kids/*)
```typescript
// apps/web/src/features/family/FamilyProvider.tsx
// Provides: childAccounts, pendingApprovals, requestApproval()
// Wraps: all /family/* routes (via family layout.tsx)
```

### Room Routes (all rooms — inherits existing chain)
Scenes/backgrounds: no new provider. `useRoomScene(roomId)` hook directly in RoomShell.
Scene state is part of room state in RoomInfrastructureProvider.

### Editorial/Article Routes (/editorial/*)
No provider. Server components with ISR (revalidate: 3600).

---

## NEW LAYOUT FILES NEEDED

```
apps/web/src/app/(settings)/layout.tsx     → wraps SettingsProvider
apps/web/src/app/(family)/layout.tsx       → wraps FamilyProvider
apps/web/src/app/(economy)/layout.tsx      → wraps WalletProvider (wallet/credits)
```

---

## AGE SAFETY CHECK (Global Middleware Extension)

The existing middleware.ts must add one check:

```typescript
// In middleware.ts — add to the existing middleware function
// If user is a child account: restrict which routes they can access
const isChildAccount = session?.user?.isChild;
if (isChildAccount) {
  const blockedRoutes = [
    '/wallet', '/credits', '/fan-club', '/beats',
    '/competitions', '/booking', '/sponsor-room',
  ];
  if (blockedRoutes.some(r => pathname.startsWith(r))) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }
}
```
