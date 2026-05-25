# Issues

## Planning assumptions
- Source PRD: `docs/prd.md`
- Planning scope: narrow merge-readiness follow-up for deciding whether `exp/pi-spawn` is ready to merge into `main`
- Prior completed cycles preserved as context:
  - `ISSUE-001` through `ISSUE-006` delivered the repo-local replacement `spawn`, inline status cards, active widget, validation flow, HITL verdict, and perf follow-up
  - `ISSUE-007` through `ISSUE-013` delivered the `preset` follow-up and the branch-level HITL verdict that preset support is ready for continued use on `exp/pi-spawn`
  - `ISSUE-014` through `ISSUE-018` delivered the `timeout` follow-up and the branch-level HITL verdict that timeout support is ready for continued use on `exp/pi-spawn`
  - `ISSUE-019` through `ISSUE-024` delivered the completion-reliability follow-up and the branch-level HITL verdict that completion reliability is ready for continued use on `exp/pi-spawn`
  - `ISSUE-025` through `ISSUE-029` delivered the operational-hardening follow-up and the branch-level HITL verdict that the branch is ready for continued use on `exp/pi-spawn`
- Prototype winner: none; a separate prototype phase is unnecessary for this merge-readiness follow-up
- Key constraints:
  - keep `spawn` as a minimal focused delegation primitive
  - do not broaden this follow-up into new feature work unless fresh evidence proves a real blocker
  - keep the distinction between continued branch use and merge-to-main approval explicit
  - use the merge checklist already captured in `docs/pi-spawn.md`
  - if a blocker appears, route it to the smallest correct follow-up ticket instead of silently fixing unrelated work here
  - avoid inventing a large new harness or release system for this branch-specific decision

## Dependency rules
- Branch-vs-main delta review should land before the final merge verdict so reviewers know what would actually change on `main`.
- Fresh merge-candidate validation should land before the final merge verdict so the decision is not based only on stale retained evidence.
- Rollback, blast-radius, and compatibility assessment should consume both the branch-delta summary and the latest validation picture.
- Human review is required for the actual merge decision; no AFK ticket should auto-approve merge to `main`.
- If validation or branch review uncovers a real blocker, execution must stop and route that blocker explicitly rather than smuggling implementation work into the merge-review tickets.

## Ticket conventions
- `Status`: `todo`, `in-progress`, `blocked`, `done`
- `Type`: `AFK`, `HITL`
- `Depends on`: `none` or explicit ticket IDs
- `Blocks`: explicit ticket IDs or blank when none
- `Parallelizable`: `yes`, `no`
- QA follow-up: reopen an existing ticket if the original scope still fits; otherwise add a new ticket

## Parallelization plan
Can start immediately:
- `ISSUE-030` — build a merge-readiness branch-vs-main delta summary
- `ISSUE-031` — gather fresh merge-candidate validation evidence

Blocked until prerequisites complete:
- `ISSUE-032` waits on `ISSUE-030` and `ISSUE-031`
- `ISSUE-033` waits on `ISSUE-032`

Suggested lanes:
- Lane A: branch-vs-main review
- Lane B: fresh validation evidence
- Lane C: merge-risk assessment + HITL verdict

## Tickets

### ISSUE-030 — Build a merge-readiness branch-vs-main delta summary
- Status: done
- Type: AFK
- Goal: produce one concise summary of what would materially change if `exp/pi-spawn` merged into `main`.
- Why it exists: the repo still lacks a clean reviewer-facing summary of branch-vs-main impact, which is required for a real merge decision.
- Depends on: none
- Blocks: ISSUE-032
- Parallelizable: yes
- Source requirements:
  - PRD Problem statement
  - PRD Desired outcome
  - PRD Scope
  - PRD Functional requirements 1, 2, 8
  - `docs/pi-spawn.md` merge-to-main checklist
- Scope:
  - review branch-vs-main changes for `spawn` behavior, public API surface, completion semantics, validation posture, and repo-policy/doc changes
  - separate user-visible changes from internal implementation changes
  - record any branch-only assumption that still matters for `main`
  - keep the summary concise enough for HITL review
- Acceptance criteria:
  - [x] one concise branch-vs-main delta summary exists
  - [x] the summary distinguishes public/user-visible impact from internal/runtime-only changes
  - [x] the summary names any remaining branch-only assumption relevant to merge readiness
- Notes / risks:
  - delta summary recorded in `docs/pi-spawn.md` under `## Branch-vs-main delta snapshot (ISSUE-030)`
  - reviewer-facing findings captured there include:
    - public/user-visible impact: repo-local replacement `spawn`, `/spawn-mode` guardrails, preset/timeout/completion semantics, and updated delegation doctrine
    - internal-only impact: spawn-domain implementation files, validation script, deterministic regression test, and experiment-documentation footprint
    - branch-only assumptions still relevant to merge readiness: experiment-branch status language, opt-in `/spawn-mode`, partial provider-backed validation dependence, and the intentional choice whether to keep the full documentation/prototype trail on `main`
  - evidence used for the summary:
    - `git log --oneline --reverse origin/main..HEAD`
    - `git diff --stat origin/main...HEAD`
    - `git diff --name-status origin/main...HEAD`
    - `git diff --unified=0 origin/main...HEAD -- AGENTS.md .gitignore .pi/settings.json`
    - source inspection of `.pi/extensions/spawn/index.ts`, `.pi/extensions/spawn/mode.ts`, and `.pi/extensions/spawn/shared.ts`
  - do not broaden this into speculative roadmap writing
  - if the review finds a real correctness blocker, record it explicitly instead of quietly fixing code inside this ticket
  - prefer reviewer-facing language over raw diff dumping

### ISSUE-031 — Gather fresh merge-candidate validation evidence
- Status: done
- Type: AFK
- Goal: rerun the current repo-local validation commands on the latest branch state and record evidence specifically for a merge decision.
- Why it exists: merge readiness should not rely only on older branch-use evidence.
- Depends on: none
- Blocks: ISSUE-032
- Parallelizable: yes
- Source requirements:
  - PRD Desired outcome
  - PRD User experience and behavior
  - PRD Functional requirements 3, 8
  - latest validation conventions already recorded in `docs/pi-spawn.md`
- Scope:
  - run `node scripts/validate-spawn-hardening.mjs`
  - run `node --test tests/spawn-return-result-activation.test.mjs`
  - record artifact paths, pass/fail state, and any explicit environment/provider limitation
  - keep the evidence concise and merge-decision oriented
- Acceptance criteria:
  - [x] fresh validation evidence exists for the main validation command
  - [x] fresh validation evidence exists for the deterministic regression test
  - [x] any environment/provider limitation is recorded explicitly rather than hidden
- Notes / risks:
  - fresh merge-candidate evidence recorded in `docs/pi-spawn.md` under `## Merge-candidate validation snapshot (ISSUE-031)`
  - fresh command evidence from this execution:
    - `node scripts/validate-spawn-hardening.mjs`
    - artifacts: `/tmp/pi-spawn-validate-z5wDgR/`
    - machine-readable summary: `/tmp/pi-spawn-validate-z5wDgR/summary.json`
    - all current cases passed in this run
    - this run had no provider/env `UNAVAILABLE` limitation
    - nuance worth carrying into `ISSUE-032`: `preset_success` passed, but it passed via repaired success (`completionRepairAttempted=True`, `completionRepairSucceeded=True`) rather than an unrepaired direct success
    - `node --test tests/spawn-return-result-activation.test.mjs`
    - result: `pass 2`, `fail 0`
  - do not silently reinterpret `UNAVAILABLE` as success
  - if fresh validation reveals a new blocker, record it and stop rather than stretching this ticket into implementation
  - prefer artifact-backed summaries over long raw transcripts

### ISSUE-032 — Record rollback, compatibility, and blast-radius posture for main merge
- Status: done
- Type: AFK
- Goal: document whether the current branch is operationally safe enough to become the default path on `main`, including rollback practicality.
- Why it exists: even a validated branch can still be a poor main-merge candidate if rollback or compatibility posture is unclear.
- Depends on: ISSUE-030, ISSUE-031
- Blocks: ISSUE-033
- Parallelizable: no
- Source requirements:
  - PRD Desired outcome
  - PRD Functional requirements 4, 6
  - PRD Constraints
  - outputs of ISSUE-030 and ISSUE-031
  - `docs/pi-spawn.md` merge-to-main checklist
- Scope:
  - assess rollback simplicity, blast radius, and compatibility assumptions
  - decide whether any known limitation is acceptable for `main` or still branch-only
  - write a concise merge-risk summary suitable for final HITL review
  - if the answer is still negative, identify the smallest correct follow-up ticket shape
- Acceptance criteria:
  - [x] rollback posture is explicitly documented
  - [x] blast radius and compatibility assumptions are explicitly documented
  - [x] any remaining blocker is concrete enough to route to a small follow-up if needed
- Notes / risks:
  - assessment recorded in `docs/pi-spawn.md` under `## Rollback, compatibility, and blast-radius snapshot (ISSUE-032)`
  - AFK assessment from this execution:
    - no hard rollback or compatibility blocker was found that automatically disqualifies the branch from future merge consideration
    - rollback remains straightforward because the branch is file-based and repo-local, with no schema/data migration and no broad package-install surface
    - blast radius is meaningful for maintainer/agent workflow, but bounded because delegation remains opt-in through `/spawn-mode`
    - compatibility remains broadly healthy under fresh validation, but one nuance should remain visible for HITL: the latest `preset_success` case passed via repaired success rather than unrepaired direct success
  - remaining likely blocker shapes if HITL says `not ready`:
    - a docs/cleanup ticket for experiment-status language and main-branch packaging/footprint
    - or a narrow runtime-confidence ticket if repaired preset success is judged too soft for the default path
  - procedural caveat: the working tree is currently dirty because merge-readiness artifacts are still being authored; that is not a runtime blocker, but it must be cleaned before any actual merge
  - keep the assessment grounded in current branch evidence, not generic release-process theory
  - do not blur `continued branch use` into `merge readiness`
  - avoid turning this ticket into a broad governance or roadmap essay

### ISSUE-033 — Decide whether `exp/pi-spawn` is ready to merge into `main`
- Status: done
- Type: HITL
- Goal: make a dedicated human decision on whether this branch is ready to become the default path on `main`.
- Why it exists: merge approval is a separate judgment from continued branch use and should not be auto-approved.
- Depends on: ISSUE-032
- Blocks:
- Parallelizable: no
- Source requirements:
  - PRD Desired outcome
  - PRD Acceptance criteria
  - outputs of ISSUE-030, ISSUE-031, and ISSUE-032
  - `docs/pi-spawn.md` merge-to-main checklist
- Scope:
  - review the merge-readiness packet
  - decide whether the branch is ready for merge to `main`
  - explicitly address trust gain, remaining risk, boundary drift, and default-path operability
  - if not ready, record the blocker clearly enough to reopen or create the right AFK follow-up
- Acceptance criteria:
  - [x] a dedicated HITL merge-readiness verdict is recorded
  - [x] the verdict explicitly says `ready for merge to main` or `not ready`
  - [x] if the verdict is negative, the blocking reason is specific enough to route the next AFK ticket correctly
- HITL verdict:
  - Decision: ready for merge to `main`
  - Branch: `exp/pi-spawn`
- Trust gain:
  - the branch now has a clear repo-local replacement `spawn` workflow with explicit status semantics, bounded repair behavior, and transparent success/failure distinctions
  - the main reliability matrix has fresh merge-candidate evidence from `node scripts/validate-spawn-hardening.mjs`
  - the critical `return_result` activation bug has deterministic local regression coverage through `node --test tests/spawn-return-result-activation.test.mjs`
  - branch-vs-main impact, rollback posture, blast radius, and compatibility assumptions are now documented explicitly enough for a default-path decision
- Boundary judgment:
  - this branch still feels minimal enough to merge
  - alasan singkat: the branch adds a focused delegation primitive, opt-in `/spawn-mode` guardrails, narrow public API additions (`preset`, `timeout`), and operational confidence tooling without turning the repo into a subagent platform, retry/orchestration framework, or dashboarded job system
- Remaining acceptable caveats:
  - merge should be accompanied by a deliberate cleanup of experiment-branch status language in `docs/pi-spawn.md`
  - the merge-readiness artifact edits should be committed so the working tree is clean before the actual merge step
  - the current preset-success repair nuance is acceptable for `main` because preset coherence still passed and repaired success remains explicit rather than hidden
- Evidence reviewed:
  - `docs/pi-spawn.md` snapshots for `ISSUE-022`, `ISSUE-028`, `ISSUE-030`, `ISSUE-031`, and `ISSUE-032`
  - fresh merge-candidate validation: `/tmp/pi-spawn-validate-z5wDgR/summary.json`
  - fresh validation artifacts: `/tmp/pi-spawn-validate-z5wDgR/`
  - deterministic regression test: `node --test tests/spawn-return-result-activation.test.mjs`
  - branch-vs-main review evidence:
    - `git log --oneline --reverse origin/main..HEAD`
    - `git diff --stat origin/main...HEAD`
    - `git diff --name-status origin/main...HEAD`
- Final note:
  - Ready for merge to `main` once the current documentation updates are committed and the merge step is performed intentionally.
- Notes / risks:
  - do not broaden this ticket into further feature ideation or implementation
  - this ticket records the merge-readiness decision; the actual merge is still a separate deliberate git step
