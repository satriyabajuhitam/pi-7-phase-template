# diagnose-me

Project-local Pi skill for disciplined bug diagnosis.

## Purpose

Use this skill when a bug report, regression, flaky failure, performance issue, or QA finding is too ambiguous for direct execution and needs reproduction, isolation, and a trustworthy feedback loop first.

## Use a different skill when

- you mainly need to route a vague report to the right phase or artifact before diagnosis begins → `triage-me`
- the bug is already isolated well enough that the next step is a normal execution pass → `execute-me`
- you need a structured QA plan or broader verification artifact rather than bug isolation → `qa-me`
- the real blocker is external dependency behavior or vendor facts that need research more than technical isolation → `research-me`
- the expected behavior is still too unclear because the requirement itself needs refinement → `prd-me` or `grill-me`

## Usage

```bash
/skill:diagnose-me
```

Example prompts:
- `Diagnose this bug report before we try to fix it`
- `Diagnose this QA finding and tell me whether it is ready for execution`
- `Diagnose this flaky failure and recommend the next step`

## Expected behavior

- inspects local artifacts first
- identifies expected versus observed behavior
- builds the smallest trustworthy feedback loop available
- attempts reproduction before theorizing freely
- generates 3–5 ranked hypotheses
- uses focused probes or instrumentation
- records the diagnosis outcome in the smallest useful existing artifact when needed
- recommends a concrete next step such as `ready-for-execution`, `needs-info`, or `hitl`
- does not jump straight into implementation

## Typical outcomes

- `needs-info`
- `needs-research`
- `ready-for-execution`
- `hitl`
- `not reproduced`

## Smoke test

```bash
/reload
/skill:diagnose-me
```

Then verify behavior with these prompts:

**Should trigger**
- `Diagnose this bug report before we try to fix it`
- `Diagnose this QA finding and tell me whether it is ready for execution`
- `Diagnose this flaky failure and recommend the next step`

**Should not trigger**
- `Route this vague report to the right phase and artifact.`
- `Execute the next ready bug-fix ticket from docs/issues.md.`
- `Create a QA plan from the PRD and current implementation state.`
- `Research the provider behavior that might explain this integration failure.`
- `Refine the requirement because we still do not agree on expected behavior.`

**Borderline**
- `This bug seems almost clear, but I still want confidence before we start fixing it.`

For a successful run, verify that the agent:
1. checks repo context first
2. builds or finds a feedback loop
3. reports whether the bug was reproduced
4. generates ranked hypotheses
5. updates only the smallest useful existing artifact when needed
6. recommends one concrete next step, such as `execute-me`, more info, research, or HITL
