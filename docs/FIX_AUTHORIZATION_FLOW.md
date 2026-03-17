# Fix Authorization Flow

## Purpose
Define approval-gated governance for Phase 10 self-healing so major or risky fixes cannot execute without explicit authority.

## Severity-to-Action Policy
- **Low**: reversible auto-fix allowed.
- **Medium**: recommend-and-wait.
- **High**: approval required.
- **Critical**: safe-mode + authorization required.

## Approval Authorities
- Marcel (platform owner)
- Big Ace (senior AI authority)
- Designated admin authority (only where explicitly delegated)

## Approval Required For
- Monetization logic changes
- Scoring/fairness rule modifications
- Safety or moderation policy changes
- Core route architecture changes
- Contract-sensitive sponsor logic changes
- Any irreversible or high-blast-radius mutation

## Decision Ladder
1. Detect
2. Classify severity
3. Check if reversible low-risk auto-fix is allowed
4. If Medium: generate recommendation and wait
5. If High/Critical: enter approval flow
6. If Critical: activate safe-mode before major action
7. Execute approved fix
8. Verify outcome
9. Rollback on failed verification
10. Log all actions and decisions

## Approval Packet Format
```text
Issue Detected: [description]
Severity: [low/medium/high/critical]
Affected Scope: [modules/routes/systems]
Recommended Fix: [proposed solution]
Risk Level: [low/medium/high]
Reversible: [yes/no]
Rollback Plan: [reversion method]
Verification Plan: [checks to run]
Urgency: [low/medium/high/critical]
Requested Approver: [Marcel/Big Ace/delegated admin]
```

## Auto-Fix Allowed Actions (Low Severity Only)
- Swap to backup layout/scene
- Restore default widget layout
- Disable noncritical broken effect
- Apply safe fallback presentation mode
- Reset nonfinancial stuck timers

## Explicitly Blocked Without Approval
- Payment and payout flow mutations
- Fairness/scoring authority changes
- Permission/privacy/security policy changes
- Irreversible data/config mutations
