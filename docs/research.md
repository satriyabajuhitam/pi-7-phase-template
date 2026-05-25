# Research

## Objective
Identify which parts of Superpowers should be implemented in this repository so the Pi-oriented 7-phase workflow becomes **more reliable** without becoming much heavier, less Pi-native, or dependent on a full subagent framework.

## Questions to answer
- Which Superpowers practices materially improve reliability?
- Which of those fit this repo’s current 7-phase model and Pi usage?
- Which practices should be adapted rather than copied directly?
- Which Superpowers parts should be rejected because they add too much ceremony or change the product too much?
- What is the best adoption order for this repo?

## Scope
In scope:
- compare this repo’s current workflow artifacts and local skills against Superpowers skills
- focus on reliability improvements for discovery, planning, execution, diagnosis, QA, and closeout
- recommend what to adopt now, adapt later, or reject

Out of scope:
- full replacement of 7-phase with Superpowers
- turning `spawn` into a full subagent runtime
- mandatory worktree orchestration for all tasks
- implementation work in this research pass

## Sources
### Local repo
- `AGENTS.md`
- `README.md`
- `GUIDE.md`
- `.pi/skills/grill-me/SKILL.md`
- `.pi/skills/research-me/SKILL.md`
- `.pi/skills/prd-me/SKILL.md`
- `.pi/skills/issues-me/SKILL.md`
- `.pi/skills/execute-me/SKILL.md`
- `.pi/skills/qa-me/SKILL.md`
- `.pi/skills/triage-me/SKILL.md`
- `.pi/skills/diagnose-me/SKILL.md`
- `.pi/skills/delegate-me/SKILL.md`
- `.pi/prompts/execute.md`
- `.pi/prompts/qa.md`

### Superpowers
Upstream repo:
- `https://github.com/obra/superpowers`

Key files reviewed:
- `README.md`
- `skills/brainstorming/SKILL.md`
- `skills/writing-plans/SKILL.md`
- `skills/test-driven-development/SKILL.md`
- `skills/verification-before-completion/SKILL.md`
- `skills/requesting-code-review/SKILL.md`
- `skills/subagent-driven-development/SKILL.md`
- `skills/finishing-a-development-branch/SKILL.md`
- `skills/using-git-worktrees/SKILL.md`
- `skills/systematic-debugging/SKILL.md`
- `skills/systematic-debugging/root-cause-tracing.md`
- `skills/systematic-debugging/condition-based-waiting.md`
- `skills/systematic-debugging/defense-in-depth.md`

## Findings

### Summary judgment
Superpowers is strongest where this repo is currently lightest:
- execution rigor
- verification discipline
- structured review
- debugging method
- end-of-branch closeout

This repo is already stronger than Superpowers in:
- explicit phase structure
- repo-local artifact continuity under `docs/`
- optional research and prototype phases
- Pi-native prompt/skill ergonomics
- narrow, context-saving use of `spawn`

So the right move is **selective borrowing**, not replacement.

---

### Adopt now — highest ROI, lowest drift

#### 1. Verification-before-completion gate
**What Superpowers adds**
- no completion claim without fresh verification evidence
- forces a sequence: identify proof command -> run it -> read output -> verify claim -> only then report success

**Why it fits this repo**
- local `execute-me` already requires validation before `done`
- local `qa-me` already distinguishes evidence-based findings from planning-only QA
- this repo mainly needs a stricter and more explicit rule for how success claims are made

**Best local adaptation**
- add a short repo-wide rule to Phase 6 and Phase 7:
  - no `done`, `fixed`, `pass`, or `ready` claim without fresh evidence from the current run
- standardize completion report shape:
  - ticket ID
  - files changed
  - validation commands run
  - result summary
  - remaining risks or `none`

**Why this should be first**
- strongest reliability gain with very little process weight
- improves honesty and auditability across fresh sessions

#### 2. Stronger TDD proof for behavior-changing tickets
**What Superpowers adds**
- very strong TDD rule: no production code before a failing test
- insists on real RED -> GREEN proof, not “I added tests after”

**Why it fits this repo**
- local `execute-me` already prefers test-first execution when behavior changes are testable through a public interface
- the gap is not philosophy; the gap is enforcement strength

**Best local adaptation**
- for behavior-changing AFK tickets with a practical public-interface test:
  - test-first becomes default, not just preference
  - if TDD is skipped, the report must say why
  - docs/config/setup work stays exempt when TDD would expand scope artificially

**Why this should be second**
- biggest direct improvement to ticket-level correctness
- still compatible with this repo’s pragmatic one-ticket execution loop

#### 3. Root-cause-first diagnosis guardrail
**What Superpowers adds**
- a hard “no fixes without root cause investigation first” rule
- explicit attention to reproduction, recent changes, evidence gathering, and falsifiable hypotheses

**Why it fits this repo**
- local `diagnose-me` already emphasizes feedback loops, reproduction, and ranked hypotheses
- the missing piece is a firmer root-cause gate and a more explicit anti-guessing posture

**Best local adaptation**
- strengthen `diagnose-me` with:
  - explicit “do not propose fixes before a trusted loop and root-cause investigation”
  - “check recent changes” as a default step
  - named backward tracing for deep-call failures

**Why this should be third**
- prevents low-confidence execution work from entering Phase 6 too early
- especially valuable for flaky or cross-module failures

---

### Adapt carefully — strong value, but only in lighter Pi-native form

#### 4. Lightweight independent review with severity handling
**What Superpowers adds**
- review after major work or before merge
- findings handled by severity; important issues block progress

**Current local gap**
- this repo allows `spawn reviewer`, but does not standardize when review becomes required or how to classify findings

**Best local adaptation**
- require independent reviewer pass for:
  - high-risk Phase 6 tickets
  - merge/release readiness
  - shared-contract or multi-file changes
- classify findings as at least:
  - blocking
  - important
  - minor

**Why adapt, not copy**
- this repo should avoid mandatory reviewer subagents after every small ticket
- a risk-triggered review model fits Pi better

#### 5. Ordered review: requirement fit first, code quality second
**What Superpowers adds**
- separate review stages:
  1. spec compliance
  2. code quality
- prevents moving on while either review still has open issues

**Current local gap**
- local review is possible but still informal and often blended

**Best local adaptation**
- for risky tickets and QA sign-off:
  1. verify acceptance criteria / PRD fit first
  2. then verify quality / boundary drift / unnecessary expansion

**Why adapt, not copy**
- the ordered concept is valuable
- the full per-task implementer + spec reviewer + code reviewer loop is too heavy for this repo

#### 6. Lightweight PRD approval gate before planning
**What Superpowers adds**
- no implementation before a written design is presented and approved
- explicit user review of the written spec before moving on

**Current local gap**
- this repo has readiness gates for `idea -> PRD` and `PRD -> issues`
- but it does not explicitly require “review and approve the written PRD” before planning

**Best local adaptation**
- before `/issues`, require one explicit pass that the written `docs/prd.md` has been reviewed for correctness and scope
- keep it lightweight; do not force a large ceremony for tiny projects

#### 7. Scope-decomposition check for oversized requests
**What Superpowers adds**
- checks whether the project/request is really multiple subsystems and forces decomposition before planning

**Current local gap**
- this repo encourages vertical slices, but it lacks an explicit “stop, decompose this first” guard at idea/PRD/planning time

**Best local adaptation**
- add a rule in `grill-me`, `prd-me`, and `issues-me`:
  - if the request is too broad for one coherent PRD or one issue board, decompose it first

#### 8. Spec/plan self-review checklists
**What Superpowers adds**
- self-review for placeholders, contradictions, ambiguity, scope fit, and requirement coverage

**Current local gap**
- this repo has readiness validators and planning granularity review, but not a strong self-review checklist for PRD and planning quality

**Best local adaptation**
- add short post-draft checks in `prd-me` and `issues-me`:
  - ambiguity scan
  - contradiction scan
  - missing-edge-case scan
  - PRD-to-ticket coverage check

#### 9. Finish / merge-readiness helper
**What Superpowers adds**
- explicit closeout choices after work is complete
- verify tests before merge/PR/keep/discard decisions

**Current local gap**
- local flow stops around ticket completion and QA recommendation
- there is no small first-class “finish this branch / close this loop” helper

**Best local adaptation**
- add a lightweight helper such as `finish-me` or `merge-readiness`
- scope:
  - verify validation state
  - summarize residual risk
  - present next actions: keep, request HITL review, prepare PR, merge, or discard

**Why adapt, not copy**
- the decision menu is useful
- full worktree-aware branch-management ceremony is heavier than this repo needs by default

#### 10. Concrete debugging techniques: backward tracing, boundary instrumentation, condition-based waiting
**What Superpowers adds**
- backward data-flow tracing for deep call stacks
- evidence gathering at component boundaries in multi-layer systems
- condition-based waiting instead of arbitrary sleeps for flaky reproduction

**Current local gap**
- local `diagnose-me` already says to map modules/callers and improve feedback loops
- but it does not give these concrete named techniques

**Best local adaptation**
- add a short “techniques” section to `diagnose-me`:
  - trace backward from symptom to origin
  - instrument boundaries instead of spraying logs everywhere
  - prefer polling on real conditions over fixed sleeps in flaky investigations

---

### Reject for core workflow — useful ideas, wrong fit here

#### 11. Full subagent-driven development loop
**What Superpowers does**
- fresh implementer subagent per task
- spec review after each task
- code-quality review after each task
- continuous multi-task execution from the plan

**Why reject**
- this repo’s `spawn` doctrine is intentionally narrow and parent-led
- Phase 6 explicitly executes one ready AFK ticket per run
- adopting full subagent-driven development would turn this repo into a heavier orchestration system and blur ticket boundaries

#### 12. Mandatory git worktrees for all implementation
**What Superpowers does**
- enforces or strongly prefers isolated worktree setup before implementation

**Why reject for now**
- useful as an optional operator practice, but not a core reliability upgrade for this repo’s phase model
- it adds workspace-management ceremony that is not central to Pi-native artifact flow

#### 13. Full writing-plans style giant step-by-step plans for every change
**What Superpowers does**
- creates extremely detailed implementation plans with code snippets, exact commands, and micro-steps

**Why reject as default**
- too heavy for many tickets in this repo
- better to borrow only the idea of an optional execution brief for non-trivial tickets

#### 14. Defense-in-depth as a diagnosis requirement
**What Superpowers does**
- pushes layered hardening once root cause is known

**Why reject at research/diagnosis layer**
- valuable during execution and remediation
- not appropriate as a required early-phase research or diagnosis step

## Constraints and caveats
- This repo’s core strengths should be preserved:
  - explicit 7-phase structure
  - repo-local prompts and skills
  - `docs/` artifacts as source of truth
  - one-ticket-per-run execution discipline
  - selective use of `spawn` for context offloading
- The biggest adoption risk is **ceremony drift**:
  - copying Superpowers too literally would make the workflow slower, costlier, and less Pi-native
- The best improvements are mostly **behavioral guardrails**, not new infrastructure
- This research is based on skill and repo inspection, not on a live A/B evaluation of edited local skills

## Recommended approach
Adopt changes in this order:

1. **Phase 6 hardening first**
   - verification-before-completion gate
   - stronger TDD proof for behavior-changing tickets
   - risk-triggered independent review

2. **Diagnosis hardening second**
   - root-cause-first guardrail
   - backward tracing
   - boundary instrumentation
   - condition-based waiting for flake diagnosis

3. **Planning and handoff hardening third**
   - PRD approval gate before `/issues`
   - scope-decomposition check
   - PRD and issue self-review checklists
   - optional execution brief for non-trivial tickets

4. **Closeout helper last**
   - lightweight `finish-me` / merge-readiness helper

Recommended adoption model:
- **adapt, don’t transplant**
- keep new rules short and operational
- prefer changes to existing local skills over introducing many new top-level concepts
- add review triggers by risk, not by blanket mandate

## Open questions
- How strict should TDD become for Phase 6: “default with exceptions” or “required unless explicitly impossible”?
- Should high-risk-ticket review be encoded directly in `execute-me`, or left to a new helper/checklist?
- Should finish/merge-readiness be a separate helper skill, or a mode inside `qa-me`?
- Do we want optional execution briefs inside `docs/issues.md`, or should they remain implicit in skill behavior?
- How much explicit user sign-off should be required before `/issues` for small projects versus larger ones?

## Freshness note
Researched on 2026-05-25.

Superpowers evolves outside this repo, and this research reflects the upstream repo state inspected on that date. These recommendations are based on source review, not yet on live evaluation inside this repository after skill changes. Re-validate before adopting heavy or workflow-shaping changes.

## Next step
Recommended next step: **PRD**.

Reason:
- the research is now specific enough to define a narrow workflow-hardening change set
- the recommended improvements can be described as user-visible agent behavior and artifact behavior
- the remaining uncertainty is about scope choice and rollout order, not about whether research is still needed

Suggested PRD focus:
- “7-phase reliability hardening v1”
- scope the first slice to Phase 6 and diagnosis hardening only
- leave finish-helper and deeper planning changes as later slices unless explicitly prioritized now
