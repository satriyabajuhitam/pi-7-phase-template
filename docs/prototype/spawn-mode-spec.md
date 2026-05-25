# Prototype Spec — `spawn-mode` Toggle

## Objective
Define a thin local extension that controls whether the repository may use upstream `pi-spawn` for delegation workflows.

## Why this spec exists
The branch experiment showed that upstream `pi-spawn` is useful, but it also introduced a dependency risk:
- the package is small and works today
- adoption appears limited
- future maintenance could stall unexpectedly

This spec keeps the repo **upstream-first, fork-ready**.

## Design goal
Do **not** reimplement `pi-spawn` now.

Instead:
- keep using upstream `pi-spawn` as the spawn engine
- add one local extension as a controller / gate
- let the repo fall back safely to parent-only workflow if the upstream backend is unavailable

## Command UX
### `/spawn-mode`
When the user runs `/spawn-mode`, the extension should:
1. show current mode status first
2. show backend health / availability before any choice is made
3. present a selection UI with:
   - `on`
   - `off`

Interactive expectation:
- the current status should be visible **above** the `on` / `off` choices, not only as a separate transient notification
- preferred summary shape:
  - `Current spawn mode: on|off`
  - `Spawn backend: available|unavailable`

Non-UI expectation:
- `/spawn-mode` with no args should still print or notify the current mode and backend health instead of returning silently

## State model
- `spawnMode: "on" | "off"`
- default: `off`

Reason for default `off`:
- explicit opt-in
- safer experimental posture
- no accidental dependency on delegation

## Mode behavior
### When mode is `on`
The extension should:
- allow `delegate-me` usage
- allow `spawn` tool usage when the backend is available
- verify that upstream `spawn` is actually available before treating the mode as healthy
- if the backend is unavailable, keep delegation planning available so `delegate-me` can return a no-spawn fallback verdict

Success message:
- `spawn mode enabled`

### When mode is `off`
The extension should:
- block `delegate-me`
- block `spawn`
- keep the repo on the normal single-agent workflow

Success message:
- `spawn mode disabled`

## Health check when enabling
When the user chooses `on`, the extension should verify that a `spawn` tool is available in the current session.

Status visibility rule:
- the current mode intent and backend health should remain visible in extension status text, not only in one-shot notifications

If `spawn` is available:
- mode stays `on`
- report success

If `spawn` is **not** available:
- do not pretend the system is healthy
- keep mode intent visible to the user
- allow delegation planning to degrade gracefully to a no-spawn verdict
- block actual `spawn` execution until the backend is restored

Recommended recovery message:
- `spawn backend unavailable. Reload the session or verify the project-local pi-spawn package is installed.`

## Guard rules
### Input guard
Intercept direct attempts to invoke:
- `/skill:delegate-me`

If mode is `off`, stop the request and show:
- `delegate-me is unavailable while spawn mode is off. Run /spawn-mode and choose on.`

### Tool guard
Intercept tool calls to:
- `spawn`

If mode is `off`, block the tool call and show:
- `spawn is disabled because spawn mode is off.`

## Fallback behavior
If upstream `pi-spawn` is missing, broken, or incompatible with a future Pi release, the local workflow should fail **softly**, not catastrophically.

Fallback policy:
- stay in single-agent mode for actual execution
- do not attempt fake delegation
- surface a clear backend-unavailable message
- keep `delegate-me` usable for no-spawn recommendations when policy mode is on
- keep all repo docs and skills usable without `spawn`

Recommended degraded-mode message:
- `spawn backend unavailable; falling back to parent-only workflow.`

## Dependency strategy
### Current strategy
- use upstream `pi-spawn`
- pin the version in `.pi/settings.json`
- keep local workflow abstractions branded around `spawn mode` / `delegation`, not around upstream internals

## Child session inheritance posture
Default desired contract for this repo:
- child sessions inherit the parent agent's active built-in tools
- child sessions inherit the parent agent's active extension tools when upstream Pi exposes them
- child sessions inherit normal project/global skills, prompt resources, and extension policy hooks
- child sessions inherit the parent model credentials and thinking level unless explicitly overridden

Optional future control surface:
- the parent may later narrow child scope with explicit allowlists or overrides for tools, skills, or extensions
- default posture remains **inherit first, restrict intentionally**

Branch policy implication:
- if upstream `pi-spawn` behavior diverges from this desired inheritance contract, record the gap as an upstream issue or fork-ready patch note instead of expanding immediately into a custom spawn engine

### Exit path if upstream stalls
If upstream maintenance stops:
1. keep the local UX the same
2. fork upstream `pi-spawn`
3. preserve the `spawn` tool contract if practical
4. switch package source to the maintained fork
5. only redesign the engine later if a fork is no longer enough

## Non-goals
- building a custom spawn engine now
- changing the `spawn` tool contract immediately
- auto-writing all handoff docs from the extension
- replacing single-agent execution as the default repo workflow

## Recommended implementation posture
Start with a **soft gate**:
- keep the upstream tool installed
- enforce policy through command + input guard + tool guard
- avoid complex active-tool mutation in v1

This keeps the extension small and lowers the risk of controller bugs.

## Decision summary
- use upstream `pi-spawn` now
- pin the version
- add local toggle and guardrails
- degrade safely to single-agent mode
- stay fork-ready if upstream maintenance stops
