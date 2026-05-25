# PRD

## Overview
Harden this repository’s Pi-native 7-phase workflow with a third reliability slice focused on **workflow assurance**, **wording-drift control**, and **bounded policy clarification** for the planning/closeout rules introduced in v2.

This PRD builds on reliability hardening v1 and v2. It does not reopen the already-landed execution, diagnosis, planning, or closeout behaviors except where the current guidance still needs one tighter definition or a lightweight assurance layer. The goal is not to add a heavy governance system. The goal is to make the current hardened workflow easier to trust, easier to keep in sync, and less likely to drift across skills, prompts, docs, and future template repos.

## Problem statement
Reliability hardening v1 and v2 improved the workflow materially, but the current repo still has a few trust gaps:
- validation is still mostly artifact-centric and review-driven rather than supported by a lightweight assurance layer for the newer planning and closeout behaviors
- the new rules now span many surfaces, so wording drift across skills, prompts, repo policy, and operator docs is a real maintenance risk
- three policy questions are still intentionally unresolved in v2:
  - when optional execution briefs should appear by default
  - whether `/finish` should inspect a lightweight repo-state checklist
  - how explicit PRD approval should be for very small projects
- the repo now has more guardrails, but some of them still rely on implied interpretation rather than one canonical lightweight recording format

As a result, the repo is still vulnerable to avoidable failures such as:
- two surfaces teaching slightly different planning or closeout rules
- optional execution briefs drifting into expected ceremony
- `/finish` slowly growing beyond a lightweight recommendation helper
- future maintainers trusting wording that looks aligned while the actual rules have drifted
- hardening changes being declared “ready” mainly through manual review rather than one narrower reusable assurance path

## Desired outcome
After this hardening slice is complete:
- the planning gate introduced in v2 has one canonical lightweight approval format that is easy to recognize and validate
- the optional execution-brief rule is explicit enough that planners know when to use it and when not to
- `/finish` has a bounded definition of what repo-state signals it may inspect without drifting into release-management ceremony
- the current hardened planning/closeout rules have a lightweight assurance layer beyond ad hoc reviewer memory
- the workflow remains Pi-native, artifact-driven, and lightweight rather than turning into a broad compliance or orchestration framework

## Users and actors
- Primary users:
  - maintainers using this repo as a Pi workflow template
  - operators who run `/prd`, `/issues`, `/qa`, and `/finish` in downstream repos
- Secondary users:
  - future agents working from fresh context windows that need clearer, more stable guidance
  - reviewers who need one compact way to assess whether the hardened workflow is still internally consistent
- Internal actors or systems involved:
  - project-local skills under `.pi/skills/`
  - project-local prompts under `.pi/prompts/`
  - repo-local artifacts such as `docs/prd.md`, `docs/issues.md`, and `docs/qa.md`
  - lightweight validation or audit surfaces already used by this repo
  - `spawn` only where selective review/context offloading already fits current repo doctrine

## Scope
- In scope:
  - define one canonical lightweight recording format for PRD review/approval in `## Handoff to Issues`
  - define a bounded rule for when optional execution briefs should be added to non-trivial tickets
  - define a bounded rule for what repo-state checks `/finish` may inspect when they materially affect closeout judgment
  - add a lightweight assurance layer for the current planning/closeout hardening so maintainers do not rely only on ad hoc manual wording review
  - align the affected skills, prompts, docs, and validation guidance with the clarified rules
- Included workflows:
  - `/prd` when preparing handoff into `/issues`
  - `/issues` when creating or reviewing execution-ready planning artifacts
  - `/finish` when recommending the next closeout action after execution and/or QA
  - lightweight repo validation or audit behavior for the currently hardened workflow surfaces
- Included surfaces or entry points:
  - `AGENTS.md`
  - `.pi/skills/prd-me/SKILL.md`
  - `.pi/prompts/prd.md`
  - `.pi/skills/issues-me/SKILL.md`
  - `.pi/prompts/issues.md`
  - `.pi/skills/issues-me/assets/issues-template.md`
  - `.pi/skills/finish-me/SKILL.md`
  - `.pi/prompts/finish.md`
  - `README.md`
  - `GUIDE.md`
  - existing validation guidance or validator surfaces if needed

## Non-goals
- Explicitly out of scope for this phase:
  - replacing the 7-phase workflow with the full Superpowers stack
  - adding a full live end-to-end workflow simulation harness for every prompt
  - introducing mandatory worktrees, branch choreography, or release automation
  - introducing blanket reviewer requirements for all small repos or trivial tickets
  - converting `/finish` into a merge engine, branch manager, or release checklist system
  - broadening `spawn` into a general orchestration runtime
- Nice-to-have but deferred:
  - richer severity taxonomies for review or closeout decisions
  - broader execution/diagnosis hardening beyond v1
  - a larger workflow policy engine covering every phase
- Related problems not solved here:
  - provider/model reliability unrelated to local workflow guidance
  - every possible wording-drift risk across the entire repo
  - full CI enforcement of all workflow behavior beyond the narrow hardened slice

## User experience and behavior
This work is operator-facing and maintainer-facing rather than end-user-facing.

Expected behavior:
- when a PRD is ready for planning, the handoff includes one explicit, recognizable lightweight approval signal rather than a vague implication
- when a ticket is non-trivial, planners can tell whether an optional execution brief should be added based on a bounded rule rather than taste alone
- when `/finish` inspects repo state, it does so only for a small bounded set of signals that materially affect the recommendation
- maintainers have one lightweight way to check whether the current hardening rules are still aligned across core workflow surfaces
- the workflow still feels concise and Pi-native, not like a compliance framework

Entry points:
- `/prd`
- `/issues`
- `/finish`
- lightweight validator or audit entry points already used in the repo

Main flow:
1. Operator writes or refines a PRD.
2. Before `/issues`, the PRD handoff records one explicit lightweight approval signal in a standard form.
3. Operator runs `/issues` and uses optional execution briefs only when the ticket crosses the named threshold.
4. After execution and/or QA, operator runs `/finish`, which may inspect a bounded set of repo-state signals if they materially affect closeout judgment.
5. Maintainer or reviewer uses the lightweight assurance path to verify that the hardened planning/closeout rules remain aligned.

Empty states:
- if the PRD handoff does not carry the required approval signal, planning must stop and say so clearly
- if a ticket is simple enough not to need an execution brief, the workflow should say nothing more and remain lightweight
- if repo-state signals are irrelevant to the closeout decision, `/finish` should not force them into the review

Loading states:
- no new runtime UI is required
- the behavior should stay inside existing prompt/skill flows and lightweight validation surfaces

Error states:
- if the approval signal is missing or malformed, `/issues` should not pretend the PRD is review-ready
- if execution-brief usage is ambiguous, the workflow should push toward the lighter default unless the ticket clearly crosses the threshold
- if `/finish` lacks the evidence or repo-state signals needed for a stronger recommendation, it should downgrade the recommendation explicitly

Success states:
- the planning gate is easier to recognize and validate
- execution briefs stay helpful rather than ceremonial
- `/finish` stays bounded and predictable
- maintainers have more confidence that the hardened rules remain aligned across surfaces

Permissions or visibility rules:
- this slice does not add new runtime permissions or product capabilities
- it changes repo-local workflow behavior, artifact expectations, and lightweight validation posture only

## Functional requirements
1. The workflow must define one explicit lightweight recording format in `## Handoff to Issues` that signals the PRD has been reviewed for correctness and scope before planning proceeds.
2. The planning workflow must define a bounded rule for when an optional execution brief should be added to a non-trivial ticket and when it should be omitted.
3. The `/finish` workflow must define a bounded set of repo-state signals it may inspect when they materially affect closeout judgment, and it must not imply broader branch-management or release-management duties.
4. The repository must provide a lightweight assurance path for the currently hardened planning/closeout rules so maintainers can verify alignment without relying only on ad hoc reviewer memory.
5. The clarified planning and closeout rules must remain aligned across the affected skills, prompts, repo policy, and operator docs.
6. This hardening slice must preserve the existing 7-phase structure, narrow `spawn` doctrine, and one-ticket-per-run execution model.

## Edge cases
- Invalid input:
  - a ticket may look non-trivial at first glance but still be simple enough that adding an execution brief would be pure ceremony
- Partial failure:
  - the approval format may exist while another planning blocker still makes `/issues` unsafe; the workflow must not confuse one satisfied check with full readiness
- External dependency failure:
  - closeout recommendations may still depend on unavailable environments, external review, or missing QA evidence; `/finish` must keep those limits explicit
- Timeouts / retries:
  - this slice does not add new runtime retry behavior; it only affects workflow policy and lightweight validation
- Permissions / access issues:
  - if the operator cannot inspect the repo-state signals relevant to `/finish`, the helper must downgrade confidence rather than imply certainty
- Duplicate or repeated actions:
  - repeated validation or audit runs should remain safe and should improve confidence rather than add scope creep
- Empty or missing data:
  - if the PRD handoff, planning artifact, or closeout evidence is incomplete, the workflow must say what is missing rather than inferring approval or readiness

## Acceptance criteria
- [ ] The repo now has one explicit, lightweight PRD approval signal format in `## Handoff to Issues` that is taught and enforced consistently.
- [ ] The optional execution-brief rule is explicit enough that non-trivial tickets can use it without making trivial tickets heavier.
- [ ] `/finish` now has a bounded repo-state-check posture that stays recommendation-oriented and lightweight.
- [ ] A lightweight assurance path now exists for the hardened planning/closeout slice beyond ad hoc manual review alone.
- [ ] The clarified rules remain Pi-native and aligned across skills, prompts, docs, and repo policy.

## Constraints
- Business constraints:
  - the workflow should become easier to trust without becoming expensive or annoying enough that maintainers stop using it consistently
- Legal or compliance constraints:
  - none identified for this repo-local hardening slice
- Technical constraints that affect behavior:
  - changes should primarily land in local skills, prompts, docs, and narrow validation surfaces rather than new runtime systems
  - `spawn` must remain a narrow context-offloading tool under existing doctrine
  - one-ticket-per-run execution must remain intact as the default execution model
- Timeline or rollout constraints:
  - keep this slice focused on assurance and clarification for the planning/closeout hardening rather than reopening broader workflow redesign

## Dependencies
- Relevant external services:
  - none required for the PRD itself
- Upstream or downstream systems:
  - project-local skills and prompts
  - repo-local `docs/` artifacts
  - any existing validator or audit surfaces already used in this template
  - downstream project repos that adopt this template
- Required research findings:
  - `docs/research.md` findings on PRD approval, self-review checklists, optional execution briefs, and lightweight closeout guidance
- Prototype decisions being promoted:
  - none; prototyping is unnecessary for this hardening slice

## Open questions
- Should the lightweight assurance path be expressed mainly as a validator extension, a smoke-test checklist, or a small combination of both?
- Should `/finish` inspect dirty-working-tree status by default when relevant, or only when the user explicitly asks for a stronger closeout judgment?

## Recommended next step
- Suggested next phase:
  - Phase 5 — implementation planning in `docs/issues.md`
- Why that is the right next step:
  - the remaining v3 hardening work is now concrete enough to slice into a small assurance/clarification plan without reopening the broader workflow
- What should happen immediately after this PRD is accepted:
  - break this PRD into a small set of AFK/HITL tickets starting with rule clarification, then lightweight assurance, then final validation and HITL judgment

## Source artifacts
- `docs/research.md`
- `docs/prd.reliability-hardening-v2.md`
- `docs/issues.md`
- `CHANGELOG.md`

## Handoff to Issues
- [x] Main user flows are clear
- [x] Acceptance criteria are testable enough for planning
- [x] Scope boundaries are explicit
- [x] Dependencies and constraints that affect slicing are visible
- [x] Material ambiguities that could break ticket breakdown are explicitly listed

Planning approval: approved for issues planning (correctness and scope)
Ready for next phase: yes
Primary blocker: none
Notes:
- Keep this PRD narrowly focused on workflow assurance and bounded policy clarification.
- Preserve the repo’s lightweight and Pi-native character.
- Do not reopen v1 or v2 behavior broadly unless the clarification is necessary to keep the hardened slice coherent.
