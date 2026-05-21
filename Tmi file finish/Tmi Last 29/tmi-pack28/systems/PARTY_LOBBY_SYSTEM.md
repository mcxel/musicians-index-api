# PARTY_LOBBY_SYSTEM.md
## Persistent Social Party Space — Architecture and Rules
### BerntoutGlobal XXL / The Musician's Index

---

## CORE RULE

A party lobby is NOT a room. It is a persistent social space.
- Users can be in a party without being in a room
- Party survives when members enter/exit destinations
- Party supports text, voice, and video tiles
- Members can jump to rooms/shows/games together or individually
- Party continues after everyone leaves a destination

---

## PARTY LOBBY UI DESIGN

```
Layout: Full screen with collapsible mini-mode when entering destinations
Background: --tmi-bg-deep with subtle animated particle grid

Left panel (1/3 width):
  - Party name header
  - Member rail: avatar + name + status badge
    Status options: "In Lobby", "In Room", "In Game", "In Show", "Away"
  - Chat panel: text messages + reactions

Center panel (1/2 width):
  - When just lobby: VIDEO TILES (2x2 or 3x3 grid, WebRTC face cam)
  - Shared Preview Panel: what the group is browsing/previewing
  - Party Activity Feed: real-time "Marcel is viewing Cypher Arena"

Right panel (1/6 width):
  - Destination Picker (rooms, shows, games, contests)
  - JOIN TOGETHER button (all ready members)
  - READY status for each member
  - Party Invite link

Bottom bar:
  - Microphone toggle
  - Camera toggle
  - Screen share (preview mode only)
  - Settings
```

---

## PARTY STATE MODEL

```prisma
model Party {
  id          String      @id @default(cuid())
  name        String?
  hostId      String
  isPublic    Boolean     @default(false)
  inviteCode  String      @unique @default(cuid())
  status      String      @default("active") // 'active' | 'disbanded'
  members     PartyMember[]
  messages    PartyMessage[]
  createdAt   DateTime    @default(now())
  expiresAt   DateTime?   // auto-disband if empty > 1 hour
}

model PartyMember {
  id              String  @id @default(cuid())
  partyId         String
  party           Party   @relation(fields: [partyId], references: [id])
  userId          String
  role            String  @default("member")  // 'host' | 'co-host' | 'member'
  presenceStatus  String  @default("in_lobby")  // 'in_lobby' | 'in_room' | 'in_game' | 'in_show' | 'away'
  destinationId   String? // current room/game/show id
  destinationType String? // 'room' | 'game' | 'show' | 'contest'
  isReady         Boolean @default(false)
  videoEnabled    Boolean @default(false)
  micEnabled      Boolean @default(false)
  joinedAt        DateTime @default(now())
  lastSeenAt      DateTime @default(now())
  
  @@unique([partyId, userId])
}

model PartyMessage {
  id        String   @id @default(cuid())
  partyId   String
  party     Party    @relation(fields: [partyId], references: [id])
  userId    String
  content   String
  type      String   @default("text")  // 'text' | 'reaction' | 'system'
  createdAt DateTime @default(now())
}
```

---

## PARTY WEBSOCKET EVENTS

```typescript
// Party namespace: /ws/party/{partyId}

// Client → Server
'party:join'           { partyId; userId }
'party:leave'          { partyId; userId }
'party:message'        { content; type }
'party:ready-toggle'   { isReady: boolean }
'party:video-toggle'   { enabled: boolean }
'party:mic-toggle'     { enabled: boolean }
'party:destination-pick' { destinationId; destinationType }
'party:join-together'  {}  // initiates group transport

// Server → Client
'party:state'          { members; messages; readyCount; host }
'party:member-update'  { memberId; status; destinationType; destinationId }
'party:message-new'    { message: PartyMessage }
'party:ready-count'    { count; total }
'party:destination-pinned' { destinationId; pinnedBy }
'party:transport'      { destinationId; destinationType; joinUrl }  // group move
'party:disbanded'      { reason }
```

---

## TRANSITION: PARTY → ROOM

When the party joins a destination:
1. `party:join-together` fires from host
2. Server sends `party:transport` to all ready members
3. Each client receives joinUrl for the destination
4. Members navigate to destination (room/game/show)
5. Their `presenceStatus` updates to `in_room` (or equivalent)
6. Party lobby enters "background" mode — audio continues, video pauses
7. Mini party bar appears at top of destination screen
8. On destination exit: party lobby returns to full mode

```
In destination: shows compact "Party Bar" at screen top
  [Party icon] [3 members] [Back to Lobby] [Chat bubble]
Clicking "Back to Lobby" → returns to party without leaving destination session
```

---

## AVATAR TRANSITION

```
In party lobby:   real profile photo + name + video tile (face cam)
In destination:   avatar representation (from avatar system)

Transition animation:
  - profile photo fades to avatar (300ms crossfade)
  - avatar scales in from portrait position to room position

Why: lobby = personal/social mode. Room = immersive/platform mode.
```

---

## PARTY SYSTEM ROUTES

```
/party                  → Party browser (discover public parties)
/party/create           → Create new party
/party/[partyId]        → Party lobby screen
/party/[partyId]/invite → Invite page with link/QR
/party/[partyId]/settings → Party settings (host only)
```

---

## PARTY BOTS

```
party-match-bot:       suggests best destination for current party mood/time
party-queue-bot:       manages join-together flow, handles failed joins
party-presence-bot:    tracks member status changes
party-recovery-bot:    reconnects dropped members, restores state
party-safety-bot:      flags any communication rule violations
party-recommendation-bot: "Based on what you like, try Cypher Arena #3"
```
