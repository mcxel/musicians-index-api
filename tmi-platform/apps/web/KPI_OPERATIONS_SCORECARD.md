# KPI OPERATIONS SCORECARD (SOFT LAUNCH)

## PURPOSE
Track operational truth during soft launch:
- onboarding health
- creator activation
- engagement
- monetization
- retention
- runtime stability

## LOCKED MODE
- No expansion engineering.
- No new proof-gate systems.
- Measure live behavior and iterate surgically.

---

## A) CORE TRIANGLE KPIs (PRIMARY)

### 1. Registration Completion Rate
**Definition:** % of signup starts that complete account creation.

**Formula:**  
`registration_completion_rate = completed_registrations / registration_starts`

**Targets:**
- Green: >= 65%
- Yellow: 45%–64%
- Red: < 45%

**Cadence:** Daily

### 2. Beat Upload Attempt Rate
**Definition:** Number of upload attempts per active creator per day.

**Formula:**  
`beat_upload_attempt_rate = beat_upload_attempts / active_creators`

**Targets:**
- Green: >= 1.2
- Yellow: 0.7–1.19
- Red: < 0.7

**Cadence:** Daily

### 3. Room Join Event Volume
**Definition:** Total room joins across live sessions.

**Formula:**  
`room_join_volume = sum(room_join_events)`

**Targets:**
- Green: rising 3-day trend
- Yellow: flat trend
- Red: declining trend 3+ days

**Cadence:** Daily + event-night review

---

## B) ACTIVATION KPIs

### 4. Creator Activation Rate
**Definition:** % of new creators who complete at least one core action (upload or stream) within 24h.

**Formula:**  
`creator_activation_rate = activated_creators_24h / new_creators`

**Targets:**
- Green: >= 55%
- Yellow: 35%–54%
- Red: < 35%

### 5. Stream Start Success Rate
**Definition:** % of stream start attempts that become active sessions.

**Formula:**  
`stream_start_success_rate = successful_stream_starts / stream_start_attempts`

**Targets:**
- Green: >= 95%
- Yellow: 88%–94%
- Red: < 88%

---

## C) MONETIZATION KPIs

### 6. Tip Conversion Rate
**Definition:** % of live sessions with at least one tip event.

**Formula:**  
`tip_conversion_rate = tipped_sessions / total_live_sessions`

**Targets:**
- Green: >= 20%
- Yellow: 10%–19%
- Red: < 10%

### 7. Ticket Checkout Conversion
**Definition:** % of ticket checkout starts that complete payment.

**Formula:**  
`ticket_checkout_conversion = completed_ticket_checkouts / ticket_checkout_starts`

**Targets:**
- Green: >= 45%
- Yellow: 30%–44%
- Red: < 30%

### 8. Diamond Upgrade Activation
**Definition:** Number of Diamond activations per week.

**Formula:**  
`diamond_weekly_activations = count(diamond_upgrades)`

**Targets:**
- Green: >= 5/week (early phase)
- Yellow: 2–4/week
- Red: < 2/week

### 9. Sponsor Activation Count
**Definition:** Number of sponsor accounts with at least one active campaign.

**Formula:**  
`sponsor_activation_count = sponsors_with_active_campaign`

**Targets:**
- Green: rising week-over-week
- Yellow: flat
- Red: falling

---

## D) RETENTION KPIs

### 10. D1 Retention
**Definition:** % of new users returning the next day.

**Formula:**  
`D1 = users_returned_day_1 / users_new_day_0`

**Targets:**
- Green: >= 28%
- Yellow: 18%–27%
- Red: < 18%

### 11. D7 Retention
**Definition:** % of new users active again on day 7.

**Formula:**  
`D7 = users_returned_day_7 / users_new_day_0`

**Targets:**
- Green: >= 14%
- Yellow: 8%–13%
- Red: < 8%

### 12. Repeat Session Rate
**Definition:** % of users with 2+ sessions in 7 days.

**Formula:**  
`repeat_session_rate = users_2plus_sessions_7d / active_users_7d`

**Targets:**
- Green: >= 35%
- Yellow: 22%–34%
- Red: < 22%

---

## E) RUNTIME HEALTH KPIs

### 13. Critical Flow Error Rate
**Definition:** Error rate across signup/upload/stream/tip/ticket flows.

**Formula:**  
`critical_flow_error_rate = critical_errors / critical_flow_attempts`

**Targets:**
- Green: < 1.5%
- Yellow: 1.5%–3%
- Red: > 3%

### 14. Incident Recovery Time (MTTR)
**Definition:** Median time to recover from launch-impacting incidents.

**Formula:**  
`MTTR = median(incident_recovery_minutes)`

**Targets:**
- Green: <= 15 min
- Yellow: 16–30 min
- Red: > 30 min

### 15. Event-Night Survivability
**Definition:** % of live events completed without launch-blocking outage.

**Formula:**  
`event_survivability = successful_events / total_events`

**Targets:**
- Green: >= 98%
- Yellow: 95%–97%
- Red: < 95%

---

## SCORECARD TEMPLATE (DAILY)

| KPI | Current | 3-Day Trend | Status (G/Y/R) | Owner | Action |
|---|---:|---|---|---|---|
| Registration Completion |  |  |  | Growth Ops |  |
| Beat Upload Attempt Rate |  |  |  | Creator Ops |  |
| Room Join Volume |  |  |  | Community Ops |  |
| Creator Activation |  |  |  | Creator Ops |  |
| Stream Start Success |  |  |  | Platform Ops |  |
| Tip Conversion |  |  |  | Revenue Ops |  |
| Ticket Checkout Conversion |  |  |  | Revenue Ops |  |
| Diamond Activations |  |  |  | Growth Ops |  |
| Sponsor Activation Count |  |  |  | Sponsor Ops |  |
| D1 Retention |  |  |  | Lifecycle Ops |  |
| D7 Retention |  |  |  | Lifecycle Ops |  |
| Repeat Session Rate |  |  |  | Community Ops |  |
| Critical Flow Error Rate |  |  |  | Platform Ops |  |
| MTTR |  |  |  | Platform Ops |  |
| Event Survivability |  |  |  | Platform Ops |  |

---

## OPERATIONAL DECISION RULES
- If any **core triangle KPI** is red for 2 consecutive days:
  - freeze non-critical work
  - execute focused root-cause fix cycle
- If monetization KPIs are flat 5+ days:
  - run creator/sponsor campaign push
  - test offer/placement/message improvements
- If retention KPIs remain red 7 days:
  - prioritize onboarding and first-session friction fixes before any polish work

---

## NORTH STAR (SOFT LAUNCH WINDOW)
Real users doing real flows with growing repeat activity and measurable revenue signals.
