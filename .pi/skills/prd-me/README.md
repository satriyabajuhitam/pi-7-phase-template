# prd-me

Project-local Pi skill for Phase 4 PRD writing.

## Purpose

Use this skill when the idea, research, and prototype outcomes are clear enough to define the product requirements in `docs/prd.md`. The skill turns earlier project artifacts into a concise PRD focused on end-state behavior, scope, edge cases, and acceptance criteria, and it expects zero or one prototype winner feeding the PRD.

## Usage

```bash
/skill:prd-me
```

Example prompts:
- `Write docs/prd.md from docs/idea.md, docs/research.md, and docs/prototype/comparison.md`
- `Draft a PRD for this feature based on the existing idea and prototype artifacts`
- `Refine docs/prd.md and close the most important gaps only`

## Expected behavior

- checks whether the project is ready for Phase 4
- inspects local artifacts first
- requires zero or one prototype winner before drafting
- reads `assets/prd-template.md` before drafting
- asks only high-leverage clarification questions when needed
- writes or refines `docs/prd.md`
- focuses on user-visible behavior, scope, non-goals, requirements, edge cases, and acceptance criteria
- avoids turning the PRD into an implementation plan
- recommends the next phase clearly

## Included asset

- `assets/prd-template.md` — default structure for `docs/prd.md`

## Smoke test

```bash
/reload
/skill:prd-me
```

Then provide a prompt with existing idea, research, or prototype artifacts and verify that the agent:
1. checks readiness first
2. inspects local context before asking questions
3. uses `assets/prd-template.md`
4. refuses to proceed when multiple prototype directions are still active
5. writes a PRD centered on end-state behavior
6. captures edge cases and acceptance criteria
7. recommends the next phase clearly
