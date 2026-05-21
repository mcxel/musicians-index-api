# DANIKA'S LAW · SPONSOR PORTAL · EMERGENCY · PLATFORM INTEGRITY

---

# DANIKA_LAW_INTEGRATION.md
## How Danika's Law Firm Connects to TMI

---

## RELATIONSHIP

Danika's Law Firm is a separate BerntoutGlobal business unit.
It connects to TMI through a surface integration — not a merger.
TMI provides the platform. Danika's Law provides legal services.

---

## HOW DANIKA'S LAW APPEARS ON TMI

### Placement
- Legal resources sidebar on artist dashboard
- "Know Your Rights" section in artist onboarding
- Law Bubble widget on specific article types (industry news)
- Footer link: "Legal Resources → Danika's Law"

### What It Offers (On-Platform)
- Artist contract review callouts (not legal advice, referral)
- Know-your-rights articles (published as TMI content)
- "Talk to a Legal Pro" CTA → links to Danika's Law intake
- Webinars hosted in TMI premiere format

---

## THE LAW BUBBLE WIDGET

The Law Bubble is a floating widget that appears on:
- Artist dashboard (subtle)
- Industry news articles
- Copyright-related content
- Licensing topics

What it shows:
- Brief legal tip of the day (text only)
- "Get Help" button → Danika's Law intake
- Dismiss button

---

## LEGAL BOT INTEGRATION (WITHIN DANIKA'S LAW)

The 17 specialized legal bots live in Danika's Law's own interface.
They do NOT operate inside TMI directly.
The LegalModulesControlBridge.ts connects these systems at the infrastructure level only.

---

## DATA BOUNDARY

TMI does NOT share:
- User personally identifiable data with Danika's Law
- Artist earnings data
- Subscriber payment info

TMI MAY share:
- Anonymized usage data (with user consent)
- Public-facing artist profile info (already public)

---

# SPONSOR_PORTAL.md
## How Brands Buy Placements and Manage Campaigns

---

## WHAT SPONSORS CAN BUY

| Placement | Format | Tier Required |
|---|---|---|
| Event presenting sponsorship | "Presented by [Brand]" in countdown | Any event |
| Lower-third strip | Brief brand display during stream | Gold events+ |
| Intro bumper (5s) | Before premiere starts | Premiere events |
| Outro bumper (5s) | After event ends | Any event |
| Venue side screen | Brand on side displays | Gold venue+ |
| Magazine ad unit | In magazine spread page | Any tier |
| VIP lounge branding | Brand in VIP lounge | Diamond events |
| Monthly Idol title sponsorship | Season presenting sponsor | Season-level |

---

## WHAT SPONSORS CANNOT BUY

- Blocking the artist or stage
- Interrupting performance with audio
- Displaying competing artist's content
- Forcing interaction from users
- Appearing in Julius's mouth (no scripted product pushes by Julius)
- Replacing any editorial content

---

## SPONSOR PORTAL DASHBOARD

Sponsors access a separate portal (not TMI main app):
```
┌──────────────────────────────────────────┐
│  SPONSOR PORTAL — [Brand Name]           │
├──────────────────────────────────────────┤
│  Active Campaigns: 2                     │
│  Total Impressions (this month): 84,200  │
│  Avg CPM: $4.20                          │
├──────────────────────────────────────────┤
│  CAMPAIGNS                               │
│  [Monthly Idol Season 4 Title Sponsor]   │
│    Impressions: 42,000  CTR: 2.4%        │
│  [Event Side Screen — 5 events]          │
│    Impressions: 42,200  CTR: 1.8%        │
├──────────────────────────────────────────┤
│  [Create New Campaign]                    │
└──────────────────────────────────────────┘
```

---

## SPONSOR PRICING MODEL

| Type | Pricing Model |
|---|---|
| Event sponsorship | CPM (per impression) |
| Season title | Flat fee |
| Venue branding | Per-event flat |
| Magazine units | CPM |

All placements require Big Ace approval before going live.

---

# EMERGENCY_BROADCAST_SYSTEM.md
## Platform-Wide Announcements and Emergency Controls

---

## WHAT THIS COVERS

Three levels of platform-wide communication:
1. Emergency alert (safety/critical)
2. Platform announcement (maintenance, news)
3. Event-wide broadcast (event-specific, real-time)

---

## EMERGENCY ALERT

Triggered by: Big Ace only

What it does:
- Full-screen overlay on all active sessions
- Cannot be dismissed without reading
- Julius pauses all current activity
- All live events paused/notified
- Alert color: Red banner

Use cases:
- Platform security incident
- Legal requirement
- Safety emergency affecting users

---

## PLATFORM ANNOUNCEMENT

Triggered by: Big Ace

What it does:
- Top banner across all pages
- Dismissible after reading
- Duration: defined by Big Ace
- Shown in notification feed

Use cases:
- Scheduled maintenance
- New feature launches
- Season announcements
- Partnership announcements

---

## EVENT-WIDE BROADCAST

Triggered by: Big Ace or artist (artist's own events only)

What it does:
- Julius delivers message in-venue
- Appears in chat feed as [PLATFORM MESSAGE]
- Crowd reacts appropriately

Use cases:
- Show delay announcement
- Technical issue in an event
- Special guest announcement
- Winner callout across all venues

---

# PLATFORM_INTEGRITY_ENGINE.md
## The Rules That Keep the Platform Trustworthy

---

## WHAT PLATFORM INTEGRITY COVERS

1. No pay-to-win discovery (paid artists cannot buy rank)
2. No fake engagement counting toward rank
3. No hidden fees for artists
4. No data sold to third parties
5. Transparent revenue split (always visible to artist)
6. Algorithmic fairness (no permanent suppression)
7. Promo codes are honest (no fake "limited time" tricks)
8. Anti-fraud protects artists, not just the platform

---

## TRANSPARENCY RULES

Artists can always see:
- Their exact revenue split percentage
- What platform fee is taken
- What each fee covers
- Their rank calculation inputs

Fans can always see:
- What their data is used for
- How discovery is ordered
- That TMI products are ad-free (no advertiser influence on recommendations)

---

## CREATOR PROTECTION

- Platform cannot remove an artist's account without documented violation
- Artist owns their music content (TMI is the venue, not the label)
- Artist can export their fan email list (opted-in fans only)
- Artist can export their analytics data
- 30-day notice before any policy change affecting earnings

---

# WAITLIST_AND_QUEUE_SYSTEM.md
## When Events and Venues Fill Up

---

## EVENT FULL STATE

When a venue reaches capacity:

1. Venue is marked full
2. New joiners see: "This venue is full — joining overflow"
3. Overflow venue assigned automatically (same stream, different venue shell)
4. Overflow venue is 1 tier lower (Diamond event → Gold overflow venue)
5. User can join the waitlist for original venue (if someone leaves)

---

## WAITLIST FLOW

```
Fan tries to enter full venue
    ↓
[Join Waitlist] or [Enter Overflow]
    ↓ waitlist chosen
Fan placed in queue (position shown)
    ↓
If space opens:
    Fan notified (push + Julius in overflow)
    30 second window to claim seat
    If not claimed: next in queue

If event ends before space opens:
    Fan credited with attendance points (partial)
```

---

## OVERFLOW VENUE RULES

- Same stream as original
- Same artist/show
- Full crowd experience in overflow tier
- Overflow venue shown clearly (not hidden)
- "You are in overflow — original venue is at capacity"

---

*Danika's Law + Sponsor Portal + Emergency + Platform Integrity + Waitlist v1.0*
*BerntoutGlobal XXL*
