#!/usr/bin/env node

import { readFile } from 'node:fs/promises';

const PLANNING_APPROVAL_VALUE = 'approved for issues planning (correctness and scope)';

const DEFAULT_TARGETS = [
  {
    kind: 'idea',
    path: 'docs/idea.md',
    handoffHeading: '## Handoff to PRD',
  },
  {
    kind: 'prd',
    path: 'docs/prd.md',
    handoffHeading: '## Handoff to Issues',
  },
];

const BLOCKER_PLACEHOLDERS = new Set([
  '',
  '-',
  'none',
  'n/a',
  'na',
  'tbd',
  'todo',
  'unknown',
  '...',
]);

function parseArgs(argv) {
  const targets = [];
  let mode = 'advisory';

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--idea') {
      const path = argv[i + 1];
      if (!path) {
        throw new Error('Missing path after --idea');
      }
      targets.push({
        kind: 'idea',
        path,
        handoffHeading: '## Handoff to PRD',
      });
      i += 1;
      continue;
    }

    if (arg === '--prd') {
      const path = argv[i + 1];
      if (!path) {
        throw new Error('Missing path after --prd');
      }
      targets.push({
        kind: 'prd',
        path,
        handoffHeading: '## Handoff to Issues',
      });
      i += 1;
      continue;
    }

    if (arg === '--ci') {
      mode = 'ci';
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return {
    mode,
    targets: targets.length > 0 ? targets : DEFAULT_TARGETS,
  };
}

function extractHandoffSection(lines, handoffHeading) {
  const startIndex = lines.findIndex((line) => line.trim() === handoffHeading);
  if (startIndex === -1) {
    return null;
  }

  let endIndex = lines.length;
  for (let i = startIndex + 1; i < lines.length; i += 1) {
    if (/^##\s+/.test(lines[i])) {
      endIndex = i;
      break;
    }
  }

  return lines.slice(startIndex, endIndex);
}

function findField(sectionLines, fieldName) {
  const matcher = new RegExp(`^${fieldName}:\\s*(.*)$`, 'i');
  for (const line of sectionLines) {
    const match = line.trim().match(matcher);
    if (match) {
      return match[1].trim();
    }
  }
  return null;
}

function findUncheckedChecklistItems(sectionLines) {
  return sectionLines
    .map((line) => line.match(/^\s*-\s*\[ \]\s+(.*)$/))
    .filter(Boolean)
    .map((match) => match[1].trim());
}

function normalizeReadiness(value) {
  return value.trim().toLowerCase();
}

function validateActiveArtifact(target, content) {
  const errors = [];
  const lines = content.split(/\r?\n/);
  const handoffSection = extractHandoffSection(lines, target.handoffHeading);

  if (!handoffSection) {
    errors.push(`missing required handoff section: ${target.handoffHeading}`);
    return errors;
  }

  const readinessRaw = findField(handoffSection, 'Ready for next phase');
  if (readinessRaw === null) {
    errors.push('missing field: Ready for next phase');
  }

  const blockerRaw = findField(handoffSection, 'Primary blocker');
  if (blockerRaw === null) {
    errors.push('missing field: Primary blocker');
  }

  const planningApprovalRaw =
    target.kind === 'prd' ? findField(handoffSection, 'Planning approval') : null;

  if (target.kind === 'prd' && planningApprovalRaw !== null) {
    const normalizedApproval = planningApprovalRaw.trim().toLowerCase();
    if (normalizedApproval !== PLANNING_APPROVAL_VALUE) {
      errors.push(
        `invalid Planning approval value: ${planningApprovalRaw} (expected ${PLANNING_APPROVAL_VALUE})`,
      );
    }
  }

  if (readinessRaw === null || blockerRaw === null) {
    return errors;
  }

  const readiness = normalizeReadiness(readinessRaw);
  if (readiness !== 'yes' && readiness !== 'no') {
    errors.push(`invalid readiness value: ${readinessRaw} (expected yes or no)`);
    return errors;
  }

  const blocker = blockerRaw.trim().toLowerCase();
  if (readiness === 'no' && BLOCKER_PLACEHOLDERS.has(blocker)) {
    errors.push('readiness is no, but Primary blocker is empty or placeholder-like');
  }

  if (readiness === 'yes') {
    if (target.kind === 'prd' && planningApprovalRaw === null) {
      errors.push('readiness is yes, but missing field: Planning approval');
    }

    const uncheckedItems = findUncheckedChecklistItems(handoffSection);
    if (uncheckedItems.length > 0) {
      errors.push(
        `readiness is yes, but checklist still has unchecked item(s): ${uncheckedItems.join('; ')}`,
      );
    }
  }

  return errors;
}

async function validateTarget(target) {
  let content;
  try {
    content = await readFile(target.path, 'utf8');
  } catch (error) {
    return {
      target,
      status: 'error',
      errors: [`could not read file: ${error.message}`],
    };
  }

  if (content.trim() === '') {
    return {
      target,
      status: 'inactive',
      errors: [],
    };
  }

  const errors = validateActiveArtifact(target, content);
  return {
    target,
    status: errors.length > 0 ? 'error' : 'ok',
    errors,
  };
}

async function main() {
  const { mode, targets } = parseArgs(process.argv.slice(2));
  const results = await Promise.all(targets.map(validateTarget));

  const isCiMode = mode === 'ci';
  console.log(
    isCiMode
      ? 'Readiness gate validation (CI blocking)'
      : 'Readiness gate validation (local advisory)',
  );
  console.log('========================================');

  for (const result of results) {
    const { target, status, errors } = result;
    if (status === 'inactive') {
      console.log(`SKIP  ${target.path} — empty template-state artifact`);
      continue;
    }

    if (status === 'ok') {
      console.log(`PASS  ${target.path} — handoff structure and readiness logic look valid`);
      continue;
    }

    console.log(`FAIL  ${target.path}`);
    for (const error of errors) {
      console.log(`  - ${error}`);
    }
  }

  const failureCount = results.filter((result) => result.status === 'error').length;
  if (failureCount > 0) {
    console.log('');
    console.log(
      isCiMode
        ? 'Blocking: fix the items above before merging or releasing.'
        : 'Advisory: fix the items above before handing off to the next phase.',
    );
    process.exitCode = 1;
    return;
  }

  console.log('');
  console.log(
    isCiMode
      ? 'Blocking check passed: no readiness-gate violations found in the checked active artifacts.'
      : 'Advisory: no readiness-gate violations found in the checked active artifacts.',
  );
}

main().catch((error) => {
  console.error(`Validator crashed: ${error.message}`);
  process.exitCode = 1;
});
