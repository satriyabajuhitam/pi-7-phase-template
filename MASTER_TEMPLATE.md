# MASTER_TEMPLATE.md

## Purpose

This file is primarily for the **maintainer of the template**, not the end user of a project created from the template.

This repository is intended to serve as a **clean master template** for the local 7-phase AI-assisted development workflow used in this project.

It is not a product app by itself.
It is a reusable workflow starter that provides:
- `AGENTS.md`
- phase skills under `.pi/skills/`
- prompt templates under `.pi/prompts/`
- empty artifact files under `docs/`
- a local readiness validator under `scripts/validate-readiness-gates.mjs`
- a local planning/closeout guidance audit under `scripts/validate-planning-closeout-guidance.mjs`
- a CI readiness-check workflow under `.github/workflows/readiness-gates.yml`
- `GUIDE.md` as the usage guide

If you want to **use** the template for a new project, start with `README.md` and `GUIDE.md`.
If you want to **maintain or republish** the template itself, this file is the right reference.

---

## What this template includes

### Workflow phases
- Phase 1 — Idea
- Phase 2 — Research
- Phase 3 — Prototype
- Phase 4 — PRD
- Phase 5 — Issues / Kanban planning
- Phase 6 — Execution
- Phase 7 — QA

### Optional helpers
- Local intake / triage via `/triage`
- Local diagnosis via `/diagnose`
- Local closeout recommendation via `/finish`

### Project-local skills
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

### Prompt templates
- `/triage` (optional helper)
- `/diagnose` (optional helper)
- `/idea`
- `/research`
- `/prototype`
- `/prd`
- `/issues`
- `/execute`
- `/qa`
- `/finish` (optional helper)

### Artifact files
- `docs/idea.md`
- `docs/research.md`
- `docs/prd.md`
- `docs/issues.md`
- `docs/qa.md`
- `docs/workflow-assurance-v3.md`
- `docs/prototype/`

---

## Maintainer workflow

Use this repo as the source template when you want to maintain, improve, or republish the workflow for future projects.

Recommended maintainer flow:
1. keep the repo clean and generic
2. publish it as a **GitHub template repository**
3. direct end users to click **Use this template**
4. keep `README.md` and `GUIDE.md` consumer-facing
5. keep `MASTER_TEMPLATE.md` focused on template maintenance

---

## How end users should create projects

Preferred path for end users:

1. Open the template repo on GitHub
2. Click **Use this template**
3. Create a new repository
4. Clone the new repository locally

Example:

```bash
git clone git@github.com:YOUR_USERNAME/my-new-project.git
cd my-new-project
```

If you need a manual local copy instead, you can still copy the repo contents yourself, but the primary recommended path is the GitHub template flow above.

---

## Clean-template expectations

This master template should stay clean:
- keep `docs/` artifacts empty by default
- do not leave project-specific prototype outputs in the template
- do not leave `.firecrawl/` retrieval cache in the template
- avoid adding app-specific sample code unless it is clearly marked as disposable example material
- keep maintainer-only notes out of `README.md` unless they are also useful to end users
- prefer project-local skills and prompts so the template stays portable
- keep readiness validation compatible with empty template-state artifacts
- keep the planning/closeout assurance path narrow and advisory unless there is a deliberate decision to add more ceremony

Current readiness-validation scope for this template:
- covered now: `idea -> PRD` and `PRD -> issues`, including the exact PRD planning-approval signal when an active PRD is ready for planning
- not covered yet: downstream handoffs such as `issues -> execute`, `execute -> QA`, or `QA -> release`

Current planning/closeout-assurance scope for this template:
- covered now: execution-brief threshold anchors and bounded `/finish` posture anchors across the core skill/prompt/template/policy surfaces
- still manual: live `/issues` behavior, live `/finish` behavior, and broader workflow-fit judgment

### Maintainer checklist before publish

- confirm `docs/` artifacts are empty
- confirm `.firecrawl/` is empty or ignored
- confirm no disposable sandbox/example output remains
- confirm readiness validator still skips empty template-state artifacts
- confirm `.github/workflows/readiness-gates.yml` and `scripts/validate-readiness-gates.mjs` still match the documented behavior
- confirm `scripts/validate-planning-closeout-guidance.mjs` and `docs/workflow-assurance-v3.md` still match the documented bounded assurance behavior
- confirm new skills and prompts are documented in `README.md`, `GUIDE.md`, and `AGENTS.md` when relevant
- confirm template instructions still point to the GitHub template flow as the default path

---

## First command in a new project

After an end user opens the generated project in Pi:

```txt
/reload
```

Then begin with:

```txt
/idea [your new project idea]
```

---

## Notes

- `README.md` should stay optimized for first-time visitors to the GitHub repo.
- `GUIDE.md` explains how to use the workflow with a simple from-scratch app example.
- `AGENTS.md` defines the repo rules and workflow invariants.
- The source of truth during project execution should live under `docs/`.
