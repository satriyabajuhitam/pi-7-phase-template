# Comparison — Single Agent vs `pi-spawn` Agent in `7-phase`

## Objective
Compare the default **single-agent** workflow against a **spawn-assisted** workflow for this repository's `7-phase` process, using the branch experiment evidence already collected.

## Comparison baseline
### Single agent means
One parent agent reads repo artifacts, decides, writes, and executes directly without delegating to isolated sub-agents.

### Spawn-assisted means
The parent agent stays in control, but offloads a narrow read/analyze/summarize task to one or more isolated sub-agents through `spawn`.

### Evidence basis
Direct branch evidence exists for the spawn-assisted side from:
- `docs/prototype/validation.md`
- `docs/prototype/real-flow-1-phase-2.md`
- `docs/prototype/real-flow-2-phase-5.md`
- `docs/prototype/real-flow-3-phase-6.md`
- `docs/pi-spawn.md`

Baseline comparison for single-agent mode is grounded in the repo's normal `7-phase` operating model and in the fact that many narrow documentation and execution updates in this branch were still done directly by the parent agent.

### Important caveat
This is **not** a controlled benchmark of token cost, latency, or model quality. It is a workflow comparison based on branch-local experiments and observed operator fit.

## Executive verdict
- **Default mode should remain single-agent.**
- **`spawn` should be treated as an augmentation tool, not a replacement architecture.**
- In this repo, `spawn` is strongest when the task is:
  - narrow
  - artifact-grounded
  - analysis-heavy
  - improved by isolation or parallel inspection
- In this repo, single-agent is strongest when the task is:
  - already well understood
  - implementation-heavy
  - editing-focused
  - dependent on one coherent end-to-end judgment by the parent

## High-level scorecard
| Criterion | Single agent | Spawn-assisted | Better default |
|---|---|---|---|
| Setup overhead | Low | Medium | Single agent |
| Works well for known tasks | High | Medium | Single agent |
| Reduces parent context pressure | Low-Medium | High | Spawn-assisted |
| Supports isolated analysis | Medium | High | Spawn-assisted |
| Supports parallel independent scans | Low | High | Spawn-assisted |
| Keeps one coherent author voice | High | Medium | Single agent |
| Good for direct file editing | High | Low-Medium | Single agent |
| Good for readiness checks / handoff briefs | Medium | High | Spawn-assisted |
| Easy to overuse | Medium | High | Single agent |
| Needs prompt discipline | Medium | High | Single agent |

## What the branch tests actually proved
### Proven directly
- upstream `pi-spawn` works in this repo and supports **single**, **parallel**, and **serial** delegation patterns (`docs/prototype/validation.md`)
- a spawn-assisted flow can produce a useful **Phase 2 research synthesis** (`docs/prototype/real-flow-1-phase-2.md`)
- a spawn-assisted flow can correctly produce a **Phase 5 planning-readiness / blocker diagnosis** (`docs/prototype/real-flow-2-phase-5.md`)
- a spawn-assisted flow can prepare **Phase 6 execution context for exactly one ready AFK ticket** (`docs/prototype/real-flow-3-phase-6.md`)
- branch-local usage rules are now stable enough to summarize in `docs/pi-spawn.md`

### Not proven directly
- that `spawn` is cheaper in token cost for every task
- that `spawn` is faster for small, obvious tasks
- that `spawn` should replace the normal single-agent rhythm
- that the branch is ready for wider standardization without more evidence

## Phase-by-phase comparison
| Phase | Single-agent sweet spot | Spawn-assisted sweet spot | Better default | Recommendation |
|---|---|---|---|---|
| Phase 1 — Idea | direct grilling, clarifying scope, converging on one direction | pressure-test an existing idea artifact for assumptions and blockers | Single agent | stay single-agent first; use one spawn only after `docs/idea.md` exists and needs critique |
| Phase 2 — Research | small familiar questions, direct note synthesis | isolate evidence gathering, compare gaps, summarize findings from `docs/research.md` | Mixed, leaning spawn for non-trivial work | use spawn when research becomes noisy or multi-source |
| Phase 3 — Prototype | drafting one option quickly | parallel review of multiple options or tradeoff analysis | Mixed | keep authoring single-agent; use spawn for comparison or critique |
| Phase 4 — PRD | writing the PRD in one coherent voice | checking ambiguity, missing acceptance boundaries, readiness blockers | Single agent for writing, spawn for review | write directly, review with spawn if needed |
| Phase 5 — Issues | breaking down PRD into vertical slices | dependency scan, blocker detection, alternate sequencing views | Mixed, leaning spawn for review | author plan directly; use spawn to challenge the plan |
| Phase 6 — Execution | actual implementation, tests, file edits, one-ticket completion | execution-prep, file recon, risk scan for exactly one ready ticket | Single agent for execution | do not delegate the whole ticket; use spawn only to prep or inspect |
| Phase 7 — QA | final judgment, sign-off, repo update | derive scenarios, edge cases, independent risk reads | Mixed | use spawn for coverage analysis, keep final sign-off single-agent |

## Where single-agent is clearly better
### 1. Known implementation work
If the parent already knows the exact change, spawning adds overhead and prompt friction.

Examples:
- updating one docs file
- applying a small code patch
- closing one ticket with obvious evidence

### 2. Final synthesis in one voice
PRD writing, issues authoring, and final HITL recommendations often benefit from one coherent author rather than stitched sub-results.

### 3. Small repo-local actions
For narrow edits, a single agent is usually faster and cheaper than packaging context for a sub-agent.

## Where spawn-assisted is clearly better
### 1. Isolating noisy analysis
When the parent risks mixing too many concerns, a sub-agent can read only the relevant artifacts and return a tighter answer.

### 2. Phase-gate and readiness checks
The branch evidence is strongest here. Spawn performed well at:
- blocker detection
- readiness judgment
- execution-prep handoff

### 3. Parallel independent inspection
Single-agent mode cannot truly split independent review tracks. Spawn can do that when tasks do not depend on each other.

### 4. Scout → synthesize flows
Serial spawn is useful when step B should depend on a focused scout result from step A.

## Main tradeoffs
### Single-agent risks
- parent context can get bloated on broad tasks
- analysis and execution can blur together
- broad prompts can produce mushy outputs without explicit isolation

### Spawn-assisted risks
- prompt quality becomes critical
- weak scope boundaries cause drift
- over-delegation creates cost and orchestration noise
- output may still need parent cleanup before becoming a handoff artifact

## Practical decision rules for this repo
### Stay single-agent when
- you already know the exact implementation or document change
- the task is one small coherent action
- the task needs direct editing more than separate analysis
- the task is HITL and needs a single accountable judgment

### Use one spawn when
- you need one focused read/analyze/summarize pass
- the task can be grounded in `docs/` artifacts
- you want a concise readiness brief, blocker diagnosis, or evidence summary

### Use parallel spawn when
- tasks are independent
- you want multiple isolated reads before comparing them
- no spawned result depends on another

### Use serial spawn when
- the second step depends on the first result
- you need scout → synthesize → act
- you need one ready-ticket selection before execution-prep for that exact ticket

### Return to single-agent after spawn when
- the analysis is complete
- a repo artifact now needs to be written or updated
- the final judgment should stay with the parent agent

## Recommended operating model
For this `7-phase` repo, the strongest pattern is:
1. **start single-agent by default**
2. **escalate to spawn only for narrow artifact-grounded analysis**
3. **return to single-agent for writing, execution, and final judgment**

That gives the best balance between:
- low overhead
- cleaner parent context
- reusable handoff summaries
- minimal risk of turning the workflow into unnecessary multi-agent theater

## Final recommendation
For this repository, the best comparison conclusion is:
- **single-agent remains the primary workflow**
- **spawn is a high-value supporting capability**
- **spawn adds the most value in Phase 2, Phase 5 review, and Phase 6 execution-prep**
- **spawn adds the least value for tiny edits, obvious tasks, and final HITL judgment**

In short: use `spawn` to improve the `7-phase` workflow's **analysis quality and context hygiene**, not to replace the workflow's core single-agent execution model.
