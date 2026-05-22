# QA

## Objective
- Verify the current `exp/pi-spawn` experiment branch is coherent enough for handoff and continued use as-is.

## Scope under test
- Features or flows under review:
  - upstream `pi-spawn` availability in repo sessions
  - `7-phase` spawn conventions
  - local `spawn-mode` policy guardrails
  - `delegate-me` delegation-planning behavior
  - single / parallel / serial delegation patterns
  - branch-facing guidance for experimental users
  - Phase 6 execution-prep behavior for one ready AFK ticket
- Completed tickets included:
  - ISSUE-001
  - ISSUE-002
  - ISSUE-003
  - ISSUE-004
  - ISSUE-005
  - ISSUE-006
  - ISSUE-007
  - ISSUE-008
- Explicitly out of scope for this pass:
  - custom spawn-engine work
  - long-session continuity / retrieval-backed memory
  - broader context-management platform design

## Source artifacts
- `docs/prd.md`
- `docs/issues.md`
- `docs/prototype/spawn-conventions.md`
- `docs/prototype/validation.md`
- `docs/prototype/real-flow-1-phase-2.md`
- `docs/prototype/real-flow-2-phase-5.md`
- `docs/prototype/real-flow-3-phase-6.md`
- `docs/pi-spawn.md`
- `docs/prototype/spawn-mode-spec.md`
- `docs/prototype/spawn-mode-validation.md`
- `.pi/extensions/spawn-mode.ts`
- `.pi/skills/delegate-me/SKILL.md`

## Build / revision under review
- Branch / commit / working tree context: `exp/pi-spawn` branch, working tree updated with experiment docs plus local delegation guardrails under `.pi/`
- Environment notes: upstream `npm:pi-spawn@0.1.0` is pinned project-locally; validation was based on artifact inspection, targeted Pi runs, and branch-local prototype notes

## Test scenarios
1. Confirm `spawn` is available and usable in repo sessions after reload.
2. Confirm the conventions support single, parallel, and serial delegation with strict output contracts.
3. Confirm `spawn-mode off` blocks guarded delegation entry points clearly.
4. Confirm backend-unavailable mode degrades to a no-spawn recommendation instead of a hard failure.
5. Confirm one real Phase 6 execution-prep flow returns exactly one ready AFK ticket and a concise brief.

## Edge cases to verify
- Invalid input:
  - prompts missing phase, scope, or source artifacts should be treated as non-standard use
- Permissions / access:
  - sub-agents only know the files they are given; no inherited parent context
- Empty state:
  - empty `docs/prd.md` / `docs/issues.md` should not fake readiness
- Error state:
  - `spawn` unavailable until package/session is active
  - local policy mode may intentionally block delegation while off
- Retry / duplicate action:
  - parallel spawns should remain independent; dependent tasks should stay serial
- External dependency failure:
  - if upstream package loading fails, execution-prep should stop early and surface the blocker

## Human review checklist
- UX and behavior consistency:
  - branch guidance matches the validated prototype behavior
- Copy / labeling sanity:
  - `docs/pi-spawn.md` clearly states this is an experiment branch
- Security sanity check:
  - sub-agent prompts stay file-grounded and avoid hidden context assumptions
- Performance sanity check:
  - delegation stays narrow and avoids broad, expensive prompts
- Maintainability / readability spot check:
  - guidance is short, reusable, and does not duplicate the prototype notes

## Known risks
- Evidence set is still small: three real flows plus guidance stabilization
- The branch is validated for delegation hygiene, not for long-session memory or broad standardization
- The upstream dependency is small and lightly adopted, so future maintenance continuity is not guaranteed
- The local guardrail layer is intentionally thin and still depends on Pi extension hook stability

## Findings
- Pass:
  - `pi-spawn` works in this repo and supports single, parallel, and serial patterns
  - `docs/prototype/spawn-conventions.md` and `docs/pi-spawn.md` provide usable branch-local guidance
  - local `spawn-mode` policy blocks guarded delegation cleanly while off
  - backend-unavailable behavior now degrades to a parent-only no-spawn recommendation instead of a hard dead-end
  - real Phase 2, Phase 5, and Phase 6 flows were validated against repo artifacts
  - one concise execution brief can be prepared for exactly one ready AFK ticket
  - HITL decision recorded: continue using the branch as-is; do not promote yet
  - the branch now has an explicit dependency-risk mitigation path: version pinning, fallback-to-single-agent behavior, and a fork-ready exit strategy
- Fail:
  - none found in the branch-local documentation workflow
- Uncertain:
  - broader team standardization still needs more real-world evidence before promotion
  - upstream maintenance continuity remains uncertain despite the small surface area of the dependency

## Follow-up issues
- New AFK tickets:
  - none required for the current branch-handoff state
- New HITL tickets:
  - none required immediately; the branch decision is already recorded
- Existing tickets to reopen or unblock:
  - none

## Release / sign-off recommendation
- Ready for release: no
- Ready for next execution pass: yes, if more validation is desired
- Blocked pending HITL: no
- Needs more testing: only if the branch is going to be promoted or standardized more broadly

## Next step
- Recommended action: hand off the branch as a stable experimental setup and keep using it as-is, with dependency-risk mitigation documented in `docs/prototype/spawn-mode-spec.md`
- Why: the experimental goal is met, and the branch now has a clearer fallback and fork-ready strategy without expanding into a custom spawn engine too early
