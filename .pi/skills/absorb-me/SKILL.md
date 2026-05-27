---
name: absorb-me
description: Absorb an existing repository into a trustworthy pre-ideation context before Phase 1 grilling. Use when the project was not started with this 7-phase workflow and the agent needs a detailed codebase baseline first.
---

# Absorb Me

## When to use

- The user wants to apply this 7-phase workflow to an **existing project**
- The codebase was not originally developed with these local workflow artifacts
- The next planned step is idea refinement (`grill-me`), but repo understanding is still thin
- Upcoming work touches unfamiliar architecture, contracts, or critical flows
- The team wants a reusable onboarding artifact for future sessions

## Do not use when

- The project is brand new and Phase 1 ideation can start directly
- The user already has a current, trustworthy `docs/absorb.md` for the same scope and no stale trigger is active
- The main task is direct ticket execution; use `execute-me`
- The main task is issue routing/classification; use `triage-me`
- The main task is bug reproduction/isolation; use `diagnose-me`
- The main task is external dependency research; use `research-me`

---

## Workflow

### 0. Stay in absorb mode

While this skill is active:
- Do not implement product changes
- Do not create PRD, issue breakdowns, or execution work yet
- Focus on building a trustworthy understanding baseline for the next ideation pass
- You may create or update `docs/absorb.md`

### 1. Validate whether absorb is needed

Absorb is justified when one or more are true:
- this is an existing codebase entering 7-phase for the first time
- the user asks for additions/changes but project context is still unclear
- `grill-me` would otherwise rely on assumptions about current behavior or architecture
- existing `docs/absorb.md` is missing, older than 14 days, or hit by a stale trigger

For existing codebases, treat absorb as the default required pre-ideation step.

If absorb is not needed, say so and route to the smallest correct next phase.

### 2. Inspect local artifacts first

Before broad code exploration, inspect local context if it exists:
- `docs/absorb.md`
- `docs/idea.md`
- `docs/research.md`
- `docs/prd.md`
- `docs/issues.md`
- `docs/qa.md`
- `README.md`, `GUIDE.md`, and project-level docs/config files relevant to architecture

If `docs/absorb.md` already exists, refresh it instead of rewriting blindly.

### 3. Build a focused absorb plan

State clearly:
- `Objective`
- `Scope`
- `Out of scope`
- `Target change area` (if the user already mentioned upcoming work)

Prefer depth in relevant areas over shallow full-repo summaries.

### 4. Map the codebase and behavior

Collect only what is needed to make Phase 1 grilling sharper:
- repository snapshot (stack, package/tooling, entrypoints)
- product/domain understanding from docs and code
- architecture map (major modules, boundaries, key dependencies)
- critical existing flows related to likely upcoming changes
- constraints/contracts (data shapes, APIs, permissions, shared interfaces)
- validation entry points (tests, lint, typecheck, focused commands)
- risks/hotspots (fragile code paths, coupled modules, missing tests)

When evidence is weak, record it as assumption—not fact.

### 5. Write or refine `docs/absorb.md`

Use this default structure:
- `# Absorb`
- `## Objective`
- `## Repo snapshot`
- `## Product/domain understanding`
- `## Architecture map`
- `## Critical flows relevant to upcoming change`
- `## Constraints and contracts`
- `## Validation entry points (tests/commands)`
- `## Risks/hotspots`
- `## Unknowns & assumptions`
- `## Questions to seed grill-me`
- `## Freshness note`
- `## Recommended next step`

Keep it concise, evidence-based, and reusable across sessions.

In `## Freshness note`, include:
- refresh date
- scope the absorb covers
- freshness rule: baseline valid for 14 days unless stale trigger(s) fire sooner
- whether any stale trigger is currently true

Stale triggers (any one makes absorb stale immediately):
- shared contract/interface change across modules (API/schema/event/public type)
- module boundary or architecture shift
- critical flow change in the target scope

### 6. Prepare handoff into ideation

Before closing:
- extract high-leverage questions into `## Questions to seed grill-me`
- make unknowns explicit so `grill-me` can challenge the right assumptions
- include a handoff note that `grill-me` must enforce absorb-gate decision logging in `docs/idea.md` for existing codebases
- recommend `grill-me` as default next step unless another blocker dominates

### 7. Recommend exactly one next step

Usually one of:
- `grill-me` (default)
- `diagnose-me` (if failure behavior is the real blocker)
- `research-me` (if external facts block ideation)
- `triage-me` (if incoming request is still too ambiguous to scope)

---

## Default questioning order

1. What change area is likely to be touched next?
2. Which current behavior and flows must be preserved?
3. Which modules/contracts are most likely impacted?
4. Where are the highest coupling and regression risks?
5. Which validations are the smallest trustworthy safety net?
6. Which unresolved questions should seed `grill-me` first?

---

## Gotchas

- Do not turn absorb into implementation.
- Do not produce a giant file tree dump with no decision value.
- Do not claim confidence where evidence is missing.
- Do not ignore existing docs/artifacts that already answer the question.
- Do not skip `Questions to seed grill-me`; that section is the handoff backbone.
- Do not mark absorb as fresh when it is older than 14 days for the same scope unless you explicitly revalidated and refreshed it.
- Do not ignore stale triggers just because the timestamp is still recent.

---

## Verification

Minimum smoke test:

```bash
/reload
/skill:absorb-me
```

A good run of this skill produces:

**Opening:**
> States why absorb is needed and what parts of the repo will be mapped.

**During absorb:**
> Builds an evidence-based repo understanding focused on the likely change surface.

**Artifact:**
> `docs/absorb.md` is updated with architecture, constraints, risks, unknowns, and seed questions for ideation.

**Closing:**
> Recommends one concrete next phase, usually `grill-me`.
