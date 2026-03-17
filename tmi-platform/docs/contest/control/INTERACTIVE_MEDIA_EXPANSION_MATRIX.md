# INTERACTIVE MEDIA EXPANSION MATRIX
# TMI Platform — BerntoutGlobal XXL
# Connects: contests, livestreams, interviews, podcasts, watch parties,
#           replay, recording, archive across all platform systems

---

## PLATFORM LIVE EVENT CAPABILITY MATRIX

| Feature | Contest | Interview | Podcast | Watch Party | Livestream | Premiere |
|---|---|---|---|---|---|---|
| Shared audience | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Host on stage | Ray Journey | Interviewer | Podcast host | Room host | Creator | Creator |
| Guest call-up | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Audience voting | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Question submit | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Sponsor overlay | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Recording | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Clip export | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Replay | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Auto-archive | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Winner reveal | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Countdown timer | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| Sponsor match | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ |

---

## SHARED COMPONENTS ACROSS ALL LIVE EVENT TYPES

| Component | Repo Path | Status |
|---|---|---|
| `StageSponsorOverlay.tsx` | `apps/web/src/components/sponsor/` | EXTEND for interview/podcast room types |
| `PresentedBySlate.tsx` | `apps/web/src/components/sponsor/` | REUSE as-is |
| `GuestQueuePanel.tsx` | `apps/web/src/components/watchparty/` | REUSE across interview + podcast |
| `AudienceRequestPanel.tsx` | `apps/web/src/components/watchparty/` | REUSE across interview + podcast |
| `ClipRecorderPanel.tsx` | `apps/web/src/components/watchparty/` | REUSE across all |
| `ReplayPublishPanel.tsx` | `apps/web/src/components/watchparty/` | REUSE across all |

---

## INSTALL WAVE ORDER FOR EXPANSION

| Wave | Systems | Prerequisite |
|---|---|---|
| W1–W7 | Contest base + docs + API + Prisma + tests | Must all pass before W8 |
| W8 | Interview + Podcast + Watch Party UI components | MINIMUM_CONTEST_COMPLETE = true |
| W9 | Interview + Podcast + Watch Party pages | W8 build passes |
| W10 | Live Room API module + Interview + Podcast API | W9 pages build + pass |
| W11 | Prisma live room models (append only) | W10 API build passes |
| W12 | Clip export + recording + replay API | W11 Prisma migrates cleanly |
| W13 | Discovery + search + notifications | W12 complete |
| W14 | Rewards + engagement + admin media controls | W13 complete |

---

## WHAT "MINIMUM CONTEST COMPLETE" MEANS

All of these must be true before starting Wave 8:

- [ ] `pnpm -C apps/web build` exits 0
- [ ] `pnpm -C apps/api build` exits 0
- [ ] `/contest` returns 200
- [ ] `/contest/admin` redirects unauthenticated user to `/auth`
- [ ] `GET /api/contest/sponsor-packages` returns 200 with array
- [ ] `npx prisma migrate dev` completed without error
- [ ] `pnpm -C apps/api run test:readiness-contract` exits 0
- [ ] `contest.smoke.spec.ts` playwright exits 0
- [ ] Contest banner visible on eligible artist profile
- [ ] Sponsor invite panel opens and closes
- [ ] Season countdown points to August 8

---

## WHAT "MINIMUM MEDIA EXPANSION COMPLETE" MEANS

All of these must be true before calling the interview/podcast/watch-party expansion done:

- [ ] Interview stage page loads at `/interviews/[id]`
- [ ] Podcast room page loads at `/podcasts/[id]`
- [ ] Watch party page loads at `/watch/[roomId]`
- [ ] Guest queue panel renders
- [ ] Audience request panel renders
- [ ] `POST /api/liveroom` creates a room
- [ ] `POST /api/liveroom/:id/join` works
- [ ] `POST /api/liveroom/:id/invite-guest` works
- [ ] Prisma live room models migrated
- [ ] Recording consent flow exists (even if placeholder)
- [ ] Clip request flow exists (even if admin-approval only)
- [ ] Replay page loads at `/interviews/[id]/replay`
- [ ] Admin can see guest requests in admin panel

---

## MEDIA RIGHTS RULES (from RECORDING_EXPORT_FLOW.md)

| Rule | Detail |
|---|---|
| Recording consent required | Every participant must consent at room entry |
| Guest withdrawal | Guest can withdraw consent — their segments excluded from export |
| Clip max duration | 10 minutes |
| Export destinations | YouTube, TikTok, Instagram, Platform Archive |
| Sponsor-restricted clips | Cannot export to competitor platforms |
| Admin takedown | Admin can revoke any clip post-export |
| Auto-archive | All live events auto-archive after COOLDOWN state |
| Archive retention | Permanent unless admin/creator deletes |

---

## ADMIN MEDIA CONTROL SURFACES (to build in Wave 14)

```
apps/web/src/app/admin/media/page.tsx                    CREATE
apps/web/src/app/admin/media/interviews/page.tsx          CREATE
apps/web/src/app/admin/media/podcasts/page.tsx            CREATE
apps/web/src/app/admin/media/clips/page.tsx               CREATE
apps/web/src/app/admin/media/export-permissions/page.tsx  CREATE
apps/web/src/app/admin/media/replay/page.tsx              CREATE
```

Admin controls needed:
- Live room state management
- Guest queue moderation
- Audience request approval
- Clip review + approval/rejection
- Export permission management
- Replay publishing controls
- Recording consent override (admin)
- Room lockdown / emergency shutdown

---

## CLIP EXPORT POLICY SUMMARY

| Scenario | Policy |
|---|---|
| Clip requested by audience | Requires host approval |
| Clip requested by guest | Requires host approval |
| Clip requested by host | Auto-approved, still logged |
| Clip requested by admin | Auto-approved, still logged |
| Sponsor in clip | Sponsor contacted for approval if going external |
| Guest didn't consent | Their segments auto-excluded |
| Export to YouTube | OAuth connection required + platform logging |
| Export to TikTok/Instagram | API connection required |
| Export to Platform Archive | Always available if approved |
| Admin takedown post-export | Platform can unpublish, external platform cannot be controlled |

---

*BerntoutGlobal XXL | TMI Platform | Interactive Media Expansion Matrix | Phase 19*
