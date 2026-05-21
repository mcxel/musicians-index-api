# SPONSOR_CAMPAIGN_CHAIN.md
## Every Step of the Local Sponsor → Artist → Community Loop
### BerntoutGlobal XXL / The Musician's Index

---

## THE CORE LOOP

```
Local store funds artist → artist promotes store → community discovers store → store renews
```

## DETAILED CHAIN

```
Step 1: SPONSOR DISCOVERY
  prospect-scout-bot discovers potential local businesses
  OR local store self-registers at /register?role=sponsor

Step 2: LEAD CREATION
  SalesCRMEntry created with status=DISCOVERED
  outreach-bot sends first contact (standard template)
  Status → CONTACTED

Step 3: QUALIFICATION
  bot or human qualifies: budget, category, target artist genre/city
  Status → QUALIFIED

Step 4: ARTIST MATCHING
  sponsor-matching-bot finds artist matches:
    - same city/region as store
    - genre alignment
    - audience size appropriate for budget
    - artist tier >= starter (for sponsor visibility)
    - artist not already over-sponsored
  Proposal generated with recommended package

Step 5: PROPOSAL
  proposal-bot generates CampaignProposal
  Status → PROPOSAL_SENT
  Sponsor reviews at /sponsors/[id] OR via email link

Step 6: PAYMENT + ACTIVATION
  Sponsor pays via Stripe
  Campaign.status → ACTIVE
  AdSlotReservations activated for:
    - Artist profile sponsor board
    - Station sponsor overlay
    - Relevant article ad slots
    - Homepage local ad slot (if geo-targeted)

Step 7: ARTIST NOTIFICATION
  Artist receives:
    - in-app notification: "New sponsor: [Store Name] is now supporting you"
    - Coaching sticky note: "Thank [Store Name] this week to strengthen the relationship"
    - Sponsor task created in /dashboard/artist/sponsor-tasks

Step 8: ARTIST PROMOTION TASKS
  Artist task list (auto-generated):
    □ Thank sponsor in a post or live session
    □ Feature sponsored product in station broadcast
    □ Add sponsor mention in article

  Each completed task:
    → task.status = 'completed'
    → sponsor-analytics updates
    → coaching-bot reduces urgency of reminders
    → store sees completed task in /stores/[slug]/analytics

Step 9: ANALYTICS (store sees value)
  Store dashboard /stores/[slug]/analytics shows:
    - Artist mentions completed
    - Station placements
    - Estimated reach
    - Community engagement
    - Campaign health score

Step 10: RENEWAL
  7 days before campaign ends:
    → renewal-bot fires
    → Sponsor offer email sent
    → "Artists who complete tasks are 3x more likely to be renewed"
    → If tasks completed: renewal offer includes 5% loyalty discount
  
  On renewal:
    → New campaign created
    → Artist earnings continue
    → Coaching notes continue
    → Local community loop continues

THE WIN-WIN IS EXPLICIT IN THE CODE:
  - Store: gets local exposure + proof of promotion
  - Artist: gets funding + higher rankings + coaching support
  - Community: discovers local businesses through artists they follow
  - Platform: takes fair percentage from every transaction
```
