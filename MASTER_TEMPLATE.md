# MASTER_TEMPLATE.md

## Purpose

This repository is intended to serve as a **clean master template** for the local 7-phase AI-assisted development workflow used in this project.

It is not a product app by itself.
It is a reusable workflow starter that provides:
- `AGENTS.md`
- phase skills under `.pi/skills/`
- prompt templates under `.pi/prompts/`
- empty artifact files under `docs/`
- `GUIDE.md` as the usage guide

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

### Artifact files
- `docs/idea.md`
- `docs/research.md`
- `docs/prd.md`
- `docs/issues.md`
- `docs/qa.md`
- `docs/prototype/`

---

## Intended use

Use this repo as a starting point when you want to create a new project that follows the same workflow.

Recommended flow:
1. publish this repo as a **GitHub template repository**
2. click **Use this template** to create a new project repo
3. clone the new repo locally
4. open the new project in Pi
5. run `/reload`
6. start with `/idea`

---

## Recommended project creation process

Preferred path:

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

---

## First command in a new project

After opening the copied project in Pi:

```txt
/reload
```

Then begin with:

```txt
/idea [your new project idea]
```

---

## Notes

- `GUIDE.md` explains how to use the workflow with a simple from-scratch app example.
- `AGENTS.md` defines the repo rules and workflow invariants.
- The source of truth during project execution should live under `docs/`.
