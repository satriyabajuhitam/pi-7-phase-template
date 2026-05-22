# Prompt Skeletons

Use these as default shapes. Tighten them further when the task needs a stricter contract.

Preflight before using any skeleton:
- verify local `spawn-mode` policy allows delegation
- verify the `spawn` tool is actually available
- if either check fails, do not spawn; return a no-spawn verdict instead

## Single spawn

```text
Current phase: <PHASE>
Objective: <ONE FOCUSED DECISION OR OUTPUT>
Primary artifacts:
- <PATH 1>
- <PATH 2>

Scope:
- <IN SCOPE>
Out of scope:
- <OUT OF SCOPE>

Task:
<SELF-CONTAINED TASK>

Output contract:
Return exactly these sections and no others:
- Summary
- Evidence
- Risks
- Recommended next step

Evidence requirements:
- Cite file paths
- Cite sections or line numbers when relevant
- Distinguish confirmed findings from assumptions
```

## Parallel spawn

Use only for independent tasks.

### Prompt A
```text
Current phase: <PHASE>
Objective: inspect concern A independently
Primary artifacts:
- <PATHS FOR A>

Scope:
- concern A only
Out of scope:
- concern B
- final merged recommendation

Task:
<INSPECT A>

Output contract:
Return exactly these sections and no others:
- Summary
- Evidence
- Risks
```

### Prompt B
```text
Current phase: <PHASE>
Objective: inspect concern B independently
Primary artifacts:
- <PATHS FOR B>

Scope:
- concern B only
Out of scope:
- concern A
- final merged recommendation

Task:
<INSPECT B>

Output contract:
Return exactly these sections and no others:
- Summary
- Evidence
- Risks
```

Parent merge step:
- compare both results
- produce the final recommendation in the parent

## Serial spawn

### Step A — Scout
```text
Current phase: <PHASE>
Objective: identify the exact target for the next step
Primary artifacts:
- <PATHS>

Scope:
- finding the next target only
Out of scope:
- implementation or final broad planning

Task:
<SCOUT TASK>

Output contract:
Return exactly these sections and no others:
- Summary
- Evidence
- Recommended target
```

### Step B — Focused follow-up
```text
Current phase: <PHASE>
Objective: act on the exact target identified in step A
Primary artifacts:
- <PATHS>

Scope:
- the exact target from step A only
Out of scope:
- alternative targets
- multi-ticket work

Task:
<FOCUSED FOLLOW-UP>

Output contract:
Return exactly these sections and no others:
- Summary
- Evidence
- Risks
- Recommended next step
```

## Phase 6 execution-prep skeleton

```text
Current phase: Phase 6 — Execution
Objective: prepare execution context for one ready AFK ticket
Primary artifacts:
- docs/issues.md
- docs/prd.md

Scope:
- one ready ticket only
Out of scope:
- executing multiple tickets

Task:
Read `docs/issues.md` and `docs/prd.md`. Identify the next ready AFK ticket and prepare a concise execution brief.

Output contract:
Return exactly these sections and no others:
- Ticket
- Objective
- Dependencies
- Likely files
- Validation targets
```
