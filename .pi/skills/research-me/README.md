# research-me

Project-local Pi skill for Phase 2 research.

## Purpose

Use this skill when a project idea needs targeted external research before prototyping, PRD writing, or implementation. The skill gathers authoritative findings, caches the useful conclusions in `docs/research.md`, and helps later agents avoid repeating the same exploration.

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

Then provide a prompt with a real external dependency and verify that the agent:
1. inspects local context first
2. defines the research objective clearly
3. uses authoritative sources first
4. writes a distilled `docs/research.md` instead of dumping raw docs
5. includes a freshness note
6. recommends the next phase clearly
