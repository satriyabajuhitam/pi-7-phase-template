# PRD

## Overview
Harden the 7-phase workflow template so context handoff between phases is more explicit, reusable, and resistant to session loss. This iteration focuses on minimal changes to artifacts and prompts for the two most critical transitions: `idea -> prd` and `prd -> issues`.

## Problem statement
The current template already separates artifacts by phase, but it still relies too heavily on manual discipline to decide when a phase is truly ready to hand off. That creates risk of premature progression, context drift between sessions, and artifacts that look complete but do not clearly state whether the next phase can start safely.

## Desired outcome
After this work is complete, the template should make handoff readiness explicit. Users and agents should be able to see, from the source artifact itself, whether the next phase is ready, why it is blocked when it is not ready, and what should happen next without re-deriving prior context.

## Users and actors
- Primary users: repository maintainers and operators using this 7-phase template
- Secondary users: future collaborators or teams adopting the template across multiple sessions
- Internal actors or systems involved: local prompts, skills, and markdown artifacts under `docs/`

## Scope
- In scope:
  - Explicit handoff sections in `docs/idea.md` and `docs/prd.md`
  - Checkbox-based readiness criteria for `idea -> prd` and `prd -> issues`
  - Explicit `Ready for next phase: yes/no` decision in each handoff section
  - Explicit blocker capture, including one `Primary blocker`, when a handoff is not ready
  - Prompt behavior that prevents advancing phases when handoff readiness is not satisfied
- Included workflows:
  - Refining an idea and deciding whether it is ready to become a PRD
  - Writing/refining a PRD and deciding whether it is ready to be broken into issues
- Included surfaces or entry points:
  - `docs/idea.md`
  - `docs/prd.md`
  - `.pi/prompts/idea.md`
  - `.pi/prompts/prd.md`
  - `.pi/prompts/issues.md`
  - workflow guidance in `AGENTS.md`

## Non-goals
- Explicitly out of scope for this phase:
  - CI, linting, or automated validators
  - New files dedicated only to handoff tracking
  - Hardening execution, QA, or later-phase handoffs
- Nice-to-have but deferred:
  - Additional handoff rules for `issues -> execute` and `execute -> qa`
  - Automated enforcement of checklist completion
  - Release/versioning policy refinements after merge
- Related problems not solved here:
  - General template ergonomics beyond the two selected transitions
  - Broader collaboration workflow choices such as worktrees vs clone strategy

## User experience and behavior
When an idea session concludes, the user should be able to open `docs/idea.md` and immediately see whether the work is ready to move into PRD writing. The artifact should expose a short checklist, an explicit yes/no readiness decision, and a specific primary blocker if the answer is no.

When a PRD session concludes, the user should be able to open `docs/prd.md` and immediately see whether the requirements are ready to be broken into planning tickets. The artifact should again expose a short checklist, a final readiness decision, and a primary blocker when the next phase should not begin.

Prompts for the relevant phases should behave consistently with these artifacts:
- they should update the handoff section before closing the phase
- they should not recommend the next phase when readiness is still no
- they should route the user back to the correct unresolved blocker instead of allowing ambiguous progression

Empty or partial artifacts should result in a blocked handoff rather than optimistic advancement.

## Functional requirements
1. The template must support an explicit `Handoff to PRD` section in `docs/idea.md` containing checklist-based readiness criteria for the `idea -> prd` transition.
2. The template must support an explicit `Handoff to Issues` section in `docs/prd.md` containing checklist-based readiness criteria for the `prd -> issues` transition.
3. Each handoff section must include `Ready for next phase: yes/no` and must require a specific `Primary blocker` whenever readiness is `no`.
4. Phase prompts for idea, PRD, and issues planning must prevent recommending or starting the next phase when the relevant handoff section is not ready.
5. The first hardening iteration must preserve the current lightweight workflow by using minimal artifact and prompt changes instead of new files or automation.
6. The resulting workflow must support a small end-to-end simulation of `idea -> prd -> issues` without requiring prior context to be restated manually at each step.

## Edge cases
- Invalid input:
  - A handoff section exists but the checklist is incomplete while readiness is marked `yes`
- Partial failure:
  - Some checklist items are satisfied, but one blocker still prevents safe phase advancement
- External dependency failure:
  - Not applicable for the first iteration because no external services are introduced
- Timeouts / retries:
  - Reopening and updating a handoff section should be allowed without creating a separate tracking artifact
- Permissions / access issues:
  - Not in scope beyond normal repo write access needed to update markdown artifacts
- Duplicate or repeated actions:
  - A phase may be revisited and its handoff section updated multiple times before becoming ready
- Empty or missing data:
  - Missing or empty source sections should be treated as not ready rather than assumed complete

## Acceptance criteria
- [ ] `docs/idea.md` includes a `Handoff to PRD` section with the agreed readiness checklist, `Ready for next phase: yes/no`, and `Primary blocker` handling.
- [ ] `docs/prd.md` includes a `Handoff to Issues` section with the agreed readiness checklist, `Ready for next phase: yes/no`, and `Primary blocker` handling.
- [ ] The idea prompt updates or requires the PRD handoff section before closing and does not recommend PRD when readiness is `no`.
- [ ] The PRD and issues prompts respect the PRD handoff section and do not proceed to planning when readiness is `no`.
- [ ] A simulated `idea -> prd -> issues` flow can be completed without phase confusion, without losing key decisions, and without manually rewriting prior context.

## Constraints
- Business constraints:
  - The workflow should stay lightweight enough for day-to-day use
- Legal or compliance constraints:
  - None identified
- Technical constraints that affect behavior:
  - The template is markdown- and prompt-driven
  - Existing artifacts and prompts should be changed minimally
  - No new automation layer should be required in this iteration
- Timeline or rollout constraints:
  - This should land as a first hardening pass before broader workflow expansion

## Dependencies
- Relevant external services:
  - None
- Upstream or downstream systems:
  - Existing prompt and skill flow in the repository
- Required research findings:
  - None; research was explicitly judged unnecessary
- Prototype decisions being promoted:
  - No prototype was needed for this work

## Open questions
- Should a later iteration add similar handoff hardening for execution and QA transitions?
- After this hardening lands, should the repo publish a new release/tag to mark the updated template behavior?
- Is a separate clone/worktree strategy worth formalizing, or is it operational guidance outside this PRD?

## Recommended next step
- Suggested next phase: Phase 5 planning via `issues-me`
- Why that is the right next step: the desired end state, scope, non-goals, behavior, and acceptance criteria are now concrete enough to break into a small number of implementation tickets
- What should happen immediately after this PRD is accepted: create `docs/issues.md` with minimal vertical slices covering artifact changes, prompt guardrails, and simulation/validation

## Source artifacts
- `docs/idea.md`
- `docs/research.md`
- `docs/prototype/comparison.md`

## Handoff to Issues
- [x] Main user flows are clear
- [x] Acceptance criteria are testable enough for planning
- [x] Scope boundaries are explicit
- [x] Dependencies and constraints that affect slicing are visible
- [x] Material ambiguities that could break ticket breakdown are explicitly listed

Ready for next phase: yes
Primary blocker: none
Notes:
- Open questions remain, but they are not blockers for planning this first hardening iteration.
- If `Ready for next phase: no`, replace `none` with the single most important blocker.
