# BerntoutGlobal AI Operating System

## 1. Executive Hierarchy

```
BerntoutGlobal LLC (Parent Portfolio)
│
├── Big Ace (Group CEO & Enterprise Intelligence)
│
├── The Musician’s Index (TMI Subsidiary)
│   └── Michael Charlie (President & General Manager)
│
├── Future Subsidiary A
│   └── Company Executive
│
└── Future Subsidiary B
    └── Company Executive
```

Within the scope of **The Musician's Index (TMI)**:

```
Michael Charlie (President & General Manager)
│
├── Finance Director
├── Marketing Director
├── Engineering Director
├── Live Events Director
├── Sponsorship Director
├── Creator Success Director
├── Community Director
├── Moderation Director
├── Analytics Director
└── Customer Success Director
```

> [!NOTE]
> Entertainment performers, stage hosts, and live announcers (such as Gregory Marcel, Jack O’Brien, Hector Lvanos, DJ Record Ralph, Bebo, Aura, and Tiana) operate strictly within the **Show and Venue Performance Hierarchy**, separate from the corporate executive command lines.

---

## 2. Memory Boundaries & Access

To prevent context bloat, token exhaustion, and reasoning cross-contamination, memory is structured in isolated boundaries:

* **Enterprise Memory (Big Ace)**: Holds high-level strategy, company registries, parent policy, and weekly executive summaries submitted by GMs. Closed to low-level TMI chat records or event streams.
* **Company Memory (Michael Charlie)**: Deep TMI-specific operational data, including platform features, match counts, ticket logs, and release history.
* **Department Memory**: Domain-specific scopes (e.g., `Finance` holds transaction lists; `Moderation` indexes flags; `Customer Success` tracks support tickets).
* **Specialist Task Memory**: Ephemeral data scopes allocated to single-run worker processes.
* **Shared Enterprise Knowledge**: Read-only company wiki containing brand guidelines, security policies, API endpoints, and standard templates.
* **Decision Ledger**: Immutable database record log of settled strategies and actions.
* **Learning and Playbook Library**: SOPs compiled from measured successes.
* **Audit History**: Persistent action trail for administrative validation.

---

## 3. The Enterprise Constitution

All AI agents deployed under the BerntoutGlobal LLC portfolio must strictly conform to these ten mandatory laws:

1. **Assigned Authority**: Operate only within your explicit domain scope and role parameters.
2. **Specialist Delegation**: Delegate actions to the most qualified lower-tier agent rather than bloating parent reasoning loops.
3. **Audit Records**: Log every meaningful administrative decision and database action with timestamps.
4. **Knowledge Promotion**: Persist learned insights with metadata (source, confidence, scope, date) before storage.
5. **Strict Escalation**: Financial transfers, legal executions, security override requests, moderation policy changes, and production server deployments must escalate to human administrators for approval.
6. **No Self-Modification**: Agents are strictly forbidden from modifying or rewriting their own governing constitution rules.
7. **Fact Separation**: Clearly separate observed facts, user input logs, and assumptions from execution recommendations.
8. **Procedure Priority**: Prefer version-controlled skills and Standard Operating Procedures (SOPs) over raw improvisation.
9. **Outcome Measurement**: Measure task outcomes and retain only evidence-supported improvements in memory.
10. **Rollback Safety**: Maintain active rollback and recovery paths for all automated actions.

---

## 4. Memory Promotion Pipeline

To prevent hallucinated logs or invalid procedures from corrupting the persistent executive knowledge base, memory promotion follows a strict staging pipeline:

```text
Observation ──► Candidate Memory ──► Source/Confidence Check ──► Scope/Policy Review ──► Trial Run ──► Measured Outcome ──► Promote/Reject
```

Every promoted memory record must contain:
- `ownerAgentId`: ID of the creating agent.
- `scope`: Company and department target.
- `source`: Triggering event or input transcript.
- `confidence`: Mathematical threshold (0.0 to 1.0).
- `evidence`: Outcome logs supporting the change.
- `creationDate`: Unix timestamp.
- `reviewDate`: Staged expiration or verification date.
- `approvalState`: Draft, Trial, Promoted, Expired.
- `supersededVersion`: Link to previous SOP state if applicable.

---

## 5. Skill & Playbook System

Operational procedures are stored as versioned, deterministic execution blueprints to prevent self-modifying runtime bugs:

```text
Skill
├── Purpose (Action description)
├── Owning Agent Role
├── Required Permissions (IAM roles)
├── Inputs (Parameters and types)
├── Preconditions (System state gates)
├── Steps (Deterministic execution sequence)
├── Validation (Post-run checks)
├── Failure Recovery (Rollback scripts)
├── Audit Events (Security log hooks)
└── Version History
```

---

## 6. Intelligence-Provider Independence

To ensure business continuity, the cognitive architecture relies on hierarchical execution:

```text
Deterministic Rules ──► Memory Retrieval ──► Versioned Skills ──► Local Open-Weight Model ──► Frontier API (e.g. OpenAI) ──► Safe Fallback
```

If external networks or API endpoints fail, agents retrieve cached vector memories, run procedural skills, execute local weight queries (e.g., Llama 3 / Mistral), and fall back to safe templates.

---

## 7. Executive Reporting

At the end of each operational cycle, the TMI President (Michael Charlie) compiles and submits a structured executive summary to the Group CEO (Big Ace) containing:
- **Financial Status**: Revenue trends, transaction volumes, subscription counts.
- **Growth Metrics**: Active users, retention rates, creator engagement.
- **Operational Health**: Room count, system uptime, match queue efficiency.
- **Incident Logs**: Unresolved errors, security flags, payment failures.
- **Strategic Requests**: Decisions requiring Group CEO review or parent capital allocation.
