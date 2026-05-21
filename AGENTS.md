# AGENTS.md

## Scope
This repository follows a phased AI-assisted development workflow inspired by Matt Pocock's 7 phases. Agents working here should keep project artifacts under `docs/` and use them as the source of truth between sessions.

## Communication
- Communicate with the user in **Bahasa Indonesia**.
- Internal artifacts, markdown structure, and technical labels may remain in English unless the user asks otherwise.

## Repository workflow

### Optional helper — Local intake / triage
When the user brings a new bug report, feature request, refactor proposal, QA finding, or vague work item and the right next phase is not yet obvious:
- Use the project-local `triage-me` skill.
- Inspect local artifacts first to determine whether the item is already in scope.
- Classify the item and recommend exactly one local triage state such as `needs-info`, `needs-prd`, `needs-planning`, or `ready-for-execution`.
- For bugs, attempt lightweight reproduction before routing the item.
- Route the work to the smallest correct local artifact, usually `docs/idea.md`, `docs/research.md`, `docs/prd.md`, or `docs/issues.md`.
- For QA fallout, reopen an existing ticket when the original scope is still correct; add a new ticket only when the finding is truly new scope.

Prompt template:
- Use `/triage [laporan-atau-permintaan-yang-perlu-ditriage]` to trigger the local intake workflow via `.pi/prompts/triage.md`.

### Optional helper — Diagnosis
When a bug, regression, flaky failure, or QA finding is too ambiguous for direct execution:
- Use the project-local `diagnose-me` skill.
- Build a trustworthy feedback loop before theorizing or fixing.
- Reproduce the failure when possible, generate ranked hypotheses, and use focused probes.
- Route the outcome to the smallest useful artifact, usually `docs/issues.md` or `docs/qa.md`.
- Recommend a concrete handoff such as `ready-for-execution`, `needs-info`, `needs-research`, or `hitl`.

Prompt template:
- Use `/diagnose [bug-report-atau-finding-yang-perlu-didiagnosis]` to trigger the local diagnosis workflow via `.pi/prompts/diagnose.md`.

### Phase 1 — Idea
When the user wants to refine an idea before research, prototyping, or implementation:
- Use the project-local `grill-me` skill.
- Maintain `docs/idea.md` as the running artifact when requested, or when it is the obvious destination.
- Keep the artifact concise and decision-oriented.

Preferred `docs/idea.md` structure:
- `# Idea`
- `## Problem statement`
- `## Desired outcome`
- `## Scope`
- `## Non-goals`
- `## Constraints`
- `## Assumptions`
- `## Decision map`
- `## Questions asked`
- `## Decisions made`
- `## Open questions`
- `## Need research?`
- `## Need prototype?`
- `## Biggest risk`
- `## Recommended next step`

Prompt template:
- Use `/idea [fokus-atau-ide-awal]` to trigger the Phase 1 idea-refinement workflow via `.pi/prompts/idea.md`.

### Phase 2 — Research (optional)
Use a dedicated research workflow when the idea depends on external APIs, third-party services, hard-to-access documentation, or difficult exploration.

Goals:
- collect only the information needed for the current sprint or feature
- cache findings inside the repo so later agents do not need to rediscover them
- turn raw research into a reusable summary in `docs/research.md`

Rules:
- Prefer official docs first, then high-signal examples.
- Do not dump raw documentation into `docs/research.md`.
- Distinguish confirmed findings, assumptions, caveats, and open questions.
- Add a freshness note because research can go stale.
- Treat `docs/research.md` as sprint-scoped; refresh or discard it when outdated.

Preferred `docs/research.md` structure:
- `# Research`
- `## Objective`
- `## Questions to answer`
- `## Scope`
- `## Sources`
- `## Findings`
- `## Constraints and caveats`
- `## Recommended approach`
- `## Open questions`
- `## Freshness note`
- `## Next step`

If web retrieval is needed:
- Use the local `firecrawl-cli` skill.
- Save raw retrieval output under `.firecrawl/`.
- Summarize only the distilled conclusions into `docs/research.md`.

Prompt template:
- Use `/research [fokus-tambahan]` to trigger the Phase 2 research workflow via `.pi/prompts/research.md`.

### Phase 3 — Prototype (optional)
When the user wants exploratory variations before PRD writing or implementation:
- Use the project-local `prototype-me` skill.
- Keep prototype artifacts under `docs/prototype/`.
- Use prototypes to validate design, UX, flows, architecture, or integration behavior before writing the PRD.
- Prefer multiple options when exploring tradeoffs.
- Treat prototype output as exploratory until a winning direction is chosen.
- If prototyping is used, select exactly **one** prototype winner before moving to the PRD.
- A PRD may be based on **zero or one** prototype winner: zero if prototyping was unnecessary, one if prototyping was used.

Prompt template:
- Use `/prototype [target-atau-fokus-prototype]` to trigger the Phase 3 prototyping workflow via `.pi/prompts/prototype.md`.

### Phase 4 — PRD
When the user wants to define the destination clearly before planning or implementation:
- Use the project-local `prd-me` skill.
- Capture the intended end state in `docs/prd.md`.
- Focus on user-visible behavior and requirements, not implementation details.
- Use the skill asset `assets/prd-template.md` as the default PRD structure.
- Do not start the PRD while multiple prototype directions are still active; first choose one winner or explicitly decide that no prototype is needed.

Prompt template:
- Use `/prd [fokus-atau-klarifikasi-prd]` to trigger the Phase 4 PRD workflow via `.pi/prompts/prd.md`.

### Phase 5 — Implementation Planning (Kanban Board)
When the user wants to break a PRD into execution-ready tickets:
- Use the project-local `issues-me` skill.
- Capture the planning output in `docs/issues.md`.
- Break the PRD into vertical slices, not horizontal technical layers.
- Make blockers, dependencies, AFK/HITL status, and parallelization explicit.
- Use the skill asset `assets/issues-template.md` as the default structure.

`docs/issues.md` ticket conventions:
- `Status`: `todo`, `in-progress`, `blocked`, or `done`
- `Type`: `AFK` or `HITL`
- `Depends on`: `none` or explicit ticket IDs such as `ISSUE-003`
- `Blocks`: explicit ticket IDs or blank when none
- `Parallelizable`: `yes` or `no`
- QA follow-up should reopen an existing ticket when the original scope is still correct, or add a new ticket when the QA finding is truly new scope.

Prompt template:
- Use `/issues [fokus-atau-klarifikasi-planning]` to trigger the Phase 5 planning workflow via `.pi/prompts/issues.md`.

### Phase 6 — Execution
When the user wants to execute planned work Ralph-style:
- Use the project-local `execute-me` skill.
- Treat `docs/issues.md` as the task source for execution.
- Execute exactly one ready `AFK` ticket per run.
- Prefer test-first execution for behavior changes that are testable through a public interface.
- Use red-green-refactor only when it fits the ticket and does not significantly expand the ticket scope.
- Validate the change before marking the ticket done.
- Update `docs/issues.md` with `in-progress`, `done`, or `blocked` status as appropriate.
- Do not silently execute a second ticket in the same run.

Prompt template:
- Use `/execute [fokus-atau-klarifikasi-eksekusi]` to trigger the Phase 6 execution workflow via `.pi/prompts/execute.md`.

### Phase 7 — QA
When the user wants structured verification before release or the next execution loop:
- Use the project-local `qa-me` skill.
- Capture QA planning and findings in `docs/qa.md`.
- Turn the PRD and issue status into concrete test scenarios, edge cases, and a human review checklist.
- Distinguish automated checks from human review needs.
- Feed clear follow-up work back into the execution loop when needed.

Prompt template:
- Use `/qa [fokus-atau-klarifikasi-qa]` to trigger the Phase 7 QA workflow via `.pi/prompts/qa.md`.

## Workflow invariants
- Do not jump to implementation when the user is clearly in Phase 1, Phase 2, or Phase 3.
- Do not write a PRD from multiple competing prototype directions.
- If prototyping is used, exactly one prototype winner must feed the PRD.
- `docs/prd.md` is the requirements source of truth.
- `docs/issues.md` is the execution source of truth.
- Phase 6 follows a Ralph-style pattern: one run, one ready `AFK` ticket, one validation cycle.
- Do not overwrite useful existing docs without preserving important decisions already made.
- Keep artifacts concise, structured, and reusable across fresh context windows.
- When writing idea or research artifacts, record distilled outcomes rather than full transcripts.
- Be explicit about uncertainty, stale-information risk, and anything that still needs validation.

## Current repository artifact paths
- `docs/idea.md`
- `docs/research.md`
- `docs/prd.md`
- `docs/issues.md`
- `docs/qa.md`
- `docs/prototype/`
- `.firecrawl/`

## Current project prompt templates
- `.pi/prompts/triage.md`
- `.pi/prompts/diagnose.md`
- `.pi/prompts/idea.md`
- `.pi/prompts/research.md`
- `.pi/prompts/prototype.md`
- `.pi/prompts/prd.md`
- `.pi/prompts/issues.md`
- `.pi/prompts/execute.md`
- `.pi/prompts/qa.md`
