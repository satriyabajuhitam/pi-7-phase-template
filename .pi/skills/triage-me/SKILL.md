---
name: triage-me
description: Triage an incoming bug report, feature request, refactor idea, QA finding, or half-specified work item into the right local artifact and next phase. Use when the user wants to decide what should happen next before planning, execution, or deeper investigation.
---

# Triage Me

## When to use

- A new bug report, feature request, refactor proposal, or QA finding arrives
- The user wants to know whether something is ready for PRD, planning, or execution
- A work item is too vague to place directly into the normal 7-phase flow
- The repo needs a local-first intake step without relying on GitHub Issues or external trackers
- QA fallout needs to be routed back into the workflow cleanly

## Do not use when

- The user already knows the correct phase and wants to run it directly
- `docs/prd.md` is already clear and the user wants a full ticket breakdown; use `issues-me`
- `docs/issues.md` already has a ready AFK ticket and the user wants implementation; use `execute-me`
- The task is a full research pass, prototype exploration, PRD draft, or QA plan rather than intake routing

---

## Workflow

### 0. Stay in triage mode

While this skill is active:
- Do not implement product code
- Do not jump straight into a later phase without explaining why
- You may update the most appropriate local artifact when the destination is obvious or the user asks for it
- Keep the result concise: classification, state, destination, and next step

### 1. Inspect local context first

Before asking the user anything, inspect the relevant local artifacts if they exist:
- `docs/qa.md`
- `docs/issues.md`
- `docs/prd.md`
- `docs/research.md`
- `docs/idea.md`
- `docs/prototype/comparison.md`

Use them to determine:
- whether this item is already in scope
- whether a matching ticket or prior decision already exists
- whether the item is new scope versus fallout from existing scope
- which phase or artifact should own it next

Do not ask the user for information that is already in the repo.

### 2. Classify the intake item

Classify the item as one of:
- `bug`
- `enhancement`
- `refactor`
- `process/question`

Then recommend exactly one triage state:
- `needs-info`
- `needs-repro`
- `needs-idea`
- `needs-research`
- `needs-prototype`
- `needs-prd`
- `needs-planning`
- `ready-for-execution`
- `hitl`
- `wont-do`

State names are local triage recommendations, not issue-tracker labels.

### 3. Reproduce bugs before routing them

If the item is a `bug`, attempt a lightweight reproduction before recommending a next phase.

Use the smallest reliable checks available:
- read the reported steps and compare them with current requirements
- inspect the relevant code paths
- run targeted tests or commands when safe and relevant

Then report one of:
- `reproduced`
- `not reproduced`
- `cannot reproduce from current information`

Routing guidance:
- confirmed repro with clear scope often means `needs-planning` or `ready-for-execution`
- unclear or missing repro details usually means `needs-info` or a recommendation to use `diagnose-me`
- suspected external dependency uncertainty may mean `needs-research`
- if lightweight repro is not enough and the bug still needs a disciplined loop, recommend `diagnose-me`

### 4. Route to the right local artifact

Pick the smallest correct destination.

Default routing:
- unclear request or early proposal -> `docs/idea.md`
- external dependency or factual uncertainty -> `docs/research.md`
- competing UX/architecture directions -> `docs/prototype/`
- new or changed user-visible requirements -> `docs/prd.md`
- PRD is clear but work is not yet ticketed -> `docs/issues.md`
- existing-scope implementation follow-up already fits the plan -> `docs/issues.md`
- purely human judgment or approval gate -> `HITL` recommendation in `docs/issues.md` or user-facing recommendation
- rejected item with durable reasoning -> explain `wont-do` clearly and do not create fake execution work

For QA fallout:
- reopen an existing ticket if the original ticket scope is still correct
- add a new ticket only when the finding is truly new scope

### 5. Apply the minimum useful artifact update

If the destination is obvious or the user asks for a written outcome, update the relevant artifact.

Writing rules by destination:
- `docs/idea.md`: capture the distilled problem, scope, and open questions
- `docs/research.md`: capture the research objective and questions, not raw research
- `docs/prd.md`: record user-visible requirement changes, not implementation detail
- `docs/issues.md`: preserve local ticket conventions and keep AFK/HITL explicit

Do not spread one intake item across multiple artifacts unless a handoff really requires it.

### 6. Recommend the next phase explicitly

Close with a short triage summary containing:
- `Classification`
- `Triage state`
- `Why`
- `Destination artifact`
- `Recommended next step`

The next step should map clearly to one of:
- idea refinement
- research
- prototype
- PRD
- planning
- execution
- diagnosis
- HITL decision
- reject / defer

---

## Default decision rules

Use this order as a starting point:

1. Is this already covered by an existing requirement, ticket, or QA finding?
2. Is the item a bug, enhancement, refactor, or process question?
3. If it is a bug, can it be reproduced now?
4. What is the smallest artifact that should own the next step?
5. Is the item ready for planning or execution, or does it need an earlier phase first?
6. Is there any reason this must remain HITL?

---

## Gotchas

- Do not assume every new request should become a ticket immediately.
- Do not skip bug reproduction when a quick local check could settle the direction.
- Do not create duplicate tickets when a QA finding clearly belongs to an existing one.
- Do not dump vague requests straight into `docs/issues.md` if `docs/prd.md` is still missing or stale.
- Do not turn triage into full implementation, full research, or full PRD writing.
- Do not invent fake certainty; if information is missing, say `needs-info`.

---

## Verification

A good run of this skill produces:

**Opening:**
> States what intake item is being triaged and which local artifacts will be checked.

**During triage:**
> Classifies the item, attempts bug reproduction when relevant, and chooses exactly one local triage state.

**Artifact update:**
> Updates only the most appropriate local artifact when the destination is obvious or requested.

**Closing:**
> Gives a concise triage summary with the destination artifact and specific next step.

### Smoke test

1. `/reload`
2. `/skill:triage-me`
3. Try prompts such as:
   - `Triage this QA finding and tell me whether it belongs in docs/issues.md or needs PRD changes`
   - `Triage this bug report and decide whether it is ready for execution`
   - `Triage this feature request and route it to the right local artifact`
4. Verify that the agent:
   - checks local context first
   - classifies the item clearly
   - tries to reproduce bugs when relevant
   - routes to one artifact and one next phase
   - does not jump straight into implementation
