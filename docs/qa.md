# QA

## Objective
- Verify that the first context-hardening pass actually makes `idea -> prd` and `prd -> issues` handoffs explicit, blocks premature progression, and preserves continuity across artifacts.

## Scope under test
- Features or flows under review:
  - `docs/idea.md` handoff gate for `idea -> prd`
  - `docs/prd.md` handoff gate for `prd -> issues`
  - prompt guardrails in `.pi/prompts/idea.md`, `.pi/prompts/prd.md`, and `.pi/prompts/issues.md`
  - PRD template propagation via `.pi/skills/prd-me/assets/prd-template.md`
  - continuity of the simulated `idea -> prd -> issues` flow
- Completed tickets included:
  - `ISSUE-001`
  - `ISSUE-002`
  - `ISSUE-003`
- Explicitly out of scope for this pass:
  - execution/QA handoff hardening beyond these two transitions
  - CI or automated validator setup
  - release/versioning policy changes

## Source artifacts
- `docs/prd.md`
- `docs/issues.md`
- Other relevant sources:
  - `docs/idea.md`
  - `AGENTS.md`
  - `.pi/prompts/idea.md`
  - `.pi/prompts/prd.md`
  - `.pi/prompts/issues.md`
  - `.pi/skills/prd-me/assets/prd-template.md`

## Build / revision under review
- Branch / commit / working tree context:
  - Branch: `context-hardening`
  - Commit: `c5cf63f`
  - Working tree: clean relative to `HEAD`, branch is `ahead 1` of `origin/context-hardening`
- Environment notes:
  - QA evidence in this pass is based on artifact inspection, prompt inspection, continuity simulation evidence from `ISSUE-003`, and `git diff --check`
  - No dedicated automated test harness exists for these markdown/prompt workflow changes

## Test scenarios
1. Verify `docs/idea.md` contains `## Handoff to PRD` with checkbox checklist, `Ready for next phase: yes/no`, and `Primary blocker` behavior.
2. Verify `docs/prd.md` and the PRD template asset contain `## Handoff to Issues` with checkbox checklist, `Ready for next phase: yes/no`, and `Primary blocker` behavior.
3. Verify prompts block forward movement when the relevant handoff is not ready and require the handoff section to be updated before closure.
4. Verify continuity across `docs/idea.md` -> `docs/prd.md` -> `docs/issues.md` without needing prior context to be manually restated.

## Edge cases to verify
- Invalid input:
  - readiness marked `yes` while checklist evidence is incomplete
- Permissions / access:
  - normal repo write access is still sufficient; no new external system dependency introduced
- Empty state:
  - empty or missing source sections should be treated as not ready rather than implicitly complete
- Error state:
  - prompts should route back to blocker/gap instead of silently advancing the phase
- Retry / duplicate action:
  - handoff sections may be revisited and updated multiple times before they become ready
- External dependency failure:
  - none relevant in this pass because no external service is involved

## Human review checklist
- UX and behavior consistency:
  - confirm the new handoff sections feel lightweight rather than bureaucratic
- Copy / labeling sanity:
  - confirm `Handoff to PRD`, `Handoff to Issues`, `Ready for next phase`, and `Primary blocker` are understandable to future users
- Security sanity check:
  - no security-sensitive behavior introduced; repo-local markdown/prompt changes only
- Performance sanity check:
  - no runtime/performance impact expected
- Maintainability / readability spot check:
  - confirm `AGENTS.md` and prompt wording stay aligned and do not duplicate conflicting rules

## Known risks
- Human reviewers may still find the new handoff sections slightly process-heavy even though they are minimal.
- There is still no automated enforcement for inconsistent checkbox state versus `Ready for next phase` value.

## Findings
- Pass:
  - `docs/idea.md` exposes `## Handoff to PRD` with the agreed checklist, `Ready for next phase: yes`, and `Primary blocker: none`.
  - `docs/prd.md` exposes `## Handoff to Issues` with the agreed checklist, `Ready for next phase: yes`, and `Primary blocker: none`.
  - `.pi/prompts/idea.md` blocks PRD recommendation when `## Handoff to PRD` is not ready.
  - `.pi/prompts/prd.md` requires `## Handoff to Issues` to be updated before closing and blocks planning recommendation when not ready.
  - `.pi/prompts/issues.md` checks `## Handoff to Issues` before allowing planning.
  - `.pi/skills/prd-me/assets/prd-template.md` now carries the handoff structure forward for future PRD runs.
  - Continuity evidence exists across `docs/idea.md`, `docs/prd.md`, and `docs/issues.md` without manual context restatement.
  - `git diff --check` passed for the touched docs/prompts.
- Fail:
  - none observed from current evidence
- Uncertain:
  - whether future users will perceive the handoff sections as appropriately lightweight without a short human readability pass
  - whether later transitions (`issues -> execute`, `execute -> qa`) will need similar hardening soon

## Follow-up issues
- New AFK tickets:
  - none from this QA pass
- New HITL tickets:
  - none required yet
- Existing tickets to reopen or unblock:
  - none; no failure found that clearly belongs back in `ISSUE-001`, `ISSUE-002`, or `ISSUE-003`

## Release / sign-off recommendation
- Ready for release:
  - yes, for branch push/PR based on current evidence
- Ready for next execution pass:
  - no additional AFK execution is required for the scoped hardening work
- Blocked pending HITL:
  - no hard blocker, but a quick human readability review is still useful
- Needs more testing:
  - not required for this scoped markdown/prompt change set unless a reviewer wants a broader manual workflow rehearsal

## Next step
- Recommended action:
  - push `context-hardening` and open a PR, with optional quick human readability review of the new handoff wording
- Why:
  - the scoped work is implemented, the planned simulation passed, no follow-up execution ticket is currently justified, and the remaining uncertainty is review-oriented rather than implementation-oriented
