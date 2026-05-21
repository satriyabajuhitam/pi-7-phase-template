---
name: qa-me
description: Create or update a QA plan in docs/qa.md from the PRD, issues, and current implementation state, capture findings, and recommend follow-up work. Use when implementation needs structured verification before release or the next execution loop.
---

# QA Me

## When to use

- Implementation work has progressed far enough that structured verification is useful
- The user wants a QA plan, a human-review checklist, or a summary of findings
- The project needs a quality gate before release or the next execution loop
- Done tickets need to be checked against the PRD and acceptance criteria

## Do not use when

- There is no meaningful implemented work to verify yet
- The project still needs Phase 4 PRD refinement or Phase 5 planning before QA is worthwhile
- The user wants direct implementation rather than verification
- The current need is broad product ideation rather than validation

---

## Workflow

### 0. Stay in QA mode

While this skill is active:
- Do not implement new feature work unless the user explicitly asks to switch modes
- You may create or update `docs/qa.md`
- You may update `docs/issues.md` only to capture clear follow-up work, blockers, or reopened tickets
- Focus on verification, findings, and next-step recommendation

### 1. Validate readiness

Before drafting or updating `docs/qa.md`, check whether Phase 7 is justified.

QA is justified when most of these are true:
- there is meaningful implemented work to inspect or test
- `docs/prd.md` and `docs/issues.md` provide enough context for expected behavior
- at least some tickets are complete, in review, or otherwise ready to verify

If the project is not ready, say so clearly and recommend the earlier phase that should happen first.

### 2. Inspect local artifacts first

Before asking the user anything, inspect relevant local artifacts if they exist:
- `docs/prd.md`
- `docs/issues.md`
- `docs/research.md`
- `docs/prototype/comparison.md`
- existing `docs/qa.md`
- relevant test files, configs, or scripts when needed

Use them to extract:
- expected behavior and acceptance criteria
- what has been marked done or is under review
- risks, constraints, and important edge cases
- which areas need automated versus human validation

Do not ask the user for information that already exists in the repo.

### 3. Read the QA template asset

Read `assets/qa-template.md` before writing or restructuring `docs/qa.md`.

Use it as the default shape unless the repo context strongly justifies a small adjustment.

### 4. Build a QA plan from the PRD and issues

Translate the PRD and completed work into a concrete QA plan.

Include:
- core test scenarios
- edge cases to verify
- areas that need human review
- known risks
- sign-off criteria

Prefer risk-based prioritization over exhaustive but low-value checklists.

### 5. Separate automated checks from human review

Distinguish clearly between:
- what can be validated through tests, lint, typecheck, or build commands
- what requires human judgment, such as UX quality, wording, policy review, or broader system sanity

If no automated checks exist, say so explicitly.

### 6. Capture findings when evidence exists

If the current run includes actual QA execution or evidence from tests and inspection, record findings under:
- `Pass`
- `Fail`
- `Uncertain`

If this run is planning-only, leave findings framed as pending verification rather than pretending they were executed.

### 7. Feed findings back into the loop

When QA reveals real follow-up work:
- identify whether the follow-up should become `AFK` or `HITL`
- recommend reopening an issue, adding a new issue, returning to planning, or using `diagnose-me` if the failure still needs reproduction and isolation
- update `docs/issues.md` only when the follow-up is clear enough to record responsibly

Do not bury important QA failures in prose without linking them to next-step work.

### 8. Write or refine `docs/qa.md`

Write the QA artifact using `assets/qa-template.md` as the base structure.

At minimum include:
- `Objective`
- `Scope under test`
- `Source artifacts`
- `Test scenarios`
- `Edge cases to verify`
- `Human review checklist`
- `Known risks`
- `Findings`
- `Follow-up issues`
- `Release / sign-off recommendation`
- `Next step`

Keep it concise, actionable, and useful for a human reviewer or the next agent.

### 9. Recommend the next phase

Close by stating which next step is best:
- more execution
- more planning
- release or sign-off
- more research
- HITL review

Be specific about why.

---

## Default questioning order

Use this order as a starting point:

1. What behavior should this QA pass verify first?
2. Which completed tickets or flows are in scope right now?
3. What edge cases are most likely to fail or regress?
4. What still requires human judgment rather than automated checks?
5. What follow-up work should return to the execution loop?
6. Is the current state ready for release, another AFK pass, or HITL review?

---

## Gotchas

- Do not confuse QA planning with feature implementation.
- Do not claim findings were verified if you only drafted a plan.
- Do not ignore human-review needs just because tests pass.
- Do not leave important failures without a follow-up path.
- Do not update unrelated tickets in `docs/issues.md` casually.
- Do not turn the QA artifact into a giant transcript; keep it distilled and actionable.

---

## Verification

A good run of this skill produces:

**Opening:**
> States whether the project is ready for Phase 7 and identifies the source artifacts being used.

**During QA planning:**
> Uses `assets/qa-template.md`, turns the PRD and issue status into concrete scenarios, and separates automated checks from human review.

**Artifact:**
> `docs/qa.md` contains the QA plan or findings, plus clear follow-up recommendations.

**Closing:**
> Recommends whether the project should return to execution, add follow-up issues, seek HITL review, or proceed toward release.

### Smoke test

1. `/reload`
2. `/skill:qa-me`
3. Give a prompt such as: `Create docs/qa.md from the PRD, completed issues, and current implementation state`
4. Verify that the agent:
   - checks readiness first
   - inspects local artifacts before asking questions
   - uses `assets/qa-template.md`
   - writes actionable QA scenarios and review checklist
   - records findings only when evidence exists
   - recommends the next phase clearly
