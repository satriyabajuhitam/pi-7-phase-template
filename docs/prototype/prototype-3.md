# Prototype 3 — Custom `7-phase` spawn extension inspired by `pi-spawn`

## Goal of the variation
Explore a future-native direction where this repo owns a custom spawn tool tailored to the `7-phase` workflow.

## Key behavior or design choices
- Do not rely on upstream runtime behavior beyond inspiration/reference
- Build a project-local extension with phase-aware sub-agent presets
- Bake in repo artifacts and guardrails by design
- Potentially expose specialized tools like `spawn_research`, `spawn_prd`, or `spawn_execute_context`

## Representative usage
- `spawn_research_context` reads `docs/idea.md` and asks a sub-agent to identify research gaps
- `spawn_issue_context` reads `docs/issues.md` and prepares a one-ticket execution brief
- `spawn_qa_context` synthesizes current PRD/issues state for QA planning

## Strengths
- Best long-term fit if `7-phase` becomes a serious productized workflow
- Behavior can be strongly aligned with repo invariants
- Easier to enforce consistent handoff structure later

## Weaknesses
- Highest cost and complexity
- Hard to separate prototype signal from implementation effort
- Too early if we have not yet validated that spawn-style delegation is valuable here

## Notable risks
- Premature abstraction
- We may encode the wrong mental model before learning from real usage
- Maintenance burden becomes ours immediately

## When to choose it
Choose this only if upstream `pi-spawn` plus conventions clearly works, but repeated friction proves automation is justified.

## Prototype plan
1. Do not implement yet
2. Treat this as a design target, not the first experiment
3. Extract requirements from Prototype 1 and Prototype 2 findings
4. Only promote after repeated evidence that local automation is needed
