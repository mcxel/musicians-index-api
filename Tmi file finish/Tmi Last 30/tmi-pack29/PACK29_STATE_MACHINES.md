# PACK29_STATE_MACHINES.md
## Exact State Transitions — Every Stateful System
### BerntoutGlobal XXL / The Musician's Index

---

## 1. CAMPAIGN LIFECYCLE

```
States: DRAFT → PENDING_REVIEW → APPROVED → ACTIVE → PAUSED → COMPLETED | REJECTED | CANCELLED

DRAFT
  → PENDING_REVIEW   when: advertiser submits payment + creative
                     trigger: POST /api/advertiser/campaigns (with Stripe payment)
                     action: notify admin, start 24h review timer

PENDING_REVIEW
  → APPROVED         when: admin approves creative
                     trigger: POST /api/admin/campaigns/:id/approve
                     action: activate slot reservations, schedule campaign start
  → REJECTED         when: admin rejects creative
                     trigger: POST /api/admin/campaigns/:id/reject { reason }
                     action: notify advertiser, offer revision, partial refund if warranted
  → AUTO-APPROVED    when: 24h timer expires with no admin action (low-risk categories only)
                     trigger: expiration.bot.ts job
                     action: same as APPROVED

APPROVED
  → ACTIVE           when: campaign startDate is reached
                     trigger: campaign-scheduler.job.ts (checks every 15 min)
                     action: activate slot reservations, start serving ads
  → CANCELLED        when: advertiser cancels before start
                     trigger: DELETE /api/advertiser/campaigns/:id
                     action: release reservations, process refund

ACTIVE
  → PAUSED           when: advertiser pauses OR admin pauses (brand safety)
                     trigger: PUT /api/advertiser/campaigns/:id/pause OR admin action
                     action: stop serving, keep reservations held (24h grace)
  → COMPLETED        when: endDate reached OR budget exhausted
                     trigger: expiration.bot.ts
                     action: release slots, generate receipt, offer renewal
  → CANCELLED        when: advertiser cancels mid-campaign
                     trigger: DELETE /api/advertiser/campaigns/:id
                     action: pro-rated refund, release slots

PAUSED
  → ACTIVE           when: advertiser resumes within 24h
                     trigger: PUT .../resume
  → CANCELLED        when: paused > 24h without resume
                     trigger: expiration.bot.ts

COMPLETED | REJECTED | CANCELLED  → terminal states. Read-only.

renewal.bot.ts runs 7 days before COMPLETED to send renewal offer.
```

---

## 2. AD SLOT RESERVATION LIFECYCLE

```
States: TENTATIVE → CONFIRMED → ACTIVE → COMPLETED | EXPIRED | RELEASED

TENTATIVE
  Created by: slot-reservation.service.ts (bot-initiated or self-serve)
  Held for: 24 hours maximum
  → CONFIRMED   when: linked campaign payment received
                trigger: Stripe webhook payment_intent.succeeded
  → EXPIRED     when: 24h hold expires without payment
                trigger: expiration.bot.ts
                action: release slot back to inventory

CONFIRMED
  → ACTIVE      when: campaign startDate reached
                trigger: campaign-scheduler
  → RELEASED    when: campaign cancelled before start
                trigger: DELETE campaign endpoint

ACTIVE
  → COMPLETED   when: endDate reached
  → RELEASED    when: campaign cancelled or emergency pause

COMPLETED | EXPIRED | RELEASED → terminal states.
```

---

## 3. SALES LEAD / CRM LIFECYCLE

```
States: DISCOVERED → CONTACTED → QUALIFIED → PROPOSAL_SENT → NEGOTIATING
        → RESERVED → APPROVED → PAID → ACTIVE → COMPLETED → RENEWAL_DUE | LOST

DISCOVERED
  Created by: prospect-scout.bot.ts or manual Big Ace entry
  → CONTACTED   when: outreach.bot.ts sends first contact OR human sends message
                action: log contact in SalesNote, set nextFollowUpAt

CONTACTED
  → QUALIFIED   when: lead responds + budget confirmed by bot/human
                action: assign package recommendation
  → LOST        when: 7 days no response after 3 follow-ups
  → DISCOVERED  (reset) if contact info was wrong

QUALIFIED
  → PROPOSAL_SENT  when: proposal.bot.ts or human generates + sends proposal
                   action: create CampaignProposal, send email, set expiresAt = 7 days

PROPOSAL_SENT
  → NEGOTIATING    when: lead responds with questions/counter
  → RESERVED       when: lead accepts standard proposal
  → LOST           when: proposal expires (7 days) without response

NEGOTIATING
  → RESERVED       when: terms agreed (bot can close within rules, human needed for exceptions)
  → LOST           when: no agreement

RESERVED
  → APPROVED       when: admin approves (and finance for large deals)
  → NEGOTIATING    (reopen) if approved terms need revision

APPROVED
  → PAID           when: Stripe payment received
  → LOST           when: 48h no payment after approval

PAID → ACTIVE when campaign starts
ACTIVE → COMPLETED when campaign ends
COMPLETED → RENEWAL_DUE 7 days before anniversary

Bot automation boundaries:
  ✅ Bots can move: DISCOVERED→CONTACTED, CONTACTED→QUALIFIED, QUALIFIED→PROPOSAL_SENT,
                    PROPOSAL_SENT→NEGOTIATING, NEGOTIATING→RESERVED (within rules)
  ❌ Human required: NEGOTIATING→RESERVED if discount > 10% or custom terms
                    RESERVED→APPROVED always requires Big Ace review
                    Any exclusivity deal requires Big Ace signature
```

---

## 4. PARTY LOBBY LIFECYCLE

```
States: ACTIVE | DISBANDED

ACTIVE
  Created by: POST /api/party
  Has at least 1 member (the host)
  Members come and go freely
  → DISBANDED   when: all members leave for > 60 minutes
                when: host explicitly disbands
                when: Big Ace closes via admin
                trigger: expiration.bot (every 15 min check)
  Action on disband: notify all members, clean up WebSocket connections

Member presence states (within ACTIVE party):
  IN_LOBBY → IN_ROOM         when member joins a room via party:transport
  IN_ROOM → IN_LOBBY         when member returns to party
  IN_LOBBY → AWAY            when member idle > 10 min
  AWAY → IN_LOBBY            when member sends message or toggles ready
  any → DISCONNECTED         when WebSocket drops
  DISCONNECTED → previous    when member reconnects within 5 min (seat held)
  DISCONNECTED → removed     after 5 min disconnect (slot opened, party notified)
```

---

## 5. GAME SESSION LIFECYCLE

```
States: LOBBY → COUNTDOWN → ACTIVE → INTERMISSION → ENDED

LOBBY
  Created by: POST /api/games/sessions
  Players join via POST /api/games/sessions/:id/join
  → COUNTDOWN  when: host triggers start OR min players joined + all ready
                duration: 3 seconds
                ws event: game:countdown { seconds: 3,2,1 }

COUNTDOWN
  → ACTIVE     immediately after countdown completes
               ws event: game:round-start

ACTIVE (per round)
  → INTERMISSION  when: round timer expires OR all players answered
                  duration: 10 seconds (ad slot fires: GAME_INTERMISSION)
                  → skip to next round if no sponsor
  → ENDED         when: final round completes

INTERMISSION
  → ACTIVE        start next round
  → ENDED         when: was last round

ENDED → terminal. Results persist in GamePlayer records.
```

---

## 6. CAMPAIGN PROPOSAL LIFECYCLE

```
States: DRAFT → SENT → VIEWED → ACCEPTED | DECLINED | EXPIRED | REVISED

DRAFT
  Created by: proposal.bot.ts or admin
  → SENT       when: email/message sent to lead contact

SENT
  → VIEWED     when: lead opens proposal link (tracking pixel)
  → EXPIRED    when: expiresAt timestamp passes
  → REVISED    when: admin creates new version

VIEWED
  → ACCEPTED   when: lead clicks Accept
  → DECLINED   when: lead clicks Decline (or responds to decline)
  → NEGOTIATING (triggers lead status change)

ACCEPTED
  → triggers: lead status RESERVED
  → triggers: slot-reservation.service.ts creates TENTATIVE reservation

DECLINED | EXPIRED → terminal for that proposal.
New proposal can be created (REVISED).
```

---

## 7. ARTICLE PUBLICATION LIFECYCLE

```
States: DRAFT → IN_REVIEW → APPROVED → PUBLISHED → UNPUBLISHED | ARCHIVED

DRAFT
  Created by: author (artist or editor) via /api/editorial POST
  → IN_REVIEW   when: author submits for review

IN_REVIEW
  → APPROVED    when: editor/admin approves
  → DRAFT       when: sent back with changes needed

APPROVED
  → PUBLISHED   when: admin publishes (PUT .../publish) or scheduled publish time
                action: assign article ad slots, notify followers

PUBLISHED
  → UNPUBLISHED when: admin removes from public view
                action: deactivate ad slots, remove from search index
  → ARCHIVED    when: admin archives old content

UNPUBLISHED
  → PUBLISHED   when: admin re-publishes
  → ARCHIVED

ARCHIVED → terminal (read-only for historical record)
```
