# Design Drift Detection

## Overview
Design Drift Detection identifies visual and behavioral deviations that can trigger Phase 10 incident classification and governed remediation.

## Severity Policy Integration
- **Low**: reversible auto-fix allowed for minor drift.
- **Medium**: recommend-and-wait for uncertain impact drift.
- **High**: approval required for brand/policy-sensitive correction.
- **Critical**: safe-mode + authorization for severe trust or safety impact.

## Purpose
- Detect component-level drift from design baselines
- Prevent accumulated drift from becoming systemic failure
- Support reversible low-risk repair actions
- Escalate contract/brand-sensitive deviations appropriately

## Detection Scope
- Design token drift
- Layout and spacing drift
- Component behavior drift
- Interaction and state-transition drift
- Sponsor/brand compliance drift

## Inputs
- Design token registries
- Component/layout registries
- Visual diff and manual review signals
- User-reported consistency incidents

## Outputs
- Drift incident records
- Severity classification recommendations
- Escalation recommendations for approval-gated fixes
- Verification evidence after drift repair

## Drift Response Rules
- Minor cosmetic drift: reversible auto-fix permitted.
- Moderate drift with uncertain side effects: recommend-and-wait.
- Contract-sensitive or policy-sensitive drift: approval required.
- Severe/systemic drift threatening trust/safety: safe-mode + authorization.

## Governance Notes
- Drift detection does not authorize major redesign changes.
- Irreversible or high-risk design corrections require explicit approval.
- All drift fixes and rollbacks must be logged for auditability.
