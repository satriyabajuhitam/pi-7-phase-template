# issues-me

Project-local Pi skill for Phase 5 implementation planning.

## Purpose

Use this skill when `docs/prd.md` is ready and the next step is to turn it into a local kanban-style execution plan in `docs/issues.md`. The skill breaks the PRD into vertical slices, marks dependencies and blockers, identifies parallel work, and distinguishes AFK from HITL tickets.

## Usage

```bash
/skill:issues-me
```

Example prompts:
- `Break docs/prd.md into docs/issues.md for execution planning`
- `Create a local ticket breakdown from the PRD with blockers and parallel lanes`
- `Refine docs/issues.md so the slices are smaller and more parallelizable`

## Expected behavior

- checks whether the project is ready for Phase 5
- inspects local artifacts first
- reads `assets/issues-template.md` before drafting
- writes or refines `docs/issues.md`
- uses vertical slices instead of horizontal layer tickets
- marks tickets as `AFK` or `HITL` when relevant
- makes dependencies and parallelization explicit
- recommends the next phase clearly

## Included asset

- `assets/issues-template.md` — default structure for `docs/issues.md`

## Smoke test

```bash
/reload
/skill:issues-me
```

Then provide a prompt with an existing PRD and verify that the agent:
1. checks readiness first
2. inspects local context before asking questions
3. uses `assets/issues-template.md`
4. writes vertical-slice tickets with acceptance criteria
5. makes blockers and parallel lanes explicit
6. recommends the next phase clearly
