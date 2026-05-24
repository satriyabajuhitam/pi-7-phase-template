# Validation Flow — `spawn` replacement side-by-side check

## Objective
Define one lightweight, repeatable side-by-side validation flow that compares the replacement `spawn` experience against the current `pi-spawn` baseline using the same 3-parallel-spawn scenario.

This flow is intentionally small. Its job is to create a trustworthy comparison path for readability and perceived performance, not to become a full benchmark harness.

## Scope
Compare these two implementations only:
- **Baseline:** current `pi-spawn` behavior on the baseline branch/session
- **Replacement:** repo-local replacement `spawn` backend on the replacement branch/session

The flow compares:
- readability of active and completed states
- visibility of warning/error/truncation signals
- clarity of completion state across 3 parallel spawns
- whether the replacement feels visibly slower than the baseline

The flow does **not** try to measure:
- precise token efficiency
- long-run memory behavior
- overlay/history UX
- broader multi-agent platform behavior

## Shared scenario
Run the same 3-parallel-spawn scenario in both environments.

### Preconditions
- active session is reloaded
- `spawn-mode` is `on`
- exactly one `spawn` backend is active in the session being tested

### Prompt shape
Issue three parallel `spawn` calls in one turn with intentionally different visible outcomes:

1. **Normal success spawn**
   - a narrow prompt expected to complete cleanly with a short result
2. **Warning/degraded spawn**
   - a prompt likely to exercise warning or degraded-success visibility, such as missing `return_result` fallback behavior when appropriate for the environment
3. **Longer/truncated or more verbose spawn**
   - a prompt likely to produce enough output to test preview/truncation behavior without turning the run into a broad benchmark

The exact prompts may vary slightly as long as both environments exercise the same three outcome classes:
- clean completion
- warning/error/degraded signal
- longer or noisier output preview case

## Operator steps
### Baseline run
1. Switch to the baseline branch/session where the older `pi-spawn` behavior is still available.
2. Reload the session.
3. Confirm `spawn-mode on`.
4. Run the shared 3-parallel-spawn scenario.
5. Record observations using the checklist below.

### Replacement run
1. Switch to the replacement branch/session where the repo-local `spawn` backend is active.
2. Reload the session.
3. Confirm `spawn-mode on`.
4. Run the same 3-parallel-spawn scenario.
5. Record observations using the same checklist below.

## Comparison checklist
For each environment, record concise observations for these questions.

### 1. Active-state readability
- Can the operator tell that 3 spawns are active without expanding results?
- Can the operator distinguish individual active spawns from overflow behavior?
- Is the running state visually obvious?

### 2. Completion clarity
- Can the operator tell which spawn completed successfully?
- Can the operator tell which spawn produced a warning, degraded-success, or truncation signal?
- Can the operator tell whether any spawn produced effectively empty output?

### 3. Collapsed-card usefulness
- Does each collapsed result expose a useful short preview or activity line?
- Are warning/error/truncation signals easy to notice?
- Do secondary stats stay visually secondary rather than dominating the card?

### 4. Perceived performance
- Does the replacement feel visibly slower than baseline in the same 3-parallel-spawn scenario?
- If slower, is the difference noticeable enough to threaten the PRD guardrail?

## Recording format
Use this exact comparison structure when running the flow:

### Baseline observations
- Active-state readability:
- Completion clarity:
- Collapsed-card usefulness:
- Perceived performance:

### Replacement observations
- Active-state readability:
- Completion clarity:
- Collapsed-card usefulness:
- Perceived performance:

### Verdict summary
- Better at readability?
- Better at warning/error visibility?
- Completion state clearer?
- Feels slower?
- Recommended next action:

## Findings captured before the HITL run
The following findings were established before the comparison run:
- the replacement branch now owns the `spawn` backend locally rather than through `npm:pi-spawn@0.1.0`
- the replacement inline UX now exposes explicit compact card states for:
  - queued
  - running
  - done
  - error
  - fallback
  - warning
  - truncated
  - empty
- the replacement collapsed cards now include visible warning-style badges for:
  - `[warning]`
  - `[truncated]`
  - `[no return_result]`
  - `[empty]`
- the replacement branch now includes a temporary `spawn-active` widget that:
  - appears only while spawns are active
  - shows up to 3 active spawns individually
  - collapses additional active spawns into overflow
  - removes itself automatically when active work ends

## Recorded comparison result — 2026-05-24 re-check after ISSUE-002 rework

### Scenario
- Baseline/session tested: baseline lama dari catatan HITL `ISSUE-005` pada 2026-05-24
- Replacement/session tested: session replacement saat ini pada branch `exp/pi-spawn`, setelah rework `ISSUE-002`
- Same 3-parallel-spawn flow used: yes
- Outcome mix used:
  - 1 sukses normal
  - 1 strict/fail path
  - 1 output lebih panjang

### Baseline observations
- Active-state readability: cukup, tetapi tracking paralel belum nyaman
- Completion clarity: lemah; done vs degraded masih campur
- Collapsed-card usefulness: standar
- Perceived performance: normal

### Replacement observations
- Active-state readability: lebih jelas untuk 3 spawn paralel
- Completion clarity: lebih jelas; strict fail dan fallback lebih kebaca
- Collapsed-card usefulness: lebih berguna untuk scan cepat
- Perceived performance: masih terasa sedikit lebih lambat

### Delta after ISSUE-002 rework
- Fallback vs done clearer now: yes
- Warning/error signals clearer now: yes
- Collapsed card lighter/faster to scan: yes
- Replacement still feels slower: yes

### Latest verdict summary
- Better at readability: yes
- Better at warning/error visibility: yes
- Completion state clearer: yes
- Feels slower: yes
- Recommended next action: ready to continue

## Post-ISSUE-006 perf-focused implementation note — 2026-05-24
- A plausible replacement-side overhead source was reduced in `.pi/extensions/spawn/index.ts`:
  - partial streaming updates are now batched instead of forcing a UI update on every delta
  - the streaming preview is now computed once per flush and reused by both the inline running card and the active-spawn widget
- This change keeps the public `spawn` contract and current readability states intact.

## Recorded HITL re-test after ISSUE-006 — 2026-05-24

### Scenario
- Replacement/session tested: `exp/pi-spawn` current session with the local replacement backend
- Reloaded before test: no
- `spawn-mode on` confirmed: yes
- Same 3-parallel-spawn flow used: yes

### Observations
- Active-state readability: lebih jelas; 3 task paralel lebih mudah diikuti
- Completion clarity: lebih jelas; strict-fail vs degraded fallback lebih kebaca
- Collapsed-card usefulness: bagus untuk scan cepat tanpa expand
- Perceived performance vs previous replacement build: sedikit lebih baik; scan terasa lebih ringan
- Perceived performance vs baseline: masih sedikit lebih lambat

### Perf-focused delta check
- Running-state UI feels lighter during streaming: yes
- Parallel activity feels smoother to scan: yes
- Replacement still feels slower than baseline: yes
- Severity: slight

### Latest verdict summary
- Readability still better than baseline: yes
- Completion clarity still better than baseline: yes
- Performance caveat still open: yes
- Recommended next action: needs another AFK perf pass

## Second perf-focused implementation note — 2026-05-24
- A second narrow perf pass was implemented in `.pi/extensions/spawn/index.ts`:
  - the partial streaming preview buffer was reduced to a smaller tail window
  - the minimum partial-update interval was raised to 100ms
  - partial tool updates now send only the compact preview text rather than the larger preview buffer payload
- This keeps the public `spawn` contract and the current readability states intact.

## Final HITL re-check after second perf pass — 2026-05-24

### Preconditions
- Reloaded before test: yes
- `spawn-mode on` confirmed: yes
- Current branch/session: `exp/pi-spawn` / current session
- Same 3-parallel-spawn flow used: yes

### Scenario notes
- Outcome 1: normal non-strict spawn produced a short result, but still went through fallback/degraded-success because the child did not actually call `return_result`
- Outcome 2: `strictResult` spawn produced an explicit fail path with clear strict warning/failure signaling
- Outcome 3: verbose spawn produced longer output with a preview/collapsed summary that still scanned quickly

### Observations
- Active-state readability: bagus; 3 spawn paralel lebih mudah dibedakan
- Completion clarity: jelas; fallback vs strict fail lebih kebaca
- Collapsed-card usefulness: lebih berguna; preview dan status badge cukup ringkas
- Running-state feel during streaming: lebih ringan dibanding build replacement sebelumnya
- Parallel activity smoothness: lebih mulus untuk discan
- Perceived performance vs baseline: kurang lebih setara; jika ada gap, terasa kecil

### Performance verdict
- Still slower than baseline: no
- Remaining gap acceptable for broader sign-off: yes

### Final branch verdict
- Readability better than baseline: yes
- Completion clarity better than baseline: yes
- Performance guardrail satisfied: yes
- Recommended next action: ready for broader sign-off

### Optional note
- Surprising observation: strict child output can still expose fallback-style JSON-like content when `return_result` is not called, but the current UX now distinguishes that clearly from true successful completion

## Status
Status: **comparison recorded; guardrail satisfied for current branch scope; ready for broader sign-off**

## Decision impact
This flow now has:
- the original comparison result
- two narrow perf-focused implementation passes
- a final HITL re-check after fresh reload

Current outcome:
- readability and completion clarity remain better than baseline
- the perceived-performance gap is no longer reported as a blocker in the shared 3-parallel-spawn scenario
- the PRD performance guardrail is satisfied for the current branch scope
