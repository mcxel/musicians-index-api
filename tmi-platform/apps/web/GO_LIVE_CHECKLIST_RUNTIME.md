# GO-LIVE CHECKLIST (RUNTIME OPERATIONS)

## PURPOSE
Controlled soft launch runbook for operational execution:
- activate users
- run live flows
- monitor runtime health
- respond fast to incidents
- preserve momentum

## LOCKED CONSTRAINTS
- No new engines
- No new audit suites
- No new proof-gate expansion
- No architecture reopening during go-live window

---

## 0) PRE-FLIGHT (T-2 HOURS)

### Accounts & Access
- [ ] Founder accounts verified
- [ ] Admin accounts verified (observatory access)
- [ ] First-wave creators verified
- [ ] First-wave sponsors verified
- [ ] Test fan account verified

### Critical Paths Smoke
- [ ] Registration completion (all primary personas)
- [ ] Beat upload attempt + success path
- [ ] Room join flow
- [ ] Livestream start path
- [ ] Tipping path
- [ ] Ticket checkout path
- [ ] Diamond activation path

### Monitoring Readiness
- [ ] Observatory dashboard open and staffed
- [ ] Incident log template prepared
- [ ] KPI tracker ready for live updates
- [ ] Escalation contacts available in one channel

---

## 1) GO-LIVE EXECUTION (T0 to T+4 HOURS)

### T0–T+30 min: Controlled Entry
- [ ] Activate founders + first creator cohort
- [ ] Observe registration completion behavior
- [ ] Confirm no launch-blocking errors

### T+30–T+90 min: Creator Action Wave
- [ ] Prompt beat uploads from creators
- [ ] Prompt first stream starts
- [ ] Confirm room join events are flowing
- [ ] Capture media evidence (screenshots/clips)

### T+90–T+180 min: Monetization Wave
- [ ] Trigger tipping prompts in active sessions
- [ ] Trigger ticket flow in one promoted event
- [ ] Confirm at least one Diamond upgrade attempt
- [ ] Begin sponsor visibility checks in live contexts

### T+180–T+240 min: Stability + Wrap
- [ ] Summarize incidents and outcomes
- [ ] Update KPI scorecard
- [ ] Publish go-live status note:
  - what worked
  - what broke
  - what gets fixed next cycle

---

## 2) INCIDENT RESPONSE PROTOCOL

### Severity Bands
- **SEV1:** launch-blocking (signup down, stream start down, checkout broken)
- **SEV2:** degraded but operable (high latency, intermittent failures)
- **SEV3:** minor UX or non-blocking defects

### Response Rules
- [ ] SEV1 -> immediate freeze on non-critical work
- [ ] SEV1 -> assign incident owner within 5 minutes
- [ ] SEV1 -> workaround or rollback decision within 15 minutes
- [ ] SEV2 -> queue fast patch in next micro-cycle
- [ ] SEV3 -> log and batch into scheduled polish cycle

### Communication
- [ ] Single incident channel for all updates
- [ ] Timestamp every status change
- [ ] Capture root cause + mitigation + follow-up owner

---

## 3) ROLLBACK / CONTAINMENT RULES

Rollback when any of these are true:
- [ ] Registration completion crashes below 30% during first 60 minutes
- [ ] Stream start success drops below 80% for 3 consecutive checks
- [ ] Checkout conversion collapses due to confirmed runtime fault
- [ ] Unrecoverable SEV1 persists beyond 30 minutes

Containment actions:
- [ ] Reduce cohort size (controlled traffic)
- [ ] Pause promotional pushes
- [ ] Restrict to proven-stable flows
- [ ] Resume expansion only after 2 consecutive stable checks

---

## 4) LIVE KPI SNAPSHOT (MINIMUM SET)

Track at 30-minute intervals:
- [ ] registration_completion_rate
- [ ] beat_upload_attempts
- [ ] room_join_events
- [ ] stream_start_success_rate
- [ ] tip_conversion_rate
- [ ] ticket_checkout_conversion
- [ ] critical_flow_error_rate

---

## 5) POST-GO-LIVE (T+24 HOURS)

- [ ] Publish 24h launch report
- [ ] Rank top 5 friction points
- [ ] Ship top 1–3 surgical fixes
- [ ] Update retention messaging for next cycle
- [ ] Re-brief creator and sponsor cohorts
- [ ] Confirm next event window

---

## 6) SUCCESS CONDITION

Go-live cycle is successful when:
- users register successfully,
- creators upload and stream,
- rooms show active joins,
- monetization events are observable,
- runtime incidents remain controlled/recoverable,
- and the next operational cycle is clearly scheduled.

---

## EXECUTION MANTRA
Operate the system. Observe real behavior. Improve only what users prove matters.
