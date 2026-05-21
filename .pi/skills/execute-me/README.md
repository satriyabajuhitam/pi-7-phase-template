# execute-me

Project-local Pi skill for Phase 6 execution.

## Purpose

Use this skill when `docs/issues.md` is ready and the next step is Ralph-style implementation. The skill selects exactly one ready `AFK` ticket, implements it, validates the change, and updates the ticket status. For behavior changes that are testable through a public interface, it should prefer TDD without making TDD mandatory for every ticket.

## Use a different skill when

- you mainly need to route a vague request to the right phase or artifact before execution begins → `triage-me`
- the requirements are still too unclear to execute safely → `prd-me`
- the implementation plan still needs ticket breakdown or dependency cleanup → `issues-me`
- the selected work is really a diagnosis problem that still needs reproduction or isolation first → `diagnose-me`
- you want structured verification planning or QA findings capture rather than a one-ticket execution loop → `qa-me`

## Usage

```bash
/skill:execute-me
```

Example prompts:
- `Execute the next ready AFK ticket from docs/issues.md`
- `Implement one ticket from docs/issues.md and update its status`
- `Run one Ralph-style execution step for this repo`

## Expected behavior

- checks whether the project is ready for Phase 6
- inspects local artifacts first
- selects exactly one ready `AFK` ticket
- keeps scope limited to that ticket
- prefers TDD for behavior changes that are testable through a public interface
- avoids forcing TDD for docs, config, setup, or other poor-fit tickets
- validates the change before marking the ticket done
- updates `docs/issues.md`
- reports whether execution can continue or is blocked
- does not commit unless explicitly asked

## Smoke test

```bash
/reload
/skill:execute-me
```

Then verify behavior with these prompts:

**Should trigger**
- `Execute the next ready AFK ticket from docs/issues.md`
- `Implement one ticket from docs/issues.md and update its status`
- `Run one Ralph-style execution step for this repo`

**Should not trigger**
- `Route this vague request to the right phase and artifact.`
- `Refine docs/prd.md; the requirements are still too unclear to execute.`
- `Break this PRD into tickets in docs/issues.md.`
- `Help me reproduce and isolate this flaky failure before we fix it.`
- `Create a QA plan from the PRD and current implementation state.`

**Borderline**
- `Implement this bug fix from docs/issues.md, but I'm not sure the root cause is actually understood yet.`

For a successful run, verify that the agent:
1. checks readiness first
2. selects exactly one ready `AFK` ticket
3. does not drift into a second ticket
4. validates the result before marking the ticket done
5. updates `docs/issues.md`
6. changes only the selected ticket status unless dependency honesty requires a minimal related update
7. reports whether the loop can continue or should hand off to planning, diagnosis, or QA
