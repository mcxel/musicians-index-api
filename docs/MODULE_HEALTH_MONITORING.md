# Module Health Monitoring

## Overview
Module Health Monitoring provides Phase 10 detection inputs for self-healing classification, verification, rollback decisions, and escalation.

## Severity Policy Integration
Observed health incidents must map to:
- **Low**: reversible auto-fix allowed.
- **Medium**: recommend-and-wait.
- **High**: approval required.
- **Critical**: safe-mode + authorization.

## Purpose
- Track health status of critical modules
- Detect degradation before cascade failures
- Feed incident severity classification
- Support governance-safe recovery decisions

## Responsibilities

### Health Signal Collection
- Uptime/availability snapshots
- Error-rate signals by module
- Response-time degradation signals
- Queue and route integrity signals
- Drift and compliance signal ingestion

### Classification Support
- Produce normalized health evidence for classifier
- Correlate repeated failures and blast radius
- Flag approval-required or safe-mode candidates

### Escalation Support
- Trigger escalation path resolution by severity
- Notify authorization workflow for High/Critical incidents
- Preserve evidence for audit and review

## Inputs
- Module health snapshots
- Failure-type registry mappings
- Drift detection signals
- Verification and rollback outcomes

## Outputs
- Health status records
- Severity-ready incident payloads
- Escalation events
- Audit-compatible evidence entries

## Status Levels
| Status | Description |
|--------|-------------|
| healthy | Metrics within accepted baseline |
| degraded | Elevated risk; classify and monitor |
| unhealthy | Active failure condition |
| unknown | Insufficient data, treat cautiously |

## Governance Notes
- Monitoring does not bypass authorization policy.
- Monitoring does not execute irreversible fixes.
- Critical classification requires safe-mode + authorization before major intervention.
