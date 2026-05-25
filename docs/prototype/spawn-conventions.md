# `7-phase` Spawn Conventions

## Objective
Define lightweight prompt conventions for using upstream `pi-spawn` inside this repository's `7-phase` workflow.

## Design goals
- Keep parent-agent context lean
- Make sub-agent tasks phase-aware
- Anchor every spawn on repo artifacts under `docs/`
- Prefer synthesis over raw dumps
- Make output predictable enough for handoff

## Core rules
1. **Always state the current phase**
   - Example: `Current phase: Phase 2 — Research`
2. **Always ground the sub-agent in repo artifacts**
   - Prefer file references like `docs/idea.md`, `docs/prd.md`, `docs/issues.md`, `docs/qa.md`
3. **State the decision to be made**
   - Not just “look around”, but “identify blockers before PRD”, “prepare execution context for one ticket”, etc.
4. **Require evidence-first output**
   - Cite paths, sections, and line numbers when relevant
5. **State scope and out-of-scope explicitly**
   - Prevent the sub-agent from wandering into adjacent phases
6. **Prefer read/analyze/summarize tasks first**
   - Do not ask sub-agents to edit repo artifacts unless the task explicitly calls for it
7. **Use strict output contracts**
   - Say: `Return exactly these sections and no others`
   - For literal values, say: `Return exactly X. No extra words. No punctuation.`

## Delegation decision rules

### Use **single spawn** when
- one focused question needs isolated attention
- one artifact needs review
- one handoff summary is needed

### Use **parallel spawn** when
- tasks are independent
- multiple artifacts or concerns can be inspected separately
- you want comparison or triangulation

Examples:
- inspect `docs/prd.md` and `docs/issues.md` separately
- scan implementation readiness and QA risk independently

### Use **serial spawn** when
- step B depends on findings from step A
- you need scout → synthesize → act flow
- the second prompt should incorporate the first result

Examples:
- research gaps first, then write planning recommendations
- scan one ticket first, then prepare execution context for that exact ticket

## Standard output contract
Use this default unless the phase needs something stricter:

```text
Return exactly these sections and no others:
- Summary
- Evidence
- Risks
- Recommended next step
```

For exact machine-like outputs, use:

```text
Return exactly: <VALUE>
No extra words.
No punctuation.
```

## Prompt skeleton

```text
Current phase: <PHASE>
Objective: <WHAT DECISION OR OUTPUT IS NEEDED>
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

## Phase-specific conventions

### Phase 1 — Idea
Use spawn to pressure-test, not to finalize product requirements.

**Good use cases**
- find ambiguity in `docs/idea.md`
- identify unstated assumptions
- surface blockers before PRD

**Prompt pattern**
```text
Current phase: Phase 1 — Idea
Objective: pressure-test the current idea before PRD readiness
Primary artifacts:
- docs/idea.md

Scope:
- clarify assumptions, blockers, scope gaps
Out of scope:
- writing a PRD
- implementation planning

Task:
Read `docs/idea.md`. Identify the weakest assumptions, missing decisions, and blockers that would prevent a clean handoff to PRD.

Output contract:
Return exactly these sections and no others:
- Summary
- Evidence
- Biggest blocker
- Recommended next step
```

### Phase 2 — Research
Use spawn to isolate evidence gathering or synthesis from noisy exploration.

**Good use cases**
- inspect existing `docs/research.md`
- compare research gaps against `docs/idea.md`
- synthesize what still needs external validation

**Prompt pattern**
```text
Current phase: Phase 2 — Research
Objective: identify what evidence is still missing
Primary artifacts:
- docs/idea.md
- docs/research.md

Scope:
- confirmed findings, assumptions, open questions
Out of scope:
- implementation

Task:
Read `docs/idea.md` and `docs/research.md`. Identify what questions are already answered, what assumptions remain unverified, and what research gaps still block the next phase.

Output contract:
Return exactly these sections and no others:
- Summary
- Confirmed findings
- Open questions
- Recommended next step
```

### Phase 4 — PRD
Use spawn to review requirement quality, completeness, and ambiguity.

**Good use cases**
- find unclear requirements in `docs/prd.md`
- validate whether the PRD is ready for issues planning
- identify conflicting scope statements

**Prompt pattern**
```text
Current phase: Phase 4 — PRD
Objective: assess PRD readiness for planning
Primary artifacts:
- docs/prd.md

Scope:
- requirement clarity, gaps, readiness blockers
Out of scope:
- implementation details

Task:
Read `docs/prd.md`. Identify ambiguous requirements, missing acceptance boundaries, and anything that would make issue planning unreliable.

Output contract:
Return exactly these sections and no others:
- Summary
- Evidence
- Readiness verdict
- Recommended next step
```

### Phase 5 — Issues / planning
Use spawn to prepare vertical-slice planning insights without editing the plan directly first.

**Good use cases**
- analyze ticket dependencies
- identify parallelization opportunities
- check whether a ticket breakdown matches the PRD

**Prompt pattern**
```text
Current phase: Phase 5 — Issues
Objective: assess planning quality before execution
Primary artifacts:
- docs/prd.md
- docs/issues.md

Scope:
- dependencies, vertical slices, blockers, sequencing
Out of scope:
- executing tickets

Task:
Read `docs/prd.md` and `docs/issues.md`. Identify weak ticket boundaries, hidden dependencies, and places where the plan is too horizontal instead of vertical.

Output contract:
Return exactly these sections and no others:
- Summary
- Evidence
- Planning risks
- Recommended next step
```

### Phase 6 — Execution prep
Use spawn to prepare context for exactly one ready ticket.

**Good use cases**
- find the next ready AFK ticket
- collect implementation context before editing
- scan relevant files and likely risks

**Prompt pattern**
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
Read `docs/issues.md` and `docs/prd.md`. Identify the next ready AFK ticket and prepare a concise execution brief: objective, dependencies, likely files, and validation targets.

Output contract:
Return exactly these sections and no others:
- Ticket
- Objective
- Dependencies
- Likely files
- Validation targets
```

### Phase 7 — QA
Use spawn to isolate verification thinking from implementation context.

**Good use cases**
- derive QA scenarios from `docs/prd.md` and `docs/issues.md`
- identify edge cases not clearly covered
- prepare a human review checklist

**Prompt pattern**
```text
Current phase: Phase 7 — QA
Objective: prepare structured verification coverage
Primary artifacts:
- docs/prd.md
- docs/issues.md
- docs/qa.md

Scope:
- scenarios, edge cases, review checklist
Out of scope:
- feature implementation

Task:
Read `docs/prd.md`, `docs/issues.md`, and `docs/qa.md`. Identify missing test scenarios, risky edge cases, and human review needs.

Output contract:
Return exactly these sections and no others:
- Summary
- Missing scenarios
- Edge cases
- Recommended next step
```

## Anti-patterns
- Do not ask a sub-agent to “just explore everything”
- Do not dump long inline code into the spawn prompt when file paths are enough
- Do not use parallel spawn when prompts depend on each other
- Do not ask a sub-agent to execute more than one ticket in Phase 6
- Do not let the sub-agent drift from artifact analysis into broad implementation unless explicitly intended

## Recommended next step
Use these conventions as the baseline for the next branch-local experiments. After 3-5 real runs, record which conventions were stable and which ones should become automation later.
