# Launch Blocker Dashboard (LOCKED 2026-06-25)

**Authority**: Build Director (Marcel Dickens)  
**Purpose**: Single source of truth for issues blocking soft launch  
**Update Frequency**: Daily (updated at end of each day)  
**Audience**: All stakeholders

---

## What This Is

Instead of a 50-item roadmap, keep ONE focused list: **What stops us from launching?**

Everything on this dashboard:
- ✅ Blocks launch, OR
- ✅ Is a known workaround, OR
- ✅ Is explicitly deferred to post-launch

Everything NOT on this dashboard is "nice to have" and doesn't affect launch.

---

## The Dashboard (LIVE)

| Component | Status | Blocker | Owner | ETA | Notes |
|-----------|--------|---------|-------|-----|-------|
| **AUTHENTICATION** | 🟡 | YES | Claude | Week 2 | Verify production-ready |
| **STRIPE INTEGRATION** | 🔴 | YES | Claude | Week 2 | Critical path: revenue depends on this |
| **MEMBERSHIPS** | 🔴 | YES | Claude | Week 3 | FREE→PRO→RUBY→... tier system |
| **TIPS** | 🔴 | YES | Claude | Week 3 | Real-time performer payments |
| **LIVE SESSION CHAIN** | 🟡 | YES | Claude | Week 2 | GO LIVE → all 15 surfaces |
| **GO LIVE BUTTON** | 🟡 | YES | Copilot | Week 1 | UI must exist and work |
| **NOTIFICATIONS** | 🟡 | YES | Claude | Week 3 | Followers alerted when performer goes live |
| **HOMEPAGE (1-5)** | 🟡 | YES | Copilot | Week 3 | Core navigation visible |
| **PERFORMER PROFILE** | 🟡 | YES | Copilot | Week 3 | CRM readable form |
| **FAN PROFILE** | 🟡 | YES | Copilot | Week 3 | CRM readable form |
| **ONBOARDING** | 🟡 | YES | Copilot | Week 2 | Signup → live room in <5 min |
| **MOBILE (MVP)** | 🟡 | NO* | Copilot | Week 6 | Post-soft-launch OK if web works |
| **CHAT** | 🟢 | NO | Claude | Week 4 | Works but not launch-critical |
| **AVATAR RUNTIME** | 🟡 | NO | Claude | Week 6 | Improves experience but doesn't block |
| **MEMORY WALL** | 🟡 | NO | Claude | Week 5 | Nice to have |
| **CRM (Complete)** | 🟡 | PARTIAL | Claude | Week 5 | Identity + Revenue modules only |
| **ADMIN DASHBOARD** | 🟢 | NO | Copilot | Week 4 | Basic version OK |
| **ANALYTICS** | 🟡 | NO | Claude | Week 6 | BI dashboard nice but not critical |
| **SEARCH** | 🟢 | NO | Claude | Week 4 | Discovery works without it |
| **DISCOVERY RAIL** | 🟡 | NO | Claude | Week 3 | Improves but not critical |
| **AUDIENCE HUMANITY** | 🟡 | NO | Claude | Week 6 | Improves feel but doesn't block |
| **VENUE LIFE** | 🟡 | NO | Claude | Week 7 | Polish work |
| **VENUES** | 🟢 | NO | Claude | Week 4 | Basic venue functionality |
| **BOOKINGS** | 🟡 | NO | Claude | Week 5 | Nice to have |
| **TICKETS** | 🟡 | NO | Claude | Week 5 | Nice to have |
| **MERCHANDISE** | 🟡 | NO | Claude | Week 5 | Nice to have |
| **SPONSORSHIPS** | 🟡 | NO | Claude | Week 5 | Nice to have |
| **MODERATION** | 🟡 | NO | Claude | Week 4 | Basic safety OK |
| **MOBILE NATIVE APP** | 🔴 | NO** | Copilot | Post-launch | Web-first for launch |

---

## Status Legend

| Status | Meaning |
|--------|---------|
| 🔴 | Broken / Missing / Critical path |
| 🟡 | In progress / Partially complete |
| 🟢 | Complete / Production-ready |

---

## Blocker Legend

| Status | Meaning |
|--------|---------|
| YES | Blocks soft launch |
| PARTIAL | Partially blocks (some features required, not all) |
| NO* | Not required but would improve launch |
| NO** | Deliberately deferred to post-launch |

---

## Critical Path (Must Complete Before Launch)

These must be **🟢 (Complete)** before soft launch:

1. ✅ Authentication (verify production-ready)
2. ✅ Stripe integration (verify webhook handling)
3. ✅ Memberships (tier system working)
4. ✅ Tips (performer payments flowing)
5. ✅ Live Session Chain (GO LIVE → all destinations)
6. ✅ GO LIVE button (UI working)
7. ✅ Notifications (followers alerted)
8. ✅ Homepage 1-5 (navigation visible)
9. ✅ Performer Profile (readable, has revenue display)
10. ✅ Fan Profile (readable, has support history)
11. ✅ Onboarding (new user → live room in <5 min)

**11 items.** That's the entire launch blocker list. Everything else is "nice to have" or post-launch.

---

## Verification Checklist (Before Marking 🟢)

When moving an item from 🟡 to 🟢:

- [ ] Compiles without errors (`pnpm build` succeeds)
- [ ] Tests pass (if applicable)
- [ ] Uses real data (no mocks)
- [ ] Responsive on mobile + desktop
- [ ] Error handling works
- [ ] Production verification (if applicable — Stripe, auth, email, etc.)
- [ ] Build Director approves

---

## Daily Update Protocol

**Every day at 4pm**:

1. Claude: Updates runtime/blocker status
2. Copilot: Updates UI/blocker status
3. Blackbox: Reports any NEW blockers found
4. Build Director: Reviews and confirms
5. Dashboard published to team

**Example update**:

```
STRIPE INTEGRATION
Before: 🔴 "Broken / Missing"
After:  🟡 "Partially working / Webhooks need verification"
Blocker: YES (unchanged until 🟢)
Owner: Claude
ETA: Still Week 2
Notes: "Charge creation works. Webhook handling needs production verification."
```

---

## What Counts as "Verified Production Ready"

For items marked 🟢:

### Authentication
- [ ] Login works (email + password)
- [ ] Session persists across refreshes
- [ ] Logout clears session
- [ ] Protected routes return 401 when not authenticated
- [ ] Production database wired (not local/mock)

### Stripe
- [ ] Charges succeed with real credit cards (test mode)
- [ ] Webhooks receive and process events
- [ ] Refunds work
- [ ] Tax calculation correct
- [ ] Reconciliation report matches Stripe dashboard
- [ ] Production keys configured (ready for live mode after launch)

### Memberships
- [ ] Tiers exist (FREE → PRO → RUBY → SILVER → GOLD → PLATINUM → DIAMOND)
- [ ] Tier upgrade works
- [ ] Tier downgrade works
- [ ] Subscription renewal works
- [ ] Cancellation works
- [ ] Pricing is correct

### Tips
- [ ] Performer can receive tips
- [ ] Tip appears in performer's revenue dashboard
- [ ] Tipper sees confirmation
- [ ] Money flows to performer's Stripe account
- [ ] Real-time settlement confirmed

### Live Session Chain
- [ ] GO LIVE button triggers registry update
- [ ] All 15 destinations updated within 2 seconds
- [ ] No stale data visible
- [ ] Rooms disappear when stream ends
- [ ] Mobile, web, API all in sync

### Notifications
- [ ] Email notifications sent for key events
- [ ] Push notifications sent (if configured)
- [ ] In-app notifications appear immediately
- [ ] User can unsubscribe
- [ ] No double-notifications

### Onboarding
- [ ] Signup completes in <2 minutes
- [ ] Avatar creation is optional/fast
- [ ] User can join live room immediately
- [ ] First reaction sends without issues
- [ ] User understands what they just did

---

## What Happens When Status Changes

### When a blocker moves 🔴 → 🟡
- Owner: Provide ETA for 🟢
- Build Director: Prioritize if blocking critical path
- Team: Adjust timeline if needed

### When a blocker moves 🟡 → 🟢
- Owner: Provide verification checklist (passed)
- Build Director: Confirm production-ready
- Dashboard: Item is now verified for launch

### When a NEW blocker discovered
- Owner: Report immediately (don't wait for daily update)
- Build Director: Assess impact on launch
- Team: Adjust priorities if it blocks critical path

---

## Post-Launch Deferral

These are explicitly 🟢-or-better **not required** for soft launch:

- Mobile native app (web-first)
- Complete CRM (identity + revenue only)
- Avatar humanity (static avatars OK)
- Venue life (basic rendering OK)
- Audience realism (seated audience OK)
- Advanced analytics (basic metrics OK)
- Bookings/tickets/merch (can launch without)
- Sponsorships (can launch without)

**But** they WILL be required for Series A/B funding and long-term success. Plan for these in Week 8+ roadmap.

---

## Launch Gate (Week 8)

Launch is approved when:

- ✅ All 11 critical-path items are 🟢 (Complete)
- ✅ No 🔴 (Broken) items remain
- ✅ All verification checklists passed
- ✅ Build Director confirms readiness
- ✅ Production environment verified
- ✅ Monitoring/alerting configured
- ✅ Rollback plan documented

**If any blocker fails**, launch is deferred until fixed.

---

## The Benefit

### Before (Long Roadmap)
- 50+ items
- Not clear what blocks launch
- Team doesn't know what's critical
- Scope creep invisible until too late

### After (Blocker Dashboard)
- 11 items
- Crystal clear what blocks launch
- Team knows exactly what's critical
- Scope creep visible immediately

---

## Locked

This dashboard is THE launch readiness document.

Update it daily.

Everything on this list either blocks launch or explicitly doesn't.

When all critical-path items are 🟢, launch is approved.

Until then, focus only on items on this dashboard.

Everything else is post-launch work.
