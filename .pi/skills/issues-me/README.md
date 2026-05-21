# issues-me

Project-local Pi skill for Phase 5 implementation planning.

## Purpose

Use this skill when `docs/prd.md` is ready and the next step is to turn it into a local kanban-style execution plan in `docs/issues.md`. The skill breaks the PRD into vertical slices, marks dependencies and blockers, identifies parallel work, and distinguishes AFK from HITL tickets.

## Use a different skill when

- you mainly need to route a vague request to the right phase or artifact before planning begins → `triage-me`
- the PRD still needs refinement before tickets can be planned confidently → `prd-me`
- you want to execute a ready ticket rather than create or refine the plan → `execute-me`
- you want a QA plan or need to capture verification findings rather than implementation slices → `qa-me`

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
- checks `## Handoff to Issues` in `docs/prd.md` before planning
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

Then verify behavior with these prompts:

**Should trigger**
- `Break docs/prd.md into docs/issues.md for execution planning`
- `Create a local ticket breakdown from the PRD with blockers and parallel lanes`
- `Refine docs/issues.md so the slices are smaller and more parallelizable`

**Should not trigger**
- `Route this vague request to the right phase and artifact.`
- `Refine docs/prd.md; the requirements are still too fuzzy to plan.`
- `Execute the next ready ticket from docs/issues.md.`
- `Create a QA plan from the PRD and current implementation state.`

**Borderline**
- `The PRD is mostly ready, but one dependency is still a little fuzzy; can you plan the tickets anyway?`

For a successful run, verify that the agent:
1. checks readiness first
2. checks `## Handoff to Issues` in `docs/prd.md` before planning
3. inspects local context before asking questions
4. uses `assets/issues-template.md`
5. writes vertical-slice tickets with acceptance criteria
6. marks `AFK` vs `HITL` where relevant
7. makes blockers and parallel lanes explicit
8. keeps the plan in `docs/issues.md` rather than editing unrelated implementation files
9. does not plan from a PRD whose handoff still says it is not ready
10. recommends the next phase clearly, usually execution via `execute-me` for one ready `AFK` ticket
