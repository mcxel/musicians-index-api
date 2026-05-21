# PACK29_BOT_AUTOMATION_BOUNDARIES.md
## What Each Bot Can Do — Hard Rules for Automation vs Human Approval
### BerntoutGlobal XXL / The Musician's Index

---

## BOT REGISTRY — MONETIZATION BOTS

### prospect-scout-bot
```
Purpose: Finds potential advertisers and sponsors
Can do autonomously:
  - Search social/web for music brands, gear companies, venues, local businesses
  - Score prospects by likely budget and platform fit
  - Create SalesCRMEntry with status DISCOVERED
  - Add first SalesNote with discovery context
Cannot do:
  - Contact any prospect directly (outreach-bot does that)
  - Create any financial commitments
  - Access any user personal data
Trigger: Daily cron at 9:00 AM UTC
Output: Max 20 new leads per day
Human override: Big Ace can blacklist companies, pause bot, review queue
```

### outreach-bot
```
Purpose: Sends initial contact to discovered leads
Can do autonomously:
  - Send first contact email using APPROVED_TEMPLATE_v1 (never freelance copy)
  - Update lead status DISCOVERED → CONTACTED
  - Set nextFollowUpAt = +3 days
  - Send up to 3 follow-up messages (days 3, 7, 14)
  - Add SalesNote for each touchpoint
Cannot do:
  - Deviate from approved message templates
  - Make any pricing commitments
  - Answer complex questions (flags for human review)
  - Send more than 3 follow-ups without human review
Template approval: Big Ace must approve any new message templates
Rate limit: Max 50 outreaches per day across all bots
```

### proposal-bot
```
Purpose: Generates and sends campaign proposals
Can do autonomously:
  - Match qualified lead to best package tier
  - Generate proposal using PROPOSAL_TEMPLATE_v1
  - Apply standard discount: 0% (default), up to 5% for volume, up to 10% for renewals
  - Reserve slots tentatively (24h hold)
  - Send proposal via email
  - Update lead status → PROPOSAL_SENT
Cannot do:
  - Discount > 10% (requires human approval)
  - Add custom legal terms (requires Big Ace)
  - Modify standard package terms
  - Create exclusivity clauses
  - Send proposals to blacklisted companies/categories
Approval gate: If discountPct > 10 OR customTerms present → create DRAFT, notify Big Ace
```

### ad-placement-bot
```
Purpose: Fills open ad inventory slots
Can do autonomously:
  - Assign confirmed creatives to available slots
  - Rotate inventory by campaign rules
  - Prefer higher-performing creatives (CTR learning)
  - Apply geo/genre targeting rules
  - Log impressions
Cannot do:
  - Override reserved slots
  - Place ads in kid-safe surfaces
  - Place competitor brands adjacent to each other
  - Change pricing for any slot
Hard rules:
  - No adult content, gambling, tobacco (enforced by brand-safety check)
  - No two competitor ads adjacent in same viewport
  - Max 1 ad per 2 editorial content cards on homepage
```

### brand-safety-bot
```
Purpose: Prevents harmful or conflicting ad placements
Can do autonomously:
  - Scan creative image/video using content classification
  - Block BLOCKED_CATEGORY placements
  - Flag competitor adjacency conflicts
  - Auto-pause campaigns with flagged content
  - Alert Big Ace to manual review queue
Cannot do:
  - Permanently ban an advertiser (human decision)
  - Override Big Ace manual approvals
  - Make category determinations for edge cases (sends to human queue)
Response time: < 5 seconds for new creative scan
False positive rate: If flagged by bot + cleared by human 3 times → remove from auto-scan
```

### renewal-bot
```
Purpose: Handles campaign renewals proactively
Can do autonomously:
  - Detect campaigns within 7 days of end
  - Send renewal offer email (using RENEWAL_TEMPLATE_v1)
  - Offer same terms as active campaign
  - Offer 5% loyalty discount for 3rd+ renewal
  - Reserve same slots tentatively if advertiser clicks Accept
Cannot do:
  - Apply discounts > 10%
  - Change slot selections without advertiser approval
  - Renew automatically without advertiser action
```

### house-ad-fallback-bot
```
Purpose: Fills empty inventory with internal promotions
Can do autonomously:
  - Detect unfilled slots before each page render
  - Select from HouseAd table by priority + surface compatibility
  - Rotate house ads (no same ad twice in same viewport)
  - Never show empty ad container
Cannot do:
  - Create new house ads (admin creates)
  - Override reserved slots
  - Show house ads on kid-safe surfaces (those collapse gracefully)
```

### cover-generator-bot
```
Purpose: Assembles weekly TMI magazine cover
Can do autonomously:
  - Pull top 9 artists from current week's cypher rankings
  - Position crown holder at center position 1
  - Generate cover grid layout
  - Update /api/home/cover endpoint
  - Publish new cover at Sunday midnight UTC
Cannot do:
  - Override crown winner
  - Choose cover artists outside ranking algorithm
  - Change cover design templates
  - Remove Diamond artists (Marcel, BJ) from placement eligibility
Trigger: Sunday midnight UTC cron
```

---

## HARD AUTOMATION LIMITS (SYSTEM-WIDE)

```
MAX outreach messages per lead: 3 (before human review required)
MAX tentative reservations per bot action: 5 per hour
MAX proposal discount without human: 10%
MAX campaign value bot can commit without human: $99.99/week
ANY value above $99.99/week → send to Big Ace approval queue
ANY custom legal terms → STOP, require Big Ace review
ANY exclusivity clause → STOP, require Big Ace signature
ANY sensitive brand category (gambling, tobacco, adult, payday loans) → REJECT immediately
```
