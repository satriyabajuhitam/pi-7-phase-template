# Phase Playbook

Use this as the default phase-aware delegation guide.

| Phase | Default parent posture | Good spawn use | Default mode tendency | Avoid |
|---|---|---|---|---|
| Phase 1 — Idea | Clarify scope and assumptions directly | pressure-test an existing idea artifact | no-spawn or single | turning critique into PRD writing |
| Phase 2 — Research | synthesize findings and gaps | isolate research questions, compare evidence, summarize gaps | single or parallel | broad unfocused exploration |
| Phase 3 — Prototype | author options directly | compare options, critique tradeoffs | single or parallel | delegating the whole prototype authoring loop |
| Phase 4 — PRD | write in one coherent parent voice | ambiguity scan, blocker scan, readiness review | single | outsourcing the whole PRD draft blindly |
| Phase 5 — Issues | author vertical slices directly | dependency scan, blocker diagnosis, plan critique | single or parallel | delegating issue creation without parent judgment |
| Phase 6 — Execution | implement exactly one ready ticket | execution-prep, file recon, risk scan for one ticket | single or serial | multi-ticket delegation, drifting into execution of more than one ticket |
| Phase 7 — QA | keep sign-off parent/HITL-led | scenario derivation, edge-case discovery, independent risk reads | single or parallel | replacing final human judgment |

## Strongest current fit in this repo
Based on the branch experiment, spawn has the strongest proven fit in:
- Phase 2 — Research
- Phase 5 — planning-readiness / blocker detection
- Phase 6 — execution preparation for one ready ticket

## Weakest current fit in this repo
Spawn is least useful for:
- tiny obvious edits
- direct implementation where the parent already knows the change
- final HITL decisions
