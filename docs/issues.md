# Issues

## Planning assumptions
- Source PRD: `docs/prd.md`
- Planning scope: experimental branch `exp/pi-spawn` only
- Prototype winner: **Prototype 2** — upstream `pi-spawn` + local `7-phase` conventions
- Key constraints:
  - use upstream `pi-spawn` as the spawn engine; thin local guardrails are allowed
  - do not expand scope into `context-mode` or long-session continuity
  - keep work artifact-driven and grounded in `docs/`
  - dedicated per-phase prompt templates are deferred unless later explicitly promoted

## Dependency rules
- Runtime/package enablement must exist before convention or validation work can be trusted.
- Convention documentation must exist before deeper validation flows are judged stable.
- Validation tickets should prove one narrow workflow outcome at a time.
- Human review of the branch direction should happen only after the remaining AFK validation/documentation slices are complete.
- No ticket in this plan should expand into a custom spawn engine or broader context-management platform work.

## Ticket conventions
- `Status`: `todo`, `in-progress`, `blocked`, `done`
- `Type`: `AFK`, `HITL`
- `Depends on`: `none` or explicit ticket IDs
- `Blocks`: explicit ticket IDs or blank when none
- `Parallelizable`: `yes`, `no`
- QA follow-up: reopen an existing ticket if the original scope still fits; otherwise add a new ticket

## Parallelization plan
Can start immediately:
- `ISSUE-004` — validate one real Phase 6 execution-prep flow
- `ISSUE-005` — stabilize concise branch guidance from the prototype findings

Blocked until prerequisites complete:
- `ISSUE-006` — human review and branch decision after remaining AFK slices are done

Suggested lanes:
- Lane A: runtime + validation evidence
- Lane B: branch documentation / user guidance
- Lane C: HITL decision on whether the experiment is stable enough to keep or promote

## Tickets

### ISSUE-001 — Enable upstream `pi-spawn` in repo sessions
- Status: done
- Type: AFK
- Goal: make `spawn` available as a project-local Pi capability in this repository
- Why it exists: the experiment cannot happen unless users can actually call `spawn` inside repo sessions
- Depends on: none
- Blocks: ISSUE-002, ISSUE-003, ISSUE-004, ISSUE-005
- Parallelizable: no
- Source requirements:
  - PRD Functional requirement 1
  - PRD User experience and behavior
- Scope:
  - project-local package installation
  - Pi package configuration
  - basic availability verification
- Acceptance criteria:
  - [x] `pi-spawn` is installed as a project-local package
  - [x] the `spawn` tool is available in repo sessions after reload
- Notes / risks:
  - completed already on branch `exp/pi-spawn`

### ISSUE-002 — Define `7-phase` spawn conventions for branch use
- Status: done
- Type: AFK
- Goal: document how `spawn` should be used safely and consistently in this repository
- Why it exists: raw package availability alone is not enough for repeatable `7-phase` usage
- Depends on: ISSUE-001
- Blocks: ISSUE-003, ISSUE-004, ISSUE-005
- Parallelizable: no
- Source requirements:
  - PRD Functional requirements 2, 4, 7
  - PRD Scope
- Scope:
  - phase labeling rules
  - artifact grounding rules
  - output contract rules
  - single / parallel / serial delegation guidance
- Acceptance criteria:
  - [x] repo-local conventions exist for `spawn` usage across relevant phases
  - [x] the conventions define scope boundaries and evidence-first output expectations
- Notes / risks:
  - current source artifact: `docs/prototype/spawn-conventions.md`

### ISSUE-003 — Validate research and planning-readiness flows on real artifacts
- Status: done
- Type: AFK
- Goal: prove that the conventions work on real repo artifacts for at least two meaningful workflows
- Why it exists: the branch needs evidence that delegation is useful in practice, not just available in theory
- Depends on: ISSUE-001
- Blocks: ISSUE-004, ISSUE-005, ISSUE-006
- Parallelizable: yes
- Source requirements:
  - PRD Functional requirements 3, 5, 6
  - PRD Desired outcome
- Scope:
  - one real Phase 2 research-style flow
  - one real Phase 5 planning-readiness flow
  - capture findings under `docs/prototype/`
- Acceptance criteria:
  - [x] a real research-oriented flow is validated against repo artifacts
  - [x] a real planning-readiness flow is validated and can detect a real blocker
  - [x] findings are captured in branch-local prototype artifacts
- Notes / risks:
  - current source artifacts: `docs/prototype/real-flow-1-phase-2.md`, `docs/prototype/real-flow-2-phase-5.md`

### ISSUE-004 — Validate one real Phase 6 execution-prep flow
- Status: done
- Type: AFK
- Goal: prove that `spawn` can prepare concise execution context for exactly one ready ticket using real planning artifacts
- Why it exists: the branch still lacks evidence that the conventions help with execution preparation, not just research and blocker detection
- Depends on: none
- Blocks: ISSUE-006
- Parallelizable: yes
- Source requirements:
  - PRD Scope: future Phase 6 execution-prep usage once upstream artifacts are present
  - PRD User experience and behavior: execution-prep flow
  - PRD Open questions
- Scope:
  - use current `docs/prd.md` and `docs/issues.md`
  - run one execution-prep oriented spawn workflow
  - capture the result under `docs/prototype/`
- Acceptance criteria:
  - [x] one real Phase 6 execution-prep flow is run against repo planning artifacts
  - [x] the sub-agent returns a concise execution brief for exactly one ticket
  - [x] the result is captured as a new prototype validation artifact
- Notes / risks:
  - validated in `docs/prototype/real-flow-3-phase-6.md`
  - the resulting execution brief selected `ISSUE-005` as the next ready AFK ticket after `ISSUE-004` was marked `in-progress`

### ISSUE-005 — Stabilize concise branch guidance for experimental users
- Status: done
- Type: AFK
- Goal: turn the current prototype findings into a shorter, stable branch-facing guidance artifact for people using `pi-spawn` here
- Why it exists: prototype notes are useful but still scattered and exploratory; branch users need a clearer operational summary
- Depends on: ISSUE-002
- Blocks: ISSUE-006
- Parallelizable: yes
- Source requirements:
  - PRD Desired outcome
  - PRD Functional requirements 2, 4, 7
  - PRD Acceptance criteria 2 and 5
- Scope:
  - synthesize stable usage rules from prototype artifacts
  - keep the guidance explicit that this is an experiment branch
  - avoid adding new automation or templates beyond current scope
- Acceptance criteria:
  - [x] one concise branch-facing guidance artifact exists outside ad-hoc prototype notes
  - [x] the guidance explains when to use single, parallel, and serial spawn in this repo
  - [x] the guidance clearly states what this experiment does not solve
- Notes / risks:
  - completed via `docs/pi-spawn.md`
  - validation used direct file inspection; TDD was not applicable because this ticket is a documentation/guidance slice, not a behavior change

### ISSUE-006 — Review branch outcome and decide whether to continue, freeze, or promote
- Status: done
- Type: HITL
- Goal: make a human decision on whether this experiment is stable enough to keep using as-is, needs more prototyping, or should move toward broader standardization
- Why it exists: the remaining decision is evaluative and should not be silently automated by AFK execution
- Depends on: ISSUE-004, ISSUE-005
- Blocks: ISSUE-007
- Parallelizable: no
- Source requirements:
  - PRD Open questions
  - PRD Recommended next step
- Scope:
  - review evidence from all completed prototype and validation artifacts
  - decide whether the branch is “good enough” for continued use
  - choose the next correct phase after the experiment
- Acceptance criteria:
  - [x] a human decision is recorded on whether to continue prototyping, move back to PRD refinement, or proceed with broader adoption planning
  - [x] the decision names the primary reason and the next intended phase
- Notes / risks:
  - decision: continue using the branch as-is; do not promote yet
  - primary reason: the branch has validated real flows and a concise branch guide, but not enough evidence for broader standardization
  - next intended phase: continue the experiment in its current scope and revisit promotion only after more real-world validation

### ISSUE-007 — Add local `spawn-mode` guardrails for the experiment branch
- Status: done
- Type: AFK
- Goal: keep the repo upstream-first while allowing delegation to be explicitly enabled, disabled, and degraded safely when the backend is unavailable
- Why it exists: the branch needed a small safety layer so experimental delegation could be opt-in instead of assumed-on all the time
- Depends on: ISSUE-006
- Blocks: ISSUE-008
- Parallelizable: no
- Source requirements:
  - PRD Functional requirement 8
  - PRD Constraints
  - branch follow-up mitigation captured in `docs/prototype/spawn-mode-spec.md`
- Scope:
  - `/spawn-mode` toggle command
  - input guard for `/skill:delegate-me`
  - tool guard for `spawn`
  - soft backend-unavailable behavior
- Acceptance criteria:
  - [x] users can switch branch delegation mode on or off explicitly
  - [x] direct `spawn` usage is blocked when policy mode is off
  - [x] backend-unavailable state falls back cleanly instead of pretending delegation is healthy
- Notes / risks:
  - implemented in `.pi/extensions/spawn-mode.ts`
  - this is a thin controller, not a custom spawn engine

### ISSUE-008 — Add `delegate-me` orchestration skill and validate guarded fallback
- Status: done
- Type: AFK
- Goal: give the repo a disciplined parent-side delegation planner that respects local `spawn-mode` policy and degrades to no-spawn recommendations when needed
- Why it exists: once delegation became opt-in, the repo needed one small skill that chooses no-spawn / single / parallel / serial modes intentionally instead of encouraging ad-hoc spawning
- Depends on: ISSUE-007
- Blocks:
- Parallelizable: no
- Source requirements:
  - PRD Functional requirements 2, 4, 8
  - PRD Desired outcome
  - `docs/prototype/spawn-mode-spec.md`
- Scope:
  - local `delegate-me` skill
  - helper assets for phase playbook, prompt skeleton, and output contracts
  - validation of policy-off, policy-on, and backend-missing behavior
- Acceptance criteria:
  - [x] the repo has a local delegation-planning skill grounded in current artifacts
  - [x] the skill returns a no-spawn verdict when policy or backend availability blocks delegation
  - [x] the guarded workflow is validated and documented for future branch use
- Notes / risks:
  - implemented in `.pi/skills/delegate-me/`
  - validated in `docs/prototype/spawn-mode-validation.md`
