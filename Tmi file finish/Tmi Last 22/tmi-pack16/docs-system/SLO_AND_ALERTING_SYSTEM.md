# SLO_AND_ALERTING_SYSTEM.md
## Service Level Objectives and Alert Chain
Homepage (/,/live,/editorial): 99.9% uptime | <2.5s load | alert if >3s for 5min
API (core): 99.5% | <200ms | alert if >500ms for 2min
Live room join: 99% | <1s | alert if >2s for 1min
Stream & Win audio: 99% | <500ms | alert if failure for 30s
Crown API: 99.9% | <200ms | alert on ANY failure
Auth (login/session): 99.9% | <1s | alert on ANY failure
Database queries: 99.5% | <100ms | alert if >300ms for 2min
Bot runs: 99% | per schedule | alert if missed by >5min
Escalation: P0=Big Ace <5min | P1=Big Ace+Framework <15min | P2=Framework <30min
  P3=auto-heal first <1hour | P4=log only
