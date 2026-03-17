# Failure Classification Matrix

## Purpose
Standardize Phase 10 incident classification so response behavior is deterministic and governance-safe.

## Severity Policy (Mandatory)
- **Low** → reversible auto-fix allowed.
- **Medium** → recommend-and-wait.
- **High** → approval required.
- **Critical** → safe-mode + authorization.

## Low Severity
Typical impact: cosmetic or localized service degradation with reversible mitigation.
Examples:
- Missing noncritical asset placeholder
- Mild layout distortion
- Noncritical widget overflow
- Temporary scene mismatch with fallback available

Action:
- Auto-fix allowed only if reversible
- Verification required post-fix
- Rollback on verification failure

## Medium Severity
Typical impact: user-experience or workflow disruption with uncertain downstream risk.
Examples:
- Queue instability
- Route intermittency
- Replay/share flow interruptions
- Performance degradation with potential spread

Action:
- Generate recommended fix plan
- Wait for operator/authority decision
- No autonomous major mutations

## High Severity
Typical impact: business, trust, legal, or policy-sensitive risk.
Examples:
- Payment/tip routing anomalies
- Moderation policy failures
- Fairness/scoring integrity issues
- Sponsor contract-sensitive exposure

Action:
- Approval required before fix execution
- Full change logging and rollback plan required

## Critical Severity
Typical impact: platform safety, privacy, authority control, or systemic stability risk.
Examples:
- Security/privacy breach indicators
- Financial logic corruption
- Authority-control failure
- Widespread instability with cascading impact

Action:
- Enter safe-mode immediately
- Require explicit authorization
- Execute only controlled, auditable intervention

## Detection Targets
- Broken module
- Dead route
- Stalled queue
- Missing/invalid assets
- Design drift signal breach
- Repeated error pattern
- Moderation/filter failure
- Performance collapse pattern
- Broken bot chain
