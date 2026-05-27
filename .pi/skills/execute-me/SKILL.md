---
name: execute-me
description: Execute exactly one ready AFK ticket from docs/issues.md, validate the change, and update the ticket status. Use when implementation planning is complete and the next step is Ralph-style one-ticket-at-a-time execution.
---

# Execute Me

## When to use

- `docs/issues.md` exists and at least one ticket is ready for AFK execution
- The PRD and planning artifacts are already in place
- The user wants Ralph-style execution: one ticket per run
- The next step is implementation, not more planning

## Do not use when

- `docs/issues.md` does not exist or is too ambiguous to execute from
- No AFK ticket is ready because all remaining tickets are blocked or HITL
- The project still needs Phase 4 PRD refinement or Phase 5 planning work
- The user wants a broad implementation sweep across multiple tickets in one run
- The main need is to route a vague request to the right phase or artifact before execution begins; use `triage-me`
- The requirements are still too unclear to execute safely; use `prd-me`
- The implementation plan still needs ticket breakdown or dependency cleanup; use `issues-me`
- The selected work is really a diagnosis problem that still needs reproduction or isolation first; use `diagnose-me`
- The user wants structured verification planning or QA findings capture rather than a one-ticket execution loop; use `qa-me`

---

## Workflow

### 0. Stay in execution mode

While this skill is active:
- Execute **exactly one** ticket
- Do not silently pick up a second ticket in the same run
- Do not rewrite the plan unless a real blocker forces a status update
- You may update `docs/issues.md`
- You may edit implementation files needed for the selected ticket
- Do not claim a ticket is `done`, `fixed`, `pass`, or `ready` without fresh verification evidence from the current run
- Do not commit by default; only commit if the user explicitly asks for commit-per-ticket behavior

### 1. Validate readiness

Before touching code, check whether Phase 6 is justified.

Execution is justified when all of these are true:
- `docs/issues.md` exists
- there is at least one ticket with `Status: todo` and `Type: AFK`
- that ticket is not blocked by unresolved dependencies
- the ticket has enough scope and acceptance criteria to implement safely

If there is no ready AFK ticket, stop and say whether the loop is blocked by HITL work, missing dependencies, or planning ambiguity.

### 2. Inspect local artifacts first

Before choosing the ticket, inspect relevant local artifacts if they exist:
- `docs/issues.md`
- `docs/prd.md`
- `docs/research.md`
- `docs/prototype/comparison.md`
- `docs/idea.md` when needed for intent clarification

Use them to extract:
- ticket priority from ordering in `docs/issues.md`
- the next ready AFK ticket
- acceptance criteria and source requirements
- relevant constraints, research findings, and prototype decisions

Do not ask the user for information that already exists in the repo.

### 3. Select exactly one ready AFK ticket

Selection rules:
- pick the first ticket in `docs/issues.md` that has `Status: todo` and `Type: AFK`
- all entries in `Depends on` must already be satisfied
- do not select `HITL` tickets
- if multiple tickets are ready, trust the file order unless the user says otherwise

State clearly which ticket you selected and why it is ready.

### 4. Mark intent before implementation

Before editing code, update the selected ticket to `Status: in-progress` unless there is a good reason not to touch the file yet.

If execution later fails or becomes ambiguous, update the ticket again to `blocked` with a concise reason.

### 5. Gather execution context

Read the code and files relevant to the selected ticket.

Focus on:
- the ticket's acceptance criteria
- the PRD sections it references
- nearby code paths and existing patterns
- any research or prototype guidance that materially affects implementation
- whether the ticket is suitable for TDD through a public interface

If the area is unfamiliar, zoom out before editing:
- identify the relevant modules and major callers
- summarize the code path at one level above the line-by-line implementation
- use that map to keep the change targeted and avoid breaking adjacent flows

Prefer minimal, targeted changes over broad refactors.

### 6. Implement only that ticket

Make only the changes required to satisfy the selected ticket.

Execution rules:
- do not expand scope to "while I'm here" improvements
- do not absorb neighboring tickets into this run
- if a prerequisite is actually missing, stop and mark the ticket blocked
- if the ticket text is too ambiguous to implement safely, ask a targeted question or mark it blocked
- if the selected work is really a diagnosis problem rather than a clear execution task, mark it blocked and recommend `diagnose-me`
- when the ticket changes observable behavior and a practical public-interface test exists, default to TDD via a vertical red-green-refactor loop rather than implementation-first work
- in TDD mode, write one failing test for one behavior, run it and confirm the expected failure, implement the minimum code to pass it, then repeat
- do not write all tests up front before implementation; avoid horizontal slicing
- if TDD is not a good fit for an otherwise testable behavior change, say so explicitly, explain why, and use the smallest trustworthy validation instead

### 7. Validate before marking done

Before any `done`, `fixed`, `pass`, or `ready` claim, gather fresh verification evidence from the current run.

Run the most relevant validation available, such as:
- targeted tests
- project test suite when appropriate
- lint
- typecheck
- focused manual verification when no automation exists

Do not mark the ticket done unless the acceptance criteria are plausibly satisfied and you have fresh validation evidence.

If the ticket is risky, add an independent review pass before final completion judgment.

Review is **required or strongly preferred** when one or more of these are true:
- the change spans multiple files and affects observable behavior
- the change touches a shared contract, shared prompt/policy surface, or other behavior used by multiple flows
- the change is readiness-sensitive, such as release, merge, safety, or workflow-governance behavior
- the parent would otherwise be relying too heavily on its own implementation judgment

When independent review is used, review in this order:
1. requirement fit — does the change satisfy the ticket acceptance criteria and PRD intent without underbuilding or overbuilding?
2. code quality / boundary drift — is the implementation clean enough, and did it avoid unnecessary expansion or collateral change?

If validation fails and you cannot resolve it within the selected ticket's scope, mark the ticket `blocked` and explain why.
If TDD was practical but skipped, explain the reason briefly in your report.

### 8. Update `docs/issues.md`

After execution:
- set the ticket to `done` if the work and validation are complete
- set the ticket to `blocked` if execution is stopped by ambiguity, dependency, or required human input
- update `Notes / risks` with concise execution notes when useful
- do not change unrelated tickets except to keep dependency status honest if the selected ticket's completion clearly unblocks them conceptually

### 9. Report loop status

Close with one of these outcomes:
- selected ticket complete; next AFK ticket may start
- selected ticket blocked on dependency
- selected ticket blocked on HITL decision
- all ready AFK tickets complete
- execution should return to planning or PRD refinement

If the selected ticket is complete, include a minimum completion-evidence bundle:
- `Ticket`
- `Files changed`
- `Validation commands`
- `Validation summary`
- `TDD used: yes/no`
- `If no, why`
- `Remaining risks` or `none`

If the repo now needs broader release-style verification, recommend `qa-me` explicitly rather than treating that as part of the same execution run.

Be specific about what happened and what should happen next.

---

## Ticket selection rules

Interpret ticket readiness conservatively.

A ticket is ready only if:
- `Status: todo`
- `Type: AFK`
- `Depends on` is `none`, or every dependency is already complete
- no note in the ticket contradicts readiness

If `docs/issues.md` is inconsistent or unclear about dependencies, stop and surface the ambiguity instead of guessing.

---

## Validation rules

- Prefer the smallest validation that gives trustworthy evidence.
- Fresh evidence from the current run is required before any `done`, `fixed`, `pass`, or `ready` claim.
- When a behavior change has a practical public-interface test, default to test-first validation with a red-green-refactor loop rather than implementation-first work.
- If a ticket affects behavior already covered by tests, run those tests.
- If you added tests during execution, run the new tests plus any nearby relevant tests.
- If a ticket affects shared contracts or types, include typechecking.
- If TDD is not practical for the ticket, say so explicitly, explain why, and describe the alternative validation used.
- If no automated validation exists, say that explicitly and describe the manual checks performed.
- Validation is part of the ticket, not optional cleanup.

---

## Gotchas

- Do not execute multiple tickets in one run.
- Do not pick a `HITL` ticket just because it appears first.
- Do not mark `done` without validation evidence.
- Do not silently rewrite acceptance criteria to fit the implementation you prefer.
- Do not ignore a blocker to keep the loop moving.
- Do not drift into opportunistic refactors unless the ticket explicitly requires them.
- Do not stay trapped in local implementation detail when a quick module/caller map would reveal the safer change boundary.
- Do not force TDD onto tickets where docs/config/setup work or a missing test harness would significantly expand the ticket scope.
- Do not write a bulk wall of tests before implementation; keep TDD vertical.
- Do not commit unless the user explicitly asked for commit-per-ticket execution.

---

## Verification

Minimum smoke test:

```bash
/reload
/skill:execute-me
```

A good run of this skill produces:

**Opening:**
> Identifies the next ready AFK ticket, why it is ready, and which artifacts will guide implementation.

**During execution:**
> Works only on the selected ticket, validates the change, and keeps scope tight.

**Artifact update:**
> `docs/issues.md` reflects `in-progress`, then either `done` or `blocked`, with concise notes if needed.

**Closing:**
> States whether the loop can continue with another AFK ticket or whether HITL, blockers, planning work, or QA are now required.

### Trigger validation

**Should trigger:**
- "Execute the next ready AFK ticket from `docs/issues.md`."
- "Implement one ticket from `docs/issues.md` and update its status."
- "Run one Ralph-style execution step for this repo."

**Should not trigger:**
- "Route this vague request to the right phase and artifact." → use `triage-me`
- "Refine `docs/prd.md`; the requirements are still too unclear to execute." → use `prd-me`
- "Break this PRD into tickets in `docs/issues.md`." → use `issues-me`
- "Help me reproduce and isolate this flaky failure before we fix it." → use `diagnose-me`
- "Create a QA plan from the PRD and current implementation state." → use `qa-me`

**Borderline:**
- "Implement this bug fix from `docs/issues.md`, but I'm not sure the root cause is actually understood yet." → use `execute-me` only if the ticket is truly execution-ready; otherwise stop and recommend `diagnose-me`

### Artifact verification

If the session updates execution tracking:
- verify the file path is exactly `docs/issues.md`
- verify exactly one selected ticket changed status through a valid flow such as `todo` → `in-progress` → `done` or `blocked`
- verify no second ticket was silently picked up in the same run
- verify `Notes / risks` were updated only when useful and kept concise
- verify unrelated tickets were not rewritten except for honest dependency-state maintenance
- verify validation evidence exists before marking the ticket `done`
- verify the closing recommendation points to the correct next step such as another AFK execution run, `diagnose-me`, planning refinement, or `qa-me`

### Smoke test

1. `/reload`
2. `/skill:execute-me`
3. Give a prompt such as: `Execute the next ready AFK ticket from docs/issues.md`
4. Verify that the agent:
   - checks readiness first
   - selects exactly one AFK ticket
   - does not work on a second ticket
   - validates the change before marking done
   - updates `docs/issues.md`
   - reports whether the loop can continue
