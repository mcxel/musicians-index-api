# WEBSOCKET_AND_LIVE_TRANSPORT_SPEC.md
## How Live Rooms, Room Presence, and Real-Time Sync Work
### BerntoutGlobal XXL / The Musician's Index

---

## TRANSPORT ARCHITECTURE

```
Browser WebSocket Client
       ↓ wss://api.themusiciansindex.com/ws
Cloudflare (proxied — WebSocket pass-through)
       ↓
Render API — NestJS WebSocket Gateway
       ↓
Redis Pub/Sub (room channels)
       ↓
Other connected clients in same room
```

---

## WEBSOCKET GATEWAY (NestJS)

```typescript
// apps/api/src/gateways/room.gateway.ts
@WebSocketGateway({
  cors: { origin: process.env.ALLOWED_ORIGINS?.split(',') },
  namespace: '/ws',
  transports: ['websocket', 'polling'], // polling as fallback
})
export class RoomGateway { ... }
```

---

## ROOM CHANNELS (Redis Pub/Sub)

Each room gets a Redis channel: `room:{roomId}`

Events published to channel:
- `room.viewer.joined` — viewer count update
- `room.viewer.left` — viewer count update
- `queue.turn.advanced` — queue position update
- `preview.state.changed` — open/close/update
- `reaction.added` — audience reaction
- `chat.message` — chat message
- `room.state.changed` — room status update

---

## FALLBACK: SERVER-SENT EVENTS (SSE)

If WebSocket connection fails (corporate firewalls, etc.):
```
GET /api/rooms/{roomId}/sse
Accept: text/event-stream
```

SSE provides one-way updates (server → client).
Client can still send actions via regular HTTP POST.

---

## CLOUDFLARE WEBSOCKET RULES

Cloudflare supports WebSocket in Free plan since 2021.
Required configuration:
- SSL Mode: Full (Strict) — NOT flexible
- Do NOT enable Rocket Loader for WebSocket-heavy pages
- Add Page Rule: `api.*/ws/*` → Cache Level: Bypass

---

## CONNECTION LIFECYCLE

```
1. Client connects: wss://api.themusiciansindex.com/ws
2. Authenticate: send JWT in first message { type:'auth', token }
3. Join room: send { type:'room.join', roomId }
4. Server: joins Redis channel, sends room state
5. Client receives real-time updates
6. Disconnect: server removes from channel, updates viewer count
7. Reconnect: SessionRecoveryProvider handles rejoin automatically
```
