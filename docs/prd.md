# PRD

## Overview
Extend this repository's replacement `spawn` experience with one small reliability follow-up focused on **completion semantics**. The end state remains a minimal `spawn` primitive with the current UI/UX, preset, and timeout work intact, but with clearer and more trustworthy handling when a child run finishes without calling `return_result`.

## Problem statement
The current `spawn` branch is already more readable and more controllable than the earlier baseline, but one trust gap remains: child runs still sometimes finish without calling `return_result`.

Today that contract miss can fall into a degraded-success fallback path that is useful for debugging, but it weakens confidence because users can receive output from a run that did not actually satisfy the intended completion contract. The repository needs a narrower, more trustworthy completion story without turning `spawn` into a job runner, orchestration system, or larger subagent platform.

## Desired outcome
After this work is complete:
- users can trust the distinction between a true successful spawn result, a degraded fallback result, and a hard failure
- child runs that miss the `return_result` contract are surfaced more clearly and honestly
- missing-`return_result` cases happen less often, or are more clearly framed when they still occur
- existing success cases remain lightweight and compatible
- current preset and timeout behavior remain intact
- `spawn` still feels like one tool for one focused delegation task, not a workflow engine or job-control UI

## Users and actors
- Primary users:
  - Pi users in this repository who use `spawn` for focused delegation
  - repository maintainers who need to trust whether a child actually completed its contract
- Secondary users:
  - future agents and maintainers who rely on `spawn` result classification during execution, validation, and review workflows
  - reviewers checking that reliability improvements stay inside the minimal `spawn` boundary
- Internal actors or systems involved:
  - Pi Coding Agent
  - the repo-local replacement `spawn` extension/runtime
  - terminal/TUI surfaces used for inline tool rendering and expanded result inspection

## Scope
- In scope:
  - improve completion reliability around missing `return_result`
  - make result classification more trustworthy when a child finishes without satisfying the `return_result` contract
  - preserve or improve debugging visibility without letting degraded fallback be mistaken for true success
  - keep existing `strictResult`, `preset`, and `timeout` behavior coherent with the refined completion story
  - allow one narrow internal completion-reliability refinement inside the existing `spawn` surface: true success must require observed evidence that the child actually invoked the `return_result` tool, not merely assistant text that looks like a result
  - allow at most one bounded internal completion-repair turn when a child appears to finish without observed `return_result` tool invocation and no timeout/runtime failure has already occurred
  - validate the new behavior with lightweight repo-local evidence
- Included workflows:
  - normal successful `spawn` calls where the child correctly calls `return_result`
  - non-strict calls where a child may still finish without `return_result`
  - strict calls where missing `return_result` must remain an explicit failure
  - validation and review flows where users need to know whether a result is true success, degraded fallback, or hard failure
- Included surfaces or entry points:
  - `spawn` result classification and output handling
  - collapsed spawn result preview
  - expanded spawn result detail
  - prompt/contract guidance inside the existing `spawn` flow
  - narrow parent-side/runtime completion handling inside the current `spawn` implementation to recognize true success only when `return_result` tool invocation is actually observed on the child run
  - one bounded internal completion-repair turn inside the same spawn call when needed to turn a nominal success attempt into an actual observed `return_result` tool invocation

## Non-goals
- Explicitly out of scope for this phase:
  - turning `spawn` into a full subagent platform
  - adding retries, queueing, scheduling, bounded parallelism, or worker pools
  - adding chain, fan-in, aggregator, or multi-step orchestration behavior
  - adding a persistent completion dashboard, history view, or job-control mode
  - solving broader long-session memory or compaction continuity problems
  - changing `spawn` into a preset-only or agent-catalog-driven system
  - adding a broad new public feature surface; if a blocker remains, prefer a narrow internal refinement before considering any new caller-facing control
  - adding generic retries or unbounded repair loops; if completion repair is used, it must be a single narrow contract-repair step rather than a general retry system
- Nice-to-have but deferred:
  - broader orchestration features
  - richer post-run analytics or dashboards
  - separate reliability controls beyond the current minimal `spawn` boundary
- Related problems not solved here:
  - broader provider/model variability
  - durable specialist-agent management
  - multi-agent workflow composition

## User experience and behavior
Users continue to use `spawn` the same way: one focused task, optional `preset`, optional `timeout`, optional `strictResult`. The difference is that completion semantics become more trustworthy and easier to interpret.

Expected behavior:
- A true successful spawn result should feel like a normal success because the child completed the intended contract.
- If a child finishes without calling `return_result`, the system must not make that state easy to confuse with true success.
- When fallback output is still shown for debugging, the degraded nature of that result must remain obvious.
- When `strictResult` is enabled, missing `return_result` must remain a clear failure.
- Completion-reliability improvements must not make ordinary successful spawns noisier or heavier than necessary.
- Timeout behavior and preset behavior must continue to read coherently inside the same result surfaces.
- The follow-up must preserve the minimal mental model of `spawn`.

Main flow:
1. User or agent invokes `spawn` with `prompt`, optionally using existing `preset`, `timeout`, or `strictResult` controls.
2. If the child completes and the runtime observes an actual `return_result` tool invocation, the result is shown as a normal success.
3. If the child appears to finish without observed `return_result` tool invocation, the runtime may issue at most one narrow internal repair turn that asks for the actual `return_result` tool handoff.
4. If that repair turn produces observed `return_result` tool invocation, the result is shown as a normal success.
5. If the child still finishes without observed `return_result` tool invocation, the system may still expose fallback output for debugging when allowed, but the result must be visibly classified as degraded rather than true success.
6. If `strictResult` is enabled and the child finishes without `return_result`, the spawn remains an explicit failure.
7. In collapsed UI, users can tell whether a result is true success, degraded fallback, or failure without digging through hidden internals.
8. In expanded UI, users can clearly see why the result was treated as degraded or failed.

Empty states:
- If no fallback output is available, the system should still surface the contract miss clearly rather than implying success.

Loading states:
- Running-state visibility should remain at least as clear as the current replacement spawn UX.
- This phase must not add new persistent loading chrome or always-on status surfaces.

Error states:
- Missing `return_result` under `strictResult` remains an explicit failure.
- Non-timeout and timeout errors must remain understandable under the refined completion behavior.
- Invalid input behavior for existing parameters must remain clear.

Success states:
- Normal successful runs remain lightweight and familiar.
- Users should be able to trust that a normal success means the child actually completed the intended result contract.

Permissions or visibility rules:
- This phase does not add new authority, tool access, or hidden runtime policy.
- Visibility should favor honest completion semantics rather than smoothing over contract misses.

## Functional requirements
1. A normal successful `spawn` result must remain reserved for runs that satisfy the intended completion contract.
2. True success must require observed evidence that the child actually invoked the `return_result` tool; assistant text that merely resembles a result or a tool call must not count as success.
3. If a child appears to finish without observed `return_result` tool invocation and no timeout/runtime failure has already decided the outcome, the runtime may perform at most one bounded internal completion-repair turn to request the actual tool handoff.
4. If that repair turn still does not produce observed `return_result` tool invocation, the resulting state must be visibly distinguishable from a true success.
5. When fallback output is shown for a missing-`return_result` case, that output must remain available for debugging without obscuring that the result is degraded.
6. When `strictResult` is enabled, a child finishing without observed `return_result` tool invocation must remain an explicit failure.
7. Existing `preset` and `timeout` behavior must remain coherent and understandable under the refined completion semantics.
8. Completion-reliability improvements must not silently add retries, queueing, scheduling, bounded parallelism, or broader orchestration behavior.
9. Completion-reliability improvements must not require a persistent new UI mode, dashboard, or job-control surface.
10. The refined result handling must remain understandable in both collapsed and expanded `spawn` result surfaces.
11. Ordinary successful `spawn` calls must remain behaviorally compatible and should not become materially noisier.
12. The repo-local validation approach for this phase must remain lightweight and sufficient to distinguish true success, degraded fallback, strict failure, and the bounded completion-repair behavior.

## Edge cases
- Invalid input:
  - existing required inputs such as `prompt` must remain enforced
  - existing validation for `preset`, `timeout`, and `strictResult` must remain clear and unaffected by this follow-up
- Partial failure:
  - a child may produce useful fallback text but still miss `return_result`; that state must not be misclassified as true success
  - a child may print text such as `return_result(...)` or the exact requested final string without actually invoking the tool; that state must still not count as true success
- External dependency failure:
  - provider, tool, or session failures unrelated to `return_result` must still surface as their normal error states
- Timeouts / retries:
  - timeout failures remain explicit failures and must not collapse into the degraded missing-`return_result` path
  - if a bounded internal completion-repair turn is used, it must stay inside the same spawn call and must not become a generic retry system
  - this phase does not add general retry behavior
- Permissions / access issues:
  - completion-reliability improvements must not imply broader permissions or different tool access than the underlying spawn call already has
- Duplicate or repeated actions:
  - repeated degraded fallback cases should remain understandable without requiring a new persistent management UI
- Empty or missing data:
  - if a child misses `return_result` and has little or no fallback output, the contract miss must still be obvious

## Acceptance criteria
- [ ] A normal successful `spawn` result is clearly distinguishable from a missing-`return_result` degraded fallback case.
- [ ] When a child finishes without `return_result` and fallback output is shown, users can still see that the contract was missed.
- [ ] When `strictResult` is enabled, missing `return_result` remains an explicit failure.
- [ ] Existing timeout behavior remains intact and distinguishable from missing-`return_result` behavior.
- [ ] Existing preset behavior remains intact and understandable under the refined completion semantics.
- [ ] Ordinary successful `spawn` calls remain behaviorally compatible and do not become materially noisier.
- [ ] The follow-up does not introduce retries, queueing, bounded parallelism, chain/fan-in behavior, or job-control surfaces.
- [ ] One lightweight repo-local validation pass covers at least: normal success, non-strict missing-`return_result`, strict missing-`return_result`, and compatibility with existing timeout behavior.

## Constraints
- Business constraints:
  - this addition must improve trust in `spawn` results without broadening the product into a heavier subagent system
- Legal or compliance constraints:
  - none identified for this repository-local PRD
- Technical constraints that affect behavior:
  - the current replacement `spawn` UX and minimal mental model must remain intact
  - current `preset`, `timeout`, and `strictResult` surfaces must stay coherent
  - live validation has now shown that guidance-only tightening did not reliably produce a true `return_result` success case, and even the observed-evidence refinement still lacks a live true-success case, so this phase now explicitly allows one bounded internal completion-repair turn while still avoiding broad new caller-facing controls
  - this phase should avoid a new public control surface unless planning proves there is no smaller path
  - the repository still lacks a stable harness for full internal `spawn`/TUI assertions, so validation should stay lightweight
- Timeline or rollout constraints:
  - this should remain small enough to plan as a narrow follow-up rather than a new exploratory branch

## Dependencies
- Relevant external services:
  - normal Pi model/provider access already used by `spawn`
- Upstream or downstream systems:
  - the repo-local replacement `spawn` extension/runtime
  - Pi extension APIs for tool execution, validation, and inline/expanded rendering
- Required research findings:
  - no new external research is required for this phase
  - current repo artifacts already establish that broader orchestration ideas should remain separate from `spawn`
- Prototype decisions being promoted:
  - none; separate prototyping was judged unnecessary for this narrow addition

## Open questions
- None at the PRD level for this refinement. The chosen boundary is: true success requires observed `return_result` tool evidence on the child run, and the only additional recovery allowed is one bounded internal completion-repair turn.

## Recommended next step
- Suggested next phase:
  - Phase 5 — re-plan `docs/issues.md`
- Why that is the right next step:
  - the missing boundary choice is now resolved: execution no longer needs to assume guidance-only tightening is sufficient, and can instead plan one narrow internal/runtime slice around observed `return_result` tool evidence plus one bounded internal completion-repair turn
- What should happen immediately after this PRD is accepted:
  - update `docs/issues.md` so the reopened work replaces the failed guidance-only assumption with a narrow implementation slice that makes true success depend on observed `return_result` tool evidence and adds at most one bounded completion-repair turn

## Source artifacts
- `docs/idea.md`
- `docs/pi-spawn.md`
- existing `docs/prd.md` context refined into the completion-reliability follow-up

## Handoff to Issues
- [x] Main user flows are clear
- [x] Acceptance criteria are testable enough for planning
- [x] Scope boundaries are explicit
- [x] Dependencies and constraints that affect slicing are visible
- [x] Material ambiguities that could break ticket breakdown are explicitly listed

Ready for next phase: yes
Primary blocker: none
Notes:
- Keep the follow-up narrow: improve completion trust around missing `return_result` without broadening `spawn` into workflow management.
- Preserve the distinction between true success, degraded fallback, and hard failure.
- The chosen refinement is internal/runtime only: true success must require observed `return_result` tool evidence on the child run, and the only additional recovery allowed is one bounded internal completion-repair turn.
- Do not let implementation drift into retries, queueing, bounded parallelism, or broader orchestration behavior.
