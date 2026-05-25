---
name: issues-me
description: Break docs/prd.md into a local kanban-style implementation plan in docs/issues.md with vertical slices, dependencies, and parallelization guidance. Use when the PRD is ready and the next step is execution planning.
---

# Issues Me

## When to use

- `docs/prd.md` is ready and the next step is implementation planning
- The user wants a local kanban-style breakdown in `docs/issues.md`
- The work needs clear ticket boundaries, blockers, and parallelization guidance before execution
- The team wants independently grabbable tickets rather than one large sequential plan

## Do not use when

- The PRD is missing or still too ambiguous
- The project still needs Phase 3 prototyping or Phase 4 PRD refinement
- The user wants direct implementation rather than planning
- The work is so small and obvious that ticket breakdown adds no value
- The main need is to route a vague request to the right phase or artifact before planning begins; use `triage-me`
- The PRD still needs refinement before tickets can be planned confidently; use `prd-me`
- The user wants to execute a ready ticket rather than create or refine the plan; use `execute-me`
- The user wants a QA plan or wants to capture verification findings rather than implementation slices; use `qa-me`

---

## Workflow

### 0. Stay in planning mode

While this skill is active:
- Do not implement product code unless the user explicitly asks to switch modes
- You may create or update `docs/issues.md`
- Focus on execution planning, not coding
- Prefer vertical slices, explicit blockers, and clear acceptance criteria over technical decomposition by layer

### 1. Validate readiness

Before drafting `docs/issues.md`, check whether Phase 5 is justified.

Implementation planning is justified when most of these are true:
- `docs/prd.md` exists and is concrete enough to plan from
- `## Handoff to Issues` exists in `docs/prd.md`
- `docs/prd.md` says `Ready for next phase: yes` in that handoff section
- the handoff includes the exact approval signal `Planning approval: approved for issues planning (correctness and scope)`, not just a structurally present handoff section
- scope and non-goals are stable enough for ticket breakdown
- major open questions no longer block planning
- if prototyping was used, the PRD already reflects exactly one winning direction

If the PRD handoff says `Ready for next phase: no`, stop and recommend returning to the named blocker or the earlier phase that best resolves it.
If the PRD still lacks the exact approval signal `Planning approval: approved for issues planning (correctness and scope)` in `## Handoff to Issues`, or uses a malformed variant instead, stop and route back to Phase 4 rather than guessing approval.

If the project is not ready, say so clearly and recommend returning to the earlier phase that needs work.

### 2. Inspect local artifacts first

Before asking the user anything, inspect relevant local artifacts if they exist:
- `docs/prd.md`
- `docs/idea.md`
- `docs/research.md`
- `docs/prototype/comparison.md`
- existing `docs/issues.md`

Use them to extract:
- the main user-visible flows
- acceptance criteria and scope boundaries
- dependencies and constraints
- unresolved questions that may affect planning
- likely foundations or shared contracts
- whether the PRD review/approval gate has actually been satisfied in `## Handoff to Issues`, specifically through `Planning approval: approved for issues planning (correctness and scope)`

Do not ask the user for information that already exists in the repo.

Use `spawn` selectively for **planning context offloading** when the PRD is broad enough that a second pass would reduce parent-context load without taking over final planning.

Good triggers:
- the PRD spans multiple user flows or cross-cutting constraints and needs a compact recon summary first
- a second opinion on slice boundaries, blockers, or parallel lanes would materially improve confidence
- the parent mainly needs a concise artifact-grounded handoff rather than every exploratory planning note

Preferred usage:
- use `preset: "scout"` for repo/artifact mapping when the likely implementation surface is still fuzzy
- use `preset: "planner"` for a compact second opinion on ticket slicing, blockers, or likely files
- keep final ticket structure in the parent; `spawn` may inform planning, but `docs/issues.md` remains parent-authored

### 3. Read the issues template asset

Read `assets/issues-template.md` before writing or restructuring `docs/issues.md`.

Use it as the default shape unless the repo context strongly justifies a small adjustment.

Respect the ticket conventions in that asset, especially:
- `Status`: `todo`, `in-progress`, `blocked`, `done`
- `Type`: `AFK`, `HITL`
- `Depends on`: `none` or explicit ticket IDs
- `Blocks`: explicit ticket IDs or blank when none
- `Parallelizable`: `yes`, `no`

### 4. Break the PRD into vertical slices

Draft tickets as **vertical slices**, not horizontal layers.

Vertical slice rules:
- each ticket should deliver a narrow but complete outcome through all relevant layers
- a completed ticket should be demoable, testable, or otherwise externally verifiable
- prefer many thin slices over a few thick ones
- avoid tickets like "build service layer" or "create schema" unless that work is genuinely the smallest meaningful outcome

Prefer slices that map to real user-visible or system-visible outcomes.

### 5. Classify tickets as AFK or HITL

For each ticket, choose one:
- `AFK`: an agent can execute it safely with the current context
- `HITL`: human-in-the-loop is required for approval, review, policy, UX judgment, migration gating, or another material decision

Prefer `AFK` where possible, but do not hide genuine human decision points.

### 6. Map dependencies and parallelization

For each ticket, make these explicit:
- `Depends on`
- `Blocks`
- `Parallelizable`

Also maintain a repo-level parallelization summary in `docs/issues.md`:
- what can start immediately
- what is blocked
- what can run in separate lanes

Do not assume everything can run in parallel.

### 7. Review granularity before finalizing

Before finalizing the plan, check:
- Is any ticket too large?
- Is any ticket too technical and not outcome-oriented?
- Are blockers explicit?
- Do the tickets collectively cover the PRD?
- Is there a smaller, safer slicing that would unlock parallel execution?

If the breakdown is weak, refine it before writing the final artifact.

### 7.5 Run a short planning self-review before handoff

Before closing the planning pass, run a short self-review against the draft board:
- granularity scan — is any ticket still too large, too blended, or too horizontal?
- PRD coverage scan — do the tickets collectively cover the intended requirements and user-visible flows without obvious gaps?
- avoidable-ambiguity scan — is any ticket worded loosely enough that different executors could take materially different paths?

If the self-review finds a real blocker, do not bluff.
Either tighten the ticket set, split the weak ticket, or route back to PRD refinement if planning is still premature.

### 8. Write or refine `docs/issues.md`

Write the plan using `assets/issues-template.md` as the base structure.

At minimum include:
- `Planning assumptions`
- `Dependency rules`
- `Parallelization plan`
- `Tickets`

For each ticket, include:
- issue ID
- title
- status using only `todo`, `in-progress`, `blocked`, or `done`
- type using only `AFK` or `HITL`
- goal
- why it exists
- dependencies and blockers
- whether it is parallelizable using only `yes` or `no`
- source requirements
- scope
- optional execution brief only when the ticket crosses the non-triviality threshold below, without turning the ticket into a giant plan
- acceptance criteria
- notes or risks

Execution-brief threshold:
- add an execution brief only when a ticket is non-trivial **and** at least one of these is true:
  - the executor will likely touch multiple workflow surfaces or file areas where boundary drift is easy
  - the validation path or acceptance focus is non-obvious enough that different executors could take materially different approaches
  - one short out-of-scope or boundary guardrail would materially reduce ticket creep
- omit the execution brief by default when the ticket is already straightforward enough to execute safely from its goal, scope, and acceptance criteria alone
- when used, keep the brief short: likely touchpoints, validation focus, or one explicit out-of-scope guardrail
- when omitted, remove the `Execution brief (optional)` section entirely rather than leaving an empty placeholder in trivial tickets

When capturing QA fallout later, prefer reopening an existing ticket if the original scope still fits; otherwise add a new ticket.

### 9. Recommend the next phase

Close by stating which next step is best:
- execution
- PRD revision
- more research
- more prototyping
- stakeholder review

Prefer execution via `execute-me` as the default handoff after a solid plan, specifically by selecting one ready `AFK` ticket.

Be specific about why.

---

## Default questioning order

Use this order as a starting point:

1. What are the smallest meaningful vertical slices in this PRD?
2. Which slices can be completed and verified independently?
3. Which slices are blocked by shared contracts, approvals, or earlier outcomes?
4. Which slices are safe for AFK execution versus HITL review?
5. What can run in parallel immediately?
6. What still makes execution risky or ambiguous?

---

## Gotchas

- Do not turn tickets into horizontal technical layers.
- Do not skip readiness checks and force planning from a weak PRD.
- Do not skip the lightweight PRD review/approval gate and treat structural handoff text as equivalent to actual planning readiness.
- Do not leave the approval format implicit; require the exact signal `Planning approval: approved for issues planning (correctness and scope)` to be visible in `## Handoff to Issues`.
- Do not make tickets so large that a single ticket hides multiple outcomes.
- Do not ignore blockers just to make the plan look parallel.
- Do not omit acceptance criteria.
- Do not add an execution brief just because a ticket touches multiple files if the outcome and validation path are already obvious.
- Do not turn optional execution briefs into giant micro-step plans.
- Do not assume every human decision can be delegated to an AFK ticket.
- If the PRD still leaves critical ambiguity, say so clearly instead of bluffing.

---

## Verification

Minimum smoke test:

```bash
/reload
/skill:issues-me
```

A good run of this skill produces:

**Opening:**
> States whether the project is ready for Phase 5 and identifies the source artifacts being used.

**During planning:**
> Uses `assets/issues-template.md`, breaks the PRD into vertical slices, marks AFK vs HITL, and makes blockers explicit.

**Artifact:**
> `docs/issues.md` contains planning assumptions, dependency rules, a parallelization plan, and detailed tickets with acceptance criteria.

**Closing:**
> Recommends whether the project should move to execution or return to an earlier phase.

### Trigger validation

**Should trigger:**
- "Break `docs/prd.md` into `docs/issues.md` for execution planning."
- "Create a local ticket breakdown from the PRD with blockers and parallel lanes."
- "Refine `docs/issues.md` so the slices are smaller and more parallelizable."

**Should not trigger:**
- "Route this vague request to the right phase and artifact." → use `triage-me`
- "Refine `docs/prd.md`; the requirements are still too fuzzy to plan." → use `prd-me`
- "Execute the next ready ticket from `docs/issues.md`." → use `execute-me`
- "Create a QA plan from the PRD and current implementation state." → use `qa-me`

**Borderline:**
- "The PRD is mostly ready, but one dependency is still a little fuzzy; can you plan the tickets anyway?" → use `issues-me` only if the ambiguity is non-blocking and can be called out clearly in planning assumptions or blocked tickets

### Artifact verification

If the session writes or refines the plan:
- verify the file path is exactly `docs/issues.md`
- verify the structure follows `assets/issues-template.md` unless a small justified adjustment was made
- verify planning did not proceed when `docs/prd.md` handoff still said `Ready for next phase: no`
- verify planning did not proceed when the PRD lacked the exact approval signal `Planning approval: approved for issues planning (correctness and scope)` in `## Handoff to Issues` or used a malformed variant
- verify tickets are vertical slices rather than horizontal technical layers
- verify each ticket uses only allowed values for `Status`, `Type`, `Depends on`, `Blocks`, and `Parallelizable`
- verify dependencies, blockers, and parallel lanes are explicit
- verify optional execution briefs appear only when the ticket crosses the stated non-triviality threshold and would reduce ambiguity without making trivial tickets heavy
- verify acceptance criteria are present for each ticket
- verify no unrelated implementation files were edited
- verify the closing recommendation points to the correct next phase, usually `execute-me` for one ready `AFK` ticket when planning is solid

### Smoke test

1. `/reload`
2. `/skill:issues-me`
3. Give a prompt such as: `Break docs/prd.md into docs/issues.md for execution planning`
4. Verify that the agent:
   - checks readiness first
   - checks `## Handoff to Issues` in `docs/prd.md` before planning
   - inspects local artifacts before asking questions
   - uses `assets/issues-template.md`
   - writes vertical-slice tickets instead of layer tickets
   - marks AFK vs HITL where relevant
   - makes dependencies and parallelization explicit
   - recommends the next phase clearly
