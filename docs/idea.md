# Idea

## Problem statement
Current `pi-spawn` feels too minimal on the UI/UX side and may leave performance optimizations unexplored for real-world spawn workflows.

## Desired outcome
Create a replacement for `spawn` that keeps the same tool contract but delivers a clearly better user experience first, then targeted performance improvements.

## Scope
- Replace the current `spawn` implementation directly
- Keep the tool name and parameter contract compatible with existing `pi-spawn`
- Improve inline UI/UX first
- Improve measurable performance second

## Non-goals
- Turning `spawn` into a full subagent platform
- Changing the public tool API in v1
- Adding broad lifecycle/registry complexity unless later justified
- Adding an overlay conversation viewer in v1
- Adding persistent spawn history or a spawn registry in v1
- Adding a new background completion notification system in v1

## Constraints
- Must remain compatible with current `spawn` usage
- Should preserve the minimal mental model of one tool, one focused task
- Should be safer to adopt than a brand-new incompatible system

## Assumptions
- The current pain is more visible in UX than in raw runtime cost
- A better `spawn` can be built without abandoning the minimal model
- Direct replacement is acceptable if behavior stays compatible

## Decision map
- Product boundary: minimal replacement vs richer subagent platform
- Compatibility: preserve current `spawn` contract or not
- Priority: UI/UX first vs performance first
- UX surface: inline render only vs widget/status/overlay
- Performance target: actual bottlenecks vs speculative optimization

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

## Open questions
- What exact PRD wording best captures the replacement-vs-minimality balance?
- What implementation slices should later be planned first after PRD?

## Need research?
Maybe. Need targeted code and package inspection, not broad external research, unless benchmarking or compatibility constraints require it.

## Need prototype?
No. The v1 concept is narrow and concrete enough to go straight to PRD without a separate prototype.

## Biggest risk
The project may quietly drift from a minimal spawn replacement into a heavier subagent runtime without an explicit decision.

## Recommended next step
Move to PRD and turn these decisions into a concrete requirements document for the replacement `spawn` extension.

## Handoff to PRD
- [x] V1 UX surfaces are explicitly chosen
- [x] Active-spawn widget behavior is explicitly chosen
- [x] Success criteria for UI/UX are written down
- [x] Performance goals are measurable and secondary
- [x] Non-goals prevent drift into a full subagent platform
- [x] Lightweight validation approach is defined

Ready for next phase: yes
