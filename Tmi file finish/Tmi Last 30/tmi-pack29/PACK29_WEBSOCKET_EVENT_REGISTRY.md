# PACK29_WEBSOCKET_EVENT_REGISTRY.md
## Complete WebSocket Event Registry — Every Event Across All Namespaces
### BerntoutGlobal XXL / The Musician's Index

---

## NAMESPACES

| Namespace | Purpose | Gateway File |
|---|---|---|
| /ws/room/:roomId | Room session events | room.gateway.ts |
| /ws/battle/:battleId | Battle events | battle.gateway.ts |
| /ws/game/:sessionId | Game session events | games.gateway.ts |
| /ws/party/:partyId | Party lobby events | party-lobby.gateway.ts |
| /ws/notification/:userId | Personal push events | notification.gateway.ts |
| /ws/season | Season/leaderboard events | season.gateway.ts |
| /ws/platform | Platform-wide broadcasts | platform.gateway.ts |

---

## /ws/room/:roomId — FULL EVENT LIST

```
Client → Server:
  room:join               room:leave              room:chat
  room:reaction           room:tip                room:scene-change (host)
  room:queue-join         room:queue-leave        room:advance-turn (host)

Server → Client:
  room:state              room:viewer_count        room:chat_message
  room:reaction           room:tip_received        room:scene_change
  room:queue_update       room:turn_advance        room:turn_warning
  room:mute_all           room:unmute_user         room:kick_user
  room:host_change        room:ended
```

---

## /ws/game/:sessionId — FULL EVENT LIST

```
Client → Server:
  game:join               game:ready              game:answer
  game:buzz               game:leave

Server → Client:
  game:state              game:countdown           game:round-start
  game:buzz-winner        game:answer-result       game:round-end
  game:intermission       game:ended
```

---

## /ws/party/:partyId — FULL EVENT LIST

```
Client → Server:
  party:join              party:leave             party:message
  party:ready-toggle      party:video-toggle       party:mic-toggle
  party:destination-pick  party:pin-destination    party:join-together

Server → Client:
  party:state             party:member-join        party:member-leave
  party:member-update     party:message-new        party:ready-count
  party:destination-pinned party:transport         party:disbanded
```

---

## /ws/battle/:battleId

```
Server → Client:
  battle:round_start      battle:vote_update       battle:result
  battle:rematch_request
```

---

## /ws/notification/:userId

```
Server → Client:
  notification:new        notification:badge
```

---

## /ws/season (global)

```
Server → Client:
  season:update           leaderboard:update       crown:transfer
  competition:bracket_update
```

---

## /ws/platform (global broadcast)

```
Server → Client:
  platform:broadcast      platform:feature_flag    platform:maintenance
  platform:emergency
```
