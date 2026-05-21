# Build Director - Module Supreme Standard

Status: Permanent standard

Principle:

INDEPENDENT TO OPERATE, CONNECTED TO COOPERATE

Build director rule:

SEPARATE BY OWNERSHIP, CONNECT BY CONTRACT, CONTROL BY ADMIN, SHARE BY INFRASTRUCTURE.

## Canonical module root map

These are the only canonical product and company module roots:

- `apps/bernoutglobal-llc`
- `apps/web`
- `apps/xxl`
- `apps/law`
- `apps/usa-stream-team`
- `apps/willdoit`
- `apps/hot-screens`
- `apps/mini-ace`
- `apps/thunderworld`
- `apps/need-a-charge`
- `apps/transistor-hut`

Legacy note:

- `apps/bernoutglobal-site` is a legacy split surface. Its public responsibilities now belong to `apps/bernoutglobal-llc` and should be migrated, not expanded.

## Non-negotiable rule

Each module must work alone, fail alone, recover alone, scale alone, and cooperate through contracts only.

No module may clog another module.

No module may depend on another module's internals.

Every module must be optimized for speed, safety, clarity, recovery, and perfect cooperation.

## Minimum ownership per module

Every module must own its:

- runtime
- environment
- config
- infrastructure
- API boundary
- data namespace
- asset namespace

## Standard operating layers

Every module must include and maintain these layers:

### Isolation

- own runtime
- own env
- own config
- own infra
- own API boundary
- own data namespace
- own asset namespace

### Simulation

- fake users
- fake traffic
- fake payments
- fake failures
- fake load
- fake security attacks
- fake recovery drills

### Stimulation

- click pressure
- traffic pressure
- event pressure
- bot pressure
- API pressure
- queue pressure
- payment pressure

### Control

- start
- stop
- restart
- freeze
- emergency lock
- quiet mode
- stress mode
- chaos mode

### Observability

- logs
- metrics
- traces
- health checks
- uptime checks
- error tracking
- route status
- API status
- queue status
- asset status

### Recovery

- checkpoints
- rollback
- snapshots
- self-heal
- safe mode
- crash isolation
- backup restore

### Security

- auth boundary
- role boundary
- API boundary
- data boundary
- rate limits
- abuse detection
- sentinel bots
- permission audit

### Performance

- lazy loading
- caching
- queue workers
- asset optimization
- background jobs
- debounce/throttle
- memory guards
- no blocking UI

### Contracts

- typed events
- typed APIs
- versioned contracts
- no direct cross-module internals
- adapters only

### Bots

- watcher bots
- repair bots
- audit bots
- support bots
- sentinel bots
- simulation bots
- stimulation bots

### Admin

- module dashboard
- health board
- blocker board
- incident board
- logs viewer
- stimulation panel
- simulation panel
- permissions panel

### Quality gates

- typecheck
- build
- route smoke
- API smoke
- asset smoke
- permission smoke
- performance smoke
- rollback proof

### Documentation

- README
- module map
- route map
- API map
- event map
- env map
- recovery guide
- deploy guide

### Interoperability

- module registry
- event bus
- webhook adapters
- service adapters
- shared auth contract
- shared analytics contract
- shared payment contract

### Efficiency

- no duplicated product logic
- no wrong-module files
- no global clogging
- no dead routes
- no dead buttons
- no memory leaks
- no uncontrolled simulations

## Required folder set

Every module root must contain at least:

```text
/app
/api
/runtime
/simulation
/stimulation
/control
/watchers
/bots
/workers
/events
/metrics
/security
/recovery
/contracts
/config
/environment
/infrastructure
/assets
/data
/docs
/tests
/adapters
/queues
/cache
/logs
/circuit-breakers
/deadletters
/migrations
/flags
/sandbox
/load-balancing
/orchestration
/schedulers
/validators
/rules
/reputation
/ledger
/notifications
/media-pipeline
/search
/cdn
/archive
/governance
/memory
```

Contracts must also support version folders when needed:

```text
/contracts/v1
/contracts/v2
```

## Corporate module rule

`apps/bernoutglobal-llc` is the company and legal operating system.

It owns:

- public company pages
- accounting
- ownership percentages
- distributions
- operations
- taxes
- payroll
- module ownership registry
- business operations
- corporate analytics
- compliance
- partner management
- investor relations

It must additionally provide these ownership surfaces:

- `app/(public)`
- `app/(internal)`
- `app/(partner)`
- `app/(owner)`
- `app/(operations)`
- `/ownership`
- `/accounting`
- `/payroll`
- `/tax`
- `/compliance`
- `/legal-links`
- `/partner-management`
- `/investors`
- `/corporate-ops`
- `/company-ledger`
- `/company-governance`
- `/admin`
- `/support`
- `/payouts`

## Program module rule

`apps/xxl` is the software and runtime core.

It must additionally provide:

- `/engine`
- `/orchestrator`
- `/brain`
- `/world-runtime`
- `/device-runtime`
- `/system-control`

## Permanent enforcement

This standard is enforced by the repo script `scripts/apply-module-supreme-standard.ps1`.

That script is idempotent and may be rerun whenever a new module is added or audited.

## Return template

```text
MODULE_SUPREME_STANDARD_APPLIED=
MODULES_UPDATED=
MISSING_FOLDERS_CREATED=
CONTRACT_BOUNDARIES_CREATED=
SIMULATION_LAYER_CREATED=
STIMULATION_LAYER_CREATED=
CONTROL_LAYER_CREATED=
OBSERVABILITY_LAYER_CREATED=
RECOVERY_LAYER_CREATED=
SECURITY_LAYER_CREATED=
QUALITY_GATES_CREATED=
NEXT_BLOCKER=
```