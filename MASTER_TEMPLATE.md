# MASTER_TEMPLATE.md

## Purpose

This file is for the **maintainer of the template**, not the end user of a generated project.

This repository is intended to stay a **clean master template** for a local 7-phase AI-assisted development workflow.

It is a reusable workflow starter that provides:
- `AGENTS.md`
- phase skills under `.pi/skills/`
- empty artifact files under `docs/`
- local validators under `scripts/`
- `README.md` and `GUIDE.md` for consumer-facing usage

This template is **skill-first**:
- end users should interact with the agent in natural language
- the agent is expected to infer and load the relevant local skill directly

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
- Local codebase absorb / orientation
- Local intake / triage
- Local diagnosis
- Local closeout recommendation

### Project-local skills
- `absorb-me`
- `triage-me`
- `diagnose-me`
- `grill-me`
- `research-me`
- `prototype-me`
- `prd-me`
- `issues-me`
- `execute-me`
- `qa-me`
- `finish-me`

### Web retrieval tooling
- `pi-firecrawler` extension/tooling for web retrieval

### Artifact files
- `docs/absorb.md`
- `docs/idea.md`
- `docs/research.md`
- `docs/prd.md`
- `docs/issues.md`
- `docs/qa.md`
- `docs/workflow-assurance-v3.md`
- `docs/prototype/`

---

## Maintainer workflow

Recommended maintainer flow:
1. keep the repo clean and generic
2. publish it as a **GitHub template repository**
3. direct end users to click **Use this template**
4. keep `README.md` and `GUIDE.md` consumer-facing
5. keep `MASTER_TEMPLATE.md` maintainer-focused
6. keep skills as the executable workflow layer
7. keep `docs/` as the artifact layer

---

## Clean-template expectations

This master template should stay clean:
- keep `docs/` artifacts empty by default
- do not leave project-specific prototype outputs in the template
- do not leave `.firecrawl/` retrieval cache in the template
- avoid adding app-specific sample code unless it is clearly disposable example material
- keep maintainer-only notes out of `README.md` unless they also help end users
- keep readiness validation compatible with empty template-state artifacts
- keep the planning/closeout assurance path narrow and advisory unless there is a deliberate decision to add more ceremony

### Skill-first expectations

- prefer updating skills and `AGENTS.md` over adding thin command wrappers
- document workflow examples as natural-language requests, not slash-command dependencies
- treat prompt-like wording in docs as examples only, not required invocation syntax
- keep existing-codebase absorb-gate wording aligned across `AGENTS.md`, `absorb-me`, `grill-me`, `README.md`, and `GUIDE.md`

---

## Assurance scope

Current readiness-validation scope:
- covered now: `idea -> PRD` and `PRD -> issues`, including the exact PRD planning-approval signal when an active PRD is ready for planning
- not covered yet: downstream handoffs such as `issues -> execute`, `execute -> QA`, or `QA -> release`

Current planning/closeout-assurance scope:
- covered now: execution-brief threshold anchors and bounded `finish-me` posture anchors across the core skill/template/policy surfaces
- still manual: live planning behavior, live closeout behavior, and broader workflow-fit judgment

---

## Maintainer checklist before publish

- confirm `docs/` artifacts are empty
- confirm `.firecrawl/` is empty or ignored
- confirm no disposable sandbox/example output remains
- confirm readiness validator still skips empty template-state artifacts
- confirm `.github/workflows/readiness-gates.yml` and `scripts/validate-readiness-gates.mjs` still match documented behavior
- confirm `scripts/validate-planning-closeout-guidance.mjs` and `docs/workflow-assurance-v3.md` still match the documented bounded assurance behavior
- confirm existing-codebase absorb-gate policy is consistent across `AGENTS.md`, `.pi/skills/absorb-me/SKILL.md`, `.pi/skills/grill-me/SKILL.md`, `README.md`, and `GUIDE.md`
- confirm new skills are documented in `README.md`, `GUIDE.md`, and `AGENTS.md` when relevant
- confirm template instructions still point to the GitHub template flow as the default path

---

## First command in a new project

After an end user opens the generated project in Pi:

```txt
/reload
```

Then they can begin with a natural-language request such as:

```txt
Saya ingin membuat app baru untuk [tujuan saya]. Tolong mulai dari fase idea dan pertajam scope v1-nya.
```

---

## Notes

- `README.md` should stay optimized for first-time visitors.
- `GUIDE.md` explains how to use the workflow with a simple from-scratch example.
- `AGENTS.md` defines repo rules and workflow invariants.
- The source of truth during project execution should live under `docs/`.
