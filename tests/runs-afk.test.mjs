import test from 'node:test';
import assert from 'node:assert/strict';
import { cpSync, mkdtempSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const AFK_SCRIPT_PATH = resolve('runs-afk.sh');
const RUNS_ONCE_SCRIPT_PATH = resolve('runs-once.sh');
const RUNS_AFK_MODULE_PATH = resolve('scripts/runs-afk.mjs');
const RUNS_ONCE_MODULE_PATH = resolve('scripts/runs-once.mjs');
const EXECUTE_PROMPT_TEMPLATE = readFileSync(resolve('.pi/prompts/execute.md'), 'utf8');

function run(command, args, options = {}) {
  return spawnSync(command, args, {
    cwd: options.cwd,
    env: options.env,
    encoding: 'utf8',
  });
}

function setupRepo({
  issuesContent,
  prdContent = '# PRD\n\nMinimal PRD for tests.\n',
  withFakePi = true,
  runsOnceScriptContent,
}) {
  const repoDir = mkdtempSync(join(tmpdir(), 'runs-afk-'));
  mkdirSync(join(repoDir, 'docs'), { recursive: true });
  mkdirSync(join(repoDir, 'scripts'), { recursive: true });
  mkdirSync(join(repoDir, '.pi', 'prompts'), { recursive: true });

  cpSync(AFK_SCRIPT_PATH, join(repoDir, 'runs-afk.sh'));
  cpSync(RUNS_ONCE_SCRIPT_PATH, join(repoDir, 'runs-once.sh'));
  cpSync(RUNS_AFK_MODULE_PATH, join(repoDir, 'scripts', 'runs-afk.mjs'));
  cpSync(RUNS_ONCE_MODULE_PATH, join(repoDir, 'scripts', 'runs-once.mjs'));
  if (runsOnceScriptContent) {
    writeFileSync(join(repoDir, 'runs-once.sh'), runsOnceScriptContent);
  }

  writeFileSync(join(repoDir, 'README.md'), '# temp repo\n');
  writeFileSync(join(repoDir, 'docs', 'issues.md'), issuesContent);
  writeFileSync(join(repoDir, 'docs', 'prd.md'), prdContent);
  writeFileSync(join(repoDir, '.pi', 'prompts', 'execute.md'), EXECUTE_PROMPT_TEMPLATE);

  run('git', ['init', '-b', 'main'], { cwd: repoDir });
  run('git', ['config', 'user.name', 'Test User'], { cwd: repoDir });
  run('git', ['config', 'user.email', 'test@example.com'], { cwd: repoDir });
  run('git', ['add', '.'], { cwd: repoDir });
  run('git', ['commit', '-m', 'initial'], { cwd: repoDir });

  const binDir = mkdtempSync(join(tmpdir(), 'runs-afk-bin-'));
  const nodePath = join(binDir, 'node');
  writeFileSync(nodePath, `#!/usr/bin/env bash\nexec "${process.execPath}" "$@"\n`);
  run('chmod', ['+x', nodePath], { cwd: repoDir });

  const gitPath = join(binDir, 'git');
  writeFileSync(
    gitPath,
    [
      '#!/usr/bin/env bash',
      'if [[ "${RUNS_AFK_TEST_FAIL_MERGE:-}" == "1" && "$1" == "merge" ]]; then',
      '  echo "simulated merge conflict" >&2',
      '  exit 1',
      'fi',
      'exec /usr/bin/git "$@"',
      '',
    ].join('\n'),
  );
  run('chmod', ['+x', gitPath], { cwd: repoDir });

  if (withFakePi) {
    const piPath = join(binDir, 'pi');
    writeFileSync(piPath, '#!/usr/bin/env bash\necho "fake pi"\n');
    run('chmod', ['+x', piPath], { cwd: repoDir });
  }

  const env = {
    ...process.env,
    PATH: `${binDir}:/usr/bin:/bin`,
  };

  return { repoDir, env };
}

function buildSuccessfulRunsOnceStub(maxDoneIterations = 3) {
  return `#!/usr/bin/env bash
set -euo pipefail

count_file=".afk-call-count"
count="$(cat "$count_file" 2>/dev/null || echo 0)"
count=$((count + 1))
printf "%s" "$count" > "$count_file"

git rev-parse --abbrev-ref HEAD >> .afk-branches

if [[ "$count" -gt ${maxDoneIterations} ]]; then
  basename="20260101T00000${maxDoneIterations}Z-NO_READY"
  mkdir -p .runs .runs-sessions
  printf "# bootstrap\n" > ".runs/$basename.bootstrap.md"
  cat > ".runs/$basename.result.json" <<JSON
{
  "status": "NO_READY",
  "status_reason": "no_eligible_issue",
  "status_detail": "No AFK ticket is currently eligible for runs-once.sh.",
  "issue_id": "none",
  "branch": "main",
  "session": "not-started",
  "next_action": ["stop"],
  "no_ready_reasons": [],
  "dirty_files": [],
  "bootstrap_path": ".runs/$basename.bootstrap.md",
  "result_path": ".runs/$basename.result.json",
  "orchestrator_branch": "main"
}
JSON
  echo "Status: NO_READY"
  echo "Issue: none"
  echo "Branch: main"
  echo "Session: not-started"
  echo "Reason: No AFK ticket is currently eligible for runs-once.sh."
  exit 0
fi

issue=$(printf "ISSUE-%03d" "$count")
branch="ralph/$issue"
basename=$(printf "20260101T00000%dZ-%s" "$count" "$issue")

git checkout -b "$branch"
printf "%s\n" "$issue" >> batch.txt
git add batch.txt
git commit -m "complete $issue" >/dev/null
mkdir -p .runs .runs-sessions
printf "# bootstrap\n" > ".runs/$basename.bootstrap.md"
printf "session\n" > ".runs-sessions/$basename.jsonl"
cat > ".runs/$basename.result.json" <<JSON
{
  "status": "DONE",
  "status_reason": "validated_and_committed",
  "status_detail": "done $issue",
  "issue_id": "$issue",
  "branch": "$branch",
  "session": ".runs-sessions/$basename.jsonl",
  "next_action": ["review"],
  "no_ready_reasons": [],
  "dirty_files": [],
  "bootstrap_path": ".runs/$basename.bootstrap.md",
  "result_path": ".runs/$basename.result.json",
  "orchestrator_branch": "main"
}
JSON

echo "Status: DONE"
echo "Issue: $issue"
echo "Branch: $branch"
echo "Session: .runs-sessions/$basename.jsonl"
echo "Reason: done $issue"
echo "Artifacts:"
echo "- .runs/$basename.bootstrap.md"
echo "- .runs/$basename.result.json"
echo "Next action:"
echo "1. review"
`;
}

function buildBlockedRunsOnceStub() {
  return `#!/usr/bin/env bash
set -euo pipefail
count_file=".afk-call-count"
count="$(cat "$count_file" 2>/dev/null || echo 0)"
count=$((count + 1))
printf "%s" "$count" > "$count_file"
issue="ISSUE-001"
branch="ralph/$issue"
basename="20260101T000001Z-$issue"
git rev-parse --abbrev-ref HEAD >> .afk-branches
git checkout -b "$branch" >/dev/null
mkdir -p .runs .runs-sessions
printf "# bootstrap\n" > ".runs/$basename.bootstrap.md"
printf "session\n" > ".runs-sessions/$basename.jsonl"
cat > ".runs/$basename.result.json" <<JSON
{
  "status": "BLOCKED",
  "status_reason": "target_conflict",
  "status_detail": "blocked $issue",
  "issue_id": "$issue",
  "branch": "$branch",
  "session": ".runs-sessions/$basename.jsonl",
  "next_action": ["review blocker"],
  "no_ready_reasons": [],
  "dirty_files": [],
  "bootstrap_path": ".runs/$basename.bootstrap.md",
  "result_path": ".runs/$basename.result.json",
  "orchestrator_branch": "main"
}
JSON

echo "Status: BLOCKED"
echo "Issue: $issue"
echo "Branch: $branch"
echo "Session: .runs-sessions/$basename.jsonl"
echo "Reason: blocked $issue"
`;
}

function buildFailingRunsOnceStub() {
  return `#!/usr/bin/env bash
set -euo pipefail
count_file=".afk-call-count"
count="$(cat "$count_file" 2>/dev/null || echo 0)"
count=$((count + 1))
printf "%s" "$count" > "$count_file"
issue="ISSUE-001"
branch="main"
basename="20260101T000001Z-$issue-FAIL"
git rev-parse --abbrev-ref HEAD >> .afk-branches
mkdir -p .runs .runs-sessions
printf "# bootstrap\n" > ".runs/$basename.bootstrap.md"
cat > ".runs/$basename.result.json" <<JSON
{
  "status": "FAIL",
  "status_reason": "run_failed",
  "status_detail": "simulated failure",
  "issue_id": "$issue",
  "branch": "$branch",
  "session": "not-started",
  "next_action": ["inspect failure"],
  "no_ready_reasons": [],
  "dirty_files": [],
  "bootstrap_path": ".runs/$basename.bootstrap.md",
  "result_path": ".runs/$basename.result.json",
  "orchestrator_branch": "main"
}
JSON

echo "Status: FAIL"
echo "Reason: simulated failure"
exit 17
`;
}

function runAfk(repoDir, env, args = []) {
  return run('bash', [join(repoDir, 'runs-afk.sh'), ...args], { cwd: repoDir, env });
}

function readAggregateSummary(repoDir) {
  const runsDir = join(repoDir, '.runs');
  const files = readdirSync(runsDir).sort();
  const aggregateFiles = files.filter((file) => file.endsWith('afk-summary.json'));
  assert.equal(aggregateFiles.length, 1);
  return {
    path: join(runsDir, aggregateFiles[0]),
    data: JSON.parse(readFileSync(join(runsDir, aggregateFiles[0]), 'utf8')),
    files,
  };
}

test('rejects missing or invalid iteration arguments with actionable usage', () => {
  const { repoDir, env } = setupRepo({
    issuesContent: '# Issues\n',
  });

  const missing = runAfk(repoDir, env);
  assert.equal(missing.status, 1);
  assert.match(missing.stderr, /Usage: \.\/runs-afk\.sh <iterations>/);
  assert.match(missing.stderr, /positive integer iteration count/i);

  const invalid = runAfk(repoDir, env, ['0']);
  assert.equal(invalid.status, 1);
  assert.match(invalid.stderr, /Invalid iterations value: 0/);
  assert.match(invalid.stderr, /Usage: \.\/runs-afk\.sh <iterations>/);
});

test('stops normally on NO_READY without attempting extra iterations', () => {
  const { repoDir, env } = setupRepo({
    issuesContent: `# Issues\n\n### ISSUE-001 — Missing auto-run\n- Status: todo\n- Type: AFK\n- Depends on: none\n`,
  });

  const result = runAfk(repoDir, env, ['3']);
  assert.equal(result.status, 0);
  assert.equal((result.stdout.match(/Status: NO_READY/g) ?? []).length, 2);

  const aggregate = readAggregateSummary(repoDir);
  assert.equal(aggregate.files.filter((file) => file.endsWith('.result.json')).length, 1);
  assert.equal(aggregate.files.filter((file) => file.endsWith('.bootstrap.md')).length, 1);
  assert.equal(aggregate.data.status, 'NO_READY');
  assert.equal(aggregate.data.stop_reason, 'no_eligible_issue');
  assert.equal(aggregate.data.iteration_count, 1);
  assert.equal(aggregate.data.processed_issues.length, 1);
  assert.equal(aggregate.data.processed_issues[0].status, 'NO_READY');
  assert.match(result.stdout, /AFK batch summary:/);
  assert.match(result.stdout, /- Status: NO_READY/);
  assert.match(result.stdout, /- Stop reason: no_eligible_issue/);
  assert.match(result.stdout, /- Aggregate artifact: .runs\/.+afk-summary\.json/);

  const branch = run('git', ['rev-parse', '--abbrev-ref', 'HEAD'], { cwd: repoDir, env });
  assert.equal(branch.stdout.trim(), 'main');
});

test('fails fast when the batch starts from an issue branch', () => {
  const { repoDir, env } = setupRepo({
    issuesContent: '# Issues\n',
  });

  run('git', ['checkout', '-b', 'ralph/ISSUE-999'], { cwd: repoDir, env });

  const result = runAfk(repoDir, env, ['2']);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /already an issue branch/i);

  assert.throws(() => readdirSync(join(repoDir, '.runs')), /ENOENT/);
});

test('continues across successful DONE iterations by merging back to the orchestrator branch', () => {
  const { repoDir, env } = setupRepo({
    issuesContent: '# Issues\n',
    runsOnceScriptContent: buildSuccessfulRunsOnceStub(3),
    withFakePi: false,
  });

  const result = runAfk(repoDir, env, ['2']);
  assert.equal(result.status, 0);
  assert.equal((result.stdout.match(/Status: DONE/g) ?? []).length, 3);

  const branchLog = readFileSync(join(repoDir, '.afk-branches'), 'utf8').trim().split('\n');
  assert.deepEqual(branchLog, ['main', 'main']);

  const callCount = readFileSync(join(repoDir, '.afk-call-count'), 'utf8').trim();
  assert.equal(callCount, '2');

  const currentBranch = run('git', ['rev-parse', '--abbrev-ref', 'HEAD'], { cwd: repoDir, env });
  assert.equal(currentBranch.stdout.trim(), 'main');

  const mergedContent = readFileSync(join(repoDir, 'batch.txt'), 'utf8');
  assert.match(mergedContent, /ISSUE-001/);
  assert.match(mergedContent, /ISSUE-002/);

  const localBranches = run('git', ['branch', '--list', 'ralph/ISSUE-*'], { cwd: repoDir, env });
  assert.match(localBranches.stdout, /ralph\/ISSUE-001/);
  assert.match(localBranches.stdout, /ralph\/ISSUE-002/);

  const aggregate = readAggregateSummary(repoDir);
  assert.equal(aggregate.data.status, 'DONE');
  assert.equal(aggregate.data.stop_reason, 'iteration_limit_reached');
  assert.equal(aggregate.data.iteration_count, 2);
  assert.equal(aggregate.data.orchestrator_branch, 'main');
  assert.deepEqual(
    aggregate.data.processed_issues.map((issue) => [issue.issue_id, issue.status]),
    [
      ['ISSUE-001', 'DONE'],
      ['ISSUE-002', 'DONE'],
    ],
  );
  assert.ok(aggregate.data.processed_issues.every((issue) => issue.bootstrap_path && issue.result_path));
  assert.match(result.stdout, /AFK batch summary:/);
  assert.match(result.stdout, /- Status: DONE/);
  assert.match(result.stdout, /- Stop reason: iteration_limit_reached/);
  assert.match(result.stdout, /- Iterations: 2\/2/);
  assert.match(result.stdout, /ISSUE-001: DONE \(validated_and_committed\)/);
  assert.match(result.stdout, /ISSUE-002: DONE \(validated_and_committed\)/);
});

test('stops at BLOCKED without attempting another iteration or merging back automatically', () => {
  const { repoDir, env } = setupRepo({
    issuesContent: '# Issues\n',
    runsOnceScriptContent: buildBlockedRunsOnceStub(),
    withFakePi: false,
  });

  const result = runAfk(repoDir, env, ['3']);
  assert.equal(result.status, 0);
  assert.equal((result.stdout.match(/Status: BLOCKED/g) ?? []).length, 2);

  const callCount = readFileSync(join(repoDir, '.afk-call-count'), 'utf8').trim();
  assert.equal(callCount, '1');

  const branchLog = readFileSync(join(repoDir, '.afk-branches'), 'utf8').trim().split('\n');
  assert.deepEqual(branchLog, ['main']);

  const currentBranch = run('git', ['rev-parse', '--abbrev-ref', 'HEAD'], { cwd: repoDir, env });
  assert.equal(currentBranch.stdout.trim(), 'ralph/ISSUE-001');

  const mainBatch = run('git', ['show', 'main:batch.txt'], { cwd: repoDir, env });
  assert.notEqual(mainBatch.status, 0);

  const aggregate = readAggregateSummary(repoDir);
  assert.equal(aggregate.data.status, 'BLOCKED');
  assert.equal(aggregate.data.stop_reason, 'target_conflict');
  assert.equal(aggregate.data.iteration_count, 1);
  assert.deepEqual(
    aggregate.data.processed_issues.map((issue) => [issue.issue_id, issue.status]),
    [['ISSUE-001', 'BLOCKED']],
  );
  assert.match(result.stdout, /AFK batch summary:/);
  assert.match(result.stdout, /- Status: BLOCKED/);
  assert.match(result.stdout, /ISSUE-001: BLOCKED \(target_conflict\)/);
});

test('stops with a non-zero exit when runs-once.sh fails and does not attempt another iteration', () => {
  const { repoDir, env } = setupRepo({
    issuesContent: '# Issues\n',
    runsOnceScriptContent: buildFailingRunsOnceStub(),
    withFakePi: false,
  });

  const result = runAfk(repoDir, env, ['3']);
  assert.equal(result.status, 17);
  assert.equal((result.stdout.match(/Status: FAIL/g) ?? []).length, 2);

  const callCount = readFileSync(join(repoDir, '.afk-call-count'), 'utf8').trim();
  assert.equal(callCount, '1');

  const aggregate = readAggregateSummary(repoDir);
  assert.equal(aggregate.data.status, 'FAIL');
  assert.equal(aggregate.data.stop_reason, 'run_failed');
  assert.equal(aggregate.data.iteration_count, 1);
  assert.deepEqual(
    aggregate.data.processed_issues.map((issue) => [issue.issue_id, issue.status]),
    [['ISSUE-001', 'FAIL']],
  );
  assert.match(result.stdout, /AFK batch summary:/);
  assert.match(result.stdout, /- Status: FAIL/);
  assert.match(result.stdout, /ISSUE-001: FAIL \(run_failed\)/);
});

test('stops with a non-zero exit when merge-back to the orchestrator branch fails', () => {
  const { repoDir, env } = setupRepo({
    issuesContent: '# Issues\n',
    runsOnceScriptContent: buildSuccessfulRunsOnceStub(2),
    withFakePi: false,
  });

  const result = runAfk(repoDir, { ...env, RUNS_AFK_TEST_FAIL_MERGE: '1' }, ['2']);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /could not merge branch ralph\/ISSUE-001/i);

  const callCount = readFileSync(join(repoDir, '.afk-call-count'), 'utf8').trim();
  assert.equal(callCount, '1');

  const aggregate = readAggregateSummary(repoDir);
  assert.equal(aggregate.data.status, 'FAIL');
  assert.equal(aggregate.data.stop_reason, 'merge_failed');
  assert.equal(aggregate.data.iteration_count, 1);
  assert.deepEqual(
    aggregate.data.processed_issues.map((issue) => [issue.issue_id, issue.status]),
    [['ISSUE-001', 'DONE']],
  );
  assert.match(result.stdout, /AFK batch summary:/);
  assert.match(result.stdout, /- Status: FAIL/);
  assert.match(result.stdout, /- Stop reason: merge_failed/);
});

test('stops at the iteration cap even when more successful iterations are available', () => {
  const { repoDir, env } = setupRepo({
    issuesContent: '# Issues\n',
    runsOnceScriptContent: buildSuccessfulRunsOnceStub(3),
    withFakePi: false,
  });

  const result = runAfk(repoDir, env, ['2']);
  assert.equal(result.status, 0);

  const callCount = readFileSync(join(repoDir, '.afk-call-count'), 'utf8').trim();
  assert.equal(callCount, '2');

  const thirdBranch = run('git', ['branch', '--list', 'ralph/ISSUE-003'], { cwd: repoDir, env });
  assert.equal(thirdBranch.stdout.trim(), '');

  const aggregate = readAggregateSummary(repoDir);
  assert.equal(aggregate.data.status, 'DONE');
  assert.equal(aggregate.data.stop_reason, 'iteration_limit_reached');
  assert.equal(aggregate.data.iteration_count, 2);
});
