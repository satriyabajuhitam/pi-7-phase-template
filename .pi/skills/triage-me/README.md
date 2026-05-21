# triage-me

Project-local Pi skill for local-first intake and routing.

## Purpose

Use this skill when a new bug report, feature request, refactor proposal, QA finding, or vague work item arrives and you need to decide which local artifact and next phase should own it.

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

Then provide a prompt with a bug report, feature request, QA finding, or refactor proposal and verify that the agent:
1. checks the repo context first
2. classifies the item clearly
3. attempts bug reproduction when relevant
4. recommends one destination artifact and one next step
5. avoids premature implementation
