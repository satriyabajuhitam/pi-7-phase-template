# Research

## Objective
Evaluate `@narumitw/pi-subagents` as a possible future addition around this repo's current `spawn` work.

Goal: understand what `pi-subagents` actually provides, how it differs from this repo's current minimal `spawn` direction, and which ideas are safe to borrow later without accidentally turning `spawn` into a full subagent platform.

## Questions to answer
- What capabilities does `pi-subagents` add?
- How does it work technically?
- Which parts align with this repo's current `spawn` direction?
- Which parts conflict with the current `spawn` scope and PRD?
- What is the safest next step if we want to use ideas from it later?

## Scope
- Focus only on `pi-subagents`
- Compare it only against this repo's current `spawn` direction where relevant
- Research only; no implementation

Out of scope:
- other Pi extensions
- broad context-management comparison
- merging anything into `spawn` right now

## Sources
- GitHub repo: https://github.com/narumiruna/pi-extensions/tree/main/extensions/pi-subagents
- README: https://github.com/narumiruna/pi-extensions/blob/main/extensions/pi-subagents/README.md
- Source: `extensions/pi-subagents/src/subagents.ts`
- Source: `extensions/pi-subagents/src/agents.ts`
- Package metadata: `extensions/pi-subagents/package.json`
- Local repo PRD: `docs/prd.md`
- Local branch guide: `docs/pi-spawn.md`
- Local Pi runtime version: `/home/satriya/.nvm/versions/node/v24.15.0/lib/node_modules/@earendil-works/pi-coding-agent/package.json`

## Findings
- **`pi-subagents` is a separate tool, not a small `spawn` tweak.**
  - It registers a `subagent` tool with multiple execution modes: single, parallel, parallel+aggregator, and chain.
  - This is broader than this repo's current `spawn` PRD, which explicitly keeps `spawn` as a minimal primitive with the same public contract.
  - Why it matters here: importing it wholesale would be a product-scope change, not a small enhancement.

- **Its isolation model is subprocess-based, not the same as the current `spawn` branch.**
  - Workers run as isolated `pi --mode json -p --no-session` subprocesses.
  - The extension appends agent system prompts via temp files and can restrict tools per agent.
  - Why it matters here: this gives stronger role isolation and agent-specific tool control, but likely adds more process overhead than this repo's current lightweight `spawn` path.

- **It includes a built-in role catalog and a markdown-based custom-agent system.**
  - Built-ins: `scout`, `planner`, `reviewer`, `worker`, plus `general` / `general-purpose` aliases.
  - It can load user agents from `~/.pi/agent/agents/*.md` and optionally project agents from `.pi/agents/*.md`.
  - Project-local agents are opt-in via `agentScope: "project" | "both"`, with interactive confirmation by default.
  - Why it matters here: this is useful if you want durable specialist roles, but it is beyond the current repo's stated goal of a minimal `spawn` tool.

- **It already solves several operational concerns in a structured way.**
  - Hard timeout support exists at top-level, per task, per chain step, and per aggregator.
  - Default timeout is `PI_SUBAGENT_TIMEOUT_MS` or 10 minutes.
  - On timeout it sends `SIGTERM`, then escalates to `SIGKILL`, and returns partial messages or stderr.
  - Parallel execution is capped at 8 tasks with concurrency 4.
  - Why it matters here: timeout posture and bounded parallelism are reusable ideas if this repo later expands beyond one-task `spawn` behavior.

- **It has richer orchestration than this repo's current `spawn` scope.**
  - Parallel fan-out can feed a fan-in aggregator.
  - Chains pass prior output using `{previous}`.
  - The tool advertises proactive delegation guidance through `promptSnippet` and `promptGuidelines`.
  - Why it matters here: these are useful orchestration patterns, but they move toward a fuller subagent runtime rather than the repo's current one-tool, one-focused-task direction.

- **Its UI/status approach contains ideas worth borrowing selectively.**
  - It publishes transient runtime status through `ctx.ui.setStatus("subagents", "...")`.
  - It streams partial updates, tracks per-worker results, and renders collapsed/expanded views for single, parallel, and chain modes.
  - Why it matters here: the generic status publishing and compact activity summaries are the most reusable ideas for this repo; the heavier multi-result card rendering should be treated carefully because this branch has already been sensitive to perceived slowness.

- **Compatibility posture looks better than older subagent experiments, but not fully proven.**
  - The package uses the same `@earendil-works/*` peer dependency family as this repo's Pi install.
  - `pi-subagents` dev dependencies are pinned to `0.74.0`, while the local Pi install here is `0.75.5`.
  - Why it matters here: this is a much better compatibility signal than older forks using different package scopes, but a real smoke test would still be needed before adoption.

- **The best fit for this repo is selective borrowing, not direct adoption into `spawn` v1.**
  - Safe candidates to borrow later:
    - named prompt profiles / role presets for delegation
    - clearer delegation guidance for when to fan out vs stay local
    - bounded timeout/concurrency posture
    - transient top-level status publishing patterns
  - High-risk candidates for this branch:
    - a new `subagent` public tool with different parameters
    - chain / fan-in orchestration inside `spawn`
    - markdown agent catalogs and project-agent trust workflows
    - subprocess-heavy architecture as the default `spawn` backend

## Constraints and caveats
- Current local PRD says `spawn` should remain a **minimal spawn primitive**, not a full subagent platform.
- Current branch guide says this repo uses `spawn` as a narrow, artifact-grounded delegation aid, not a persistent specialist-agent system.
- `pi-subagents` is MIT licensed, so licensing is not the blocker here.
- The main product risk is **scope drift**, not missing capability.
- The main technical risk is **latency/perceived performance regression** if subprocess-style orchestration is adopted too directly.
- Project-agent loading introduces a trust boundary that this repo does not currently need for `spawn`.
- I did not validate runtime behavior in this repo yet; findings here are from source and package inspection, not a live install smoke test.

## Recommended approach
- **Do not fold `pi-subagents` wholesale into the current `spawn` implementation.**
- If you want to use it as inspiration, treat it as a menu of ideas and keep the current `spawn` contract intact.
- Best low-risk follow-up ideas for this repo:
  1. add optional role/prompt presets on top of the existing `spawn` flow without creating a new public orchestration API
  2. borrow timeout / bounded-parallelism posture only if the repo later chooses to support multi-task delegation
  3. borrow transient statusline publishing ideas only if they do not regress the current branch's readability/performance balance
- If you eventually want chain/fan-in/specialist catalogs, do that as a **separate experimental branch or separate tool**, not as a quiet expansion of `spawn`.

## Open questions
- Do you want `spawn` to stay a single focused delegation primitive, or do you want a second higher-level delegation tool later?
- Is named-role support enough, or do you actually want chain/fan-in orchestration?
- Would project-local agent definitions be acceptable in this repo's trust model?
- Is the team willing to trade some latency for stronger subprocess isolation and role control?

## Freshness note
Researched on 2026-05-24 from the upstream `pi-subagents` repo and this repo's current `spawn` docs/code. Package behavior, Pi APIs, and the upstream repo may change. Validate with a local smoke test before implementation.

## Next step
Recommended next step: **prototype**.

Reason: the research is clear enough to avoid broad adoption, but there is still a product decision to make about which narrow idea, if any, should be borrowed into the current `spawn` path without breaking its minimal scope.