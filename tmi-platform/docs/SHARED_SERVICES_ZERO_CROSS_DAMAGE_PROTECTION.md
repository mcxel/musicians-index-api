# Build Director - Shared Services + Zero-Cross-Damage Protection

Status: active and permanent

## Shared service modules

- apps/willdoit
- apps/law

Shared service modules can help every business.

Shared service modules cannot contaminate every business.

## Service scope

### WillDoIt scope

- labor
- shopping
- delivery
- maintenance
- repairs
- construction
- contractors
- installs
- buildouts
- cleaning
- window cleaning
- moving
- emergency help

### Danika Law scope

- legal representation
- contracts
- disputes
- compliance
- takedowns
- business protection
- worker disputes
- contractor disputes
- venue disputes
- artist disputes
- payment disputes
- intellectual property protection

## WillDoIt construction layer

Required folders under apps/willdoit:

- /construction
- /contractors
- /buildout-crews
- /site-supervisors
- /permit-checks
- /inspection-checks
- /material-crews
- /electrical-crews
- /plumbing-crews
- /framing-crews
- /painting-crews
- /flooring-crews
- /signage-crews
- /kiosk-install-crews
- /store-buildout-crews
- /venue-buildout-crews
- /safety-compliance
- /contractor-proof
- /contractor-ratings
- /contractor-payments
- /contractor-insurance
- /contractor-licenses

## Danika Law shared protection layer

Required folders under apps/law:

- /business-representation
- /module-legal-protection
- /contract-review
- /dispute-defense
- /compliance-checks
- /ip-protection
- /takedown-requests
- /worker-disputes
- /contractor-disputes
- /vendor-disputes
- /payment-disputes
- /incident-legal-review
- /legal-hold
- /legal-audit
- /legal-risk-score
- /legal-escalations

## Law service request types

- CONTRACT_REVIEW
- BUSINESS_REPRESENTATION
- WORKER_DISPUTE
- CONTRACTOR_DISPUTE
- VENDOR_DISPUTE
- PAYMENT_DISPUTE
- COPYRIGHT_ISSUE
- DMCA_TAKEDOWN
- COMPLIANCE_REVIEW
- INCIDENT_REVIEW
- DATA_BREACH_REVIEW
- HACK_RESPONSE
- EMPLOYEE_POLICY
- VENUE_CONTRACT
- ARTIST_CONTRACT
- SPONSOR_CONTRACT
- ADVERTISER_CONTRACT

## Zero-cross-damage security layer

Required in every canonical module:

- /security/isolation
- /security/module-firewall
- /security/access-boundaries
- /security/session-boundaries
- /security/api-boundaries
- /security/data-boundaries
- /security/secret-boundaries
- /security/rate-limits
- /security/breach-detection
- /security/incident-response
- /security/quarantine
- /security/emergency-lock
- /security/backup-restore
- /security/forensics
- /security/recovery-proof

## Isolation rules

- Every module has its own secrets.
- Every module has its own environment.
- Every module has its own data namespace.
- Every module has its own API boundary.
- Every module has its own auth scope.
- No module imports another module private runtime.
- No module accesses another module private database directly.

Cross-module cooperation is allowed only through:

- public API
- contracts
- events
- adapters

If one module is hacked, only that module is quarantined.

Other modules remain operational.

## Breach containment flow

1. BREACH_DETECTION_BOT detects threat.
2. MODULE_FIREWALL_BOT isolates affected module.
3. SESSION_REVOKE_BOT revokes risky sessions.
4. SECRET_ROTATION_BOT rotates module secrets.
5. API_GUARD_BOT blocks unsafe endpoints.
6. FORENSICS_BOT snapshots evidence.
7. RECOVERY_BOT restores clean checkpoint.
8. LAW_BREACH_BOT opens legal incident review.
9. AUDIT_BOT records timeline and evidence chain.
10. OWNER_ALERT_BOT alerts owner dashboard.
11. Other modules remain live.

## Required security bots

- MODULE_FIREWALL_BOT
- BREACH_DETECTION_BOT
- SESSION_REVOKE_BOT
- SECRET_ROTATION_BOT
- API_GUARD_BOT
- RATE_LIMIT_BOT
- FORENSICS_BOT
- QUARANTINE_BOT
- RECOVERY_BOT
- LAW_BREACH_BOT
- AUDIT_BOT
- OWNER_ALERT_BOT

## Shared-service contracts

- WillDoItServiceContract
- LawServiceContract
- ConstructionDispatchContract
- ContractorVerificationContract
- LegalRepresentationContract
- LegalIncidentContract
- BreachResponseContract
- ModuleIsolationContract
- EmergencyQuarantineContract

## Shared service routing rules

- TMI routes workforce requests through WillDoItServiceContract.
- Need A Charge routes deployment requests through ConstructionDispatchContract.
- Transistor Hut routes workforce requests through WillDoItServiceContract.
- Hot Screens routes install requests through ConstructionDispatchContract.
- Any module routes legal support through LegalRepresentationContract.
- Any hacked module routes incident chain through BreachResponseContract.

## Forbidden

- direct imports into apps/willdoit private runtime
- direct imports into apps/law private runtime
- shared secrets across modules
- shared private database tables without ownership contract
- one global admin token for all modules
- one compromised module affecting all modules

## Owner dashboard alert requirements

- worker request created
- contractor crew dispatched
- construction milestone complete
- legal request opened
- contract review needed
- business protection alert
- hack detected
- module quarantined
- secrets rotated
- recovery complete
- legal breach review created

## Chain completion states

WillDoIt chains:

- COMPLETED
- RESCHEDULED
- FAILED_REPLACED
- FAILED_ESCALATED
- EMERGENCY_LOCKED

Law chains:

- RESOLVED
- UNDER_REVIEW
- LEGAL_HOLD
- ESCALATED
- CLOSED_WITH_PROOF

Security chains:

- CONTAINED
- RECOVERED
- QUARANTINED
- ESCALATED
- EMERGENCY_LOCKED

## Final rule

WillDoIt serves every business.

Danika Law protects every business.

Every module stays isolated.

Every module can cooperate.

No module can infect another module.

Every shared-service request must be contract-bound, audited, ledgered, and recoverable.
