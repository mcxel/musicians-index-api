# MESSAGE SYSTEM CERTIFICATION
**TMI Platform — Messaging Routes, Features & Integration Audit**  
**Date:** 2026-06-15 | **Priority:** P0

---

## Architecture

Messaging = `MessagingCanister` (Rule 15) — embeddable in ALL profiles, lobbies, and rooms.  
Not a standalone page only. A canister that follows the user everywhere.

---

## ROUTE INVENTORY

| Route | File | Status |
|---|---|---|
| `/messages` | `app/messages/page.tsx` | ✅ EXISTS |
| `/messages/[threadId]` | `app/messages/[threadId]/page.tsx` | ✅ EXISTS |
| `/messages/new` | Inline or modal | 🔲 Verify |
| `/messages/new?to=[slug]` | Pre-filled DM | 🔲 Verify |

---

## MESSAGING FEATURE AUDIT

### Core Features
| Feature | Component / API | Status |
|---|---|---|
| Thread list view | `/messages/page.tsx` | ✅ |
| Open thread | `/messages/[threadId]` | ✅ |
| New Message compose | `?to=[slug]` query param or modal | 🔲 |
| Reply in thread | Message input in thread view | 🔲 Verify |
| Send button | Submits to API | 🔲 Verify |
| Read receipt | Thread marks read on open | 🔲 |
| Unread count | Notification badge | 🔲 |
| Real-time push | Socket or polling | 🔲 |

### Message Delivery Chain
```
User types message
  → POST /api/messages/send
  → DB: Message record created
  → Recipient's unread count increments
  → Notification badge updates
  → Thread view shows new message
```
All steps: 🔲 Code-level audit required.

---

## MESSAGING SURFACES (Canister Integration)

| Surface | Messaging Entry Point | Expected Behavior | Status |
|---|---|---|---|
| Performer profile | "Message" button | Opens `MessagingCanister` in-profile or navigates to `/messages/new?to=[slug]` | 🔲 |
| Fan profile | "Message" button | Same flow | 🔲 |
| Live room chat | `LobbyChatRail.tsx` | In-room group chat | ✅ |
| Live room DM | Private message from audience | 🔲 |
| Billboard tile | Quick "Message" action | 🔲 |
| Magazine article | Contact writer | 🔲 |
| Booking confirmation | Auto-message to performer | 🔲 |
| Admin broadcast | Message all users of a tier | 🔲 |

---

## CHAT TYPES

| Type | Component | Route | Status |
|---|---|---|---|
| Direct Message (1:1) | MessagingCanister | `/messages/[threadId]` | ✅ route exists |
| Group Thread | MessagingCanister | `/messages/group/[id]` | 🔲 |
| In-Room Chat | `LobbyChatRail.tsx` | Embedded in live room | ✅ |
| Fan Club Chat | Fan Club channel | `/fan-club/[slug]/chat` | 🔲 |
| Battle/Cypher Chat | Arena chat | `/games/battle-stage` chat | 🔲 |
| Admin Broadcast | Admin → all users | Admin panel | 🔲 |

---

## REAL-TIME SYSTEM

| Method | Status | Notes |
|---|---|---|
| WebSocket / Socket.io | 🔲 Not confirmed | Check `lib/socket` or similar |
| Server-Sent Events | 🔲 | Alternative to WebSocket |
| Polling fallback | 🔲 | Least preferred |
| `LobbyChatRail` real-time | 🔲 | Component exists but socket unknown |

---

## NOTIFICATION INTEGRATION

| Notification Type | Trigger | Destination | Status |
|---|---|---|---|
| New DM | Message sent to user | Notification bell + badge | 🔲 |
| Reply in thread | Reply posted | Thread badge | 🔲 |
| Room chat mention | @mention in room chat | Toast notification | 🔲 |
| Booking message | Auto after booking request | Thread created | 🔲 |
| Fan club message | New post in fan club | Fan notification | 🔲 |

---

## MESSAGING CANISTER SPEC (Rule 15)

```typescript
// components/canisters/MessagingCanister.tsx
// Props:
interface MessagingCaniosterProps {
  userId: string;
  recipientSlug?: string;     // pre-populate a DM
  mode: 'dm' | 'group' | 'fanclub' | 'broadcast';
  compact?: boolean;          // embed in sidebar vs full panel
  onClose?: () => void;
}
// Source: apps/web/src/app/messages/ pages — wrap as canister
// Embedding: any profile, room, magazine, admin panel
```

---

## P0 ACTIONS

1. **Verify `/messages` page renders thread list** — runtime test
2. **Verify `/messages/[threadId]` renders and allows replies** — runtime test
3. **Verify "Message" button on performer profiles** — routes to correct DM thread
4. **Wire read receipts** — thread view marks messages as read on open
5. **Wire unread count badge** — appears in nav/header
6. **Build `MessagingCanister.tsx`** — wrap existing messages pages into embeddable canister
7. **Confirm real-time delivery mechanism** — socket or polling present

---

## CERTIFICATION CHECKLIST

| Test | Expected | Status |
|---|---|---|
| `/messages` loads without error | Thread list visible | 🔲 |
| `/messages/[threadId]` loads | Messages visible | 🔲 |
| New message compose | Opens correctly | 🔲 |
| Reply sends | Message appears | 🔲 |
| Unread badge updates | Count correct | 🔲 |
| Read receipt marks on open | Thread clears badge | 🔲 |
| In-room `LobbyChatRail` sends | Message in chat | 🔲 |
| Message from profile button | Opens DM thread | 🔲 |
| Real-time delivery | Under 2 seconds | 🔲 |

**Overall: Routes exist. Real-time mechanism and canister embedding are the main gaps.**
