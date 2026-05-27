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
- The main need is to route a vague request to the right phase or artifact before QA begins; use `triage-me`
- The expected behavior is still too unclear to verify responsibly; use `prd-me`
- The work still needs implementation planning rather than verification; use `issues-me`
- The user wants to execute a ready ticket rather than run structured verification; use `execute-me`
- A failure still needs reproduction, isolation, or root-cause diagnosis before follow-up work can be planned clearly; use `diagnose-me`

---

## Workflow

### 0. Stay in QA mode

While this skill is active:
- Do not implement new feature work unless the user explicitly asks to switch modes
- You may create or update `docs/qa.md`
- You may update `docs/issues.md` only to capture clear follow-up work, blockers, or reopened tickets
- Do not claim work is ready, passed, signed off, or safe to release without fresh evidence from the current run
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

When review is readiness-sensitive or affects shared behavior, keep the review order clear:
1. requirement fit — does the current implementation satisfy the intended behavior and acceptance criteria?
2. quality / boundary drift — is the result clean enough, and did the change avoid unnecessary expansion or collateral behavior drift?

### 6. Capture findings when evidence exists

If the current run includes actual QA execution or evidence from tests and inspection, record findings under:
- `Pass`
- `Fail`
- `Uncertain`

If this run is planning-only, leave findings framed as pending verification rather than pretending they were executed.
Do not turn implementation completion alone into a success or sign-off claim without fresh evidence from the current run.

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

If the current run supports a positive readiness or sign-off claim, name the fresh evidence that supports it.
If it does not, say so explicitly instead of implying confidence from implementation status alone.

Prefer `execute-me` when QA reveals clear AFK follow-up work, `diagnose-me` when a failure is still ambiguous, and explicit HITL review when human judgment or approval is the real blocker.

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
- Do not claim release readiness, sign-off, or success from implementation completion alone without fresh evidence.
- Do not ignore human-review needs just because tests pass.
- Do not leave important failures without a follow-up path.
- Do not update unrelated tickets in `docs/issues.md` casually.
- Do not turn the QA artifact into a giant transcript; keep it distilled and actionable.

---

## Verification

Minimum smoke test:

```bash
/reload
/skill:qa-me
```

A good run of this skill produces:

**Opening:**
> States whether the project is ready for Phase 7 and identifies the source artifacts being used.

**During QA planning:**
> Uses `assets/qa-template.md`, turns the PRD and issue status into concrete scenarios, and separates automated checks from human review.

**Artifact:**
> `docs/qa.md` contains the QA plan or findings, plus clear follow-up recommendations.

**Closing:**
> Recommends whether the project should return to execution, add follow-up issues, seek HITL review, or proceed toward release.

### Trigger validation

**Should trigger:**
- "Create `docs/qa.md` from the PRD, completed issues, and current implementation state."
- "Build a QA checklist for the implemented flows and identify likely follow-up issues."
- "Update `docs/qa.md` with findings and recommend whether to return to execution."

**Should not trigger:**
- "Route this vague request to the right phase and artifact." → use `triage-me`
- "Refine `docs/prd.md`; expected behavior is still too fuzzy to verify." → use `prd-me`
- "Break this PRD into tickets in `docs/issues.md`." → use `issues-me`
- "Execute the next ready AFK ticket from `docs/issues.md`." → use `execute-me`
- "Help me reproduce and isolate this regression before we decide what follow-up work to create." → use `diagnose-me`

**Borderline:**
- "We found a failure during QA, but it's not clear whether this is a real bug or a bad test setup." → use `qa-me` only to capture the finding and route follow-up; use `diagnose-me` if reproduction or isolation is still needed before creating confident execution work

### Artifact verification

If the session writes or refines QA artifacts:
- verify the file path is exactly `docs/qa.md`
- verify the structure follows `assets/qa-template.md` unless a small justified adjustment was made
- verify automated checks and human review items are clearly separated
- verify findings are recorded only when actual evidence exists; otherwise keep them framed as pending verification
- verify follow-up work is explicit and routed clearly as AFK, HITL, reopened issue, new issue, `execute-me`, or `diagnose-me`
- verify `docs/issues.md` is updated only when the follow-up is clear enough to record responsibly
- verify no unrelated implementation files were edited
- verify the closing recommendation points to the correct next step such as `execute-me`, `diagnose-me`, HITL review, or release/sign-off

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
