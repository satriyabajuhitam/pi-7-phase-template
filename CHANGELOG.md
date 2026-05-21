# Changelog

All notable changes to this repository will be documented in this file.

## [Unreleased]

### Added
- Readiness-gate validator for active `docs/idea.md` and `docs/prd.md`
- GitHub Actions workflow to run readiness validation in blocking CI mode
- QA artifact covering local validation, CI smoke testing, and release-signoff evidence

### Changed
- Hardened `idea -> PRD` handoff parity across Phase 1 skill, prompt, and guidance surfaces
- Hardened `PRD -> issues` handoff parity across Phase 4 and 5 skill, prompt, and guidance surfaces
- Documented validator usage, advisory vs blocking behavior, and clean template-state handling in `README.md`, `GUIDE.md`, and `MASTER_TEMPLATE.md`

### Notes
- Current hardening scope is intentionally limited to `idea -> PRD` and `PRD -> issues`
- Downstream handoffs such as `issues -> execute`, `execute -> QA`, and `QA -> release` remain out of scope for this release
