# Issues

## Planning assumptions
- Source PRD: `docs/prd.md`
- Planning scope: first context-hardening pass for `idea -> prd` and `prd -> issues`
- Prototype winner: none; prototyping was explicitly unnecessary
- Key constraints:
  - keep changes minimal and markdown/prompt-driven
  - do not add new handoff-specific files
  - do not add CI, linting, or automated validators in this iteration
  - preserve a lightweight day-to-day workflow

## Dependency rules
- Each ticket should deliver a usable workflow outcome, not just a documentation layer change.
- Shared wording in `AGENTS.md` may be touched by more than one ticket; keep edits minimal and aligned to the relevant transition.
- End-to-end simulation must wait until both handoff transitions are implemented.
- If simulation uncovers a gap that still fits an earlier ticket, reopen that ticket instead of creating scope-creep follow-ups.

## Ticket conventions
- `Status`: `todo`, `in-progress`, `blocked`, `done`
- `Type`: `AFK`, `HITL`
- `Depends on`: `none` or explicit ticket IDs
- `Blocks`: explicit ticket IDs or blank when none
- `Parallelizable`: `yes`, `no`
- QA follow-up: reopen an existing ticket if the original scope still fits; otherwise add a new ticket

## Parallelization plan
Can start immediately:
- `ISSUE-001` — make `docs/idea.md` and idea-phase guidance express PRD handoff readiness
- `ISSUE-002` — make `docs/prd.md` and planning-phase guidance express Issues handoff readiness

Blocked until prerequisites complete:
- `ISSUE-003` — run the `idea -> prd -> issues` simulation after both handoff slices are done

Suggested lanes:
- Lane A: `ISSUE-001`
- Lane B: `ISSUE-002`
- Lane C: `ISSUE-003` after Lane A and Lane B complete

## Tickets

### ISSUE-001 — Add explicit handoff gate for `idea -> prd`
- Status: done
- Type: AFK
- Goal: make idea artifacts and idea-phase guidance state clearly whether work is ready to move into PRD writing.
- Why it exists: the current workflow can leave idea sessions looking complete without an explicit handoff decision, which increases context drift and premature PRD writing.
- Depends on: none
- Blocks: ISSUE-003
- Parallelizable: yes
- Source requirements:
  - PRD FR-1
  - PRD FR-3
  - PRD FR-4
  - PRD FR-5
- Scope:
  - update `docs/idea.md` with `## Handoff to PRD`
  - include the agreed 6 checklist items
  - include `Ready for next phase: yes/no`
  - include `Primary blocker` behavior when readiness is `no`
  - update `AGENTS.md` and `.pi/prompts/idea.md` so the phase closes with an updated handoff section and does not recommend PRD when not ready
- Acceptance criteria:
  - [x] `docs/idea.md` contains `## Handoff to PRD` with the agreed readiness checklist
  - [x] the handoff section includes `Ready for next phase: yes/no`
  - [x] the handoff section requires a specific `Primary blocker` when readiness is `no`
  - [x] idea-phase guidance does not allow a clean handoff to PRD without updating this section
- Notes / risks:
  - Keep the section short; if it becomes prose-heavy, the gate will be ignored.
  - Avoid rewriting the whole idea artifact structure when only the handoff gate is needed.
  - Validation: confirmed the new handoff section and idea-phase guardrails via targeted grep and `git diff --check`.

### ISSUE-002 — Add explicit handoff gate for `prd -> issues`
- Status: done
- Type: AFK
- Goal: make PRD artifacts and planning-phase guidance state clearly whether requirements are ready to be broken into execution tickets.
- Why it exists: planning quality depends on knowing when a PRD is truly slice-ready rather than merely complete-looking.
- Depends on: none
- Blocks: ISSUE-003
- Parallelizable: yes
- Source requirements:
  - PRD FR-2
  - PRD FR-3
  - PRD FR-4
  - PRD FR-5
- Scope:
  - update `docs/prd.md` with `## Handoff to Issues` where needed while preserving the current PRD content
  - update `.pi/skills/prd-me/assets/prd-template.md` to include the agreed handoff section
  - include the agreed 5 checklist items
  - include `Ready for next phase: yes/no`
  - include `Primary blocker` behavior when readiness is `no`
  - update `AGENTS.md`, `.pi/prompts/prd.md`, and `.pi/prompts/issues.md` so planning does not start when the PRD handoff is not ready
- Acceptance criteria:
  - [x] `docs/prd.md` contains `## Handoff to Issues` with the agreed readiness checklist
  - [x] the PRD template asset includes the same handoff structure for future runs
  - [x] the handoff section includes `Ready for next phase: yes/no`
  - [x] the handoff section requires a specific `Primary blocker` when readiness is `no`
  - [x] PRD/planning prompts do not allow a clean handoff to issues planning when readiness is `no`
- Notes / risks:
  - Preserve this repo's current PRD as the active artifact; do not replace it with a blank template.
  - Keep the checklist tied to planning readiness, not implementation details.
  - Validation: confirmed handoff guards in the active PRD, PRD template asset, and planning prompts via targeted grep and `git diff --check`.

### ISSUE-003 — Validate the hardened flow with `idea -> prd -> issues` simulation
- Status: done
- Type: AFK
- Goal: prove that the first hardening pass improves continuity across the selected transitions without adding unnecessary process weight.
- Why it exists: the PRD requires evidence that the new gates work in an end-to-end flow, not just as isolated document edits.
- Depends on: ISSUE-001, ISSUE-002
- Blocks:
- Parallelizable: no
- Source requirements:
  - PRD FR-6
  - PRD Acceptance Criteria 5
- Scope:
  - simulate the `idea -> prd -> issues` flow using the updated artifacts and prompts
  - verify the agreed rubric: no phase confusion, no loss of key decisions, no manual restating of prior context
  - capture concise validation evidence in the most relevant local artifact(s)
  - if the simulation fails, reopen the earlier ticket whose original scope still fits instead of expanding this ticket
- Acceptance criteria:
  - [x] the updated flow can be exercised from idea to PRD to issues planning without ambiguous phase advancement
  - [x] key decisions made in `docs/idea.md` remain available and usable in `docs/prd.md` and `docs/issues.md`
  - [x] the simulation does not require manually rewriting prior context to continue the workflow
  - [x] any failure discovered by the simulation is routed back to the correct existing ticket rather than hidden or patched ad hoc
- Notes / risks:
  - This ticket is validation-first; do not use it as a back door for broad extra hardening.
  - If the flow fails because of scope already covered by `ISSUE-001` or `ISSUE-002`, reopen that ticket.
  - Validation evidence: `docs/idea.md` exposes `## Handoff to PRD` with `Ready for next phase: yes`; `docs/prd.md` exposes `## Handoff to Issues` with `Ready for next phase: yes`; prompts for idea/PRD/issues now explicitly block progression when the relevant handoff is not ready.
  - Validation evidence: continuity markers remain visible across artifacts (`idea -> prd`, `prd -> issues`, `Source PRD`, `Source artifacts`, and the PRD handoff to planning), and `git diff --check` passed for the touched docs/prompts.
