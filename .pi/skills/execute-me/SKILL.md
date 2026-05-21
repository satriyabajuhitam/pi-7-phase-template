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

---

## Workflow

### 0. Stay in execution mode

While this skill is active:
- Execute **exactly one** ticket
- Do not silently pick up a second ticket in the same run
- Do not rewrite the plan unless a real blocker forces a status update
- You may update `docs/issues.md`
- You may edit implementation files needed for the selected ticket
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

Prefer minimal, targeted changes over broad refactors.

### 6. Implement only that ticket

Make only the changes required to satisfy the selected ticket.

Execution rules:
- do not expand scope to "while I'm here" improvements
- do not absorb neighboring tickets into this run
- if a prerequisite is actually missing, stop and mark the ticket blocked
- if the ticket text is too ambiguous to implement safely, ask a targeted question or mark it blocked

### 7. Validate before marking done

Run the most relevant validation available, such as:
- targeted tests
- project test suite when appropriate
- lint
- typecheck
- focused manual verification when no automation exists

Do not mark the ticket done unless the acceptance criteria are plausibly satisfied and you have some validation evidence.

If validation fails and you cannot resolve it within the selected ticket's scope, mark the ticket `blocked` and explain why.

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
- If a ticket affects behavior already covered by tests, run those tests.
- If a ticket affects shared contracts or types, include typechecking.
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
- Do not commit unless the user explicitly asked for commit-per-ticket execution.

---

## Verification

A good run of this skill produces:

**Opening:**
> Identifies the next ready AFK ticket, why it is ready, and which artifacts will guide implementation.

**During execution:**
> Works only on the selected ticket, validates the change, and keeps scope tight.

**Artifact update:**
> `docs/issues.md` reflects `in-progress`, then either `done` or `blocked`, with concise notes if needed.

**Closing:**
> States whether the loop can continue with another AFK ticket or whether HITL, blockers, or planning work are now required.

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
