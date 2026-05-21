# Build Director - Universal WillDoIt Workforce Layer

Status: active and permanent

Primary truth:
- apps/bernoutglobal-llc/src/workforce-entitlements

Execution source:
- apps/willdoit/src/universal-dispatch

Dashboard surfaces:
- apps/web/src/app/admin/owner-dashboard
- apps/bernoutglobal-llc/app/workforce
- apps/willdoit/app/dispatch

## Purpose

Any approved BernoutGlobal module or owner request can trigger WillDoIt workers for personal, business, field, physical, technical, logistics, cleaning, shopping, maintenance, building, installation, repair, event, and emergency work.

## Worker quantity modes

- SINGLE_WORKER
- DUAL_WORKERS
- SMALL_CREW
- FULL_CREW
- SPECIALIST_TEAM
- EMERGENCY_TEAM

## Request types

- SHOPPING
- DELIVERY
- PICKUP
- MOVING
- CLEANING
- WINDOW_CLEANING
- MAINTENANCE
- REPAIR
- INSTALLATION
- SETUP
- STORE_SETUP
- KIOSK_SETUP
- VENUE_SETUP
- EVENT_SETUP
- EVENT_BREAKDOWN
- ELECTRICAL_HELP
- TECH_HELP
- AUDIO_VIDEO_HELP
- SECURITY_HELP
- INVENTORY_HELP
- WAREHOUSE_HELP
- OFFICE_HELP
- HOME_HELP
- SUPPLY_RUN
- HARDWARE_PICKUP
- CONSTRUCTION_HELP
- BUILDOUT_HELP
- PAINTING
- LANDSCAPING
- SIGNAGE_INSTALL
- SCREEN_INSTALL
- CHARGING_KIOSK_INSTALL
- TRANSISTOR_HUT_STOCKING
- HOT_SCREENS_MAINTENANCE
- NEED_A_CHARGE_MAINTENANCE
- TMI_EVENT_HELP
- CUSTOM_TASK

## Worker types

- GENERAL_HELPER
- SHOPPER
- DRIVER
- DELIVERY_WORKER
- MOVER
- CLEANER
- WINDOW_CLEANER
- MAINTENANCE_WORKER
- REPAIR_TECH
- INSTALLER
- ELECTRICIAN
- IT_TECH
- AUDIO_TECH
- VIDEO_TECH
- KIOSK_TECH
- STORE_SETUP_WORKER
- EVENT_HELPER
- SECURITY_HELPER
- WAREHOUSE_HELPER
- INVENTORY_WORKER
- LANDSCAPER
- PAINTER
- SIGNAGE_INSTALLER
- SCREEN_INSTALLER
- SUPPLY_RUNNER
- SITE_RUNNER
- CUSTOM_SPECIALIST
- GENERAL_CONTRACTOR
- SITE_SUPERVISOR
- PLUMBER
- FRAMER
- FLOORING_WORKER
- KIOSK_INSTALLER
- LOW_VOLTAGE_TECH
- AUDIO_VIDEO_INSTALLER
- SECURITY_INSTALLER
- CLEANUP_CREW
- INSPECTOR
- PERMIT_RUNNER
- MATERIAL_RUNNER

## Modules allowed to request workers

- apps/bernoutglobal-llc
- apps/web
- apps/xxl
- apps/law
- apps/usa-stream-team
- apps/willdoit
- apps/hot-screens
- apps/mini-ace
- apps/thunderworld
- apps/need-a-charge
- apps/transistor-hut

## Request record contract

Required request fields:

- request_id
- requester_module
- requester_person
- request_type
- personal_or_business
- business_purpose
- accounting_category
- tax_category
- worker_quantity_mode
- worker_types
- worker_count
- skills_required
- equipment_required
- materials_required
- location
- time_window
- urgency
- estimated_cost_low
- estimated_cost_high
- budget_source
- funding_source
- approval_policy
- proof_required
- completion_rule
- risk_score
- status
- created_at
- updated_at

## Funding sources

- owner_support_budget
- operations_budget
- field_logistics_budget
- business_support_budget
- emergency_budget
- buildout_budget
- procurement_budget
- maintenance_budget
- cleaning_budget
- event_budget
- personal_reimbursement_budget

## Accounting categories

- BUSINESS_EXPENSE
- OWNER_SUPPORT
- FIELD_LOGISTICS
- REIMBURSEMENT
- MAINTENANCE
- CLEANING
- BUILDOUT
- PROCUREMENT
- EVENT_OPERATIONS
- PERSONAL_NONDEDUCTIBLE
- EMERGENCY_ASSISTANCE

## Automatic flow

1. Owner or module creates worker request.
2. REQUEST_CLASSIFIER_BOT identifies request class.
3. ACCOUNTING_TAG_BOT assigns accounting category.
4. BUDGET_BOT validates budget scope.
5. TREASURY_BOT confirms available funding.
6. CAPACITY_BOT checks worker availability.
7. WORKER_MATCH_BOT selects worker types.
8. DUAL_WORKER_BOT activates when required.
9. CREW_DISPATCH_BOT activates when required.
10. SCHEDULE_BOT proposes execution window.
11. ROUTE_BOT assigns route and travel plan.
12. PROCUREMENT_BOT adds tools and materials.
13. Dispatch is sent to worker or crew.
14. PROOF_BOT collects evidence and signoff.
15. COMPLETION_BOT closes request.
16. LEDGER_BOT records financial outcome.
17. AUDIT_BOT records classification and policy chain.
18. RATING_BOT scores worker quality.
19. RECOVERY_BOT handles no-show, bad work, delay, refund, and replacement.

## Dual worker rule

Use DUAL_WORKERS when:

- lifting or moving is involved
- safety requires two people
- one drives while one loads
- shopping and delivery needs speed
- installation needs hold and support
- window cleaning is large or multi-story
- site setup needs simultaneous tasks
- equipment is heavy
- emergency speed is required

## Crew rule

Use SMALL_CREW or FULL_CREW when:

- store setup
- kiosk installation
- event setup
- venue setup
- construction or buildout
- Hot Screens installation
- Transistor Hut stocking
- Need A Charge multi-kiosk deployment
- ThunderWorld physical or event activation

## Proof requirements

Every job requires at least one proof artifact:

- photo proof
- video proof
- GPS proof
- receipt proof
- customer signoff
- owner signoff
- checklist proof
- before and after proof
- worker note
- completion timestamp

## Bot system

- UNIVERSAL_WORKFORCE_BOT
- REQUEST_CLASSIFIER_BOT
- ACCOUNTING_TAG_BOT
- BUDGET_BOT
- TREASURY_BOT
- CAPACITY_BOT
- WORKER_MATCH_BOT
- DUAL_WORKER_BOT
- CREW_DISPATCH_BOT
- ROUTE_BOT
- SCHEDULE_BOT
- PROCUREMENT_BOT
- SAFETY_BOT
- CERTIFICATION_BOT
- PROOF_BOT
- COMPLETION_BOT
- LEDGER_BOT
- AUDIT_BOT
- RATING_BOT
- ESCALATION_BOT
- RECOVERY_BOT
- EMERGENCY_DISPATCH_BOT

## Dashboard panels

- Universal Worker Request
- Active Worker Jobs
- Dual Worker Jobs
- Crew Jobs
- Worker Budget
- Worker History
- Emergency Dispatch

## Quality rules

- No worker job closes without proof.
- No worker gets paid without proof.
- No repeat bad worker remains active.
- No unsafe dispatch without safety check.
- No business expense mixed with personal category.
- No module controls worker internals directly.
- All requests route through WillDoIt contracts.

## Chain end states

- COMPLETED
- CANCELLED
- RESCHEDULED
- FAILED_REFUNDED
- FAILED_REPLACED
- FAILED_ESCALATED
- EMERGENCY_LOCKED

## Universal rule

WillDoIt is the universal labor arm for all BernoutGlobal modules.

It can dispatch one worker, dual workers, or full crews.

All requests must be contract-bound, audited, ledgered, and recoverable.
