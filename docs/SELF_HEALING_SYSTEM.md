# Self-Healing System

## Overview
The Self-Healing System provides scaffold-level governance for detecting failures, classifying severity, applying safe reversible recovery, verifying outcomes, rolling back failed fixes, and escalating when authorization is required.

## Phase 10 Severity Policy (Authoritative)
- **Low**: reversible auto-fix allowed.
- **Medium**: recommend-and-wait (no autonomous major change).
- **High**: approval required before fix execution.
- **Critical**: safe-mode activation + explicit authorization.

## Architecture

### 1) Detection Layer
- Monitors module health and incident signals
- Detects broken components, route failures, and performance degradation
- Watches for design drift and policy violations

### 2) Classification Layer
- Maps incidents to Low / Medium / High / Critical
- Applies business-risk and trust-impact weighting
- Determines whether auto-fix, recommendation, or approval flow is required

### 3) Recovery Layer
- Executes **only reversible low-risk actions** automatically
- Produces recommendation packets for Medium issues
- Blocks High/Critical execution until authorization is recorded

### 4) Verification Layer
- Runs post-fix checks
- Confirms issue resolution and no collateral regressions
- Signals rollback when verification fails

### 5) Rollback Layer
- Reverts failed or harmful fixes to known-good state
- Logs rollback reason and outcome
- Re-escalates if rollback is blocked or incomplete

### 6) Escalation Layer
- Routes incidents to authorization and oversight paths
- Requires Marcel or Big Ace authorization for major fixes
- Supports emergency safe-mode for Critical events

## Allowed Low-Risk Auto-Fix Examples
- Swap to backup layout or scene
- Disable a broken noncritical visual effect
- Restore default widget layout
- Reset a stuck nonfinancial room timer
- Apply safe fallback presentation mode

## Never Auto-Fix (Approval Required)
- Money movement or payout logic
- Fairness/scoring authority rules
- Moderator permission boundaries
- Privacy/security policy controls
- Contract-sensitive sponsor logic
- Irreversible architecture mutations

## Governance Alignment
- Aligned with autonomy-engine guardrails
- Enforced by Head Sentinel oversight path
- All fixes must be change-logged
- All autonomous fixes must be reversible
- Critical incidents must enter safe-mode prior to major intervention
