# qa-me

Project-local Pi skill for Phase 7 QA.

## Purpose

Use this skill when implementation needs structured verification before release or the next execution loop. The skill creates or updates `docs/qa.md`, turns the PRD and issue status into a QA plan, captures findings when evidence exists, and recommends follow-up work.

## Usage

```bash
/skill:qa-me
```

Example prompts:
- `Create docs/qa.md from the PRD, completed issues, and current implementation state`
- `Build a QA checklist for the implemented flows and identify likely follow-up issues`
- `Update docs/qa.md with findings and recommend whether to return to execution`

## Expected behavior

- checks whether the project is ready for Phase 7
- inspects local artifacts first
- reads `assets/qa-template.md` before drafting
- writes or refines `docs/qa.md`
- distinguishes automated checks from human review needs
- captures findings only when evidence exists
- recommends follow-up work and the next phase clearly

## Included asset

- `assets/qa-template.md` — default structure for `docs/qa.md`

## Smoke test

```bash
/reload
/skill:qa-me
```

Then provide a prompt with existing PRD and issue artifacts and verify that the agent:
1. checks readiness first
2. inspects local context before asking questions
3. uses `assets/qa-template.md`
4. writes actionable QA scenarios and review checklist
5. records findings only when evidence exists
6. recommends the next phase clearly
