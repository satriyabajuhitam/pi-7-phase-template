---
name: prd-me
description: Write or refine docs/prd.md from project artifacts such as docs/idea.md, docs/research.md, and docs/prototype/. Use when the end state is clear enough to define product requirements before planning or implementation.
---

# PRD Me

## When to use

- The idea is already concrete enough to describe the destination clearly
- Research and prototyping are complete, or have been judged unnecessary
- The next need is a product requirements document in `docs/prd.md`
- The user wants the end state, user-visible behavior, scope, and acceptance criteria written down before planning or implementation

## Do not use when

- The idea is still vague and needs Phase 1 refinement first
- Critical external unknowns still require Phase 2 research
- Multiple major design directions still need Phase 3 prototyping
- The user actually wants implementation planning, issue breakdown, or direct coding rather than a PRD
- The main need is to sharpen or pressure-test the idea before requirements can be written; use `grill-me`
- The main blocker is missing external evidence or dependency knowledge; use `research-me`
- Multiple concrete directions still need exploratory comparison or a winning option; use `prototype-me`
- The PRD is already ready and the next step is ticket breakdown in `docs/issues.md`; use `issues-me`
- The user wants to execute implementation work rather than define requirements; use `execute-me`

---

## Workflow

### 0. Stay in PRD mode

While this skill is active:
- Do not implement product code unless the user explicitly asks to switch modes
- You may create or update `docs/prd.md`
- Focus on the end state, not the implementation journey
- Prefer user-visible behavior, requirements, edge cases, and acceptance criteria over internal technical details

### 1. Validate readiness

Before drafting the PRD, check whether Phase 4 is justified.

A PRD is justified when most of these are true:
- the problem and desired outcome are already understandable
- scope boundaries are mostly known
- the request is narrow enough for one coherent PRD, or has already been decomposed to that level
- major research unknowns are resolved or clearly non-blocking
- exactly one prototype winner exists when prototyping was used
- or prototyping was explicitly judged unnecessary

If multiple prototype directions are still active, the project is not ready for a PRD. Say so clearly and recommend returning to Phase 3.
If the request is too broad for one coherent PRD, stop and recommend decomposition before drafting rather than forcing one muddy artifact.

If the project is not ready, say so clearly and recommend the earlier phase to revisit.

### 2. Inspect local artifacts first

Before asking the user anything, inspect relevant local artifacts if they exist:
- `docs/idea.md`
- `docs/research.md`
- `docs/prototype/comparison.md`
- other files under `docs/prototype/` when needed
- existing `docs/prd.md`

Use them to extract:
- problem statement
- desired outcome
- scope and non-goals
- user-visible behaviors
- relevant research findings
- whether prototyping was unnecessary or which single prototype direction won
- known risks and open questions

Do not ask the user for information that already exists in the repo.

Use `spawn` selectively for **PRD context offloading** when artifact review or independent gap-checking would materially reduce parent-context load.

Good triggers:
- the idea, research, and prototype artifacts together are large enough that a compact recon summary would help before drafting
- an independent boundary-drift or missing-edge-case review would improve confidence
- the parent mainly needs a concise evidence-backed handoff rather than every intermediate note from artifact inspection

Preferred usage:
- use `preset: "scout"` for artifact mapping, repo recon, and evidence gathering
- use `preset: "reviewer"` for a compact check on scope boundaries, edge cases, or requirement gaps
- keep drafting and final PRD decisions in the parent; `spawn` may inform the PRD, but `docs/prd.md` remains parent-authored

### 3. Read the PRD template asset

Read `assets/prd-template.md` before writing or restructuring `docs/prd.md`.

Use it as the default shape for the document unless the repo context strongly justifies a small adjustment.

### 4. Build a PRD decision map

Before drafting in full, identify the decisions that must be clear in the PRD:
- users and actors
- core flows and expected behavior
- scope boundaries
- non-goals
- functional requirements
- edge cases
- acceptance criteria
- constraints and dependencies

If major ambiguity remains, do not bluff. Surface the uncertainty explicitly.

### 4.5 Check whether decomposition is required first

Before drafting, ask one structural question:
- is this still one coherent PRD, or is it really multiple workstreams, subsystems, or audiences bundled together?

If one PRD would become muddy, stop and recommend decomposition first.
Do not solve over-broad scope by writing a vague umbrella PRD.

### 5. Ask only high-leverage clarifying questions when needed

If the artifacts are not enough for a good PRD, ask targeted clarification questions.

Question rules:
- ask only what materially improves the PRD
- prefer one question at a time
- focus on blockers, edge cases, scope boundaries, or acceptance criteria
- do not drift into implementation design unless it directly changes the requirement

If the available context is already sufficient, draft immediately instead of interviewing unnecessarily.

### 6. Write or refine `docs/prd.md`

Write the PRD using `assets/prd-template.md` as the base structure.

Writing rules:
- describe the destination, not the journey
- focus on what users will see and how the system will behave
- write observable requirements, not implementation tasks
- keep implementation details out unless they are essential to clarify behavior or constraints
- keep the document concise but complete enough for planning
- preserve still-correct prior content when refining an existing PRD instead of blindly overwriting

### 7. Distill prototype and research outputs appropriately

When using earlier artifacts:
- promote only one winning prototype direction into the PRD
- if no prototype was needed, say that explicitly instead of inventing one
- include only research findings that materially affect requirements or constraints
- do not dump raw research notes or all prototype variants into the PRD

### 7.5 Run a short PRD self-review before handoff

Before recommending planning or closing the PRD session, run a short self-review against the written draft:
- ambiguity scan — are any key requirements still vague enough to produce materially different implementations?
- contradiction scan — do any sections conflict on scope, behavior, constraints, or acceptance expectations?
- missing-edge-case scan — is any materially important failure mode or business rule still absent?

If the self-review finds a real blocker, do not bluff.
Either fix the draft, ask one targeted clarifying question, or mark the issue explicitly in `Open questions` or `## Handoff to Issues`.

### 8. Recommend the next phase

Close by stating which next step is best:
- issue or kanban breakdown
- implementation
- more research
- more prototyping
- validation or stakeholder review

Before recommending planning, update `## Handoff to Issues` in `docs/prd.md` with:
- a concise handoff checklist
- confirmation that the draft survived ambiguity, contradiction, and missing-edge-case review well enough for planning
- `Planning approval: approved for issues planning (correctness and scope)` once that review/approval pass is actually complete
- `Ready for next phase: yes/no`
- `Primary blocker` whenever readiness is `no`

Do not recommend planning or `issues-me` when `## Handoff to Issues` is missing or still says `Ready for next phase: no`.
Do not recommend planning when the request still needs decomposition into smaller PRD-sized work.
In those cases, route the user back to the blocker, the decomposition step, the remaining gap, or the earlier phase that best resolves it.

Prefer issue or kanban breakdown via `issues-me` as the default handoff after a solid PRD unless the user explicitly wants a different path.

Be specific about why.

---

## Default questioning order

Use this order as a starting point:

1. What user or business problem must this PRD solve?
2. What should users see and experience when this is done well?
3. What is in scope for this phase, and what is explicitly out?
4. Which edge cases or business rules must be captured now?
5. What acceptance criteria would prove the outcome is correct?
6. What is the best next phase once the PRD is written?

---

## Gotchas

- Do not turn the PRD into an implementation plan.
- Do not anchor the document around modules, file paths, or code snippets.
- Do not skip readiness checks and force a PRD too early.
- Do not write a PRD from multiple competing prototype directions.
- Do not force multiple workstreams or subsystems into one vague umbrella PRD when decomposition is the real need.
- Do not ignore unresolved edge cases that materially change behavior.
- Do not copy raw research or prototype notes into the PRD.
- Do not leave scope and non-goals implicit.
- If key ambiguity remains, either ask or mark it clearly in `Open questions`.

---

## Verification

Minimum smoke test:

```bash
/reload
/skill:prd-me
```

A good run of this skill produces:

**Opening:**
> States whether the project is ready for Phase 4 and identifies the source artifacts being used.

**During drafting:**
> Uses `assets/prd-template.md`, focuses on end-state behavior, and asks only high-leverage clarification questions when needed.

**Artifact:**
> `docs/prd.md` captures scope, non-goals, behavior, requirements, edge cases, acceptance criteria, dependencies, the recommended next step, and `## Handoff to Issues`, based on zero or one prototype winner.

**Closing:**
> Recommends whether the project should move to planning, implementation, more research, or more prototyping.

### Trigger validation

**Should trigger:**
- "Write `docs/prd.md` from `docs/idea.md`, `docs/research.md`, and `docs/prototype/comparison.md`."
- "Draft a PRD for this feature based on the existing idea and prototype artifacts."
- "Refine `docs/prd.md` and close the most important requirement gaps only."

**Should not trigger:**
- "Grill me on this idea before we decide what the requirements should be." → use `grill-me`
- "Research the provider constraints before we write the PRD." → use `research-me`
- "Prototype two flows before we commit to a direction." → use `prototype-me`
- "Break this PRD into tickets in `docs/issues.md`." → use `issues-me`
- "Implement the next ready ticket." → use `execute-me`

**Borderline:**
- "The idea is mostly clear, but one edge case still feels fuzzy; can you draft the PRD?" → use `prd-me` if the ambiguity is non-blocking or can be called out explicitly in `Open questions`; otherwise return to the earlier phase that resolves it

### Artifact verification

If the session writes or refines the PRD:
- verify the file path is exactly `docs/prd.md`
- verify the structure follows `assets/prd-template.md` unless a small justified adjustment was made
- verify the document focuses on user-visible behavior, scope, non-goals, requirements, edge cases, and acceptance criteria rather than implementation tasks
- verify the session stopped for decomposition when the request was too broad for one coherent PRD
- verify `## Handoff to Issues` is present when `docs/prd.md` is the active artifact
- verify the handoff reflects ambiguity, contradiction, and missing-edge-case review before planning
- verify `Planning approval: approved for issues planning (correctness and scope)` is present before the PRD is handed to planning
- verify `Ready for next phase: yes/no` is explicit in that handoff section
- verify `Primary blocker` is present whenever readiness is `no`
- verify only zero or one prototype winner is promoted into the PRD
- verify relevant research findings are distilled rather than copied as raw notes
- verify no unrelated implementation files were edited
- verify the closing recommendation points to the correct next phase, usually `issues-me` for planning when the PRD is solid

### Smoke test

1. `/reload`
2. `/skill:prd-me`
3. Give a prompt such as: `Write docs/prd.md from docs/idea.md, docs/research.md, and docs/prototype/comparison.md`
4. Verify that the agent:
   - checks readiness first
   - inspects local artifacts before asking questions
   - uses `assets/prd-template.md`
   - refuses to proceed when multiple prototype directions are still active
   - writes a PRD focused on user-visible behavior and requirements
   - avoids turning the document into an implementation plan
   - recommends the next phase clearly
