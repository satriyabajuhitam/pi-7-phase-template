#!/usr/bin/env node

import { constants as fsConstants } from 'node:fs';
import { access, mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ensureCleanWorkingTree, ensureSafeBranch, getCurrentBranch, git, requireCommand } from './runs-once.mjs';

const RUNS_ONCE_SCRIPT_PATH = resolve(fileURLToPath(new URL('../runs-once.sh', import.meta.url)));
const RUN_ARTIFACT_DIR = '.runs';

function isPositiveInteger(value) {
  return /^[1-9]\d*$/.test(value);
}

function printUsage() {
  console.error('Usage: ./runs-afk.sh <iterations>');
  console.error('Provide a positive integer iteration count, for example: ./runs-afk.sh 3');
}

function toTimestamp(now = new Date()) {
  return now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
}

function buildAggregatePath(now = new Date()) {
  return join(RUN_ARTIFACT_DIR, `${toTimestamp(now)}-afk-summary.json`);
}

function createBatchState({ maxIterations, orchestratorBranch, now = new Date() }) {
  return {
    status: 'FAIL',
    stopReason: 'unexpected_failure',
    stopDetail: 'runs-afk.sh failed before the batch could be classified.',
    requestedIterations: maxIterations,
    orchestratorBranch,
    processedIssues: [],
    aggregatePath: buildAggregatePath(now),
  };
}

function summarizeIteration(iterationResult) {
  return {
    issue_id: iterationResult.issue_id,
    status: iterationResult.status,
    status_reason: iterationResult.status_reason,
    status_detail: iterationResult.status_detail,
    branch: iterationResult.branch,
    session: iterationResult.session,
    bootstrap_path: iterationResult.bootstrap_path ?? null,
    result_path: iterationResult.result_path ?? null,
  };
}

async function ensureRunsOnceScriptReadable() {
  try {
    await access(RUNS_ONCE_SCRIPT_PATH, fsConstants.R_OK);
  } catch {
    throw new Error(`required script is not readable: ${RUNS_ONCE_SCRIPT_PATH}`);
  }
}

function runRunsOnce() {
  return spawnSync('bash', [RUNS_ONCE_SCRIPT_PATH], {
    cwd: process.cwd(),
    encoding: 'utf8',
    env: process.env,
  });
}

async function ensureRunArtifactDir() {
  await mkdir(RUN_ARTIFACT_DIR, { recursive: true });
}

async function listResultFiles() {
  try {
    const entries = await readdir(RUN_ARTIFACT_DIR);
    return entries.filter((entry) => entry.endsWith('.result.json')).sort();
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }

    throw error;
  }
}

async function readIterationResult(previousResultFiles) {
  const currentResultFiles = await listResultFiles();
  const previous = new Set(previousResultFiles);
  const newFiles = currentResultFiles.filter((file) => !previous.has(file));
  const selectedFile = (newFiles.length > 0 ? newFiles : currentResultFiles).at(-1);

  if (!selectedFile) {
    throw new Error('runs-afk.sh could not find a result.json artifact for the latest runs-once.sh iteration');
  }

  const resultPath = join(RUN_ARTIFACT_DIR, selectedFile);
  return JSON.parse(await readFile(resultPath, 'utf8'));
}

function synthesizeFailedIteration({ orchestratorBranch, childStatus, errorMessage }) {
  return {
    status: 'FAIL',
    status_reason: 'missing_result_artifact',
    status_detail: errorMessage ?? `runs-once.sh exited with status ${childStatus} without a readable result artifact.`,
    issue_id: 'unknown',
    branch: orchestratorBranch,
    session: 'not-started',
    bootstrap_path: null,
    result_path: null,
  };
}

function checkoutBranch(branch) {
  const result = git(['checkout', branch]);
  if (result.status !== 0) {
    throw new Error(`could not checkout branch ${branch}: ${result.stderr.trim() || result.stdout.trim()}`);
  }
}

function mergeIssueBranch(issueBranch) {
  const result = git(['merge', '--no-ff', issueBranch]);
  if (result.status !== 0) {
    throw new Error(`could not merge branch ${issueBranch}: ${result.stderr.trim() || result.stdout.trim()}`);
  }
}

function writeChildOutput(result) {
  if (result.stdout) {
    process.stdout.write(result.stdout);
  }

  if (result.stderr) {
    process.stderr.write(result.stderr);
  }
}

function toAggregateJson(batchState) {
  return {
    status: batchState.status,
    stop_reason: batchState.stopReason,
    stop_detail: batchState.stopDetail,
    iteration_count: batchState.processedIssues.length,
    requested_iterations: batchState.requestedIterations,
    orchestrator_branch: batchState.orchestratorBranch,
    processed_issues: batchState.processedIssues,
    aggregate_path: batchState.aggregatePath,
  };
}

function printFinalSummary(aggregate) {
  console.log('AFK batch summary:');
  console.log(`- Status: ${aggregate.status}`);
  console.log(`- Stop reason: ${aggregate.stop_reason}`);
  console.log(`- Iterations: ${aggregate.iteration_count}/${aggregate.requested_iterations}`);
  console.log(`- Orchestrator branch: ${aggregate.orchestrator_branch}`);
  console.log('- Processed issues:');

  if (aggregate.processed_issues.length === 0) {
    console.log('  - none');
  } else {
    aggregate.processed_issues.forEach((issue) => {
      console.log(`  - ${issue.issue_id}: ${issue.status} (${issue.status_reason})`);
    });
  }

  console.log(`- Aggregate artifact: ${aggregate.aggregate_path}`);
}

async function writeAggregateSummary(batchState) {
  if (batchState.processedIssues.length === 0) {
    return null;
  }

  await ensureRunArtifactDir();
  const aggregate = toAggregateJson(batchState);
  await writeFile(batchState.aggregatePath, `${JSON.stringify(aggregate, null, 2)}\n`, 'utf8');
  return aggregate;
}

export async function main() {
  const args = process.argv.slice(2);

  if (args.length !== 1) {
    printUsage();
    process.exitCode = 1;
    return;
  }

  const [iterationsRaw] = args;
  if (!isPositiveInteger(iterationsRaw)) {
    console.error(`Invalid iterations value: ${iterationsRaw}`);
    printUsage();
    process.exitCode = 1;
    return;
  }

  let batchState = null;
  let exitCode = 0;

  try {
    if (!requireCommand('git')) {
      throw new Error('required tooling missing: git');
    }

    await ensureRunsOnceScriptReadable();
    ensureCleanWorkingTree();

    const orchestratorBranch = getCurrentBranch();
    ensureSafeBranch(orchestratorBranch);

    const maxIterations = Number(iterationsRaw);
    batchState = createBatchState({ maxIterations, orchestratorBranch });

    for (let iteration = 1; iteration <= maxIterations; iteration += 1) {
      const previousResultFiles = await listResultFiles();
      const childResult = runRunsOnce();
      writeChildOutput(childResult);

      let iterationResult;
      try {
        iterationResult = await readIterationResult(previousResultFiles);
      } catch (error) {
        if (childResult.status === 0) {
          throw error;
        }

        iterationResult = synthesizeFailedIteration({
          orchestratorBranch,
          childStatus: childResult.status ?? 1,
          errorMessage: error.message,
        });
      }

      batchState.processedIssues.push(summarizeIteration(iterationResult));

      if (childResult.status !== 0) {
        batchState.status = 'FAIL';
        batchState.stopReason = iterationResult.status_reason ?? 'run_failed';
        batchState.stopDetail = iterationResult.status_detail ?? `runs-once.sh exited with status ${childResult.status}`;
        exitCode = childResult.status ?? 1;
        break;
      }

      if (iterationResult.status === 'NO_READY') {
        batchState.status = 'NO_READY';
        batchState.stopReason = iterationResult.status_reason ?? 'no_eligible_issue';
        batchState.stopDetail = iterationResult.status_detail;
        break;
      }

      if (iterationResult.status === 'BLOCKED') {
        batchState.status = 'BLOCKED';
        batchState.stopReason = iterationResult.status_reason ?? 'blocked';
        batchState.stopDetail = iterationResult.status_detail;
        break;
      }

      if (iterationResult.status !== 'DONE') {
        throw new Error(`runs-afk.sh received unexpected iteration status: ${iterationResult.status}`);
      }

      try {
        checkoutBranch(iterationResult.orchestrator_branch);
        mergeIssueBranch(iterationResult.branch);
      } catch (error) {
        console.error(`Error: ${error.message}`);
        batchState.status = 'FAIL';
        batchState.stopReason = 'merge_failed';
        batchState.stopDetail = error.message;
        exitCode = 1;
        break;
      }

      if (iteration === maxIterations) {
        batchState.status = 'DONE';
        batchState.stopReason = 'iteration_limit_reached';
        batchState.stopDetail = `Reached the requested iteration limit (${maxIterations}) after successful DONE iterations.`;
      }
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exitCode = 1;
    return;
  }

  const aggregate = await writeAggregateSummary(batchState);
  if (aggregate) {
    printFinalSummary(aggregate);
  }
  process.exitCode = exitCode;
}

const isEntrypoint = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isEntrypoint) {
  main();
}
