# `pi-spawn` Branch Guide

## Status
This repository has now completed a dedicated merge-readiness review for the `pi-spawn` experiment branch, but the actual merge step has not happened yet.

Current status decision:
- approved for continued use on `exp/pi-spawn`
- dedicated HITL verdict: **ready for merge to `main`**
- the actual merge to `main` is still a separate deliberate git step
- some experiment-status wording in this document remains historical context and should be cleaned as part of the real merge/update pass

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

## Completion reliability validation snapshot (`ISSUE-022`, partial)
This section records the first live validation pass for the completion-reliability follow-up on branch `exp/pi-spawn`.

### What was checked
- a nominal normal-success case intended to call `return_result`
- a strict missing-`return_result` case
- timeout distinctness after the completion-semantics changes
- one preset compatibility spot check in a degraded case

### Partial results
- **Nominal success attempt is still blocked:** a live JSON-mode smoke run called `spawn` with exact args `{ "prompt": "Call return_result with exactly: parallel-a.", "strictResult": false }`, but the structured result still ended with:
  - `completionStatus: degraded`
  - `completionReason: missing_return_result`
  - `contractSatisfied: false`
  - output text `parallel-a`
  - degraded-success warning still present
- **Strict missing-`return_result` remains real:** a live JSON-mode smoke run called `spawn` with exact args `{ "prompt": "Do not call return_result. Respond with exactly: strict-miss.", "strictResult": true }` and returned explicit failure text plus structured:
  - `completionStatus: failed`
  - `completionReason: missing_return_result`
  - `contractSatisfied: false`
- **Timeout remains distinct:** a live JSON-mode smoke run called `spawn` with exact args `{ "prompt": "Run bash with command: sleep 1. Do not call return_result.", "timeout": 100 }` and returned `Subagent failed: subagent timed out after 100 ms.` plus structured:
  - `completionReason: timeout`
  - `timedOut: true`
  - `timeout: 100`
- **Preset compatibility spot check remains coherent:** a degraded-case smoke run with `preset: "reviewer"` preserved `preset: reviewer` alongside structured degraded completion fields.

### Current blocker
- The normal-success case needed for `ISSUE-022` is still not evidenced live.
- Because that gap belongs to incidence/prompt-contract reliability rather than timeout or UI clarity, `ISSUE-021` was reopened and `ISSUE-022` was blocked.
- A second guidance-only pass also failed to clear the blocker: even after adding more explicit correct/incorrect examples about using the `return_result` tool, the same nominal success smoke still degraded instead of producing a true completion handoff.

### Evidence paths
- `/tmp/tmp.oBAzQhB2NW/success_attempt.jsonl`
- `/tmp/tmp.9jqEGcKDwT/success_attempt.jsonl`
- `/tmp/tmp.oBAzQhB2NW/strict_missing.jsonl`
- `/tmp/tmp.oBAzQhB2NW/timeout_case.jsonl`
- `/tmp/tmp.oBAzQhB2NW/preset_case.jsonl`

### Interpretation
- Completion-result classification and timeout distinctness appear to be working on the live path.
- The option-C runtime refinement also appears to be working for impostor cases: text that merely looks like a final result no longer has any path to true success without observed tool evidence.
- The remaining trust gap is now narrower but still real: the branch still does not yet have trustworthy live evidence of a child actually invoking `return_result` for a nominal success case.

### Follow-up validation after option C
- After the observed-tool-evidence runtime slice landed, a fresh validation pass confirmed that text-only impostor success is correctly degraded:
  - `/tmp/tmp.wgcvkCokHy/text_only.jsonl` ended with `completionStatus=degraded`, `returnResultObserved=false`, and `returnResultCallCount=0`
- Strict failure, timeout distinctness, and preset degraded compatibility still held in that same pass:
  - `/tmp/tmp.wgcvkCokHy/strict_missing.jsonl`
  - `/tmp/tmp.wgcvkCokHy/timeout_case.jsonl`
  - `/tmp/tmp.wgcvkCokHy/preset_case.jsonl`
- However, a second live success-focused probe set still did not produce a true success case:
  - `/tmp/tmp.G0Q2D8zcxg/success_b.jsonl`
  - `/tmp/tmp.G0Q2D8zcxg/success_c.jsonl`
  - `/tmp/tmp.G0Q2D8zcxg/success_e.jsonl`
- All three still ended with degraded completion and no observed `return_result` tool invocation.

### Follow-up validation after bounded completion repair
- A later runtime slice added one bounded internal completion-repair turn.
- That slice did surface repair metadata in the live path, but the branch still did not reach a trustworthy true-success case.
- Evidence from `/tmp/tmp.bJzt1FcT23/`:
  - `degraded_non_strict.jsonl` still degraded and returned fallback text claiming `return_result` was unavailable in the child session
  - `success_read.jsonl` and `success_simple.jsonl` timed out at `30000 ms` before any observed `return_result` success was recorded
  - `strict_missing.jsonl` timed out after `completionRepairAttempted=True`, which means the repair path now risks destabilizing the previously clear strict-failure story under some probes
  - `timeout_case.jsonl` still preserved timeout distinctness
  - `preset_case.jsonl` timed out under the bounded repair path rather than cleanly demonstrating preset compatibility
- Interpretation:
  - the branch can now distinguish impostor success from true success more honestly than before
  - but the new repair slice is not yet trustworthy enough to close validation, because it still lacks a live true-success case and may introduce timeout-related regressions on nominal success paths

### Follow-up validation after repair stabilization
- A later reopen fix narrowed repair to non-strict mode, preserved the original fallback output from the first child turn, and restored cleaner adjacent-path behavior.
- Stable adjacent-path evidence after that fix:
  - `/tmp/tmp.cxk02rV7B6/degraded_non_strict.jsonl` showed non-strict repair attempted once and then preserved the original fallback output `degraded-ok`
  - `/tmp/tmp.cxk02rV7B6/strict_missing.jsonl` showed strict mode skipping repair and remaining an explicit missing-`return_result` failure without timeout regression
  - `/tmp/tmp.cxk02rV7B6/timeout_case.jsonl` showed timeout still bypassing repair and remaining distinct
  - `/tmp/tmp.QMyKNdQxh6/preset_case.jsonl` showed degraded preset compatibility remained coherent again with `preset: reviewer`
- However, the validation ticket was still blocked because repeated true-success probes continued to fail:
  - `/tmp/tmp.IoRjEr5uWk/success_direct.jsonl`
  - `/tmp/tmp.IoRjEr5uWk/success_with_example.jsonl`
  - `/tmp/tmp.IoRjEr5uWk/success_read.jsonl`
  - `/tmp/tmp.r1YugP01hk/success_full.jsonl`
- All of those probes still ended with degraded completion, `returnResultObserved=false`, and `returnResultCallCount=0`.
- The `gpt-5.4-mini` success probes also produced empty fallback output, so the branch still lacks trustworthy real-path evidence that the child session can actually invoke the custom `return_result` tool.
- Interpretation:
  - degraded fallback, strict failure, timeout distinctness, and preset coherence now look cleaner again
  - but the core success path is still not validated live, so `ISSUE-022` remains blocked and the runtime-reliability slice had to be reopened again

### Root-cause follow-up after the second `ISSUE-024` reopen
- A later implementation pass identified a concrete SDK/runtime cause for the missing `return_result` success path.
- The child session was registering `return_result` as a custom tool, but when `createAgentSession(...)` was called with an explicit `tools` list, Pi treated that list as the active-tool set.
- Local SDK probe evidence:
  - with `tools: ['read', 'bash']` and `customTools: [return_result]`, the active tools were only `['read', 'bash']`
  - with `tools: ['read', 'bash', 'return_result']` and `customTools: [return_result]`, the active tools became `['read', 'bash', 'return_result']`
- This matches SDK source behavior where `initialActiveToolNames = options.tools` when an explicit list is supplied.
- The repo-local fix in `.pi/extensions/spawn/index.ts` now activates the tool explicitly with `tools: [...inheritedTools, returnResultTool.name]` when creating the child session.
- Immediate live provider-backed revalidation was attempted, but the parent prompt hit provider quota exhaustion before the spawn tool ran:
  - `/tmp/tmp.huhSgWMv8W/success_direct.jsonl` recorded parent-side `usage_limit_reached` / `429`
- Interpretation:
  - the missing-tool hypothesis is now grounded and fixed in code
  - but final live true-success proof still belongs to `ISSUE-022` once provider-backed validation is available again

### Final completion reliability validation snapshot (`ISSUE-022`)
- A later provider-backed validation pass finally produced live true-success evidence after the child-tool activation fix.
- Fresh live evidence:
  - `/tmp/tmp.dosGigNeIu/success_direct.jsonl` showed a normal success with `completionStatus=success`, `completionReason=return_result`, `returnResultObserved=True`, and `returnResultCallCount=1`
  - `/tmp/tmp.qdXlqxYP0R/non_tool_text.jsonl` showed one bounded repair turn succeeding inside the same spawn call with `completionRepairAttempted=True` and `completionRepairSucceeded=True`
  - `/tmp/tmp.qdXlqxYP0R/strict_text.jsonl` showed strict missing-`return_result` still failing explicitly with `completionReason=missing_return_result`
  - `/tmp/tmp.jE0v2UhSW3/timeout_case.jsonl` showed timeout still distinct with `completionReason=timeout`, `timedOut=True`, and `timeout=100`
  - `/tmp/tmp.jE0v2UhSW3/preset_case.jsonl` showed preset compatibility remaining coherent with `preset=reviewer`
- Retained degraded-fallback evidence still matters for the final matrix:
  - `/tmp/tmp.cxk02rV7B6/degraded_non_strict.jsonl` remains the direct live proof of a non-strict degraded fallback where repair was attempted once, still failed, and the original fallback output `degraded-ok` was preserved
- Final interpretation:
  - true success, degraded fallback, strict failure, and timeout are now all distinguishable with repo-local evidence
  - the bounded repair behavior is evidenced as a single internal contract-repair step, not a generic retry system
  - preset compatibility remains coherent under the refined completion semantics
  - this is sufficient validation evidence for HITL review in `ISSUE-023`

### Operational hardening validation snapshot (`ISSUE-028`)
- The hardening follow-up now has a one-command validation entry point at `node scripts/validate-spawn-hardening.mjs`.
- A final end-to-end validation run produced artifacts under `/tmp/pi-spawn-validate-kiepaK/` with machine-readable summary `/tmp/pi-spawn-validate-kiepaK/summary.json`.
- What the consolidated run confirmed directly:
  - deterministic local regression coverage
  - direct success with observed `return_result`
  - repaired success with `completionRepairAttempted=True` and `completionRepairSucceeded=True`
  - strict failure
  - timeout distinctness
- Remaining consolidated-run limitation:
  - `preset_success` was reported as `UNAVAILABLE` in that run because the current environment/provider resolution was not fully available for that case, not because the spawn runtime regressed
- Retained targeted evidence still completes the matrix:
  - preset coherence: `/tmp/tmp.S1i9rspRM1/preset.jsonl`
  - degraded fallback retained evidence: `/tmp/tmp.cxk02rV7B6/degraded_non_strict.jsonl`
  - earlier targeted repaired-success proof: `/tmp/tmp.hBaEW5rH58/repair.jsonl`
- Interpretation:
  - the validation-command refinement from the `ISSUE-025` reopen worked: the repaired-success scenario is now robust enough for the consolidated check
  - the new validation command is now stable enough to serve as the main repeatable branch check
  - direct success, repaired success, degraded fallback, strict failure, timeout, and preset coherence are all distinguishable with repo-local evidence
  - the only limitation in the final consolidated run was explicit environment/provider availability for one preset case, and that limitation is now recorded transparently rather than hidden
  - this is sufficient validation evidence for HITL review in `ISSUE-029`

## Branch-vs-main delta snapshot (`ISSUE-030`)
- `exp/pi-spawn` currently sits 8 commits ahead of `origin/main` and touches roughly 40 files, so the merge question is about a meaningful workflow delta rather than one isolated runtime patch.
- Reviewer-facing summary of what would materially change on `main`:

### Public and user-visible impact
- A repo-local replacement `spawn` workflow would become part of the default repository codebase through `.pi/extensions/spawn/index.ts`, plus the opt-in `/spawn-mode` guardrail in `.pi/extensions/spawn/mode.ts`.
- The branch adds explicit delegation UX and status semantics that `main` does not currently carry in this repo-local form:
  - queued/running/result rendering for spawned work
  - explicit degraded fallback, strict failure, timeout, and repaired-success cues
  - active spawn-mode status and guardrails around when delegation is allowed
- The branch expands the repo-local `spawn` tool surface with optional `preset` (`scout | planner | reviewer`) and optional per-call `timeout` in addition to the stricter completion-contract posture.
- Completion behavior on the branch is more explicit than on `main`:
  - true success requires observed `return_result`
  - text-only impostor success is degraded instead of accepted as success
  - strict missing-`return_result` is a hard failure
  - one bounded internal repair turn can recover a missing-tool first turn and is surfaced as repaired success
- Repo guidance also changes in a user-visible way for maintainers and future agents: `AGENTS.md` and several local skills now explicitly teach `spawn` as a context-offloading tool with parent-owned decisions and edits.

### Internal and implementation-facing impact
- The branch adds a local spawn domain under `.pi/extensions/spawn/` with shared mode helpers, render helpers, completion metadata, and child-session wiring that does not exist on `main`.
- Operational confidence tooling is new on this branch:
  - `scripts/validate-spawn-hardening.mjs`
  - `tests/spawn-return-result-activation.test.mjs`
- The branch also adds a large experiment-documentation footprint under `docs/pi-spawn.md` and `docs/prototype/`, plus updates to `docs/idea.md`, `docs/prd.md`, `docs/issues.md`, `docs/qa.md`, and `docs/research.md` that preserve branch history and validation context.
- Small repo scaffolding changes also land with the experiment, including `.gitignore` support for `.pi/npm/` and a repo-local `.pi/settings.json` packages file.

### Remaining branch-only assumptions that still matter for merge readiness
- `docs/pi-spawn.md` still describes the work as an experiment branch workflow on `exp/pi-spawn`; if the branch is approved for `main`, that status language will need a deliberate cleanup pass rather than being left as-is.
- Delegation is still intentionally opt-in through `/spawn-mode`; merging this branch would add the workflow to `main`, but would **not** automatically make child delegation the always-on default path.
- Some validation is now repeatable and local, but part of the confidence story still depends on provider-backed runs and retained artifacts; the merge review still has to decide whether that remaining dependency is acceptable for `main`.
- The branch introduces a sizable documentation and prototype trail that is useful for auditability, but `main` should make an intentional choice to keep that historical footprint or trim it after merge rather than inheriting it by accident.

### Evidence used for this delta summary
- `git log --oneline --reverse origin/main..HEAD`
- `git diff --stat origin/main...HEAD`
- `git diff --name-status origin/main...HEAD`
- `git diff --unified=0 origin/main...HEAD -- AGENTS.md .gitignore .pi/settings.json`
- source inspection of `.pi/extensions/spawn/index.ts`, `.pi/extensions/spawn/mode.ts`, and `.pi/extensions/spawn/shared.ts`

## Merge-candidate validation snapshot (`ISSUE-031`)
- Fresh merge-candidate validation was rerun on the current branch state rather than relying only on earlier branch-use artifacts.
- Fresh command results:
  - `node scripts/validate-spawn-hardening.mjs`
    - artifacts: `/tmp/pi-spawn-validate-z5wDgR/`
    - machine-readable summary: `/tmp/pi-spawn-validate-z5wDgR/summary.json`
  - `node --test tests/spawn-return-result-activation.test.mjs`
    - result: `pass 2`, `fail 0`
- What the fresh validation run confirmed directly:
  - local regression coverage passed inside the consolidated validation command
  - direct success passed with observed `return_result`
  - repaired success passed with `completionRepairAttempted=True` and `completionRepairSucceeded=True`
  - strict missing-`return_result` remained an explicit failure
  - timeout remained distinct
  - preset coherence passed on a successful `reviewer` run
- Important nuance from this latest run:
  - the fresh `preset_success` case passed, but it passed as a repaired success (`completionRepairAttempted=True`, `completionRepairSucceeded=True`) rather than as an unrepaired direct success
  - that is not a failure for the current validation command because the case is checking preset coherence on a successful run, but it is still useful context for the later merge-risk review
- Environment/provider limitation status on this run:
  - none observed; the provider-backed validation cases were available and completed in this run
- Interpretation:
  - the current branch still has fresh repo-local evidence for the main reliability matrix plus the deterministic activation regression guardrail
  - the validation command is now strong enough to support merge review, but the latest preset-case repair nuance should remain visible when assessing whether the default-path behavior on `main` feels trustworthy enough

## Rollback, compatibility, and blast-radius snapshot (`ISSUE-032`)
- This ticket reviewed whether the current branch looks operationally safe enough to become the default path on `main`, separate from the final human merge verdict.

### Rollback posture
- The branch delta is large in file count, but it is still overwhelmingly **repo-local and file-based**:
  - `.pi/extensions/`
  - `.pi/skills/`
  - `AGENTS.md`
  - `docs/`
  - `scripts/`
  - `tests/`
- No database, schema, or external service migration was introduced.
- No broad package-install surface was introduced for this follow-up; `.pi/settings.json` still contains an empty `packages` list.
- If a post-merge issue appears, rollback is operationally straightforward:
  - revert the ahead-of-main spawn experiment commits, or
  - remove the repo-local spawn extension/mode/docs as a normal git revert
- The branch does persist spawn-mode state into Pi session history entries, but those entries are repo-local session metadata rather than risky durable product state. If the extension is removed later, those old entries are noise, not a dangerous migration artifact.

### Blast radius
- Outside Pi workflow behavior, blast radius is low: the branch does not touch an application database, production service contract, or end-user data path.
- Inside this repository's agent workflow, blast radius is **meaningful but bounded**:
  - the branch changes delegation guidance and local agent behavior
  - it adds a repo-local replacement `spawn`
  - it adds `/spawn-mode` policy/guardrails
  - it changes how success/degraded/strict/timeout/repaired states are surfaced
- The biggest practical blast radius is therefore on **maintainer/reviewer workflow**, not external user data or backend systems.
- That blast radius is partially contained because delegation still remains opt-in through `/spawn-mode`; the branch does not force all sessions into child delegation by default.

### Compatibility posture
- Fresh validation plus retained evidence indicate that the branch remains compatible with the intended minimal `spawn` contract:
  - non-preset and non-timeout behavior still work
  - direct success, repaired success, degraded fallback, strict failure, and timeout remain distinguishable
  - child `return_result` activation is protected by deterministic regression coverage
  - strict and non-strict semantics remain internally coherent
- The repo-local guidance and skills were also updated to teach `spawn` as context offloading rather than as a general implementation platform, which reduces boundary-drift risk if merged.
- Known nuance that still matters for merge confidence:
  - the latest `preset_success` validation case succeeded through repaired success rather than an unrepaired first-turn direct success
  - this does **not** invalidate preset compatibility, but it does mean the merge review should judge whether that amount of repair-on-success is acceptable for the default path on `main`

### Current operational caveats to carry into HITL
- `docs/pi-spawn.md` still presents the branch as an experiment on `exp/pi-spawn`; a positive merge verdict should be followed by a deliberate wording cleanup rather than merging that status language unchanged.
- The current working tree is dirty because the merge-readiness follow-up artifacts are still being authored. That is not a runtime blocker, but it is a procedural blocker until the branch is committed/cleaned before any actual merge.
- The branch carries a large documentation and prototype trail. That is good for auditability, but `main` should keep it intentionally, not by accident.
- Part of the confidence story still depends on provider-backed validation even though the latest merge-candidate run succeeded. This is likely acceptable, but it remains a judgment call for the final human merge verdict rather than a purely mechanical pass.

### Current AFK assessment
- No hard rollback or compatibility blocker was found that automatically disqualifies the branch from future merge consideration.
- The remaining concerns are mostly **merge-governance and cleanup concerns**, not core runtime-correctness failures:
  - whether repaired-success-on-preset is trustworthy enough for the default path
  - whether the experiment-status language and documentation footprint should be cleaned before merge
  - whether reviewers are comfortable with the remaining provider-backed portion of the confidence story
- If HITL later judges the branch **not ready**, the smallest likely follow-up shapes are:
  - a docs/cleanup ticket for status language and main-branch packaging
  - or a narrow runtime-confidence ticket if repaired preset success is judged too soft for the default path

### Evidence used for this assessment
- `git status --short`
- `git log --oneline --reverse origin/main..HEAD`
- `git diff --name-only origin/main...HEAD | awk -F/ '{print $1}' | sort | uniq -c`
- `docs/pi-spawn.md` snapshots from `ISSUE-022`, `ISSUE-028`, `ISSUE-030`, and `ISSUE-031`
- `docs/issues.md` current merge-readiness plan
- source inspection of `.pi/extensions/spawn/mode.ts` and `.pi/extensions/spawn/shared.ts`

## Merge-to-main decision checklist
Use this checklist only for the separate human decision about whether this experiment is ready to leave `exp/pi-spawn` and become the default path on `main`.

Rule of thumb:
- merge to `main` only if **all MUST items** are `yes`
- if any MUST item is `no` or `unknown`, keep this work on the experiment branch

### A. Product / scope boundary
#### MUST
- [ ] `spawn` still feels like a minimal focused delegation primitive
- [ ] it has not drifted into a subagent platform, retry/orchestration framework, or dashboard/job-control system
- [ ] public API additions remain intentionally narrow (`preset`, `timeout`) with no extra unintended surface area
- [ ] bounded repair is still one bounded internal repair turn, not a disguised retry loop

#### Nice to have
- [ ] one short paragraph explains what `spawn` does and what it intentionally does not do

### B. Runtime correctness
#### MUST
- [ ] direct success only occurs when `return_result` was actually observed
- [ ] text-only fake success cannot pass as true success
- [ ] repaired success remains distinguishable from direct success
- [ ] strict missing-`return_result` remains a hard failure
- [ ] timeout remains distinct from other failure types
- [ ] degraded fallback still preserves the original first-turn output when repair fails
- [ ] presets remain compatible with the completion contract

#### Evidence minimum
- [ ] `node scripts/validate-spawn-hardening.mjs` passes on the latest review run
- [ ] `node --test tests/spawn-return-result-activation.test.mjs` passes on the latest review run

### C. Validation confidence
#### MUST
- [ ] there is one repeatable main validation command for reviewers
- [ ] that command is stable enough to run from a fresh context
- [ ] validation does not depend on difficult manual reconstruction
- [ ] provider or environment limitations are surfaced honestly as `UNAVAILABLE`, not hidden as success

#### Stronger merge signal
- [ ] the validation command passed on more than one separate run
- [ ] no known flaky case is still bouncing between pass and fail without explanation

### D. UX / transparency
#### MUST
- [ ] reviewers can distinguish direct success, success after repair, degraded fallback, strict failure, and timeout
- [ ] repaired success is visible in existing result surfaces
- [ ] direct success did not become materially noisier
- [ ] warning and error text remains usable for debugging

### E. Safety / compatibility
#### MUST
- [ ] existing parent-side tool use is not broken
- [ ] non-preset and non-timeout behavior still works
- [ ] child-tool activation for `return_result` is guarded by deterministic regression coverage
- [ ] strict and non-strict semantics remain internally consistent

#### Stronger merge signal
- [ ] at least one additional smoke flow representing normal day-to-day usage has been reviewed successfully

### F. Maintainability
#### MUST
- [ ] the implementation is still understandable without relying on too much branch lore
- [ ] docs explain the key completion and delegation contracts clearly enough
- [ ] there is no known correctness blocker still open
- [ ] reviewers do not depend on a workaround they already distrust

### G. Human sign-off
#### MUST
- [ ] there is a dedicated HITL merge-readiness verdict, not just a continued-branch-use verdict
- [ ] that verdict explicitly addresses trust gain, boundary-drift risk, and operability on `main`
- [ ] any remaining limitation is explicitly judged either acceptable for `main` or still branch-only

#### Stronger merge signal
- [ ] at least one additional human reviewer agrees this is now worth the default path

### H. Rollback / blast radius
#### MUST
- [ ] rollback is straightforward if a post-merge issue appears
- [ ] no risky migration is required
- [ ] reverting would not leave behind dangerous or confusing state

### Practical merge gate
Merge to `main` only if:
- [ ] all MUST items above are `yes`
- [ ] the latest validation command run passed
- [ ] the latest deterministic regression test run passed
- [ ] there is no active flaky blocker
- [ ] a dedicated HITL merge-readiness verdict is explicitly positive

Do **not** merge to `main` if any of these is still true:
- [ ] the branch is still only approved for continued branch use
- [ ] validation is still materially flaky
- [ ] the success vs degraded vs repaired-success boundary is still confusing
- [ ] the feature feels platform-like instead of minimal
- [ ] reviewers still do not trust it as the default path for `main`

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
