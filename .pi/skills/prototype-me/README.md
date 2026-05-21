# prototype-me

Project-local Pi skill for Phase 3 prototyping.

## Purpose

Use this skill when the project needs exploratory prototypes before PRD writing or implementation. It helps compare multiple approaches, capture tradeoffs, and record exactly one winning direction under `docs/prototype/` so later agents can build from concrete examples instead of abstract descriptions.

## Use a different skill when

- you still need to pressure-test or sharpen the idea before exploring concrete variants → `grill-me`
- the main blocker is external evidence gathering → `research-me`
- the direction is already clear enough to formalize in `docs/prd.md` → `prd-me`
- you want to execute a ready implementation ticket rather than explore throwaway alternatives → `execute-me`

## Usage

```bash
/skill:prototype-me
```

Example prompts:
- `Prototype three variations for the onboarding flow and compare them in docs/prototype/`
- `Create prototype options for this architecture decision and pick a current leader`
- `Explore two integration-flow approaches for the payment callback and summarize the tradeoffs`

## Expected behavior

- checks local project artifacts first
- decides whether prototyping is actually needed
- defines a concrete prototype objective and decision criteria
- creates 2-3 meaningfully different variations by default
- may use isolated throwaway code or routes when runnable exploration is useful
- keeps prototype output separate from final production implementation
- writes concise notes under `docs/prototype/`
- maintains `docs/prototype/comparison.md` with tradeoffs, exactly one winner when prototyping is used, what should be promoted to the PRD, unresolved questions, and next-step recommendation

## Suggested `docs/prototype/` artifacts

- `prototype-1.md`
- `prototype-2.md`
- `prototype-3.md` when useful
- `comparison.md`

## Smoke test

```bash
/reload
/skill:prototype-me
```

Then verify behavior with these prompts:

**Should trigger**
- `Prototype three variations for the onboarding flow and compare them in docs/prototype/`
- `Explore two architecture options for this feature boundary and summarize the tradeoffs`
- `Create prototype options for this integration flow before we write the PRD`

**Should not trigger**
- `Grill me on this idea before we decide whether to prototype anything.`
- `Research the provider constraints before we try any integration prototypes.`
- `Turn this chosen direction into docs/prd.md.`
- `Implement the next ready ticket from docs/issues.md.`

**Borderline**
- `Build one quick spike for this UX idea so we can see if it feels right.`

For a successful run, verify that the agent:
1. inspects local context first
2. defines the prototype objective clearly
3. creates multiple distinct variations by default, or explicitly frames a single requested option as a targeted spike
4. documents strengths, weaknesses, and risks for each option
5. updates `docs/prototype/comparison.md` with exactly one winner when prototyping is used
6. keeps prototype output separate from unrelated production implementation work unless runnable exploratory code was explicitly requested
7. does not recommend PRD while multiple competing directions remain active
8. recommends the next phase clearly
