# Issues

## Planning assumptions
- Source PRD: `docs/prd.md`
- Planning scope: reliability hardening v1 for the Pi-native 7-phase workflow, focused on Phase 6 execution behavior and the diagnosis loop
- Prior completed cycles preserved as context:
  - earlier merge-readiness planning has been preserved at `docs/issues.spawn-merge-readiness.md`
  - earlier merge-readiness PRD has been preserved at `docs/prd.spawn-merge-readiness.md`
- Prototype winner: none; prototyping is unnecessary for this workflow-hardening slice
- Key constraints:
  - preserve the existing 7-phase structure and prompt entry points
  - keep one-ticket-per-run execution intact
  - keep `spawn` as a narrow context-offloading tool rather than a full subagent framework
  - prefer changes to existing local skills, prompts, and docs over new runtime systems
  - keep the first slice narrow to execution and diagnosis hardening; do not silently absorb finish-helper or broad planning reform into this plan

## Dependency rules
- Execution-guidance hardening should land before QA guidance cleanup so Phase 7 can reference the updated completion-evidence posture.
- Diagnosis hardening can proceed in parallel with execution hardening because it targets a separate skill and prompt surface.
- Shared repo-level wording in `AGENTS.md` should land alongside or immediately after the first execution-hardening ticket so later tickets reference the same doctrine.
- Final workflow review should wait until execution, diagnosis, and QA/doc updates are complete.
- Human judgment is required before declaring the new reliability posture “ready for template use” across future repos.

## Ticket conventions
- `Status`: `todo`, `in-progress`, `blocked`, `done`
- `Type`: `AFK`, `HITL`
- `Depends on`: `none` or explicit ticket IDs
- `Blocks`: explicit ticket IDs or blank when none
- `Parallelizable`: `yes`, `no`
- QA follow-up: reopen an existing ticket if the original scope still fits; otherwise add a new ticket

## Parallelization plan
Can start immediately:
- `ISSUE-034` — harden Phase 6 execution rules and completion evidence
- `ISSUE-035` — harden diagnosis guidance with root-cause-first techniques

Blocked until prerequisites complete:
- `ISSUE-036` waits on `ISSUE-034`
- `ISSUE-037` waits on `ISSUE-034`, `ISSUE-035`, and `ISSUE-036`
- `ISSUE-038` waits on `ISSUE-037`

Suggested lanes:
- Lane A: execution hardening
- Lane B: diagnosis hardening
- Lane C: QA/docs integration + final workflow verdict

## Tickets

### ISSUE-034 — Harden Phase 6 execution rules and completion evidence
- Status: done
- Type: AFK
- Goal: strengthen `/execute` so behavior-changing tickets default to test-first when practical, risky tickets have clearer review triggers, and completion claims require an explicit evidence bundle.
- Why it exists: the current execution loop is disciplined but still too easy to complete with weak verification language or inconsistent review posture.
- Depends on: none
- Blocks: ISSUE-036, ISSUE-037
- Parallelizable: yes
- Source requirements:
  - PRD Functional requirements 1, 2, 3, 4, 5, 6, 9
  - PRD User experience and behavior
  - `docs/research.md` findings on verification-before-completion, stronger TDD proof, and lightweight independent review
- Scope:
  - update `.pi/skills/execute-me/SKILL.md`
  - update `.pi/prompts/execute.md`
  - update `AGENTS.md` Phase 6 guidance where repo-level wording must align
  - encode a minimum completion-evidence bundle for ticket completion reports
  - make TDD the default for behavior-changing tickets with a practical public-interface test
  - define when review is required or strongly preferred for risky execution work
  - clarify ordered review behavior: requirement fit before code quality / boundary drift
- Acceptance criteria:
  - [x] `execute-me` now defaults to test-first behavior for practical behavior-changing tickets rather than only preferring it loosely
  - [x] `execute-me` now requires an explicit reason when TDD is skipped for an otherwise testable behavior change
  - [x] `execute-me` now defines a minimum completion-evidence bundle for `done` claims
  - [x] execution guidance now defines clear review triggers for risky multi-file, shared-contract, or readiness-sensitive work
  - [x] repo-level Phase 6 wording in `AGENTS.md` is consistent with the hardened execution behavior
- Notes / risks:
  - keep the execution model one-ticket-per-run
  - do not introduce subagent-per-task execution
  - avoid wording that accidentally forces artificial TDD on docs/config/setup tickets
  - completed by updating `.pi/skills/execute-me/SKILL.md`, `.pi/prompts/execute.md`, and `AGENTS.md`
  - validation used targeted artifact inspection via `rg` plus one independent reviewer pass; no automated skill-behavior test harness exists in this repo for these prompt/skill wording changes
  - minor residual risk: this ticket validates artifact guidance rather than a live `/execute` run, so downstream QA/doc alignment in `ISSUE-036` and final workflow review in `ISSUE-037` remain important

### ISSUE-035 — Harden diagnosis guidance with root-cause-first techniques
- Status: done
- Type: AFK
- Goal: strengthen `/diagnose` so ambiguous bugs are less likely to jump into execution before a trusted loop, ranked hypotheses, and root-cause-oriented evidence exist.
- Why it exists: current diagnosis guidance is solid but still too light on anti-guessing guardrails and concrete debugging techniques for deep-call or flaky failures.
- Depends on: none
- Blocks: ISSUE-037
- Parallelizable: yes
- Source requirements:
  - PRD Functional requirements 7, 8, 9
  - PRD Edge cases for external dependency failure, timeouts/retries, permissions/access issues, and missing data
  - `docs/research.md` findings on root-cause-first diagnosis, backward tracing, boundary instrumentation, and condition-based waiting
- Scope:
  - update `.pi/skills/diagnose-me/SKILL.md`
  - optionally update adjacent repo-level wording in `AGENTS.md` only if needed for consistency
  - add explicit root-cause-first guardrails before fix recommendations
  - add “check recent changes” as a standard diagnosis step
  - add concrete diagnosis techniques for backward tracing, boundary-by-boundary instrumentation, and flaky reproduction improvement
  - preserve concise artifact routing and avoid turning diagnosis into implementation
- Acceptance criteria:
  - [x] `diagnose-me` explicitly prevents fix recommendations before a trusted loop and root-cause-oriented investigation
  - [x] diagnosis guidance now includes checking recent changes as a standard step
  - [x] diagnosis guidance now documents backward tracing for deep-call failures
  - [x] diagnosis guidance now documents boundary instrumentation and condition-based waiting where relevant
  - [x] the updated diagnosis flow still routes cleanly to `ready-for-execution`, `needs-info`, `needs-research`, `hitl`, or `not reproduced`
- Notes / risks:
  - keep diagnosis concise and execution-oriented
  - do not pull defense-in-depth hardening into this ticket; that belongs later in execution work if needed
  - completed by updating `.pi/skills/diagnose-me/SKILL.md` and aligning repo-level wording in `AGENTS.md`
  - validation used targeted artifact inspection via `rg` plus one independent reviewer pass; no automated skill-behavior test harness exists in this repo for diagnosis-guidance wording changes
  - minor residual risk: this ticket validates diagnosis guidance artifacts rather than a live `/diagnose` run, so final workflow validation in `ISSUE-037` remains important

### ISSUE-036 — Align QA and operator docs with the new evidence posture
- Status: done
- Type: AFK
- Goal: update QA and operator-facing docs so the new completion-evidence and review posture is taught consistently across the repo.
- Why it exists: Phase 6 hardening will be incomplete if Phase 7 guidance and operator docs still imply looser completion language.
- Depends on: ISSUE-034
- Blocks: ISSUE-037
- Parallelizable: no
- Source requirements:
  - PRD Functional requirements 1, 4, 5, 6
  - PRD User experience and behavior
  - outputs of ISSUE-034
- Scope:
  - update `.pi/skills/qa-me/SKILL.md`
  - update `.pi/prompts/qa.md`
  - update `GUIDE.md` examples where execution or QA completion language must change
  - make clear the difference between planning-only QA, evidence-backed QA findings, and readiness/sign-off style claims where relevant
  - align QA wording with the new completion-evidence bundle and risky-review expectations
- Acceptance criteria:
  - [x] `qa-me` clearly reflects that success/readiness claims need fresh evidence rather than assumption
  - [x] `qa.md` prompt guidance stays aligned with the hardened execution and review posture
  - [x] `GUIDE.md` examples no longer imply that implementation completion alone is enough without explicit evidence
  - [x] no new heavy QA ceremony is introduced for trivial cases
- Notes / risks:
  - keep this as an alignment ticket, not a full QA redesign
  - avoid widening scope into finish-helper design
  - completed by updating `.pi/skills/qa-me/SKILL.md`, `.pi/prompts/qa.md`, and `GUIDE.md`
  - validation used targeted artifact inspection via `rg` plus one independent reviewer pass; no automated skill-behavior test harness exists in this repo for QA-guidance wording changes
  - minor residual risk: this ticket validates guidance artifacts rather than a live `/qa` run, so final workflow validation in `ISSUE-037` remains important

### ISSUE-037 — Validate the workflow hardening against the repo’s intended lightweight model
- Status: done
- Type: AFK
- Goal: perform an artifact-and-skill review to confirm the new guidance is internally consistent, still Pi-native, and has not drifted into a heavy framework.
- Why it exists: several skills and prompts will change, and the repo needs one compact validation pass before taking a final human verdict.
- Depends on: ISSUE-034, ISSUE-035, ISSUE-036
- Blocks: ISSUE-038
- Parallelizable: no
- Source requirements:
  - PRD Acceptance criteria
  - PRD Constraints
  - outputs of ISSUE-034, ISSUE-035, and ISSUE-036
  - `AGENTS.md`, `README.md`, `GUIDE.md`, and updated skill/prompt files
- Scope:
  - review changed workflow artifacts for consistency
  - verify the new rules preserve one-ticket-per-run execution and narrow `spawn` doctrine
  - verify the changes did not accidentally require heavy subagent orchestration or mandatory worktree behavior
  - produce one concise validation summary suitable for final HITL review
- Acceptance criteria:
  - [x] one concise validation summary exists for the workflow-hardening slice
  - [x] the summary explicitly checks acceptance-criteria coverage against the updated artifacts
  - [x] the summary explicitly calls out any remaining ambiguity or over-ceremony risk
  - [x] the summary is concise enough to support a final human decision
- Notes / risks:
  - this ticket should validate guidance, not invent new scope
  - if a blocker is found, route it clearly instead of silently editing unrelated behavior here
  - validation summary for `ISSUE-038`:
    - verdict: `pass-with-concerns`
    - acceptance coverage: PRD acceptance criteria are covered by the updated execution, diagnosis, QA, guide, and repo-policy artifacts
    - lightweight-model check: one-ticket-per-run remains explicit, `spawn` remains narrow and context-offloading-first, and no mandatory worktree or subagent-per-task behavior was introduced
    - remaining ambiguity / over-ceremony risk:
      - validation is still artifact-centric rather than proven by live `/execute`, `/diagnose`, or `/qa` runs
      - Phase 7 wording still encourages `spawn` more aggressively in some places, so operator discipline remains important to avoid over-delegation
      - one review trigger remains somewhat subjective: whether the parent would otherwise rely too heavily on its own implementation judgment
  - evidence reviewed included `AGENTS.md`, `README.md`, `GUIDE.md`, `.pi/skills/execute-me/SKILL.md`, `.pi/prompts/execute.md`, `.pi/skills/diagnose-me/SKILL.md`, `.pi/prompts/diagnose.md`, `.pi/skills/qa-me/SKILL.md`, and `.pi/prompts/qa.md`
  - validation used targeted artifact inspection plus one independent reviewer pass; no automated skill-behavior harness exists in this repo for live workflow simulation

### ISSUE-038 — Decide whether reliability hardening v1 is ready for template use
- Status: done
- Type: HITL
- Goal: make a dedicated human decision on whether this first hardening slice is good enough to become the repo’s intended default workflow behavior.
- Why it exists: the workflow changes are repo-shaping and should not be auto-approved by AFK execution alone.
- Depends on: ISSUE-037
- Blocks:
- Parallelizable: no
- Source requirements:
  - PRD Desired outcome
  - PRD Acceptance criteria
  - outputs of ISSUE-034, ISSUE-035, `ISSUE-036`, and `ISSUE-037`
- Scope:
  - review the workflow-hardening packet
  - decide whether the slice is ready for template use as the default local workflow behavior
  - explicitly address reliability gain, ceremony cost, Pi-native fit, and any remaining risk
  - if not ready, identify the smallest correct follow-up ticket shape
- Acceptance criteria:
  - [x] a dedicated HITL verdict is recorded
  - [x] the verdict explicitly says `ready` or `not ready` for template use
  - [x] if the verdict is negative, the blocker is specific enough to route the next AFK follow-up correctly
- HITL verdict:
  - Decision: ready for template use
- Trust gain:
  - Phase 6 now has stronger anti-handwave completion rules, clearer test-first defaults for practical behavior changes, and an explicit completion-evidence bundle
  - diagnosis now holds ambiguous bugs in a root-cause-first loop longer before recommending execution
  - QA and operator guidance now align better with fresh-evidence expectations and no longer imply that finished implementation alone is enough for readiness or sign-off
  - the workflow-hardening slice has an explicit validation summary and remains reviewable through repo artifacts rather than relying on hidden session context
- Pi-native fit:
  - the 7-phase structure and prompt entry points remain unchanged
  - `spawn` remains context-offloading-first rather than becoming a full orchestration runtime
  - `docs/` artifacts remain the source of truth between sessions
- Boundary judgment:
  - this slice still feels lightweight enough for template use
  - alasan singkat: it tightens guidance and validation posture without adding mandatory worktrees, subagent-per-task execution, giant plan documents, or multi-ticket execution drift
- Remaining acceptable caveats:
  - validation is still artifact-centric rather than backed by live end-to-end `/execute`, `/diagnose`, and `/qa` runs
  - Phase 7 wording still benefits from operator discipline so proactive `spawn` use does not drift into over-delegation
  - one review trigger still depends partly on operator judgment: whether the parent would otherwise rely too heavily on its own implementation judgment
- Evidence reviewed:
  - `AGENTS.md`
  - `README.md`
  - `GUIDE.md`
  - `.pi/skills/execute-me/SKILL.md`
  - `.pi/prompts/execute.md`
  - `.pi/skills/diagnose-me/SKILL.md`
  - `.pi/prompts/diagnose.md`
  - `.pi/skills/qa-me/SKILL.md`
  - `.pi/prompts/qa.md`
  - `docs/prd.md`
  - `docs/research.md`
  - `docs/issues.md`
- Final note:
  - Ready for template use as the default local workflow behavior for this slice, with the current residual risks documented rather than treated as blockers.
- Notes / risks:
  - do not broaden this ticket into the next hardening roadmap
  - keep the decision focused on this PRD slice only
