---
name: delegate-me
description: Decide whether a task in this repository should use spawn, choose single/parallel/serial delegation when appropriate, and return a concise artifact-grounded handoff. Use when delegation is helpful but the correct orchestration mode is not yet obvious.
---

# Delegate Me

## When to use

- The user wants help deciding whether to use `spawn`
- A task would benefit from isolated analysis before the parent acts
- The current phase needs a readiness check, blocker diagnosis, execution-prep brief, or independent artifact review
- The parent wants a narrow delegation plan instead of immediately spawning ad hoc prompts
- The repo is using the local `spawn-mode` policy and delegation should stay disciplined

## Do not use when

- The parent already knows the exact implementation or exact file edit
- The task is small, obvious, and faster to do directly
- The work is primarily direct editing rather than separate analysis
- The task is a final HITL judgment that should remain with the parent
- Missing or empty artifacts already make the blocker obvious without extra delegation
- The user asked for direct execution rather than delegation planning

---

## Workflow

### 0. Stay orchestration-first

While this skill is active:
- do not jump straight into `spawn`
- first decide whether delegation is warranted at all
- prefer the smallest correct action
- treat `spawn` as a **context-offloading tool** whose main value is keeping the parent session smaller without materially reducing quality
- when a task is context-heavy but still analysis-first, lean toward the narrowest spawn mode that preserves parent clarity

### 1. Check delegation readiness

Before doing anything else:
- verify whether delegation is allowed by current repo policy
- inspect `.pi/extensions/spawn-mode.ts` when relevant so you follow the real local gate behavior
- treat local `spawn-mode` as the operational source of truth for whether delegation is allowed
- if `spawn-mode` is off, stop and tell the user to enable it first with `/spawn-mode`
- if the `spawn` tool is unavailable, stop and tell the user to reload or verify the local spawn backend is loaded

Use the current policy and wording from:
- `.pi/extensions/spawn-mode.ts`

If delegation is unavailable, return a **no-spawn verdict** instead of pretending the workflow can continue.

### 2. Identify the current phase

Determine the relevant `7-phase` context from:
- the user request
- current repo artifacts under `docs/`
- current execution state if the task clearly belongs to Phase 6 or Phase 7

If the phase is unclear, infer the smallest plausible phase and say so.

### 3. Inspect local artifacts first

Before recommending or running delegation, inspect the smallest relevant local artifacts.

Typical sources:
- `docs/idea.md`
- `docs/research.md`
- `docs/prd.md`
- `docs/issues.md`
- `docs/qa.md`
- `docs/prototype/`

Extract:
- what decision is actually needed
- whether prerequisite artifacts exist and are non-empty
- whether the task is blocked before delegation would help
- whether the request is best served by no spawn, single spawn, parallel spawn, or serial spawn

### 4. Choose one delegation verdict

Pick exactly one:
- `No spawn`
- `Single spawn`
- `Parallel spawn`
- `Serial spawn`

Do not hedge across multiple modes unless the user explicitly asked for alternatives.

### 5. Read the helper assets

Before constructing a recommendation or spawn prompt, read:
- `assets/phase-playbook.md`
- `assets/prompt-skeleton.md`
- `assets/output-contracts.md`

If local policy behavior matters for the current task, also read:
- `.pi/extensions/spawn-mode.ts`

Use them as the default operating baseline.

### 6. Build the narrowest correct plan

If the verdict is **No spawn**:
- explain why delegation is unnecessary or blocked
- recommend the smallest next step

If the verdict is **Single / Parallel / Serial**:
- state why that mode fits
- identify the exact artifacts that should ground the sub-agent(s)
- choose the strictest useful output contract
- keep the delegated scope narrow

### 7. Run delegation only when it is actually needed

When the verdict is a spawn mode and the user wants execution rather than just advice:
- run the smallest useful spawn workflow
- keep the task read/analyze/summarize-first by default
- do not ask sub-agents to edit repo artifacts unless the task explicitly requires it and the user has moved beyond planning/orchestration

### 8. Return a parent-level handoff

Always return a concise parent judgment that says:
- what delegation verdict was chosen
- why
- what artifacts were involved
- what the result means
- what should happen next

The parent remains the final authority.

---

## Core decision rules

### Choose **No spawn** when

- the task is one small coherent action
- the parent already knows the exact implementation or edit
- the work is mostly direct file editing
- the blocker is already obvious from missing artifacts
- the task needs a human decision, not sub-agent analysis
- delegation would add more coordination overhead than parent-context savings

### Choose **Single spawn** when

- one focused question needs isolated attention
- one artifact pair needs review
- one readiness check is needed
- one handoff summary is needed
- one compact recon/review pass would keep a context-heavy task out of the parent

### Choose **Parallel spawn** when

- tasks are independent
- separate concerns can be inspected in isolation
- no spawned result depends on another spawned result
- comparison or triangulation is more useful than one blended read
- parallel evidence gathering would materially reduce parent-context load

### Choose **Serial spawn** when

- step B depends on step A
- you need scout -> synthesize -> act
- the second prompt must incorporate the first result
- a Phase 6 brief should target one exact ready ticket chosen first
- the parent should receive progressively distilled handoffs instead of holding the full exploratory trail

---

## Phase-specific guidance

Use `assets/phase-playbook.md` as the default reference.

High-level intent:
- **Phase 1 — Idea:** mostly no-spawn or single spawn for critique
- **Phase 2 — Research:** strongest fit for single or parallel spawn
- **Phase 3 — Prototype:** keep authoring parent-led; use spawn for option review
- **Phase 4 — PRD:** write with parent, review with spawn if useful
- **Phase 5 — Issues:** author with parent, challenge/check with spawn
- **Phase 6 — Execution:** execute with parent, use spawn only for prep/recon for exactly one ready ticket
- **Phase 7 — QA:** use spawn for coverage analysis, keep final sign-off parent/HITL-led

---

## Guardrails

- Always ground spawned work in repo artifacts or explicit repo file paths
- Prefer synthesis over raw dumps
- Do not ask sub-agents to “explore everything”
- Do not dump large inline code into prompts when file paths are enough
- Do not use parallel spawn for dependent tasks
- Do not let Phase 6 delegation drift into multi-ticket execution
- Do not claim `spawn` solves session continuity or retrieval-backed memory
- Do not let the skill replace final HITL judgment
- Do not bypass local `spawn-mode` policy even if the `spawn` tool appears available
- If policy is off or backend is unavailable, fall back cleanly to a no-spawn recommendation

---

## Output rules

Read `assets/output-contracts.md` before returning your final answer.

At minimum:
- if no delegation is used, return a no-spawn verdict and smallest next step
- if delegation is used, return the chosen mode, grounded objective, artifact set, result summary, risks, and next step

Keep the final answer concise and operational.

---

## Verification

A good run of this skill should:
- decide whether delegation is useful before spawning anything
- use repo artifacts first instead of asking the user for info already in the repo
- choose exactly one mode: no-spawn / single / parallel / serial
- keep spawn prompts strict and grounded
- return a usable parent-level handoff

### Trigger examples

Should trigger:
- "Decide whether this Phase 5 task should use single, parallel, or serial spawn"
- "Prepare a safe spawn plan for reviewing docs/prd.md and docs/issues.md"
- "Use delegation only if it helps produce a one-ticket execution-prep brief"
- "Check whether spawn-mode allows delegation before using delegate-me"

Should not trigger:
- "Implement this exact file change"
- "Execute the next ready AFK ticket directly"
- "Make the final human decision on whether to promote this branch"
- "Ignore spawn-mode and force spawn anyway"
