# Rollback and Verification

## Purpose
Define post-fix verification and rollback governance for Phase 10 oversight.

## Severity Policy Alignment
- **Low**: reversible auto-fix allowed with mandatory verification.
- **Medium**: recommend-and-wait; verify only after approved execution.
- **High**: approval required before fix; verification and rollback plans mandatory.
- **Critical**: safe-mode + authorization before major intervention; strict verification gate.

## Verification Checklist
After any fix:
- [ ] Confirm original issue is resolved
- [ ] Confirm no new errors were introduced
- [ ] Validate related systems and dependencies
- [ ] Validate fallback paths still work
- [ ] Confirm performance did not regress
- [ ] Confirm policy/security/fairness constraints remain intact
- [ ] Confirm audit log entry was written

## Rollback Triggers
- Verification failure
- New error introduced by fix
- Material performance regression
- Policy/security/fairness regression detected
- Approval violation detected post-change

## Rollback Rules
- Low-risk reversible fixes may auto-rollback on failed verification.
- Medium/High/Critical rollbacks follow approval and escalation policy.
- Any blocked rollback must escalate immediately to authorization flow.
- All rollback actions must be logged in fix memory and audit trail.

## Required Rollback Plan Fields
- Original change identifier
- Previous known-good state reference
- Reversion steps
- Verification steps after rollback
- Escalation path if rollback fails

## Evidence Logging (Required)
Every fix and rollback should log:
- Incident and severity classification
- Action taken and whether approval was required
- Verification outcome
- Rollback outcome (if executed)
- Final disposition and escalation status
