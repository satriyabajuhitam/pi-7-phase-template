#!/usr/bin/env node

import { constants as fsConstants } from 'node:fs';
import { access, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ISSUE_HEADING = /^###\s+(ISSUE-\d+)\s+—\s+(.*)$/;
const FIELD_NAMES = ['Status', 'Type', 'Auto-run', 'Depends on'];
const EXECUTE_PROMPT_PATH = '.pi/prompts/execute.md';
const ISSUES_PATH = 'docs/issues.md';
const PRD_PATH = 'docs/prd.md';
const RESEARCH_PATH = 'docs/research.md';
const RUN_ARTIFACT_DIR = '.runs';
const RUN_SESSION_DIR = '.runs-sessions';

export function fail(message, details = []) {
  console.log('Status: FAIL');
  console.log(`Reason: ${message}`);
  for (const detail of details) {
    console.log(`- ${detail}`);
  }
  process.exitCode = 1;
}

export function runCommand(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd ?? process.cwd(),
    encoding: 'utf8',
    env: options.env ?? process.env,
  });

  return {
    status: result.status,
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
    error: result.error,
  };
}

export function requireCommand(command) {
  const result = runCommand('bash', ['-lc', `command -v ${command}`]);
  return result.status === 0;
}

export function git(args) {
  return runCommand('git', args);
}

export function getCurrentBranch() {
  const result = git(['rev-parse', '--abbrev-ref', 'HEAD']);
  if (result.status !== 0) {
    throw new Error(`could not determine current branch: ${result.stderr.trim() || result.stdout.trim()}`);
  }

  const branch = result.stdout.trim();
  if (branch === 'HEAD') {
    throw new Error('detached HEAD is not a safe starting point for runs-once.sh');
  }

  return branch;
}

export function ensureCleanWorkingTree() {
  const result = git([
    'status',
    '--porcelain',
    '--untracked-files=all',
    '--',
    '.',
    ':(exclude).runs',
    ':(exclude).runs-sessions',
  ]);
  if (result.status !== 0) {
    throw new Error(`could not inspect git status: ${result.stderr.trim() || result.stdout.trim()}`);
  }

  const output = result.stdout.trim();
  if (output !== '') {
    throw new Error('working tree is not clean; commit or stash local changes before running runs-once.sh');
  }
}

export async function ensureFileReadable(path) {
  try {
    await access(path, fsConstants.R_OK);
  } catch (error) {
    throw new Error(`required file is not readable: ${path}`);
  }
}

export function splitTicketSections(content) {
  const lines = content.split(/\r?\n/);
  const sections = [];
  let current = null;

  for (const line of lines) {
    const heading = line.match(ISSUE_HEADING);
    if (heading) {
      if (current) {
        current.excerpt = current.rawLines.join('\n').trim();
        sections.push(current);
      }
      current = {
        id: heading[1],
        title: heading[2].trim(),
        headingLine: line,
        lines: [],
        rawLines: [line],
      };
      continue;
    }

    if (current) {
      current.lines.push(line);
      current.rawLines.push(line);
    }
  }

  if (current) {
    current.excerpt = current.rawLines.join('\n').trim();
    sections.push(current);
  }

  return sections;
}

export function readField(lines, fieldName) {
  const matcher = new RegExp(`^-\\s*${fieldName}:\\s*(.*)$`, 'i');
  for (const line of lines) {
    const match = line.trim().match(matcher);
    if (match) {
      return match[1].trim();
    }
  }
  return null;
}

export function parseDependsOn(raw) {
  if (!raw) {
    return [];
  }

  if (raw.trim().toLowerCase() === 'none') {
    return [];
  }

  return raw.match(/ISSUE-\d+/g) ?? [];
}

export function parseTickets(content) {
  return splitTicketSections(content).map((section) => {
    const fields = Object.fromEntries(FIELD_NAMES.map((name) => [name, readField(section.lines, name)]));
    return {
      id: section.id,
      title: section.title,
      excerpt: section.excerpt,
      status: fields.Status?.toLowerCase() ?? '',
      type: fields.Type?.toLowerCase() ?? '',
      autoRun: fields['Auto-run']?.toLowerCase() ?? '',
      dependsOn: parseDependsOn(fields['Depends on']),
    };
  });
}

export function findFirstEligibleTicket(tickets) {
  const byId = new Map(tickets.map((ticket) => [ticket.id, ticket]));

  return tickets.find((ticket) => {
    if (ticket.status !== 'todo') {
      return false;
    }
    if (ticket.type !== 'afk') {
      return false;
    }
    if (ticket.autoRun !== 'yes') {
      return false;
    }

    return ticket.dependsOn.every((dependencyId) => byId.get(dependencyId)?.status === 'done');
  });
}

export function ensureSafeBranch(branch) {
  if (branch.startsWith('ralph/')) {
    throw new Error(`current branch ${branch} is already an issue branch; start runs-once.sh from the orchestrator branch`);
  }
}

export function ensureBranchDoesNotExist(branch) {
  const result = git(['rev-parse', '--verify', '--quiet', `refs/heads/${branch}`]);
  if (result.status === 0) {
    throw new Error(`target branch ${branch} already exists; resolve or delete it before running runs-once.sh again`);
  }
}

export function createIssueBranch(branch) {
  const result = git(['checkout', '-b', branch]);
  if (result.status !== 0) {
    throw new Error(`could not create branch ${branch}: ${result.stderr.trim() || result.stdout.trim()}`);
  }
}

function parseStatusPath(rawPath) {
  if (rawPath.includes(' -> ')) {
    return rawPath.split(' -> ').at(-1) ?? rawPath;
  }

  return rawPath;
}

function shouldPreserveBlockedPath(path) {
  return path === ISSUES_PATH || path.startsWith(`${RUN_ARTIFACT_DIR}/`) || path.startsWith(`${RUN_SESSION_DIR}/`);
}

export async function cleanupBlockedChanges() {
  const statusResult = git(['status', '--porcelain', '--untracked-files=all']);
  if (statusResult.status !== 0) {
    throw new Error(`could not inspect blocked-run changes: ${statusResult.stderr.trim() || statusResult.stdout.trim()}`);
  }

  const lines = statusResult.stdout.split(/\r?\n/).filter(Boolean);
  const trackedPaths = [];
  const untrackedPaths = [];

  for (const line of lines) {
    const status = line.slice(0, 2);
    const rawPath = line.slice(3).trim();
    const path = parseStatusPath(rawPath);
    if (!path || shouldPreserveBlockedPath(path)) {
      continue;
    }

    if (status === '??') {
      untrackedPaths.push(path);
      continue;
    }

    trackedPaths.push(path);
  }

  if (trackedPaths.length > 0) {
    const restoreResult = git(['restore', '--staged', '--worktree', '--source=HEAD', '--', ...trackedPaths]);
    if (restoreResult.status !== 0) {
      throw new Error(`could not discard blocked-run code changes: ${restoreResult.stderr.trim() || restoreResult.stdout.trim()}`);
    }
  }

  for (const path of new Set(untrackedPaths)) {
    await rm(path, { recursive: true, force: true });
  }
}

export function getTicketById(tickets, issueId) {
  return tickets.find((ticket) => ticket.id === issueId) ?? null;
}

function arraysEqual(left, right) {
  if (left.length !== right.length) {
    return false;
  }

  return left.every((value, index) => value === right[index]);
}

export function verifyTargetTicket(snapshot, currentTickets) {
  const current = getTicketById(currentTickets, snapshot.id);
  if (!current) {
    return {
      ok: false,
      reason: `target issue ${snapshot.id} is missing from docs/issues.md`,
    };
  }

  if (current.status !== 'todo' || current.type !== 'afk' || current.autoRun !== 'yes') {
    return {
      ok: false,
      reason: `target issue ${snapshot.id} is no longer ready for AFK execution`,
    };
  }

  if (!arraysEqual(current.dependsOn, snapshot.dependsOn)) {
    return {
      ok: false,
      reason: `target issue ${snapshot.id} has a material source-of-truth conflict in dependencies`,
    };
  }

  if (current.title !== snapshot.title || current.type !== snapshot.type || current.autoRun !== snapshot.autoRun) {
    return {
      ok: false,
      reason: `target issue ${snapshot.id} has a material source-of-truth conflict`,
    };
  }

  const byId = new Map(currentTickets.map((ticket) => [ticket.id, ticket]));
  if (!current.dependsOn.every((dependencyId) => byId.get(dependencyId)?.status === 'done')) {
    return {
      ok: false,
      reason: `target issue ${snapshot.id} is no longer ready because a dependency is not done`,
    };
  }

  return { ok: true };
}

export function parsePromptTemplateBody(content) {
  if (!content.startsWith('---\n') && !content.startsWith('---\r\n')) {
    return content;
  }

  const separator = content.includes('\r\n') ? '\r\n' : '\n';
  const lines = content.split(/\r?\n/);
  let closingIndex = -1;

  for (let index = 1; index < lines.length; index += 1) {
    if (lines[index] === '---') {
      closingIndex = index;
      break;
    }
  }

  if (closingIndex === -1) {
    return content;
  }

  return lines.slice(closingIndex + 1).join(separator).trim();
}

export function renderPromptTemplate(templateBody, argumentsText) {
  return templateBody
    .replace(/\$ARGUMENTS/g, argumentsText)
    .replace(/\$@/g, argumentsText)
    .trim();
}

export function formatRunTimestamp(date = new Date()) {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
}

export function buildRunBasename(issueId, date = new Date()) {
  const safeIssueId = issueId && issueId !== 'none' ? issueId : 'NO-ISSUE';
  return `${formatRunTimestamp(date)}-${safeIssueId}`;
}

export function buildRunPaths(issueId, date = new Date()) {
  const basename = buildRunBasename(issueId, date);
  return {
    basename,
    bootstrapPath: `${RUN_ARTIFACT_DIR}/${basename}.bootstrap.md`,
    resultPath: `${RUN_ARTIFACT_DIR}/${basename}.result.json`,
    sessionPath: `${RUN_SESSION_DIR}/${basename}.jsonl`,
  };
}

export function isResearchRequired(ticket) {
  return ticket?.excerpt?.includes(RESEARCH_PATH) ?? false;
}

export function buildBootstrapMarkdown({
  issueId,
  issueBranch,
  orchestratorBranch,
  sessionPath,
  targetTicket,
  researchRequired,
}) {
  const lines = [
    '# runs-once bootstrap',
    '',
    '## Run metadata',
    `- Issue target: ${issueId}`,
    `- Issue branch: ${issueBranch}`,
    `- Orchestrator branch: ${orchestratorBranch}`,
    `- Session path: ${sessionPath}`,
    '',
    '## Source of truth rules',
    `- ${ISSUES_PATH} is the source of truth for this run.`,
    '- Execute only the explicit issue target above.',
    '- Hard-fail if the target issue is missing, materially mismatched, or no longer ready.',
    '- Do not fallback to any other AFK ticket.',
    `- Do not load docs/idea.md as part of this v1 harness bootstrap.`,
    '',
    '## Required read order',
    '1. Review the selected issue excerpt below.',
    `2. Re-read ${ISSUES_PATH} and verify the same issue target before implementation.`,
    `3. Read ${PRD_PATH} for the requirements relevant to the selected ticket.`,
  ];

  if (researchRequired) {
    lines.push(`4. Read ${RESEARCH_PATH} because the selected ticket explicitly references it.`);
  } else {
    lines.push(`4. Do not read ${RESEARCH_PATH} by default for this run; it is not explicitly required by the selected ticket.`);
  }

  lines.push(
    '5. Continue with the existing repo execute workflow semantics for this issue only.',
    '',
    '## Artifact paths',
    `- ${ISSUES_PATH}`,
    `- ${PRD_PATH}`,
  );

  if (researchRequired) {
    lines.push(`- ${RESEARCH_PATH}`);
  }

  lines.push('', '## Selected issue excerpt', '```md', targetTicket.excerpt, '```');

  return lines.join('\n');
}

export function buildNoReadyBootstrapMarkdown({ orchestratorBranch }) {
  return [
    '# runs-once bootstrap',
    '',
    '## Run metadata',
    '- Issue target: none',
    `- Issue branch: ${orchestratorBranch}`,
    `- Orchestrator branch: ${orchestratorBranch}`,
    '- Session path: not-started',
    '',
    '## Selection result',
    '- No eligible AFK issue was selected in this run.',
    `- ${ISSUES_PATH} remains the source of truth.`,
    '- No worker session was started.',
  ].join('\n');
}

export async function buildWorkerPrompt(targetIssueId, bootstrapPath) {
  await ensureFileReadable(EXECUTE_PROMPT_PATH);
  const templateContent = await readFile(EXECUTE_PROMPT_PATH, 'utf8');
  const templateBody = parsePromptTemplateBody(templateContent);
  const renderedTemplate = renderPromptTemplate(templateBody, targetIssueId);

  return [
    'Harness bootstrap for runs-once.sh',
    `- Read ${bootstrapPath} before doing anything else.`,
    `- The explicit issue target is ${targetIssueId}.`,
    '- Do not fallback to any other AFK ticket.',
    '- Respect the bootstrap read order and exclusion rules.',
    '',
    renderedTemplate,
  ].join('\n');
}

export function runWorkerPrompt(prompt, sessionPath) {
  return runCommand('pi', ['--session', sessionPath, '-p', prompt]);
}

export function ensureTargetIssueDone(tickets, issueId) {
  const ticket = getTicketById(tickets, issueId);
  if (!ticket) {
    throw new Error(`worker completed but target issue ${issueId} is missing from docs/issues.md`);
  }

  if (ticket.status !== 'done') {
    throw new Error(`worker completed but did not mark ${issueId} as done in docs/issues.md`);
  }
}

export function commitSuccessfulRun(issueId) {
  const addResult = git(['add', '-A']);
  if (addResult.status !== 0) {
    throw new Error(`could not stage successful run changes: ${addResult.stderr.trim() || addResult.stdout.trim()}`);
  }

  const commitResult = git(['commit', '-m', `runs-once: complete ${issueId}`]);
  if (commitResult.status !== 0) {
    throw new Error(`could not create successful run commit for ${issueId}: ${commitResult.stderr.trim() || commitResult.stdout.trim()}`);
  }
}

export function countAheadCommits(baseBranch) {
  const result = git(['rev-list', '--count', `${baseBranch}..HEAD`]);
  if (result.status !== 0) {
    throw new Error(`could not verify issue branch commit distance from ${baseBranch}: ${result.stderr.trim() || result.stdout.trim()}`);
  }

  return Number(result.stdout.trim());
}

export async function ensureRunDirectories() {
  await mkdir(RUN_ARTIFACT_DIR, { recursive: true });
  await mkdir(RUN_SESSION_DIR, { recursive: true });
}

export async function writeBootstrap(path, content) {
  await ensureRunDirectories();
  await writeFile(path, `${content.trim()}\n`, 'utf8');
}

export async function writeResult(path, result) {
  await ensureRunDirectories();
  await writeFile(path, `${JSON.stringify(result, null, 2)}\n`, 'utf8');
}

export function printRunSummary(result) {
  console.log(`Status: ${result.status}`);
  console.log(`Issue: ${result.issue_id}`);
  console.log(`Branch: ${result.branch}`);
  console.log(`Session: ${result.session}`);
  console.log(`Reason: ${result.status_detail}`);
  console.log('Artifacts:');
  console.log(`- ${result.bootstrap_path}`);
  console.log(`- ${result.result_path}`);
  console.log('Next action:');
  result.next_action.forEach((step, index) => {
    console.log(`${index + 1}. ${step}`);
  });
}

function createRunState(now = new Date()) {
  const paths = buildRunPaths('none', now);
  return {
    issueId: 'none',
    branch: 'unknown',
    orchestratorBranch: 'unknown',
    session: 'not-started',
    status: 'FAIL',
    statusReason: 'unexpected_failure',
    statusDetail: 'runs-once.sh failed before the run could be classified.',
    nextAction: ['Inspect the shell output and retry after fixing the failure.'],
    bootstrapContent: '',
    ...paths,
  };
}

function toResultJson(runState) {
  return {
    status: runState.status,
    status_reason: runState.statusReason,
    status_detail: runState.statusDetail,
    issue_id: runState.issueId,
    branch: runState.branch,
    session: runState.session,
    next_action: runState.nextAction,
    bootstrap_path: runState.bootstrapPath,
    result_path: runState.resultPath,
    orchestrator_branch: runState.orchestratorBranch,
  };
}

async function finalizeRun(runState) {
  if (!runState.bootstrapContent) {
    runState.bootstrapContent = buildNoReadyBootstrapMarkdown({
      orchestratorBranch: runState.orchestratorBranch === 'unknown' ? runState.branch : runState.orchestratorBranch,
    });
  }

  await writeBootstrap(runState.bootstrapPath, runState.bootstrapContent);
  const result = toResultJson(runState);
  await writeResult(runState.resultPath, result);
  return result;
}

export async function main() {
  const runState = createRunState();

  try {
    if (process.argv.length > 2) {
      throw new Error('runs-once.sh does not accept arguments in v1');
    }

    if (!requireCommand('git')) {
      throw new Error('required tooling missing: git');
    }

    if (!requireCommand('pi')) {
      throw new Error('required tooling missing: pi');
    }

    await ensureFileReadable(ISSUES_PATH);
    ensureCleanWorkingTree();

    const currentBranch = getCurrentBranch();
    ensureSafeBranch(currentBranch);
    runState.branch = currentBranch;
    runState.orchestratorBranch = currentBranch;

    const issuesContent = await readFile(ISSUES_PATH, 'utf8');
    const tickets = parseTickets(issuesContent);
    const target = findFirstEligibleTicket(tickets);

    if (!target) {
      runState.status = 'NO_READY';
      runState.statusReason = 'no_eligible_issue';
      runState.statusDetail = 'No AFK ticket is currently eligible for runs-once.sh.';
      runState.nextAction = [
        'Review docs/issues.md on the orchestrator branch.',
        'Mark at least one AFK ticket with Auto-run: yes and satisfied dependencies before retrying.',
      ];
      runState.bootstrapContent = buildNoReadyBootstrapMarkdown({ orchestratorBranch: currentBranch });

      const result = await finalizeRun(runState);
      printRunSummary(result);
      return;
    }

    await ensureFileReadable(PRD_PATH);

    runState.issueId = target.id;
    Object.assign(runState, buildRunPaths(target.id));
    runState.branch = `ralph/${target.id}`;
    runState.session = runState.sessionPath;

    const researchRequired = isResearchRequired(target);
    if (researchRequired) {
      await ensureFileReadable(RESEARCH_PATH);
    }

    ensureBranchDoesNotExist(runState.branch);
    createIssueBranch(runState.branch);

    runState.bootstrapContent = buildBootstrapMarkdown({
      issueId: target.id,
      issueBranch: runState.branch,
      orchestratorBranch: currentBranch,
      sessionPath: runState.session,
      targetTicket: target,
      researchRequired,
    });
    await writeBootstrap(runState.bootstrapPath, runState.bootstrapContent);

    const verificationContent = await readFile(ISSUES_PATH, 'utf8');
    const verification = verifyTargetTicket(target, parseTickets(verificationContent));
    if (!verification.ok) {
      await cleanupBlockedChanges();
      runState.status = 'BLOCKED';
      runState.statusReason = 'target_conflict';
      runState.statusDetail = verification.reason;
      runState.nextAction = [
        'Review docs/issues.md on the issue branch.',
        'Copy back only the relevant docs/issues.md updates to the orchestrator branch.',
        'Do not merge the issue branch into the orchestrator branch for this BLOCKED run.',
      ];

      const result = await finalizeRun(runState);
      printRunSummary(result);
      return;
    }

    const workerPrompt = await buildWorkerPrompt(target.id, runState.bootstrapPath);
    const workerResult = runWorkerPrompt(workerPrompt, runState.session);

    if (workerResult.error) {
      throw new Error(`could not start pi worker: ${workerResult.error.message}`);
    }

    if (workerResult.stdout.trim()) {
      console.log(workerResult.stdout.trim());
    }

    if (workerResult.stderr.trim()) {
      console.error(workerResult.stderr.trim());
    }

    if (workerResult.status !== 0) {
      throw new Error(`pi worker exited with status ${workerResult.status}`);
    }

    const postWorkerIssues = parseTickets(await readFile(ISSUES_PATH, 'utf8'));
    ensureTargetIssueDone(postWorkerIssues, target.id);

    runState.status = 'DONE';
    runState.statusReason = 'validated_and_committed';
    runState.statusDetail = `Worker completed ${target.id}, docs/issues.md marks it done, and the issue branch is ready for manual review.`;
    runState.nextAction = [
      `Review the committed issue branch ${runState.branch} and the run artifacts.`,
      `git checkout ${runState.orchestratorBranch}`,
      `git merge --no-ff ${runState.branch}`,
    ];

    const result = await finalizeRun(runState);
    commitSuccessfulRun(target.id);

    if (countAheadCommits(runState.orchestratorBranch) < 1) {
      throw new Error(`successful run for ${target.id} did not leave a reviewable commit on ${runState.branch}`);
    }

    printRunSummary(result);
  } catch (error) {
    runState.status = 'FAIL';
    runState.statusReason = 'run_failed';
    runState.statusDetail = error.message;
    runState.nextAction = [
      'Inspect the failure details in the shell output and result.json.',
      'Fix the blocking repo or tooling problem before retrying runs-once.sh.',
    ];

    const result = await finalizeRun(runState);
    printRunSummary(result);
    process.exitCode = 1;
  }
}

const isEntrypoint = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isEntrypoint) {
  main();
}
