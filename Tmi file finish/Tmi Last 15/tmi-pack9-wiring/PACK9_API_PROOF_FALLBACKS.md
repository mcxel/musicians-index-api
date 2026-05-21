# PACK9_API_ROUTE_MATRIX.md
## Every API Endpoint and Web Route Needed for Pack 9

---

## ECONOMY ROUTES

### API (apps/api)
| Method | Route | Auth | Purpose |
|---|---|---|---|
| GET | `/api/points/:userId` | Auth | Get user point balance |
| POST | `/api/points/earn` | Internal | Log a points event |
| POST | `/api/points/spend` | Auth | Spend points (seat upgrade etc) |
| GET | `/api/subscriptions/:userId` | Auth | Get subscription status |
| POST | `/api/subscriptions/upgrade` | Auth | Upgrade subscription |
| POST | `/api/subscriptions/cancel` | Auth | Cancel subscription |
| GET | `/api/earnings/:artistId` | Artist | Get artist earnings |
| GET | `/api/payouts/:artistId` | Artist | Get payout history |
| POST | `/api/payouts/request` | Artist | Request early payout |
| POST | `/api/stripe/webhook` | System | Stripe webhook handler |
| POST | `/api/promo/apply` | Auth | Apply promo code |

### Web routes (apps/web)
| Route | Auth | Page |
|---|---|---|
| `/dashboard/earnings` | Artist | Earnings dashboard |
| `/dashboard/billing` | Auth | Billing/subscription page |
| `/upgrade` | Any | Subscription upgrade page |

---

## SOCIAL & DISCOVERY ROUTES

### API (apps/api)
| Method | Route | Auth | Purpose |
|---|---|---|---|
| POST | `/api/follows` | Auth | Follow an artist |
| DELETE | `/api/follows/:artistId` | Auth | Unfollow |
| GET | `/api/follows/:userId/feed` | Auth | Following feed |
| GET | `/api/artists/:id/followers` | Artist | Follower list |
| GET | `/api/search` | Public | Platform-wide search |
| GET | `/api/discovery` | Public | Discovery feed (rank-ordered) |
| GET | `/api/fan-clubs/:artistId` | Public | Fan club info |
| POST | `/api/fan-clubs/:artistId/join` | Auth | Join fan club |
| POST | `/api/watch-parties` | Auth | Create watch party |
| GET | `/api/watch-parties/:code` | Auth | Join watch party |

### Web routes (apps/web)
| Route | Auth | Page |
|---|---|---|
| `/search` | Public | Search results page |
| `/following` | Auth | Following feed |
| `/fan-clubs/:artistSlug` | Auth | Fan club page |

---

## NOTIFICATION ROUTES

### API (apps/api)
| Method | Route | Auth | Purpose |
|---|---|---|---|
| GET | `/api/notifications/:userId` | Auth | Get notification feed |
| PATCH | `/api/notifications/:id/read` | Auth | Mark read |
| PATCH | `/api/notifications/read-all` | Auth | Mark all read |
| GET | `/api/notifications/preferences` | Auth | Get preferences |
| PATCH | `/api/notifications/preferences` | Auth | Update preferences |
| POST | `/api/notifications/broadcast` | Admin | Platform announcement |

---

## MODERATION ROUTES

### API (apps/api)
| Method | Route | Auth | Purpose |
|---|---|---|---|
| POST | `/api/reports` | Auth | Submit report |
| GET | `/api/reports` | Admin | Moderation queue |
| PATCH | `/api/reports/:id` | Admin | Action a report |
| POST | `/api/moderation/mute` | System | Auto-mute user |
| GET | `/api/fraud-flags` | Admin | Fraud review queue |
| PATCH | `/api/fraud-flags/:id` | Admin | Action fraud flag |

### Web routes (apps/web)
| Route | Auth | Page |
|---|---|---|
| `/admin/moderation` | Admin | Moderation queue |
| `/admin/fraud` | Admin | Fraud review |

---

## ARTIST TOOLS ROUTES

### API (apps/api)
| Method | Route | Auth | Purpose |
|---|---|---|---|
| GET | `/api/artist/dashboard` | Artist | Dashboard data |
| GET | `/api/artist/analytics` | Artist | Analytics hub |
| GET | `/api/artist/schedule` | Artist | Event schedule |
| POST | `/api/artist/events/schedule` | Artist | Schedule new event |
| PATCH | `/api/artist/events/:id` | Artist | Update event |
| DELETE | `/api/artist/events/:id` | Artist | Cancel event |
| GET | `/api/artist/clips` | Artist | Clip center |
| PATCH | `/api/artist/clips/:id/approve` | Artist | Approve clip |
| PATCH | `/api/artist/clips/:id/reject` | Artist | Reject clip |
| GET | `/api/seasons/current` | Public | Current season info |
| GET | `/api/seasons/:id/rounds` | Public | Season rounds |

### Web routes (apps/web)
| Route | Auth | Page |
|---|---|---|
| `/dashboard/artist` | Artist | Artist dashboard |
| `/dashboard/analytics` | Artist | Analytics hub |
| `/dashboard/schedule` | Artist | Content calendar |
| `/dashboard/clips` | Artist | Clip center |

---

## ONBOARDING ROUTES

### API (apps/api)
| Method | Route | Auth | Purpose |
|---|---|---|---|
| GET | `/api/onboarding/status` | Auth | Onboarding progress |
| POST | `/api/onboarding/step` | Auth | Complete a step |
| POST | `/api/onboarding/skip` | Auth | Skip optional step |

### Web routes (apps/web)
| Route | Auth | Page |
|---|---|---|
| `/onboarding/artist` | Auth | Artist onboarding |
| `/onboarding/fan` | Auth | Fan onboarding |
| `/onboarding/complete` | Auth | Completion redirect |

---

## SPONSOR ROUTES

### API (apps/api)
| Method | Route | Auth | Purpose |
|---|---|---|---|
| GET | `/api/sponsors/slots/:eventId` | System | Active sponsor slots |
| POST | `/api/sponsors/campaigns` | Admin | Create campaign |
| PATCH | `/api/sponsors/campaigns/:id/approve` | Admin | Big Ace approves |
| GET | `/api/sponsors/analytics` | Sponsor | Campaign analytics |

---

## INTEGRITY / EMERGENCY ROUTES

### API (apps/api)
| Method | Route | Auth | Purpose |
|---|---|---|---|
| POST | `/api/emergency/broadcast` | Admin | Emergency broadcast |
| DELETE | `/api/emergency/broadcast/:id` | Admin | End broadcast |
| POST | `/api/waitlist/join` | Auth | Join event waitlist |
| GET | `/api/waitlist/position` | Auth | Queue position |

---

*Pack 9 API Route Matrix v1.0 — BerntoutGlobal XXL*

---
---
---

# PACK9_PROOF_GATES.md
## Exact Pass/Fail Criteria for Every Pack 9 System

---

## HOW TO USE THIS

For each subsystem:
1. Build it
2. Run these tests
3. Save screenshot/log to `/proof/pack9/[system]/`
4. Check every box
5. Only then move to next system

---

## ECONOMY PROOF GATES

- [ ] Fan watches 5 min → balance increases by 10
- [ ] Fan reacts → balance increases by 2
- [ ] Points balance visible in dashboard
- [ ] Room tier matches points bracket (test each tier)
- [ ] Subscription upgrade → tier updates in DB + UI
- [ ] Artist tip → earnings ledger records correctly
- [ ] Payout threshold met → payout record created
- [ ] Promo code applies (created by Big Ace, used by fan)
- [ ] Promo code cannot stack with another promo
- [ ] Marcel cannot create promo codes (permission denied)

---

## SOCIAL PROOF GATES

- [ ] Fan follows artist → artist follower count +1
- [ ] Follow persists after page reload
- [ ] Unfollow removes from feed
- [ ] Following feed shows only followed artists
- [ ] Search for "jazz" returns relevant results
- [ ] Search result cards show correct quickAction
- [ ] Discovery feed: artist with rank #4,000 appears before #400
- [ ] Watch party invite link works for up to max group size

---

## NOTIFICATION PROOF GATES

- [ ] Artist goes live → followed fans receive in-app notification
- [ ] Event starting 15 min → registered fans receive push
- [ ] Bell shows correct unread count
- [ ] Mark all read → bell clears
- [ ] Julius delivers in-app notification (appears, speaks, retreats after 4s)
- [ ] Quiet hours respected (no push 11pm–7am in user timezone)
- [ ] Emergency alert cannot be dismissed without reading

---

## MODERATION PROOF GATES

- [ ] Blocked word in chat → auto-muted immediately
- [ ] Report submitted → appears in admin moderation queue
- [ ] 3 identical messages in 60s → user auto-muted
- [ ] Big Ace can action report (approve/dismiss)
- [ ] Fraud flag created for suspicious tip → tip held in escrow
- [ ] Bot behavior pattern → account silently downgraded
- [ ] Downgraded bot account → cannot vote/tip/affect energy

---

## ARTIST TOOLS PROOF GATES

- [ ] Artist schedules event → appears on content calendar
- [ ] Calendar conflict detected → alternative times suggested
- [ ] Analytics hub loads: followers, events, earnings tabs
- [ ] Earnings tab shows correct breakdown
- [ ] Clip auto-generated from crowd energy peak 90+
- [ ] Artist approves clip → clip shareable
- [ ] Artist rejects clip → clip gone
- [ ] Season round start date correct for current season

---

## ONBOARDING PROOF GATES

- [ ] New artist: all 8 steps completable in one session
- [ ] New artist: article auto-created after step 4
- [ ] New artist: venue assigned after step 5
- [ ] New fan: genre selector shows artists per genre
- [ ] New fan: entering first venue successful
- [ ] Onboarding progress % shows in artist dashboard
- [ ] Reminder notification fires at 24h if incomplete
- [ ] Points awarded for each completed step

---

## SPONSOR PROOF GATES

- [ ] Sponsor slot renders in venue side screen area
- [ ] Sponsor slot does NOT block stage or screen
- [ ] Campaign requires Big Ace approval before going live
- [ ] Marcel cannot approve sponsor campaigns (permission denied)
- [ ] Impression counter increments per view

---

## INTEGRITY PROOF GATES

- [ ] Emergency alert shows full-screen overlay on active sessions
- [ ] Emergency alert cannot be dismissed until read
- [ ] Platform announcement shows as top banner
- [ ] Waitlist join → correct queue position shown
- [ ] Seat opens → waitlist fan notified within 5s
- [ ] 30s claim window → if not claimed, next fan notified

---

*Pack 9 Proof Gates v1.0 — BerntoutGlobal XXL*

---
---
---

# PACK9_FAILURE_FALLBACKS.md
## What Happens When Pack 9 Systems Fail

---

## ECONOMY FAILURES

| Failure | Fallback |
|---|---|
| Stripe webhook not received | Retry 3x, then queue for manual review |
| Points service unavailable | Cache last known balance, no new points until restored |
| Payout provider unavailable | Hold payout, notify artist, retry next day |
| Subscription billing fails | 3-day grace period, then soft downgrade to Free |
| Promo code service errors | Show "promo unavailable" — do not silently apply |

---

## SOCIAL FAILURES

| Failure | Fallback |
|---|---|
| Follow service errors | Retry 2x, show error toast, do not silently drop |
| Discovery feed fails | Show most recent by date instead |
| Search service unavailable | Show "Search unavailable, try again soon" |
| Watch party full | Show remaining slots or redirect to solo view |
| Fan club tier data missing | Show base "Open" tier access |

---

## NOTIFICATION FAILURES

| Failure | Fallback |
|---|---|
| Push delivery fails | Fall to in-app only |
| Email delivery fails | Queue for retry, log failure |
| Julius notification system errors | Text-only notification |
| Notification service down | Silent (in-app feed updates on next visit) |

---

## MODERATION FAILURES

| Failure | Fallback |
|---|---|
| Auto-filter service down | Soft mode: flag messages for human review |
| Moderation queue backlog | Auto-escalate items older than 48h |
| Fraud engine errors | All suspicious tips held longer (7 days vs 72h) |
| Report service fails | Show "reporting temporarily unavailable" |

---

## ARTIST TOOLS FAILURES

| Failure | Fallback |
|---|---|
| Schedule service errors | Last known schedule cached |
| Clip generation fails | Notify artist, offer manual clip request |
| Analytics data unavailable | Show cached data with "updated [last time]" |
| Season engine partial outage | Show current round info from cache |

---

## ONBOARDING FAILURES

| Failure | Fallback |
|---|---|
| Step save fails | Retry on next page interaction |
| Article auto-create fails | Artist reminded to create manually from dashboard |
| Venue assignment fails | Default to Free tier Living Room |
| Genre data unavailable | Show text input instead of selector |

---

*Pack 9 Failure Fallbacks v1.0 — BerntoutGlobal XXL*
