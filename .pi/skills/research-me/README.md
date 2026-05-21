# research-me

Project-local Pi skill for Phase 2 research.

## Purpose

Use this skill when a project idea needs targeted external research before prototyping, PRD writing, or implementation. The skill gathers authoritative findings, caches the useful conclusions in `docs/research.md`, and helps later agents avoid repeating the same exploration.

## Use a different skill when

- you mainly need to route a vague request to the right phase or artifact → `triage-me`
- you still need to pressure-test the idea before deciding what to research → `grill-me`
- you want direct Firecrawl operations such as crawl, scrape, parse, or agent extraction → `firecrawl-cli`

## Usage

```bash
/skill:research-me
```

Example prompts:
- `Research Stripe webhook signature verification for this project and write docs/research.md`
- `Investigate the auth requirements for the Xero API and summarize the constraints`
- `Look up the SDK limits for this provider and capture the findings in docs/research.md`

## Expected behavior

- checks local project artifacts first
- decides whether research is actually needed
- defines a tight research objective and questions to answer
- prefers official docs and authoritative sources
- may use the local `firecrawl-cli` skill for web retrieval
- stores raw retrieval output under `.firecrawl/`
- writes concise, sprint-scoped findings to `docs/research.md`
- includes sources, caveats, open questions, a freshness note, and a recommended next step

## Suggested `docs/research.md` structure

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

## Smoke test

```bash
/reload
/skill:research-me
```

Then verify behavior with these prompts:

**Should trigger**
- `Research Stripe webhook signature verification for this project and write docs/research.md`
- `Investigate the auth requirements for the Xero API and summarize the constraints`
- `Look up the SDK limits for this provider and capture the findings in docs/research.md`

**Should not trigger**
- `Route this vague request to the right phase and artifact.`
- `Grill me on this idea before we decide what to research.`
- `Use Firecrawl to crawl these URLs and save raw output under .firecrawl/.`

**Borderline**
- `I think we need outside research for this integration, but the problem statement is still fuzzy.`

For a successful run, verify that the agent:
1. inspects local context first
2. defines the research objective clearly
3. uses authoritative sources first
4. writes a distilled `docs/research.md` instead of dumping raw docs
5. includes clear sources, caveats, and open questions
6. includes a freshness note
7. writes only to `docs/research.md` for the summary artifact unless raw retrieval is intentionally saved under `.firecrawl/`
8. recommends the next phase clearly
