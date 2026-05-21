# execute-me

Project-local Pi skill for Phase 6 execution.

## Purpose

Use this skill when `docs/issues.md` is ready and the next step is Ralph-style implementation. The skill selects exactly one ready `AFK` ticket, implements it, validates the change, and updates the ticket status.

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
- validates the change before marking the ticket done
- updates `docs/issues.md`
- reports whether execution can continue or is blocked
- does not commit unless explicitly asked

## Smoke test

```bash
/reload
/skill:execute-me
```

Then provide a prompt with an existing `docs/issues.md` and verify that the agent:
1. checks readiness first
2. selects exactly one ready `AFK` ticket
3. does not drift into a second ticket
4. validates the result
5. updates `docs/issues.md`
6. reports whether the loop can continue
