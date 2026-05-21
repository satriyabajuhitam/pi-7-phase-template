---
name: firecrawl-cli
description: Use when the user explicitly needs Firecrawl CLI in this repository to search for URLs, scrape known URLs, map or crawl a site, parse local files, interact with previously scraped pages, run constrained agent extraction, or download site content locally. Do not use for general research, non-Firecrawl tooling, or global Firecrawl skills.
compatibility: "Requires Firecrawl CLI installed and authenticated. Treat `firecrawl --status` warnings carefully: auth failures block usage, but account-info or rate-limit warnings may still allow commands to work."
---

# Firecrawl CLI (Project Skill)

This skill replaces global Firecrawl skills for this repository.

Read `README.md` for quick usage guidance, safer defaults, example commands, and smoke tests.

## When to use

Use this skill when the user asks for Firecrawl CLI workflows such as:
- web search
- scraping one or more URLs
- mapping URLs within a domain
- crawling a section of a site
- downloading a site locally via `experimental download`
- parsing local files (PDF, DOCX, XLSX, HTML)
- browser interaction after a scrape
- structured extraction with `agent`

## Do not use when

Do not use this skill when the main task is:
- local code editing without web retrieval
- git or deploy operations
- general tooling unrelated to Firecrawl
- broad research that does not require Firecrawl CLI
- the user explicitly asks to avoid Firecrawl CLI or use a different tool instead

## Workflow

1. **Check readiness carefully**
   - Run `firecrawl --status`.
   - If the CLI is missing or authentication is invalid, ask the user to set it up first.
   - If auth is valid but `--status` shows account-info or rate-limit warnings, tell the user and continue cautiously if the requested command is still likely to work.
   - Keep command usage disciplined in the body of the skill: use Firecrawl CLI for retrieval work, and only lightweight local shell helpers such as `mkdir`, `jq`, `head`, `rg`, or `grep` to inspect saved output.

2. **Pick the cheapest command that solves the task**
   - no URL yet -> `search`
   - known URL -> `scrape`
   - need URL discovery inside one domain -> `map`
   - need many pages -> `crawl`
   - need browser actions after scraping -> `interact`
   - need local file extraction -> `parse`
   - need constrained multi-step extraction -> `agent`
   - need offline site snapshot -> `experimental download` or `x download`

3. **Use safe defaults and constrain scope**
   - Prefer `--json` when the result will be processed by tools or reused later.
   - Always limit breadth when possible:
     - `search`: `--limit`
     - `map`: `--limit`
     - `crawl`: `--limit`, usually `--max-depth`, plus `--include-paths` or `--exclude-paths`
     - `agent`: `--urls`, `--max-credits`, `--schema-file` when structured output is needed
     - `experimental download`: `--limit`, path filters, and explicit format
   - Prefer `--ignore-query-parameters` for `map` or `crawl` when duplicate URLs are likely.
   - Prefer `--only-main-content` for articles, docs, or content-heavy pages when noise reduction matters.

4. **Store output in `.firecrawl/`**
   - Create the folder when needed: `mkdir -p .firecrawl`.
   - Save results with `-o .firecrawl/<file-name>` to avoid flooding context.
   - Reuse previous outputs before fetching again.

5. **Command-specific defaults**
   - `search`
     - Start with `--limit <small-number>`.
     - Use `--json` for machine-readable output.
     - Use `--scrape` only when search results also need page content.
   - `scrape`
     - Prefer explicit formats such as `--format markdown` or `--format markdown,links`.
     - Use `--json` when requesting multiple formats or structured processing.
     - Use `--max-age` when retrying the same URL and cache reuse is acceptable.
     - Use `--query`, `--schema`, or `--schema-file` when targeted extraction is enough.
   - `map`
     - Use `--search` to narrow discovery when possible.
     - Consider `--sitemap skip` if sitemap results are noisy or misleading.
   - `crawl`
     - Avoid open-ended crawls.
     - Use `--wait` when the result is needed immediately.
     - Add `--timeout`, `--delay`, or `--max-concurrency` when cost, stability, or server load matters.
     - Use `--scrape-options` or `--scrape-options-file` for consistent page extraction across crawled pages.
   - `interact`
     - Scrape first, then interact.
     - Firecrawl can use the last scrape automatically; only pass `-s <scrape-id>` when you must target a specific scrape.
     - Use explicit `--timeout` for longer browser actions.
   - `agent`
     - Use only when `search`, `scrape`, `map`, or `crawl` are not sufficient.
     - Prefer `spark-1-mini` unless higher accuracy is clearly needed.
     - Constrain credit usage with `--max-credits`.
   - `experimental download`
     - Use `firecrawl experimental download` or `firecrawl x download`.
     - Treat it as a convenience workflow built on map + scrape.
   - `parse`
     - Use only for local files, never for URLs.

6. **Avoid duplicate work**
   - Check `.firecrawl/` before issuing a new request.
   - If `search --scrape` already produced usable content, do not scrape the same URL again without a reason.
   - If a previous scrape exists, prefer `interact` against that scrape instead of starting over.

7. **Validate quickly before summarizing**
   - Use `jq`, `head`, `rg`, or `grep` to inspect results.
   - Confirm the output file exists and contains the expected fields or content.
   - If the command returned partial success with warnings, report that explicitly.

## Gotchas

- Quote URLs containing `?` or `&`.
- `firecrawl --status` can show rate-limit or account-info warnings even when auth is still valid.
- `interact` usually does not require an explicit scrape ID if a recent scrape exists.
- `search --scrape` may already provide enough content for the task.
- `experimental download` lives under `firecrawl experimental download` or `firecrawl x download`, not top-level `firecrawl download`.
- `scrape` and `parse` default to noisier output unless you choose formats or `--only-main-content` intentionally.
- `agent` is more expensive than direct scraping and should be constrained.

## Verification

1. `/reload`
2. Run `/skill:firecrawl-cli`
3. Run a minimal smoke test:
   - `mkdir -p .firecrawl`
   - `firecrawl --status`
   - `firecrawl search "firecrawl" --limit 1 --json -o .firecrawl/smoke-search.json`
   - `jq -r '.data.web[0].url' .firecrawl/smoke-search.json`
4. Optionally validate skill loading from CLI:
   - `pi -p --skill .pi/skills/firecrawl-cli --thinking off "Respond with exactly: skill-loaded-ok"`
5. If the smoke test fails:
   - re-check auth and CLI installation
   - inspect warnings vs hard failures
   - retry with smaller scope or after rate limits reset
