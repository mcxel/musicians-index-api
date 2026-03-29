# SYSTEM_GOVERNANCE_MAP.md
## Master Architecture — How Everything Connects

---

## THREE GOVERNING LAYERS

```
MAINFRAME (governs)
├── Global truth and state
├── Permission enforcement
├── Command routing
├── Logging and recovery
└── Feature flags

FRAMEWORK (builds)
├── UI pages and routes
├── API modules
├── Component system
├── Animation and motion
├── Magazine and game engines
└── Dashboard system

ALGORITHM (adapts)
├── Host rotation logic
├── Room evolution decisions
├── Sound selection
├── Page-stack sequencing
├── Crowd behavior scaling
├── Recommendation engine
└── Anti-repetition behavior
```

---

## THE GOVERNING LAW

```
Algorithms may recommend and adapt.
Mainframe owns final truth.
Framework owns implementation.
```

---

## SYSTEM CONNECTION MAP

```
User Action
    ↓
EVENT BUS
    ↓
MAINFRAME (route + permission check)
    ↓
FRAMEWORK (render + execute)
    ↓
ALGORITHM (adapt + recommend)
    ↓
SHOW ENGINE → AUDIO ENGINE → VFX ENGINE
    ↓
HOST → JULIUS → VEX → CROWD
    ↓
UI UPDATE + ANALYTICS LOG
```

---

# ROLE_ACTION_MATRIX.md
## What Each Role Can See and Do

---

## ROLE DEFINITIONS

### BIG ACE — Full Control
**Authority**: Execute, deploy, modify, override

Can do:
- Full system control
- Deploy changes
- Modify all systems
- Override bots
- Control economy
- Edit rooms, shows, audio, logic
- Approve/reject suggestions
- Access all logs
- Emergency rollback

### MARCEL DICKENS — Protected Command
**Authority**: Observe, suggest, safe-command

Can do:
- View all analytics
- View system health
- View stacks (rooms, users, shows, revenue)
- Submit suggestions to Big Ace
- Request commands through Big Ace pipeline
- Approve ideas (not deploy)

**Cannot do:**
- Direct system edits
- Breaking changes
- Deployments
- Modify any file directly

### J. PAUL SANCHEZ — Advisor
**Authority**: View, suggest

Can do:
- View analytics
- View reports
- Suggest improvements
- See performance data

**Cannot do:**
- System changes
- Execution
- Overrides
- Any commands

---

## COMMAND PIPELINE

```
Marcel (suggestion) 
    → POST /dashboard/command 
    → Queue 
    → Big Ace review 
    → Approve/modify/reject 
    → Execute 
    → Log 
    → Report back to Marcel
```

---

## DASHBOARD VISIBILITY MATRIX

| Data | Marcel | J. Paul | Big Ace |
|---|---|---|---|
| System health | ✅ | ✅ | ✅ |
| Active shows | ✅ | ✅ | ✅ |
| User counts | ✅ | ✅ | ✅ |
| Revenue/economy | ✅ | Summary only | ✅ Full |
| Bot activity | ✅ | ✅ | ✅ |
| Error logs | Summary | No | ✅ Full |
| Deploy status | ✅ | ✅ | ✅ |
| Suggestions panel | ✅ Submit | ✅ Submit | ✅ Full |
| Approval queue | View only | View only | ✅ Act |
| System controls | No | No | ✅ Full |

---

# FINAL_EXECUTION_LOCK.md
## The One-Page Law for the Entire Project

---

## EXECUTION LAW

```
1. One blocker at a time
2. No guessing — logs or it didn't happen
3. No rewriting working systems
4. No multi-file commits unless required
5. Every fix must produce proof
6. Every step must pass before moving forward
7. Nothing counted complete without:
   - route binding
   - data binding
   - role binding
   - proof gate passed
   - performance budget checked
```

---

## FEATURE COMPLETION RULE

A feature is ONLY complete when it has all 6:
- [ ] Canon entry in correct file
- [ ] Route/component binding confirmed
- [ ] Data source confirmed
- [ ] Role access confirmed
- [ ] Proof gate passed
- [ ] Performance budget checked

---

## FREEZE LINE

**Before Cloudflare green**: blocker fixes only
**Before live smoke green**: no new feature systems
**Before onboarding proof green**: no expansion waves
**Post-launch only**: venue expansion, reward economy, Julius expansion

---

## ACTIVE BLOCKER CARD FORMAT
```
ACTIVE BLOCKER: [name]
FAILING SYSTEM: [name]
LAST GREEN CHECKPOINT: [commit SHA]
NEXT REQUIRED EVIDENCE: [what to paste]
FILES ALLOWED TO CHANGE: [list]
PROOF GATE TO RERUN: [specific command]
```

---

## CHANGE BUDGET
- Max 1 blocker
- Max 1 service
- Max 1 commit theme
- Max 1 proof rerun

---

## COMPLETION DEFINITION (100%)

Done = all of:
- CI passes
- Cloudflare builds pass
- Site loads live
- Auth works
- Onboarding works
- Profiles save + reload
- Articles auto-create
- No console errors
- Julius stable (no spam, no lag)
- Mobile works
- Proof artifacts exist

---

## CURRENT STATE

- GitHub CI: ✅ GREEN (commit 3a81795)
- Active blocker: Cloudflare Pages (musicians-index-api, musicians-index-web)
- Platform slogan: "This is your stage, be original."

---

*Final Execution Lock v1.0 — BerntoutGlobal XXL*
