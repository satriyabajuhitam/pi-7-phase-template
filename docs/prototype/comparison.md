# Prototype Comparison — `pi-spawn` in `7-phase`

## Prototype objective
Decide how `pi-spawn` should be explored in this repository before any PRD or custom implementation work.

## What is being compared
- **Prototype 1:** upstream `pi-spawn` only
- **Prototype 2:** upstream `pi-spawn` + local `7-phase` wrapper conventions
- **Prototype 3:** custom `7-phase` spawn extension inspired by `pi-spawn`

## Success criteria
- Reduces parent-agent context pressure
- Fits naturally with `docs/`-driven `7-phase` workflow
- Cheap to try in a branch
- Generates reusable lessons for a later PRD or extension
- Avoids premature maintenance burden

## Scope
- Experimental branch behavior
- Prompting/orchestration patterns
- Repo artifact alignment with `docs/idea.md`, `docs/research.md`, `docs/prd.md`, `docs/issues.md`, `docs/qa.md`

## Out of scope
- Productionizing a custom extension right now
- Replacing the whole 7-phase template
- Solving session continuity at the same depth as `context-mode`

## Side-by-side summary
| Prototype | Summary | Cost | `7-phase` fit | Risk | Winner status |
|---|---|---:|---:|---:|---|
| 1 | Upstream package only | Low | Medium | Low | viable but limited |
| 2 | Upstream package + local conventions | Low-Medium | High | Medium | **winner** |
| 3 | Custom local extension | High | Very high | High | not yet |

## Why each variation differs meaningfully
- **Prototype 1** tests raw package value without contamination from local design.
- **Prototype 2** tests whether lightweight repo-specific orchestration is enough.
- **Prototype 3** tests the long-term architecture direction, but only as a design target for now.

## Winner status
- **Prototype 1:** useful baseline, not the preferred direction
- **Prototype 2:** **selected winner**
- **Prototype 3:** keep as future option, not current experiment path

## Why Prototype 2 wins
- It preserves fast learning from upstream `pi-spawn`
- It fits the `7-phase` artifact model better than raw upstream use
- It avoids the premature cost of building and maintaining a custom extension
- It gives us concrete evidence about what should later be automated versus what can remain convention-based
- Initial validation already shows that upstream `pi-spawn` works here for single, parallel, and serial delegation; see `docs/prototype/validation.md`

## What should be promoted to the PRD
If this prototype proves useful, the PRD should inherit:
- phase-aware spawn prompt conventions
- expected artifact touchpoints under `docs/`
- decision rules for when to use single, parallel, or serial sub-agents
- evidence-first sub-agent output format
- the stable parts of `docs/prototype/spawn-conventions.md`

## What should remain throwaway
- Any ad-hoc prompt wording used only for exploration
- Temporary evaluation checklists that are specific to this branch run
- Any assumption that custom spawn tools are already necessary

## What remains unresolved
- How often users will actually reach for spawn during each phase
- Whether conventions are sufficient or real extension automation is needed
- Whether sub-agent output should eventually write structured handoff artifacts more directly
- How well these conventions perform once `docs/prd.md` and `docs/issues.md` contain real planning content instead of empty placeholders

## Recommended next step
For a more explicit workflow-level comparison between default parent-only work and delegation-assisted work, see:
- `docs/prototype/single-agent-vs-spawn.md`

Proceed with **Prototype 2** on branch `exp/pi-spawn`:
1. install upstream `pi-spawn` ✅
2. validate single / parallel / serial runtime behavior ✅
3. define a small set of `7-phase` spawn prompt conventions ✅
4. run a few branch-local experiments against real `docs/` artifacts
   - first exploration/research flow completed: `docs/prototype/real-flow-1-phase-2.md`
   - second planning/handoff flow completed: `docs/prototype/real-flow-2-phase-5.md`
5. capture findings before deciding on PRD or custom extension work

## Exact winner for this prototype phase
**Prototype 2 is the only winner.**

## Next phase recommendation
After the branch experiment, the best next phase is likely:
- **more prototyping** if the conventions are still unclear, or
- **PRD** if Prototype 2 yields a stable repeatable pattern
