# Platform Feature Matrix (LOCKED 2026-06-25)

**Authority**: Build Director (Marcel Dickens)  
**Purpose**: Show which features exist on which role profiles  
**Update Frequency**: Weekly (every Friday)  
**Audience**: All teams, especially QA/certification

---

## What This Is

A matrix showing which features are implemented for which roles.

**Purpose**: Prevent accidentally building a feature for Performer but forgetting Fan.

**Question it answers**: "Does every role have all the features they need?"

---

## The Matrix

| Feature | Performer | Fan | Venue | Promoter | Writer | Sponsor | Admin | Notes |
|---------|:---------:|:---:|:-----:|:--------:|:------:|:-------:|:-----:|-------|
| **Identity** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Shared across all roles |
| **Avatar** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Shared across all roles |
| **Verification** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Shared across all roles |
| **XP/Rank** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Shared across all roles |
| **Membership Tier** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Shared across all roles |
| **Followers/Following** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Shared across all roles |
| **Activity Timeline** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Shared across all roles |
| **Live Status** | ✅ | ✅ | ✅ | △ | △ | △ | ✅ | Performers/venues typically live |
| **Notifications** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Shared across all roles |
| **Chat/Messaging** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Shared across all roles |
| **Inventory** | ✅ | ✅ | △ | △ | △ | △ | △ | Cosmetics for all, gear for some |
| **Memory Wall** | ✅ | ✅ | ✅ | △ | △ | △ | ✅ | Moments/captures for active roles |
| **Settings** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Shared across all roles |
| **AI Assistant** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Shared across all roles |
| **Revenue Dashboard** | ✅ | △ | ✅ | ✅ | △ | ✅ | ✅ | Monetization roles |
| **Analytics** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Deep BI for all |
| **Bookings** | ✅ | △ | ✅ | ✅ | △ | △ | ✅ | Service-oriented roles |
| **Music/Albums** | ✅ | △ | △ | △ | △ | △ | △ | Performer-centric |
| **Concert Calendar** | ✅ | △ | ✅ | △ | △ | △ | ✅ | Venues, promoters, performers |
| **Playlists** | ✅ | ✅ | △ | △ | △ | △ | △ | Music-focused roles |
| **Collections** | △ | ✅ | △ | △ | △ | △ | △ | Primarily for fans |
| **Support History** | △ | ✅ | △ | △ | △ | △ | △ | Primarily for fans |
| **Merchandise** | ✅ | △ | △ | △ | △ | △ | ✅ | Performer inventory, admin oversight |
| **Sponsorships** | ✅ | △ | △ | △ | △ | ✅ | ✅ | Sponsored roles + sponsors |
| **Contracts** | ✅ | △ | ✅ | ✅ | △ | ✅ | ✅ | Business-oriented roles |
| **Payouts** | ✅ | △ | ✅ | ✅ | △ | ✅ | ✅ | Revenue-receiving roles |
| **Editorial Workflow** | △ | △ | △ | △ | ✅ | △ | ✅ | Writers only |
| **Articles/Publishing** | △ | △ | △ | △ | ✅ | △ | ✅ | Writers + admin |
| **Campaign Manager** | △ | △ | △ | ✅ | △ | ✅ | ✅ | Promoters + sponsors |
| **Performer Roster** | △ | △ | △ | ✅ | △ | △ | ✅ | Promoters + admin |
| **Audience Analytics** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Deep BI for all |
| **Moderation Queue** | △ | △ | △ | △ | △ | △ | ✅ | Admin only |
| **System Health** | △ | △ | △ | △ | △ | △ | ✅ | Admin only |
| **User Management** | △ | △ | △ | △ | △ | △ | ✅ | Admin only |

---

## Legend

| Symbol | Meaning |
|--------|---------|
| ✅ | Full implementation (all features for this role) |
| △ | Partial (limited version or optional) |
| ❌ | Not applicable to this role |
| (blank) | Not implemented yet |

---

## How to Read This

**Question**: Does a Writer have access to Analytics?

**Answer**: 
- Row: Analytics
- Column: Writer
- Cell: ✅
- Result: YES, Writers have access to analytics for their articles

**Question**: Does a Promoter have Merchandise functionality?

**Answer**:
- Row: Merchandise
- Column: Promoter
- Cell: ❌
- Result: NO, promoters don't have merch (that's performer-centric)

**Question**: Does a Sponsor have Contracts?

**Answer**:
- Row: Contracts
- Column: Sponsor
- Cell: ✅
- Result: YES, sponsors have contract management for sponsorship deals

---

## Using This for QA

When testing a feature, use this matrix to ensure **all relevant roles are covered**:

**Test Case**: "Test Revenue Dashboard"
- Check matrix: Performer ✅, Fan △, Venue ✅, Promoter ✅, Writer △, Sponsor ✅, Admin ✅
- QA must test: Performer (full), Venue (full), Promoter (full), Sponsor (full), Admin (full)
- QA checks: Fan (partial) and Writer (partial) don't get features they shouldn't see

**Result**: No forgotten roles, complete test coverage

---

## Using This for Development

Before building a feature, check the matrix:

**New Feature**: "Community badges for active members"

**Check Matrix**:
- Should Performer see it? ✅ (encourages engagement)
- Should Fan see it? ✅ (motivates support)
- Should Venue see it? ✅ (marks regular users)
- Should Promoter see it? ✅ (shows active promoters)
- Should Writer see it? ✅ (marks frequent contributors)
- Should Sponsor see it? ✅ (shows commitment)
- Should Admin see it? ✅ (overview + assignment)

**Result**: Build once in Universal Profile Runtime, attach to all 7 roles

---

## Common Patterns

### Full Coverage (7/7)
All roles have this feature.

**Examples**: Identity, Avatar, Verification, XP, Notifications, Chat, Analytics

**Build**: Once in shared core, everyone uses it

### Revenue Roles (4/7)
Performer, Venue, Promoter, Sponsor, Admin get revenue features.

**Examples**: Revenue Dashboard, Bookings, Payouts, Contracts

**Build**: Revenue module in Universal Profile Runtime, attach to revenue roles only

### Engagement Roles (6/7)
Everyone except Admin (who oversees, not participates).

**Examples**: Live Status, Memory Wall, Collections

**Build**: Module in Universal Profile Runtime, attach to 6 roles

### Admin Only (1/7)
Admin has exclusive management features.

**Examples**: User Management, Moderation, System Health

**Build**: Separate admin section (not in role modules)

### Role-Specific (1/7)
One role has exclusive features.

**Examples**: Editorial Workflow (Writers), Concert Calendar (Performers)

**Build**: Role-specific module in performer/ or writer/ folder

---

## Weekly Update Process

**Every Friday**:

1. For each feature being shipped that week:
   - Verify it exists for ALL intended roles
   - Update matrix with ✅ or △
   - Mark any gaps with ❌ + note why

2. Example:

**Feature**: "Advanced Analytics Dashboard" shipping Week 6

```
Before:
Analytics | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Shipped

After:
Advanced Analytics | ✅ | △ | ✅ | ✅ | △ | ✅ | ✅ | Full BI for revenue roles; basic for others
```

---

## Launch Criteria

Before soft launch:

- ✅ Every row with ✅ has that cell filled for the intended roles
- ✅ No ❌ (missing features) in critical rows
- ✅ No forgotten roles (gaps in matrix coverage)
- ✅ Every feature documented for which roles it serves

**Example**:
- Notifications must work for all 7 roles ✅
- Revenue Dashboard doesn't need to work for Fan (△ is OK) ✅
- Moderation is Admin-only (all others blank) ✅

---

## What This Prevents

❌ **Building a feature only for Performers, forgetting Fans**
❌ **Having Analytics for some roles but not others**
❌ **Forgetting a role entirely (7th role gets left out)**
❌ **Inconsistent feature coverage across roles**
❌ **QA testing only half the roles**

---

## What This Enables

✅ **One glance shows complete feature coverage**
✅ **Prevents role gaps**
✅ **Clear testing strategy (test all relevant roles)**
✅ **Consistent user experience across roles**
✅ **Shared features built once, used everywhere**

---

## Locked

This matrix is updated every Friday.

It is the source of truth for feature distribution across roles.

Before shipping a feature, check the matrix.

Before testing a feature, check the matrix.

Before launching, audit the matrix.

This is how you ensure no role is left behind.
