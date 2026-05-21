# Issues

## Planning assumptions
- Source PRD: `docs/prd.md` for `feat/readiness-gate-validator`
- Planning scope: minor release untuk parity handoff `idea -> PRD` dan `PRD -> issues`, validator readiness gate, CI enforcement, dan docs terkait
- Prototype winner: none; prototyping was not needed
- Key constraints:
  - template harus tetap clean saat `docs/` artifacts kosong
  - validator fokus ke `docs/idea.md` dan `docs/prd.md`
  - local behavior advisory, CI behavior blocking
  - jangan menilai kualitas semantik artifact
- Non-blocking open questions:
  - extensibility ke fase berikutnya boleh tetap internal/modular dulu
  - release hygiene bisa diselesaikan pada ticket dokumentasi tanpa memblokir eksekusi inti

## Dependency rules
- Contract surfaces untuk handoff harus jelas sebelum validator dan CI dianggap final.
- Validator lokal harus land dulu sebelum integrasi CI blocking.
- Dokumentasi final harus mengikuti perilaku validator dan surface yang benar-benar diimplementasikan.
- QA follow-up nanti sebaiknya reopen ticket yang relevan jika scope aslinya masih cocok.

## Ticket conventions
- `Status`: `todo`, `in-progress`, `blocked`, `done`
- `Type`: `AFK`, `HITL`
- `Depends on`: `none` or explicit ticket IDs
- `Blocks`: explicit ticket IDs or blank when none
- `Parallelizable`: `yes`, `no`
- QA follow-up: reopen an existing ticket if the original scope still fits; otherwise add a new ticket

## Parallelization plan
Can start immediately:
- `ISSUE-001` — align `idea -> PRD` handoff surfaces
- `ISSUE-002` — align `PRD -> issues` handoff surfaces

Blocked until prerequisites complete:
- `ISSUE-003` blocked on `ISSUE-001` and `ISSUE-002`
- `ISSUE-004` blocked on `ISSUE-003`
- `ISSUE-005` blocked on `ISSUE-001`, `ISSUE-002`, `ISSUE-003`, and `ISSUE-004`

Suggested lanes:
- Lane A: `ISSUE-001` -> `ISSUE-003` -> `ISSUE-004`
- Lane B: `ISSUE-002` -> merge into validator/doc flow
- Lane C: `ISSUE-005` after implementation behavior is stable

## Tickets

### ISSUE-001 — Align `idea -> PRD` handoff contract across Phase 1 surfaces
- Status: done
- Type: AFK
- Goal:
  - Make the `idea -> PRD` handoff contract consistent across the relevant skill, prompt, and repo guidance surfaces.
- Why it exists:
  - `v1-context-hardening` introduced stronger handoff rules, but enforcement is still partial and can diverge across surfaces.
- Depends on: none
- Blocks: ISSUE-003, ISSUE-005
- Parallelizable: yes
- Source requirements:
  - FR-1
  - AC-8
- Scope:
  - Update Phase 1 surfaces so they consistently mention `## Handoff to PRD`
  - Ensure readiness semantics and `Primary blocker` expectations are aligned
  - Close obvious parity gaps between prompt instructions, skill behavior, and repo guidance
- Acceptance criteria:
  - [x] Relevant Phase 1 surfaces consistently require `## Handoff to PRD` before recommending PRD handoff
  - [x] Relevant Phase 1 surfaces consistently require `Ready for next phase: yes/no`
  - [x] Relevant Phase 1 surfaces consistently require `Primary blocker` when readiness is `no`
  - [x] No Phase 1 surface still gives contradictory guidance for the covered handoff
- Notes / risks:
  - Updated `grill-me` skill + README and `GUIDE.md` so Phase 1 guidance now matches the hardened prompt and AGENTS contract

### ISSUE-002 — Align `PRD -> issues` handoff contract across Phase 4 and 5 surfaces
- Status: done
- Type: AFK
- Goal:
  - Make the `PRD -> issues` handoff contract consistent across PRD, issues planning, and related guidance surfaces.
- Why it exists:
  - The repo already added part of this hardening, but planning can still drift if the relevant skill and guidance do not enforce the same contract.
- Depends on: none
- Blocks: ISSUE-003, ISSUE-005
- Parallelizable: yes
- Source requirements:
  - FR-1
  - AC-8
- Scope:
  - Update Phase 4 and 5 surfaces so they consistently mention `## Handoff to Issues`
  - Ensure readiness semantics and `Primary blocker` expectations are aligned
  - Close parity gaps between PRD prompt/template behavior and issues planning behavior
- Acceptance criteria:
  - [x] Relevant Phase 4 and 5 surfaces consistently require `## Handoff to Issues` before recommending or starting planning
  - [x] Relevant Phase 4 and 5 surfaces consistently require `Ready for next phase: yes/no`
  - [x] Relevant Phase 4 and 5 surfaces consistently require `Primary blocker` when readiness is `no`
  - [x] No covered Phase 4 or 5 surface still gives contradictory guidance for the covered handoff
- Notes / risks:
  - Updated `prd-me` and `issues-me` skill + README surfaces and `GUIDE.md` so PRD handoff readiness is now enforced consistently before planning

### ISSUE-003 — Add local readiness validator for active idea and PRD artifacts
- Status: done
- Type: AFK
- Goal:
  - Provide a local validator that checks readiness-gate structure and minimum logic for active `docs/idea.md` and `docs/prd.md`.
- Why it exists:
  - Text-only guidance is easy to bypass; local validation gives fast feedback before CI.
- Depends on: ISSUE-001, ISSUE-002
- Blocks: ISSUE-004, ISSUE-005
- Parallelizable: no
- Source requirements:
  - FR-2
  - FR-3
  - FR-4
  - FR-5
  - FR-6
  - FR-7
  - FR-9
  - AC-1
  - AC-2
  - AC-3
  - AC-4
  - AC-5
  - AC-7
- Scope:
  - Add a repo-local validation command or script
  - Validate only active/non-empty `docs/idea.md` and `docs/prd.md`
  - Check required section, readiness field, blocker field, and minimum readiness logic
  - Return clear advisory output for local use
- Acceptance criteria:
  - [x] Active `docs/idea.md` fails with specific output if `## Handoff to PRD` is missing
  - [x] Active `docs/prd.md` fails with specific output if `## Handoff to Issues` is missing
  - [x] Active artifacts fail if `Ready for next phase` or `Primary blocker` is missing
  - [x] Active artifacts fail if readiness is `no` and blocker is empty or `none`
  - [x] Active artifacts fail if readiness is `yes` and the relevant handoff checklist still has unchecked items
  - [x] Empty template-state `docs/idea.md` and `docs/prd.md` do not fail validation
  - [x] Local output is clearly advisory and actionable
- Notes / risks:
  - Added `scripts/validate-readiness-gates.mjs`; validated current repo state plus targeted temp-file cases for missing section, missing field, placeholder blocker, unchecked checklist, and empty template-state artifacts

### ISSUE-004 — Enforce readiness validator in CI as a blocking check
- Status: done
- Type: AFK
- Goal:
  - Run the readiness validator in CI so invalid handoff state blocks merge/release flow.
- Why it exists:
  - Local advisory feedback is helpful, but the repo still needs a hard gate before changes land.
- Depends on: ISSUE-003
- Blocks: ISSUE-005
- Parallelizable: no
- Source requirements:
  - FR-8
  - AC-6
- Scope:
  - Add CI execution for the readiness validator
  - Ensure failures are visible and actionable in CI logs
  - Preserve the distinction between local advisory behavior and CI blocking behavior
- Acceptance criteria:
  - [x] CI runs the readiness validator automatically
  - [x] CI fails when the validator finds a covered readiness-gate violation
  - [x] CI logs make it clear which artifact and rule failed
  - [x] CI does not silently pass when validator execution itself fails
- Notes / risks:
  - Added `.github/workflows/readiness-gates.yml` and CI mode for the validator; verified local advisory mode, CI blocking mode, and CI-mode failure exit/status with a targeted temp-file case

### ISSUE-005 — Document validator usage, scope boundaries, and release hygiene updates
- Status: done
- Type: AFK
- Goal:
  - Update repo documentation so contributors understand the new validator behavior, scope, and limits.
- Why it exists:
  - Hardening is incomplete if users cannot tell when validation applies or how to respond to failures.
- Depends on: ISSUE-001
- Blocks:
- Parallelizable: yes
- Source requirements:
  - FR-10
  - AC-8
  - AC-9
- Scope:
  - Document local advisory usage and CI blocking behavior
  - Explain clean template handling for empty artifacts
  - Explain minor release scope boundaries and what is deferred
  - Add any minimum release hygiene notes chosen for this release
- Acceptance criteria:
  - [x] Relevant docs explain what the validator checks for `docs/idea.md` and `docs/prd.md`
  - [x] Relevant docs explain local advisory versus CI blocking behavior
  - [x] Relevant docs explain why empty template-state artifacts do not fail validation
  - [x] Relevant docs do not promise downstream hardening that is out of scope for this minor release
- Notes / risks:
  - Updated `README.md`, `GUIDE.md`, and `MASTER_TEMPLATE.md` to document validator behavior, CI blocking versus local advisory mode, empty template-state handling, and the intentionally limited scope of this minor release
