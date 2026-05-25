# PRD

## Overview
Harden this repository’s Pi-native 7-phase workflow with a second reliability slice focused on **planning/handoff quality** and **end-of-loop closeout**.

This PRD builds on reliability hardening v1. It does not revisit the already-landed Phase 6 execution and diagnosis guardrails except where wording must stay consistent. Instead, it targets the next weakest parts of the workflow:
- starting planning from PRDs that may be technically ready but not explicitly reviewed enough
- forcing oversized requests into one PRD or one issue board
- creating issue plans without a strong self-review and coverage check
- finishing implementation/QA loops without a lightweight, explicit closeout helper

## Problem statement
Reliability hardening v1 improved execution, diagnosis, and QA evidence posture. However, the workflow still has important reliability gaps before planning starts and after implementation work is functionally complete:
- there is still no explicit lightweight PRD review/approval gate before `/issues`
- oversized requests can still flow into one PRD or one issue board without an explicit decomposition check
- PRD and issue planning quality still depends too much on author discipline because ambiguity, contradiction, and coverage checks are not explicit enough
- non-trivial tickets still do not have a standardized optional execution-brief shape
- the repo still lacks a lightweight closeout helper for deciding what should happen after execution and QA without adopting a heavy branch-management framework

As a result, the repo is still vulnerable to avoidable failures such as:
- planning from a PRD that is structurally ready but not truly review-ready
- oversized scopes entering Phase 5 and producing weak or muddy issue slicing
- issue plans that technically exist but are missing crisp execution guidance for harder tickets
- implementation work finishing without an explicit, evidence-aware closeout step

## Desired outcome
After this hardening slice is complete:
- planning starts only after a lightweight but explicit PRD review/approval gate has been satisfied
- oversized requests are decomposed earlier instead of being forced into one broad PRD or issue board
- PRD and issue planning flows use explicit self-review checks for ambiguity, contradictions, and coverage gaps
- non-trivial tickets can carry an optional execution brief that improves reliability without forcing giant plan documents
- the repo has a lightweight `finish` helper that summarizes validation state, residual risk, and structured next actions after execution/QA
- the workflow remains Pi-native, artifact-driven, and lightweight rather than turning into a full orchestration or release-management system

## Users and actors
- Primary users:
  - maintainers using this repo as a Pi workflow template
  - operators creating PRDs, plans, and closeout decisions in repos derived from this template
- Secondary users:
  - future agents that need clearer planning and closeout artifacts in fresh context windows
  - reviewers who need a clearer handoff between PRD approval, issue planning, and final workflow closure
- Internal actors or systems involved:
  - project-local skills under `.pi/skills/`
  - project-local prompts under `.pi/prompts/`
  - repo-local artifacts such as `docs/prd.md`, `docs/issues.md`, and `docs/qa.md`
  - `spawn` only where selective review/context offloading already fits current repo doctrine

## Scope
- In scope:
  - add a lightweight PRD review/approval gate before `/issues`
  - add an explicit decomposition check for oversized requests in idea/PRD/planning flows
  - add explicit self-review checks to PRD and issue-planning workflows
  - add an optional execution-brief convention for non-trivial tickets in `docs/issues.md`
  - add a lightweight `finish-me` helper and `/finish` prompt for end-of-loop closeout decisions
  - align repo-level docs and guidance with the new planning and closeout posture
- Included workflows:
  - `/idea` and `/prd` when a request may be too broad and needs decomposition
  - `/prd` before handoff into `/issues`
  - `/issues` when turning a reviewed PRD into execution-ready tickets
  - `/finish` after execution and/or QA when the next operational action must be decided explicitly
- Included surfaces or entry points:
  - `AGENTS.md`
  - `.pi/skills/grill-me/SKILL.md`
  - `.pi/skills/prd-me/SKILL.md`
  - `.pi/skills/issues-me/SKILL.md`
  - `.pi/prompts/prd.md`
  - `.pi/prompts/issues.md`
  - new `.pi/skills/finish-me/SKILL.md`
  - new `.pi/prompts/finish.md`
  - `README.md`
  - `GUIDE.md`

## Non-goals
- Explicitly out of scope for this phase:
  - replacing the 7-phase workflow with the full Superpowers stack
  - introducing mandatory worktree management or branch orchestration
  - introducing subagent-per-task execution
  - rewriting issue planning into full `writing-plans` style giant step-by-step documents
  - converting `finish` into a full release-management or git-automation system
  - expanding `spawn` into a broader runtime/orchestration platform
- Nice-to-have but deferred:
  - richer review severity taxonomies beyond a lightweight first version
  - live workflow simulation harnesses for `/prd`, `/issues`, and `/finish`
  - deeper release-management automation
- Related problems not solved here:
  - broader provider/model reliability questions
  - all future execution/diagnosis improvements beyond v1
  - all potential release governance beyond lightweight closeout guidance

## User experience and behavior
This work is operator-facing and maintainer-facing rather than end-user-facing.

Expected behavior:
- if a request is too broad for one coherent PRD or one issue board, the workflow should stop and decompose it rather than forcing a weak artifact
- before `/issues`, the workflow should require one explicit pass that the written PRD is reviewed enough for planning
- PRD and issue planning should include lightweight self-checks for ambiguity, contradiction, and missing coverage
- non-trivial issue tickets should be able to include a short execution brief without turning every ticket into a giant plan
- after execution and/or QA, the workflow should offer a lightweight closeout helper that makes next actions explicit rather than implied
- operators should still experience the workflow as concise and Pi-native, not as a heavy lifecycle-management framework

Entry points:
- `/idea`
- `/prd`
- `/issues`
- `/finish`

Main flow:
1. Operator refines an idea or request.
2. If the request is too broad, the workflow decomposes it before deeper PRD or issue planning continues.
3. Operator writes or refines `docs/prd.md`.
4. Before `/issues`, the workflow performs an explicit PRD review/approval gate.
5. Operator breaks the PRD into tickets; non-trivial tickets may include optional execution briefs.
6. After execution and/or QA, operator runs `/finish` to review validation state, residual risk, and the best next action.

Empty states:
- if the PRD is technically present but not yet reviewed enough, `/issues` must stop and say what is missing
- if a ticket is trivial, the workflow should not force an execution brief just for ceremony
- if closeout evidence is still weak, `/finish` should say so explicitly rather than implying readiness

Loading states:
- no new runtime or UI loading state is required
- the new behavior should stay inside existing prompt/skill flows plus one lightweight new `finish` helper

Error states:
- if decomposition is needed but skipped, planning should stop rather than bluff
- if PRD review/approval is missing, `/issues` should not proceed
- if closeout evidence is incomplete, `/finish` should not imply merge/release readiness

Success states:
- a reviewed PRD hands off to planning with clearer confidence
- issue plans have better coverage and fewer ambiguous slices
- non-trivial tickets can carry optional execution context without heavy planning overhead
- closeout decisions become explicit and evidence-aware

Permissions or visibility rules:
- this slice does not add new runtime permissions or product capabilities
- it changes repo-local workflow behavior, prompt/skill guidance, and artifact expectations only

## Functional requirements
1. The workflow must include an explicit lightweight PRD review/approval gate before `/issues` proceeds from `docs/prd.md`.
2. The idea, PRD, and issue-planning workflows must stop and decompose requests that are too broad for one coherent PRD or issue board.
3. The PRD workflow must include explicit self-review checks for ambiguity, contradiction, and materially missing edge cases before handoff.
4. The issue-planning workflow must include explicit self-review checks for ticket granularity, coverage against the PRD, and avoidable slice ambiguity.
5. The issue-planning workflow must support an optional execution-brief convention for non-trivial tickets without making it mandatory for every trivial ticket.
6. The repository must provide a lightweight `finish` helper that summarizes current validation state, residual risk, and structured next actions after execution and/or QA.
7. The `finish` helper must stay lightweight and evidence-aware; it must not require worktree orchestration, automatic git actions, or a full release-management framework.
8. This hardening slice must preserve the existing 7-phase structure, Pi-native prompts, repo-local artifacts, and narrow `spawn` doctrine.

## Edge cases
- Invalid input:
  - a request may look broad but actually be a small single-flow change; decomposition should not be forced mechanically when one coherent artifact is still reasonable
- Partial failure:
  - a PRD may be mostly ready but still have one blocker that prevents responsible planning; the workflow should stop clearly rather than degrade silently
- External dependency failure:
  - closeout decisions may still depend on external systems or human approvals; `/finish` must surface that dependency instead of implying certainty
- Timeouts / retries:
  - this slice does not add new retry/runtime behavior; it only affects planning and closeout workflow decisions
- Permissions / access issues:
  - if an operator cannot validate the relevant branch/repo state, `/finish` must route to HITL or “not ready” style guidance instead of pretending confidence
- Duplicate or repeated actions:
  - repeated review, planning, or finish passes should remain safe and should improve clarity rather than broaden scope
- Empty or missing data:
  - if the PRD, issues, or QA evidence is incomplete, the workflow must say what is missing rather than manufacturing readiness

## Acceptance criteria
- [ ] The repo now has a lightweight PRD review/approval gate before `/issues` planning proceeds.
- [ ] Oversized requests are explicitly decomposed earlier in idea/PRD/planning flows rather than being forced into one weak artifact.
- [ ] PRD and issue-planning self-review checks now exist and are clearly reflected in local skill/prompt guidance.
- [ ] Non-trivial tickets can now carry an optional execution brief without making all tickets heavy.
- [ ] A lightweight `finish` helper now exists and stays consistent with the repo’s Pi-native, artifact-driven, lightweight model.

## Constraints
- Business constraints:
  - the workflow should become more reliable without crossing the line into heavy process that maintainers avoid using
- Legal or compliance constraints:
  - none identified for this repo-local hardening slice
- Technical constraints that affect behavior:
  - changes should primarily land in local skills, prompts, and docs rather than in new runtime systems
  - `spawn` must remain a narrow context-offloading tool under existing doctrine
  - one-ticket-per-run execution should remain intact as the execution default
- Timeline or rollout constraints:
  - keep this slice focused on planning/handoff and closeout hardening rather than reopening v1 execution/diagnosis scope

## Dependencies
- Relevant external services:
  - none required for the PRD itself
- Upstream or downstream systems:
  - project-local skills and prompts
  - repo-local `docs/` artifacts
  - downstream project repos that adopt this template
- Required research findings:
  - `docs/research.md` findings on PRD approval, decomposition checks, self-review checklists, optional execution briefs, and a finish helper
- Prototype decisions being promoted:
  - none; prototyping is unnecessary for this hardening slice

## Open questions
- Should the optional execution brief live inline inside each ticket by default, or be used only when a ticket crosses a complexity threshold that the planner names explicitly?
- Should `/finish` present only recommendation options, or also include a lightweight repo-state checklist such as dirty working tree / pending docs / missing QA evidence?
- How explicit should PRD approval be for very small projects: one short review acknowledgment, or a stricter checklist gate only?

## Recommended next step
- Suggested next phase:
  - Phase 5 — implementation planning in `docs/issues.md`
- Why that is the right next step:
  - the remaining reliability improvements are now concrete enough to slice into planning/handoff tickets and one lightweight finish-helper ticket
- What should happen immediately after this PRD is accepted:
  - break this PRD into a small set of AFK/HITL tickets, starting with PRD/planning hardening and then the `finish` helper

## Source artifacts
- `docs/research.md`
- `docs/prd.reliability-hardening-v1.md`
- `docs/issues.md`

## Handoff to Issues
- [x] Main user flows are clear
- [x] Acceptance criteria are testable enough for planning
- [x] Scope boundaries are explicit
- [x] Dependencies and constraints that affect slicing are visible
- [x] Material ambiguities that could break ticket breakdown are explicitly listed
- [x] PRD reviewed for correctness and scope before planning

Ready for next phase: yes
Primary blocker: none
Notes:
- Keep this PRD focused on planning/handoff and closeout hardening.
- Preserve the repo’s lightweight and Pi-native character.
- Do not reopen v1 execution/diagnosis scope except for wording consistency where needed.
