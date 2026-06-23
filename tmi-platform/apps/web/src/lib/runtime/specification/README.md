# Runtime Specification Library

This folder is the runtime boundary contract for TMI.

Do not build a single Omni Presence component from this spec.
Keep runtime responsibilities split:

- Communication Runtime: messaging, voice, video, invites, notifications
- Media Runtime: playlists, media routing, media panels, replay
- Presence Runtime: online/friend/lobby/activity status only
- Avatar Runtime: render, animate, clothing, expression, inventory
- Memory Runtime: wall, capture, gallery, polaroid
- Camera Runtime: getUserMedia + MediaRecorder capture contracts
- Headquarters Runtime: persistent role-based zone requirements
- Live Runtime: rooms, battles, cyphers, challenges, audience
- Venue Runtime: venue rendering, seat assignment, ticketing, audience routing

Rule:
- Presence is not messaging.
- Presence is not media.
- Camera is not messaging.
- Camera is not presence.
