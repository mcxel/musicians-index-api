# LIVE ROOM CORE SPEC
# TMI Platform — BerntoutGlobal XXL
# Shared foundation for ALL live event types:
# Contest, Interview, Podcast, Watch Party, Livestream, Premiere

---

## WHAT THIS IS

Every live event on TMI runs on the same Live Room Core.
The room type determines what features are active.
This prevents rebuilding the same infrastructure for each event type.

---

## ROOM TYPES

| Type ID | Label | Used By |
|---|---|---|
| `contest_grand_finals` | Grand Finals | Contest engine |
| `contest_round` | Contest Round | Contest engine |
| `interview` | Interview Stage | Interview module |
| `podcast_recording` | Podcast Room | Podcast module |
| `watch_party` | Watch Party | Watch Party module |
| `livestream` | Livestream | Creator tools |
| `premiere` | Premiere Room | Creator tools |
| `listening_session` | Listening Session | Music module |
| `talk_show` | Talk Show | Interview module |
| `replay` | Replay Room | Archive module |

---

## ROOM ROLES

| Role | Description | Permissions |
|---|---|---|
| `host` | Primary room controller | all controls, invite guest, remove, record, end |
| `co_host` | Secondary host | most host controls, no room end |
| `guest` | Called up / invited | mic + cam, visible stage presence |
| `contestant` | Contest participant | contest-specific stage, limited controls |
| `moderator` | Chat + audio moderation | mute/remove audience, flag clips |
| `audience` | Watch only (default) | react, vote, request call-up, submit question |
| `sponsor` | Sponsor representative | sponsor overlay trigger, no other controls |
| `admin` | Platform admin | all controls + override |
| `bot` | Automated participant | event-driven, logged |

---

## AUDIENCE INTERACTION MODES

| Mode | What Audience Can Do |
|---|---|
| `watch_only` | View only, no interaction |
| `react_only` | Emoji reactions only |
| `vote_active` | Can cast votes during voting window |
| `question_submit` | Can submit text questions to host |
| `hand_raise` | Can request to speak/call-up |
| `full_interactive` | All modes enabled |
| `replay` | View replay, post-event comments only |

---

## STATE MACHINE

```
DRAFT
  → SCHEDULED       (host publishes date/time)
    → PRE_LIVE       (waiting room opens, guests join)
      → LIVE         (room goes live, audience enters)
        → COOLDOWN   (stream ends, processing)
          → REPLAY_READY  (replay available)
            → ARCHIVED    (permanent archive)
              → PUBLISHED_HIGHLIGHT  (featured on discovery)

Side transitions:
LIVE → PAUSED        (host pauses stream)
PAUSED → LIVE        (host resumes)
LIVE → CANCELLED     (emergency shutdown)
ANY → DISABLED       (admin disable)
```

---

## SHARED API ROUTES (live room module)

```
POST   /api/liveroom                    Create room
GET    /api/liveroom/:id                Get room info
PATCH  /api/liveroom/:id/state          Update room state
POST   /api/liveroom/:id/join           Join room
POST   /api/liveroom/:id/leave          Leave room
GET    /api/liveroom/:id/participants   List participants
POST   /api/liveroom/:id/invite-guest   Invite guest to stage
POST   /api/liveroom/:id/remove         Remove participant
POST   /api/liveroom/:id/mute           Mute participant
POST   /api/liveroom/:id/end            End room (host/admin)
GET    /api/liveroom/:id/replay         Get replay info
POST   /api/liveroom/:id/clip           Request clip export
POST   /api/liveroom/:id/publish        Publish to archive
```

---

## SHARED PRISMA MODELS (append to schema.prisma in Wave 10)

```prisma
model LiveRoom {
  id          String   @id @default(cuid())
  roomType    String   // contest_grand_finals | interview | podcast_recording | etc
  title       String
  status      String   @default("draft")
  hostId      String
  scheduledAt DateTime?
  startedAt   DateTime?
  endedAt     DateTime?

  maxAudience         Int     @default(500)
  interactionMode     String  @default("react_only")
  allowVoiceChatter   Boolean @default(false)
  recordingEnabled    Boolean @default(false)
  sponsorOverlayEnabled Boolean @default(true)

  participants  LiveRoomParticipant[]
  guestRequests GuestRequest[]
  clips         LiveClip[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("live_rooms")
}

model LiveRoomParticipant {
  id       String @id @default(cuid())
  roomId   String
  room     LiveRoom @relation(fields: [roomId], references: [id])
  userId   String
  role     String   // host | co_host | guest | contestant | moderator | audience | sponsor | bot
  joinedAt DateTime @default(now())
  leftAt   DateTime?
  micActive    Boolean @default(false)
  camActive    Boolean @default(false)
  recordingConsent Boolean @default(false)

  @@map("live_room_participants")
}

model GuestRequest {
  id       String @id @default(cuid())
  roomId   String
  room     LiveRoom @relation(fields: [roomId], references: [id])
  userId   String
  requestType String // call_up | question | clip_request
  message  String?
  status   String  @default("pending") // pending | approved | declined | expired
  createdAt DateTime @default(now())

  @@map("guest_requests")
}

model LiveClip {
  id       String @id @default(cuid())
  roomId   String
  room     LiveRoom @relation(fields: [roomId], references: [id])
  requestedBy String
  startOffset  Int    // seconds from stream start
  endOffset    Int
  status    String @default("pending") // pending | processing | approved | rejected | published
  exportUrl String?
  platform  String? // youtube | tiktok | instagram | platform_archive
  createdAt DateTime @default(now())

  @@map("live_clips")
}
```

---

# INTERVIEW ENVIRONMENT SPEC
# Repo path: docs/contest/INTERVIEW_ENVIRONMENT_SPEC.md

## OVERVIEW

Interview rooms let users watch live conversations between interviewers and guests —
musicians, creators, podcasters, comedians — in a shared viewing environment.

Built on Live Room Core with room type = `interview` or `talk_show`.

## FEATURES

### Audience Modes
- Watch only (default)
- Submit written questions (host can read aloud)
- Request call-up to join live as voice guest
- React with emoji during interview
- Vote on which question gets asked next

### Stage Configuration
- Host (interviewer) always on stage
- Guests (musicians, creators) called up or pre-invited
- Max simultaneous stage guests: configurable 1–4
- Audience can see guest queue (optional)

### Host/Guest Interaction
- Host can invite audience member to stage
- Audience member accepts/declines
- If accepted: audience member becomes guest with mic + cam
- If declined or timed out: request dismissed
- Host can remove guest at any time

### Recording & Export
- Host enables recording before going live
- All guests consent to recording at room entry
- Clips can be requested by: host, guest, admin
- Export destinations: YouTube, TikTok, Instagram, platform archive
- Clip approval required before export (see CLIP_EXPORT_POLICY.md)

## FILES TO CREATE (Wave 8 — after contest minimum complete)

```
apps/web/src/components/interview/InterviewStage.tsx       CREATE
apps/web/src/components/interview/GuestCallUpPanel.tsx     CREATE
apps/web/src/components/interview/QuestionSubmitPanel.tsx  CREATE
apps/web/src/components/interview/InterviewReplayPlayer.tsx CREATE
apps/web/src/app/interviews/page.tsx                       CREATE
apps/web/src/app/interviews/[id]/page.tsx                  CREATE
apps/web/src/app/interviews/[id]/replay/page.tsx           CREATE
apps/api/src/modules/interview/interview.module.ts         CREATE
apps/api/src/modules/interview/interview.service.ts        CREATE
apps/api/src/modules/interview/interview.controller.ts     CREATE
```

## CONFLICT RULES

| File | Rule |
|---|---|
| `HostCuePanel.tsx` (contest) | DO NOT REUSE — create separate InterviewHostPanel.tsx |
| `StageSponsorOverlay.tsx` | EXTEND — add interview room type support |
| `PresentedBySlate.tsx` | REUSE as-is |
| `GuestQueuePanel.tsx` | REUSE — already built in Drop 2 |
| `AudienceRequestPanel.tsx` | REUSE — already built in Drop 2 |
| `LiveRoom` Prisma model | EXTEND — interview uses same model with type='interview' |

---

# PODCAST WATCH PARTY SPEC
# Repo path: docs/contest/PODCAST_WATCH_PARTY_SPEC.md

## OVERVIEW

Podcast rooms let users listen to or watch podcast recordings together,
with optional audience interaction, guest call-up, and live question segments.

Built on Live Room Core with room type = `podcast_recording`.

## FEATURES

- Shared listening: all audience hears same audio
- Optional video: host cam + guest cams
- Episode queue: host can queue multiple segments
- Live Q&A segment: audience submits questions, host picks
- Guest call-up for mini-interviews during podcast
- Clip request: audience can request a segment be clipped

## FILES TO CREATE (Wave 8)

```
apps/web/src/components/podcast/PodcastAudienceRoom.tsx   CREATE
apps/web/src/components/podcast/EpisodeQueuePanel.tsx     CREATE
apps/web/src/components/podcast/PodcastQAPanel.tsx        CREATE
apps/web/src/app/podcasts/page.tsx                        CREATE
apps/web/src/app/podcasts/[id]/page.tsx                   CREATE
apps/api/src/modules/podcast/podcast.module.ts            CREATE
apps/api/src/modules/podcast/podcast.service.ts           CREATE
apps/api/src/modules/podcast/podcast.controller.ts        CREATE
```

---

# HOST_GUEST_INTERACTION_MATRIX
# Repo path: docs/contest/HOST_GUEST_INTERACTION_MATRIX.md

| Action | Who Can | When |
|---|---|---|
| Invite audience to stage | host, co_host | During LIVE state |
| Accept stage invitation | audience member | Within 30 seconds of invite |
| Decline stage invitation | audience member | Anytime during invite window |
| Submit question | audience (if mode allows) | During LIVE or Q&A segment |
| Approve question to read | host, moderator | Any time question is pending |
| Request clip | audience, guest | During LIVE or REPLAY_READY |
| Approve clip export | host, admin | After clip request submitted |
| Remove guest from stage | host, co_host, admin | Anytime during LIVE |
| Mute guest | host, moderator, admin | Anytime during LIVE |
| End room | host, admin | Anytime |
| Publish replay | host, admin | After REPLAY_READY state |

---

# RECORDING_EXPORT_FLOW
# Repo path: docs/contest/RECORDING_EXPORT_FLOW.md

## RECORDING CONSENT CHAIN

1. Host enables recording before going live
2. Room shows "Recording Enabled" notice to all who join
3. Each participant must accept recording consent at entry
4. Participant can withdraw consent — removes their segments from export
5. Admin can override in case of legal/moderation need

## CLIP EXPORT CHAIN

```
Audience/Guest requests clip (start + end timestamp)
  ↓
Clip review queue (host + admin)
  ↓
Approved → processing (30 seconds per clip max)
  ↓
Export destinations available: YouTube, TikTok, Instagram, Platform Archive
  ↓
If published to external platform: webhook logs destination + clip ID
  ↓
Archive tagged with: clip ID, room ID, creator, event, sponsor info, timestamp
```

## RULES

- Clip max length: 10 minutes
- Clip min length: 10 seconds
- Guest must have consented to recording for their segment to be exported
- Sponsor overlays travel with clip if sponsor approved export
- Sponsor-restricted clips cannot be exported to competitor platforms
- Admin can revoke any clip post-export (takedown flow)

---

*BerntoutGlobal XXL | TMI Platform | Live Room Core + Interview/Podcast Specs | Phase 19*
