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
- `grill-me`
- `firecrawl-cli`
- `research-me`
- `prototype-me`
- `prd-me`
- `issues-me`
- `execute-me`
- `qa-me`

---

## Included prompts

After opening the project in Pi and running `/reload`, these prompts are available:

- `/idea`
- `/research`
- `/prototype`
- `/prd`
- `/issues`
- `/execute`
- `/qa`

---

## Recommended usage

### Option A — Best: use as a GitHub template

1. Publish this repo to GitHub
2. Enable **Template repository** in GitHub settings
3. Click **Use this template** to create a new project repo
4. Clone the new repo locally
5. Open it in Pi
6. Run:

```txt
/reload
```

7. Start with:

```txt
/idea [your new project idea]
```

### Option B — Local copy

If you are not using GitHub templates yet, see:
- `MASTER_TEMPLATE.md`
- `GUIDE.md`

for copy/setup guidance.

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

---

## Read next

- `GUIDE.md` — step-by-step usage guide with a simple from-scratch app example
- `MASTER_TEMPLATE.md` — notes for using this repo as a reusable template base
- `AGENTS.md` — repository workflow rules for agents

---

## Status

This repository is intended to stay **clean**:
- `docs/` artifacts should be empty in the template
- `.firecrawl/` should not be committed
- project-specific sample outputs should not remain in the template
