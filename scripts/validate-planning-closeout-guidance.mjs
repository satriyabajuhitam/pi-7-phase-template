#!/usr/bin/env node

import { readFile } from 'node:fs/promises';

const CHECKS = [
  {
    category: 'execution-brief threshold',
    path: '.pi/skills/issues-me/SKILL.md',
    checks: [
      {
        label: 'defines an explicit execution-brief threshold',
        includes: 'Execution-brief threshold:',
      },
      {
        label: 'defaults to omitting the brief when the ticket is already clear enough',
        includes:
          'omit the execution brief by default when the ticket is already straightforward enough to execute safely from its goal, scope, and acceptance criteria alone',
      },
      {
        label: 'requires deleting the empty placeholder when the brief is omitted',
        includes:
          'remove the `Execution brief (optional)` section entirely rather than leaving an empty placeholder in trivial tickets',
      },
    ],
  },
  {
    category: 'execution-brief threshold',
    path: '.pi/skills/issues-me/assets/issues-template.md',
    checks: [
      {
        label: 'keeps the section optional',
        includes: 'Execution brief (optional):',
      },
      {
        label: 'tells planners to delete the section when not needed',
        includes: 'delete this whole section rather than leaving an empty placeholder',
      },
    ],
  },
  {
    category: 'execution-brief threshold',
    path: 'AGENTS.md',
    checks: [
      {
        label: 'keeps repo-level Phase 5 wording aligned with the threshold',
        includes: 'Allow short optional execution briefs only when a non-trivial ticket actually needs them',
      },
    ],
  },
  {
    category: 'finish bounded repo-state posture',
    path: '.pi/skills/finish-me/SKILL.md',
    checks: [
      {
        label: 'names the bounded default repo-state set',
        includes: 'Default allowed set:',
      },
      {
        label: 'defines downgrade behavior for unavailable repo-state signals',
        includes: 'If repo-state signals are relevant but unavailable, unverified, or inaccessible:',
      },
      {
        label: 'defines default exclusions to avoid closeout scope creep',
        includes: 'Default exclusions unless the user explicitly asks for more:',
      },
    ],
  },
  {
    category: 'finish bounded repo-state posture',
    path: 'AGENTS.md',
    checks: [
      {
        label: 'keeps repo-level finish guidance bounded',
        includes: 'Keep repo-state checks lightweight and bounded to the smallest signals that materially affect closeout judgment',
      },
      {
        label: 'forbids inferring merge readiness from unchecked repo-state signals',
        includes: 'it must not infer merge readiness from repo-state signals that were never actually checked',
      },
    ],
  },
];

function summarizeMachineChecks() {
  return [
    '- `node scripts/validate-readiness-gates.mjs` checks active `docs/idea.md` / `docs/prd.md` handoff structure, blocker semantics, checklist readiness, and the exact PRD planning-approval signal when `docs/prd.md` is ready for planning.',
    '- `node scripts/validate-planning-closeout-guidance.mjs` checks that the hardened execution-brief and `finish-me` guidance anchors still exist across the core skill, template, and repo-policy surfaces.',
  ];
}

function summarizeManualChecks() {
  return [
    '- This script does not prove live issues-planning or finish-review behavior end-to-end.',
    '- It does not judge whether the wording is the best possible wording; it only checks that the current bounded rules still exist on the expected surfaces.',
    '- Human review is still needed for broader workflow fit, over-ceremony risk, and any future change that intentionally alters the rule wording or semantics.',
  ];
}

async function run() {
  const results = [];

  for (const target of CHECKS) {
    let content;
    try {
      content = await readFile(target.path, 'utf8');
    } catch (error) {
      results.push({
        target,
        status: 'error',
        errors: [`could not read file: ${error.message}`],
      });
      continue;
    }

    const errors = target.checks
      .filter((check) => !content.includes(check.includes))
      .map((check) => `missing check anchor: ${check.label}`);

    results.push({
      target,
      status: errors.length > 0 ? 'error' : 'ok',
      errors,
    });
  }

  console.log('Planning/closeout guidance assurance (local advisory)');
  console.log('====================================================');

  for (const result of results) {
    if (result.status === 'ok') {
      console.log(`PASS  ${result.target.path} — ${result.target.category}`);
      continue;
    }

    console.log(`FAIL  ${result.target.path} — ${result.target.category}`);
    for (const error of result.errors) {
      console.log(`  - ${error}`);
    }
  }

  console.log('');
  console.log('Machine-checked by current local assurance path:');
  for (const line of summarizeMachineChecks()) {
    console.log(line);
  }

  console.log('');
  console.log('Still manual / reviewer-judgment dependent:');
  for (const line of summarizeManualChecks()) {
    console.log(line);
  }

  const failureCount = results.filter((result) => result.status === 'error').length;
  if (failureCount > 0) {
    console.log('');
    console.log('Advisory: fix the missing anchors above before trusting the hardened planning/closeout guidance to be in sync.');
    process.exitCode = 1;
    return;
  }

  console.log('');
  console.log('Advisory: planning/closeout guidance anchors look present across the expected hardened surfaces.');
}

run().catch((error) => {
  console.error(`Guidance assurance crashed: ${error.message}`);
  process.exitCode = 1;
});
