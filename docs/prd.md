# PRD

## Overview
Add one narrow operational-hardening follow-up for the repo-local `spawn` replacement on `exp/pi-spawn`. The goal is not to expand `spawn` with new delegation capabilities, but to make the current branch easier to validate, safer against regression, and more transparent when a successful result required the bounded internal completion-repair step.

This follow-up covers exactly three small improvements:
- a one-command repo-local validation script for the current `spawn` reliability matrix
- a deterministic local regression test for child-session `return_result` activation
- clearer UI transparency for repaired success using existing result metadata

## Problem statement
The branch now has working presets, explicit timeout support, and a more trustworthy completion contract. However, three practical trust and maintenance gaps remain.

First, validation is still too manual. Re-running the current reliability matrix requires a loose set of ad hoc smoke commands and hand inspection of JSON output.

Second, the critical `return_result` activation bug was only found after repeated live debugging. There is not yet a deterministic local regression test that would catch the same issue quickly in the future.

Third, repaired success is recorded in metadata, but the rendered result UX does not yet make that state explicit enough. A user can inspect details, but the success path is not as transparent as it should be when a result only became successful after the single bounded repair step.

## Desired outcome
After this follow-up is complete:
- one repo-local command can run the main `spawn` validation matrix and summarize the important outcomes
- the `return_result` activation bug has deterministic local regression coverage
- users can tell more easily when a `spawn` success was direct versus repaired
- the current `spawn` mental model stays minimal and unchanged at the API level
- the branch becomes easier to review, maintain, and re-validate without building a heavyweight harness

## Users and actors
- Primary users:
  - Pi users in this repository who use `spawn` and need confidence that recent changes still behave correctly
  - repository maintainers validating `spawn` before continued branch use or future merge consideration
- Secondary users:
  - future agents and maintainers who need repeatable validation artifacts with low context cost
  - reviewers checking that repaired success remains transparent and bounded
- Internal actors or systems involved:
  - Pi Coding Agent
  - the repo-local replacement `spawn` extension/runtime
  - repo-local validation scripts
  - repo-local tests
  - terminal/TUI result rendering surfaces for `spawn`

## Scope
- In scope:
  - add one repo-local validation script that runs the current `spawn` reliability matrix and outputs a concise summary
  - add deterministic local regression coverage for child-session `return_result` tool activation when `createAgentSession(...)` receives an explicit `tools` list
  - improve rendered transparency for repaired success using existing completion metadata such as `completionRepairAttempted` and `completionRepairSucceeded`
  - preserve current completion semantics, timeout semantics, preset behavior, and strict behavior while adding better validation and transparency
- Included workflows:
  - maintainers running one command to check the current `spawn` reliability matrix
  - maintainers running local tests that catch the `return_result` activation regression without relying on provider-backed behavior
  - users inspecting a successful `spawn` result that required one bounded repair step
- Included surfaces or entry points:
  - repo-local scripts or commands used for validation
  - repo-local local test coverage
  - collapsed and/or expanded `spawn` result rendering where repaired success is surfaced

## Non-goals
- Explicitly out of scope for this phase:
  - adding new `spawn` capabilities or new delegation modes
  - changing completion semantics again
  - adding retries, queueing, scheduling, bounded parallelism, or orchestration controls
  - building a full screenshot harness, TUI harness, or end-to-end test framework
  - changing `spawn` into a dashboarded job system or control plane
  - adding a broad new public API surface
- Nice-to-have but deferred:
  - richer validation artifact reporting
  - more comprehensive UI harnesses
  - broader provider/model matrix automation
  - duplicate-`return_result` policy hardening if it proves necessary later
- Related problems not solved here:
  - all provider instability or quota issues
  - general long-session continuity problems
  - persistent specialist-agent management

## User experience and behavior
Users should not need to learn a new product surface for this follow-up.

Expected behavior:
- maintainers should be able to run one repo-local validation command instead of reconstructing the smoke matrix manually
- the validation output should show the important distinctions clearly enough to support review: true success, repaired success, degraded fallback, strict failure, timeout, and preset coherence
- local regression coverage for the `return_result` activation bug should not require provider-backed execution
- successful `spawn` results that required a bounded repair step should be visibly distinguishable from direct success in the existing result surfaces
- ordinary direct success should remain lightweight and should not become materially noisier
- timeout, strict failure, degraded fallback, and preset behavior should continue to read coherently alongside the repaired-success improvement

Main flow:
1. A maintainer runs the repo-local validation command.
2. The script executes the agreed reliability matrix or its local equivalent and reports a concise summary plus artifact paths.
3. A maintainer or agent can quickly determine whether the main completion states remain distinguishable.
4. Separately, local regression coverage verifies that `return_result` remains active when explicitly required in child sessions.
5. When a real `spawn` call succeeds only after the single bounded repair step, the rendered result makes that repaired-success state explicit.

Empty states:
- if the validation script cannot gather one part of the matrix, it should report what is missing clearly rather than implying success

Loading states:
- this phase should not add a new persistent loading UI or always-on status mode

Error states:
- validation failures should remain readable and should point to the relevant output artifact or failing check
- repaired success must not be mislabeled as a plain direct success when the metadata shows otherwise

Success states:
- direct success remains compact and familiar
- repaired success remains successful, but visibly marked as repaired

Permissions or visibility rules:
- this phase does not add new authority or tool access beyond what the current `spawn` branch already uses
- repaired-success visibility should use existing result surfaces rather than a new standalone view

## Functional requirements
1. The repository must provide one lightweight repo-local validation entry point that covers the current `spawn` reliability matrix closely enough to support repeatable branch validation.
2. The validation output must make it easy to distinguish at least: direct success, repaired success, degraded fallback, strict failure, timeout, and preset coherence.
3. The repository must provide deterministic local regression coverage for the child-session `return_result` activation requirement when an explicit `tools` list is supplied.
4. A repaired `spawn` success must be visibly distinguishable from a direct success in the existing result-rendering surfaces.
5. Direct success must remain readable and must not become materially noisier just because repaired success is now more explicit.
6. This follow-up must preserve the current bounded-repair semantics and must not evolve into a broader retry or orchestration system.
7. This follow-up must preserve the current public `spawn` API shape.
8. The follow-up must remain lightweight enough for repo-local use without introducing a large new harness burden.

## Edge cases
- Invalid input:
  - the validation script should fail clearly when required local dependencies, provider access, or expected artifact paths are unavailable
- Partial failure:
  - some validation cases may pass while others fail or are unavailable; the output must not flatten that into a single silent success state
- External dependency failure:
  - provider quota exhaustion or provider outages may block part of the validation matrix; this should be reported explicitly rather than being mistaken for a runtime regression
- Timeouts / retries:
  - timeout behavior remains part of the validation matrix and must stay distinct from repaired or degraded completion states
  - this phase does not add new generic retry behavior
- Permissions / access issues:
  - local regression coverage should not depend on permissions beyond the repo-local environment already expected for Pi development
- Duplicate or repeated actions:
  - repeated validation runs should remain safe and should produce fresh artifacts or summaries without requiring manual cleanup logic beyond a lightweight repo-local approach
- Empty or missing data:
  - if a validation case produces no useful output, the summary must make that obvious rather than implying the case passed

## Acceptance criteria
- [ ] One repo-local validation command exists and covers the current `spawn` reliability matrix closely enough for repeatable branch validation.
- [ ] A deterministic local regression test exists for the `return_result` activation bug and would fail if the child session stops activating that tool under an explicit `tools` list.
- [ ] Repaired success is visibly distinguishable from direct success in the current `spawn` result rendering.
- [ ] Direct success, strict failure, timeout, and preset behavior remain coherent after this follow-up.
- [ ] The follow-up does not add a new public `spawn` API surface or drift into a broader retry/orchestration system.

## Constraints
- Business constraints:
  - this must improve trust and maintainability without broadening `spawn` into a heavier platform
- Legal or compliance constraints:
  - none identified for this repo-local follow-up
- Technical constraints that affect behavior:
  - the current `spawn` public API should remain unchanged
  - the repo still lacks a full stable internal TUI/screenshot harness, so validation should stay lightweight
  - the regression test for `return_result` activation should be deterministic and should avoid unnecessary provider dependence
  - repaired-success UI should reuse existing result surfaces and existing metadata rather than creating a new result mode
- Timeline or rollout constraints:
  - this should remain small enough for a narrow follow-up rather than another broad branch of work

## Dependencies
- Relevant external services:
  - optional provider-backed Pi execution for part of the validation matrix
- Upstream or downstream systems:
  - the repo-local replacement `spawn` extension/runtime
  - Pi SDK session and tool activation behavior
  - existing repo-local docs and validation conventions
- Required research findings:
  - no new external research is required
- Prototype decisions being promoted:
  - none; separate prototyping was judged unnecessary for this narrow follow-up

## Open questions
- Should repaired success be surfaced as a badge, a summary line, or both in the rendered result UX?
- Should the one-command validation script emit only human-readable output, or also a machine-readable summary artifact?
- Should duplicate-`return_result` handling remain out of scope unless a blocker appears during implementation?

## Recommended next step
- Suggested next phase:
  - Phase 5 — implementation planning in `docs/issues.md`
- Why that is the right next step:
  - the scope is now narrow, concrete, and does not require research or prototyping before ticket breakdown
- What should happen immediately after this PRD is accepted:
  - break the work into a small set of tickets covering the validation command, the deterministic regression test, and the repaired-success UI transparency slice

## Source artifacts
- `docs/idea.md`
- `docs/pi-spawn.md`
- existing `docs/prd.md` context refined into this operational-hardening follow-up

## Handoff to Issues
- [x] Main user flows are clear
- [x] Acceptance criteria are testable enough for planning
- [x] Scope boundaries are explicit
- [x] Dependencies and constraints that affect slicing are visible
- [x] Material ambiguities that could break ticket breakdown are explicitly listed

Ready for next phase: yes
Primary blocker: none
Notes:
- Keep the follow-up narrow and operational: validation repeatability, regression safety, and repaired-success transparency only.
- Do not let this turn into a full harness project or a broader spawn-platform expansion.
- Preserve the current `spawn` API and completion semantics while making the branch easier to trust and maintain.
