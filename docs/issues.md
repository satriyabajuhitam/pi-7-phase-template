# Issues

## Planning assumptions
- Source PRD: `docs/prd.md`
- Planning scope: narrow `spawn` timeout follow-up only, on top of the already-approved replacement `spawn` UX and the completed preset follow-up
- Prior completed cycles preserved as context:
  - `ISSUE-001` through `ISSUE-006` delivered the repo-local replacement `spawn`, inline status cards, active widget, validation flow, HITL verdict, and perf follow-up
  - `ISSUE-007` through `ISSUE-013` delivered the `preset` follow-up and the branch-level HITL verdict that preset support is ready for continued use on `exp/pi-spawn`
- Prototype winner: none; a separate prototype phase was judged unnecessary for this narrow follow-up
- Key constraints:
  - keep `spawn` as a minimal focused delegation primitive
  - add only one lightweight public API addition in this phase: `timeout`
  - `timeout` must be explicit, per-call, and expressed in milliseconds
  - calls that omit `timeout` must remain compatible and unbounded in this phase
  - timeout breaches must fail clearly rather than returning degraded-success
  - timeout visibility should reuse existing error/result surfaces rather than introducing a new persistent UI mode
  - preserve the current readability and perceived-performance gains from the replacement `spawn` work
  - do not drift into retries, queueing, bounded parallelism, or orchestration behavior

## Dependency rules
- The shared `timeout` parameter contract must land before downstream timeout behavior, UI, and validation slices can be trusted.
- The runtime timeout behavior slice must establish per-call bounded execution and hard-fail semantics before UI-specific timeout surfacing is validated.
- Timeout UI clarity depends on timeout failures being exposed distinctly enough in the result path to render as normal explicit errors.
- Validation should happen only after the timeout contract, runtime behavior, and timeout UI slices are complete.
- Human review is required for the final judgment that timeout support is useful, clear, and still within the repo's minimal `spawn` boundary.
- No ticket in this plan should introduce global default timeout policy, retries, queueing, bounded parallelism, or orchestration behavior.

## Ticket conventions
- `Status`: `todo`, `in-progress`, `blocked`, `done`
- `Type`: `AFK`, `HITL`
- `Depends on`: `none` or explicit ticket IDs
- `Blocks`: explicit ticket IDs or blank when none
- `Parallelizable`: `yes`, `no`
- QA follow-up: reopen an existing ticket if the original scope still fits; otherwise add a new ticket

## Parallelization plan
Can start immediately:
- `ISSUE-014` — add the shared `timeout` contract to `spawn`

Blocked until prerequisites complete:
- `ISSUE-015` waits on `ISSUE-014`
- `ISSUE-016` waits on `ISSUE-015`
- `ISSUE-017` waits on `ISSUE-014`, `ISSUE-015`, and `ISSUE-016`
- `ISSUE-018` waits on `ISSUE-017`

Suggested lanes:
- Lane A: timeout contract + bounded runtime behavior
- Lane B: timeout error visibility + validation
- Lane C: HITL verdict

## Tickets

### ISSUE-014 — Add the shared `timeout` contract to `spawn`
- Status: done
- Type: AFK
- Goal: make `spawn` accept one explicit optional `timeout` parameter with the agreed v2 boundary and preserve compatibility for calls that omit it.
- Why it exists: every later timeout slice depends on one stable contract for units, optionality, invalid-input behavior, and the rule that omitted `timeout` does not introduce a new default bound.
- Depends on: none
- Blocks: ISSUE-015, ISSUE-017
- Parallelizable: no
- Source requirements:
  - PRD Functional requirements 1, 2, 3, 9, 11
  - PRD Scope
  - PRD Non-goals
  - PRD Constraints
- Scope:
  - add one optional `timeout` parameter to `spawn`
  - define the public timeout input in milliseconds
  - keep `prompt` required when `timeout` is present
  - preserve the compatible unbounded path for calls that omit `timeout`
  - fail clearly on invalid timeout inputs rather than silently ignoring or coercing them
- Acceptance criteria:
  - [x] `spawn` accepts calls with no `timeout` and behaves compatibly with the current replacement flow
  - [x] `spawn` accepts explicit timeout input in milliseconds
  - [x] invalid timeout inputs fail clearly
  - [x] no hidden default timeout is introduced for calls that omit `timeout`
- Notes / risks:
  - implemented in `.pi/extensions/spawn/index.ts:705-715` by adding `timeout` as an optional tool parameter using `Type.Number({ exclusiveMinimum: 0, ... })` with contract text that explicitly says the value is in milliseconds and that omitting it introduces no default timeout
  - the execute path still does not assign any `params.timeout ?? ...` default and `runOne(...)` still has no timeout argument in this ticket, so the contract remains compatible and intentionally stops short of runtime enforcement; that behavior slice is reserved for `ISSUE-015`
  - invalid input now fails through the existing Pi tool-schema validation path instead of being silently ignored or coerced because the new parameter is schema-checked at the tool boundary
  - validation for this contract slice used source inspection plus two context-offloaded `spawn` review passes (`scout` for insertion-point mapping and `reviewer` for boundary verification), which kept exploratory detail out of the parent while still returning evidence-backed summaries
  - keep this ticket narrow; do not sneak runtime timeout enforcement or UI wording into the contract ticket
  - simplest acceptable validation posture is a clear positive millisecond input shape, but the critical product requirement is explicit invalid-input failure rather than silent coercion
  - ambiguity here will multiply downstream, so the contract should stay easy to explain and inspect

### ISSUE-015 — Ship timeout-bounded `spawn` behavior end-to-end
- Status: done
- Type: AFK
- Goal: deliver the core timeout behavior so a bounded `spawn` call either completes within the requested limit or fails explicitly when the limit is exceeded.
- Why it exists: this is the main user-visible reliability outcome promised by the PRD.
- Depends on: ISSUE-014
- Blocks: ISSUE-016, ISSUE-017
- Parallelizable: no
- Source requirements:
  - PRD Desired outcome
  - PRD Functional requirements 3, 4, 5, 6, 10, 11
  - PRD Edge cases
  - PRD Acceptance criteria 2, 3, 4, 8, 9
- Scope:
  - apply timeout only to the individual spawn call that requested it
  - preserve normal successful behavior when a bounded child run completes within the requested limit
  - treat timeout breaches as hard failures rather than degraded-success, even if partial output exists
  - preserve existing non-timeout error paths for runs that fail for other reasons
- Acceptance criteria:
  - [x] a timeout-bounded spawn call that finishes within the limit behaves like a normal successful spawn call
  - [x] a timeout-bounded spawn call that exceeds the limit fails explicitly
  - [x] a timeout breach is not surfaced as degraded-success, even when partial output exists
  - [x] calls that omit `timeout` remain behaviorally compatible with the current replacement flow
- Notes / risks:
  - implemented in `.pi/extensions/spawn/index.ts` by extending `runOne(...)` to accept `timeoutMs`, arming a per-call timer only when `timeout` is present, aborting the child session on timeout, and converting that path into an explicit error via `getTimeoutError(...)`
  - the no-timeout path remains compatible because the execute path still reads `const timeout = params.timeout;` without introducing any default and only arms the timer when `timeout !== undefined`
  - timeout failures are kept distinct from degraded-success: the timed-out error path now sets `error` plus `timedOut: true` and deliberately suppresses the existing `missingReturnResult` fallback warning/badge path, even if partial output was collected before abort
  - no retry, queueing, or orchestration behavior was added; this remains one spawn call, one session, one optional timer
  - validation for this ticket used source inspection plus two context-offloaded `spawn` review passes (`scout` for runtime-boundary mapping and `reviewer` for post-change verification) to keep exploratory detail out of the parent while still producing evidence-backed checks
  - a full repo-local live timeout smoke matrix is still reserved for `ISSUE-017`; a quick non-interactive CLI probe in this environment did not yield a trustworthy enough signal to treat as primary evidence for this ticket
  - this ticket should not grow into retry logic, queue management, or broader job-control behavior
  - the branch currently relies on in-process child execution, so the timeout behavior should stay focused on bounded completion semantics rather than architectural rewrites
  - preserving the distinction between timeout failure and missing-`return_result` degraded-success is important for user trust

### ISSUE-016 — Show timeout failures clearly in `spawn` UI
- Status: done
- Type: AFK
- Goal: make timeout failures obvious in the existing collapsed and expanded `spawn` surfaces without introducing a new persistent timeout mode.
- Why it exists: timeout support is only useful if users can understand what happened from the normal result UI.
- Depends on: ISSUE-015
- Blocks: ISSUE-017
- Parallelizable: no
- Source requirements:
  - PRD User experience and behavior
  - PRD Functional requirements 7, 8, 10
  - PRD Acceptance criteria 6, 7, 9
- Scope:
  - make collapsed result previews show timeout failures as clear errors
  - make expanded detail explicitly state that the spawn timed out and include the timeout value
  - preserve readability of existing warning, truncation, and non-timeout error states
  - avoid adding a new persistent timeout badge, dashboard, or status mode
- Acceptance criteria:
  - [x] in collapsed UI, a timeout failure is visibly understandable as an error
  - [x] in expanded UI, a timeout failure clearly states that the spawn timed out and includes the timeout value
  - [x] timeout UI stays within the existing result/error surfaces rather than adding a new persistent mode
  - [x] normal success and non-timeout error readability are preserved
- Notes / risks:
  - implemented in `.pi/extensions/spawn/index.ts` by keeping timeout within the existing result renderer: timeout results now add a compact `[timeout]` badge in the normal badge row and expanded error detail now adds an explicit `Timeout: spawn timed out after ... ms` line when `r.timedOut` is true
  - **Reopen fix completed:** `execute(...)` no longer throws away structured timeout details when `runOne(...)` returns an error; it now returns `content + details + isError: true`, so live timeout failures keep `timedOut`, `timeout`, and `error` on the normal spawn result path
  - live JSON-mode smoke revalidation confirmed the timeout failure path now ends with structured details instead of `details:{}`: `tool_execution_end` returned `result.details.mode:"spawn"`, `results[0].timedOut:true`, `results[0].timeout:100`, and `result.isError:true` while the content still read `Subagent failed: subagent timed out after 100 ms.`
  - a bounded-success smoke recheck still returned the normal structured non-error path with `timeout:10000`, `output:"quick-ok"`, and the existing degraded-success warning surface, so this reopen fix did not introduce an obvious success-path regression
  - no persistent timeout mode was added; the change stays entirely inside existing result/error surfaces and simply preserves structured error details for the renderer that already existed
  - normal success, fallback, warning, truncation, and empty-state readability remain intact because the existing status calculation and non-timeout badges were preserved; timeout only adds one extra result badge when relevant
  - keep the timeout message explicit and short; do not drown out more important surrounding result state
  - avoid solving this with extra UI chrome that would make all spawn results heavier

### ISSUE-017 — Validate timeout behavior and non-regression
- Status: done
- Type: AFK
- Goal: create one lightweight validation pass that proves timeout support works, stays clear, and does not materially regress the current replacement spawn baseline.
- Why it exists: the timeout follow-up changes contract, runtime behavior, and error surfacing, so the branch needs concrete evidence before a human sign-off.
- Depends on: ISSUE-014, ISSUE-015, ISSUE-016
- Blocks: ISSUE-018
- Parallelizable: no
- Source requirements:
  - PRD Acceptance criteria
  - PRD Constraints
  - PRD Recommended next step
- Scope:
  - validate calls with no `timeout`
  - validate a bounded call that finishes successfully within the requested limit
  - validate a bounded call that exceeds the requested limit and fails explicitly
  - validate invalid timeout input handling
  - validate collapsed and expanded timeout error visibility
  - record whether timeout support preserves readability and does not introduce obvious perceived-performance regression
- Acceptance criteria:
  - [x] one repo-local validation pass covers no-timeout compatibility, normal bounded success, timeout-triggered hard fail, invalid input, and timeout error visibility
  - [x] validation evidence shows timeout support does not materially regress the current replacement spawn readability/performance guardrails
  - [x] findings are captured clearly enough for HITL review
- Notes / risks:
  - final validation used one lightweight repo-local pass built from live JSON-mode Pi smoke runs against a `spawn-mode`-enabled session plus source inspection; no new screenshot/TUI harness was introduced
  - validated cases and outcomes:
    - no-timeout compatibility passed: `spawn` called with only `prompt` returned `plain-ok` and preserved the existing degraded-success warning surface
    - bounded success passed: `spawn` called with `timeout: 10000` returned `quick-ok` on the normal structured non-error path and preserved the existing degraded-success warning surface when the child skipped `return_result`
    - timeout-triggered hard fail passed: `spawn` called with a child `bash` sleep and `timeout: 100` returned `Subagent failed: subagent timed out after 100 ms.` on a structured error path carrying `result.details.mode:"spawn"`, `results[0].timedOut:true`, and `results[0].timeout:100`
    - invalid input passed: `timeout: 0` failed clearly with `Validation failed for tool "spawn": timeout: must be > 0`
  - timeout visibility is now evidenced both live and in source:
    - live timeout failures no longer collapse to `details:{}` after the ISSUE-016 reopen fix
    - `.pi/extensions/spawn/index.ts` now returns `content + details + isError: true` for error results in `execute(...)`, preserving timeout metadata for rendering
    - `.pi/extensions/spawn/index.ts` still renders timeout failures in the existing result surfaces via the `[timeout]` badge and expanded `Timeout: spawn timed out after ... ms` detail when `r.timedOut` is true
  - quick spot-check durations in the final pass were roughly `10920 ms` for no-timeout, `13247 ms` for bounded success, `7025 ms` for the forced timeout case, and `6605 ms` for invalid input handling; combined with the earlier spot check, this remained a lightweight/noisy signal but showed no obvious timeout-specific material regression beyond normal run-to-run variance
  - the earlier first-pass blocker was real and correctly reopened ISSUE-016 rather than being silently patched inside ISSUE-017; after the reopen fix, the live timeout failure path now reaches the renderer data it needs
  - validation should continue to be read as lightweight smoke evidence, not a deterministic performance benchmark or pixel-level TUI proof
  - the branch should keep distinguishing timeout failure from degraded-success caused by missing `return_result`

### ISSUE-018 — Review whether timeout support is ready to keep using on this branch
- Status: done
- Type: HITL
- Goal: make a human decision on whether the timeout addition is useful, transparent, and still safely within the repo's minimal `spawn` boundary.
- Why it exists: the final judgment about “helpful reliability control without becoming job-control UX” is a product decision that should not be silently auto-approved.
- Depends on: ISSUE-017
- Blocks:
- Parallelizable: no
- Source requirements:
  - PRD Desired outcome
  - PRD Non-goals
  - PRD Acceptance criteria
  - validation evidence produced by `ISSUE-017`
- Scope:
  - review the recorded validation findings
  - decide whether timeout support is ready for continued branch use
  - explicitly address reliability gain, transparency, and boundary-drift risk
- Acceptance criteria:
  - [x] a human verdict is recorded on whether the timeout follow-up is ready to continue
  - [x] the verdict explicitly addresses whether timeout support still feels minimal rather than job-control or platform-like
  - [x] if the result is not ready, the blocking reason is recorded clearly enough to reopen the right AFK ticket
- Notes / risks:
  - **HITL verdict:** ready for continued branch use on `exp/pi-spawn`, but **not** approval to merge to `main`
  - reliability gain looks real enough to justify keeping the feature on this branch: callers can now set an explicit per-call millisecond timeout, successful bounded calls still behave like normal spawn results, and timeout breaches now fail clearly instead of degrading into the missing-`return_result` fallback path
  - transparency looks good enough for continued branch use: live JSON-mode smoke validation now shows structured timeout error details on the real failure path, and the existing renderer path still exposes timeout through the normal error surfaces rather than hiding it behind internal-only state
  - boundary-drift risk remains acceptable for this phase: the public addition is still only `timeout`, the bound stays explicit and per-call, and the branch did not grow retries, queueing, bounded parallelism, scheduling, or broader orchestration behavior
  - this still feels like a minimal reliability control on one focused delegation primitive rather than job-control UX or a subagent platform feature set
  - do not broaden post-verdict follow-up into retries, concurrency controls, or new reliability-feature ideation unless a future ticket explicitly reopens scope
  - no blocking reason remains from the timeout follow-up itself; any further work should be treated as a new scoped follow-up rather than hidden cleanup inside this verdict ticket
