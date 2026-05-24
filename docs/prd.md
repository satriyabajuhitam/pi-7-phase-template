# PRD

## Overview
Extend this repository's replacement `spawn` experience with one small reliability feature: an optional per-call `timeout` parameter. The end state remains a minimal `spawn` primitive with the current improved UI/UX, plus an explicit way for callers to bound a single delegated task without turning `spawn` into a broader orchestration system.

## Problem statement
The current replacement `spawn` flow is more readable and more transparent than the earlier baseline, but long or hung child runs still depend on provider or session behavior rather than an explicit caller-controlled bound.

That creates a reliability gap for callers who need a focused delegation task to either finish within a known window or fail clearly. The repository wants a simple timeout control for those cases, but without adding hidden runtime policy, queueing behavior, or multi-step orchestration.

## Desired outcome
After this work is complete:
- users can call `spawn` with an optional explicit `timeout` parameter
- callers who need a bounded delegation task can enforce that bound per call
- calls that omit `timeout` continue to behave compatibly with the current replacement `spawn` flow
- when a timeout is hit, the result is treated as a clear hard failure rather than degraded-success
- timeout behavior is visible enough to understand from normal spawn UI surfaces without adding new persistent UI modes
- `spawn` still feels like one tool for one focused task, not a subagent platform or job runner
- the current spawn UX gains remain intact and do not regress materially in readability or perceived performance

## Users and actors
- Primary users:
  - Pi users in this repository who use `spawn` for focused delegation
  - repository maintainers who need bounded delegation for validation-heavy or time-sensitive tasks
- Secondary users:
  - future agents and maintainers who need predictable timeout behavior from `spawn`
  - reviewers validating that timeout support stays within the repo's minimal-spawn boundary
- Internal actors or systems involved:
  - Pi Coding Agent
  - the repo-local replacement `spawn` extension/runtime
  - terminal/TUI surfaces used for inline tool rendering and expanded result inspection

## Scope
- In scope:
  - add one explicit optional `timeout` parameter to `spawn`
  - define `timeout` as a per-call value in milliseconds
  - keep timeout opt-in rather than introducing a new default global bound
  - treat timeout breaches as hard failures
  - surface timeout failures through the existing collapsed and expanded spawn result surfaces
  - preserve compatibility for calls that omit `timeout`
- Included workflows:
  - bounded single-task delegation where the caller wants the child run to fail if it exceeds a chosen time limit
  - normal `spawn` calls without `timeout`
  - validation-heavy or execution-critical tasks that benefit from an explicit time bound
- Included surfaces or entry points:
  - `spawn` tool parameters
  - `spawn` result handling
  - collapsed spawn result preview
  - expanded spawn error detail

## Non-goals
- Explicitly out of scope for this phase:
  - turning `spawn` into a full subagent platform
  - adding global hidden timeout policy for all spawn calls
  - adding queue management, retries, scheduling, or background job behavior
  - adding chain, fan-in, aggregator, or multi-step orchestration behavior
  - adding bounded parallelism, concurrency controls, or worker pools
  - changing tool/model/runtime authority based on timeout usage
  - adding a new persistent timeout badge, dashboard, or status mode
- Nice-to-have but deferred:
  - future bounded-parallelism or concurrency guardrails
  - richer timeout diagnostics beyond clear error surfacing
  - later consideration of other reliability controls if separately justified
- Related problems not solved here:
  - degraded-success caused by missing `return_result`
  - long-session memory or compaction continuity
  - durable specialist-agent management
  - broader multi-agent orchestration behavior

## User experience and behavior
Users continue to use `spawn` as a focused delegation tool. The difference is that callers may optionally provide `timeout` when a task must either finish within a known limit or fail clearly.

Expected behavior:
- `spawn` continues to work without `timeout`.
- When `timeout` is present, the bound applies only to that one spawn call.
- `timeout` is expressed in milliseconds.
- If the child run exceeds the requested timeout, the spawn is treated as failed.
- A timeout failure is shown through normal spawn error surfaces rather than a new persistent timeout UI mode.
- Timeout support must not make non-timeout calls noisier.
- Timeout support must not change the minimal mental model of `spawn`.

Main flow:
1. User or agent invokes `spawn` with `prompt`, optionally adding `timeout`.
2. If no `timeout` is supplied, `spawn` behaves compatibly with the current replacement flow.
3. If `timeout` is supplied and the child finishes within the bound, the result behaves like a normal successful spawn result.
4. If `timeout` is supplied and the child exceeds the bound, the spawn returns a hard failure.
5. In collapsed UI, the result preview makes the timeout failure obvious as an error.
6. In expanded UI, the error detail clearly states that the spawn timed out and includes the timeout value.

Empty states:
- If `timeout` is omitted, no extra timeout UI needs to appear.
- If a timeout-bounded call returns no useful output before finishing normally, the existing empty-result handling still applies.

Loading states:
- Running-state visibility should remain at least as clear as the current replacement spawn UX.
- Timeout support must not add persistent loading chrome or extra always-on status surfaces.

Error states:
- Invalid `timeout` input should fail clearly.
- A timeout breach should fail clearly and should not be presented as degraded-success.
- Existing warning, truncation, and non-timeout error states must remain understandable when timeout support exists.

Success states:
- A timeout-bounded call that finishes in time should read like a normal spawn success.
- Users can still rely on the current improved spawn readability for both bounded and unbounded calls.

Permissions or visibility rules:
- Timeout is caller-selected control, not a hidden runtime policy.
- Timeout does not grant new capabilities or change runtime authority.
- Timeout visibility should favor clarity at failure time without making all spawn results heavier.

## Functional requirements
1. `spawn` must support an optional explicit `timeout` parameter while preserving compatibility for calls that omit it.
2. The public `timeout` value must be expressed in milliseconds.
3. Calls that omit `timeout` must remain unbounded and behaviorally compatible with the current replacement `spawn` flow.
4. If a call supplies `timeout` and the child run completes within that bound, the result must behave like a normal successful spawn result.
5. If a call supplies `timeout` and the child run exceeds that bound, the spawn must fail explicitly rather than returning degraded-success.
6. Timeout support must not silently change tools, model selection, runtime authority, or broader policy.
7. Collapsed spawn results must make timeout failures visibly understandable as errors.
8. Expanded spawn detail must clearly indicate that a timeout occurred and include the requested timeout value.
9. Invalid timeout inputs must fail clearly rather than being silently accepted or ignored.
10. Adding timeout support must not materially regress the readability or perceived-performance guardrails already established for the replacement `spawn` experience.
11. Adding timeout support must not expand `spawn` into orchestration, queueing, retry management, or broader job-control behavior.

## Edge cases
- Invalid input:
  - missing `prompt` must remain invalid even when `timeout` is supplied
  - unsupported timeout shapes or invalid timeout values must fail clearly rather than being silently coerced
- Partial failure:
  - a timeout breach must not be reported as degraded-success even if partial output exists
- External dependency failure:
  - provider, tool, or session failures that are not timeout-related must still surface as normal spawn errors
- Timeouts / retries:
  - calls that omit `timeout` should keep current behavior rather than inheriting a new default timeout
  - this phase does not add automatic retry behavior after timeout
- Permissions / access issues:
  - timeout support must not imply broader permissions or different tool access than the underlying spawn call actually has
- Duplicate or repeated actions:
  - repeated timeout-bounded calls should remain readable without requiring new persistent UI surfaces
- Empty or missing data:
  - if a bounded call finishes successfully but returns weak or empty output, the system must surface that honestly rather than reclassifying it as timeout

## Acceptance criteria
- [ ] A caller can invoke `spawn` either without `timeout` or with an explicit `timeout` value in milliseconds.
- [ ] Calls that omit `timeout` continue to behave compatibly with the current replacement `spawn` flow.
- [ ] Calls that provide a valid `timeout` and finish within the requested bound behave like normal successful spawn calls.
- [ ] Calls that exceed the requested `timeout` fail explicitly rather than returning degraded-success.
- [ ] Invalid timeout inputs receive a clear invalid-input response.
- [ ] In collapsed UI, a timeout failure is visibly understandable as an error.
- [ ] In expanded UI, a timeout failure clearly states that the spawn timed out and includes the timeout value.
- [ ] Timeout support does not introduce retries, queueing, bounded parallelism, or orchestration behavior.
- [ ] Timeout support does not materially regress the readability or perceived-performance guardrails already established for the replacement `spawn` experience.
- [ ] One lightweight repo-local validation pass covers no-timeout compatibility, timeout-triggered hard fail, timeout error visibility, and normal non-timeout success behavior.

## Constraints
- Business constraints:
  - this addition must improve reliability for bounded delegation without broadening the product into a heavier subagent system
- Legal or compliance constraints:
  - none identified for this repository-local PRD
- Technical constraints that affect behavior:
  - the current replacement `spawn` UX and minimal mental model must remain intact
  - timeout must remain explicit and per-call rather than hidden behind global config behavior in this phase
  - only one lightweight API addition is acceptable in this phase: `timeout`
  - timeout failure should reuse existing result/error surfaces rather than requiring a new persistent UI mode
- Timeline or rollout constraints:
  - this should stay small enough to plan as a narrow follow-up rather than a new exploratory branch

## Dependencies
- Relevant external services:
  - normal Pi model/provider access already used by `spawn`
- Upstream or downstream systems:
  - the repo-local replacement `spawn` extension/runtime
  - Pi extension APIs for tool parameter validation and inline/expanded rendering
- Required research findings:
  - selective borrowing from broader subagent systems is acceptable when kept narrow
  - timeout posture is a safe idea to borrow only if it remains explicit and does not expand `spawn` into a broader orchestration product
- Prototype decisions being promoted:
  - none; separate prototyping was judged unnecessary for this narrow addition

## Open questions
- None at the PRD level for this phase.

## Recommended next step
- Suggested next phase:
  - Phase 5 — issue breakdown
- Why that is the right next step:
  - the timeout surface, failure semantics, compatibility posture, and validation shape are now explicit enough to plan as narrow implementation slices
- What should happen immediately after this PRD is accepted:
  - update `docs/issues.md` with a small follow-up plan covering parameter validation, timeout failure handling, timeout error visibility, and lightweight validation

## Source artifacts
- `docs/idea.md`
- `docs/research.md`
- `docs/pi-spawn.md`
- existing `docs/prd.md` context refined into the timeout follow-up

## Handoff to Issues
- [x] Main user flows are clear
- [x] Acceptance criteria are testable enough for planning
- [x] Scope boundaries are explicit
- [x] Dependencies and constraints that affect slicing are visible
- [x] Material ambiguities that could break ticket breakdown are explicitly listed

Ready for next phase: yes
Primary blocker: none
Notes:
- Keep the addition narrow: one explicit `timeout` parameter, per-call only, milliseconds, hard fail on breach.
- Do not let implementation quietly become retries, queueing, bounded parallelism, or orchestration.
- Preserve the current replacement spawn UX gains while adding explicit bounded-run control.
