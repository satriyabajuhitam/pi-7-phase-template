# QA

## Objective
- Verify that the repo-local `spawn` replacement is good enough for continued branch use after `ISSUE-001` through `ISSUE-006`, while making the remaining perceived-performance caveat explicit.

## Scope under test
- Features or flows under review:
  - repo-local `spawn` backend compatibility with the existing public tool contract
  - collapsed inline status-card readability
  - temporary active-spawn widget behavior during parallel runs
  - completion/error/fallback/truncation state clarity in a 3-parallel-spawn scenario
  - side-by-side baseline vs replacement verdict for readability and perceived slowness
- Completed tickets included:
  - ISSUE-001
  - ISSUE-002
  - ISSUE-003
  - ISSUE-004
  - ISSUE-005
  - ISSUE-006
- Explicitly out of scope for this pass:
  - overlay viewer or persistent spawn history
  - broad benchmark harness or deep performance profiling
  - long-session memory / background completion design
  - any API change to `spawn`

## Source artifacts
- `docs/prd.md`
- `docs/issues.md`
- Other relevant sources:
  - `docs/prototype/spawn-replacement-side-by-side-validation.md`
  - `.pi/extensions/spawn/index.ts`
  - `.pi/extensions/spawn-mode.ts`
  - `.pi/settings.json`

## Build / revision under review
- Branch / commit / working tree context:
  - current replacement branch with repo-local `spawn` extension under `.pi/extensions/spawn/index.ts`
- Environment notes:
  - upstream `npm:pi-spawn@0.1.0` is no longer loaded from `.pi/settings.json`
  - validation evidence comes from print-mode Pi checks, real `spawn` smoke execution, source inspection, a human side-by-side run, and a later perf-focused implementation pass

## Test scenarios
1. [Automated] Confirm the replacement branch still starts normally and exposes a `spawn` tool.
2. [Automated] Confirm one real `spawn` call can complete successfully without breaking the parent flow.
3. [Inspection] Confirm the replacement keeps the same public tool name/parameter contract and does not add forbidden v1 surfaces.
4. [Human] Run the shared 3-parallel-spawn comparison scenario and judge whether active-state readability is better than baseline.
5. [Human] Verify collapsed cards distinguish done, error, fallback/no-`return_result`, truncation, warning, and empty states without expansion.
6. [Human] Verify the temporary active-spawn widget appears only while work is active, shows up to 3 items, and collapses overflow.
7. [Human] Judge whether the replacement feels visibly slower than baseline in the same 3-parallel-spawn scenario.

## Edge cases to verify
- Invalid input:
  - invalid `spawn` inputs should continue to fail under the same public contract
- Permissions / access:
  - the replacement must not imply new powers beyond the existing `spawn` model
- Empty state:
  - empty output should still show as an explicit empty-result state
  - no active widget should remain after all spawns finish
- Error state:
  - strict failure and fallback/no-`return_result` paths should read differently from normal completion
- Retry / duplicate action:
  - repeated or parallel spawns should not leave stale widget state behind
- External dependency failure:
  - model/session/tool failures should surface as distinct errors rather than ambiguous text blobs

## Human review checklist
- UX and behavior consistency:
  - queued/running/done/error/fallback/warning/truncated/empty states are scan-friendly in normal terminal use
- Copy / labeling sanity:
  - `fallback` and `[no return_result]` wording is understandable and not misleadingly “successful”
- Security sanity check:
  - no new persistence or hidden context behavior is implied by the new UI
- Performance sanity check:
  - the replacement should not feel materially slower in the shared 3-parallel-spawn scenario
  - if it still feels slower, record whether that is acceptable for branch continuation versus broader release
- Maintainability / readability spot check:
  - the implementation remains a minimal `spawn` replacement, not a new subagent platform

## Known risks
- There is still no automated TUI render harness, so UX evidence depends on manual review plus source inspection.
- A non-strict child can still fall back to degraded-success when it does not call `return_result`, and strict child output may still surface fallback-style JSON-like content for debugging; this is currently treated as a UX/copy nuance rather than a branch blocker because the states are now clearly differentiated.
- Broader confidence still depends on continued real-world use, even though the current branch-level guardrails now pass.

## Findings
- Pass:
  - the replacement branch owns the only active `spawn` backend locally
  - print-mode startup checks succeeded
  - tool-availability checks confirmed `spawn` is present
  - real `spawn` smoke execution completed successfully and returned control to the parent flow
  - the replacement preserves the v1 `spawn` contract and avoids forbidden surfaces such as overlay/history/registry additions
  - side-by-side HITL re-checks showed better readability and clearer completion state than baseline
  - the `ISSUE-002` rework made fallback vs done easier to distinguish and made collapsed cards lighter to scan
  - the active-spawn widget behavior is implemented as transient in-memory state only
  - the first `ISSUE-006` perf-focused pass reduced one plausible source of avoidable UI overhead by batching partial stream updates and reusing one computed streaming preview across surfaces
  - the second `ISSUE-006` perf-focused pass further reduced partial-update work by shrinking the preview buffer window, increasing the update interval to 100ms, and sending only the compact preview text during streaming updates
  - the final HITL re-check after fresh reload reported that running-state UI felt lighter, parallel activity felt smoother to scan, and perceived performance was roughly at baseline parity for the shared 3-parallel-spawn scenario
  - the PRD performance guardrail is now satisfied for the current branch scope
- Fail:
  - none in the latest recorded branch state
- Uncertain:
  - whether the debugging-oriented fallback-style JSON-like strict output should later get copy refinement, even though the current UX distinguishes it clearly enough for operator use
  - how this branch will feel under broader real-world usage beyond the current validation scenario

## Follow-up issues
- New AFK tickets:
  - none required immediately from the current QA evidence
- New HITL tickets:
  - none required immediately for current branch sign-off
- Existing tickets to reopen or unblock:
  - none now
  - if broader real-world use reveals a new performance gap or confusing strict/fallback copy case, reopen the smallest fitting issue rather than guessing now

## Release / sign-off recommendation
- Ready for release:
  - yes, for the current repo-local branch scope and broader sign-off target captured in this plan
- Ready for next execution pass:
  - no immediate AFK pass is required
- Blocked pending HITL:
  - no
- Needs more testing:
  - only if the team wants additional confidence beyond the current branch-level sign-off scenario

## Next step
- Recommended action:
  - proceed to broader sign-off / handoff using the current branch state
- Why:
  - the latest HITL evidence after fresh reload shows that readability stays better than baseline, completion clarity stays better than baseline, and the performance guardrail is now satisfied for this branch scope
