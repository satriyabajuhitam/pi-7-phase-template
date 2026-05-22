import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { verifyTargetTicket } from '../scripts/runs-once.mjs';

const SCRIPT_PATH = resolve('runs-once.sh');
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
  researchContent = '# Research\n\nMinimal research for tests.\n',
  withFakePi = true,
  fakePiBody = 'echo "fake pi worker"\n',
}) {
  const repoDir = mkdtempSync(join(tmpdir(), 'runs-once-'));
  mkdirSync(join(repoDir, 'docs'), { recursive: true });
  mkdirSync(join(repoDir, '.pi', 'prompts'), { recursive: true });
  writeFileSync(join(repoDir, 'README.md'), '# temp repo\n');
  writeFileSync(join(repoDir, 'docs', 'issues.md'), issuesContent);
  writeFileSync(join(repoDir, 'docs', 'prd.md'), prdContent);
  writeFileSync(join(repoDir, 'docs', 'research.md'), researchContent);
  writeFileSync(join(repoDir, '.pi', 'prompts', 'execute.md'), EXECUTE_PROMPT_TEMPLATE);

  run('git', ['init', '-b', 'main'], { cwd: repoDir });
  run('git', ['config', 'user.name', 'Test User'], { cwd: repoDir });
  run('git', ['config', 'user.email', 'test@example.com'], { cwd: repoDir });
  run('git', ['add', '.'], { cwd: repoDir });
  run('git', ['commit', '-m', 'initial'], { cwd: repoDir });

  const binDir = mkdtempSync(join(tmpdir(), 'runs-once-bin-'));
  const nodePath = join(binDir, 'node');
  writeFileSync(nodePath, `#!/usr/bin/env bash\nexec "${process.execPath}" "$@"\n`);
  run('chmod', ['+x', nodePath], { cwd: repoDir });

  const gitPath = join(binDir, 'git');
  writeFileSync(
    gitPath,
    [
      '#!/usr/bin/env bash',
      'if [[ "${RUNS_ONCE_TEST_MUTATE_ON_CHECKOUT:-}" == "1" && "$1" == "checkout" && "$2" == "-b" ]]; then',
      '  /usr/bin/git "$@" || exit $? ',
      '  if [[ -n "${RUNS_ONCE_TEST_MUTATED_ISSUES_FILE:-}" ]]; then',
      '    cat "$RUNS_ONCE_TEST_MUTATED_ISSUES_FILE" > docs/issues.md',
      '  fi',
      '  if [[ -n "${RUNS_ONCE_TEST_PARTIAL_CODE_FILE:-}" ]]; then',
      '    printf "partial code that must be discarded\\n" >> "$RUNS_ONCE_TEST_PARTIAL_CODE_FILE"',
      '  fi',
      '  exit 0',
      'fi',
      'exec /usr/bin/git "$@"',
      '',
    ].join('\n'),
  );
  run('chmod', ['+x', gitPath], { cwd: repoDir });

  if (withFakePi) {
    const piPath = join(binDir, 'pi');
    writeFileSync(
      piPath,
      [
        '#!/usr/bin/env bash',
        'session_path=""',
        'args=("$@")',
        'for ((i=0; i<${#args[@]}; i++)); do',
        '  if [[ "${args[$i]}" == "--session" && $((i + 1)) -lt ${#args[@]} ]]; then',
        '    session_path="${args[$((i + 1))]}"',
        '    break',
        '  fi',
        'done',
        'if [[ -n "$session_path" ]]; then',
        '  mkdir -p "$(dirname "$session_path")"',
        '  printf "stub session\n" > "$session_path"',
        'fi',
        'if [[ -n "${RUNS_ONCE_TEST_PI_ARGS_FILE:-}" ]]; then',
        '  printf "%s\n" "$@" > "$RUNS_ONCE_TEST_PI_ARGS_FILE"',
        'fi',
        fakePiBody.trimEnd(),
        '',
      ].join('\n'),
    );
    run('chmod', ['+x', piPath], { cwd: repoDir });
  }

  const env = {
    ...process.env,
    PATH: `${binDir}:/usr/bin:/bin`,
  };

  return { repoDir, env };
}

function runScript(repoDir, env) {
  return run('bash', [SCRIPT_PATH], { cwd: repoDir, env });
}

function readRunArtifacts(repoDir) {
  const runsDir = join(repoDir, '.runs');
  const files = readdirSync(runsDir).sort();
  assert.equal(files.length, 2);

  const bootstrapFile = files.find((file) => file.endsWith('.bootstrap.md'));
  const resultFile = files.find((file) => file.endsWith('.result.json'));
  assert.ok(bootstrapFile);
  assert.ok(resultFile);

  const bootstrapBase = bootstrapFile.replace(/\.bootstrap\.md$/, '');
  const resultBase = resultFile.replace(/\.result\.json$/, '');
  assert.equal(bootstrapBase, resultBase);

  return {
    basename: bootstrapBase,
    bootstrapPath: join(runsDir, bootstrapFile),
    resultPath: join(runsDir, resultFile),
    bootstrap: readFileSync(join(runsDir, bootstrapFile), 'utf8'),
    result: JSON.parse(readFileSync(join(runsDir, resultFile), 'utf8')),
  };
}

test('returns NO_READY without creating an issue branch and still writes two run artifacts', () => {
  const { repoDir, env } = setupRepo({
    issuesContent: `# Issues\n\n### ISSUE-001 — Example\n- Status: todo\n- Type: AFK\n- Depends on: none\n`,
  });

  const result = runScript(repoDir, env);
  assert.equal(result.status, 0);
  assert.match(result.stdout, /Status: NO_READY/);

  const branch = run('git', ['rev-parse', '--abbrev-ref', 'HEAD'], { cwd: repoDir, env });
  assert.equal(branch.stdout.trim(), 'main');

  const artifacts = readRunArtifacts(repoDir);
  assert.equal(artifacts.result.status, 'NO_READY');
  assert.equal(artifacts.result.issue_id, 'none');
  assert.equal(artifacts.result.session, 'not-started');
  assert.ok(Array.isArray(artifacts.result.next_action));
  assert.ok(artifacts.result.next_action.length > 0);
  assert.match(artifacts.bootstrap, /No eligible AFK issue was selected/i);
});

test('successful DONE flow validates worker outcome, leaves a commit on the issue branch, and prints explicit manual merge steps', () => {
  const { repoDir, env } = setupRepo({
    issuesContent: `# Issues\n\n### ISSUE-001 — First\n- Status: todo\n- Type: AFK\n- Auto-run: yes\n- Depends on: none\n\n### ISSUE-002 — Second\n- Status: todo\n- Type: AFK\n- Auto-run: yes\n- Depends on: none\n`,
    fakePiBody: [
      'echo "fake pi worker"',
      'node -e "const fs=require(\'node:fs\'); fs.appendFileSync(\'README.md\', \'worker change\\n\'); let issues=fs.readFileSync(\'docs/issues.md\', \'utf8\'); issues=issues.replace(\'- Status: todo\', \'- Status: done\'); fs.writeFileSync(\'docs/issues.md\', issues);"',
    ].join('\n'),
  });
  const argsFile = join(repoDir, 'pi-args.txt');

  const result = runScript(repoDir, {
    ...env,
    RUNS_ONCE_TEST_PI_ARGS_FILE: argsFile,
  });

  assert.equal(result.status, 0);
  assert.match(result.stdout, /fake pi worker/);
  assert.match(result.stdout, /Status: DONE/);
  assert.match(result.stdout, /Issue: ISSUE-001/);
  assert.match(result.stdout, /Branch: ralph\/ISSUE-001/);
  assert.match(result.stdout, /git checkout main/);
  assert.match(result.stdout, /git merge --no-ff ralph\/ISSUE-001/);

  const branch = run('git', ['rev-parse', '--abbrev-ref', 'HEAD'], { cwd: repoDir, env });
  assert.equal(branch.stdout.trim(), 'ralph/ISSUE-001');

  const artifacts = readRunArtifacts(repoDir);
  assert.equal(artifacts.result.status, 'DONE');
  assert.equal(artifacts.result.status_reason, 'validated_and_committed');
  assert.equal(artifacts.result.issue_id, 'ISSUE-001');
  assert.equal(artifacts.result.branch, 'ralph/ISSUE-001');
  assert.match(artifacts.result.session, new RegExp(`^\\.runs-sessions/${artifacts.basename}\\.jsonl$`));
  assert.ok(Array.isArray(artifacts.result.next_action));
  assert.ok(artifacts.result.next_action.length > 0);
  assert.match(artifacts.result.next_action.join('\n'), /git checkout main/);
  assert.match(artifacts.result.next_action.join('\n'), /git merge --no-ff ralph\/ISSUE-001/);

  const sessionPath = join(repoDir, artifacts.result.session);
  assert.equal(statSync(sessionPath).isFile(), true);

  assert.match(artifacts.bootstrap, /## Selected issue excerpt/);
  assert.match(artifacts.bootstrap, /### ISSUE-001 — First/);
  assert.match(artifacts.bootstrap, /docs\/issues\.md/);
  assert.match(artifacts.bootstrap, /docs\/prd\.md/);
  assert.match(artifacts.bootstrap, /Do not load docs\/idea\.md/i);
  assert.match(artifacts.bootstrap, /Do not read docs\/research\.md by default/i);

  const promptInvocation = readFileSync(argsFile, 'utf8');
  assert.match(promptInvocation, /--session/);
  assert.match(promptInvocation, new RegExp(`\\.runs-sessions/${artifacts.basename}\\.jsonl`));
  assert.match(promptInvocation, /-p/);
  assert.match(promptInvocation, /Read \.runs\/.+\.bootstrap\.md before doing anything else\./);
  assert.match(promptInvocation, /Fokus atau klarifikasi eksekusi tambahan bila ada: ISSUE-001/);
  assert.match(promptInvocation, /jangan fallback ke ticket AFK lain/i);

  const ahead = run('git', ['rev-list', '--count', 'main..HEAD'], { cwd: repoDir, env });
  assert.equal(Number(ahead.stdout.trim()) >= 1, true);

  const lastCommit = run('git', ['log', '-1', '--pretty=%s'], { cwd: repoDir, env });
  assert.match(lastCommit.stdout.trim(), /runs-once: complete ISSUE-001/);

  const updatedIssues = readFileSync(join(repoDir, 'docs', 'issues.md'), 'utf8');
  assert.match(updatedIssues, /### ISSUE-001 — First[\s\S]*- Status: done/);
});

test('includes docs/research.md in bootstrap only when the selected ticket explicitly requires it', () => {
  const { repoDir, env } = setupRepo({
    issuesContent: `# Issues\n\n### ISSUE-001 — Research-heavy\n- Status: todo\n- Type: AFK\n- Auto-run: yes\n- Depends on: none\n- Notes: read docs/research.md before implementation\n`,
    fakePiBody: 'node -e "const fs=require(\'node:fs\'); let issues=fs.readFileSync(\'docs/issues.md\', \'utf8\'); issues=issues.replace(\'- Status: todo\', \'- Status: done\'); fs.writeFileSync(\'docs/issues.md\', issues);"\n',
  });

  const result = runScript(repoDir, env);
  assert.equal(result.status, 0);

  const artifacts = readRunArtifacts(repoDir);
  assert.match(artifacts.bootstrap, /Read docs\/research\.md because the selected ticket explicitly references it\./);
  assert.match(artifacts.bootstrap, /- docs\/research\.md/);
});

test('fails early on a dirty working tree before worker execution starts and still records a FAIL result', () => {
  const { repoDir, env } = setupRepo({
    issuesContent: `# Issues\n\n### ISSUE-001 — First\n- Status: todo\n- Type: AFK\n- Auto-run: yes\n- Depends on: none\n`,
  });

  writeFileSync(join(repoDir, 'dirty.txt'), 'local change\n');

  const result = runScript(repoDir, env);
  assert.equal(result.status, 1);
  assert.match(result.stdout, /Status: FAIL/);
  assert.match(result.stdout, /working tree is not clean/i);

  const artifacts = readRunArtifacts(repoDir);
  assert.equal(artifacts.result.status, 'FAIL');
  assert.equal(artifacts.result.status_reason, 'run_failed');
  assert.match(artifacts.result.status_detail, /working tree is not clean/i);
});

test('fails with an actionable message when required tooling is missing', () => {
  const { repoDir, env } = setupRepo({
    issuesContent: `# Issues\n\n### ISSUE-001 — First\n- Status: todo\n- Type: AFK\n- Auto-run: yes\n- Depends on: none\n`,
    withFakePi: false,
  });

  const result = runScript(repoDir, env);
  assert.equal(result.status, 1);
  assert.match(result.stdout, /Status: FAIL/);
  assert.match(result.stdout, /required tooling missing: pi/i);

  const artifacts = readRunArtifacts(repoDir);
  assert.equal(artifacts.result.status, 'FAIL');
  assert.equal(artifacts.result.status_reason, 'run_failed');
  assert.match(artifacts.result.status_detail, /required tooling missing: pi/i);
  assert.ok(Array.isArray(artifacts.result.next_action));
  assert.ok(artifacts.result.next_action.length > 0);
});

test('ends as BLOCKED when the selected issue is no longer ready, preserves docs/issues updates, and discards partial code', () => {
  const initialIssues = `# Issues\n\n### ISSUE-001 — First\n- Status: todo\n- Type: AFK\n- Auto-run: yes\n- Depends on: none\n`;
  const blockedIssues = `# Issues\n\n### ISSUE-001 — First\n- Status: blocked\n- Type: AFK\n- Auto-run: yes\n- Depends on: none\n- Notes / risks:\n  - Blocked after re-verification in the issue branch.\n`;
  const { repoDir, env } = setupRepo({
    issuesContent: initialIssues,
  });
  const mutationDir = mkdtempSync(join(tmpdir(), 'runs-once-mutation-'));
  const mutatedIssuesPath = join(mutationDir, 'mutated-issues.md');
  writeFileSync(mutatedIssuesPath, blockedIssues);
  const argsFile = join(repoDir, 'pi-args.txt');

  const result = runScript(repoDir, {
    ...env,
    RUNS_ONCE_TEST_PI_ARGS_FILE: argsFile,
    RUNS_ONCE_TEST_MUTATE_ON_CHECKOUT: '1',
    RUNS_ONCE_TEST_MUTATED_ISSUES_FILE: mutatedIssuesPath,
    RUNS_ONCE_TEST_PARTIAL_CODE_FILE: 'README.md',
  });

  assert.equal(result.status, 0);
  assert.match(result.stdout, /Status: BLOCKED/);
  assert.match(result.stdout, /no longer ready/i);

  const artifacts = readRunArtifacts(repoDir);
  assert.equal(artifacts.result.status, 'BLOCKED');
  assert.equal(artifacts.result.status_reason, 'target_conflict');
  assert.ok(Array.isArray(artifacts.result.next_action));
  assert.ok(artifacts.result.next_action.length > 0);
  assert.match(artifacts.result.next_action.join('\n'), /copy back only the relevant docs\/issues\.md updates/i);
  assert.match(artifacts.result.next_action.join('\n'), /do not merge the issue branch into the orchestrator branch/i);

  assert.equal(readFileSync(join(repoDir, 'docs', 'issues.md'), 'utf8'), blockedIssues);
  assert.doesNotMatch(readFileSync(join(repoDir, 'README.md'), 'utf8'), /partial code that must be discarded/);
  assert.throws(() => readFileSync(argsFile, 'utf8'), /ENOENT/);
});

test('fails instead of marking DONE when the worker does not leave the target issue in a done state', () => {
  const { repoDir, env } = setupRepo({
    issuesContent: `# Issues\n\n### ISSUE-001 — First\n- Status: todo\n- Type: AFK\n- Auto-run: yes\n- Depends on: none\n`,
    fakePiBody: 'echo "fake pi worker"\n',
  });

  const result = runScript(repoDir, env);
  assert.equal(result.status, 1);
  assert.match(result.stdout, /Status: FAIL/);
  assert.match(result.stdout, /did not mark ISSUE-001 as done/i);

  const artifacts = readRunArtifacts(repoDir);
  assert.equal(artifacts.result.status, 'FAIL');
  assert.equal(artifacts.result.status_reason, 'run_failed');
  assert.match(artifacts.result.status_detail, /did not mark ISSUE-001 as done/i);
});

test('records FAIL with a controlled status reason and next action when the worker process exits non-zero', () => {
  const { repoDir, env } = setupRepo({
    issuesContent: `# Issues\n\n### ISSUE-001 — First\n- Status: todo\n- Type: AFK\n- Auto-run: yes\n- Depends on: none\n`,
    fakePiBody: 'echo "worker failed"\nexit 23\n',
  });

  const result = runScript(repoDir, env);
  assert.equal(result.status, 1);
  assert.match(result.stdout, /Status: FAIL/);
  assert.match(result.stdout, /pi worker exited with status 23/i);

  const artifacts = readRunArtifacts(repoDir);
  assert.equal(artifacts.result.status, 'FAIL');
  assert.equal(artifacts.result.status_reason, 'run_failed');
  assert.match(artifacts.result.status_detail, /pi worker exited with status 23/i);
  assert.ok(Array.isArray(artifacts.result.next_action));
  assert.ok(artifacts.result.next_action.length > 0);
});

test('verifyTargetTicket fails closed when the selected issue is no longer ready', () => {
  const snapshot = {
    id: 'ISSUE-001',
    title: 'First',
    status: 'todo',
    type: 'afk',
    autoRun: 'yes',
    dependsOn: [],
  };

  const result = verifyTargetTicket(snapshot, [{ ...snapshot, status: 'blocked' }]);
  assert.equal(result.ok, false);
  assert.match(result.reason, /no longer ready/i);
});

test('verifyTargetTicket fails closed on material source-of-truth conflicts', () => {
  const snapshot = {
    id: 'ISSUE-001',
    title: 'First',
    status: 'todo',
    type: 'afk',
    autoRun: 'yes',
    dependsOn: ['ISSUE-099'],
  };

  const result = verifyTargetTicket(snapshot, [
    { ...snapshot, dependsOn: ['ISSUE-100'] },
    { id: 'ISSUE-100', title: 'Dependency', status: 'done', type: 'afk', autoRun: 'yes', dependsOn: [] },
  ]);

  assert.equal(result.ok, false);
  assert.match(result.reason, /material source-of-truth conflict/i);
});
