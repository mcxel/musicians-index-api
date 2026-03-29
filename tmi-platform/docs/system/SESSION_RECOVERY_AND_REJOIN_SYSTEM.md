# SESSION RECOVERY AND REJOIN SYSTEM
## BerntoutGlobal XXL — TMI Platform
## Effective: 2026-03-23 | Status: LOCKED RESILIENCY AUTHORITY

---

## PURPOSE

Guarantee user continuity during disconnects and transient failures across rooms, battles, and live sessions.

---

## RECOVERY PRINCIPLES

1. Preserve session intent
2. Restore user to correct room state
3. Avoid duplicate actions on rejoin
4. Keep queue/turn integrity
5. Restore scene and mixer safely

---

## REJOIN FLOWS

### Host Rejoin
- restore host role if valid
- transfer to backup host only after timeout
- reconcile pending control actions

### Artist/Performer Rejoin
- restore queue slot if still active
- restore turn ownership if lock not expired
- restore local mixer settings

### Audience Rejoin
- restore room, chat context, and reaction eligibility
- restore selected audio preferences

---

## STATE SNAPSHOTS

Required lightweight snapshot per active session:
- roomId
- role
- queuePosition
- currentTurnOwner
- previewState
- mixerState
- lastAckedEventId
- reconnectTokenExpiry

---

## FAILURE HANDLING

If reconnect fails:
- show degraded room card
- provide one-click rejoin retry
- surface fallback event summary
- emit recovery incident telemetry

---

## INTEGRITY CHECKS

On rejoin, validate:
- session token freshness
- role permission validity
- queue lock consistency
- preview ownership consistency
- timer phase consistency

If validation fails, move user to safe observer mode and notify operator.

---

## API CONTRACTS (MINIMUM)

- POST /api/rooms/:id/rejoin
- GET /api/rooms/:id/session-snapshot
- POST /api/rooms/:id/recovery/ack
- POST /api/rooms/:id/recovery/fallback

---

## PROOF PLAN

Minimum recovery proof scenarios:
1. host disconnect + rejoin under timeout
2. performer disconnect during active turn
3. audience reconnect during active preview
4. queue state remains consistent after multiple reconnects
