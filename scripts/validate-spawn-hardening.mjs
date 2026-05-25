#!/usr/bin/env node

import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const DEFAULT_PROVIDER = 'openai-codex';
const DEFAULT_MODEL = 'gpt-5.4-mini';
const DEFAULT_EXTENSION = '.pi/extensions/spawn/index.ts';
const LOCAL_REGRESSION_TEST = 'tests/spawn-return-result-activation.test.mjs';

function parseArgs(argv) {
  const options = {
    provider: process.env.PI_SPAWN_VALIDATE_PROVIDER || DEFAULT_PROVIDER,
    model: process.env.PI_SPAWN_VALIDATE_MODEL || DEFAULT_MODEL,
    piBin: process.env.PI_SPAWN_VALIDATE_PI || 'pi',
    extensionPath: process.env.PI_SPAWN_VALIDATE_EXTENSION || DEFAULT_EXTENSION,
    skipLive: false,
    ci: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--provider') {
      options.provider = argv[++i];
      continue;
    }
    if (arg === '--model') {
      options.model = argv[++i];
      continue;
    }
    if (arg === '--pi') {
      options.piBin = argv[++i];
      continue;
    }
    if (arg === '--extension') {
      options.extensionPath = argv[++i];
      continue;
    }
    if (arg === '--skip-live') {
      options.skipLive = true;
      continue;
    }
    if (arg === '--ci') {
      options.ci = true;
      continue;
    }
    throw new Error(`Unknown argument: ${arg}`);
  }

  return options;
}

function run(command, args, options = {}) {
  return spawnSync(command, args, {
    cwd: options.cwd || process.cwd(),
    env: options.env || process.env,
    encoding: 'utf8',
    timeout: options.timeout,
  });
}

function buildParentPrompt(args) {
  return `Use the spawn tool exactly once with these exact arguments: ${JSON.stringify(args)}. After the tool finishes, reply with exactly: parent-ok.`;
}

function createLiveCases() {
  return [
    {
      id: 'success_direct',
      description: 'direct success with observed return_result',
      spawnArgs: {
        prompt:
          'Invoke the tool named return_result exactly once now with result success-ok. Do not use any other tool. Do not answer in plain text.',
        strictResult: false,
        thinking: 'off',
      },
      expect(item) {
        return (
          item.completionStatus === 'success' &&
          item.completionReason === 'return_result' &&
          item.returnResultObserved === true &&
          item.returnResultCallCount === 1 &&
          item.completionRepairAttempted !== true
        );
      },
    },
    {
      id: 'repair_success',
      description: 'bounded repair converts a non-tool first turn into success',
      spawnArgs: {
        prompt:
          'First respond with exactly degraded-ok as plain assistant text with no tool calls. After that first response, if the session continues, follow the next instruction and complete using return_result exactly once.',
        strictResult: false,
        thinking: 'off',
        timeout: 30000,
      },
      expect(item) {
        return (
          item.completionStatus === 'success' &&
          item.completionReason === 'return_result' &&
          item.returnResultObserved === true &&
          item.completionRepairAttempted === true &&
          item.completionRepairSucceeded === true
        );
      },
    },
    {
      id: 'strict_failure',
      description: 'strict missing-return_result remains explicit failure',
      spawnArgs: {
        prompt:
          'Respond in plain text with exactly: strict-miss. Do not use any tool, including return_result. Stop immediately after the text.',
        strictResult: true,
        thinking: 'off',
        timeout: 30000,
      },
      expect(item) {
        return (
          item.completionStatus === 'failed' &&
          item.completionReason === 'missing_return_result' &&
          item.returnResultObserved === false &&
          item.returnResultCallCount === 0
        );
      },
    },
    {
      id: 'timeout',
      description: 'timeout remains distinct',
      spawnArgs: {
        prompt: 'Run bash with command: sleep 1. Do not call return_result.',
        strictResult: false,
        thinking: 'off',
        timeout: 100,
      },
      expect(item) {
        return (
          item.completionStatus === 'failed' &&
          item.completionReason === 'timeout' &&
          item.timedOut === true &&
          item.timeout === 100
        );
      },
    },
    {
      id: 'preset_success',
      description: 'preset coherence remains visible on a successful run',
      spawnArgs: {
        prompt:
          'Invoke the tool named return_result exactly once now with result preset-ok. Do not use any other tool. Do not answer in plain text.',
        strictResult: false,
        thinking: 'off',
        preset: 'reviewer',
      },
      expect(item) {
        return (
          item.completionStatus === 'success' &&
          item.completionReason === 'return_result' &&
          item.returnResultObserved === true &&
          item.preset === 'reviewer'
        );
      },
    },
  ];
}

function findSpawnToolEnd(jsonlText) {
  let toolEnd = null;
  for (const line of jsonlText.split(/\r?\n/)) {
    if (!line.trim()) continue;
    try {
      const event = JSON.parse(line);
      if (event.type === 'tool_execution_end' && event.toolName === 'spawn') {
        toolEnd = event;
      }
    } catch {
      // Ignore non-JSON lines.
    }
  }
  return toolEnd;
}

function classifyUnavailable(text) {
  const haystack = text.toLowerCase();
  if (haystack.includes('usage_limit_reached') || haystack.includes('status_code":429') || haystack.includes('status code: 429')) {
    return 'provider quota exhausted (429 usage_limit_reached)';
  }
  if (haystack.includes('could not restore model') || haystack.includes('no models match pattern')) {
    return 'requested provider/model is not fully available in the current environment';
  }
  return null;
}

function summarizeItem(item) {
  return {
    completionStatus: item?.completionStatus,
    completionReason: item?.completionReason,
    contractSatisfied: item?.contractSatisfied,
    returnResultObserved: item?.returnResultObserved,
    returnResultCallCount: item?.returnResultCallCount,
    completionRepairAttempted: item?.completionRepairAttempted,
    completionRepairSucceeded: item?.completionRepairSucceeded,
    timedOut: item?.timedOut,
    timeout: item?.timeout,
    preset: item?.preset,
    output: item?.output,
    warning: item?.warning,
    error: item?.error,
  };
}

function runLocalRegressionCase(artifactsDir) {
  const stdoutPath = join(artifactsDir, 'local-regression.stdout.txt');
  const stderrPath = join(artifactsDir, 'local-regression.stderr.txt');
  const result = run('node', ['--test', LOCAL_REGRESSION_TEST]);
  writeFileSync(stdoutPath, result.stdout || '');
  writeFileSync(stderrPath, result.stderr || '');

  return {
    id: 'local_regression',
    kind: 'local',
    description: 'deterministic return_result activation regression test',
    status: result.status === 0 ? 'PASS' : 'FAIL',
    summary: result.status === 0 ? 'local regression test passed' : `node --test exited ${result.status}`,
    artifacts: { stdoutPath, stderrPath },
  };
}

function runLiveCase(caseDef, options, artifactsDir) {
  const parentPrompt = buildParentPrompt(caseDef.spawnArgs);
  const jsonlPath = join(artifactsDir, `${caseDef.id}.jsonl`);
  const errPath = join(artifactsDir, `${caseDef.id}.err`);
  const result = run(
    options.piBin,
    [
      '--provider',
      options.provider,
      '--model',
      options.model,
      '--no-session',
      '--no-extensions',
      '--extension',
      options.extensionPath,
      '--mode',
      'json',
      '-p',
      parentPrompt,
    ],
    { timeout: 120000 },
  );

  writeFileSync(jsonlPath, result.stdout || '');
  writeFileSync(errPath, result.stderr || '');

  const unavailableReason = classifyUnavailable(`${result.stdout || ''}\n${result.stderr || ''}`);
  const toolEnd = findSpawnToolEnd(result.stdout || '');

  if (!toolEnd) {
    return {
      id: caseDef.id,
      kind: 'live',
      description: caseDef.description,
      status: unavailableReason ? 'UNAVAILABLE' : 'FAIL',
      summary: unavailableReason || 'spawn tool did not produce a tool_execution_end event',
      artifacts: { jsonlPath, errPath },
    };
  }

  const item = (toolEnd.result?.details?.results || [])[0] || {};
  const passed = caseDef.expect(item);
  return {
    id: caseDef.id,
    kind: 'live',
    description: caseDef.description,
    status: passed ? 'PASS' : 'FAIL',
    summary: summarizeItem(item),
    artifacts: { jsonlPath, errPath },
  };
}

function renderSummary(results, options, artifactsDir) {
  console.log('Spawn hardening validation');
  console.log('==========================');
  console.log(`Command: node scripts/validate-spawn-hardening.mjs`);
  console.log(`Provider/model: ${options.provider}/${options.model}`);
  console.log(`Artifacts: ${artifactsDir}`);
  console.log('');

  for (const result of results) {
    console.log(`${result.status.padEnd(11)} ${result.id} — ${result.description}`);
    if (typeof result.summary === 'string') {
      console.log(`  ${result.summary}`);
    } else {
      for (const [key, value] of Object.entries(result.summary)) {
        console.log(`  ${key}: ${value}`);
      }
    }
    for (const [label, path] of Object.entries(result.artifacts)) {
      console.log(`  ${label}: ${path}`);
    }
    console.log('');
  }

  console.log('Retained degraded-fallback reference:');
  console.log('  docs/pi-spawn.md — final completion reliability validation snapshot and earlier degraded-fallback evidence');
}

function computeExitCode(results, options) {
  const hasFail = results.some((result) => result.status === 'FAIL');
  const hasUnavailable = results.some((result) => result.status === 'UNAVAILABLE');
  if (hasFail) return 1;
  if (options.ci && hasUnavailable) return 1;
  return 0;
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const artifactsDir = mkdtempSync(join(tmpdir(), 'pi-spawn-validate-'));
  mkdirSync(artifactsDir, { recursive: true });

  const results = [runLocalRegressionCase(artifactsDir)];
  if (!options.skipLive) {
    for (const caseDef of createLiveCases()) {
      results.push(runLiveCase(caseDef, options, artifactsDir));
    }
  }

  const summaryPath = join(artifactsDir, 'summary.json');
  writeFileSync(summaryPath, JSON.stringify({
    command: 'node scripts/validate-spawn-hardening.mjs',
    provider: options.provider,
    model: options.model,
    results,
  }, null, 2));

  renderSummary(results, options, artifactsDir);
  console.log(`Machine-readable summary: ${summaryPath}`);

  process.exitCode = computeExitCode(results, options);
}

try {
  main();
} catch (error) {
  console.error(`FAIL validate-spawn-hardening: ${error.message}`);
  process.exitCode = 1;
}
