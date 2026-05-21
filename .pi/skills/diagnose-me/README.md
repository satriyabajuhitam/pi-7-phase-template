# diagnose-me

Project-local Pi skill for disciplined bug diagnosis.

## Purpose

Use this skill when a bug report, regression, flaky failure, performance issue, or QA finding is too ambiguous for direct execution and needs reproduction, isolation, and a trustworthy feedback loop first.

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

Then provide a prompt with a bug report, flaky failure, or QA finding and verify that the agent:
1. checks repo context first
2. builds or finds a feedback loop
3. reports whether the bug was reproduced
4. generates ranked hypotheses
5. recommends one concrete next step
