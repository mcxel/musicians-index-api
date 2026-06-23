# Build Director Runtime Split Directive

Date: 2026-06-20
Status: Locked

The Omni Presence concept is a blueprint only.

Do not implement a single OmniPresenceEngine.tsx system.
Use split runtime contracts:

- Communication Runtime: messaging, voice, video, invites, notifications
- Media Runtime: video/audio/playlists/streams/replays/panels
- Presence Runtime: online/friend/lobby/activity status only
- Avatar Runtime: render/move/clothing/props/expressions/animation
- Memory Runtime: memory wall, capture, gallery, polaroids
- Camera Runtime: getUserMedia + MediaRecorder capture bridge
- Headquarters Runtime: persistent role environment and zones
- Live Runtime: rooms, battles, cyphers, challenges, audience
- Venue Runtime: venue renderer, seating, ticketing, audience routing

Boundary rules:

- Presence is not messaging.
- Presence is not media.
- Camera is not messaging.
- Camera is not presence.
- Omni Presence components are UI surfaces only, not domain owners.

Execution rule:

- New feature work must implement against contracts in apps/web/src/lib/runtime/specification.
- Legacy duplicate Omni components must not diverge.
- Use one canonical Omni UI import surface and wire runtime behavior by domain.
