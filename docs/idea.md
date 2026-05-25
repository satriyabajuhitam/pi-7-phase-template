# Idea

## Problem statement
The repo-local `spawn` replacement on `exp/pi-spawn` now has improved UI/UX, guidance-only presets, and explicit per-call timeout support. The most visible remaining trust gap is completion reliability: child runs still sometimes finish without calling `return_result`, which forces the parent into the current degraded-success fallback path.

That fallback is useful for debugging, but it weakens confidence because a run can appear operationally successful while still violating the intended completion contract.

## Desired outcome
Add one narrow follow-up that makes `spawn` completion more trustworthy by reducing or clarifying missing-`return_result` cases without changing the minimal mental model of one tool, one focused delegation task.

After this follow-up:
- missing-`return_result` cases should happen less often, or be more clearly framed when they do happen
- normal successful runs should still feel lightweight and compatible
- the branch should preserve the distinction between true success, degraded-success fallback, and hard failure
- `spawn` should still feel like a focused delegation primitive, not a workflow engine or job-control UI

## Scope
- improve completion reliability around `return_result`
- keep the current `spawn` public shape minimal unless a very small explicit surface change becomes clearly necessary
- preserve the existing timeout behavior and preset behavior
- improve trust in result classification and completion semantics
- validate with lightweight repo-local evidence

## Non-goals
- turning `spawn` into a full subagent platform
- adding retries, queueing, scheduling, bounded parallelism, or worker pools
- adding chain, fan-in, aggregator, or multi-step orchestration behavior
- adding a persistent completion dashboard, task history, or job-control mode
- solving broader long-session memory or compaction continuity problems
- introducing implementation-oriented presets or specialist-agent catalogs

## Constraints
- preserve the minimal `spawn` mental model
- preserve compatibility for ordinary successful calls
- keep the feature narrow enough for a small PRD follow-up
- avoid hidden global runtime-policy changes unless explicitly justified
- keep validation lightweight; this repo still has no stable harness for full internal `spawn`/TUI assertions

## Assumptions
- the biggest remaining user-trust problem is degraded-success caused by missing `return_result`, not lack of another orchestration feature
- improving completion reliability is higher value than adding new delegation modes right now
- this can likely be improved without adding a second major public API knob
- timeout support already covers the main "run too long/hung" reliability case, so the next best step is completion-discipline reliability

## Decision map
- Contract posture: improve behavior only vs add a tiny explicit contract/control surface
- Runtime posture: stronger completion discipline vs permissive fallback-first behavior
- UX posture: clarify degraded-success more vs try to hide it
- Validation posture: lightweight smoke/source evidence vs new harness investment
- Scope boundary: completion reliability only vs broader reliability/platform expansion

## Questions asked
- After presets and timeout, what is the highest-value next improvement that still fits the minimal `spawn` boundary?
- Is the remaining pain primarily timeout-related, orchestration-related, or completion-contract-related?
- Should the next version focus on adding more capabilities or making current success semantics more trustworthy?
- Does fixing missing-`return_result` behavior stay within the intended product boundary?

## Decisions made
- the next version should focus on completion reliability rather than new orchestration features
- the main target is missing-`return_result` degraded-success behavior
- preserving the distinction between true success, degraded-success fallback, and hard failure is important for user trust
- this follow-up should stay narrow and should not expand into retries, queueing, bounded parallelism, or chain/fan-in behavior
- the repo should stay with lightweight validation rather than building a large new harness for this step
- the next phase should be PRD once the narrow boundary is captured clearly enough

## Open questions
- should the follow-up remain fully behavior-only, or is one tiny explicit user-facing control justified if fallback handling needs sharper caller intent?
- is the better path to reduce missing-`return_result` incidence, tighten result classification, improve prompting discipline, or some combination of the three?
- should strictness remain opt-in only, or does the current degraded-success default need a narrower refinement?

## Need research?
No external research is currently needed. The problem is local to the repo's current `spawn` behavior and can be specified from existing branch artifacts plus targeted code inspection.

## Need prototype?
No. This follow-up is narrow enough to go directly to PRD once the behavior boundary is written clearly.

## Biggest risk
The project could overreact to degraded-success pain by adding heavier reliability controls that push `spawn` toward platform-like workflow management instead of simply making completion semantics more trustworthy.

## Recommended next step
Move to PRD follow-up for a narrow completion-reliability improvement centered on missing-`return_result` behavior.

## V3 follow-up seed — completion reliability
- Selected direction: improve completion reliability next, ahead of bounded parallelism or any broader orchestration idea.
- Why this one: it addresses the most visible remaining trust gap while still fitting the repo's minimal `spawn` boundary.
- Refined problem statement: child runs still sometimes finish without calling `return_result`, which forces the parent into a degraded-success fallback path that is useful for debugging but weakens confidence in result semantics.
- Refined desired outcome: `spawn` results should more reliably reflect whether the child actually completed the intended contract, while still preserving a small, practical debugging fallback when appropriate.
- Constraints:
  - keep `spawn` minimal rather than platform-like
  - preserve compatibility for normal successful calls
  - do not bundle this with retries, queueing, concurrency controls, or orchestration work
  - avoid inventing a broad new public control surface unless clearly necessary
- Decision map:
  - runtime discipline: stronger prompt/contract enforcement vs current permissive fallback posture
  - result semantics: when degraded-success is still acceptable vs when failure should be explicit
  - caller control: no new control surface vs one tiny explicit strictness refinement
  - UX: how clearly fallback state should be shown without making all results heavier
- Initial decisions:
  - keep the focus on missing-`return_result` reliability, not on new delegation modes
  - preserve the distinction between degraded-success fallback and true success
  - keep any solution narrow enough to validate with repo-local smoke evidence and source inspection
  - treat bigger orchestration or concurrency ideas as separate future work, not as part of this follow-up
- Open questions:
  - what is the smallest safe behavior change that improves trust without breaking normal usage expectations?
  - should the default degraded-success posture stay as-is, become narrower, or become easier for callers to opt out of?
- Current status: Phase 1 idea refinement for the completion-reliability follow-up is ready for PRD drafting.

## Handoff to PRD
- [x] The next problem focus is explicit
- [x] The desired outcome is explicit
- [x] Scope boundaries are explicit
- [x] Non-goals prevent drift into orchestration or job-control behavior
- [x] Constraints are visible enough to shape a narrow PRD
- [x] Research is not required before PRD
- [x] Prototyping is not required before PRD

Ready for next phase: yes
Primary blocker: none
