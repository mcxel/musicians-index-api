# Phase 0 Execution TODO (Locked)

## 0) Core proofs already done
- [x] API health responds on `/api/healthz` (200)
- [x] Smoke target aligned to API runtime shape (`scripts/healthcheck-api.js` default fixed)

## 1) Event Foundation Proofs (must pass before Phase 0 complete)
- [ ] Publish -> queue job created -> consumer processed proof with event id/type logs
- [ ] Real handler side effect proof (state change, not log only)
- [ ] Forced failure proof (retry + backoff + failed-job visibility)
- [ ] Redis outage/degradation proof (safe behavior + explicit logs)
- [ ] Operator visibility proof (recent events, failed jobs, queue health)
- [ ] Endpoint-level curl checks for event flow paths (happy/error/edge)
- [ ] Basic web smoke sanity alignment

## 2) Polls Completion Chain (required now, not later)
- [ ] Add poll events to event model:
  - [ ] `poll.created`
  - [ ] `poll.started`
  - [ ] `poll.voted`
  - [ ] `poll.closed`
  - [ ] `poll.result.published`
- [ ] Poll data model + API + room integration + points hooks
- [ ] Operator/admin poll visibility + moderation
- [ ] Poll pages/components wiring

## 3) Trivia Completion Chain (required now, not later)
- [ ] Add trivia events to event model:
  - [ ] `trivia.game.created`
  - [ ] `trivia.round.started`
  - [ ] `trivia.question.asked`
  - [ ] `trivia.answer.submitted`
  - [ ] `trivia.round.closed`
  - [ ] `trivia.winner.declared`
- [ ] Trivia content/game schema + host/audience flow + scoring
- [ ] Trivia points/achievements + sponsor hooks
- [ ] Trivia admin/operator visibility + pages/components

## 4) Julius Completion Chain (required now, not later)
- [ ] Add Julius events to event model:
  - [ ] `julius.prompt.shown`
  - [ ] `julius.announcement.sent`
  - [ ] `julius.mode.changed`
  - [ ] `julius.guidance.completed`
- [ ] Julius runtime modes + interaction engine + room integration
- [ ] Julius hooks for polls/trivia/rewards/sponsors
- [ ] Julius operator/admin controls + visibility

## 5) Final label rule (must remain until all proofs pass)
- [ ] Keep status:
  - `Phase 0: build/runtime passed; resilience and observability testing in progress`
- [ ] Do not mark Phase 0 complete until all above checkboxes are proven with evidence logs
