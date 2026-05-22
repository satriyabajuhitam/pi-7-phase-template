# Real Flow 3 — Phase 6 execution-prep experiment

## Objective
Run one real `pi-spawn` workflow for Phase 6 and test whether the local conventions can prepare concise execution context for exactly one ready AFK ticket using current planning artifacts.

## Flow summary
- Current phase: **Phase 6 — Execution**
- Artifacts used:
  - `docs/issues.md`
  - `docs/prd.md`
  - `docs/prototype/spawn-conventions.md`
- Mode: **single spawn**
- Parent completion signal: `flow3-ok`

## Result
Status: **passed**

Observed:
- the parent agent called `spawn` successfully
- the sub-agent returned the requested section structure:
  - `Ticket`
  - `Objective`
  - `Dependencies`
  - `Likely files`
  - `Validation targets`
- the parent agent completed with the exact success marker `flow3-ok`

## Execution brief returned
The sub-agent identified exactly one next ready AFK ticket:
- **`ISSUE-005 — Stabilize concise branch guidance for experimental users`**

The brief grounded that selection in:
- `docs/issues.md` readiness and dependency state
- `docs/prd.md` source requirements and constraints
- `docs/prototype/spawn-conventions.md` Phase 6 execution-prep rules

## Output quality assessment
### What worked well
- The output stayed constrained to exactly one ready AFK ticket
- The brief was concrete and execution-oriented instead of broad planning prose
- The sub-agent named likely files and validation targets, which makes the result usable as a handoff input
- The result stayed grounded in current repo planning artifacts rather than generic advice

### What was weaker than expected
- The output still included one assumption statement around readiness semantics
- The brief used fairly long evidence bullets instead of a shorter operator-style format
- The selected ticket was `ISSUE-005` rather than the currently executing `ISSUE-004`, which is correct after `ISSUE-004` was marked `in-progress`, but worth noting explicitly

## Key findings from the flow
- `pi-spawn` conventions are strong enough to support Phase 6 execution-prep behavior on real repo artifacts
- The workflow can identify the next ready AFK ticket without drifting into multi-ticket selection
- The current planning artifacts are now rich enough to produce a useful one-ticket execution brief

## Validation evidence
- The flow completed with the exact success marker `flow3-ok`
- The sub-agent returned all required sections for a one-ticket execution brief
- The brief selected only one AFK ticket and cited repo artifacts for the choice

## Decision impact
This flow satisfies the missing evidence for the experimental branch's execution-prep use case. The branch now has validated real flows for:
- research synthesis
- planning-readiness / blocker detection
- execution preparation for one ready AFK ticket

## Recommended next step
The next ready AFK ticket in the plan is now **`ISSUE-005`**. After that, the branch can move to the HITL review ticket `ISSUE-006`.
