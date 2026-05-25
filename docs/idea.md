# Idea

## Problem statement
The repo-local `spawn` replacement on `exp/pi-spawn` is now strong enough for continued branch use, but the repo still does **not** have a dedicated decision artifact for whether it is safe to become the default path on `main`.

That gap is different from feature completion. Presets, timeout support, completion reliability, and operational hardening have all landed, but the branch still lacks a clean merge-readiness packet that answers:
- what changed relative to `main`
- what blast radius or rollback risk remains
- whether the current validation posture is strong enough for default-path adoption
- whether any remaining limitations are acceptable on `main` rather than only on an experiment branch

## Desired outcome
Open one narrow follow-up focused on **merge readiness for `main`**, not on adding more `spawn` capability.

After this follow-up:
- maintainers should have one explicit merge-readiness packet for `exp/pi-spawn`
- the packet should distinguish branch-use approval from main-merge approval
- the packet should summarize branch-vs-main delta, latest validation evidence, rollback posture, and remaining risks
- a dedicated HITL verdict should state either `ready for merge to main` or `not ready`, with explicit blockers if not ready

## Scope
- assess branch-vs-main delta for `spawn` behavior, public API surface, docs/policy posture, and operational impact
- rerun the latest repo-local validation commands needed for a merge decision
- record rollback, blast-radius, and compatibility posture clearly enough for a main-merge decision
- produce one dedicated HITL merge-readiness verdict
- if blockers remain, route them to the smallest correct follow-up ticket rather than silently broadening this review

## Non-goals
- adding new `spawn` capabilities
- reopening preset, timeout, completion-reliability, or hardening implementation work unless fresh evidence proves a real blocker
- building a new harness, dashboard, or orchestration surface
- auto-merging to `main`
- treating continued branch use as equivalent to merge readiness
- solving every provider/model variance issue before any merge discussion can happen

## Constraints
- preserve the minimal `spawn` mental model
- use the repo-local merge checklist already captured in `docs/pi-spawn.md`
- keep the follow-up evidence-driven and narrow
- if a blocker is found, record it explicitly instead of blurring it into a vague `not ready`
- avoid inventing new requirements that were never part of the experiment boundary

## Assumptions
- the remaining question is now governance and default-path trust, not core capability
- a separate merge-readiness decision is required even though continued-branch-use approval already exists
- the current validation tooling is probably good enough to support a main-merge review, but that still needs to be proven against the merge checklist
- any new blocker found at this stage should be small and specific, not a reason to restart the whole experiment

## Decision map
- Merge gate: what must be true for `exp/pi-spawn` to become safe enough for `main`?
- Evidence: which fresh validation and retained artifacts are sufficient for a merge decision?
- Risk: what rollback, compatibility, or blast-radius concerns remain?
- Boundary: does the branch still feel minimal enough to become the default path?

## Questions asked
- What still separates `ready for continued branch use` from `ready to merge to main`?
- What evidence is still required for a real merge-readiness review?
- How should remaining blockers be recorded if the answer is still `not ready`?

## Decisions made
- open a dedicated merge-readiness follow-up rather than treating the hardening verdict as a merge approval
- go directly to PRD and issues; no new research or prototype phase is needed
- keep the follow-up focused on evidence, risk, and explicit sign-off
- require a dedicated HITL verdict for `main`

## Open questions
- will fresh branch-vs-main review surface any hidden compatibility or rollout blocker?
- are the current retained artifacts enough, or will the merge review require additional fresh evidence?
- should the final merge packet live only in existing docs, or also include a short reviewer summary section in `docs/pi-spawn.md`?

## Need research?
No external research is currently needed. This is a repo-local merge decision based on existing branch artifacts, source inspection, validation reruns, and human judgment.

## Need prototype?
No. This follow-up is about merge readiness, not exploring a new direction.

## Biggest risk
The main risk is false confidence: declaring the experiment ready for `main` because the branch feels good locally, without a clean explicit review of default-path risk, rollback posture, and remaining branch-only assumptions.

## Recommended next step
Move directly to PRD for a narrow merge-readiness follow-up centered on:
- branch-vs-main delta review
- fresh merge-candidate validation evidence
- rollback and blast-radius assessment
- dedicated HITL merge-readiness verdict

## Handoff to PRD
- [x] The next problem focus is explicit
- [x] The desired outcome is explicit
- [x] Scope boundaries are explicit
- [x] Non-goals prevent drift back into feature expansion
- [x] Constraints are visible enough to shape a narrow PRD
- [x] Research is not required before PRD
- [x] Prototyping is not required before PRD

Ready for next phase: yes
Primary blocker: none
