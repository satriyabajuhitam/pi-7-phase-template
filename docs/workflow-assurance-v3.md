# Workflow assurance v3

This repo now has a lightweight local assurance path for the v3 planning/closeout hardening slice.

## What to run

### 1. Readiness gate validator

```bash
node scripts/validate-readiness-gates.mjs
```

Purpose:
- validates active `docs/idea.md` and `docs/prd.md`
- checks handoff structure, blocker semantics, checklist readiness, and the exact PRD planning-approval signal when `docs/prd.md` is ready for planning

### 2. Planning/closeout guidance assurance

```bash
node scripts/validate-planning-closeout-guidance.mjs
```

Purpose:
- checks that the hardened execution-brief rule still exists across the core planning surfaces
- checks that the bounded `finish-me` repo-state posture still exists across the core closeout surfaces
- helps detect wording-anchor drift without pretending to simulate the full workflow

## What is machine-checked

- active handoff structure for `idea -> PRD`
- active handoff structure for `PRD -> issues`
- exact `Planning approval: approved for issues planning (correctness and scope)` signal when an active PRD is marked ready for planning
- presence of the current execution-brief threshold anchors across:
  - `.pi/skills/issues-me/SKILL.md`
  - `.pi/skills/issues-me/assets/issues-template.md`
  - `AGENTS.md`
- presence of the current bounded `finish-me` posture anchors across:
  - `.pi/skills/finish-me/SKILL.md`
  - `AGENTS.md`

## What is still manual

- live issues-planning behavior from a real planning run
- live closeout behavior from a real finish review
- whether the wording is still the best wording, not just present wording
- broader workflow-fit judgment, over-ceremony risk, and any intentional semantic change

## Why this stays lightweight

- no new mandatory worktree flow
- no full workflow simulation harness
- no broad policy engine for every phase
- no extra CI workflow beyond the existing readiness-gate workflow

Use this as a narrow drift-detection and confidence aid, not as a full proof of workflow correctness.
