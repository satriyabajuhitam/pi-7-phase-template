# pi-7-phase-template

Clean template repository for a Pi-based **7-phase AI-assisted development workflow**.

This repo is designed to be used as a **GitHub template repository** for starting new projects with a structured workflow:

1. Idea
2. Research
3. Prototype
4. PRD
5. Issues / Kanban planning
6. Execution
7. QA

---

## What this template includes

- `AGENTS.md` with project workflow rules
- project-local skills under `.pi/skills/`
- prompt templates under `.pi/prompts/`
- empty artifact files under `docs/`
- `GUIDE.md` with a practical usage walkthrough
- `MASTER_TEMPLATE.md` explaining how to use this repo as a reusable master template

Bundled project-local skills include:
- `triage-me`
- `diagnose-me`
- `grill-me`
- `firecrawl-cli`
- `research-me`
- `prototype-me`
- `prd-me`
- `issues-me`
- `execute-me`
- `qa-me`
- `finish-me`

---

## Included prompts

After opening the project in Pi and running `/reload`, these prompts are available:

Core 7-phase flow:
- `/idea`
- `/research`
- `/prototype`
- `/prd`
- `/issues`
- `/execute`
- `/qa`

Optional helpers:
- `/triage`
- `/diagnose`
- `/finish`

---

## Quick start

1. Click **Use this template** on GitHub
2. Create your new repository
3. Clone the new repo locally
4. Open it in Pi
5. Run:

```txt
/reload
```

6. Start with:

```txt
/idea [your new project idea]
```

## Recommended usage

### Best path: use as a GitHub template

Example:

```bash
git clone git@github.com:YOUR_USERNAME/your-new-project.git
cd your-new-project
```

If you are not using SSH yet:

```bash
git clone https://github.com/YOUR_USERNAME/your-new-project.git
cd your-new-project
```

### Maintainer notes

If you are maintaining or republishing this workflow as your own master template, see:
- `MASTER_TEMPLATE.md`
- `GUIDE.md`

for template-management and usage details.

---

## Core artifacts

The workflow uses these files as source of truth:

- `docs/idea.md`
- `docs/research.md`
- `docs/prototype/`
- `docs/prd.md`
- `docs/issues.md`
- `docs/qa.md`

---

## Workflow principles

- Do not jump straight to implementation when the problem is still unclear
- If prototyping is used, select exactly **one** prototype winner before PRD
- `docs/prd.md` is the requirements source of truth
- `docs/issues.md` is the execution source of truth
- Execution follows a Ralph-style pattern: **one run, one ready AFK ticket**
- QA feeds findings back into the execution loop when needed
- oversized requests should be decomposed before they are forced into one PRD or one issue board
- `docs/idea.md` should not hand off to PRD until `## Handoff to PRD` says `Ready for next phase: yes`
- `docs/prd.md` should not hand off to Issues until `## Handoff to Issues` says `Ready for next phase: yes`
- planning should not proceed from `docs/prd.md` unless `## Handoff to Issues` also records the exact approval signal `Planning approval: approved for issues planning (correctness and scope)`
- non-trivial tickets should use an optional execution brief only when it actually reduces ambiguity: likely multi-surface boundary drift, non-obvious validation focus, or one short out-of-scope guardrail; otherwise omit the brief and keep the board light
- `/finish` is a lightweight closeout helper for recommending the next action after execution and/or QA; repo-state checks stay bounded to small relevant signals such as dirty working tree, relevant workflow-artifact presence, or current branch context when PR/merge judgment is the actual question

---

## Readiness gate validation

This template now includes a lightweight readiness-gate validator for the currently hardened handoffs:
- `idea -> PRD` via `docs/idea.md`
- `PRD -> issues` via `docs/prd.md`

Run it locally for advisory feedback:

```bash
node scripts/validate-readiness-gates.mjs
```

What it checks for active (non-empty) artifacts:
- required handoff section exists
- `Ready for next phase: yes/no` exists
- `Primary blocker` exists
- active ready PRDs must also carry the exact signal `Planning approval: approved for issues planning (correctness and scope)`
- readiness `no` cannot use an empty or placeholder blocker
- readiness `yes` cannot leave handoff checklist items unchecked

Important behavior:
- empty `docs/idea.md` and `docs/prd.md` are treated as clean template-state artifacts and are skipped
- local runs are **advisory**
- CI runs the same validator in **blocking** mode via `.github/workflows/readiness-gates.yml`
- this validator is still intentionally narrow; it does **not** yet harden downstream handoffs such as `issues -> execute`, `execute -> QA`, or `QA -> release`

---

## Planning/closeout assurance

This template also includes a second lightweight local assurance check for the v3 planning/closeout hardening slice:

```bash
node scripts/validate-planning-closeout-guidance.mjs
```

What it machine-checks:
- the current execution-brief threshold anchors across `issues-me`, `/issues`, the issues template, and `AGENTS.md`
- the current bounded `/finish` posture anchors across `finish-me`, `/finish`, and `AGENTS.md`

What it does **not** prove:
- live `/issues` behavior from a real planning run
- live `/finish` behavior from a real closeout run
- whether the wording is the best possible wording rather than just the current expected wording

Use the assurance path as narrow drift detection, not as a full workflow simulation or release-management system.

---

## Read next

- `GUIDE.md` — step-by-step usage guide with a simple from-scratch app example
- `docs/workflow-assurance-v3.md` — compact reference for the current planning/closeout assurance path
- `MASTER_TEMPLATE.md` — notes for using this repo as a reusable template base
- `AGENTS.md` — repository workflow rules for agents

---

## Status

This repository is intended to stay **clean**:
- `docs/` artifacts should be empty in the template
- `.firecrawl/` should not be committed
- project-specific sample outputs should not remain in the template
