# Prototype 1 — Upstream `pi-spawn` only

## Goal of the variation
Validate whether plain upstream `pi-spawn` is already enough to reduce context pressure in the `7-phase` template without any repo-specific customization.

## Key behavior or design choices
- Install `pi-spawn` as-is from upstream
- Do not add local extension logic yet
- Use the single `spawn` tool manually from the parent agent
- Prototype only prompt discipline and delegation patterns

## Representative usage
- Spawn one sub-agent for codebase recon
- Spawn parallel sub-agents for independent scans
- Spawn serial sub-agents when step B depends on step A

## Strengths
- Fastest path to signal
- Lowest implementation and maintenance cost
- Cleanest separation between evaluating the package and evaluating our own ideas

## Weaknesses
- Not phase-aware
- No built-in handoff to `docs/idea.md`, `docs/prd.md`, `docs/issues.md`, or `docs/qa.md`
- Results may depend too much on prompt quality from the parent agent

## Notable risks
- Could feel too generic for `7-phase`
- Success may be inconsistent across users if prompt patterns are not standardized

## When to choose it
Choose this when the main question is: "Does isolated delegation help at all in this repo?"

## Prototype plan
1. Install upstream `pi-spawn`
2. Verify `spawn` tool availability
3. Run 3 scenarios:
   - single recon task
   - parallel independent analysis
   - serial investigate-then-implement planning
4. Capture observations in `docs/prototype/comparison.md`
