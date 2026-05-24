# Issues

## Planning assumptions
- Source PRD: `docs/prd.md`
- Planning scope: replacement `spawn` implementation only, not the older `exp/pi-spawn` experiment plan
- Baseline for comparison: keep current `exp/pi-spawn` behavior available as the side-by-side comparison target
- Prototype winner: none; a separate prototype phase was judged unnecessary for this narrow v1 scope
- Key constraints:
  - preserve the public `spawn` tool contract in v1
  - keep the product as a minimal spawn primitive, not a fuller subagent runtime
  - improve UI/UX first, then guard against visible performance regression
  - transient state may exist only in memory for active spawns and must be discarded on completion
  - v1 must not add an overlay viewer, persistent history/registry, or a new background completion system

## Dependency rules
- The replacement backend must become the only active `spawn` backend before UI work can be trusted.
- Inline card and active-widget slices are separate vertical outcomes, but both depend on the replacement backend being loaded correctly.
- Validation work should happen only after the replacement backend and both primary UX slices are complete.
- Human judgment is required for the final side-by-side readability and “feels slower or not” verdict.
- No ticket in this plan should expand into a new agent platform, history system, or alternate public API.

## Ticket conventions
- `Status`: `todo`, `in-progress`, `blocked`, `done`
- `Type`: `AFK`, `HITL`
- `Depends on`: `none` or explicit ticket IDs
- `Blocks`: explicit ticket IDs or blank when none
- `Parallelizable`: `yes`, `no`
- QA follow-up: reopen an existing ticket if the original scope still fits; otherwise add a new ticket

## Parallelization plan
Can start immediately:
- `ISSUE-001` — make the replacement backend the only active `spawn` backend in the replacement branch

Blocked until prerequisites complete:
- `ISSUE-002` and `ISSUE-003` wait on `ISSUE-001`
- `ISSUE-004` waits on `ISSUE-002` and `ISSUE-003`
- `ISSUE-005` waits on `ISSUE-004`

Suggested lanes:
- Lane A: backend ownership + compatibility posture
- Lane B: inline status-card UX
- Lane C: active-spawn widget + validation + HITL review

## Tickets

### ISSUE-001 — Make the local replacement the only active `spawn` backend
- Status: done
- Type: AFK
- Goal: ensure the replacement branch loads exactly one compatible `spawn` backend, owned by the repo-local extension rather than the upstream npm package.
- Why it exists: all later UX work is unstable if upstream `pi-spawn` and the replacement backend can both register `spawn` in the same session.
- Depends on: none
- Blocks: ISSUE-002, ISSUE-003, ISSUE-004
- Parallelizable: no
- Source requirements:
  - PRD Functional requirements 1, 9
  - PRD Constraints
  - PRD Non-goals
- Scope:
  - remove the replacement branch’s runtime dependence on the upstream `npm:pi-spawn@0.1.0` package
  - register a repo-local `spawn` implementation with the same public tool contract
  - ensure only one `spawn` tool is active after reload
  - update local guardrail/status wording so it no longer assumes the upstream package is the backend
- Acceptance criteria:
  - [x] the replacement branch can load `spawn` without relying on the upstream `pi-spawn` package
  - [x] after reload, exactly one `spawn` backend is active in the session
  - [x] the replacement `spawn` preserves the existing public tool name and parameter contract in v1
  - [x] local guardrail/status messaging refers to the active spawn backend generically rather than requiring the upstream package by name
- Notes / risks:
  - local replacement backend vendored to `.pi/extensions/spawn/index.ts`
  - `.pi/settings.json` no longer loads `npm:pi-spawn@0.1.0`
  - `.pi/extensions/spawn-mode.ts` wording now refers to the local spawn backend generically
  - validation used static config/resource inspection plus print-mode checks that `spawn` is available and normal startup still succeeds

### ISSUE-002 — Ship readable inline status cards for `spawn`
- Status: done
- Type: AFK
- Goal: replace the current plain-text-heavy inline `spawn` experience with short status cards that make single and parallel spawn results easier to interpret at a glance.
- Why it exists: the main UX problem in the PRD is poor state readability, especially for running, warning, truncated, degraded-success, and completed outcomes.
- Depends on: ISSUE-001
- Blocks: ISSUE-004
- Parallelizable: yes
- Source requirements:
  - PRD Functional requirements 2, 3, 4, 8
  - PRD User experience and behavior
  - PRD Acceptance criteria 2, 5, 7
- Scope:
  - improve `renderCall` and `renderResult` for `spawn`
  - make status/icon, activity-or-short-preview, and warning/truncation indicators mandatory in collapsed cards
  - keep token/turn stats visually secondary when shown
  - cover empty-result, error, warning, truncation, and degraded-success states without changing the public API
- Acceptance criteria:
  - [x] collapsed `spawn` results render as short status cards rather than plain text dumps
  - [x] running, completed, warning, error, empty-result, and truncated/degraded states are distinguishable without expansion
  - [x] activity or a short result preview is visible in the collapsed card
  - [x] secondary stats do not dominate the card visually
- Notes / risks:
  - implemented in `.pi/extensions/spawn/index.ts` by reshaping `renderCall` and `renderResult` into queued/running/done/error/fallback/warning/truncated card states with compact previews and badges
  - validation used runtime startup checks, a real `spawn` smoke execution in print mode, and source inspection because this repo does not yet have an automated TUI render harness for extension card output
  - reopened by HITL review on 2026-05-24 because completion-vs-degraded semantics were ambiguous when output existed but `return_result` was skipped, and the added warning/status treatment was perceived as slightly slower in side-by-side use
  - follow-up execution tightened the collapsed semantics by surfacing explicit `fallback` / `[no return_result]` states and removing collapsed usage stats so the primary state reads faster
  - keep the collapsed form short enough for real terminal use; do not turn it into a mini dashboard
  - preserve expandability for deeper inspection without making expansion mandatory for basic interpretation

### ISSUE-003 — Add a temporary active-spawn widget for parallel visibility
- Status: done
- Type: AFK
- Goal: give users temporary top-level visibility into active spawns so parallel work is readable before individual results complete.
- Why it exists: inline cards alone are not enough to make 3 parallel spawns easy to track while they are still running.
- Depends on: ISSUE-001
- Blocks: ISSUE-004
- Parallelizable: yes
- Source requirements:
  - PRD Functional requirements 5, 6, 7, 8
  - PRD User experience and behavior
  - PRD Acceptance criteria 2, 3, 4, 7
- Scope:
  - maintain in-memory state only for active spawns
  - show a lightweight widget or status surface above the editor while active spawns exist
  - show up to 3 active spawns individually
  - collapse additional active spawns into an overflow summary
  - remove the widget automatically when no active spawns remain
- Acceptance criteria:
  - [x] while active spawns exist, a temporary widget/status surface is visible
  - [x] the widget shows up to 3 active spawns individually
  - [x] additional active spawns are summarized as overflow instead of expanding the widget indefinitely
  - [x] the widget disappears automatically when all active spawns complete
  - [x] no persistent spawn history or registry remains after completion
- Notes / risks:
  - implemented in `.pi/extensions/spawn/index.ts` with in-memory active spawn entries plus a `spawn-active` widget rendered above the editor
  - the widget is intentionally transient: entries are created on execute start, updated from streaming output, and removed in `finally`
  - validation used startup/tool-availability checks plus source inspection because the repo still lacks an automated interactive TUI harness
  - do not let this ticket grow into a historical spawn browser or management console
  - keep the widget useful in the common 3-parallel-spawn case first

### ISSUE-004 — Add and record the side-by-side validation flow
- Status: done
- Type: AFK
- Goal: create one lightweight, repeatable validation flow that compares the replacement against the current `pi-spawn` baseline using the same 3-parallel-spawn scenario.
- Why it exists: the PRD’s UX and performance claims need a concrete comparison method before human review can trust the result.
- Depends on: ISSUE-002, ISSUE-003
- Blocks: ISSUE-005
- Parallelizable: no
- Source requirements:
  - PRD Acceptance criteria 2, 5, 6
  - PRD Recommended next step
  - `docs/idea.md` validation decision
- Scope:
  - define the shared 3-parallel-spawn scenario
  - define the comparison checklist: readability, error/warning visibility, completion clarity, and whether the replacement feels slower
  - capture the validation method and findings in repo-local docs
  - keep the validation lightweight and manual rather than building a broad perf harness
- Acceptance criteria:
  - [x] one documented side-by-side validation flow exists for current `pi-spawn` vs the replacement
  - [x] the flow uses the same 3-parallel-spawn scenario on both sides
  - [x] the recorded checklist covers readability, warning/error visibility, completion clarity, and perceived slowness
  - [x] findings are captured in a repo-local artifact that future agents can reuse
- Notes / risks:
  - documented in `docs/prototype/spawn-replacement-side-by-side-validation.md`
  - the artifact captures the agreed comparison scenario, checklist, and the replacement-side findings that now exist before human review
  - this ticket prepares the evidence path; it does not make the final human readiness decision by itself
  - keep the flow small enough that it is actually run, not merely described

### ISSUE-005 — Review the replacement verdict and decide whether it is ready for execution use
- Status: done
- Type: HITL
- Goal: make a human decision on whether the replacement `spawn` experience is good enough to keep moving forward with, based on the recorded side-by-side validation.
- Why it exists: “feels slower or not” and “materially more readable or not” are product judgments that should not be silently auto-approved.
- Depends on: ISSUE-004
- Blocks:
- Parallelizable: no
- Source requirements:
  - PRD Acceptance criteria 2, 6, 7
  - PRD Open questions
  - validation artifact produced by ISSUE-004
- Scope:
  - review the recorded side-by-side findings
  - decide whether the replacement is ready for continued execution on this branch
  - record the verdict and any blocker if the result is not good enough
- Acceptance criteria:
  - [x] a human verdict is recorded on whether the replacement is ready to continue
  - [x] the verdict explicitly addresses readability improvement and visible performance regression risk
  - [x] if the result is not ready, the blocking reason is recorded clearly enough to reopen the right ticket
- Notes / risks:
  - initial verdict recorded on 2026-05-24: not ready
  - initial baseline observations: active readability was acceptable, completion-vs-degraded clarity was weak, collapsed cards were standard, and perceived performance felt normal
  - initial replacement observations: readability and warning/error visibility improved, collapsed cards were more useful for multi-spawn triage, but completion state was still ambiguous when output existed alongside a formal no-`return_result` failure path, and the replacement felt slightly slower
  - initial verdict summary: readability better = yes; warning/error visibility better = yes; completion state clearer = no; feels slower = yes
  - smallest fitting AFK follow-up reopened: `ISSUE-002`
  - re-check recorded on 2026-05-24 after the `ISSUE-002` rework: ready to continue
  - re-check baseline observations: active readability was adequate but parallel tracking was less comfortable, completion clarity was weak, collapsed cards were standard, and perceived performance felt normal
  - re-check replacement observations: active readability, warning/error visibility, and completion clarity all improved; collapsed cards became more useful for fast scanning; the replacement still felt slightly slower
  - latest verdict summary: readability better = yes; warning/error visibility better = yes; completion state clearer = yes; feels slower = yes; recommended next action = ready to continue
  - known caveat: perceived slowness remains a product risk against the PRD guardrail and should stay visible in later QA/release judgment
  - follow-up perf ticket created: `ISSUE-006`
  - do not broaden this ticket into design brainstorming; decide based on the agreed validation flow

### ISSUE-006 — Reduce perceived slowness without losing the new readability gains
- Status: done
- Type: AFK
- Goal: reduce avoidable replacement-side overhead so the new `spawn` UX no longer feels slower than baseline in the shared 3-parallel-spawn scenario.
- Why it exists: the latest HITL and QA verdicts allow branch continuation, but both still record a perceived-performance caveat against the PRD guardrail.
- Depends on: ISSUE-005
- Blocks:
- Parallelizable: no
- Source requirements:
  - PRD Functional requirement 10
  - PRD Acceptance criterion 6
  - `docs/prototype/spawn-replacement-side-by-side-validation.md`
  - `docs/qa.md`
- Scope:
  - inspect the replacement-side render/update path for avoidable overhead in the common 3-parallel-spawn case
  - reduce unnecessary per-update work in inline cards and/or the active-spawn widget without changing the public `spawn` API
  - preserve the current readability improvements for fallback, warning, truncation, and completion clarity
  - record the smallest trustworthy post-change validation evidence for whether the perceived-slowness caveat improved
- Acceptance criteria:
  - [x] the replacement stays within the existing v1 `spawn` contract and non-goals
  - [x] the current readability gains for active-state visibility and completion clarity are preserved
  - [x] at least one plausible source of avoidable perceived slowness is reduced or explicitly ruled out with evidence
  - [x] updated validation notes state whether the replacement still feels slower after the perf-focused pass
- Notes / risks:
  - first perf pass implemented in `.pi/extensions/spawn/index.ts` by batching partial streaming updates, computing the streaming preview once per flush, and reusing that preview for both the inline running card and the active-spawn widget
  - second perf pass made the streaming path lighter again by shrinking the preview buffer window, raising the minimum partial-update interval to 100ms, and sending only the compact preview text in partial tool updates instead of the larger tail buffer
  - this keeps the public `spawn` contract unchanged and preserves the fallback/warning/truncation readability work from `ISSUE-002`
  - validation used print-mode startup/tool-availability checks, real `spawn` smoke execution, source inspection, and a final HITL re-check after fresh reload
  - final HITL re-check on 2026-05-24 reported: readability better than baseline = yes; completion clarity better than baseline = yes; still slower than baseline = no; performance guardrail satisfied = yes; recommended next action = ready for broader sign-off
  - notable non-blocking observation: a non-strict child can still end in fallback/degraded-success when it does not call `return_result`, and strict child output may still surface fallback-style JSON-like content for debugging, but the current UX now distinguishes these cases clearly enough for operator use
  - updated validation notes were recorded in `docs/prototype/spawn-replacement-side-by-side-validation.md` and `docs/qa.md`; the earlier caveat is now closed for the current branch scope
  - keep this narrower than a general benchmark harness or architecture rewrite
  - do not trade away fallback/error clarity just to make the UI thinner
  - if future broader usage reveals a new gap, reopen the smallest fitting perf follow-up rather than broadening this ticket retroactively
