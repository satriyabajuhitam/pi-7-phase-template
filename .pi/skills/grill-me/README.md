# grill-me

A Pi skill for stress-testing plans and designs through high-leverage questioning.

## Purpose

Use this skill when you want the agent to refine an early idea or challenge a plan, design, architecture, migration, bug fix, refactor, or proposal, clarify decisions, expose risks, and walk through unresolved branches one at a time before research, prototyping, or implementation.

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

Then provide a prompt with a short idea, feature, bug-fix plan, refactor, or design and verify that the agent:
1. asks one question at a time
2. gives a recommended answer
3. does not jump into implementation for prompts like `build a Pi extension that adds /workflow:name`
4. helps clarify problem, scope, assumptions, and next phase
5. does not ask for information already available in the codebase
6. respects `CONTEXT.md` or relevant ADRs when they exist
7. updates `docs/idea.md` with distilled session notes when requested
8. ends with a concise summary when the major decisions are resolved
