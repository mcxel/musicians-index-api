# EMPTY_STATE_LIBRARY.md
# Empty State Library — All Module Empty States
# Every platform surface must have an approved empty state message.
# No blank screens, no generic spinners, no lorem text.

## Rules

1. Empty states must match TMI visual language (never generic)
2. Empty state must explain what the section is for (one sentence max)
3. Where appropriate, empty state includes a CTA (e.g., "Start one" / "Explore more")
4. Empty states must be tested with `role=USER` and `role=ARTIST` and guest
5. Empty state component is shared: `apps/web/src/components/ui/EmptyState.tsx`

---

## Empty State Reference

### Homepage

| Belt | Empty State Message | CTA |
|------|---------------------|-----|
| Promotional Hub | "No featured content right now — check back soon" | None |
| Live Now | "No live rooms right now — come back soon" | "Browse rooms" |
| Charts | "Charts are loading — check back on Monday" | None |
| Magazine | "The next issue is coming soon" | None |
| Games | "No game sessions scheduled — check the calendar" | "View calendar" |
| Sponsor Rail | *(render nothing — no placeholder)* | — |

### Magazine / Articles

| Surface | Empty State | CTA |
|---------|-------------|-----|
| Article list | "No articles yet — the first issue is on its way" | None |
| Archive | "No past issues yet — this is just the beginning" | None |
| Issue reader (no articles) | "No articles in this issue yet" | None |

### Stream & Win

| Surface | Empty State | CTA |
|---------|-------------|-----|
| Queue empty | "Add a track to start streaming" | "Explore charts" |
| No saved tracks | "Tracks you save will appear here" | None |
| Points history empty | "Stream a track to earn your first points" | "Start streaming" |
| Leaderboard empty | "The leaderboard resets every Monday — be the first" | None |
| Prizes empty | "No active prizes right now — check back soon" | None |

### Artist Profiles

| Surface | Empty State | CTA |
|---------|-------------|-----|
| Artist list | "No artists yet — they're on the way" | None |
| Artist music links | "No music links added yet" | (Artist only) "Add a link" |
| Artist articles | "No articles for this artist yet" | None |

### Live Rooms

| Surface | Empty State | CTA |
|---------|-------------|-----|
| Room list | "No live rooms right now — start one or check back" | (Artist) "Start a room" |
| Room (no audience) | "You're the first one here — invite someone" | "Share this room" |

### Cypher

| Surface | Empty State | CTA |
|---------|-------------|-----|
| Session lobby | "No cypher sessions right now — start one" | (Artist) "Start a cypher" |
| Performer queue | "No performers yet — be first" | "Join queue" |
| Leaderboard | "No sessions completed yet this week" | None |

### Games

| Surface | Empty State | CTA |
|---------|-------------|-----|
| Game lobby | "No game sessions scheduled — check the calendar" | "View calendar" |
| Leaderboard | "Play a game to get on the leaderboard" | "View sessions" |

### Booking

| Surface | Empty State | CTA |
|---------|-------------|-----|
| Artist booking requests | "You haven't submitted a booking request yet" | "Submit a request" |
| Admin booking queue | "No pending booking requests" | None |
| Venue map | "No venues pinned yet" | None |

### Billboard / Leaderboards

| Surface | Empty State | CTA |
|---------|-------------|-----|
| Weekly leaderboard | "The leaderboard resets on Monday — earn points to lead" | "Start streaming" |
| All-time leaderboard | "No ranking data yet" | None |

### Admin Command Center

| Surface | Empty State | CTA |
|---------|-------------|-----|
| Bot run log | "No bot runs yet" | None |
| Issue list | "No issues created yet" | "Create first issue" |
| User list | "No users yet" | None |
| Sponsor list | "No sponsors yet" | "Add a sponsor" |

### Notifications

| Surface | Empty State | CTA |
|---------|-------------|-----|
| Notification drawer | "You're all caught up" | None |

### Store / Merch

| Surface | Empty State | CTA |
|---------|-------------|-----|
| Merch listing | "No merch available yet — check back soon" | None |

### Rewards Catalog

| Surface | Empty State | CTA |
|---------|-------------|-----|
| Rewards list | "No rewards available right now" | None |
| Redemption history | "You haven't redeemed anything yet" | "View rewards" |

---

## EmptyState Component API

```tsx
// apps/web/src/components/ui/EmptyState.tsx
interface EmptyStateProps {
  message: string;
  cta?: { label: string; href: string };
  icon?: React.ReactNode; // TMI-styled icon, not generic emoji
}

export function EmptyState({ message, cta, icon }: EmptyStateProps) { ... }
```

---

## Anti-Patterns (Never Do)

- Do not show lorem ipsum
- Do not show generic "No results found"
- Do not show broken layout (empty columns, orphaned headers)
- Do not show loading spinner indefinitely (3s max → switch to empty state)
- Do not render the section title without content below it
