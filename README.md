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
