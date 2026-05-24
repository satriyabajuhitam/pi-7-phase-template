# `pi-spawn` Branch Guide

## Status
This repository currently treats `pi-spawn` as an **experiment branch workflow**, not a final platform decision.

Current status decision:
- approved for continued use on `exp/pi-spawn`
- ready for branch-level sign-off and review
- **not** implicitly approved for merge to `main`
- any future merge to `main` requires a separate human decision

Branch context:
- branch: `exp/pi-spawn`
- approach: upstream `pi-spawn`
- workflow style: `7-phase` + local conventions
- local guardrails: `/spawn-mode` + `delegate-me`

## What this experiment is for
Use `pi-spawn` here to offload **focused artifact-driven analysis** to isolated sub-agents while keeping the parent session cleaner.

This branch has already validated `pi-spawn` for:
- research synthesis
- planning-readiness / blocker detection
- execution preparation for exactly one ready AFK ticket
- guarded delegation fallback when the backend is unavailable

## When to use `spawn`
Use `spawn` when:
- one focused question benefits from fresh isolated attention
- the task can be grounded in files under `docs/`
- you want a synthesis, not raw tool output
- the current phase needs a narrow handoff or readiness check

Do **not** use `spawn` when:
- you already know the exact implementation and can do it directly
- the prompt would mostly contain inline code instead of file references
- the task really needs long-session continuity or retrieval-backed memory
- the task needs a human decision rather than AFK execution

## Always include these in the prompt
- current phase
- objective
- primary artifacts
- scope / out of scope
- explicit output contract
- evidence requirements

Prefer repo artifacts such as:
- `docs/research.md`
- `docs/prd.md`
- `docs/issues.md`
- `docs/qa.md`

## Delegation modes

### Single spawn
Use when:
- one artifact review is needed
- one readiness check is needed
- one handoff summary is needed

Example use cases:
- summarize research gaps
- assess PRD readiness
- prepare one execution brief

### Parallel spawn
Use when:
- tasks are independent
- you want separate reads of separate concerns
- no spawned task depends on another spawned result

Example use cases:
- inspect `docs/prd.md` and `docs/issues.md` separately
- compare implementation readiness and QA risk independently

### Serial spawn
Use when:
- step B depends on step A
- you need scout → synthesize → act
- the second prompt must incorporate the first result

Example use cases:
- identify research gaps first, then produce a narrower recommendation
- identify one ready ticket first, then prepare execution context for that exact ticket

## Recommended output shapes
For most branch workflows, ask for a strict section contract.

Examples:
- `Summary / Evidence / Recommended next step`
- `Summary / Evidence / Readiness verdict / Recommended next step`
- `Ticket / Objective / Dependencies / Likely files / Validation targets`

For exact literals, say:
- `Return exactly: X`
- `No extra words`
- `No punctuation`

## What this experiment does **not** solve
This branch does **not** claim to solve:
- session continuity after compaction
- retrieval-backed memory
- indexed long-term context
- persistent specialist-agent architecture
- automatic writing of structured handoff artifacts into all `docs/` files

Those remain separate questions from whether lightweight delegation is useful in this repo.

## Current validated pattern
The currently safest pattern in this repo is:
1. opt in explicitly with `/spawn-mode` when delegation is desired
2. ground the sub-agent on `docs/` artifacts
3. keep the task narrow
4. require evidence-first synthesis
5. use single / parallel / serial intentionally
6. treat the result as a handoff aid, not as automatic truth

## Missing `return_result` posture
This branch expects spawned children to call `return_result` for the final handoff.

Current branch behavior:
- if the child calls `return_result`, the parent receives the intended structured handoff
- if the child skips `return_result`, the default branch behavior treats the output as **degraded-success**, not silent-success
- degraded-success is surfaced with an explicit warning that the result fell back to the last assistant message
- an optional strict mode is now available through `strictResult: true`
- when strict mode is enabled and the child skips `return_result`, the spawn fails explicitly instead of returning degraded-success

Use strict mode when:
- the parent requires a hard structured-handoff contract
- the task is validation-heavy or execution-critical
- silent or advisory fallback would be too risky

Avoid strict mode when:
- the work is exploratory
- research synthesis value matters more than strict protocol adherence
- you still want useful fallback output instead of a hard failure by default

## Dependency posture
This branch currently uses:
- upstream `pi-spawn`
- pinned package version: `npm:pi-spawn@0.1.0`

Operational stance:
- upstream-first
- delegation is opt-in through local `spawn-mode` guardrails
- fallback to single-agent workflow if the backend is unavailable
- fork-ready if upstream maintenance stops

This branch should not assume upstream continuity forever.

## Child inheritance contract in this repo
Desired default posture:
- child sessions inherit the parent agent's active built-in tools
- child sessions inherit normal skills, prompt resources, and extension policy hooks
- child sessions do **not** inherit nested `spawn`
- future parent-side narrowing for tools / skills / extensions is a possible follow-up, not current branch scope

Current validated behavior:
- active built-in tools are inherited as a subset by the child
- normal resource loading still brings in local skills and extension hooks
- in this repo's current setup, the child loads:
  - project-local `spawn-mode`
  - global `permission-gate`
  - local `7-phase` skills under `.pi/skills/`
- no extra extension tools are currently inherited here because the loaded extensions are policy/controller extensions, not child-tool providers

Important nuance:
- child sessions inherit resources and hooks, not the parent session's full runtime state history
- that is acceptable in this branch because upstream `pi-spawn` excludes itself from the child loader, so nested `spawn` remains blocked

Detailed validation artifact:
- `docs/prototype/spawn-inheritance-validation.md`

## Preset validation snapshot (`ISSUE-012`)
This section is the lightweight validation handoff for the narrow `preset` follow-up on branch `exp/pi-spawn`.

### What was checked
- non-preset compatibility
- default-shape behavior for `scout`, `planner`, and `reviewer`
- explicit output-format override behavior
- invalid preset handling
- preset UI transparency via render-path inspection
- quick non-regression/perf spot check

### Results
- **Non-preset compatibility:** confirmed by a live JSON-mode smoke run where `spawn` was called without `preset` and returned `plain-ok`; the tool call args contained only `prompt` and the usual fallback warning surface remained unchanged.
- **`scout` default shape:** confirmed by a live JSON-mode smoke run over `AGENTS.md`; the child returned `## Summary`, `## Evidence`, and `## Open questions`.
- **`planner` default shape:** confirmed by a live JSON-mode smoke run over `docs/issues.md`; the child returned `## Objective`, `## Likely files`, `## Risks`, and `## Recommended next step`.
- **`reviewer` default shape:** confirmed by a live JSON-mode smoke run reviewing whether `ISSUE-012` was ready to start; the child returned `## Verdict`, `## Evidence`, and `## Follow-ups`.
- **Explicit format override:** confirmed by live JSON-mode smoke runs for all three presets where the child prompt was `Respond with exactly: ok.`; each preset returned just `ok`, so the user format request still won.
- **Invalid preset handling:** confirmed by forcing a raw tool call with `{"prompt":"Respond with exactly: invalid-ok.","preset":"writer"}`; Pi returned `Validation failed for tool "spawn": preset: must be equal to one of the allowed values`.
- **UI transparency:** confirmed by source inspection in `.pi/extensions/spawn/index.ts`:
  - `buildSessionPrompt(...)` prepends preset guidance before the user task at lines `237-240`
  - queued-call badging uses `formatPresetBadge(...)` at lines `243-246` and is rendered in `renderCall(...)` at lines `815-822`
  - expanded detail shows only preset name, intent, and default output shape at lines `923-928`
  - collapsed results stay expandable when `preset` exists at lines `957-964`
- **Quick non-regression/perf spot check:** a trivial no-preset smoke run completed in about `8079 ms`; a comparable trivial preset run (`reviewer`) completed in about `9776 ms`. Both completed in one child turn and preserved the same degraded-success warning surface, so this pass found no obvious material regression against the current replacement baseline.

### Limitations
- This repo still has no automated TUI render or screenshot harness.
- UI transparency was validated through render-path source inspection plus live tool-detail smoke runs, not pixel-level visual assertions.
- The perf check was a lightweight spot check, not a statistically rigorous benchmark.

### Handoff to `ISSUE-013`
Use this snapshot together with `docs/issues.md` and `docs/prd.md` to decide whether preset support is transparent, useful, and still within the repo's minimal `spawn` boundary.

## Timeout validation snapshot (`ISSUE-017`)
This section records the completed lightweight validation handoff for the timeout follow-up on branch `exp/pi-spawn`.

### What was checked
- no-timeout compatibility
- bounded success with an explicit `timeout`
- timeout-triggered hard failure
- invalid timeout input handling
- whether timeout-specific UI copy is actually reachable on the live failure path
- quick spot-check durations for non-regression context

### Results
- **No-timeout compatibility:** confirmed by a live JSON-mode smoke run where `spawn` was called with only `prompt` and returned `plain-ok`; the usual degraded-success warning surface remained unchanged.
- **Bounded success:** confirmed by live JSON-mode smoke runs where `spawn` was called with `timeout: 10000` and returned `quick-ok`; the result stayed on the normal structured non-error path and preserved the existing degraded-success warning surface when the child skipped `return_result`.
- **Timeout-triggered hard fail:** confirmed by live JSON-mode smoke runs where the child was instructed to run `sleep 1` and the parent called `spawn` with `timeout: 100`; Pi returned `Subagent failed: subagent timed out after 100 ms.`
- **Invalid timeout input:** confirmed by a live JSON-mode smoke run where `spawn` was called with `timeout: 0`; Pi returned `Validation failed for tool "spawn": timeout: must be > 0`.
- **Timeout error visibility:** confirmed by the post-fix live timeout result now carrying structured spawn details instead of `details:{}`:
  - `tool_execution_end.result.details.mode: "spawn"`
  - `tool_execution_end.result.details.results[0].timedOut: true`
  - `tool_execution_end.result.details.results[0].timeout: 100`
  - `tool_execution_end.result.isError: true`
  - visible error text remained `Subagent failed: subagent timed out after 100 ms.`
- **Renderer-path confirmation:** source inspection in `.pi/extensions/spawn/index.ts` shows:
  - `execute(...)` now returns `content + details + isError: true` for `result.error`, preserving timeout metadata for rendering
  - the normal detailed renderer still adds the `[timeout]` badge when `r.timedOut` is true
  - the expanded renderer still adds `Timeout: spawn timed out after ... ms` when `r.timedOut` is true
- **Quick non-regression/perf spot check:**
  - earlier pass: about `8232 ms` (no-timeout), `8266 ms` (bounded success), `7599 ms` (forced timeout), `6256 ms` (invalid input)
  - final pass after the reopen fix: about `10920 ms` (no-timeout), `13247 ms` (bounded success), `7025 ms` (forced timeout), `6605 ms` (invalid input)
  - these lightweight spot checks were noisy, but they remained in the same rough range and showed no obvious timeout-specific material regression beyond normal run-to-run variance.

### Validation story
- The first timeout validation pass found a real blocker: live timeout failures were falling through the thrown no-details tool-error path, so the timeout-specific expanded detail was not actually reachable.
- That blocker correctly reopened `ISSUE-016` rather than being silently patched inside `ISSUE-017`.
- After the `ISSUE-016` reopen fix, the live timeout failure path preserved structured details again, making the timeout-specific expanded renderer path reachable from the real failure case that mattered.

### Current verdict
- Runtime timeout behavior looks real enough for continued branch use.
- Timeout input validation looks real enough for continued branch use.
- Timeout UI visibility now has both live-path and source-path evidence.
- This is sufficient for the planned HITL review in `ISSUE-018`.

### Limitations
- This repo still has no automated TUI render or screenshot harness.
- Validation used live JSON-mode smoke runs plus source inspection, not pixel-level visual assertions.
- The perf comparison was a lightweight spot check, not a statistically rigorous benchmark.

## Where to look for deeper detail
- `docs/prd.md`
- `docs/issues.md`
- `docs/prototype/spawn-conventions.md`
- `docs/prototype/validation.md`
- `docs/prototype/real-flow-1-phase-2.md`
- `docs/prototype/real-flow-2-phase-5.md`
- `docs/prototype/real-flow-3-phase-6.md`
- `docs/prototype/spawn-mode-spec.md`
- `docs/prototype/spawn-mode-validation.md`
