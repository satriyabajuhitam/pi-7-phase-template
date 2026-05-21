# triage-me

Project-local Pi skill for local-first intake and routing.

## Purpose

Use this skill when a new bug report, feature request, refactor proposal, QA finding, or vague work item arrives and you need to decide which local artifact and next phase should own it.

## Use a different skill when

- you mainly need to pressure-test or sharpen an idea before deciding its phase → `grill-me`
- you already know the task needs a real research pass on external dependencies or difficult docs → `research-me`
- you need exploratory comparison of multiple concrete directions → `prototype-me`
- you already know the next step is writing or refining `docs/prd.md` → `prd-me`
- you want a structured QA plan or findings capture rather than intake routing → `qa-me`

## Usage

```bash
/skill:triage-me
```

Example prompts:
- `Triage this bug report and decide whether it needs info, planning, or execution`
- `Triage this feature request and route it to the right local artifact`
- `Triage this QA finding and decide whether to reopen an existing ticket or add a new one`

## Expected behavior

- inspects local artifacts first
- classifies the intake item as bug, enhancement, refactor, or process/question
- attempts lightweight bug reproduction when relevant
- recommends exactly one local triage state
- routes the item to the smallest correct local artifact
- updates the destination artifact when the destination is obvious or requested
- recommends the next phase clearly
- may recommend `diagnose-me` when a bug still needs disciplined reproduction and isolation
- does not jump into implementation

## Local triage states

- `needs-info`
- `needs-repro`
- `needs-idea`
- `needs-research`
- `needs-prototype`
- `needs-prd`
- `needs-planning`
- `ready-for-execution`
- `hitl`
- `wont-do`

These are local triage recommendations, not issue-tracker labels.

## Smoke test

```bash
/reload
/skill:triage-me
```

Then verify behavior with these prompts:

**Should trigger**
- `Triage this bug report and decide whether it needs info, planning, or execution`
- `Triage this feature request and route it to the right local artifact`
- `Triage this QA finding and decide whether to reopen an existing ticket or add a new one`

**Should not trigger**
- `Grill me on this idea before we decide what phase it belongs to.`
- `Research the provider constraints for this integration and summarize them in docs/research.md.`
- `Prototype three variations for this onboarding flow before we commit.`
- `Write docs/prd.md from the existing idea and research artifacts.`
- `Create a QA plan from the PRD and current implementation state.`

**Borderline**
- `This bug might be real, but the report is thin and I mainly need to know what should happen next.`

For a successful run, verify that the agent:
1. checks the repo context first
2. classifies the item clearly
3. attempts bug reproduction when relevant
4. recommends exactly one triage state
5. recommends one destination artifact and one next step
6. avoids premature implementation
7. writes only to the smallest correct artifact when a written outcome is needed
