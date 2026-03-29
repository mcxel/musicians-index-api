# WEBSOCKET_EVENT_MAP.md
## Every Real-Time Event — Name, Owner, Payload
### BerntoutGlobal XXL / The Musician's Index

All events flow through: API → Redis Pub/Sub → WebSocket Gateway → connected clients.
Namespace: `/ws`. Authentication: JWT in first message.

---

## ROOM EVENTS (room:{roomId} channel)

```typescript
// Client → Server
'room:join'         { roomId: string; token: string }
'room:leave'        { roomId: string }
'room:chat'         { roomId: string; message: string }  // rate limited: 30/min
'room:reaction'     { roomId: string; type: 'hype'|'clap'|'fire'|'100' }
'room:tip'          { roomId: string; tipId: string }    // after Stripe confirms

// Server → Client
'room:state'        { state: RoomState }                 // on join
'room:viewer_count' { count: number; sort_position: number }  // viewers_asc position
'room:chat_message' { id; userId; displayName; message; timestamp }
'room:reaction'     { type: string; count: number; burst: boolean }
'room:tip_received' { fromName: string; amount: number; artistId: string }
'room:scene_change' { sceneId: string; sceneLabel: string }
'room:queue_update' { queue: QueueEntry[]; currentTurn: QueueEntry | null }
'room:turn_advance' { newCurrent: QueueEntry; upNext: QueueEntry | null }
'room:turn_warning' { turnsUntilYours: number }  // fired 2 turns before artist's turn
'room:ended'        { reason: 'host_closed'|'empty'|'emergency' }
```

## AUDIENCE CONTROL EVENTS (room:{roomId} channel)

```typescript
// Server → Client (operator/host actions)
'room:mute_all'      { except: string[] }  // mute all except listed userIds
'room:unmute_user'   { userId: string }
'room:kick_user'     { userId: string; reason: string }
'room:host_change'   { newHostId: string; newHostName: string }
```

## BATTLE EVENTS (battle:{battleId} channel)

```typescript
// Server → Client
'battle:round_start' { roundNumber: number; artist1: ArtistInfo; artist2: ArtistInfo }
'battle:vote_update' { votes1: number; votes2: number; totalVotes: number }
'battle:result'      { winnerId: string; winnerName: string; votes1: number; votes2: number }
'battle:rematch_request' { requestedBy: string }
```

## NOTIFICATION EVENTS (user:{userId} channel)

```typescript
// Server → Client
'notification:new'  { notification: Notification }
'notification:badge' { unreadCount: number }
```

## SEASON/COMPETITION EVENTS (global channel)

```typescript
// Server → Client (broadcast)
'season:update'          { seasonId: string; event: 'opened'|'finals_week'|'closed' }
'leaderboard:update'     { seasonId: string; topEntries: RankEntry[] }
'competition:bracket_update' { competitionId: string; bracket: BracketState }
'crown:transfer'         { newOwnerId: string; newOwnerName: string; timestamp: string }
```

## PLATFORM EVENTS (global channel)

```typescript
// Server → Client (Big Ace broadcasts)
'platform:broadcast'     { message: string; severity: 'info'|'warning'|'emergency' }
'platform:feature_flag'  { flag: string; value: boolean }  // 60s propagation
'platform:maintenance'   { startsAt: string; endsAt: string; message: string }
```

## TICKET QUEUE EVENTS (event:{eventId} channel)

```typescript
// Server → Client
'ticket:queue_position'  { position: number; estimatedWait: number }  // high-demand queue
'ticket:your_turn'       { reservationToken: string; expiresAt: string }
'ticket:queue_cleared'   {}  // all tickets available
```
