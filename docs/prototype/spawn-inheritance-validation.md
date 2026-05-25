# Validation — child inheritance contract for `pi-spawn`

## Objective
Validate what a spawned child session actually inherits in this repository and compare it against the repo's desired inheritance-first posture.

## Scope
- upstream `pi-spawn@0.1.0`
- current repo-local extension and skill setup
- built-in tools
- extension resources and policy hooks
- skills
- immediate mismatch handling

## Desired contract for this repo
- child sessions inherit the parent agent's active built-in tools
- child sessions inherit normal project/global skills and prompt resources
- child sessions inherit loaded extension policy hooks by default
- child sessions exclude nested `spawn`
- child sessions may later gain explicit parent-side narrowing for tools / skills / extensions, but that is not implemented in this branch

## Validation method
1. Recreated the same child `DefaultResourceLoader` pattern used by upstream `pi-spawn` in `.pi/npm/node_modules/pi-spawn/index.ts`.
2. Applied the same `extensionsOverride` behavior that excludes only the upstream `pi-spawn` extension path.
3. Inspected loaded extensions via `resourceLoader.getExtensions()`.
4. Inspected loaded skills via `resourceLoader.getSkills()`.
5. Created an in-memory `AgentSession` with a small built-in allowlist and inspected `session.getAllTools()`.

## Observed behavior in the current repo setup
### Built-in tools
Validated behavior: **inherited as an active subset**.

Evidence:
- upstream code filters the parent active tools against `read`, `bash`, `edit`, `write`, `grep`, `find`, `ls` and passes the result into child session creation:
  - `.pi/npm/node_modules/pi-spawn/index.ts:263-266`
  - `.pi/npm/node_modules/pi-spawn/index.ts:286-295`
- local validation with an in-memory child session returned only the selected built-ins: `read`, `bash`, `edit`

Verdict:
- **matches the desired contract**

### Extensions and policy hooks
Validated behavior: **normal extensions are loaded into the child, except `pi-spawn` itself**.

Evidence:
- upstream child loader excludes only `SELF_PATH` for `pi-spawn`:
  - `.pi/npm/node_modules/pi-spawn/index.ts:250-259`
- validated loaded extensions in the current repo setup:
  - project-local: `.pi/extensions/spawn-mode.ts`
  - global: `~/.pi/agent/extensions/permission-gate/index.ts`
- both currently loaded extensions are policy/controller style extensions, not extra child tools:
  - `.pi/extensions/spawn-mode.ts:107-159`
  - `~/.pi/agent/extensions/permission-gate/index.ts:96-159`

Verdict:
- **matches the desired contract for policy-hook inheritance**
- `spawn` recursion is still blocked because the upstream extension excludes itself from the child loader

### Skills
Validated behavior: **normal discovered skills remain available to the child resource loader**.

Validated loaded project-local skills:
- `delegate-me`
- `diagnose-me`
- `execute-me`
- `firecrawl-cli`
- `grill-me`
- `issues-me`
- `prd-me`
- `prototype-me`
- `qa-me`
- `research-me`
- `triage-me`

Evidence:
- `DefaultResourceLoader` exposes normal discovered skills and upstream `pi-spawn` uses that loader for the child session:
  - `.pi/npm/node_modules/pi-spawn/index.ts:248-261`
- local validation via `resourceLoader.getSkills()` returned the project-local skill set above

Verdict:
- **matches the desired contract**

### Extension tools
Validated behavior in the **current repo setup**: **no extra extension tools are inherited**, because the loaded extensions here do not register child-facing tools.

Evidence:
- child session tool inspection returned only the selected built-ins in validation
- current loaded extensions are `spawn-mode` and `permission-gate`, both of which act as command / hook / policy layers rather than additional tools

Verdict:
- **no runtime mismatch found in this repo's current setup**
- future repos with tool-providing extensions should revalidate this explicitly

## Important nuance
The child inherits **resources and extension hooks**, not the parent's full session state.

Practical implication here:
- `spawn-mode` as an extension is loaded in the child resource set
- but child sessions are fresh in-memory sessions, so branch-persisted mode state is not automatically copied from the parent session history
- this is acceptable in the current branch because nested `spawn` is excluded upstream, so the child does not need to inherit the parent's delegation toggle state to stay safe

## Mismatch assessment
### Runtime mismatch in this repo
- **none that requires a branch-local implementation change now**

### Documentation/clarity gap to watch
- upstream `pi-spawn` README emphasizes built-in tool inheritance strongly, while the implementation also loads normal extensions and skills through `DefaultResourceLoader`
- in this repo that broader inheritance is desirable, so this is currently a **documentation clarity gap**, not a blocking runtime bug

## Decision
- **Accept the current behavior for this branch**
- do not fork or patch upstream yet for this specific issue
- if this branch is later promoted more broadly, consider an upstream documentation clarification so inheritance expectations are explicit

## Recommended next step
- update branch-facing guidance to state the validated inheritance behavior clearly
- keep future optional parent-side overrides as a documented future control surface, not current implementation scope
