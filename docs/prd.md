# PRD

## Overview
Add an experimental `pi-spawn`-based delegation workflow to this `7-phase` repository so Pi users can offload focused analysis to isolated sub-agents while still relying on upstream `pi-spawn` as the spawn engine. The end state is a branch-ready, project-local setup where `spawn` is available, phase-aware usage conventions are defined, thin local guardrails can control delegation safely, and the workflow can be used for artifact-driven research, planning-readiness checks, and future execution preparation.

## Problem statement
This repository wants more advanced context handling, but the heavier options are not the best first experiment here. The repo needs a low-risk way to test whether isolated sub-agent delegation improves the `7-phase` workflow before committing to a larger context-management system or custom automation.

Right now:
- the repo has proven interest in `pi-spawn`
- raw package installation alone is not enough for repeatable use in `7-phase`
- without clear conventions, sub-agent usage can become inconsistent, too verbose, or drift across phases
- planning and execution handoffs can become noisy if artifact-driven delegation is not explicitly structured

## Desired outcome
After this work is complete:
- Pi sessions in this repo can use upstream `pi-spawn` as a project-local capability
- users have a clear `7-phase` convention set for when and how to use `spawn`
- the workflow supports artifact-grounded, evidence-first sub-agent summaries instead of ad-hoc delegation
- the repo can reliably evaluate whether upstream `pi-spawn` plus thin local guardrails is good enough for continued use without building a custom spawn engine

## Users and actors
- Primary users:
  - repository maintainers experimenting with context-management improvements
  - Pi users working inside this `7-phase` template
- Secondary users:
  - future agents resuming work from repo artifacts under `docs/`
  - contributors evaluating whether to standardize `pi-spawn` in this template
- Internal actors or systems involved:
  - Pi Coding Agent
  - upstream `pi-spawn` package
  - repo-local `docs/` artifacts used as source-of-truth inputs

## Scope
- In scope:
  - project-local availability of upstream `pi-spawn`
  - documented `7-phase` spawn conventions
  - thin local guardrails for safe spawn enable/disable and delegation gating
  - support for single, parallel, and serial delegation patterns
  - artifact-grounded sub-agent usage against repo `docs/`
  - real-flow validation for at least research-style and planning-readiness use cases
- Included workflows:
  - Phase 2 research synthesis
  - Phase 4 PRD review and readiness checks
  - Phase 5 planning-readiness and blocker detection
  - future Phase 6 execution-prep usage once upstream artifacts are present
- Included surfaces or entry points:
  - Pi sessions in this repository after `/reload`
  - project-local Pi package configuration
  - local extension / skill guardrails under `.pi/`
  - repo-local documentation under `docs/prototype/` and later stable docs/prompts if promoted

## Non-goals
- Explicitly out of scope for this phase:
  - building a custom spawn engine or replacing upstream `pi-spawn`
  - replacing `7-phase` with a multi-agent architecture
  - solving session continuity or indexed retrieval at the depth of `context-mode`
  - introducing persistent specialist agent catalogs
- Nice-to-have but deferred:
  - dedicated prompt templates or commands for each phase
  - automated handoff writing into `docs/prd.md`, `docs/issues.md`, or `docs/qa.md`
  - stronger enforcement around output shape and line-level evidence
- Related problems not solved here:
  - long-session compaction continuity
  - retrieval-backed memory
  - choosing the long-term winner between delegation-only and deeper context-management approaches

## User experience and behavior
Users working in this repo should be able to enter a Pi session, reload resources, and have access to the `spawn` tool through the project-local package setup.

When users delegate a focused task:
- they should anchor the task on repo artifacts under `docs/`
- they should specify the current phase, scope, and output contract
- the sub-agent should return a synthesis-oriented response rather than a raw dump
- the result should be usable as a handoff or decision aid for the current phase

Expected behavior by workflow:
- **Research flow:** sub-agent summarizes confirmed findings, open questions, and recommended next step from repo artifacts
- **Planning-readiness flow:** sub-agent identifies whether planning can proceed and surfaces the smallest blocking artifact gap if not
- **Execution-prep flow:** once the repo has real planning artifacts, sub-agent prepares concise context for exactly one ready ticket

Empty and blocked states should be explicit. If required artifacts are empty or missing, the workflow should say so clearly and route the user to the smallest correct artifact step instead of pretending the next phase is ready.

Success state:
- the user receives an evidence-first, phase-appropriate summary that is grounded in repo artifacts and safe to use as a handoff input

Error state:
- if `spawn` is unavailable because the session has not reloaded or the package is not active, the user should be able to recover by reloading the session or fixing the local package setup
- if local policy mode is off, the repo should block delegation clearly instead of failing silently

## Functional requirements
1. The repository must expose upstream `pi-spawn` as a project-local Pi capability so the `spawn` tool is available in repo sessions after reload.
2. The repository must define `7-phase` usage conventions for `spawn`, including phase labeling, artifact grounding, scope boundaries, evidence-first output, and delegation mode selection.
3. The repository must support three delegation patterns in practice: single, parallel, and serial.
4. Spawn-driven workflows must operate against repo artifacts under `docs/` and prefer synthesis over raw output.
5. When a workflow is blocked by empty or missing prerequisite artifacts, the workflow must surface that blocker explicitly and recommend the smallest correct next artifact step.
6. The experimental branch must include at least one validated research-oriented flow and one validated planning-readiness flow using real repo artifacts.
7. The documented conventions must make clear that this experiment is delegation-focused and does not claim to solve session continuity or retrieval-backed memory.
8. Thin local guardrails may control whether delegation is allowed, but they must fail softly to a parent-only workflow when the upstream backend is unavailable.

## Edge cases
- Invalid input:
  - prompts that omit phase, scope, or source artifacts may produce inconsistent output and should be treated as non-standard use
- Partial failure:
  - the sub-agent may return useful synthesis but weaker-than-desired evidence formatting, such as section-only citations instead of line numbers
- External dependency failure:
  - if the upstream package is not installed, not loaded, or not reloaded into the session, `spawn` is unavailable
- Timeouts / retries:
  - long or overly broad prompts may increase token usage and reduce output sharpness
- Permissions / access issues:
  - sub-agents only know what is provided through file paths and allowed tools; they have no inherited parent context
- Duplicate or repeated actions:
  - parallel spawn should only be used for independent tasks; dependent tasks must remain serial
- Empty or missing data:
  - empty `docs/prd.md` or `docs/issues.md` must produce an explicit blocker diagnosis rather than a fake readiness verdict

## Acceptance criteria
- [ ] In this repository, `spawn` is available through the project-local Pi setup after `/reload`.
- [ ] Repo documentation defines a stable `7-phase` convention set for how to use `spawn` across phases and delegation modes.
- [ ] A real research-oriented flow has been validated against repo artifacts and produces an evidence-first summary.
- [ ] A real planning-readiness flow has been validated against repo artifacts and correctly detects blockers when prerequisite artifacts are empty.
- [ ] The documented workflow clearly distinguishes this experiment from heavier context-management approaches and does not overclaim session continuity capabilities.
- [ ] Local delegation guardrails fail softly when upstream `pi-spawn` is unavailable.

## Constraints
- Business constraints:
  - this is an experiment branch, so the scope should stay small, reversible, and evidence-driven
- Legal or compliance constraints:
  - none identified for the current experiment scope
- Technical constraints that affect behavior:
  - use upstream `pi-spawn` as the spawn engine; thin local guardrails are allowed, but not a replacement engine
  - `pi-spawn` improves delegation hygiene but does not provide retrieval or compaction continuity
  - sub-agents require self-contained prompts grounded in repo files
  - exact literal outputs may still drift unless prompts are strict
- Timeline or rollout constraints:
  - this work should be ready for issue breakdown only after the PRD clearly defines the experimental destination

## Dependencies
- Relevant external services:
  - none beyond normal Pi model/provider access already used by the repo
- Upstream or downstream systems:
  - upstream `pi-spawn` package
  - Pi package loading and session reload behavior
- Required research findings:
  - `pi-spawn` is the preferred lightweight experimentation path for this repo
  - heavier options like `context-mode` remain out of scope for this branch PRD
- Prototype decisions being promoted:
  - Prototype 2 is the only winning direction
  - stable parts of `docs/prototype/spawn-conventions.md`
  - validated runtime support for single, parallel, and serial delegation
  - validated real flows for research and planning-readiness assessment

## Open questions
- How many additional real flows should pass before this branch is considered stable enough for broader team use?
- Which parts of the spawn conventions should later graduate into prompt templates or automation?
- Once `docs/prd.md` and `docs/issues.md` contain real planning content, will the same conventions remain concise and handoff-safe?

## Recommended next step
- Suggested next phase:
  - Phase 5 — issue breakdown, after this PRD is accepted
- Why that is the right next step:
  - the experimental direction is now singular, scoped, and behaviorally defined enough for slicing into small execution tickets
- What should happen immediately after this PRD is accepted:
  - create `docs/issues.md` tickets for package/setup work, documentation stabilization, and follow-up validation flows against real planning/execution artifacts

## Source artifacts
- `docs/idea.md`
- `docs/research.md`
- `docs/prototype/comparison.md`
- `docs/prototype/spawn-conventions.md`
- `docs/prototype/validation.md`
- `docs/prototype/real-flow-1-phase-2.md`
- `docs/prototype/real-flow-2-phase-5.md`

## Handoff to Issues
- [x] Main user flows are clear
- [x] Acceptance criteria are testable enough for planning
- [x] Scope boundaries are explicit
- [x] Dependencies and constraints that affect slicing are visible
- [x] Material ambiguities that could break ticket breakdown are explicitly listed

Ready for next phase: yes
Primary blocker: none
Notes:
- Plan against the experimental branch scope, not a full long-term context-management platform.
- Keep issue slicing focused on validating and stabilizing upstream `pi-spawn` usage plus thin local guardrails in this repository.
