# Idea

## Problem statement
Current `pi-spawn` feels too minimal on the UI/UX side and may leave performance optimizations unexplored for real-world spawn workflows.

A second emerging problem is delegation quality drift: users must repeatedly hand-write similar `spawn` prompts for reconnaissance, planning, and review work, which creates boilerplate and inconsistent output quality.

## Desired outcome
Create a replacement for `spawn` that keeps the same tool contract but delivers a clearly better user experience first, then targeted performance improvements.

As a possible follow-up on top of that replacement, add a very small preset layer that makes common read-only delegation patterns faster and more consistent without turning `spawn` into a full subagent platform.

## Scope
- Replace the current `spawn` implementation directly
- Keep the tool name and parameter contract compatible with existing `pi-spawn`
- Improve inline UI/UX first
- Improve measurable performance second
- Explore a minimal v1 preset layer for common read-only delegation patterns

## Non-goals
- Turning `spawn` into a full subagent platform
- Changing the public tool API in v1 beyond a possibly single lightweight preset parameter if explicitly approved
- Adding broad lifecycle/registry complexity unless later justified
- Adding an overlay conversation viewer in v1
- Adding persistent spawn history or a spawn registry in v1
- Adding a new background completion notification system in v1
- Adding chain, fan-in, custom agent catalogs, or project-agent trust workflows as part of preset v1
- Adding implementation-oriented presets in preset v1

## Constraints
- Must remain compatible with current `spawn` usage
- Should preserve the minimal mental model of one tool, one focused task
- Should be safer to adopt than a brand-new incompatible system
- Any preset v1 should remain read-only by default
- Any preset v1 should feel like prompt guidance, not a durable agent system

## Assumptions
- The current pain is more visible in UX than in raw runtime cost
- A better `spawn` can be built without abandoning the minimal model
- Direct replacement is acceptable if behavior stays compatible
- A tiny preset layer can improve delegation consistency without pushing the product over the line into a subagent platform

## Decision map
- Product boundary: minimal replacement vs richer subagent platform
- Compatibility: preserve current `spawn` contract or not
- Priority: UI/UX first vs performance first
- UX surface: inline render only vs widget/status/overlay
- Performance target: actual bottlenecks vs speculative optimization
- Preset surface: invisible convention vs one lightweight explicit parameter
- Preset scope: read-only guidance vs implementation-capable roles
- Preset set: which small set of built-in intents earns its keep in v1

## Questions asked
- Should this remain a minimal spawn primitive or become a richer subagent platform?
- Should it be a side-by-side experiment or directly replace `spawn`?
- Should the tool contract remain compatible?
- Which should be prioritized first: UI/UX or performance?
- Which UI surfaces are in scope for v1?
- Should lightweight widget/status UI appear only while spawns are active or persist all the time?
- Should collapsed inline results stay terse or become status-card style?
- Which signals are mandatory in the collapsed card versus optional?
- Should the lightweight widget list individual active spawns or only show a summary count?
- How many individual active spawns should the widget show before collapsing into overflow?
- Which UX improvement matters most in v1?
- What concrete baseline proves parallel-spawn readability is better?
- What should the v1 performance goal actually be?
- How much transient state is acceptable before the design stops feeling minimal?
- Is a small prototype needed before PRD?
- Which anti-drift non-goals must be explicit in v1?
- What lightweight validation method should be used before PRD?
- Should a future preset layer stay invisible at the API level or use one lightweight explicit parameter?
- Which presets are worth adding in v1?
- Should preset v1 remain read-only or support implementation?

## Decisions made
- Keep the minimal `spawn` mental model
- Replace `spawn` directly rather than shipping a parallel tool first
- Preserve 100% tool-contract compatibility in v1
- Prioritize UI/UX first, then performance
- Limit v1 UI surfaces to improved inline render plus lightweight active-spawn widget/status
- Do not add an overlay viewer in v1
- Show widget/status only while spawns are active, then hide automatically
- Use an informative status-card style collapsed render rather than a plain text dump
- Make status/icon, activity-or-short-result preview, and warning/truncation flags mandatory in the collapsed card
- Keep token/turn stats optional and visually secondary
- Use a hybrid active-spawn widget: show individual active spawns first, then summarize the rest as overflow
- Cap the widget at 3 individual active spawns before using overflow
- Prioritize parallel-spawn readability as the main UX win for v1
- Use this UX baseline for v1 success: with 3 parallel spawns, the user can tell which spawn is still running, which has an error/warning, and which has completed without expanding every result one by one
- Use this v1 performance guardrail: the replacement must not feel visibly slower than current `pi-spawn` in a 3-parallel-spawn scenario
- Keep transient state in memory only for active spawns, then discard it on completion in v1
- Do not require a separate prototype before PRD; the concept is concrete enough to specify directly
- Make these anti-drift non-goals explicit in v1: no overlay conversation viewer, no persistent spawn history/registry, no new background completion notification system, and no API change to `spawn`
- Validate v1 with a lightweight side-by-side manual comparison against current `pi-spawn`, using the same 3-parallel-spawn scenario and comparing readability, error/warning visibility, completion clarity, and whether the new version feels slower
- If a preset layer is added later, keep it small and intent-based rather than becoming a full agent catalog
- The only preset candidates currently worth considering for v1 are `scout`, `planner`, and `reviewer`
- Preset v1 should remain read-only; no implementation-oriented preset in v1
- If preset support is added, it should be explicit rather than hidden; user-visible behavior should not depend on invisible prompt conventions
- Preset v1 should be guidance-only; it should shape prompt and expected output, not silently alter tools, model selection, or runtime policy
- The explicit parameter name should be `preset`, not `mode`, because it signals a lightweight template rather than a runtime behavior switch
- Preset guidance should be prepended before the user prompt so the preset establishes the working frame and the user prompt supplies task-specific context
- Preset usage should be visible in the UI or debug surface so users can tell when `preset` affected a `spawn` call
- If the user prompt conflicts with preset guidance, the user prompt should win; preset v1 is assistive guidance, not enforced policy
- Preset visibility in v1 should use a lightweight badge in collapsed UI plus expanded detail that reveals the preset guidance when needed
- Preset v1 should use a fixed enum surface limited to `scout`, `planner`, and `reviewer`
- `prompt` should remain required even when `preset` is present; v1 should not introduce preset-only default tasks
- Each preset should contribute a fairly opinionated default output shape so the feature delivers real consistency gains instead of acting as a weak label
- Expanded detail should show a clean summary of what the preset adds rather than dumping the literal internal guidance text
- Each preset in v1 should have one fixed default output shape so the feature is easy to explain, test, and validate
- If the user explicitly asks for a different output format, that request should fully override the preset's fixed default shape because the user prompt remains authoritative
- Expanded preset detail in v1 should stay compact: show the preset intent and default output shape, but not broader conflict/policy text

## Open questions
- What exact PRD wording best captures the replacement-vs-minimality balance?
- What implementation slices should later be planned first after PRD?

## Need research?
Maybe. Need targeted code and package inspection, not broad external research, unless benchmarking or compatibility constraints require it.

## Need prototype?
No. The v1 concept is narrow and concrete enough to go straight to PRD without a separate prototype.

## Biggest risk
The project may quietly drift from a minimal spawn replacement into a heavier subagent runtime if future preset additions expand beyond the current narrow guidance-only boundary.

## Recommended next step
Move to PRD follow-up and specify the narrow `timeout` addition as the next small extension of the current `spawn` design.

## V2 follow-up seed — timeout
- Selected direction: add `timeout` next, ahead of broader v2 ideas.
- Why this one: it is the highest-value reliability improvement that still fits the current minimal `spawn` boundary.
- Refined problem statement: long or hung child runs currently rely on provider/session behavior rather than an explicit caller-controlled bound.
- Refined desired outcome: callers can bound a `spawn` run explicitly without changing the core mental model of one focused delegation task.
- Constraints:
  - keep `spawn` minimal rather than platform-like
  - preserve compatibility for normal calls that omit `timeout`
  - do not bundle this with chain/fan-in/orchestration work
  - avoid hidden runtime-policy changes beyond the explicit parameter
- Decision map:
  - API surface: optional `timeout` parameter vs config-only behavior
  - Semantics: hard fail on timeout vs degraded/fallback return
  - Units/default: milliseconds vs seconds, and whether there is any default bound
  - UI: where timeout state should appear without cluttering normal results
  - Scope boundary: single-call timeout only vs broader concurrency/queue controls
- Decisions made:
  - `timeout` should be an explicit optional per-call `spawn` parameter
  - hitting `timeout` should be treated as a hard failure, not degraded-success
  - the public unit should be milliseconds
  - calls that omit `timeout` should remain compatible and unbounded in v2
  - timeout should surface as a normal explicit error, not a new persistent badge or status mode
  - validation can stay lightweight and repo-local: smoke validation only, covering no-timeout compatibility, timeout-triggered hard fail, UI/error text inspection, and normal non-timeout success behavior
- Open questions:
  - none at the idea stage
- Current status: Phase 1 idea refinement for the timeout follow-up is ready for PRD.

## Handoff to PRD
- [x] V1 UX surfaces are explicitly chosen
- [x] Active-spawn widget behavior is explicitly chosen
- [x] Success criteria for UI/UX are written down
- [x] Performance goals are measurable and secondary
- [x] Non-goals prevent drift into a full subagent platform
- [x] Lightweight validation approach is defined
- [x] Preset surface decision is resolved
- [x] Preset contract and override behavior are explicit enough to specify
- [x] Timeout API shape is explicitly chosen
- [x] Timeout failure semantics are explicitly chosen
- [x] Timeout default/compatibility behavior is explicitly chosen
- [x] Timeout UI visibility is explicitly chosen
- [x] Timeout validation approach is defined

Ready for next phase: yes
Primary blocker: none
