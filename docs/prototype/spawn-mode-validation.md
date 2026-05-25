# Validation — `spawn-mode` + `delegate-me`

## Objective
Validate the end-to-end behavior of the local `spawn-mode` extension together with the `delegate-me` skill.

## Environment
- Branch: `exp/pi-spawn`
- Upstream package: `npm:pi-spawn@0.1.0`
- Local extension: `.pi/extensions/spawn-mode.ts`
- Local skill: `.pi/skills/delegate-me/SKILL.md`
- Test mode: Pi RPC runs against this repository

## Test cases

### 1. Mode `off` -> `delegate-me` is blocked
Status: **passed**

Observed:
- `/spawn-mode off` emitted notification: `spawn mode disabled`
- a subsequent `/skill:delegate-me ...` prompt was intercepted before skill execution
- the extension emitted notification:
  - `delegate-me is unavailable while spawn mode is off. Run /spawn-mode and choose on.`
- no conversation messages were added for the blocked skill prompt

Interpretation:
- the input guard works as intended when policy is explicitly off

### 2. Mode `on` -> `delegate-me` is allowed through the gate
Status: **passed (gate behavior)**

Observed:
- `/spawn-mode on` emitted notification: `spawn mode enabled`
- a subsequent `/skill:delegate-me ...` prompt was **not** blocked by the extension
- the skill-expanded user message entered the agent loop
- unlike the `off` case, no policy-block notification was emitted

Caveat:
- in this run, the configured model/provider did not produce a useful assistant answer for the allowed prompt, so content-generation quality was inconclusive
- however, the important gate behavior still passed: `delegate-me` was allowed through when mode was on

Interpretation:
- local policy gating is correct even though the underlying model response was not reliable in this run

### 3. Backend missing -> fallback no-spawn verdict
Status: **passed**

Setup:
- started Pi with only `.pi/extensions/spawn-mode.ts`
- intentionally omitted upstream `pi-spawn` extension loading

Observed:
- `/spawn-mode on` emitted notification:
  - `spawn backend unavailable. Reload the session or verify the project-local pi-spawn package is installed.`
- `delegate-me` was still allowed to run because policy mode remained `on`
- the skill returned a **no-spawn verdict** with policy-status explanation and a smallest next step

Interpretation:
- degraded backend behavior now fails softly to a parent-only recommendation instead of collapsing into a hard policy dead-end

## Design impact
This validation exposed and then resolved one important mismatch:
- earlier behavior forced mode back to `off` when backend was missing, which prevented `delegate-me` from returning a fallback verdict
- the extension was adjusted so `spawn-mode` can remain `on` while the backend is unavailable, allowing `delegate-me` to produce a no-spawn recommendation

## Result summary
- policy-off blocking works
- policy-on allowance works
- backend-missing fallback now works

## Recommended next step
Use this validation as the baseline for future refinement of:
- `delegate-me` prompt quality
- `spawn-mode` UX polish
- optional broader validation once model/provider reliability is less noisy
