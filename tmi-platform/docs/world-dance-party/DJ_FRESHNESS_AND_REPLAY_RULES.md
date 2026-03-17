# World Dance Party — DJ Freshness and Replay Rules

## Purpose
Define freshness-first room rotation behavior for Julius DJ so active listeners avoid short-loop repetition while still allowing crowd-driven replay moments.

## Policy Statement
Julius must avoid replaying the same track for listeners still present in the room. Tracks heard by active listeners remain on cooldown and are not replayed unless explicitly re-requested, crowd-approved, or re-eligible after extended session time. No track may play more than 2 times per room session except in approved encore mode.

## Core Anti-Repeat Rule
If at least one active listener has already heard a track in the current room session, Julius must block replay unless one of the following is true:
- Listener session age and cooldown allow replay.
- The track is explicitly requested again.
- Replay vote threshold is reached.
- Queue has insufficient safe alternatives.

## Session Repeat Cap
- Hard cap: max 2 plays per track per room session.
- Exception: approved encore mode can temporarily lift cap under explicit crowd-approved replay controls.

## Listener-Aware Freshness Priorities
Julius tracks and weights:
- Active listeners currently in room.
- Listener session age (time since join).
- Per-listener heard tracks in this room session.
- Per-track play count and last played timestamp.
- Likes, skips, replay requests, and replay votes.

Julius should prefer:
- Tracks not yet heard by longest-staying listeners.
- Tracks with strong positive feedback that are not recently played.
- Tracks aligned to current room mood and energy.
- Fresh rotation over short loops.

## Replay Permission Rule
Replay is allowed only if one of these passes:
- Listener explicitly re-requests (like/favorite/request again).
- Active replay vote reaches threshold (default 60% of active voters).
- Room is in crowd-approved encore mode.

## Session Age and Cooldown Model
- Under 4h listener age: no repeat unless requested or vote-approved.
- 4h to 6h listener age: low-frequency replay allowed if cooldown passed.
- Over 6h listener age: selected favorites can re-enter rotation, still respecting session cap unless encore mode is active.

## Track Buckets
Julius maintains per room session buckets:
- Never played yet
- Played once, eligible later
- Played twice, locked
- Liked/favorited
- Crowd replay candidates
- Skipped/disliked
- High-energy backup
- Low-energy recovery

## Selection Order
1. Prefer tracks unplayed for current active listeners.
2. Penalize tracks already heard by longest-staying listeners.
3. Use liked tracks as delayed callbacks, not immediate repeats.
4. Lock tracks after two plays in normal mode.
5. Allow early replay only with strong crowd demand.

## Room UI Feedback Controls
Expose these controls in room playback UI:
- Like
- Replay later
- Play again
- Skip
- Mood up
- Calm it down
- More like this
- Don’t replay this tonight

## Minimum Data Model
Per room-session track record:
- roomSessionId
- trackId
- playCount
- lastPlayedAt

Per listener-session record:
- listenerId
- joinedAt
- heardTrackIds
- likedTrackIds
- replayRequests

## Eligibility Heuristics
- If any active listener heard track recently and no replay approval, block.
- If playCount >= 2 and not encore mode, block.
- If liked and cooldown passed, allow with lower priority than unplayed tracks.
- Increase priority when active room has many new listeners.
- Decrease priority when same long-stay listeners remain.

## Defaults
- replayVoteThreshold: 0.60
- hardSessionPlayCap: 2
- minimumReplayCooldownMinutes: implementation-defined per room type and BPM/energy class

## Notes
- This policy is room-session scoped.
- Preserve explicit operator override path for live event safety and sponsor obligations.
- Do not bypass anti-repeat protections in default mode.
