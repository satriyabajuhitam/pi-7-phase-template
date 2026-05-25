# PRD

## Overview
Harden this repository’s Pi-native 7-phase workflow with a narrow first reliability slice focused on **Phase 6 execution** and the **diagnosis loop**.

This PRD does not replace 7-phase with Superpowers. It selectively adopts a small set of Superpowers-inspired reliability behaviors so the local workflow becomes harder to misuse while staying lightweight, artifact-driven, and Pi-native.

## Problem statement
The repository already has strong phase structure, local artifacts under `docs/`, and a disciplined one-ticket-per-run execution model. However, the workflow is still lighter than Superpowers in the places where reliability failures usually appear:
- completion claims can still be made with validation expectations that are not explicit enough
- test-first execution is encouraged but not strong enough by default for behavior-changing work
- independent review is available but not standardized for risky tickets
- bug diagnosis emphasizes feedback loops, but its anti-guessing guardrails and concrete debugging techniques are still too light

As a result, the repo is vulnerable to avoidable failures such as:
- marking work done with incomplete or weak evidence
- implementation-first bug fixes on behavior changes that were testable
- risky multi-file changes escaping without an independent boundary check
- ambiguous bugs moving toward execution before the root cause is isolated well enough

## Desired outcome
After this hardening slice is complete:
- Phase 6 execution makes stronger evidence-backed completion claims
- behavior-changing tickets default to test-first execution when a practical public interface exists
- risky execution work has clearer independent review triggers
- diagnosis work becomes more root-cause-first and less guess-driven
- the 7-phase workflow remains lightweight, Pi-native, and centered on existing repo-local prompts, skills, and artifacts

## Users and actors
- Primary users:
  - maintainers using this repo as a Pi workflow template
  - operators running `/execute`, `/diagnose`, and `/qa` in real project repos derived from this template
- Secondary users:
  - future agents working from fresh context windows that need stronger artifact-backed execution and diagnosis behavior
  - reviewers validating whether a ticket is truly complete or ready for handoff
- Internal actors or systems involved:
  - project-local skills under `.pi/skills/`
  - project-local prompts under `.pi/prompts/`
  - repo-local artifacts such as `docs/issues.md` and `docs/qa.md`
  - `spawn` when used selectively for reviewer/scout validation inside existing repo doctrine

## Scope
- In scope:
  - strengthen completion-claim rules for Phase 6 and Phase 7 outcomes
  - strengthen test-first defaults for behavior-changing execution tickets when practical
  - standardize minimum completion evidence for ticket completion reports
  - define when independent review is required or strongly preferred for risky execution work
  - clarify ordered review behavior: requirement fit before code quality / boundary drift
  - strengthen diagnosis guardrails so fixes are not proposed before a trusted loop and root-cause investigation
  - add concrete diagnosis techniques for deep-call, multi-boundary, and flaky failures
- Included workflows:
  - `/execute` on one ready AFK ticket
  - `/diagnose` on bugs, regressions, flaky failures, and ambiguous QA findings
  - `/qa` when findings or sign-off claims depend on fresh verification evidence
- Included surfaces or entry points:
  - `AGENTS.md`
  - `.pi/skills/execute-me/SKILL.md`
  - `.pi/skills/diagnose-me/SKILL.md`
  - `.pi/skills/qa-me/SKILL.md`
  - `.pi/prompts/execute.md`
  - `.pi/prompts/qa.md`
  - `GUIDE.md` where behavior examples need updating

## Non-goals
- Explicitly out of scope for this phase:
  - replacing 7-phase with the full Superpowers workflow
  - introducing subagent-per-task execution as the default model
  - requiring git worktrees or branch orchestration for all implementation work
  - rewriting Phase 5 planning into full step-by-step `writing-plans` style documents
  - adding a full closeout system for merge / discard / PR creation in this slice
  - broadening `spawn` into a full orchestration runtime
- Nice-to-have but deferred:
  - a dedicated `finish-me` or merge-readiness helper
  - PRD approval gates before `/issues`
  - scope-decomposition gates for oversized requests
  - optional execution briefs inside `docs/issues.md`
  - richer severity taxonomy and sign-off flows beyond the first lightweight version
- Related problems not solved here:
  - all planning-quality improvements in Phase 5
  - all release-management or branch-management problems
  - all provider/model reliability issues unrelated to local workflow behavior

## User experience and behavior
This work is operator-facing and maintainer-facing rather than end-user-facing.

Expected behavior:
- an agent should no longer casually claim a ticket is done, a bug is fixed, or QA is ready without fresh evidence from the current run
- when a ticket changes observable behavior and a practical public-interface test exists, `/execute` should default to a test-first path instead of implementation-first
- when a ticket is high-risk, multi-file, or changes a shared contract, the workflow should clearly signal that an independent review pass is required or strongly preferred
- diagnosis runs should stay in root-cause mode until a trustworthy loop and falsifiable explanation exist
- operators should still experience the workflow as lightweight and phase-oriented, not as a heavy orchestration framework

Entry points:
- `/execute`
- `/diagnose`
- `/qa`

Main flow:
1. Operator runs `/execute` on the next ready AFK ticket.
2. If the ticket changes behavior and a practical public-interface test exists, the agent follows test-first execution by default.
3. Before claiming completion, the agent gathers fresh verification evidence and reports it explicitly.
4. If the ticket is risky, the workflow triggers or strongly recommends an independent review pass.
5. For ambiguous bugs, operator runs `/diagnose` first; the workflow builds a trusted loop, reproduces or fails to reproduce, ranks hypotheses, and only then recommends execution or another handoff.

Empty states:
- if no practical public-interface test exists, the workflow may use a smaller alternative validation path but must say why TDD was not used
- if no trustworthy diagnosis loop can be built, the diagnosis must stop and report what is missing rather than pretending clarity

Loading states:
- no new UI loading surface is required in this slice
- existing Pi-native prompt and skill behavior should remain the main interaction model

Error states:
- if verification fails, the workflow must report the actual status instead of a positive completion claim
- if a risky ticket lacks the required review signal, the workflow must not quietly treat it as fully safe
- if reproduction remains flaky or ambiguous, diagnosis must say so explicitly and avoid fake certainty

Success states:
- a completed execution run includes fresh evidence and honest residual-risk reporting
- a diagnosis run ends with a clear handoff such as `ready-for-execution`, `needs-info`, `needs-research`, `hitl`, or `not reproduced`
- QA claims are clearly separated between planning-only output and evidence-based findings

Permissions or visibility rules:
- this slice does not add new runtime permissions or public product capabilities
- it only changes repo-local workflow behavior, artifact expectations, and skill guidance

## Functional requirements
1. The Phase 6 workflow must not allow a ticket to be reported as `done`, `fixed`, `pass`, or `ready` without fresh verification evidence from the current run.
2. When an AFK ticket changes observable behavior and a practical public-interface test exists, the execution workflow must default to test-first behavior rather than implementation-first behavior.
3. If test-first execution is not used for an otherwise testable behavior change, the workflow must require an explicit reason in the completion report.
4. A completed execution run must report a minimum evidence bundle that includes the ticket ID, files changed, validation commands run, result summary, and any remaining risks or `none`.
5. The workflow must define clear triggers for when independent review is required or strongly preferred, including at least risky multi-file changes, shared-contract changes, or pre-release / pre-merge readiness checks.
6. When independent review is used for risky work, the workflow must check requirement or acceptance-criteria fit before code-quality or boundary-drift concerns are treated as complete.
7. The diagnosis workflow must not recommend fixes or execution handoff until it has attempted to build a trusted loop and perform root-cause-oriented investigation.
8. The diagnosis workflow must include explicit guidance to check recent changes, rank falsifiable hypotheses, and use concrete techniques such as backward tracing, boundary instrumentation, and condition-based waiting when relevant.
9. This hardening slice must preserve the existing one-ticket-per-run execution model and must not require full subagent-driven development or mandatory worktree orchestration.

## Edge cases
- Invalid input:
  - a ticket may appear to change behavior but only affect docs or config; the workflow must avoid forcing artificial TDD in those cases
- Partial failure:
  - some validation may pass while another required check fails; the workflow must report partial success honestly instead of flattening it into `done`
- External dependency failure:
  - diagnosis or QA may depend on vendor behavior, network access, or provider availability; the workflow must record those limits explicitly rather than pretending root cause is known
- Timeouts / retries:
  - flaky or timing-sensitive failures may resist one-shot reproduction; the diagnosis guidance must prefer condition-based waiting and evidence gathering over arbitrary sleeps and repeated guessing
- Permissions / access issues:
  - if an operator lacks the access needed to reproduce or verify, the workflow must route to `hitl` or `needs-info` instead of claiming confidence
- Duplicate or repeated actions:
  - repeated execution or diagnosis runs must remain safe and should improve evidence quality rather than silently broaden scope
- Empty or missing data:
  - if the workflow lacks the logs, fixture, reporter detail, or reliable loop needed for diagnosis, it must say so explicitly and stop short of execution-ready claims

## Acceptance criteria
- [ ] A behavior-changing execution ticket with a practical public-interface test now defaults to test-first behavior in the local execution guidance.
- [ ] The execution workflow now requires an explicit completion-evidence bundle before a ticket can be represented as done.
- [ ] The diagnosis workflow now contains explicit root-cause-first guardrails plus concrete tracing and flaky-debugging techniques.
- [ ] The workflow now defines clear independent-review triggers for risky execution work without requiring reviewer passes for every trivial ticket.
- [ ] The updated behavior keeps the existing 7-phase structure, Pi-native prompts, and one-ticket-per-run execution model intact.

## Constraints
- Business constraints:
  - the workflow should become more reliable without becoming so heavy that maintainers stop using it consistently
- Legal or compliance constraints:
  - none identified for this repo-local workflow hardening slice
- Technical constraints that affect behavior:
  - changes should primarily land in existing local skills, prompts, docs, and guidance rather than in a new runtime system
  - `spawn` must remain a narrow context-offloading tool under current repo doctrine
  - the local execution model must stay one-ticket-per-run
- Timeline or rollout constraints:
  - keep this first slice narrow enough to plan and implement safely before considering broader planning or finish-helper changes

## Dependencies
- Relevant external services:
  - none required for the PRD itself
  - normal test tools or local validation commands may be used by downstream implementation work
- Upstream or downstream systems:
  - project-local skills and prompts
  - repo documentation that teaches operators how to use the workflow
  - downstream project repos that adopt this template
- Required research findings:
  - `docs/research.md` findings on selective Superpowers adoption
- Prototype decisions being promoted:
  - none; prototyping is unnecessary for this hardening slice

## Open questions
- Should risky-ticket review be encoded directly inside `execute-me`, or expressed partly through `qa-me` and repo-level guidance?
- How strict should the first version of review severity be: `blocking/important/minor` only, or an even lighter rule?
- Should the eventual finish/merge-readiness helper be a separate skill or a later mode of `qa-me`?

## Recommended next step
- Suggested next phase:
  - Phase 5 — implementation planning in `docs/issues.md`
- Why that is the right next step:
  - the reliability improvements are now concrete enough to slice into small AFK/HITL tickets across execution guidance, diagnosis guidance, QA guidance, and docs updates
- What should happen immediately after this PRD is accepted:
  - break this PRD into a small issue plan, with the first ticket focused on Phase 6 hardening and a second ticket focused on diagnosis hardening

## Source artifacts
- `docs/research.md`
- `AGENTS.md`
- `README.md`
- `GUIDE.md`

## Handoff to Issues
- [x] Main user flows are clear
- [x] Acceptance criteria are testable enough for planning
- [x] Scope boundaries are explicit
- [x] Dependencies and constraints that affect slicing are visible
- [x] Material ambiguities that could break ticket breakdown are explicitly listed

Ready for next phase: yes
Primary blocker: none
Notes:
- Keep this PRD intentionally narrow to Phase 6 and diagnosis hardening.
- Defer finish-helper, PRD-approval-gate, and planning-depth improvements unless the user explicitly widens scope.
- Preserve the repo’s Pi-native and lightweight workflow character while increasing reliability.
