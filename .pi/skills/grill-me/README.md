# grill-me

A Pi skill for stress-testing plans and designs through high-leverage questioning.

## Purpose

Use this skill when you want the agent to refine an early idea or challenge a plan, design, architecture, migration, bug fix, refactor, or proposal, clarify decisions, expose risks, and walk through unresolved branches one at a time before research, prototyping, or implementation.

## Use a different skill when

- you mainly need to route a new request to the right phase or artifact → `triage-me`
- a bug or regression still needs reproduction, isolation, or hypothesis testing → `diagnose-me`
- the idea is already clear enough that the next step is writing `docs/prd.md` → `prd-me`

## Example prompts

- Grill me on this app idea before I do research.
- Help me refine this feature before prototyping.
- Stress-test this rollout plan.
- Challenge my design assumptions.
- Interview me about this bug-fix approach until the gaps are clear.
- Poke holes in this refactor idea.

## Usage

```bash
/skill:grill-me
```

Use the Pi skill command form above. ` /grill-me ` is not the documented Pi skill invocation syntax.

Or trigger it naturally with prompts such as:
- "Grill me on this idea"
- "Help me refine this feature"
- "Challenge this design"
- "Stress-test this proposal"
- "Poke holes in this rollout plan"

## Expected behavior

- asks one question at a time
- provides a recommended answer
- stays in grilling mode even if the prompt contains words like "build" or "create"
- helps turn a vague idea into a concrete problem statement, scope, assumptions, and next step
- does not start implementing or editing implementation files unless the user explicitly asks to switch modes
- may maintain `docs/idea.md` as the written artifact for the grilling session when requested or when that file already exists as the obvious destination
- checks the codebase first when local evidence can answer a question
- uses `CONTEXT.md` or relevant ADRs as constraints when they already exist in the repo
- sharpens vague domain language instead of letting overloaded terms slide
- ends with a summary of decisions, risks, open questions, and whether research or prototyping is needed

## Smoke test

```bash
/reload
/skill:grill-me
```

Then verify behavior with these prompts:

**Should trigger**
- `Grill me on this app idea before I do research.`
- `Poke holes in this refactor plan.`
- `Stress-test this rollout proposal.`

**Should not trigger**
- `Route this vague request to the right phase and artifact.`
- `Help me reproduce and isolate this flaky failure.`
- `Turn this finalized idea into docs/prd.md.`

**Borderline**
- `I have a bug-fix idea; challenge the approach before we touch the code.`

For a successful run, verify that the agent:
1. asks one question at a time unless the user explicitly asks for express mode
2. gives a recommended answer with tradeoffs
3. does not jump into implementation for prompts like `build a Pi extension that adds /workflow:name`
4. helps clarify problem, scope, assumptions, and next phase
5. does not ask for information already available in the codebase
6. respects `CONTEXT.md` or relevant ADRs when they exist
7. updates `docs/idea.md` with distilled session notes when requested
8. writes only to `docs/idea.md` when using an artifact, not unrelated files
9. keeps the idea artifact aligned to the repo structure rather than dumping a raw transcript
10. ends with a concise summary and a correct next-phase recommendation
