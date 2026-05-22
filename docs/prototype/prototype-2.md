# Prototype 2 — Upstream `pi-spawn` + local `7-phase` wrapper conventions

## Goal of the variation
Test whether upstream `pi-spawn` becomes meaningfully more useful for this repo when paired with lightweight local conventions instead of a custom extension.

## Key behavior or design choices
- Install `pi-spawn` from upstream
- Add repo-local prompt conventions for phase-aware delegation
- Keep orchestration in markdown/prompts first, not code
- Standardize how sub-agents are asked to read and write around `docs/`

## Representative usage
- Phase 1: spawn a sub-agent to pressure-test assumptions from `docs/idea.md`
- Phase 2: spawn a sub-agent to gather structured findings for `docs/research.md`
- Phase 5/6: spawn a sub-agent to scan `docs/issues.md` and propose execution context for one ticket

## Suggested local conventions
- Always include current phase in the spawn prompt
- Always cite the source artifact (`docs/idea.md`, `docs/prd.md`, `docs/issues.md`, etc.)
- Require evidence-first summaries with file paths and line refs when relevant
- Keep sub-agent output synthesis-oriented, not verbose raw dumps

## Strengths
- Still low-cost and fast to prototype
- Much better fit for `7-phase` than raw upstream use
- Lets us learn what should become a future extension, if any

## Weaknesses
- Some behavior remains convention-based rather than enforced
- More moving parts than pure upstream evaluation
- Depends on disciplined prompt design

## Notable risks
- Could create the illusion of a productized flow without real enforcement
- Prompt wrappers may become messy if too many one-off variants appear

## When to choose it
Choose this when the question is: "Can we get most of the value now with upstream `pi-spawn`, while learning what a future `7-phase` extension should automate?"

## Validation status
- Upstream `pi-spawn` install: passed
- Tool availability: passed
- Single spawn: passed
- Parallel spawn: passed
- Serial spawn: passed
- Validation notes captured in `docs/prototype/validation.md`

## Early lessons
- The runtime behavior we need is present already
- The next bottleneck is prompt quality and phase-aware conventions, not package capability
- Exact-output requests may still drift into trailing punctuation, so local prompt templates should be stricter
- Initial prompt conventions are captured in `docs/prototype/spawn-conventions.md`
- One real Phase 2 flow has now been tested and captured in `docs/prototype/real-flow-1-phase-2.md`
- One real Phase 5 flow has now been tested and captured in `docs/prototype/real-flow-2-phase-5.md`

## Prototype plan
1. Install upstream `pi-spawn` ✅
2. Validate runtime patterns (`single`, `parallel`, `serial`) ✅
3. Draft 3-5 phase-aware spawn prompt patterns ✅
4. Test at least one flow in each of these buckets:
   - exploration/research ✅ (`docs/prototype/real-flow-1-phase-2.md`)
   - planning/handoff ✅ (`docs/prototype/real-flow-2-phase-5.md`)
   - execution preparation
5. Record where conventions are enough and where real extension support would help
