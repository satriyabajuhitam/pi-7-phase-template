# Idea

## Problem statement
The repo-local `spawn` replacement on `exp/pi-spawn` now has working presets, per-call timeout support, and a more trustworthy completion contract. The next remaining gap is not core behavior anymore, but **operability and regression safety**.

Today, three practical weaknesses remain:
- validation still depends on manually re-running a loose matrix of smoke commands
- the critical `return_result` activation bug was caught late and does not yet have a deterministic local regression test
- repaired success is visible in metadata, but not yet transparent enough in the rendered UX

## Desired outcome
Add one narrow follow-up that improves day-to-day confidence in `spawn` without changing its minimal product boundary.

After this follow-up:
- one repo-local command should be able to run the main validation matrix and summarize the outcome
- the `return_result` activation bug should have a deterministic local regression test
- repaired success should be easier to distinguish from direct success in the UI
- `spawn` should still feel like one focused delegation primitive, not a larger subagent platform or test harness product

## Scope
- add a lightweight one-command validation script for the current `spawn` reliability matrix
- add a deterministic local regression test for child-session `return_result` tool activation
- improve UI transparency for repaired success using existing completion metadata
- keep the current `spawn` public API unchanged unless a very small internal-only support change is clearly necessary
- keep validation and UX work grounded in the existing replacement extension, not a new framework

## Non-goals
- building a large automated screenshot or TUI harness
- adding retries, queueing, orchestration, dashboards, or job-control surfaces
- expanding presets into implementation-agent behavior
- changing the meaning of success, degraded fallback, strict failure, or timeout again in this follow-up
- adding broad new public API surface to `spawn`
- solving general provider instability or all model-variance issues

## Constraints
- preserve the minimal `spawn` mental model
- keep the follow-up small and execution-friendly
- prefer deterministic local validation where possible
- avoid introducing a large harness that costs more to maintain than the feature itself
- UI transparency for repaired success should reuse existing result surfaces rather than adding a new mode

## Assumptions
- the highest-value next step is confidence and regression safety, not more capability
- the `return_result` activation bug is important enough to deserve a direct local regression test
- repaired success is useful, but should be more visible to users reviewing results
- a small validation script can improve repeatability without forcing the repo into heavyweight QA infrastructure

## Decision map
- Validation posture: one-command repo-local matrix vs continued manual ad hoc smoke runs
- Test posture: deterministic local regression coverage vs provider-only confidence
- UX posture: expose repaired success explicitly vs leave it implicit in metadata
- Scope posture: operational hardening only vs new behavior/features

## Questions asked
- What is the smallest next step that improves trust after the completion-reliability follow-up is done?
- Which missing guardrail would most reduce future regressions?
- Should repaired success become more explicit in the UI?
- Can we improve validation repeatability without building a full harness?

## Decisions made
- the next follow-up should focus on operational hardening, not new `spawn` capabilities
- the three selected slices are:
  - one-command validation script
  - deterministic regression test for `return_result` activation
  - repaired-success UI transparency
- this should stay repo-local and lightweight
- no prototype is needed before PRD
- no external research is needed before PRD

## Open questions
- should the validation script live under `scripts/` or another repo-local validation path?
- should repaired success be shown as a badge, a summary line, or both?
- should duplicate `return_result` handling be explicitly covered in this same follow-up, or deferred?

## Need research?
No external research is currently needed. The problem is repo-local and can be specified from current branch artifacts and source inspection.

## Need prototype?
No. This follow-up is narrow enough to go directly to PRD.

## Biggest risk
The main risk is overbuilding: turning a small hardening follow-up into a full validation framework or expanding UI/state handling beyond the minimal `spawn` boundary.

## Recommended next step
Move to PRD for a narrow operational-hardening follow-up centered on:
- validation repeatability
- regression safety for `return_result` activation
- repaired-success transparency

## Handoff to PRD
- [x] The next problem focus is explicit
- [x] The desired outcome is explicit
- [x] Scope boundaries are explicit
- [x] Non-goals prevent drift into orchestration or harness overbuild
- [x] Constraints are visible enough to shape a narrow PRD
- [x] Research is not required before PRD
- [x] Prototyping is not required before PRD

Ready for next phase: yes
Primary blocker: none
