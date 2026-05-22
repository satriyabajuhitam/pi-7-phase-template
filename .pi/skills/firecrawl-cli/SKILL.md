---
name: firecrawl-cli
description: Use when the user explicitly needs Firecrawl CLI in this repository to search for URLs, scrape known URLs, map or crawl a site, parse local files, interact with previously scraped pages, run constrained agent extraction, or download site content locally. Do not use for general research, non-Firecrawl tooling, or global Firecrawl skills.
compatibility: "Requires Firecrawl CLI installed and authenticated. Free-plan guardrails matter: default free-plan rate limits are 2 concurrent browsers, /scrape 10 rpm, /map 10 rpm, /crawl 1 rpm, /search 5 rpm, /agent 10 rpm. Credit balance can be higher than the default 1,000/month if the account has promotional or partner credits, but that does not imply higher per-minute limits. `firecrawl --status` can itself hit account-info rate limits, so cache it and do not spam it."
---

# Firecrawl CLI (Project Skill)

This skill replaces global Firecrawl skills for this repository.

Read `README.md` for quick usage guidance, free-plan limits, safer defaults, example commands, and smoke tests.

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

## Free-plan constraints to optimize for

Official docs checked 2026-05-22:
- Default monthly budget on Free: `1,000 credits / month`
- Some free accounts may also have promotional or partner credits, so the actual remaining credit balance can be much higher.
- Extra credits do **not** change the plan's per-minute rate limits or concurrency unless the plan itself changes.
- Included pages on Free: about `1,000 scrape-equivalent pages` before any extra credits
- Concurrent browsers: `2`
- Requests/minute on Free:
  - `/scrape`: `10`
  - `/map`: `10`
  - `/crawl`: `1`
  - `/search`: `5`
  - `/agent`: `10`
  - `/crawl/status`: `1500`
  - `/agent/status`: `500`
  - `/browser`: `2`
  - `/browser/{id}/execute`: `10`
- Credit pricing:
  - `scrape`: `1 / page`
  - `crawl`: `1 / page`
  - `map`: `1 / page`
  - `search`: `2 / 10 results`
  - `interact`: `2 / browser minute`
  - `agent (preview)`: `5 daily runs free`, then dynamic pricing

Observed locally on this repo:
- `firecrawl --status` authenticated successfully but its account-info fetch hit a per-minute limit and reported a reset after 60s.
- Therefore, repeated `firecrawl --status` calls are wasteful on free accounts and should not be used as a loop.

## Workflow

1. **Check readiness without spamming `--status`**
   - Create the folder when needed: `mkdir -p .firecrawl`.
   - Reuse a recent status snapshot when possible.
   - Only run `firecrawl --status | tee .firecrawl/firecrawl-status.txt` if the snapshot is missing or older than about 70 seconds.
   - If auth is invalid, stop and ask the user to fix setup.
   - If auth is valid but `--status` shows account-info or rate-limit warnings, tell the user and continue cautiously if the requested command is still likely to work.
   - If a Firecrawl command returns `429`, honor `Retry-After` or the CLI reset timestamp before retrying. Do not hammer the API.

2. **Pick the cheapest command that solves the task**
   - no URL yet -> `search`
   - known URL -> `scrape`
   - need URL discovery inside one domain -> `map`
   - need many pages -> `crawl`
   - need browser actions after scraping -> `interact`
   - need local file extraction -> `parse`
   - need constrained multi-step extraction -> `agent`
   - need offline site snapshot -> `experimental download` or `x download`

3. **Use free-plan-safe defaults first**
   - Prefer exactly one retrieval step at a time, then inspect output before doing more.
   - Prefer `scrape` over `crawl` for one page.
   - Prefer `map` over `crawl` for URL discovery.
   - Start small:
     - `search`: `--limit 1` to `3`
     - `map`: `--limit 10` or less
     - `crawl`: `--limit 10` or less, usually `--max-depth 1`, `--max-concurrency 1`
     - `agent`: only as a last resort, with `--urls` and small `--max-credits` such as `5` to `10`
   - Avoid `search --scrape` unless the result content is truly needed, because it can spend both search and scrape credits.
   - Reuse `.firecrawl/` outputs before fetching again.

4. **Store output in `.firecrawl/`**
   - Save results with `-o .firecrawl/<file-name>` to avoid flooding context.
   - Reuse previous outputs before fetching again.
   - Prefer one file per step so follow-up work can build on existing data.

5. **Command-specific defaults**
   - `search`
     - Start with `--limit 1` on free plan unless there is a reason to widen.
     - Use `--json` for machine-readable output.
     - Use `--scrape` only when search results also need page content.
   - `scrape`
     - Prefer explicit formats such as `--format markdown` or `--format markdown,links`.
     - Use `--json` when requesting multiple formats or structured processing.
     - Use `--max-age` when retrying the same URL and cache reuse is acceptable.
     - Use `--query`, `--schema`, or `--schema-file` when targeted extraction is enough.
   - `map`
     - Use `--search` to narrow discovery when possible.
     - Keep `--limit` small first.
     - Consider `--sitemap skip` if sitemap results are noisy or misleading.
     - Prefer `--ignore-query-parameters` when duplicate URL variants are likely.
   - `crawl`
     - Avoid open-ended crawls.
     - Free plan allows only `1` crawl request per minute, so only crawl when `search`, `scrape`, or `map` are not sufficient.
     - Use `--wait` when the result is needed immediately.
     - Add `--limit`, usually `--max-depth 1`, and `--max-concurrency 1` on free plan.
     - Add `--timeout`, `--delay`, or path filters when cost, stability, or server load matters.
     - Use `--scrape-options` or `--scrape-options-file` for consistent page extraction across crawled pages.
   - `interact`
     - Scrape first, then interact.
     - Firecrawl can use the last scrape automatically; only pass `-s <scrape-id>` when you must target a specific scrape.
     - Use explicit `--timeout` for longer browser actions.
   - `agent`
     - Use only when `search`, `scrape`, `map`, or `crawl` are not sufficient.
     - Free plan gives only `5` daily free preview runs, so treat `agent` as expensive.
     - Prefer `spark-1-mini` unless higher accuracy is clearly needed.
     - Constrain credit usage with `--max-credits` and narrow `--urls`.
   - `experimental download`
     - Use `firecrawl experimental download` or `firecrawl x download`.
     - Treat it as a convenience workflow built on map + scrape.
     - Keep `--limit` low on free plan.
   - `parse`
     - Use only for local files, never for URLs.

6. **Avoid duplicate work**
   - Check `.firecrawl/` before issuing a new request.
   - If `search --scrape` already produced usable content, do not scrape the same URL again without a reason.
   - If a previous scrape exists, prefer `interact` against that scrape instead of starting over.
   - If the user asks follow-up questions about the same source, inspect saved output first.

7. **Validate quickly before summarizing**
   - Use `jq`, `head`, `rg`, or `grep` to inspect results.
   - Confirm the output file exists and contains the expected fields or content.
   - If the command returned partial success with warnings, report that explicitly.

## Gotchas

- Quote URLs containing `?` or `&`.
- `firecrawl --status` can show rate-limit or account-info warnings even when authentication is still valid.
- On free accounts, repeated `firecrawl --status` calls may hit account-info limits before normal retrieval commands do.
- `interact` usually does not require an explicit scrape ID if a recent scrape exists.
- `search --scrape` may already provide enough content for the task.
- `experimental download` lives under `firecrawl experimental download` or `firecrawl x download`, not top-level `firecrawl download`.
- `scrape` and `parse` default to noisier output unless you choose formats or `--only-main-content` intentionally.
- `agent` is more expensive than direct scraping and should be tightly constrained.

## Verification

1. `/reload`
2. Run `/skill:firecrawl-cli`
3. Run a minimal smoke test:
   - `mkdir -p .firecrawl`
   - `if [ ! -f .firecrawl/firecrawl-status.txt ] || [ $(( $(date +%s) - $(stat -c %Y .firecrawl/firecrawl-status.txt) )) -ge 70 ]; then firecrawl --status | tee .firecrawl/firecrawl-status.txt; fi`
   - `firecrawl search "firecrawl" --limit 1 --json -o .firecrawl/smoke-search.json`
   - `jq -r '.data.web[0].url' .firecrawl/smoke-search.json`
4. Optionally validate skill loading from CLI:
   - `pi -p --skill .pi/skills/firecrawl-cli --thinking off "Respond with exactly: skill-loaded-ok"`
5. If the smoke test fails:
   - re-check auth and CLI installation
   - inspect warnings vs hard failures
   - wait for the reported reset time or `Retry-After` on `429`
   - retry with smaller scope
