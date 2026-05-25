# Changelog

All notable changes to this repository will be documented in this file.

## [Unreleased]

### Added
- Readiness-gate validator for active `docs/idea.md` and `docs/prd.md`
- GitHub Actions workflow to run readiness validation in blocking CI mode
- QA artifact covering local validation, CI smoke testing, and release-signoff evidence
- New lightweight `finish-me` skill and `/finish` prompt for evidence-aware closeout recommendations after execution and/or QA
- Local planning/closeout guidance assurance script at `scripts/validate-planning-closeout-guidance.mjs`
- Compact assurance reference at `docs/workflow-assurance-v3.md`

### Changed
- Hardened `idea -> PRD` handoff parity across Phase 1 skill, prompt, and guidance surfaces
- Hardened `PRD -> issues` handoff parity across Phase 4 and 5 skill, prompt, and guidance surfaces
- Documented validator usage, advisory vs blocking behavior, and clean template-state handling in `README.md`, `GUIDE.md`, and `MASTER_TEMPLATE.md`
- Hardened Phase 6 execution guidance so behavior-changing tickets now default to test-first execution when practical, require explicit skip reasons when TDD is bypassed, and require a minimum completion-evidence bundle before `done` claims
- Added clearer risky-review triggers and requirement-fit-first review ordering for execution and QA guidance
- Hardened diagnosis guidance with root-cause-first guardrails, recent-change inspection, backward tracing, boundary instrumentation, and condition-based waiting techniques
- Tightened QA and operator guidance so `pass` / `ready` / `sign-off` claims now require fresh evidence rather than implementation completion alone
- Hardened idea and PRD guidance so oversized requests are decomposed before being forced into one broad artifact, and PRD drafts now run explicit ambiguity / contradiction / missing-edge-case self-review before planning handoff
- Hardened Phase 5 planning so `/issues` now requires the exact PRD approval signal `Planning approval: approved for issues planning (correctness and scope)` in `## Handoff to Issues`, adds planning self-review for granularity / PRD coverage / avoidable ambiguity, and supports short optional execution briefs only when a non-trivial ticket actually needs them
- Bounded `/finish` repo-state checks to small relevant signals such as dirty working tree, relevant workflow-artifact presence, or current branch context, and now require downgrade when those signals are unavailable or unverified
- Extended the readiness validator so active ready PRDs must carry the exact planning-approval signal, and added a narrow advisory audit for execution-brief and `/finish` guidance anchors across core workflow surfaces
- Aligned `AGENTS.md`, `README.md`, `GUIDE.md`, and `MASTER_TEMPLATE.md` with the canonical planning approval signal, clarified execution-brief threshold, bounded `/finish` posture, and narrow planning/closeout assurance path
- Removed `runs-once` / `runs-afk` scripts, tests, docs, and related repo references

### Notes
- Current hardening scope now covers `idea -> PRD`, `PRD -> issues`, Phase 6 execution hardening, diagnosis hardening, QA/operator evidence-posture alignment, planning/handoff hardening, and lightweight closeout guidance
- The current validation is stronger than pure reviewer memory alone, but still does not include live end-to-end `/prd`, `/issues`, `/execute`, `/diagnose`, `/qa`, and `/finish` workflow simulation
- The workflow remains intentionally Pi-native and lightweight: no mandatory worktrees, no subagent-per-task execution model, no multi-step approval chain, and no broad `spawn` expansion into a full orchestration runtime
- Remaining watchpoints for future refinement include wording drift across many guidance surfaces, the anchor-string/advisory nature of the new planning/closeout audit, the blocking-CI ceremony level of the readiness validator, and keeping `/finish` bounded so repo-state checks do not grow into release-management scope
