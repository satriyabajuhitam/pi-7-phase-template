# firecrawl-cli

Project-local Firecrawl CLI skill that replaces global Firecrawl skills in this repository.

## Purpose

- Standardize Firecrawl usage through one local skill.
- Prefer the cheapest command that solves the task.
- Reduce ambiguity from multiple global Firecrawl skills.
- Encourage constrained, inspectable, file-based output.
- Keep usage safe for Firecrawl free-plan limits.

## Location

```text
.pi/skills/firecrawl-cli/
├── SKILL.md
└── README.md
```

## Sources checked

Checked on 2026-05-22:
- Pricing: `https://www.firecrawl.dev/pricing`
- Rate limits: `https://docs.firecrawl.dev/rate-limits`

## Free-plan limits to design around

### Monthly budget

- Default Free allocation: `1,000 credits / month`
- Pricing page also describes this as roughly `1,000 scrape pages / month`
- Some free accounts may have extra promotional or partner credits, so the actual remaining balance can be far above `1,000`
- Extra credits do **not** automatically raise rate limits or concurrency; those still follow the plan unless the plan itself changes
- No pure pay-as-you-go on free plan

### Concurrent browsers

- Free: `2`
- Max queued jobs: `50,000`

### API rate limits on Free

Requests per minute:

- `/scrape`: `10`
- `/map`: `10`
- `/crawl`: `1`
- `/search`: `5`
- `/agent`: `10`
- `/crawl/status`: `1500`
- `/agent/status`: `500`
- `/browser`: `2`
- `/browser/{id}/execute`: `10`

### Credit costs

- `scrape`: `1 / page`
- `crawl`: `1 / page`
- `map`: `1 / page`
- `search`: `2 / 10 results`
- `interact`: `2 / browser minute`
- `agent (preview)`: `5 daily runs free`, then dynamic pricing

## Important local observation

Running `firecrawl --status` in this repo showed:
- authentication was valid
- account-info fetch hit a rate limit
- CLI reported reset after `60s`

Implication:
- `firecrawl --status` should not be called repeatedly on free accounts
- a rate-limit warning from `--status` is not automatically an auth failure
- reuse a recent status snapshot when possible

## Prerequisites

- Firecrawl CLI is installed.
- Authentication is available.
- `firecrawl --status` should be checked sparingly, not spammed.

## Usage

```bash
/skill:firecrawl-cli
```

## Safer default strategy for free plan

- Reuse `.firecrawl/` outputs before making another request.
- Start with one Firecrawl retrieval step, then inspect the output.
- Prefer `scrape` for one page.
- Prefer `map` for URL discovery.
- Use `crawl` only when multiple pages are truly required.
- Treat `agent` as expensive and use it only when simpler commands are insufficient.

Recommended starting limits:

- `search`: `--limit 1` to `3`
- `map`: `--limit 10` or less
- `crawl`: `--limit 10` or less, `--max-depth 1`, `--max-concurrency 1`
- `agent`: `--urls ... --max-credits 5..10`

Avoid:

- repeated `firecrawl --status` calls inside a loop
- open-ended crawls
- large `search --scrape` runs
- re-scraping the same page when cached output already exists

## Command selection defaults

- Use `search` to discover URLs.
- Use `scrape` for one or a few known URLs.
- Use `map` to discover URLs inside one domain.
- Use `crawl` only when multiple pages are truly needed.
- Use `interact` after scraping when browser actions are required.
- Use `parse` for local files only.
- Use `agent` only for constrained multi-step extraction.
- Use `firecrawl experimental download` or `firecrawl x download` for local site snapshots.

## Example commands

```bash
mkdir -p .firecrawl

# Status: cache it, do not spam it
if [ ! -f .firecrawl/firecrawl-status.txt ] || [ $(( $(date +%s) - $(stat -c %Y .firecrawl/firecrawl-status.txt) )) -ge 70 ]; then
  firecrawl --status | tee .firecrawl/firecrawl-status.txt
fi

# Search: tiny, structured output
firecrawl search "llm eval best practices" \
  --limit 3 \
  --json \
  -o .firecrawl/search-llm-eval.json

# Search + scrape: only when top results also need content
firecrawl search "firecrawl docs authentication" \
  --limit 2 \
  --scrape \
  --scrape-formats markdown \
  --json \
  -o .firecrawl/search-auth-scraped.json

# Scrape: explicit format, reduced noise
firecrawl scrape "https://firecrawl.dev" \
  --format markdown,links \
  --json \
  --only-main-content \
  -o .firecrawl/firecrawl-dev.json

# Map: constrained discovery
firecrawl map "https://docs.firecrawl.dev" \
  --search "authentication" \
  --limit 10 \
  --ignore-query-parameters \
  --json \
  -o .firecrawl/map-auth.json

# Crawl: bounded and free-plan-safe
firecrawl crawl "https://docs.firecrawl.dev" \
  --include-paths /docs \
  --limit 10 \
  --max-depth 1 \
  --max-concurrency 1 \
  --wait \
  --timeout 120 \
  -o .firecrawl/crawl-docs.json

# Parse local file
firecrawl parse "./sample.pdf" \
  --format markdown,links \
  --json \
  -o .firecrawl/sample.json

# Interact after a scrape (last scrape is used automatically)
firecrawl scrape "https://example.com/pricing" -o .firecrawl/pricing.md
firecrawl interact "What is the Pro plan price?" -o .firecrawl/pricing-answer.txt

# Agent: constrained extraction only
firecrawl agent "Extract the pricing tiers from the target pages" \
  --urls https://example.com/pricing,https://example.com/faq \
  --max-credits 5 \
  --wait \
  --json \
  -o .firecrawl/agent-pricing.json

# Experimental download: still keep it small
firecrawl experimental download "https://docs.firecrawl.dev" \
  --include-paths /docs \
  --limit 10 \
  --only-main-content \
  --yes
```

## Smoke test

Interactive path:

```bash
/reload
/skill:firecrawl-cli
```

CLI validation path:

```bash
pi -p --skill .pi/skills/firecrawl-cli --thinking off "Respond with exactly: skill-loaded-ok"
```

Minimal Firecrawl check:

```bash
mkdir -p .firecrawl
if [ ! -f .firecrawl/firecrawl-status.txt ] || [ $(( $(date +%s) - $(stat -c %Y .firecrawl/firecrawl-status.txt) )) -ge 70 ]; then
  firecrawl --status | tee .firecrawl/firecrawl-status.txt
fi
firecrawl search "firecrawl" --limit 1 --json -o .firecrawl/smoke-search.json
jq -r '.data.web[0].url' .firecrawl/smoke-search.json
```

Expected:
- Skill loads without errors.
- `.firecrawl/smoke-search.json` is created.
- `jq` returns at least one URL.
- Any `--status` account-info/rate-limit warnings are distinguishable from hard auth failures.

## If a command returns 429

- Wait for `Retry-After` or the CLI reset time.
- Do not retry immediately in a tight loop.
- Reduce scope before retrying:
  - smaller `--limit`
  - shallower `--max-depth`
  - lower `--max-concurrency`
  - fewer URLs
- Prefer cached `.firecrawl/` output if it is still good enough.
