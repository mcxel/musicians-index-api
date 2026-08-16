# ANTI-GRAVITY Beat Vault Trust Ledger (2026-08-16)

Scope: persistence and ownership trust checks for Beat Vault / Beat Locker pipeline.

## Matrix

| Check | Expected | Actual | Status | Evidence |
|---|---|---|---|---|
| Beat schema ownership field | every beat has durable owner key | `Beat.producerId` required | Pass | `packages/db/prisma/schema.prisma` |
| Beat schema media field | every beat has durable audio/preview key | `Beat.previewUrl` required | Pass | `packages/db/prisma/schema.prisma` |
| Submit auth gate | unauth beat submit blocked | 401 from locker-submit when no auth | Pass | `src/app/api/beats/locker-submit/route.ts` |
| Submit role gate | only valid creator/admin roles can submit | 403 for disallowed roles | Pass | `src/app/api/beats/locker-submit/route.ts` |
| Submit owner binding | submitted beat binds to authenticated user | `producerId: auth.user.id` | Pass | `src/app/api/beats/locker-submit/route.ts` |
| Admin submit owner binding | admin-submitted beat still binds to actor | `producerId: actorId` | Pass | `src/app/api/beats/admin-submit/route.ts` |
| Mine list auth behavior | unauth `?mine=1` must not silently return empty | 401 with explicit unauthorized payload | Pass | `src/app/api/beats/list/route.ts` |
| Mine list owner filter | list should be scoped to owner identity | primary `auth.user.id` with legacy OR fallback to `tmi_session_id` | Pass with legacy-risk note | `src/app/api/beats/list/route.ts` |
| Client session continuity | beat client requests carry cookie auth | all list/submit calls use `credentials: include` | Pass | `src/lib/beats/BeatLockerClient.ts` |
| Session identity resolution | server auth requires both session cookies | returns null unless `tmi_session_id` + `tmi_session` exist | Pass | `src/lib/auth/getTmiAuth.ts` |
| Playlist removal side-effects | removing playlist data must not delete beat rows | playlist APIs mutate playlist/playlistItem only; no beat delete route in app APIs found | Pass (source-level) | `src/app/api/playlists/[id]/route.ts`, `src/app/api/playlists/[id]/tracks/[trackId]/route.ts` |
| Blob object survival | uploaded object remains retrievable | upload path stores blob URL; object-level HEAD proof not executed in this pass | Pending runtime proof | `src/app/api/beats/locker-submit/route.ts` |

## Risk Notes

- Legacy OR fallback (`producerId == session cookie`) in mine list improves backward compatibility but can blur ownership diagnostics during session-id drift incidents.
- Current local runtime had intermittent route timeouts; final trust closure for reported disappearing beats should include DB row + blob URL existence checks on specific beat IDs.
