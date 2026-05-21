# prototype-me

Project-local Pi skill for Phase 3 prototyping.

## Purpose

Use this skill when the project needs exploratory prototypes before PRD writing or implementation. It helps compare multiple approaches, capture tradeoffs, and record exactly one winning direction under `docs/prototype/` so later agents can build from concrete examples instead of abstract descriptions.

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

Then provide a prompt with a real UI, architecture, or integration decision and verify that the agent:
1. inspects local context first
2. defines the prototype objective clearly
3. creates multiple distinct variations
4. documents strengths, weaknesses, and risks for each option
5. updates `docs/prototype/comparison.md` with exactly one winner when prototyping is used
6. does not recommend PRD while multiple competing directions remain active
7. recommends the next phase clearly
