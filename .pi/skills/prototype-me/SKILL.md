---
name: prototype-me
description: Create and compare multiple prototype variations for the current project, then capture the outcomes under docs/prototype/. Use when taste, UX, architecture, or integration behavior needs to be explored before writing the PRD or implementing for real.
---

# Prototype Me

## When to use

- The team needs to explore how something should work before committing to the final design
- Taste matters and the user wants to compare multiple approaches
- The work involves UI design or behavior, architecture choices, or external service integration flows
- Concrete examples would be more useful than abstract discussion for the next phase
- The best next step is experimentation rather than PRD writing or implementation

## Do not use when

- The idea is still too vague and needs Phase 1 refinement first
- The main blocker is missing external knowledge and Phase 2 research should happen first
- The solution is already obvious and does not benefit from multiple variations
- The user wants direct production implementation instead of exploratory work
- The main need is to pressure-test or sharpen the idea before exploring concrete variants; use `grill-me`
- The main blocker is still external evidence gathering rather than exploratory comparison; use `research-me`
- The direction is already clear enough that the next step is to formalize the destination in `docs/prd.md`; use `prd-me`
- The user wants to execute a ready implementation ticket rather than explore throwaway alternatives; use `execute-me`

---

## Workflow

### 0. Stay in prototype mode

While this skill is active:
- Do not present prototype output as final production implementation
- You may create or update artifacts under `docs/prototype/`
- You may create isolated throwaway prototype code or routes when the repo supports it and the user wants runnable exploration
- Keep experiments scoped, cheap, and easy to discard or promote later

### 1. Decide whether prototyping is actually needed

Prototype when one or more of these are true:
- the user needs to impose taste on the outcome
- multiple reasonable options exist and the tradeoffs are hard to judge abstractly
- UX or behavior needs to be seen, not merely described
- an architecture or integration decision benefits from a small working spike

If prototyping is not the right next phase, say so clearly and recommend the better phase.

### 2. Inspect local context first

Before creating variations, inspect relevant local artifacts if they exist:
- `docs/idea.md`
- `docs/research.md`
- `docs/prd.md`
- existing files under `docs/prototype/`

Use them to extract:
- the decision being explored
- scope boundaries
- constraints
- known risks
- success criteria for choosing a winner

Do not ask the user for information that already exists in the repo.

### 3. Define the prototype target

Open with a short restatement of what is being prototyped.

Then define:
- `Prototype objective`
- `What is being compared`
- `Success criteria`
- `Scope`
- `Out of scope`

If the request is vague, narrow it before building variations.

### 4. Produce multiple variations by default

Unless the user explicitly wants only one, create **2-3 distinct variations**.

If the user explicitly wants only one option, treat it as a targeted prototype spike rather than a full comparison exercise, and say so clearly.

Possible prototype surfaces:
- UI layout, interaction, and behavior
- software architecture or module boundaries
- external integration flow or error-handling approach

Each variation should differ in a meaningful way, not just cosmetic wording.

Prefer:
- one conservative option
- one opinionated option
- one pragmatic hybrid when useful

### 5. Use throwaway implementation boundaries

When the repo supports runnable code and prototyping in code is the best approach:
- create the prototype in an isolated or throwaway area
- avoid entangling exploratory code with core production paths
- name prototype artifacts clearly so they can be discarded or promoted later

When runnable code is not needed or not practical:
- capture the variation as markdown in `docs/prototype/`
- include flow descriptions, tradeoffs, and representative examples

### 6. Maintain `docs/prototype/` artifacts

Default project artifacts:
- `docs/prototype/prototype-1.md`
- `docs/prototype/prototype-2.md`
- `docs/prototype/prototype-3.md` when a third option adds value
- `docs/prototype/comparison.md`

For each prototype file, capture:
- goal of the variation
- key behavior or design choices
- strengths
- weaknesses
- notable risks
- recommendation on when to choose it

In `docs/prototype/comparison.md`, capture:
- side-by-side summary of variations
- decision criteria
- winner status for each variation
- exactly one winning option when prototyping is used
- why that option wins
- what is being promoted to the PRD
- what remains unresolved
- recommended next step

If prototyping was unnecessary, say that explicitly instead of forcing a fake winner.

### 7. Distill what should be promoted

After comparing variations, state clearly:
- which single option wins and why
- what should be promoted into the PRD
- what should remain throwaway
- what still needs validation

A PRD must not inherit multiple competing directions. Concrete prototype output is more valuable than abstract preference language.

### 8. Recommend the next phase

Close by stating which next step is best:
- more prototyping
- research
- PRD
- implementation
- validation

Only recommend PRD when there is exactly one prototype winner or when prototyping was not needed.

Prefer PRD via `prd-me` as the default handoff after a useful prototype pass, because the winning direction should normally be formalized before planning or implementation. Recommend direct implementation only when requirements are already formalized elsewhere or the user explicitly wants that path.

Be specific about why.

---

## Default questioning order

Use this order as a starting point:

1. What exact decision are we prototyping?
2. What would make one variation clearly better than another?
3. What constraints must every variation respect?
4. Which 2-3 approaches are meaningfully different?
5. What did the prototype reveal that abstract discussion would have missed?
6. What should be promoted to the next phase?

---

## Gotchas

- Do not create only one variation unless the user explicitly wants that.
- Do not mistake a prototype for a final implementation.
- Do not let exploratory code leak into core production paths without a clear decision.
- Do not compare options without stating decision criteria.
- Do not move to PRD with multiple active winners; choose one or keep prototyping.
- Do not document only aesthetics; capture behavior, tradeoffs, and risks.
- Do not keep weak or obsolete prototype conclusions unchallenged if new evidence appears.
- If the prototype cannot answer the intended question, say so and recommend the next best step.

---

## Verification

Minimum smoke test:

```bash
/reload
/skill:prototype-me
```

A good run of this skill produces:

**Opening:**
> Restated prototype objective, what is being compared, success criteria, and why prototyping is the right phase.

**During prototyping:**
> Produces 2-3 meaningfully distinct variations and keeps them isolated or clearly documented.

**Artifacts:**
> `docs/prototype/` contains per-variation notes plus `docs/prototype/comparison.md` with decision criteria, exactly one winner when prototyping is used, the promotion target for the PRD, tradeoffs, and the next-step recommendation.

**Closing:**
> States what should move forward into PRD or implementation and what should remain throwaway.

### Trigger validation

**Should trigger:**
- "Prototype three variations for the onboarding flow and compare them in `docs/prototype/`."
- "Explore two architecture options for this feature boundary and summarize the tradeoffs."
- "Create prototype options for this integration flow before we write the PRD."

**Should not trigger:**
- "Grill me on this idea before we decide whether to prototype anything." → use `grill-me`
- "Research the provider constraints before we try any integration prototypes." → use `research-me`
- "Turn this chosen direction into `docs/prd.md`." → use `prd-me`
- "Implement the next ready ticket from `docs/issues.md`." → use `execute-me`

**Borderline:**
- "Build one quick spike for this UX idea so we can see if it feels right." → use `prototype-me` if the work is explicitly exploratory and throwaway rather than intended as production implementation

### Artifact verification

If the session writes artifacts:
- verify files are written under `docs/prototype/`
- verify per-variation files describe meaningful differences rather than cosmetic rewrites
- verify `docs/prototype/comparison.md` includes decision criteria, tradeoffs, and exactly one winning option when prototyping is used
- verify the winning option clearly states what should be promoted to the PRD and what remains throwaway
- verify no unrelated production implementation files were edited unless the user explicitly wanted runnable exploratory code
- verify the closing recommendation points to the correct next phase such as more prototyping, research, PRD, or validation, with direct implementation recommended only when requirements are already clear enough outside this prototype pass

### Smoke test

1. `/reload`
2. `/skill:prototype-me`
3. Give a prompt such as: `Prototype three variations for the onboarding flow and compare them in docs/prototype/`
4. Verify that the agent:
   - checks local context first
   - defines a concrete prototype objective
   - creates multiple distinct variations, or explicitly frames a single requested option as a targeted spike
   - writes or updates `docs/prototype/` artifacts
   - identifies exactly one winner or explicitly states that prototyping was unnecessary
   - does not recommend PRD while multiple competing directions remain active
   - recommends the next phase clearly
