# `pi-spawn` Branch Guide

## Status
This repository currently treats `pi-spawn` as an **experiment branch workflow**, not a final platform decision.

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
