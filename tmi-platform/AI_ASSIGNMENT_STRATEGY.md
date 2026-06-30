# AI Assignment Strategy (LOCKED 2026-06-25)

**Authority**: Build Director (Marcel Dickens)  
**Purpose**: Assign each AI distinct responsibility to minimize overlap and maximize forward progress  
**Timeline**: Through soft launch and beyond

---

## The Problem

Without clear boundaries, AI tools can:
- Duplicate each other's work
- Undo changes made by another tool
- Create architectural conflicts
- Rebuild foundations repeatedly
- Work on low-priority items while high-priority waits

---

## The Solution

**Assign each tool a primary responsibility.**

Each tool owns its domain. Others respect that boundary.

---

## Role Assignments

### 1. CLAUDE (Runtime Architecture & Integration)

**Primary Responsibility**: Systems, wiring, runtime correctness, production-level code

**What Claude Builds**:
- Live Session Chain (canonical registry, propagation to all surfaces)
- Universal Profile Runtime (core architecture)
- CRM modules (role-specific business logic)
- Business Layer (unified revenue engine, settlements, tax compliance)
- Runtime Humanity (attention, behavior, environment, micro-movements)
- Venue Life systems (NPC behavior, operational logic)
- API endpoints and data flow
- Testing/verification infrastructure
- Production deployment systems

**What Claude Does NOT Do**:
- ❌ UI/component implementation (unless backend-heavy)
- ❌ Responsive design tweaking (Copilot's job)
- ❌ Legacy code cleanup (Blackbox's job)
- ❌ Performance profiling (Blackbox's job)
- ❌ Dead code removal (Blackbox's job)

**Definition of Done**:
- Code compiles without errors
- `pnpm typecheck` passes
- `pnpm build` succeeds
- APIs are wired to real data (no mocks)
- Systems are integrated end-to-end
- Runtime behavior is predictable and measurable

**Key Metrics**:
- Zero hardcoded/mock data in new code
- All new systems pass Level 1 + Level 2 certification
- All new systems have API documentation
- No dead endpoints

---

### 2. COPILOT (UI Polish & Implementation)

**Primary Responsibility**: Components, layouts, visual consistency, responsive design

**What Copilot Builds**:
- Component implementations (buttons, cards, panels, modals)
- Page layouts (matching Rule 18 visual formula)
- Responsive design (desktop, tablet, mobile versions)
- Animation and transitions (using framer-motion)
- Icon/badge/status indicators
- Form implementations
- Typography and spacing consistency
- Visual polish and accessibility
- Tailwind configuration refinements

**What Copilot Does NOT Do**:
- ❌ Architecture decisions (Claude's job)
- ❌ Data fetching logic (Claude's job)
- ❌ Legacy code cleanup (Blackbox's job)
- ❌ Dead code removal (Blackbox's job)
- ❌ Performance optimization (Blackbox's job)

**Definition of Done**:
- Component renders correctly on desktop, tablet, mobile
- Matches established design system (Rule 18)
- Accessibility standards met (WCAG AA minimum)
- No accessibility warnings in console
- No visual regression from established designs
- Animations are smooth (60fps target)

**Key Metrics**:
- 100% component test coverage (visual tests)
- Zero accessibility violations
- All layouts match approved mockups
- Mobile layouts are mobile-first, not responsive desktop versions

---

### 3. BLACKBOX (Audits, Testing & Cleanup)

**Primary Responsibility**: Code quality, regression testing, dead code removal, performance optimization

**What Blackbox Builds**:
- Comprehensive audits (code health, dead code, unused components, orphan routes)
- Regression test suites (catching breaking changes)
- Performance profiling (identifying bottlenecks)
- Legacy code cleanup (removing obsolete patterns)
- Bundle size analysis and optimization
- Unused CSS removal
- Unused imports cleanup
- Dead route removal
- Mock data discovery and removal
- Duplicate implementation discovery
- Performance optimization (React re-renders, query optimization)
- Load testing and stress testing
- Launch readiness audits

**What Blackbox Does NOT Do**:
- ❌ Architectural decisions (Claude's job)
- ❌ UI/component implementation (Copilot's job)
- ❌ Building new systems (Claude's job)
- ❌ Refactoring (unless it's cleanup of obsolete code)

**Definition of Done**:
- Audit report is comprehensive and actionable
- Identified issues have clear priority (P0/P1/P2)
- Performance baselines are established
- No regression vs. previous build
- Bundle size tracked and reported
- Build warnings addressed

**Key Metrics**:
- Unused code removed: 100% of identified orphaned files
- Performance regression: 0% (never slower than previous build)
- Test coverage: >80% for critical paths
- Build warnings: <5 (all non-critical)
- Audit findings: All P0 issues resolved before launch

---

### 4. BUILD DIRECTOR (Marcel Dickens) — Prioritization & Acceptance

**Primary Responsibility**: Strategy, prioritization, feature acceptance, launch gating

**What Build Director Does**:
- Lock strategic direction and roadmap
- Prioritize competing tasks
- Accept/reject completed features
- Make architectural decisions when teams disagree
- Decide go/no-go on major milestones
- Own soft launch readiness decision
- Set performance and quality targets

**What Build Director Does NOT Do**:
- ❌ Write code (that's what the AI tools are for)
- ❌ Debug individual issues (escalate, don't solve)
- ❌ Code review (trust the tools' standards)

**Authority**:
- Can override any AI tool's priority or decision
- Final approval on all launches/milestones
- Owns the vision and keeps it locked

---

## Boundaries & Communication

### Clear Handoffs

**Claude → Copilot**:
- Claude builds the system and API
- Copilot builds the UI that consumes that API
- Handoff: "API is ready at `/api/endpoint`"

**Copilot → Blackbox**:
- Copilot builds the component
- Blackbox tests for performance/accessibility/regression
- Handoff: "Component is ready for test"

**Blackbox → Build Director**:
- Blackbox reports audit findings
- Build Director prioritizes fixes
- Handoff: "Audit complete, P0 issues identified"

**Build Director → Claude**:
- Build Director prioritizes next phase
- Claude builds it
- Handoff: "Next phase locked, begin work"

---

## What Each Tool Should NOT Change

**Claude owns these systems — others don't touch them**:
- Live Session Registry and propagation
- Revenue engine and settlement logic
- CRM architecture and modules
- API endpoint definitions
- Database schema
- Authentication and authorization

**Copilot owns these systems — others don't touch them**:
- Component styling and layout
- Visual design implementation
- Animation and transitions
- Typography and spacing
- Responsive breakpoints

**Blackbox owns these systems — others don't touch them**:
- Performance baselines and targets
- Code cleanliness (unused imports, dead routes)
- Test infrastructure
- Linting and formatting
- Bundle analysis

---

## Daily Workflow

### Morning Standup (All Teams)

Each team reports:
1. What they shipped yesterday
2. What they're shipping today
3. Any blockers (not solutions, just blockers)

**Example**:
- Claude: "Shipped GO LIVE propagation to all 15 surfaces. Starting Universal Profile Runtime."
- Copilot: "Shipped identity module UI. Starting role module layouts."
- Blackbox: "Completed performance audit. Found 12 unused components, flagging as P2."
- Build Director: "Prioritized Blackbox findings. P0s first, then phase 2A modules."

### Afternoon Check-In (Build Director Only)

Build Director checks:
1. Are all teams making progress?
2. Are any teams blocked?
3. Are any decisions needed?

### Evening Summary (Async)

Each team posts:
1. Lines of code shipped
2. Tests passing
3. Issues found
4. Tomorrow's plan

---

## Escalation Path

**If Claude can't do something**:
- → Ask Build Director for priority/deadline change
- → NOT ask Copilot or Blackbox to do it

**If Copilot can't do something**:
- → Ask Build Director for design clarification
- → NOT ask Claude to implement the UI

**If Blackbox finds issues**:
- → Report to Build Director
- → Let Build Director assign to the right owner
- → DON'T try to fix it yourself

**If Build Director needs a decision made**:
- → Assign to the owning team
- → Trust their judgment in their domain
- → Don't second-guess their implementation

---

## Acceptance Criteria Per Tool

### Claude's Work is Done When:
- ✅ Code compiles without errors
- ✅ `pnpm typecheck` passes
- ✅ `pnpm build` succeeds
- ✅ APIs have real data (no mocks)
- ✅ Runtime behavior is tested
- ✅ Integrates with other systems end-to-end
- ✅ Build Director approves the architecture

### Copilot's Work is Done When:
- ✅ Component renders correctly (all breakpoints)
- ✅ Matches established design (Rule 18)
- ✅ Accessible (WCAG AA)
- ✅ No console warnings
- ✅ Animations smooth (60fps)
- ✅ Build Director approves the visual design

### Blackbox's Work is Done When:
- ✅ Audit report is comprehensive
- ✅ All P0 issues are identified and owned
- ✅ Performance baselines established
- ✅ No regression from previous build
- ✅ Build Director accepts the audit findings

---

## Conflict Resolution

**If two teams disagree on approach**:

1. **Both present their rationale to Build Director**
2. **Build Director decides within 24 hours**
3. **Winning team proceeds**
4. **Losing team pivots to their next assignment**

Example:
- Claude: "We should use GraphQL for the analytics API"
- Copilot: "REST is simpler for the UI layer"
- Build Director: "Use REST. GraphQL adds complexity before launch."
- Resolution: Both teams proceed with REST

---

## Success Metrics

### Claude
- Systems are wired and working
- Zero hardcoded data
- All certifications pass

### Copilot
- Visual design is consistent
- No accessibility violations
- Mobile and desktop both work

### Blackbox
- Unused code identified and cleaned
- Performance baselines established
- No regressions

### Build Director
- Roadmap is locked and communicated
- No conflicting priorities
- Team knows exactly what's next

---

## The Benefit

With clear boundaries:

✅ **No rework** — Each tool trusts the others' domain  
✅ **No overlap** — Each tool knows exactly what's theirs  
✅ **No conflicts** — Build Director is the single source of truth  
✅ **Fast progress** — All teams moving forward, not sideways  
✅ **Clear accountability** — Everyone knows what they own  
✅ **Easy handoffs** — API-first design means clean integration points

---

## Locked

This assignment strategy is final until soft launch.

Do not reassign responsibilities.

Do not blur boundaries.

Each tool trusts the others to do their job.

Build Director makes decisions when they overlap.

**That's how you ship a platform in 8 weeks.**
