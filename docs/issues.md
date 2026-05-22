# Issues

## Planning assumptions
- Source PRD: `docs/prd.md` for `feat/runs-once-harness-v1`
- Planning scope: v1 local harness untuk menjalankan tepat satu ticket `AFK` lewat `runs-once.sh` dengan branch-per-issue, worker session fresh, audit trail `.runs/`, dan sinkronisasi manual ke orchestrator branch
- Prototype winner: none; prototyping was not required before planning, hanya opsional untuk validasi detail operasional kecil
- Key constraints:
  - `docs/issues.md` tetap source of truth antar-run
  - v1 hanya mencakup `runs-once.sh`; `runs-afk.sh` ditunda
  - tidak ada `progress.txt` baru; state antar-run cukup dari artifact repo, session history, dan git history
  - harness tidak boleh menulis ulang substansi `execute-me` sebagai workflow paralel
  - `.runs/` hanya untuk snapshot bootstrap, result minimum, dan metadata status run
- Non-blocking open questions:
  - worker non-interaktif bisa memakai prompt template khusus repo atau prompt inline selama kontraknya tetap tipis dan setara
  - `.runs/` gitignore policy bisa diputuskan saat ticket dokumentasi/hygiene tanpa memblokir core harness
  - snapshot tambahan untuk `FAIL` bisa tetap ditolak pada v1 jika dua artifact per run terbukti cukup

## Dependency rules
- Runner selection/preflight contract harus jelas sebelum flow worker dan outcome run dianggap stabil.
- Worker harus menghormati explicit target issue sebelum artifact `.runs/` dan status contract dianggap final.
- Audit/result contract harus land dulu sebelum summary shell dan prosedur manual final didokumentasikan.
- Flow `DONE` dan `BLOCKED` harus mengikuti perilaku worker yang benar-benar diimplementasikan; dokumentasi tidak boleh mendahului behavior aktual.
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
- `ISSUE-001` — add deterministic runner preflight and target selection
- `ISSUE-002` — tighten worker execution contract around explicit issue targets

Blocked until prerequisites complete:
- `ISSUE-003` blocked on `ISSUE-001` and `ISSUE-002`
- `ISSUE-004` blocked on `ISSUE-001`, `ISSUE-002`, and `ISSUE-003`
- `ISSUE-005` blocked on `ISSUE-001`, `ISSUE-002`, and `ISSUE-003`
- `ISSUE-006` blocked on `ISSUE-004` and `ISSUE-005`

Suggested lanes:
- Lane A: `ISSUE-001` -> `ISSUE-003` -> `ISSUE-004`
- Lane B: `ISSUE-002` -> merge into `ISSUE-003`/`ISSUE-005`
- Lane C: `ISSUE-006` after core behavior is stable

## Tickets

### ISSUE-001 — Add deterministic runner preflight and issue selection for `runs-once.sh`
- Status: done
- Type: AFK
- Goal:
  - Let `runs-once.sh` safely start from orchestrator branch, detect whether work is available, and deterministically select the first eligible issue before any worker session begins.
- Why it exists:
  - The harness cannot stay trustworthy if target selection, branch creation, and `NO_READY` behavior remain implicit or manual.
- Depends on: none
- Blocks: ISSUE-003, ISSUE-004, ISSUE-005
- Parallelizable: yes
- Source requirements:
  - Functional requirements 1, 2, 3, 4, 5
  - Acceptance criteria 1, 2
- Scope:
  - Add `runs-once.sh` entry point skeleton
  - Implement preflight minimum checks for repo safety, `docs/issues.md`, branch safety, and required tooling
  - Select the first eligible issue using only the agreed mechanical rules
  - Return `NO_READY` when no eligible issue exists
  - Create deterministic branch `ralph/ISSUE-XXX` only after a target is selected
- Acceptance criteria:
  - [x] When no issue is eligible, `runs-once.sh` exits with a normal `NO_READY` outcome and does not create a new issue branch.
  - [x] When at least one issue is eligible, the runner selects the first eligible issue in file order and creates `ralph/ISSUE-XXX` from the orchestrator branch.
  - [x] If preflight detects a dangerous repo state or missing required input/tooling, the run does not start worker execution and returns an actionable failure.
- Notes / risks:
  - Added `runs-once.sh` plus `scripts/runs-once.mjs` with strict preflight, deterministic first-eligible selection, `NO_READY` handling, and deterministic branch creation.
  - Added `tests/runs-once.test.mjs` and validated `NO_READY`, first-eligible branch creation, dirty repo failure, and missing-tooling failure with `node --test tests/runs-once.test.mjs`.
  - Runner intentionally stays mechanical only; worker execution and `.runs/` artifacts are deferred to later tickets.

### ISSUE-002 — Tighten worker execution around an explicit target issue
- Status: done
- Type: AFK
- Goal:
  - Ensure the worker executes only the issue ID chosen by the runner and fails closed when that target is missing, mismatched, or not ready.
- Why it exists:
  - Without a single deterministic target contract, runner selection and worker execution can drift and silently work on different tickets.
- Depends on: none
- Blocks: ISSUE-003, ISSUE-004, ISSUE-005
- Parallelizable: yes
- Source requirements:
  - Functional requirements 6, 9, 10
  - Acceptance criteria 2, 3
- Scope:
  - Tighten the worker path so it accepts an explicit issue target
  - Preserve the normal human workflow behavior while adding deterministic harness behavior
  - Prevent fallback selection of another eligible issue
  - Map “target no longer ready” and material source-of-truth conflicts to the correct blocked behavior
- Acceptance criteria:
  - [x] Given an explicit issue target, worker execution only acts on that target and never silently picks a different ticket.
  - [x] If the target issue is missing, materially mismatched, or no longer ready after verification, the worker returns a blocked-style outcome instead of improvising.
  - [x] The worker still uses the existing repo execution workflow substantively rather than a second parallel execution model.
- Notes / risks:
  - `scripts/runs-once.mjs` now reuses `.pi/prompts/execute.md` as the worker prompt, injects the selected issue ID explicitly, and re-verifies the same target before dispatching Pi.
  - Added fail-closed target verification plus `BLOCKED` shell output when the selected issue is missing, materially changed, or no longer ready.
  - Expanded `tests/runs-once.test.mjs` to validate worker dispatch, explicit target prompt injection, and material conflict/no-longer-ready checks with `node --test tests/runs-once.test.mjs`.

### ISSUE-003 — Add worker bootstrap context and `.runs/` artifact contract
- Status: done
- Type: AFK
- Goal:
  - Give fresh worker sessions enough explicit context to avoid hallucination and produce a stable audit trail per run.
- Why it exists:
  - Fresh sessions without explicit bootstrap context will guess scope, and runs without durable artifacts are hard to debug afterward.
- Depends on: ISSUE-001, ISSUE-002
- Blocks: ISSUE-004, ISSUE-005
- Parallelizable: no
- Source requirements:
  - Functional requirements 7, 8, 13, 14, 15, 16, 17
  - Acceptance criteria 1, 5, 6, 7, 8
- Scope:
  - Inject issue excerpt and minimum required context into the worker bootstrap
  - Load `docs/issues.md`, `docs/prd.md`, and only load `docs/research.md` when relevant
  - Exclude `docs/idea.md` from worker context for v1
  - Create `.runs/` artifacts using a shared basename per run
  - Define and write `bootstrap.md` and `result.json`
- Acceptance criteria:
  - [x] Every run writes exactly two `.runs/` artifacts with the same basename: one `bootstrap.md` and one `result.json`.
  - [x] `bootstrap.md` contains the selected issue excerpt plus the explicit context bootstrap needed by the worker.
  - [x] `result.json` includes at least `status`, `status_reason`, `issue_id`, `branch`, `session`, and non-empty `next_action`.
  - [x] `docs/research.md` is loaded only when the selected issue or PRD clearly requires it.
  - [x] `docs/idea.md` is not part of worker bootstrap for v1.
- Notes / risks:
  - `scripts/runs-once.mjs` now writes exactly one `.bootstrap.md` and one `.result.json` per run with a shared timestamp+issue basename.
  - Worker dispatch now carries explicit bootstrap context, selected issue excerpt, deterministic Pi session path, and explicit exclusion of `docs/idea.md`.
  - `docs/research.md` is only required when the selected issue/bootstrap explicitly references research context.
  - Validated with `node --test tests/runs-once.test.mjs` covering `NO_READY`, worker bootstrap artifact content, prompt injection, fail artifacts, and conditional research loading.

### ISSUE-004 — Land the successful `DONE` flow for review and orchestrator merge
- Status: done
- Type: AFK
- Goal:
  - Make a successful run end in a committed issue branch with a clear, reviewable path back to the orchestrator branch.
- Why it exists:
  - A “successful” run that still needs the operator to invent the closing procedure is not operationally complete.
- Depends on: ISSUE-001, ISSUE-002, ISSUE-003
- Blocks: ISSUE-006
- Parallelizable: no
- Source requirements:
  - Functional requirements 11, 18
  - Acceptance criteria 2, 4
- Scope:
  - Ensure validation gates run before `DONE`
  - Ensure successful runs leave a commit in the issue branch
  - Keep the shell on the issue branch after the run
  - Render final shell summary and explicit `next_action` for human review and manual merge
- Acceptance criteria:
  - [x] A `DONE` run only occurs after the selected issue is executed and validated successfully.
  - [x] A `DONE` run leaves a commit on `ralph/ISSUE-XXX` and keeps the user on that branch for review.
  - [x] `result.json` and final shell output both give explicit next steps to switch back to the orchestrator branch and merge manually.
- Notes / risks:
  - `runs-once.sh` now refuses `DONE` when the worker exits cleanly but leaves the target issue not-`done` in `docs/issues.md`.
  - Successful runs now write explicit manual merge steps, create a reviewable commit on `ralph/ISSUE-XXX`, and keep the shell on the issue branch.
  - Validation evidence: `node --test tests/runs-once.test.mjs` covers success commit creation, manual merge instructions, and failure when the worker does not leave a done ticket.
  - Do not auto-merge in v1, even if the run succeeded cleanly.

### ISSUE-005 — Land the safe `BLOCKED` and `FAIL` flows
- Status: done
- Type: AFK
- Goal:
  - Make blocked and failed runs operationally safe, auditable, and explicit about what the human should do next.
- Why it exists:
  - Error paths are where trust in the harness will be won or lost.
- Depends on: ISSUE-001, ISSUE-002, ISSUE-003
- Blocks: ISSUE-006
- Parallelizable: no
- Source requirements:
  - Functional requirements 9, 12, 16, 18
  - Acceptance criteria 3, 8
- Scope:
  - Map “target no longer ready” and material source-of-truth conflicts to `BLOCKED`
  - Discard partial code for `BLOCKED` runs while preserving relevant status/notes updates
  - Produce explicit `FAIL` outcomes for infra/process failures
  - Ensure every non-success result still has a useful `status_reason` and `next_action`
- Acceptance criteria:
  - [x] When the target issue is no longer ready after verification, the run ends as `BLOCKED` rather than `NO_READY` or `FAIL`.
  - [x] `BLOCKED` runs do not preserve partial code as a success path and do not instruct users to merge the issue branch into orchestrator.
  - [x] `BLOCKED` and `FAIL` runs both produce `result.json` with non-empty `next_action` and a controlled `status_reason`.
- Notes / risks:
  - `scripts/runs-once.mjs` now cleans blocked-run code changes while preserving `docs/issues.md` plus `.runs/` artifacts.
  - `BLOCKED` next actions now direct manual copy-back of relevant `docs/issues.md` updates and explicitly forbid merging the issue branch.
  - `FAIL` results keep controlled `status_reason: run_failed` with non-empty `next_action`, including worker non-zero exit cases.
  - Validated with `node --test tests/runs-once.test.mjs`, including target-no-longer-ready `BLOCKED` flow and worker non-zero `FAIL` flow.

### ISSUE-006 — Document operator workflow and local repo hygiene for `runs-once.sh`
- Status: done
- Type: AFK
- Goal:
  - Document how operators should use `runs-once.sh`, audit `.runs/`, and perform the manual sync procedures for `DONE`, `BLOCKED`, `NO_READY`, and `FAIL`.
- Why it exists:
  - A local harness is incomplete if operators cannot tell how to use it safely or how to interpret its run artifacts.
- Depends on: ISSUE-004, ISSUE-005
- Blocks:
- Parallelizable: no
- Source requirements:
  - Functional requirements 18
  - Acceptance criteria 4, 5, 8, 9
  - Open questions on `.runs/` repo hygiene and worker prompt shape, as resolved by implementation
- Scope:
  - Document `runs-once.sh` usage and status outcomes
  - Document manual `DONE` merge flow and `BLOCKED` copy-back flow
  - Document `.runs/` purpose, naming convention, and retention expectations for v1
  - Resolve/document whether `.runs/` belongs in `.gitignore` for the intended local UX
- Acceptance criteria:
  - [x] Relevant docs explain how to run `runs-once.sh` and interpret its final status summary.
  - [x] Relevant docs explain the official manual sync procedure for `DONE` and `BLOCKED`.
  - [x] Relevant docs explain what `.runs/` contains and how it should be treated in local repo hygiene.
- Notes / risks:
  - Added `docs/runs-once.md` as the operator guide for command usage, status meanings, `.runs/` audit artifacts, and official manual sync procedures.
  - Updated `README.md` to point operators to the new harness guide.
  - Resolved repo hygiene by adding `.runs/` and `.runs-sessions/` to `.gitignore` as local operational artifacts.
  - Validated doc coverage against current harness behavior with `rg -n "runs-once|NO_READY|BLOCKED|DONE|FAIL|\\.runs|\\.runs-sessions|git merge --no-ff|copy-back|jangan merge" docs/runs-once.md README.md .gitignore scripts/runs-once.mjs`.

### ISSUE-007 — Dummy AFK smoke test for `runs-once.sh`
- Status: done
- Type: AFK
- Auto-run: yes
- Goal:
  - Provide one safe temporary AFK ticket so the local harness can be smoke-tested end-to-end with Pi CLI live.
- Why it exists:
  - The current board has no eligible AFK ticket, so `runs-once.sh` can only exercise the `NO_READY` path.
- Depends on: none
- Blocks:
- Parallelizable: no
- Source requirements:
  - Functional requirements 3, 5, 6, 11, 16
- Scope:
  - Let the worker execute exactly one harmless smoke-test task
  - Prefer a tiny documentation-only change
  - Produce a real `DONE`, `BLOCKED`, or `FAIL` outcome for manual QA observation
- Acceptance criteria:
  - [x] `runs-once.sh` can select this ticket as the first eligible AFK issue.
  - [x] The live run produces observable shell output and `.runs/` artifacts for manual review.
  - [x] After the smoke test, the team can either delete this temporary ticket or mark it done with explicit notes.
- Notes / risks:
  - Temporary QA-only ticket for live harness verification.
  - Prefer the smallest possible change, ideally limited to docs, so the smoke test stays low risk.
  - Live smoke run targeted `ISSUE-007` on branch `ralph/ISSUE-007` and observed bootstrap artifact `.runs/20260522T023539Z-ISSUE-007.bootstrap.md`.
  - Added a temporary smoke-test note to `docs/runs-once.md` so operators know to keep future harness probes docs-only and disposable.
  - Validation: `node --test tests/runs-once.test.mjs`.
