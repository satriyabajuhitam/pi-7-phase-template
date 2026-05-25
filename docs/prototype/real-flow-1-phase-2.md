# Real Flow 1 — Phase 2 spawn experiment

## Objective
Run one real `pi-spawn` workflow using the local `7-phase` spawn conventions and evaluate whether the result is usable, evidence-first, and handoff-safe.

## Flow summary
- Current phase: **Phase 2 — Research**
- Artifacts used:
  - `docs/research.md`
  - `docs/prototype/validation.md`
  - `docs/prototype/spawn-conventions.md`
- Mode: **single spawn**
- Parent completion signal: `flow-ok`

## Result
Status: **passed**

Observed:
- the parent agent called `spawn` successfully
- the sub-agent read the intended repo artifacts
- the sub-agent returned the requested section structure:
  - `Summary`
  - `Confirmed findings`
  - `Open questions`
  - `Recommended next step`
- the parent agent completed with the exact success marker `flow-ok`

## Output quality assessment
### What worked well
- The output stayed grounded in repo artifacts under `docs/`
- The output was synthesis-oriented rather than a raw dump
- The sub-agent distinguished confirmed findings from unverified assumptions
- The output cited file paths and section names consistently
- The flow was safe: no file edits, no drift into implementation

### What was weaker than expected
- The output was still somewhat long for a handoff artifact
- It cited section names, but not line numbers
- The task stayed slightly meta: it reviewed the state of the experiment rather than solving a narrower project question inside the repository workflow

## Key findings from the flow
- `pi-spawn` conventions are strong enough to produce a structured evidence-first answer on real repo artifacts
- The main risk is now **prompt sharpness**, not runtime capability
- Narrower objectives will likely produce better handoff quality than broad “validate the state” prompts

## Decision impact
This flow increases confidence in **Prototype 2**:
- upstream `pi-spawn` works here
- local conventions are usable in a real branch-local run
- the next improvement should target prompt specificity, not custom extension work

## Recommended next step
Run a second real flow with a **more concrete phase task**, for example:
- assess whether current prototype artifacts are ready to move toward PRD, or
- prepare a concise planning brief from one specific artifact pair instead of reviewing the whole experiment state
