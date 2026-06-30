# Revenue-First Execution Order (LOCKED 2026-06-25)

**Authority**: Build Director (Marcel Dickens)  
**Priority**: Revenue generation is the top business objective  
**Timeline**: 8 weeks to soft launch with active revenue flow  
**Principle**: Start collecting money on Week 2, not Week 8

---

## Why Revenue First

Without revenue verification early:
- ❌ You don't know if your monetization model actually works until launch
- ❌ Payment processing bugs discovered at scale cause revenue loss
- ❌ Webhook failures silently miss payments
- ❌ Tax compliance issues emerge too late
- ❌ Settlement delays damage creator trust

**With revenue verification in Week 2**:
- ✅ Payment pipeline verified before scale
- ✅ Bugs found and fixed early
- ✅ Webhooks tested under load
- ✅ Tax handling confirmed correct
- ✅ Stripe integration production-ready
- ✅ Test payments flowing by Week 2, real payments by Week 3

---

## The Reordered Priority (Revenue First)

### PHASE 0: VERIFY FOUNDATION (Week 1 — 1 week)

**What**: Confirm all critical infrastructure exists and is production-ready

**Tasks**:
- [ ] Authentication: Verify production-ready (sign up, login, session, logout all work)
- [ ] Database: Verify schema exists, migrations work, no data loss
- [ ] Stripe account: Verify created, test keys configured, webhook URLs configured
- [ ] Email: Verify email provider wired (receipts, notifications)
- [ ] API structure: Verify basic endpoints exist and return data
- [ ] Build system: Verify `pnpm build` succeeds, no errors
- [ ] Deployment: Verify staging environment accessible

**Owner**: Claude + Blackbox (verification audit)

**Success Criteria**:
- ✅ All critical systems verified to exist and work
- ✅ Production dependencies confirmed

**Deliverable**: "Infrastructure Verification Report"

---

### PHASE 1: REVENUE PIPELINE (Week 2 — 1 week)

**What**: Get money flowing end-to-end through the platform

**Revenue items (in priority order)**:

1. **Stripe Production Wiring** (CRITICAL)
   - [ ] Charge creation API wired
   - [ ] Webhook endpoint created and tested
   - [ ] Charge status tracking working
   - [ ] Refund API wired
   - [ ] Receipt generation working
   - [ ] Test transactions succeeding
   - **Owner**: Claude
   - **ETA**: Day 1-2 of Week 2

2. **Membership Subscriptions** (CRITICAL)
   - [ ] Tier system implemented (FREE → DIAMOND)
   - [ ] Subscription creation working
   - [ ] Recurring billing working
   - [ ] Tier upgrade/downgrade working
   - [ ] Cancellation working
   - [ ] Billing dashboard showing revenue
   - **Owner**: Claude
   - **ETA**: Day 2-3 of Week 2

3. **Tips** (CRITICAL)
   - [ ] Tip payment flow working
   - [ ] Performer receives funds
   - [ ] Tipper sees confirmation
   - [ ] Real-time revenue update working
   - **Owner**: Claude
   - **ETA**: Day 3-4 of Week 2

4. **Tax Compliance** (CRITICAL)
   - [ ] Tax calculation correct
   - [ ] 1099 tracking working
   - [ ] Withholding calculated correctly
   - [ ] Tax forms can be generated
   - **Owner**: Claude
   - **ETA**: Day 4-5 of Week 2

5. **Settlement Pipeline** (CRITICAL)
   - [ ] Payouts scheduled daily/weekly/monthly
   - [ ] Performers can see pending/completed payouts
   - [ ] Settlement records audit-able
   - **Owner**: Claude
   - **ETA**: Day 5 of Week 2

**Success Criteria**:
- ✅ Full payment loop: Tipper → Stripe → Platform → Performer bank account
- ✅ Revenue showing in dashboard (real, not mocked)
- ✅ Tax and settlement working
- ✅ Webhooks reliable and tested
- ✅ All revenue flows confirmed working

**Deliverable**: "Revenue Pipeline Verification Report" + live test transactions

---

### PHASE 2: CRITICAL USER FLOWS (Week 3 — 1 week)

**What**: Get the 11 critical-path items to working state

**Focus**:
1. Live Session Chain (GO LIVE → all 15 surfaces)
2. Notifications (followers alerted)
3. Onboarding (<5 minutes signup to live)
4. Homepage (navigation visible)
5. Performer Profile (revenue display visible)
6. Fan Profile (support history visible)

**Owner**: Claude + Copilot (parallel)

**ETA**: Week 3

---

### PHASE 3: EXPERIENCE & COMPLETENESS (Week 4-5)

**What**: Make the platform feel complete and professional

**Focus**:
- CRM modules (Identity visible on all profiles)
- Admin dashboard (Marcel can see all operations)
- Chat (communication working)
- Discovery (content is findable)
- Mobile responsiveness (basic responsive design)

**Owner**: Copilot (UI) + Claude (wiring)

**ETA**: Week 4-5

---

### PHASE 4: RUNTIME REALISM (Week 6-7)

**What**: Make the platform feel alive

**Focus**:
- Avatar runtime (avatars can be created, customized)
- Audience humanity (subtle movements, not frozen)
- Venue life (staff visible, operational feel)
- Broadcasting realism (cameras, lights, production feel)

**Owner**: Claude (runtime) + Copilot (visual)

**ETA**: Week 6-7

---

### PHASE 5: CERTIFICATION & LAUNCH (Week 8+)

**What**: Verify everything works and launch

**Focus**:
- Layer 1: Engineering certification (technical correctness)
- Layer 2: Experience certification (feels premium)
- Production deployment
- Monitoring/alerting
- Soft launch approval

**Owner**: Blackbox (testing) + Build Director (approval)

**ETA**: Week 8

---

## Why This Order Works

```
Week 1: Verify infrastructure exists
  ↓ (Low risk: verification only, no new build)
  
Week 2: Revenue working (money flows)
  ↓ (High impact: confirms monetization works)
  
Week 3: Critical user flows working
  ↓ (Essential: platform is usable)
  
Week 4-5: Experience complete
  ↓ (Quality: platform feels professional)
  
Week 6-7: Runtime realism
  ↓ (Delight: platform feels alive)
  
Week 8+: Verify and launch
  ↓ (Confidence: everything certified)
```

**Result**: By Week 3, you have a working revenue-generating platform. Weeks 4-8 are improvements, not blockers.

---

## What's Different from Original Roadmap

| Original | Revised |
|----------|---------|
| Phase 1: Live Session Chain (Week 1-2) | Phase 0: Verify Foundation (Week 1) |
| Phase 2: CRM Ecosystem (Week 3-5) | Phase 1: Revenue Pipeline (Week 2) |
| Phase 3: Business Layer (Week 5-6) | Phase 2: Critical Flows (Week 3) |
| ... (other phases) | Phase 3-5: Experience/Realism (Week 4-8) |

**Key change**: Revenue verification moves from implied-late (in Business Layer) to explicit-early (Week 2).

---

## Critical Path (11 Blocking Items)

These must be 🟢 (complete) before launch:

1. ✅ Authentication (Week 1)
2. ✅ Stripe integration (Week 2)
3. ✅ Memberships (Week 2)
4. ✅ Tips (Week 2)
5. ✅ Live Session Chain (Week 3)
6. ✅ GO LIVE button (Week 3)
7. ✅ Notifications (Week 3)
8. ✅ Onboarding (Week 3)
9. ✅ Homepage 1-5 (Week 3)
10. ✅ Performer Profile (Week 3)
11. ✅ Fan Profile (Week 3)

Everything else is post-launch.

---

## Post-Launch Deferral (Not Blockers)

These can ship after soft launch:

- Mobile native app (web works first)
- Complete CRM (identity + revenue modules only)
- Avatar realism (static OK)
- Audience humanity (seated audience OK)
- Venue life (basic rendering OK)
- Advanced analytics (basic metrics OK)
- Bookings/tickets/merch (optional for launch)
- Sponsorships (optional for launch)

---

## Success Metrics by Week

**Week 1**: Infrastructure verified ✅  
**Week 2**: First test payment processed ✅  
**Week 3**: Platform is revenue-generating ✅  
**Week 4-5**: Platform feels professional ✅  
**Week 6-7**: Platform feels alive ✅  
**Week 8+**: Everything certified, soft launch approved ✅

---

## Locked

This revenue-first ordering is THE execution sequence.

Verify Week 1.
Revenue flows Week 2.
Critical paths complete Week 3.
Experience improves Weeks 4-7.
Launch Week 8+.

This is how you ship a revenue-generating platform in 8 weeks.
