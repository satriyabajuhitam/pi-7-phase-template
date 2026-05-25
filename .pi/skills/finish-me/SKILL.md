---
name: finish-me
description: Review the current execution and QA state, summarize validation and residual risk, and recommend the best lightweight closeout action such as continue execution, request HITL review, prepare PR, merge, keep, or discard.
---

# Finish Me

## When to use

- The user wants an end-of-loop closeout check after execution and/or QA
- The next question is no longer "what should we build?" but "what should we do with the current state?"
- There is enough repo state, ticket state, or validation evidence to assess whether the work should continue, pause, go to HITL review, be prepared for PR, be merged, be kept for later, or be discarded
- A maintainer wants a lightweight merge-readiness or closeout recommendation without adopting a heavy release-management workflow

## Do not use when

- The next step is still clearly implementation of a ready ticket; use `execute-me`
- The work still needs implementation planning rather than closeout assessment; use `issues-me`
- The expected behavior is still too unclear to judge readiness responsibly; use `prd-me`
- Verification planning or findings capture is still the main need; use `qa-me`
- A failure or ambiguity still needs reproduction and root-cause isolation; use `diagnose-me`
- The user wants automatic git actions, branch orchestration, or release automation rather than a recommendation-oriented review

---

## Workflow

### 0. Stay in closeout mode

While this skill is active:
- Do not implement new feature work unless the user explicitly asks to switch modes
- Do not run automatic merge, branch-delete, or other git automation as part of the closeout recommendation
- You may inspect repo state, issue state, QA state, and recent validation evidence when relevant
- Focus on evidence, residual risk, and the best next action
- Treat recommendations such as `prepare PR`, `merge`, `keep`, or `discard` as advice, not automation

### 1. Validate readiness

Before making a closeout recommendation, check whether a finish pass is justified.

A closeout pass is justified when most of these are true:
- there is meaningful completed or partially completed execution work to assess
- `docs/issues.md` and/or `docs/qa.md` provide enough context to judge current state
- there is at least some current validation evidence, or an explicit lack of it that itself affects the recommendation
- the real question is what should happen next with the current work state

If the work is still too early for closeout, say so clearly and recommend the earlier phase that should happen first.

### 2. Inspect local artifacts first

Before asking the user anything, inspect relevant local artifacts if they exist:
- `docs/issues.md`
- `docs/qa.md`
- `docs/prd.md`
- `docs/research.md` when residual risks or constraints matter
- relevant validation outputs, tests, or recent commands when they materially affect the recommendation
- repo-state signals only when they materially affect closeout judgment, and keep them bounded to small checks such as:
  - dirty vs clean working tree
  - whether key workflow artifacts that the current recommendation depends on appear present or still pending, such as `docs/issues.md` or `docs/qa.md`
  - current branch or HEAD context only when the recommendation is specifically about PR prep or merge readiness

Use them to extract:
- what work is marked done, in-progress, blocked, or pending review
- what QA or validation evidence exists from the current run versus what is still missing
- what residual risks, blockers, or human approvals remain
- which repo-state signals materially affect the recommendation, and whether they were confirmed, unavailable, or intentionally skipped as irrelevant
- whether the next step is more execution, HITL review, PR preparation, merge, keep, or discard

Do not ask the user for information that already exists in the repo.

Use `spawn` selectively for **closeout context offloading** when evidence gathering or independent sign-off prep would materially reduce parent-context load.

Good triggers:
- multiple completed tickets or QA findings need a compact evidence summary first
- an independent review of requirement fit versus residual risk would improve confidence
- the parent mainly needs a concise evidence-backed verdict rather than every intermediate note

Preferred usage:
- use `preset: "scout"` for evidence gathering across multiple artifacts
- use `preset: "reviewer"` for compact closeout or readiness review
- keep final judgment and recommendations in the parent

### 3. Separate implementation state from readiness state

Do not confuse these states:
- implemented
- validated
- ready for QA
- ready for HITL review
- ready to prepare PR
- ready to merge

A ticket or branch can be implemented but still not validated enough for closeout.
A QA plan can exist without sign-off evidence.
A working tree can be useful to keep even when it is not ready to merge.

### 4. Build a closeout packet

Summarize the current state in a lightweight packet.

At minimum, cover:
- evidence reviewed
- validation state
- residual risks
- missing evidence or blockers
- recommended next action
- why that action is better than the nearby alternatives

Prefer concise operational judgment over a giant retrospective.

### 5. Recommend one primary next action

Choose the best primary recommendation from this set when possible:
- `continue execution`
- `request HITL review`
- `prepare PR`
- `merge`
- `keep`
- `discard`

Interpret them like this:
- `continue execution` when the work is not yet complete or evidence is too weak for closeout
- `request HITL review` when human judgment, approval, policy review, or sign-off is the real remaining gate
- `prepare PR` when the work is strong enough for external review packaging but should not yet be described as merged or finished
- `merge` only when the current run has fresh enough evidence and no meaningful blocker remains for the intended merge decision
- `keep` when the current state is worth preserving for more work or later review, but is not ready for stronger actions
- `discard` when the current path is not worth continuing and the evidence supports stopping

If none of these fit cleanly, say so explicitly and recommend the nearest correct earlier workflow such as `execute-me`, `qa-me`, or `diagnose-me`.

### 6. Be evidence-aware and conservative

Do not imply `ready`, `safe`, `mergeable`, or equivalent confidence without fresh enough evidence from the current run.

If evidence is incomplete, stale, blocked, or missing:
- say that explicitly
- separate known facts from assumptions
- downgrade the recommendation accordingly
- surface what evidence would most improve confidence next

If repo-state signals are relevant but unavailable, unverified, or inaccessible:
- say which signals matter
- do not infer a clean or ready state from silence
- downgrade to the weakest honest recommendation that still fits, such as `keep`, `continue execution`, `prepare PR`, or `request HITL review` instead of `merge`

If external dependencies, permissions, or unavailable environments limit judgment, record that explicitly instead of flattening uncertainty into confidence.

### 7. Keep repo-state checks lightweight

Repo-state checks are allowed only when they materially affect closeout.

Default allowed set:
- dirty vs clean working tree
- whether key workflow artifacts or evidence the recommendation depends on are present vs still missing
- current branch or HEAD context when PR prep or merge judgment is the actual question

Default exclusions unless the user explicitly asks for more:
- branch choreography or worktree management
- automated git actions
- broad release checklists
- remote hosting, PR metadata, or deployment state review unless those are already central to the user’s closeout question

Do not turn this into mandatory worktree orchestration, branch choreography, or release automation.
Only inspect the smallest repo-state signals needed to support the recommendation, and say when you intentionally skipped broader checks because they were out of scope.

### 8. Report the result clearly

Close with a concise result that includes:
- `Recommendation`
- `Evidence reviewed`
- `Validation state`
- `Residual risks`
- `Missing evidence or blockers`
- `Suggested next workflow step`

If the recommendation is positive, cite the fresh evidence that supports it.
If it is not, say exactly why.

---

## Default questioning order

Use this order as a starting point:

1. What work is supposedly complete right now?
2. What fresh validation or QA evidence actually supports that claim?
3. What blockers, risks, or missing approvals still remain?
4. Is the best next step more execution, more QA, HITL review, PR prep, merge, keep, or discard?
5. What is the smallest additional evidence that would change the recommendation?

---

## Gotchas

- Do not confuse implementation completion with closeout readiness.
- Do not recommend `merge` or equivalent confidence from stale or missing evidence.
- Do not turn this helper into git automation or release automation.
- Do not bury missing evidence inside a positive-sounding summary.
- Do not require heavy branch-management ceremony just to make a lightweight recommendation.
- Do not infer a clean working tree, correct branch context, or merge-ready state when those signals matter but were not actually checked.
- Do not hide uncertainty from external dependency, permission, or environment limits.
- Do not silently execute more implementation work during a finish pass.

---

## Verification

Minimum smoke test:

```bash
/reload
/skill:finish-me
```

A good run of this skill produces:

**Opening:**
> States whether the current repo state is ready for a closeout assessment and identifies which artifacts will be used.

**During review:**
> Separates implementation state from validation state, summarizes residual risk, and avoids inflated readiness claims.

**Closing:**
> Recommends one primary next action such as `continue execution`, `request HITL review`, `prepare PR`, `merge`, `keep`, or `discard`, with evidence and caveats.

### Trigger validation

**Should trigger:**
- "Review the current branch state and tell me whether we should keep working, ask for HITL review, prepare a PR, or merge."
- "Do a lightweight closeout pass after execution and QA."
- "Summarize validation state and recommend the next closeout action."

**Should not trigger:**
- "Execute the next ready ticket." → use `execute-me`
- "Create a QA plan for the completed work." → use `qa-me`
- "Break this PRD into tickets." → use `issues-me`
- "Help me isolate this failing regression before deciding next steps." → use `diagnose-me`

### Artifact verification

If the session performs a finish pass:
- verify no feature implementation files were edited unless the user explicitly changed modes
- verify the recommendation is grounded in current artifacts or fresh evidence rather than assumption
- verify missing evidence or blockers are named explicitly when present
- verify the helper did not require worktree orchestration or automatic git actions
- verify the closing recommendation points to the correct next workflow step such as `execute-me`, `qa-me`, `diagnose-me`, HITL review, PR prep, merge, keep, or discard
