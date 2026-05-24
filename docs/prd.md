# PRD

## Overview
Replace the current `spawn` experience in this repository with a new `spawn` implementation that keeps the same public tool contract while delivering a materially better UI/UX for parallel delegation. The end state is still a minimal spawn primitive, not a full subagent platform: one tool, one focused task, with improved inline status visibility, a lightweight active-spawn widget, and performance that does not feel slower than the current `pi-spawn` baseline.

## Problem statement
The current `pi-spawn` experience is useful but too minimal in the places that matter most during real work, especially when several spawns run in parallel. Users can lose track of which spawn is still running, which one produced an error or warning, and which one has already completed without expanding multiple results one by one.

The repository now wants a better default `spawn` experience, but without paying the cost of turning spawn into a heavier subagent runtime. The problem is not that the public tool contract is wrong; the problem is that the current UX does not surface enough state for fast, confident reading during multi-spawn workflows.

## Desired outcome
After this work is complete:
- users can keep using `spawn` with the same tool name and parameter contract they already know
- parallel spawn activity is easier to read at a glance
- users can understand running, warning/error, and completed states without repeatedly expanding results
- a lightweight widget gives temporary visibility into active spawns without adding persistent runtime complexity
- the replacement does not feel visibly slower than the current `pi-spawn` behavior in a 3-parallel-spawn scenario
- the system still feels like a minimal spawn primitive rather than a general-purpose subagent platform

## Users and actors
- Primary users:
  - Pi users in this repository who use `spawn` for focused delegation
  - repository maintainers improving the default spawn workflow
- Secondary users:
  - future agents and maintainers comparing the replacement against current `pi-spawn`
  - reviewers validating whether the new UX is ready for broader use
- Internal actors or systems involved:
  - Pi Coding Agent
  - the replacement `spawn` extension/runtime
  - terminal/TUI surfaces used for inline tool rendering and above-editor widgets

## Scope
- In scope:
  - direct replacement of the current `spawn` behavior in this repository
  - full compatibility with the existing `spawn` tool contract in v1
  - improved collapsed inline rendering as a short status card
  - lightweight widget/status visibility for active spawns only
  - better readability for 3 parallel spawns
  - lightweight manual side-by-side validation against current `pi-spawn`
  - performance guardrails focused on avoiding visible regression
- Included workflows:
  - single spawn with clearer running and completion states
  - multiple parallel spawns with glanceable active-state visibility
  - warning/error/truncation handling that is easier to interpret without expansion
- Included surfaces or entry points:
  - `spawn` tool call rendering
  - `spawn` tool result rendering
  - temporary active-spawn widget/status in the TUI while spawns are running

## Non-goals
- Explicitly out of scope for this phase:
  - turning `spawn` into a full subagent platform
  - changing the public `spawn` API in v1
  - adding an overlay conversation viewer in v1
  - adding persistent spawn history or a spawn registry in v1
  - adding a new background completion notification system in v1
  - adding broad lifecycle or orchestration complexity beyond what is required for active-spawn UI
- Nice-to-have but deferred:
  - richer historical inspection of completed spawns
  - interactive spawn management menus
  - advanced performance benchmarking harnesses beyond the agreed manual validation flow
  - additional UI surfaces beyond inline cards and the lightweight active widget
- Related problems not solved here:
  - long-session memory or compaction continuity
  - durable specialist-agent management
  - background job infrastructure beyond the current spawn model

## User experience and behavior
Users continue to call `spawn` exactly as they do today. The main difference is that the `spawn` call and result surfaces become easier to scan during active work.

Expected behavior:
- When a spawn starts, the inline tool UI should show a short status-card style representation rather than a plain text dump.
- While one or more spawns are active, the TUI should show a lightweight active-spawn widget or status surface above the editor.
- That widget should appear only while spawns are active and disappear automatically when no active spawns remain.
- The widget should show up to 3 active spawns individually, then collapse any additional active spawns into an overflow summary.
- The collapsed inline card should always expose the most important signals first:
  - status/icon
  - current activity or a short result preview
  - warning or truncation signals when present
- Token and turn statistics may appear, but only as visually secondary information.

Main flow:
1. User or agent invokes `spawn`.
2. The inline card immediately shows the spawn state in a concise, readable format.
3. If multiple spawns run in parallel, the active-spawn widget gives temporary top-level visibility into active work.
4. As each spawn progresses, users can tell which items are still running and which ones have warnings or problems.
5. When a spawn completes, its inline result remains readable as a short status card without requiring expansion for basic interpretation.
6. When all spawns complete, the temporary active-spawn widget disappears.

Empty states:
- If there are no active spawns, no active-spawn widget should remain visible.
- If a spawn returns no useful output, the inline card should still communicate a clear empty-result state instead of looking broken or ambiguous.

Loading states:
- Running spawns should visibly look running, not merely incomplete.
- Parallel work should remain understandable without forcing the user to inspect each result in detail.

Error states:
- Error, warning, and truncation conditions should be visually distinct and easy to notice.
- Missing or degraded-success outcomes should be clearer than they are in the current experience.

Success states:
- In a 3-parallel-spawn scenario, a user can tell which spawn is still running, which has an error/warning, and which has completed without expanding every result one by one.

Permissions or visibility rules:
- The new UX must not imply new capabilities beyond the current `spawn` contract.
- The replacement must not introduce persistent visibility surfaces when no spawn activity exists.

## Functional requirements
1. The replacement must preserve the existing `spawn` tool name and parameter contract in v1.
2. The collapsed inline `spawn` UI must render as a short status card rather than a plain text dump.
3. The collapsed inline card must always expose status/icon, current activity or short result preview, and warning/truncation indicators when present.
4. Token and turn statistics, when shown, must appear as clearly secondary information rather than the primary signal.
5. While spawns are active, the TUI must show a lightweight active-spawn widget or status surface.
6. The active-spawn widget must appear only while spawns are active and disappear automatically when all active spawns complete.
7. The active-spawn widget must show up to 3 active spawns individually and summarize any additional active spawns as overflow.
8. The replacement must support readable parallel behavior without requiring users to expand every result in a 3-parallel-spawn scenario.
9. The replacement must not add persistent spawn history, a spawn registry, an overlay conversation viewer, or a new background completion system in v1.
10. The replacement must not feel visibly slower than the current `pi-spawn` experience in the agreed 3-parallel-spawn validation scenario.

## Edge cases
- Invalid input:
  - existing invalid `spawn` inputs should remain invalid under the same contract and should not gain confusing new UI states
- Partial failure:
  - a spawn may produce partial output, warnings, or degraded-success results; the collapsed card must still communicate that clearly
- External dependency failure:
  - failures from the underlying model/tool/session flow may still occur and must surface as distinct error states rather than ambiguous text blobs
- Timeouts / retries:
  - long-running spawns may remain active longer than expected; the UI must still preserve readable running-state visibility
- Permissions / access issues:
  - the replacement must not suggest additional powers or persistence that the current `spawn` model does not actually have
- Duplicate or repeated actions:
  - rapid or repeated parallel spawns must not cause the widget to become permanently cluttered or remain visible after active work ends
- Empty or missing data:
  - empty output, truncated output, or missing structured result signals must still map to understandable collapsed UI states

## Acceptance criteria
- [ ] Existing `spawn` calls remain compatible in v1 with the same tool name and parameter contract.
- [ ] In a 3-parallel-spawn scenario, a user can tell which spawn is running, which has an error/warning, and which has completed without expanding every result.
- [ ] While active spawns exist, the TUI shows a temporary active-spawn widget/status surface that disappears automatically when activity ends.
- [ ] The active-spawn widget shows up to 3 active spawns individually and collapses any additional active spawns into an overflow summary.
- [ ] Error, warning, truncation, and empty-result states are visually clearer than in the current `pi-spawn` experience.
- [ ] Side-by-side manual validation against current `pi-spawn` shows that the replacement does not feel visibly slower in the same 3-parallel-spawn scenario.
- [ ] The v1 implementation does not introduce an overlay viewer, persistent history/registry, a new background completion system, or an API change to `spawn`.

## Constraints
- Business constraints:
  - v1 must improve day-to-day usability without expanding into a larger multi-agent product surface
- Legal or compliance constraints:
  - none identified for this repository-local PRD
- Technical constraints that affect behavior:
  - the public `spawn` contract must remain compatible in v1
  - transient state should exist only in memory for active spawns and be discarded on completion
  - new UI must fit the Pi TUI model without requiring broader runtime infrastructure
- Timeline or rollout constraints:
  - this should be ready for issue breakdown once the requirements are accepted; no separate prototype phase is required first

## Dependencies
- Relevant external services:
  - normal Pi model/provider access already used by `spawn`
- Upstream or downstream systems:
  - Pi extension APIs for tool rendering and TUI widget/status behavior
  - the current repository workflow that already expects a `spawn` capability
- Required research findings:
  - `pi-spawn` remains the right minimal baseline rather than a heavier specialist-agent system
  - the problem to solve is UX/state readability, not a shift to durable subagent orchestration
- Prototype decisions being promoted:
  - none; a separate prototype was judged unnecessary for this narrow v1 scope

## Open questions
- What exact wording should later be used in implementation planning to preserve the “minimal replacement, not new platform” boundary?
- Which ticket slices should be planned first after PRD acceptance: inline card UX, active widget UX, or validation harness/workflow?
- Should any non-blocking secondary stats be hidden entirely in extremely narrow terminal widths, or is that planning detail best left to implementation?

## Recommended next step
- Suggested next phase:
  - Phase 5 — issue breakdown
- Why that is the right next step:
  - the end-state behavior, UX scope, performance guardrails, and anti-drift boundaries are now concrete enough to slice into implementation-ready tickets
- What should happen immediately after this PRD is accepted:
  - break the work into vertical slices for inline status-card improvements, active-spawn widget behavior, and validation against the current `pi-spawn` baseline

## Source artifacts
- `docs/idea.md`
- `docs/research.md`
- existing `docs/prd.md` context replaced by this updated direction

## Handoff to Issues
- [x] Main user flows are clear
- [x] Acceptance criteria are testable enough for planning
- [x] Scope boundaries are explicit
- [x] Dependencies and constraints that affect slicing are visible
- [x] Material ambiguities that could break ticket breakdown are explicitly listed

Ready for next phase: yes
Primary blocker: none
Notes:
- Plan around a minimal replacement `spawn` experience, not a new general-purpose subagent runtime.
- Keep issue slicing centered on visible UX gains first and performance regression avoidance second.
