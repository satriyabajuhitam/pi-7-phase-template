# firecrawl-cli

Project-local Firecrawl CLI skill that replaces global Firecrawl skills in this repository.

## Purpose

- Standardize Firecrawl usage through one local skill.
- Prefer the cheapest command that solves the task.
- Reduce ambiguity from multiple global Firecrawl skills.
- Encourage constrained, inspectable, file-based output.

## Location

```text
.pi/skills/firecrawl-cli/
├── SKILL.md
└── README.md
```

## Prerequisites

- Firecrawl CLI is installed.
- Authentication is available.
- `firecrawl --status` should be checked before larger jobs.

Important note:
- `firecrawl --status` may show account-info or rate-limit warnings even when authentication is still valid.
- Treat authentication failures as blocking.
- Treat rate-limit warnings as cautionary and confirm whether the requested command still works.

## Usage

```bash
/skill:firecrawl-cli
```

## Command selection defaults

- Use `search` to discover URLs.
- Use `scrape` for one or a few known URLs.
- Use `map` to discover URLs inside one domain.
- Use `crawl` only when multiple pages are truly needed.
- Use `interact` after scraping when browser actions are required.
- Use `parse` for local files only.
- Use `agent` only for constrained multi-step extraction.
- Use `firecrawl experimental download` or `firecrawl x download` for local site snapshots.

## Safer default patterns

- Prefer `--json` when output will be reused programmatically.
- Prefer small limits first.
- Prefer `--only-main-content` for docs and article pages when noise reduction matters.
- Prefer path filters and depth limits for `crawl`.
- Prefer `--ignore-query-parameters` for `map` or `crawl` when duplicate URL variants are likely.
- Prefer `agent --max-credits` and `agent --urls`.

## Example commands

```bash
mkdir -p .firecrawl

# Search: small, structured output
firecrawl search "llm eval best practices" \
  --limit 5 \
  --json \
  -o .firecrawl/search-llm-eval.json

# Search + scrape when result content is also needed
firecrawl search "firecrawl docs authentication" \
  --limit 3 \
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
  --limit 20 \
  --ignore-query-parameters \
  --json \
  -o .firecrawl/map-auth.json

# Crawl: bounded scope
firecrawl crawl "https://docs.firecrawl.dev" \
  --include-paths /docs \
  --limit 20 \
  --max-depth 2 \
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

# Agent: constrained extraction
firecrawl agent "Extract the pricing tiers from the target pages" \
  --urls https://example.com/pricing,https://example.com/faq \
  --max-credits 20 \
  --wait \
  --json \
  -o .firecrawl/agent-pricing.json

# Experimental download
firecrawl experimental download "https://docs.firecrawl.dev" \
  --include-paths /docs \
  --limit 20 \
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
firecrawl --status
firecrawl search "firecrawl" --limit 1 --json -o .firecrawl/smoke-search.json
jq -r '.data.web[0].url' .firecrawl/smoke-search.json
```

Expected:
- Skill loads without errors.
- `.firecrawl/smoke-search.json` is created.
- `jq` returns at least one URL.
- Any warnings are distinguishable from hard failures.
