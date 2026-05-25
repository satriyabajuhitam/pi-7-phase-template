# PRD

## Overview
Add one narrow follow-up that determines whether the repo-local `spawn` experiment on `exp/pi-spawn` is actually ready to merge into `main`.

This follow-up is not about adding more `spawn` capability. It is about producing a trustworthy merge-readiness decision packet that distinguishes:
- ready for continued branch use
- ready for merge to `main`

The packet should combine fresh validation, branch-vs-main delta review, rollback/blast-radius assessment, and a dedicated HITL verdict.

## Problem statement
The branch now has completed follow-ups for presets, timeout support, completion reliability, and operational hardening. It also has branch-level verdicts that the work is ready for continued use on `exp/pi-spawn`.

However, those verdicts are not the same as merge readiness. The repo still lacks a dedicated review artifact that answers the default-path question clearly enough for `main`.

Today, three practical gaps remain:
- there is no explicit branch-vs-main summary that tells reviewers exactly what would change if `exp/pi-spawn` became the default path
- there is no dedicated merge-readiness packet tying validation evidence, retained artifacts, and rollback posture into one decision surface
- there is no dedicated HITL verdict that says either `ready for merge to main` or `not ready`, with specific blockers if not ready

## Desired outcome
After this follow-up is complete:
- maintainers can review one concise merge-readiness packet for `exp/pi-spawn`
- the packet explains what changed relative to `main`, what risks remain, and what evidence supports a merge decision
- the packet makes rollback and blast-radius posture explicit
- the final HITL verdict clearly says either `ready for merge to main` or `not ready`
- if the branch is still not ready, the blocking reasons are concrete enough to reopen or create the smallest correct follow-up ticket

## Users and actors
- Primary users:
  - repository maintainers deciding whether `exp/pi-spawn` should become the default path on `main`
  - human reviewers who need a clear yes/no merge decision with evidence
- Secondary users:
  - future agents or maintainers who need a compact explanation of what separated branch-use approval from merge approval
  - reviewers validating rollback and compatibility posture before merge
- Internal actors or systems involved:
  - the repo-local replacement `spawn` extension/runtime
  - repo-local validation scripts and tests
  - repo docs that capture branch status and merge criteria
  - Git history and branch-vs-main diff context

## Scope
- In scope:
  - produce a branch-vs-main delta summary for the `spawn` experiment and related repo-policy/doc changes
  - rerun the main repo-local validation commands needed for a merge decision
  - capture the current rollback, blast-radius, and compatibility posture
  - record a dedicated HITL merge-readiness verdict
  - map any blocking gap to the smallest correct follow-up ticket if the branch is still not ready
- Included workflows:
  - reviewer checks the current branch against the merge checklist in `docs/pi-spawn.md`
  - maintainer reruns repo-local validation and regression commands for the merge candidate
  - maintainer reviews branch-vs-main impact and rollback posture
  - HITL records a merge-ready or not-ready verdict
- Included surfaces or entry points:
  - `docs/pi-spawn.md`
  - `docs/issues.md`
  - repo-local validation command output
  - repo-local regression test output
  - branch diff / git review context

## Non-goals
- Explicitly out of scope for this phase:
  - adding new `spawn` features or new public API surface
  - silently fixing unrelated implementation issues during the merge review
  - building a new test harness or release system
  - broadening the repo into a subagent platform or orchestration product
  - automatically merging to `main` as part of this follow-up
- Nice-to-have but deferred:
  - broader provider/model matrix automation
  - a richer release checklist beyond this branch-specific merge gate
  - new validation infrastructure beyond what is needed for the current merge decision
- Related problems not solved here:
  - all provider instability
  - all future spawn roadmap questions
  - long-term maintenance policy beyond the current branch decision

## User experience and behavior
This follow-up is reviewer-facing, not end-user-facing.

Expected behavior:
- a maintainer should be able to inspect one compact merge-readiness packet instead of reconstructing the decision from multiple past tickets
- the packet should state clearly what is different on `exp/pi-spawn` versus `main`
- the packet should state clearly whether current validation is strong enough for default-path adoption
- rollback and blast-radius should be understandable without deep archaeology
- the final HITL verdict should be explicit and unambiguous

Main flow:
1. A maintainer reviews the merge checklist in `docs/pi-spawn.md`.
2. Fresh validation and regression evidence is gathered for the current branch state.
3. Branch-vs-main impact, rollback posture, and remaining risks are summarized.
4. A human reviewer records a dedicated merge-readiness verdict.
5. If the verdict is negative, the blocker is routed to the smallest correct follow-up ticket.

Empty states:
- if a required validation run or review artifact is missing, the packet must say what is missing rather than implying readiness

Loading states:
- this phase does not add a new runtime or UI loading state

Error states:
- validation limitations such as quota or provider unavailability must be recorded explicitly
- if branch-vs-main review reveals a blocker, the packet must name it clearly

Success states:
- the branch is explicitly marked either ready for merge to `main` or not ready
- if ready, the evidence and rollback posture are still preserved in the packet

Permissions or visibility rules:
- this phase does not change runtime permissions or end-user visibility rules
- it only changes the documentation and review posture around merge readiness

## Functional requirements
1. The repository must provide one explicit merge-readiness packet that distinguishes branch-use approval from merge-to-main approval.
2. The packet must summarize the meaningful branch-vs-main delta for `spawn`, related docs/policy, and any user-visible behavior changes.
3. The packet must include fresh evidence from the repo-local validation command and deterministic regression test, or explicitly record why a required run is unavailable.
4. The packet must record rollback, blast-radius, and compatibility posture clearly enough for a main-merge decision.
5. The packet must record a dedicated HITL verdict of either `ready for merge to main` or `not ready`.
6. If the verdict is `not ready`, the packet must identify concrete blockers and route them to the smallest correct follow-up ticket rather than leaving them vague.
7. This follow-up must not add new `spawn` capabilities or broaden the public API.
8. This follow-up must preserve the distinction between branch-level continued-use approval and main-merge approval.

## Edge cases
- Invalid input:
  - if the current branch state is dirty, the packet must note that when it affects merge confidence
- Partial failure:
  - if some validation passes but a comparison or rollback review is incomplete, the packet must not flatten that into readiness
- External dependency failure:
  - provider quota or model availability issues may limit fresh validation; those limitations must be recorded explicitly and judged as either acceptable or blocking
- Timeouts / retries:
  - this follow-up does not add new retry behavior; it only evaluates the already-defined timeout behavior as part of merge confidence
- Permissions / access issues:
  - merge review should stay possible with normal repo-local access and existing validation commands
- Duplicate or repeated actions:
  - repeated merge-readiness runs should remain safe; they may produce fresh artifacts or updated summaries without changing runtime semantics
- Empty or missing data:
  - if a needed branch-vs-main summary, rollback note, or validation artifact is missing, the final verdict must remain `not ready` or explicitly conditional

## Acceptance criteria
- [ ] A merge-readiness packet exists that clearly distinguishes branch-use approval from merge-to-main approval.
- [ ] The packet includes a branch-vs-main delta summary plus rollback/blast-radius posture.
- [ ] The packet includes fresh validation evidence from `node scripts/validate-spawn-hardening.mjs` and `node --test tests/spawn-return-result-activation.test.mjs`, or explicit limitations if a run is unavailable.
- [ ] A dedicated HITL verdict is recorded as either `ready for merge to main` or `not ready`, with explicit blockers if not ready.
- [ ] The follow-up does not expand `spawn` scope or silently turn the merge review into more feature work.

## Constraints
- Business constraints:
  - the branch should only merge to `main` if default-path trust is materially higher than the remaining risk
- Legal or compliance constraints:
  - none identified for this repo-local follow-up
- Technical constraints that affect behavior:
  - the merge review depends on current repo-local validation tooling rather than a large new harness
  - branch-vs-main review must account for runtime behavior, docs/policy changes, and rollback practicality
  - the current distinction between success, repaired success, degraded fallback, strict failure, and timeout must stay intact during review
- Timeline or rollout constraints:
  - keep this follow-up narrow; if a real blocker appears, stop and route it rather than quietly expanding scope

## Dependencies
- Relevant external services:
  - optional provider-backed Pi execution for the current validation command
- Upstream or downstream systems:
  - the repo-local replacement `spawn` extension/runtime
  - repo-local validation scripts and tests
  - Git branch diff and branch status context
- Required research findings:
  - no new external research is required
- Prototype decisions being promoted:
  - none; prototyping is unnecessary for this merge-readiness review

## Open questions
- will the branch-vs-main delta reveal any default-path risk that was acceptable on the experiment branch but not on `main`?
- are any current environment/provider limitations acceptable for a main merge, or do they still weaken confidence too much?
- should a positive merge verdict also update the top-level status language in `docs/pi-spawn.md` immediately, or only after the actual merge?

## Recommended next step
- Suggested next phase:
  - Phase 5 — implementation planning in `docs/issues.md`
- Why that is the right next step:
  - the merge-readiness work is now concrete enough to plan as a small evidence-and-verdict follow-up
- What should happen immediately after this PRD is accepted:
  - break the follow-up into small tickets for branch-vs-main delta review, fresh merge-candidate validation, rollback/compatibility assessment, and the final HITL verdict

## Source artifacts
- `docs/idea.md`
- `docs/pi-spawn.md`
- `docs/issues.md`

## Handoff to Issues
- [x] Main user flows are clear
- [x] Acceptance criteria are testable enough for planning
- [x] Scope boundaries are explicit
- [x] Dependencies and constraints that affect slicing are visible
- [x] Material ambiguities that could break ticket breakdown are explicitly listed

Ready for next phase: yes
Primary blocker: none
Notes:
- Keep this follow-up focused on merge readiness, not new `spawn` capability.
- If a blocker appears, route it to the smallest correct follow-up ticket rather than expanding this review silently.
- A positive verdict here should still remain a human decision, not an automatic merge.
