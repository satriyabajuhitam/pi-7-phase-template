# Prototype Validation — `pi-spawn`

## Objective
Validate that upstream `pi-spawn` works in this repository before investing in `7-phase` prompt conventions.

## Environment
- Branch: `exp/pi-spawn`
- Package source: `npm:pi-spawn`
- Project setting: `.pi/settings.json`

## Validation checks

### 1. Install
Status: **passed**

Observed:
- `pi install -l npm:pi-spawn` succeeded
- `pi list` shows `npm:pi-spawn`
- package is present under `.pi/npm/node_modules/pi-spawn`

### 2. Tool availability
Status: **passed**

Observed:
- a non-interactive Pi run with `--tools spawn` successfully invoked the `spawn` tool
- subagent returned `spawn-ok`
- parent agent returned `verified`

### 3. Single spawn pattern
Status: **passed**

Observed:
- one parent tool call produced one isolated subagent run
- parent received synthesized output and completed normally

### 4. Parallel spawn pattern
Status: **passed**

Observed:
- one assistant message emitted two `spawn` tool calls
- both tool executions started in the same turn
- parent completed after both results returned
- confirms the expected parallel orchestration model

### 5. Serial spawn pattern
Status: **passed**

Observed:
- first `spawn` call completed in one turn
- second `spawn` call happened only after the first result returned
- parent completed after the second result returned
- confirms the expected serial orchestration model

## Findings
- `pi-spawn` is operational in this repo and ready for prototype use
- the package supports the 3 core delegation patterns we care about:
  - single
  - parallel
  - serial
- this is enough to proceed with **Prototype 2**: upstream `pi-spawn` plus local `7-phase` conventions

## Caveats
- some outputs included trailing punctuation even when the prompt asked for exact text
- prompt conventions should therefore use stricter wording such as:
  - return exactly `X`
  - no extra words
  - no punctuation

## Decision impact
This validation removes the main technical blocker for trying `pi-spawn` in `7-phase` workflows. The next useful step is to define phase-aware prompt conventions and test them against real repo artifacts under `docs/`.
