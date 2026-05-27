---
name: research-me
description: Research external dependencies or hard-to-explore topics for the current project, then write a reusable sprint-scoped summary to docs/research.md. Use when an idea needs cached findings before prototyping, PRD writing, or implementation.
---

# Research Me

## When to use

- The current idea, feature, bug fix, or refactor depends on external APIs, SDKs, services, or documentation
- Exploration is difficult, expensive, scattered, or likely to be repeated by future agents
- The user wants a repo-local research artifact for this sprint or feature
- The next phase depends on facts that are not yet established in the codebase

## Do not use when

- The answer can be derived from the local codebase without outside research
- The user wants broad brainstorming rather than targeted evidence gathering
- The topic is already well understood and no reusable research artifact is needed
- The user wants direct implementation and the missing information is not material
- The main need is to route a vague request to the right phase or artifact rather than gather evidence; use `triage-me`
- The main need is to pressure-test or sharpen the idea before deciding what to research; use `grill-me`
- The user explicitly wants to operate Firecrawl tooling directly for search, crawl, scrape, parse, or agent extraction rather than run a project research workflow; use `firecrawl-cli`

---

## Workflow

### 0. Stay in research mode

While this skill is active:
- Do not implement product code unless the user explicitly asks to switch modes
- You may create or update `docs/research.md`
- Prefer evidence gathering, distillation, and recommendation over speculative design

### 1. Decide whether research is actually needed

Before researching, check whether Phase 2 is justified.

Research is justified when one or more of these are true:
- there is an external dependency or integration
- the docs are hard to navigate or likely to disappear from context
- a decision needs evidence from outside the repo
- future agents would benefit from a cached summary

If research is not justified, say so clearly and recommend the better next phase.

### 2. Inspect local context first

Before going to the web, inspect relevant local artifacts if they exist:
- `docs/idea.md`
- `docs/prd.md`
- `docs/prototype/`
- existing `docs/research.md`

Use them to extract:
- objective
- scope boundaries
- open questions
- assumptions to validate

Do not ask the user for information that already exists in the repo.

### 3. Define the research objective

Open with a short restatement of what needs to be learned.

Then produce a tight research plan with:
- `Objective`
- `Questions to answer`
- `Scope`
- `Out of scope`

If the request is vague, narrow it before collecting sources.

### 4. Gather evidence from the best sources

Prefer sources in this order:
1. official documentation
2. official API references or SDK docs
3. vendor examples or migration guides
4. high-signal third-party references only when needed

If web retrieval is needed in this repo:
- load and follow the local `firecrawl-cli` skill
- store raw retrieval output under `.firecrawl/`
- keep `docs/research.md` for distilled conclusions only

For each important finding, capture:
- the claim
- the source URL or source identifier
- why it matters for this project

### 5. Distill, do not dump

Convert raw findings into reusable guidance for later agents.

Required distinctions:
- confirmed findings
- assumptions still unverified
- constraints or caveats
- open questions
- recommended approach

Avoid copying large chunks of docs into `docs/research.md`.

### 6. Maintain `docs/research.md`

Use `docs/research.md` as the project research artifact when the user asks for written output or when this skill is used for a real research pass.

Default structure:
- `# Research`
- `## Objective`
- `## Questions to answer`
- `## Scope`
- `## Sources`
- `## Findings`
- `## Constraints and caveats`
- `## Recommended approach`
- `## Open questions`
- `## Freshness note`
- `## Next step`

Writing rules:
- keep it concise and decision-oriented
- include only findings relevant to the current sprint or feature
- include source links or clear source identifiers
- add a freshness note with date and staleness warning
- preserve still-relevant prior findings when updating instead of blindly overwriting

### 7. Recommend the next phase

Close by stating which next step is best:
- more research
- prototype
- PRD
- implementation
- validation

Be specific about why.

---

## Default questioning order

Use this order as a starting point:

1. What decision or implementation risk requires outside evidence?
2. What exact questions must this research answer?
3. Which sources are authoritative enough?
4. What findings materially affect the next phase?
5. What remains uncertain?
6. What is the best next step now that the findings are cached?

---

## Gotchas

- Do not turn this into generic web research with no project objective.
- Do not skip local artifact review before going outside the repo.
- Do not dump raw docs into `docs/research.md`.
- Do not treat third-party blog posts as equivalent to official docs when official docs exist.
- Do not keep stale research unmarked; add a freshness note.
- Do not preserve outdated findings just because they were written first.
- If the research fails to answer a key question, say so explicitly instead of pretending certainty.

---

## Verification

Minimum smoke test:

```bash
/reload
/skill:research-me
```

A good run of this skill produces:

**Opening:**
> Restated research objective, questions to answer, scope, and why research is needed.

**During research:**
> Uses authoritative sources first, saves raw retrieval under `.firecrawl/` when applicable, and distinguishes findings from assumptions.

**Artifact:**
> `docs/research.md` contains distilled findings, sources, caveats, open questions, a freshness note, and a next-step recommendation.

**Closing:**
> States whether the project should move to prototype, PRD, implementation, or more research.

### Trigger validation

**Should trigger:**
- "Research Stripe webhook signature verification for this project and write `docs/research.md`."
- "Investigate the auth requirements for the Xero API and summarize the constraints for this repo."
- "Find the SDK limits for this provider and capture the findings in `docs/research.md`."

**Should not trigger:**
- "Route this half-specified feature request to the right phase and artifact." → use `triage-me`
- "Grill me on this product idea before we decide what to research." → use `grill-me`
- "Use Firecrawl to crawl these docs URLs and save the raw output under `.firecrawl/`." → use `firecrawl-cli`

**Borderline:**
- "I think we need outside research for this integration, but the problem statement is still fuzzy." → use `research-me` only if the research objective can already be made concrete; otherwise use `grill-me` first

### Artifact verification

If the session writes notes:
- verify the file path is exactly `docs/research.md`
- verify the structure matches the repo convention for research artifacts
- verify sources are identified clearly with links or source identifiers
- verify findings are distilled rather than copied as raw documentation dumps
- verify a freshness note with date and staleness warning is present
- verify no unrelated implementation files were edited
- verify the closing recommendation points to the correct next phase such as more research, prototype, PRD, implementation, or validation

### Smoke test

1. `/reload`
2. `/skill:research-me`
3. Give a prompt such as: `Research Stripe webhook signature verification for this project and write docs/research.md`
4. Verify that the agent:
   - checks local context first
   - defines a tight research objective
   - prefers official docs
   - writes a concise `docs/research.md`
   - includes a freshness note and next-step recommendation
