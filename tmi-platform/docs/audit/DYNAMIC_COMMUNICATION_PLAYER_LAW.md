# DYNAMIC COMMUNICATION PLAYER LAW

**Locked by:** Marcel Dickens  
**Date:** 2026-09-02  

Incoming video call/message never blindly replaces active programming.

## Resolver pipeline

```
INCOMING CALL → NON-DESTRUCTIVE ALERT → ACCEPT | DECLINE
ACCEPT → ONE canonical WebRTC communication session
→ READ ALL PLAYER ASSIGNMENTS
→ PROTECT PINNED / ACTIVE PROGRAMMING
→ EMPTY → IDLE/AMBIENT → SECONDARY AVAILABLE → SAFE SPLIT
→ ASSIGN COMMUNICATION SOURCE
→ COMPOSE PARTICIPANTS
   (1 single → 2 split → 3 three-way → 4 2×2 → 5+ adaptive grid / active speaker)
→ AUDIO DIRECTOR → RENDER
```

Collapse layouts in reverse on leave — no blank panes, stale video, ghost audio, abandoned tracks.

## Privacy (fail-closed)

- Alert may show identity.
- Cam/mic publish **ONLY after ACCEPT**.
- Decline = no media publication.

## Composition laws

- Player numbers never determine purpose — P1/P2 are intelligent defaults only.
- One communication session can expose multiple participant views; distributing across players ≠ multiple independent calls.
- Manual MOVE / SWAP / SPLIT / UNSPLIT / PIN / FULLSCREEN always wins over auto composition.

## Implementation

- Alert / accept / decline / end: `CanonicalUniversalPlayerFabric`
- Placement priority: `PresentationTargetResolver.resolveCommunicationTarget()`
- Cert gates 30–32 in `runAutomatedJumbotronDirectorCertification.test.ts`

## Presence Continuity interaction

When primary programming is protected and call lands on a secondary player:

1. Activate bokeh presentation on room (not a new room system).  
2. Duck PROGRAM audio; promote VOICE on call player.  
3. On `endVideoCall`, clear call assignment, deactivate bokeh, rebalance audio — primary session unchanged.
