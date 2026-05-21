---
name: grill-me
description: Refine an idea, feature, bug fix, refactor, plan, architecture, migration, or proposal through sharp one-at-a-time questioning before research, prototyping, or implementation. Use when the user wants to be grilled, challenged, pressure-tested, or asked hard questions to make the concept concrete, sharpen tradeoffs, and expose risks.
---

# Grill Me

## When to use

- User wants to refine an early idea before research, prototyping, or implementation
- User wants to stress-test a plan, design, architecture, or proposal
- The work could be a whole app, a feature, a bug fix, or a refactor
- User asks to be grilled, challenged, or interviewed
- User says "what am I missing", "poke holes in this", "help me think this through"
- A proposal needs sharper decisions, clearer tradeoffs, or better-defined risks before moving to the next phase

## Do not use when

- User wants direct implementation without a discovery phase
- The task is already obvious and low-ambiguity, with no meaningful decision to refine
- The user only wants factual lookup or broad brainstorming rather than narrowing decisions
- The main need is to route a new work item to the right phase or artifact rather than pressure-test the idea itself; use `triage-me`
- A bug, regression, or flaky issue still needs reproduction, isolation, or hypothesis testing before decisions can be challenged; use `diagnose-me`
- The requirements are already clear enough that the next step is to formalize the destination in `docs/prd.md`; use `prd-me`

---

## Workflow

### 0. Lock into grilling mode

If the user request contains implementation verbs such as "build", "create", "add", "implement", or "make", **do not implement**.

Treat the request as a proposal seed to examine first.

While this skill is active:
- Do not create or edit implementation files
- Do not run generators or scaffolding
- Do not switch into extension-building, coding, or execution mode
- You may create or update `docs/idea.md` as the grilling-session artifact when the user asks for written output or when that file already exists as the obvious destination
- Stay in questioning mode until the user explicitly asks to stop grilling, or until you reach the exit condition and hand off to the correct next phase instead of implementing

### 1. Identify what's being examined

One of:
- Early product or project idea
- Specific feature, bug fix, or refactor proposal
- Product plan
- Technical design or architecture
- Migration or rollout plan
- Process or strategy

### 2. Open with a brief restatement + decision map

Before asking anything, do two things in a single opening message:

**a) Restate the idea or plan** in 2–4 sentences in your own words. If the input is too vague to restate, ask for a one-paragraph summary first.

**b) Show your decision map** — a short bullet list of the major open questions you've identified, grouped by category. This externalizes your mental model, lets the user correct misunderstandings early, and signals which question you'll tackle first.

Example opening:

> You're planning to migrate a monolith to microservices, starting with the auth service. Here's what I see as the key open questions:
>
> **Goals & constraints:** Success criteria, timeline, team size
> **Design:** Service boundary decisions, data ownership, API contracts
> **Dependencies:** Auth as a shared dependency, downstream impact
> **Risks:** Rollback plan, testing in production, partial migration state
>
> I'll start with the most foundational question first.

### 3. Ask one question at a time

The first real turn after the decision map must contain **exactly one question**.

Each question must:
- Target the **highest-leverage unresolved decision** — prefer foundational over detail
- Be **concrete and specific**, not rhetorical
- Ask **one thing only** — never combine

After each question, provide your **recommended answer**:
- Tailor it to the user's specific context
- Name meaningful tradeoffs if they exist
- Avoid generic advice when codebase context supports a better answer

### 4. Inspect the codebase and repo docs when relevant

If a question can be answered from local files, inspect first. Use findings to sharpen the next question. Prefer checking the repository over asking for information the user shouldn't need to repeat.

When the topic touches domain language, product concepts, or existing design decisions:
- read `CONTEXT.md` first if it exists
- read relevant files under `docs/adr/` if they exist
- use those files as constraints during grilling rather than re-asking already settled decisions
- if the area of code is unfamiliar, zoom out and map the relevant modules and major callers before drilling into details
- if the user's terminology conflicts with documented language, call it out explicitly and ask for clarification
- if a term is vague or overloaded, sharpen it with a concrete scenario before continuing
- if codebase behavior contradicts the user's description, surface the contradiction clearly

### 5. Maintain a session artifact in `docs/idea.md`

When the user asks for the grilling output to be written down, or when `docs/idea.md` already exists as the clear project artifact, maintain that file as the running record of the session.

Default structure:

- `# Idea`
- `## Problem statement`
- `## Desired outcome`
- `## Scope`
- `## Non-goals`
- `## Constraints`
- `## Assumptions`
- `## Decision map`
- `## Questions asked`
- `## Decisions made`
- `## Open questions`
- `## Need research?`
- `## Need prototype?`
- `## Biggest risk`
- `## Recommended next step`
- `## Handoff to PRD`

Update the file at these checkpoints:
- after the opening restatement + decision map
- after every 3–4 questions or category switch
- at the final closing summary

Keep the file concise and decision-oriented. Do not dump the entire transcript; record the distilled outcomes.

### 6. Summary cadence

Summarize after **every 3–4 questions**, or when switching from one category to another (e.g., moving from design to risks). Keep summaries short — 3 sections only:

- **Decided:** What's been resolved
- **Open:** Remaining unresolved branches
- **Biggest risk:** The most important thing still unvalidated

### 7. Tone

Confrontational but constructive. Push back clearly when something doesn't hold up. Never soften a real risk to be polite. Match the user's pace — if they're moving fast and loose, keep up; if they're being precise, match that precision.

---

## Default questioning order

Use this order as a **starting point**, not a checklist. Skip any step already resolved by context the user has provided — never re-ask something that's clearly established.

For Phase 1 idea refinement, prefer this order:

1. What problem are we solving?
2. What outcome should change if we solve it well?
3. What is in scope right now?
4. What is explicitly out of scope?
5. What constraints are fixed?
6. What assumptions are we making?
7. Which design options or dependency choices matter early?
8. Does this need research before we proceed?
9. Does this need prototyping before we proceed?
10. What is the smallest safe next step?

---

## Question quality rules

Good questions:
- Expose ambiguity the user hasn't noticed
- Force a concrete choice between real options
- Reveal tradeoffs that haven't been acknowledged
- Test whether dependencies are understood
- Clarify success criteria or failure conditions
- Sharpen vague terminology with concrete scenarios when domain language is fuzzy

Avoid:
- Broad or open-ended questions that could mean anything
- Questions already answered by prior context or codebase
- Low-leverage detail questions when foundational choices are still unclear
- Stacking multiple sub-questions into one

---

## Exit condition

Stop when one of these is true:
- The idea is concrete enough to choose the next phase confidently
- Main decisions and dependencies are resolved
- Remaining questions are low leverage
- The user wants to stop
- The next best step is research, prototyping, PRD writing, implementation, or validation rather than more questioning

**Closing summary must include:**
- Confirmed decisions
- Unresolved questions
- Major risks
- Whether research is needed
- Whether prototyping is needed
- Recommended next step (specific, not generic)

If `docs/idea.md` is the active session artifact, the closing summary must also be written there before handing off.

Before recommending PRD as the next phase, update `## Handoff to PRD` in `docs/idea.md` with:
- a concise handoff checklist
- `Ready for next phase: yes/no`
- `Primary blocker` whenever readiness is `no`

Do not recommend PRD handoff when `## Handoff to PRD` is missing or still says `Ready for next phase: no`. In that case, route the user back to the blocker, the remaining question, or the earlier phase that best resolves it.

After grilling, suggest a concrete next step such as creating `docs/research.md`, building a prototype, writing `docs/prd.md`, or moving to implementation if the idea is already clear enough.

---

## Express mode

If the user wants a faster session ("just give me the top questions" or "I only have 10 minutes"), lead with the **3 most critical unresolved questions** from your decision map, each with a recommended answer. Skip the one-at-a-time cadence.

---

## Gotchas

- Do not overwhelm with multiple questions at once (except in express mode).
- Do not drill into minor details when foundational choices are still unclear.
- Do not present your recommendation as certain when it depends on unvalidated assumptions — say so.
- If the user is vague, narrow scope before continuing.
- Treat bug fixes and refactors as valid idea-refinement targets when scope, constraints, or risks are still fuzzy.
- If codebase evidence contradicts the user's assumptions, say so clearly and update the decision map.
- If `CONTEXT.md` or relevant ADRs exist, do not ignore them or casually re-litigate already-settled terminology and decisions.
- Do not let vague or overloaded domain terms pass without challenge when they affect real decisions.
- Do not start implementing just because the user's wording sounds like a build request. If the skill is active, stay in grilling mode until the user explicitly asks to switch.
- When maintaining `docs/idea.md`, record distilled conclusions rather than raw Q&A transcript dumps.

---

## Verification

Minimum smoke test:

```bash
/reload
/skill:grill-me
```

A good run of this skill produces:

**Opening message:**
> Restatement of the idea or plan + decision map with open question categories listed.
>
> If the prompt looks like an implementation request (for example, "build a Pi extension that adds /workflow:name"), reinterpret it as an idea to refine first rather than a task to execute.

**Each turn:**
> One sharp question → your recommended answer with tradeoffs named.

**Every 3–4 questions:**
> Short summary: Decided / Open / Biggest risk.
>
> If `docs/idea.md` is in use, refresh the artifact with the current decisions and open questions.

**Closing:**
> Confirmed decisions, unresolved questions, major risks, whether research is needed, whether prototyping is needed, and the specific next step.
>
> If `docs/idea.md` is in use, ensure the final distilled summary is written there.

### Trigger validation

**Should trigger:**
- "Grill me on this app idea before I write a PRD."
- "Poke holes in this refactor plan and ask me the hard questions."
- "Stress-test this rollout proposal before we start implementing."

**Should not trigger:**
- "Route this vague request to the right phase and artifact." → use `triage-me`
- "Help me reproduce and isolate this flaky test failure." → use `diagnose-me`
- "Turn this finalized idea into `docs/prd.md`." → use `prd-me`

**Borderline:**
- "I have a bug-fix idea; challenge the approach before we touch the code." → use `grill-me` only if the main need is pressure-testing the approach rather than reproducing the bug first

### Artifact verification

If the session writes notes:
- verify the file path is exactly `docs/idea.md`
- verify the structure matches the repo convention for idea artifacts
- verify `## Handoff to PRD` is present when `docs/idea.md` is used as the session artifact
- verify `Ready for next phase: yes/no` is explicit in that handoff section
- verify `Primary blocker` is present whenever readiness is `no`
- verify only distilled decisions, questions, and next steps were recorded rather than a raw transcript dump
- verify no unrelated implementation files were edited
- verify the closing recommendation points to the correct next phase such as research, prototype, PRD, or execution

### Example cycle

> **Q:** You haven't defined who owns the auth service post-migration — is it the platform team or each product team?  
> **Rec:** Platform team ownership is safer here. Shared auth with distributed ownership tends to produce silent drift in token validation logic. The tradeoff is slower iteration for product teams, but that's worth it for a security-critical service.

> **Summary (after Q4):**
> - **Decided:** Microservices via strangler fig, auth first, platform team ownership
> - **Open:** Rollback trigger criteria, contract testing approach
> - **Biggest risk:** No defined rollback trigger — you could be running a partially migrated system indefinitely without noticing
