# qa-me

Project-local Pi skill for Phase 7 QA.

## Purpose

Use this skill when implementation needs structured verification before release or the next execution loop. The skill creates or updates `docs/qa.md`, turns the PRD and issue status into a QA plan, captures findings when evidence exists, and recommends follow-up work.

## Use a different skill when

- you mainly need to route a vague request to the right phase or artifact before QA begins → `triage-me`
- the expected behavior is still too unclear to verify responsibly → `prd-me`
- the work still needs implementation planning rather than verification → `issues-me`
- you want to execute a ready ticket rather than run structured verification → `execute-me`
- a failure still needs reproduction, isolation, or diagnosis before follow-up work can be planned clearly → `diagnose-me`

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

Then verify behavior with these prompts:

**Should trigger**
- `Create docs/qa.md from the PRD, completed issues, and current implementation state`
- `Build a QA checklist for the implemented flows and identify likely follow-up issues`
- `Update docs/qa.md with findings and recommend whether to return to execution`

**Should not trigger**
- `Route this vague request to the right phase and artifact.`
- `Refine docs/prd.md; expected behavior is still too fuzzy to verify.`
- `Break this PRD into tickets in docs/issues.md.`
- `Execute the next ready AFK ticket from docs/issues.md.`
- `Help me reproduce and isolate this regression before we decide what follow-up work to create.`

**Borderline**
- `We found a failure during QA, but it's not clear whether this is a real bug or a bad test setup.`

For a successful run, verify that the agent:
1. checks readiness first
2. inspects local context before asking questions
3. uses `assets/qa-template.md`
4. writes actionable QA scenarios and review checklist
5. records findings only when evidence exists
6. keeps `docs/qa.md` as the main QA artifact
7. updates `docs/issues.md` only when follow-up work is clear enough to record responsibly
8. recommends the next phase clearly, such as `execute-me`, `diagnose-me`, HITL review, or release/sign-off
