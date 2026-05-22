# Research

## Objective
Evaluate three approaches for advanced context management in this `7-phase` Pi template:
- `context-mode`
- `subagents` extension from `pi-config`
- `pi-spawn`

Goal: determine which approach is the best fit for an experimental branch focused on better context management in Pi.

## Questions to answer
- Which approach maps most directly to the problem of context pressure and compaction?
- Which approach fits Pi Coding Agent natively?
- What are the tradeoffs in complexity, flexibility, and operational risk?
- Which approach is the best first integration for this repository?

## Scope
- Read official Pi docs relevant to extensions/packages
- Read project docs for `context-mode`, `subagents`, and `pi-spawn`
- Compare architecture and integration fit for this repo

## Sources
- Pi docs: `docs/extensions.md`
- Pi docs: `docs/packages.md`
- `context-mode` README: https://github.com/mksglu/context-mode
- `context-mode` package metadata and Pi adapter entry
- `subagents` README and `index.ts`: https://github.com/amosblomqvist/pi-config/tree/main/extensions/subagents
- `pi-spawn` README and `index.ts`: https://github.com/agenticoding/pi-spawn
- Local raw snapshots saved under `.firecrawl/`

## Findings
- **`context-mode` is the most direct solution to context management.** It targets context bloat, tool-output overflow, and post-compaction continuity. For Pi it ships both:
  - a Pi extension using lifecycle hooks (`tool_call`, `tool_result`, `session_start`, `session_before_compact`)
  - an MCP server providing `ctx_*` tools such as sandboxed execution, indexing, and retrieval
- **`context-mode` is broad and heavier.** It adds SQLite/FTS-based persistence, routing enforcement, indexed retrieval, and a second runtime surface (Pi extension + MCP server). This is powerful but increases integration complexity.
- **`subagents` is primarily a delegation architecture, not a full context-management system.** It reduces parent-context pressure by offloading work to isolated child Pi processes. It supports:
  - multiple named agents with different tools/models/system prompts
  - single or parallel execution
  - dynamic agent registration from other extensions
  - extension-backed custom tools
- **`subagents` is flexible but more opinionated operationally.** It uses separate Pi processes, an agent registry, per-agent markdown configs, and custom tool mapping. Good for specialized roles, but heavier than a minimal spawn primitive.
- **`pi-spawn` is the smallest useful subagent primitive.** It creates isolated in-process Pi agent sessions, inherits the parent model/tools, supports parallelism by normal Pi parallel tool calls, and blocks nested spawning.
- **`pi-spawn` is better for minimal experimentation than `subagents`.** It has lower ceremony, no agent registry, no custom-agent packaging model, and no separate process management.
- **Neither `subagents` nor `pi-spawn` solve session continuity by themselves.** They reduce context growth through isolation, but they do not provide the same compaction-aware continuity and indexed retrieval that `context-mode` provides.

## Constraints and caveats
- `context-mode` uses Elastic License 2.0, not MIT.
- `context-mode` claims high Pi support, but it is a large integration surface and should be validated carefully in this template before adopting as a default.
- `subagents` example references `@mariozechner/pi-coding-agent`, while this repo uses `@earendil-works/pi-coding-agent`; compatibility should be verified if code is reused directly.
- `subagents` currently returns verbal output only; no built-in structured file handoff was documented.
- `pi-spawn` is intentionally minimal; if you need durable agent roles, custom agent catalogs, or richer orchestration, it will likely be too small on its own.
- `pi-spawn` improves context hygiene mainly through delegation, not through retrieval/indexing or compaction restoration.

## Recommended approach
- **Best single integration for “advanced context management”**: `context-mode`
  - Reason: it addresses the real problem directly: large tool outputs, retrieval, compaction, and session continuity.
  - Fit: Pi-specific extension hooks are explicitly supported.
- **Best lightweight experimentation path for this repo**: `pi-spawn`
  - Reason: easiest way to test whether subagent delegation improves the `7-phase` workflow without importing a large new stack.
- **Do not choose `subagents` first unless you specifically want role-based specialist agents.**
  - Choose it when the experiment is about orchestrating `researcher/scout/worker` style roles, not when the core question is raw context management.

## Open questions
- How well does `context-mode` coexist with this repo’s existing phase-oriented skills and prompts?
- Do we want context management centered on:
  - retrieval + continuity (`context-mode`), or
  - delegation + isolation (`pi-spawn` / `subagents`)?
- Do we need persistent specialist agents, or is ad-hoc spawning enough?

## Freshness note
Researched on 2026-05-22. Package behavior, Pi APIs, and third-party repos may change. Validate install flow and runtime compatibility before implementation.

## Next step
Create an experimental branch and test in this order:
1. `pi-spawn` for a low-risk delegation experiment in one phase flow
2. `context-mode` for a deeper context-management branch
3. only consider `subagents` if the branch proves we need durable specialist roles
