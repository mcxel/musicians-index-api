# USER_BLOCK_AND_MUTE_SYSTEM.md
## How Blocking and Muting Work Across the Platform
### BerntoutGlobal XXL / The Musician's Index

---

## BLOCK

When User A blocks User B:
- B cannot message A
- B cannot follow A
- B cannot see A's profile content (sees "User not found" or "Profile unavailable")
- B cannot join a room if A is the host (gets error on join attempt)
- A's content does not appear in B's discovery feeds
- B's content does not appear in A's discovery feeds
- Existing messages are hidden from both

Implementation: `UserBlock` table. Every API that returns user content must check block relationship.

```typescript
// Helper: isBlocked(viewerId, targetId) → boolean
// Used in: profile API, room join API, messaging API, feed generation
```

---

## MUTE

When User A mutes User B:
- B can still see A's content
- A cannot see B's content in feeds or discovery
- B's chat messages are hidden from A in rooms
- B does not know they are muted

Mute is lighter-weight than block. Useful for preventing noise without confrontation.

---

## ROOM KICK (HOST ACTION)

When host kicks User B from a room:
- B is immediately removed from the room
- B cannot rejoin that specific room for 1 hour
- B is notified: "You were removed from this room"
- Kick is logged to moderation audit trail

---

## ROOM MUTE (HOST/MODERATOR ACTION)

When host mutes User B in a room:
- B's mic is disabled for the remainder of the room session
- B can still see chat and react
- B can still send chat messages (unless also chat-muted)
- B is notified: "Your microphone has been muted in this room"
