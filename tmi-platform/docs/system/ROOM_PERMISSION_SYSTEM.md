# ROOM_PERMISSION_SYSTEM.md
## Room Roles and What Each Can Do
### BerntoutGlobal XXL / The Musician's Index

---

## ROOM ROLES

| Role | Description | Who Gets It |
|---|---|---|
| HOST | Room creator, full control | Artist who creates room |
| CO_HOST | Shared control, assigned by host | Invited by host |
| PERFORMER | Can speak/perform, in queue | Artists in cypher/battle |
| PRODUCER | Can cast beats | Producer-type accounts |
| MODERATOR | Can kick/mute, can't change room | Assigned by host |
| AUDIENCE | Can watch/react/tip, mic muted | Everyone else |
| OPERATOR | Emergency override | Big Ace / admin accounts |

---

## PERMISSION MATRIX

| Action | HOST | CO_HOST | PERFORMER | PRODUCER | MODERATOR | AUDIENCE | OPERATOR |
|---|---|---|---|---|---|---|---|
| Start room | ✅ | — | — | — | — | — | ✅ |
| Close room | ✅ | — | — | — | — | — | ✅ |
| Change scene | ✅ | ✅ | — | — | — | — | ✅ |
| Invite to queue | ✅ | ✅ | — | — | — | — | ✅ |
| Reorder queue | ✅ | ✅ | — | — | — | — | ✅ |
| Cast beat | — | — | — | ✅ | — | — | — |
| Share preview | ✅ | ✅ | ✅ (own turn) | ✅ | — | — | ✅ |
| Mic (own turn) | ✅ | ✅ | ✅ (own turn) | ✅ | — | — | — |
| Mute/kick user | ✅ | ✅ | — | — | ✅ | — | ✅ |
| React/tip | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| Chat | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Emergency stop | — | — | — | — | — | — | ✅ |

---

## TURN-BASED AUDIO RULE (ENFORCED EVERYWHERE)

In Cypher and Battle rooms:
- Only the PERFORMER whose turn it is has mic active
- All other PERFORMERs are auto-muted (server-enforced, not just UI)
- AUDIENCE is always muted (unless HOST grants AUDIENCE member speaker role)
- This rule CANNOT be overridden by host during active turns
- Operator CAN override for emergencies

---

## KID ROOM PERMISSIONS

Kid accounts in kid-safe rooms:
- Same role structure but content-moderation-bot runs at highest sensitivity
- AUDIENCE age group check: only kid accounts can be AUDIENCE in kid rooms
- PERFORMER age group check: only kid accounts + parent-approved kid performers
- No adult AUDIENCE allowed unless room is marked "family" AND parent-linked
