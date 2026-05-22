# Issues

## Planning assumptions
- Source PRD: `docs/prd.md` for `feat/runs-afk-harness-v1`
- Planning scope: bounded multi-iteration local harness `runs-afk.sh` di atas `runs-once.sh`, dengan auto-merge lokal hanya untuk iterasi `DONE`, hard-stop untuk `BLOCKED`/`FAIL`/merge conflict, summary agregat `.runs/`, dan stdout final human-readable
- Prototype winner: none; prototyping was not required before planning, hanya opsional nanti bila ingin mengecek UX summary agregat
- Historical base already landed:
  - `runs-once.sh` v1 sudah ada sebagai primitive resmi per iterasi
  - source of truth antar-iterasi tetap `docs/issues.md` pada branch orchestrator
- Key constraints:
  - `runs-afk.sh` harus tetap helper semi-otomatis, bukan workflow diagnosis/planning otomatis
  - setiap iterasi tetap berarti satu issue dan satu session fresh melalui `runs-once.sh`
  - wrapper tidak boleh menambah state permanen baru seperti `progress.txt`
  - stdout final cukup human-readable; surface machine-readable resmi tetap artifact JSON agregat
  - branch issue hasil `DONE` tidak dihapus otomatis pada v1
- Non-blocking open questions:
  - nama field exact pada JSON agregat bisa diputuskan saat eksekusi selama behavior PRD tetap dijaga
  - apakah dokumentasi operator terbaik berupa file baru `docs/runs-afk.md` atau perluasan doc harness yang sudah ada bisa diputuskan saat ticket dokumentasi

## Dependency rules
- Entry point dan validasi iterasi harus land dulu sebelum perilaku loop lain dianggap stabil.
- Flow sukses `DONE` + merge balik ke orchestrator harus jelas sebelum hard-stop policy untuk merge failure bisa diverifikasi penuh.
- Stop policy final harus jelas sebelum summary agregat dianggap trustworthy.
- Artifact agregat harus stabil sebelum stdout final dan dokumentasi operator difinalkan.
- Live smoke validation harus menunggu perilaku inti dan output operator-facing stabil.
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
- `ISSUE-001` — add `runs-afk.sh` entry point, iteration validation, and zero-work baseline flow

Blocked until prerequisites complete:
- `ISSUE-002` blocked on `ISSUE-001`
- `ISSUE-003` blocked on `ISSUE-002`
- `ISSUE-004` blocked on `ISSUE-002` and `ISSUE-003`
- `ISSUE-005` blocked on `ISSUE-004`
- `ISSUE-006` blocked on `ISSUE-005`

Suggested lanes:
- Lane A: `ISSUE-001` -> `ISSUE-002` -> `ISSUE-003`
- Lane B: `ISSUE-004` -> `ISSUE-005`
- Lane C: `ISSUE-006` after core behavior is stable

## Tickets

### ISSUE-001 — Add `runs-afk.sh` entry point, iteration validation, and `NO_READY` baseline
- Status: done
- Type: AFK
- Goal:
  - Let operators start a bounded batch run explicitly with `runs-afk.sh <iterations>` and get a clean, predictable outcome when there is no eligible work.
- Why it exists:
  - The wrapper is not trustworthy until its invocation contract, initial preflight, and empty-backlog behavior are explicit.
- Depends on: none
- Blocks: ISSUE-002, ISSUE-003, ISSUE-004, ISSUE-005, ISSUE-006
- Parallelizable: no
- Source requirements:
  - Functional requirements 1, 2, 3, 4, 7
  - Acceptance criteria 1, 2
- Scope:
  - Add `runs-afk.sh` entry point
  - Require an explicit positive integer iteration argument
  - Verify safe orchestrator starting state before the batch begins
  - Call `runs-once.sh` as the official primitive for the first iteration
  - Stop cleanly when the first iteration yields `NO_READY`
- Acceptance criteria:
  - [x] `runs-afk.sh` rejects missing or invalid iteration arguments with actionable feedback.
  - [x] When no issue is eligible, `runs-afk.sh <iterations>` stops normally without attempting extra iterations.
  - [x] The wrapper never exceeds the user-provided maximum iteration count.
- Notes / risks:
  - Added `runs-afk.sh` plus `scripts/runs-afk.mjs` as the bounded-loop entry point foundation on top of `runs-once.sh`.
  - Added `tests/runs-afk.test.mjs` covering invalid iteration arguments, `NO_READY` single-iteration stopping behavior, and safe failure when starting from an issue branch.
  - Validation: `node --test tests/runs-once.test.mjs tests/runs-afk.test.mjs`.
  - Keep this ticket focused on invocation and zero-work baseline; do not yet broaden it into merge orchestration or multi-status policy.

### ISSUE-002 — Continue across successful `DONE` iterations with bounded auto-merge
- Status: done
- Type: AFK
- Goal:
  - Make `runs-afk.sh` meaningfully better than `runs-once.sh` by automatically returning to the orchestrator branch, merging successful issue branches, and continuing while budget remains.
- Why it exists:
  - Without this flow, the wrapper is mostly cosmetic and does not remove the main multi-iteration operator friction.
- Depends on: ISSUE-001
- Blocks: ISSUE-003, ISSUE-004, ISSUE-005, ISSUE-006
- Parallelizable: no
- Source requirements:
  - Functional requirements 5, 6, 11, 12, 17, 18
  - Acceptance criteria 1, 3, 9
- Scope:
  - Detect `DONE` from each `runs-once.sh` iteration
  - Return to the orchestrator branch after `DONE`
  - Perform local `git merge --no-ff` from the issue branch
  - Continue to the next iteration only after merge succeeds and iteration budget remains
  - Preserve issue branches after success; no auto-delete in v1
- Acceptance criteria:
  - [x] After an iteration ends `DONE`, the wrapper checks out the orchestrator branch, merges the issue branch with `--no-ff`, and only then may continue.
  - [x] When multiple eligible issues exist and the iteration budget allows, the wrapper can complete more than one successful iteration in a single batch.
  - [x] If the iteration cap is reached after one or more successful iterations, the batch stops normally and reports the stop reason as iteration limit, not failure.
  - [x] Successful issue branches are not deleted automatically.
- Notes / risks:
  - `scripts/runs-afk.mjs` now reads the newest per-iteration `result.json`, detects `DONE`, checks out the orchestrator branch, merges the completed issue branch with `--no-ff`, and only then continues while iteration budget remains.
  - Added `tests/runs-afk.test.mjs` coverage for multi-`DONE` continuation, merge-back before the next iteration, iteration-cap stopping, and preservation of successful issue branches.
  - Validation: `node --test tests/runs-once.test.mjs tests/runs-afk.test.mjs`.
  - This is the key behavioral slice that changes the safety model; keep it narrow to `DONE` only.

### ISSUE-003 — Enforce hard-stop policy for `BLOCKED`, `FAIL`, and merge failure
- Status: done
- Type: AFK
- Goal:
  - Ensure the batch stops immediately and predictably whenever the loop leaves the safe happy path.
- Why it exists:
  - Trust in `runs-afk.sh` depends more on what it refuses to do after trouble than on how fast it loops during success.
- Depends on: ISSUE-002
- Blocks: ISSUE-004, ISSUE-005, ISSUE-006
- Parallelizable: no
- Source requirements:
  - Functional requirements 8, 9, 10
  - Acceptance criteria 4, 5, 6
- Scope:
  - Treat `BLOCKED` as immediate hard-stop
  - Treat `FAIL` as immediate hard-stop with non-zero outcome
  - Treat merge failure/conflict after `DONE` as immediate hard-stop
  - Prevent any automatic diagnosis, follow-up issue creation, or silent skip-to-next behavior
- Acceptance criteria:
  - [x] If an iteration returns `BLOCKED`, the batch stops immediately and does not start another issue.
  - [x] If an iteration returns `FAIL`, the batch stops immediately and surfaces an error outcome rather than a normal completion.
  - [x] If merge-back to the orchestrator branch fails or conflicts after `DONE`, the batch stops before attempting another iteration.
  - [x] No `BLOCKED` path auto-creates a new issue, edits source of truth outside the normal execution flow, or launches diagnosis automatically.
- Notes / risks:
  - `scripts/runs-afk.mjs` now treats only `DONE` as continuable; `NO_READY` and `BLOCKED` stop the batch immediately, while unexpected zero-exit statuses now fail closed.
  - Added `tests/runs-afk.test.mjs` coverage for `BLOCKED` hard-stop without merge-back, non-zero `FAIL` stop behavior, and merge-failure hard-stop before any later iteration can start.
  - Validation: `node --test tests/runs-once.test.mjs tests/runs-afk.test.mjs`.
  - Distinguish clearly between “normal stop” (`NO_READY`, iteration cap) and “operator intervention required” (`BLOCKED`, `FAIL`, merge failure).

### ISSUE-004 — Write per-loop aggregate JSON summary with per-iteration pointers
- Status: done
- Type: AFK
- Goal:
  - Give operators one machine-readable artifact that summarizes the whole batch and points back to each iteration’s detailed run artifacts.
- Why it exists:
  - Without an aggregate summary, operators still have to manually stitch together multiple per-run artifacts to understand what happened.
- Depends on: ISSUE-002, ISSUE-003
- Blocks: ISSUE-005, ISSUE-006
- Parallelizable: no
- Source requirements:
  - Functional requirements 13, 14, 15, 17
  - Acceptance criteria 2, 4, 6, 7
- Scope:
  - Write exactly one aggregate artifact per batch under `.runs/`
  - Record final loop status and stop reason
  - Record actual iteration count and orchestrator branch
  - Record each processed issue with its outcome
  - Record explicit pointers to each iteration’s `bootstrap` and `result` artifacts
- Acceptance criteria:
  - [x] Each batch writes one aggregate JSON artifact in `.runs/`.
  - [x] The aggregate artifact includes final loop status, stop reason, iteration count, orchestrator branch, processed issues with outcomes, and pointers to per-run artifacts.
  - [x] The aggregate artifact remains useful for all terminal states: `NO_READY`, iteration-cap completion, `BLOCKED`, `FAIL`, and merge failure.
- Notes / risks:
  - `scripts/runs-afk.mjs` now writes exactly one `.runs/*-afk-summary.json` per batch with loop status, stop reason, iteration count, orchestrator branch, and per-iteration pointers back to each `bootstrap` and `result` artifact.
  - Added `tests/runs-afk.test.mjs` coverage for aggregate summaries across `NO_READY`, multi-`DONE` iteration-cap completion, `BLOCKED`, `FAIL`, and merge-failure stop paths.
  - Validation: `node --test tests/runs-once.test.mjs tests/runs-afk.test.mjs`.
  - Keep the contract thin; the aggregate artifact is an index and summary, not a replacement for per-run detail.

### ISSUE-005 — Render final operator summary and document `runs-afk.sh` workflow
- Status: done
- Type: AFK
- Goal:
  - Make the bounded loop understandable to operators without requiring them to open JSON first.
- Why it exists:
  - A technically correct loop still fails operationally if humans cannot quickly read the outcome and know what to do next.
- Depends on: ISSUE-004
- Blocks: ISSUE-006
- Parallelizable: no
- Source requirements:
  - Functional requirements 16
  - Acceptance criteria 7, 8, 9
- Scope:
  - Print a final human-readable batch summary to stdout
  - Keep stdout consistent with the aggregate JSON
  - Document command usage, stop reasons, and operator expectations for `DONE`, `NO_READY`, `BLOCKED`, `FAIL`, and merge failure
  - Document that JSON aggregate is the official machine-readable surface
- Acceptance criteria:
  - [x] Final stdout summary shows the batch outcome in a way that a human can understand without opening the JSON artifact first.
  - [x] Stdout summary stays consistent with the aggregate JSON for the same run.
  - [x] Operator docs explain how `runs-afk.sh` behaves on success, normal stop, and hard-stop paths.
- Notes / risks:
  - `scripts/runs-afk.mjs` now prints a final human-readable batch summary with status, stop reason, iteration counts, orchestrator branch, processed issues, and aggregate artifact path.
  - Added `docs/runs-afk.md` as the operator guide for command usage, stop behavior, aggregate artifacts, and the boundary between human-readable stdout and machine-readable JSON.
  - Updated `README.md` to point operators to the new bounded-loop harness guide.
  - Validation: `node --test tests/runs-once.test.mjs tests/runs-afk.test.mjs`.
  - Do not accidentally turn stdout into a second stable scripting contract.

### ISSUE-006 — Run live bounded-loop smoke validation against safe AFK work
- Status: todo
- Type: HITL
- Goal:
  - Validate that the real local batch flow works end-to-end with actual AFK tickets and produces the operator experience described in the PRD.
- Why it exists:
  - Multi-iteration local orchestration has operational edges that automated tests alone may miss.
- Depends on: ISSUE-005
- Blocks:
- Parallelizable: no
- Source requirements:
  - Acceptance criteria 1, 2, 3, 4, 5, 6, 7, 8, 9
- Scope:
  - Prepare or reuse harmless AFK tickets for live validation
  - Run `runs-afk.sh` with a bounded iteration count
  - Observe at least one successful continuation path and one stop path if safely feasible
  - Capture any follow-up findings back into the board
- Acceptance criteria:
  - [ ] A human operator can run `runs-afk.sh <iterations>` end-to-end on the real repo and inspect the resulting aggregate summary plus per-run artifacts.
  - [ ] The live run confirms the wrapper stops for the right reason and leaves the repo in the expected branch state.
  - [ ] Any gaps found during smoke validation are routed back by reopening the relevant ticket or adding a genuinely new one.
- Notes / risks:
  - Keep validation low-risk; prefer harmless documentation-only or similarly safe AFK work when setting up live test tickets.

### ISSUE-007 — Temporary AFK smoke-test ticket for `runs-afk.sh`
- Status: done
- Type: AFK
- Auto-run: yes
- Goal:
  - Provide one harmless eligible AFK ticket so `runs-afk.sh` can be exercised end-to-end on the real repo.
- Why it exists:
  - `ISSUE-006` needs at least one safe AFK work item, and the current remaining board is otherwise dominated by HITL validation work.
- Depends on: ISSUE-005
- Blocks: ISSUE-006
- Parallelizable: no
- Source requirements:
  - Acceptance criteria 1, 2, 7, 8, 9
- Scope:
  - Keep the change tiny and documentation-only
  - Prefer touching `docs/runs-afk.md` rather than product code
  - Make the resulting run easy to review and easy to revert if desired
- Acceptance criteria:
  - [ ] `runs-afk.sh` can select this ticket as the first eligible AFK issue.
  - [ ] The live run produces observable stdout plus `.runs/*-afk-summary.json` and per-run artifacts for manual review.
  - [ ] After validation, the team can keep, revise, or remove this temporary smoke-test ticket explicitly.
- Notes / risks:
  - Temporary QA-only ticket for live bounded-loop verification.
  - Keep the change as small as possible, ideally limited to a short doc note in `docs/runs-afk.md`.
  - Done via a tiny reversible note in `docs/runs-afk.md`; bootstrap `.runs/20260522T041247Z-ISSUE-007.bootstrap.md` confirms this ticket was selected for the live smoke run.

### ISSUE-008 — Second temporary AFK smoke-test ticket for `runs-afk.sh`
- Status: done
- Type: AFK
- Auto-run: yes
- Goal:
  - Provide a second harmless eligible AFK ticket so `runs-afk.sh` continuation behavior can be observed across more than one successful iteration.
- Why it exists:
  - `ISSUE-006` ideally verifies not just one isolated run, but also the bounded multi-iteration path where the wrapper continues after a successful `DONE`.
- Depends on: ISSUE-005
- Blocks: ISSUE-006
- Parallelizable: no
- Source requirements:
  - Acceptance criteria 1, 2, 3, 7, 8, 9
- Scope:
  - Keep the change tiny and documentation-only
  - Prefer a different small note in `docs/runs-afk.md` or nearby docs so it is easy to distinguish from `ISSUE-007`
  - Make the resulting run easy to review and easy to revert if desired
- Acceptance criteria:
  - [ ] `runs-afk.sh` can continue from `ISSUE-007` to this ticket when iteration budget allows.
  - [ ] The live run shows a real multi-iteration path with aggregate summary output that lists at least two processed issues.
  - [ ] After validation, the team can keep, revise, or remove this temporary smoke-test ticket explicitly.
- Notes / risks:
  - Temporary QA-only ticket for validating continuation after a successful first iteration.
  - Keep the change as small as possible, ideally another short doc-only edit.
  - Done via a second tiny reversible note in `docs/runs-afk.md`, distinct from `ISSUE-007`, to keep multi-iteration smoke validation low-risk.
  - Validation: manual diff review of `docs/runs-afk.md` and `docs/issues.md`; no TDD because this ticket is documentation-only and does not change runtime behavior.
