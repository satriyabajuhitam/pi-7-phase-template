# Issues

## Planning assumptions
- Source PRD:
- Planning scope:
- Prototype winner:
- Key constraints:

## Dependency rules
- Foundation or contract tickets should land before downstream slices that rely on them.
- QA or verification tickets should depend on the relevant feature slices being complete.
- Shared behavior or schema decisions that affect multiple slices should be captured explicitly as blockers.

## Ticket conventions
- `Status`: `todo`, `in-progress`, `blocked`, `done`
- `Type`: `AFK`, `HITL`
- `Depends on`: `none` or explicit ticket IDs
- `Blocks`: explicit ticket IDs or blank when none
- `Parallelizable`: `yes`, `no`
- QA follow-up: reopen an existing ticket if the original scope still fits; otherwise add a new ticket

## Parallelization plan
Can start immediately:
- 

Blocked until prerequisites complete:
- 

Suggested lanes:
- Lane A:
- Lane B:
- Lane C:

## Tickets

### ISSUE-001 — Short title
- Status: todo
- Type: AFK
- Goal:
- Why it exists:
- Depends on: none
- Blocks:
- Parallelizable: yes
- Source requirements:
  - 
- Scope:
  - 
- Execution brief (optional):
  - Use only when the ticket is non-trivial and at least one of these is true: multiple workflow surfaces/file areas make boundary drift likely, the validation path is not obvious, or one short out-of-scope guardrail would reduce ticket creep.
  - Omit it when the ticket is already clear enough from goal, scope, and acceptance criteria alone, and delete this whole section rather than leaving an empty placeholder.
  - Keep it brief: likely touchpoints, validation focus, or one explicit out-of-scope guardrail.
- Acceptance criteria:
  - [ ]
  - [ ]
- Notes / risks:
  - 
