---
name: diagnose-me
description: Diagnose a bug, regression, flaky failure, or performance issue until there is a trustworthy feedback loop and a clear next step. Use when a bug is too ambiguous for direct execution or needs reproduction and isolation first.
---

# Diagnose Me

## When to use

- A bug report exists but the root cause is still unclear
- A QA finding needs reproduction or isolation before it can become execution work
- A ticket is blocked because the bug is too ambiguous to fix safely
- The failure is flaky, intermittent, or hard to pin down
- There is a performance regression that needs a reliable measurement loop before changes are made

## Do not use when

- The item is really a new requirement or enhancement rather than a bug
- The bug is already small, clear, and ready for a normal execution pass
- The main uncertainty is product scope or requirements rather than technical diagnosis
- The user wants a full implementation pass and the bug is already well specified
- The main need is to route a vague report to the right phase or artifact before diagnosis begins; use `triage-me`
- The bug is already isolated well enough that the next step is a normal one-ticket execution pass; use `execute-me`
- The main need is a structured QA plan or broader verification artifact rather than bug isolation; use `qa-me`
- The real blocker is external dependency behavior or vendor facts that need research more than technical isolation; use `research-me`
- The expected behavior is still too unclear because the requirement itself needs refinement; use `prd-me` or `grill-me`

---

## Workflow

### 0. Stay in diagnosis mode

While this skill is active:
- Do not jump straight into fixing the bug
- Do not recommend fixes or execution handoff before a trusted loop and root-cause-oriented investigation exist
- Focus on feedback loops, reproduction, hypotheses, and probes
- You may update `docs/issues.md` or `docs/qa.md` when the diagnosis outcome needs to be recorded
- Keep the diagnosis concise and execution-oriented

### 1. Inspect local context first

Before asking the user anything, inspect the relevant local artifacts if they exist:
- `docs/issues.md`
- `docs/qa.md`
- `docs/prd.md`
- `docs/research.md`
- `docs/idea.md` when expected behavior is still fuzzy
- relevant code, tests, scripts, configs, and logs

Use them to determine:
- the expected behavior
- the observed or reported failure
- whether this bug is already ticketed
- whether QA already captured evidence or follow-up notes
- whether the issue is still in scope or is actually new scope

If the area is unfamiliar, zoom out first:
- identify the relevant modules, entry points, and major callers
- describe the code path one layer above the immediate failure site
- use that map to decide where a trustworthy feedback loop should live

Do not ask the user for information that is already in the repo.

### 2. Build a feedback loop before theorizing or fixing

Do not move into free-form speculation or fix proposals until you have the best feedback loop you can build.

Prefer the smallest trustworthy loop in roughly this order:
1. a failing test through a public interface
2. a targeted command or script
3. a reproducible app run with explicit steps
4. replaying a captured input, fixture, or trace
5. a temporary harness for the narrow code path
6. a HITL manual loop only as a fallback

Improve the loop if possible:
- make it faster
- make it more deterministic
- make the assertion more specific to the real symptom

If you genuinely cannot build a usable loop, stop and say so explicitly.
Report what you tried and what missing input, access, or artifact is blocking diagnosis.

### 3. Reproduce the failure

Run the loop and classify the result as one of:
- `reproduced`
- `not reproduced`
- `cannot reproduce from current information`

Do not treat a nearby failure as success if it is not the same failure mode the user reported.

For flaky bugs, aim for a reproduction rate high enough to debug against rather than pretending the bug is deterministic.

### 4. Check recent changes before deeper theorizing

Before ranking hypotheses, inspect the most relevant recent changes when practical.

Examples:
- recent commits or diffs in the affected area
- new config or dependency changes
- environment differences between working and failing runs
- recently changed tests, fixtures, scripts, or prompts

If recent changes reveal a likely trigger, use that evidence to improve the hypothesis ranking rather than guessing broadly.

### 5. Generate ranked hypotheses

Before making deeper changes, generate **3–5 ranked hypotheses**.

Each hypothesis must be falsifiable and should follow this shape:
- `If <cause> is true, then <probe or change> should make <prediction happen>`

Avoid single-hypothesis tunnel vision.
If the user is present, show the ranked list briefly before testing. If not, proceed with the best ranking you have.

### 6. Probe and instrument carefully

Use the smallest probes that distinguish between hypotheses.

Preferred tools:
1. debugger or REPL inspection when available
2. targeted logs at the edges that separate hypotheses
3. timing/profiling measurements for performance issues

Rules:
- change one variable at a time
- never spray logs everywhere
- tag temporary debug logs with a unique prefix so cleanup is easy
- measure performance regressions before fixing them

Technique cues when relevant:
- **Backward tracing:** when the failure appears deep in a call stack, trace backward from the symptom to the immediate cause, then keep walking callers, inputs, and state until you find the original trigger
- **Boundary instrumentation:** when the failure crosses multiple modules, services, or layers, add evidence at the boundaries to show what enters, what exits, and where the behavior first diverges
- **Condition-based waiting:** for flaky or timing-sensitive failures, prefer waiting on the real condition with a timeout over arbitrary sleeps so the loop becomes more trustworthy

### 7. Conclude the diagnosis and route the next step

Close with one of these diagnosis outcomes:
- `needs-info`
- `needs-research`
- `ready-for-execution`
- `hitl`
- `not reproduced`

Typical routing:
- unresolved missing detail -> ask for `needs-info`
- external dependency uncertainty -> `needs-research`
- bug now isolated well enough to fix safely -> `ready-for-execution`
- environment access or human-only validation needed -> `hitl`
- no reliable repro after disciplined attempts -> `not reproduced`

### 8. Apply the minimum useful artifact update

If the diagnosis came from an existing ticket or QA finding, record the result in the smallest appropriate place.

Default artifact updates:
- `docs/issues.md`: when a bug ticket should be marked `blocked`, clarified, or made ready for later execution
- `docs/qa.md`: when the diagnosis is part of a QA finding trail
- `docs/research.md`: only when outside facts or vendor behavior become the real blocker

Do not create a new default artifact such as `docs/diagnose.md`.

### 9. Report the handoff clearly

End with a concise summary containing:
- `Issue summary`
- `Expected behavior`
- `Observed behavior`
- `Feedback loop`
- `Reproduction status`
- `Ranked hypotheses`
- `Current best explanation`
- `Recommended next step`

The next step should be concrete, such as:
- run `execute-me` on a clarified bug ticket when the outcome is `ready-for-execution`
- return to `triage-me` for routing
- gather more info from the reporter
- perform targeted research
- do HITL verification

---

## Default decision rules

Use this order as a starting point:

1. What behavior was expected?
2. What exactly is failing instead?
3. What is the smallest reliable loop that exercises the real failure?
4. Has the bug actually been reproduced?
5. What 3–5 plausible causes best explain the evidence?
6. What probe would best separate those causes?
7. Is the bug now clear enough for execution, or does it still need info, research, or HITL help?

---

## Gotchas

- Do not start fixing a bug before you have a loop you trust.
- Do not recommend fixes before root-cause-oriented investigation has made the failure meaningfully clearer.
- Do not confuse a nearby error with the reported failure.
- Do not jump from one vague intuition straight to code edits.
- Do not skip recent-change inspection when it is likely to narrow the search quickly.
- Do not stay buried in a tiny function if the real problem is understanding the surrounding module and caller path.
- Do not create a giant transcript of every probe; keep the outcome distilled.
- Do not leave temporary debug instrumentation behind.
- Do not create a new artifact when `docs/issues.md` or `docs/qa.md` is already the right home.

---

## Verification

Minimum smoke test:

```bash
/reload
/skill:diagnose-me
```

A good run of this skill produces:

**Opening:**
> States what bug or failure is being diagnosed and which local artifacts will be checked.

**During diagnosis:**
> Builds a feedback loop, attempts reproduction, generates ranked hypotheses, and runs focused probes.

**Artifact update:**
> Updates only the smallest useful existing artifact when the diagnosis result needs to be recorded.

**Closing:**
> Gives a concise diagnosis summary and a clear handoff such as `ready-for-execution`, `needs-info`, or `hitl`.

### Trigger validation

**Should trigger:**
- "Diagnose this bug report before we decide whether it is ready for execution."
- "Diagnose this QA finding and tell me whether it needs more info or can become a bug-fix ticket."
- "Diagnose this flaky test failure and propose the next step."

**Should not trigger:**
- "Route this vague report to the right phase and artifact." → use `triage-me`
- "Execute the next ready bug-fix ticket from `docs/issues.md`." → use `execute-me`
- "Create a QA plan from the PRD and current implementation state." → use `qa-me`
- "Research the provider behavior that might explain this integration failure." → use `research-me`
- "Refine the requirement because we still do not agree on expected behavior." → use `prd-me` or `grill-me`

**Borderline:**
- "This bug seems almost clear, but I still want confidence before we start fixing it." → use `diagnose-me` only if reproduction or isolation still materially reduces execution risk; otherwise hand off to `execute-me`

### Artifact verification

If the session records a diagnosis outcome:
- verify updates go only to the smallest useful existing artifact such as `docs/issues.md`, `docs/qa.md`, or `docs/research.md`
- verify the diagnosis records expected behavior, observed behavior, feedback loop, reproduction status, and recommended next step
- verify ranked hypotheses were generated rather than a single unsupported guess
- verify no unrelated implementation files were edited as part of diagnosis
- verify temporary debug instrumentation is not left behind
- verify the closing recommendation points to one clear handoff such as `execute-me`, `triage-me`, `research-me`, HITL, or more info gathering

### Smoke test

1. `/reload`
2. `/skill:diagnose-me`
3. Try prompts such as:
   - `Diagnose this bug report before we decide whether it is ready for execution`
   - `Diagnose this QA finding and tell me whether it needs more info or can become a bug-fix ticket`
   - `Diagnose this flaky test failure and propose the next step`
4. Verify that the agent:
   - checks local context first
   - builds or searches for a feedback loop before theorizing
   - reports reproduction status clearly
   - generates ranked hypotheses instead of a single guess
   - recommends one concrete next step without jumping straight into implementation
