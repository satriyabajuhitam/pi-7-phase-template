import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

function getPiPackageRoot() {
  const cliPath = execFileSync('bash', ['-lc', 'realpath "$(command -v pi)"'], {
    encoding: 'utf8',
  }).trim();
  return dirname(dirname(cliPath));
}

const piPackageRoot = getPiPackageRoot();
const { createAgentSession, SessionManager, defineTool } = await import(
  pathToFileURL(join(piPackageRoot, 'dist', 'index.js')).href
);

function createReturnResultTool() {
  return defineTool({
    name: 'return_result',
    label: 'Return Result',
    description: 'Deterministic regression test tool.',
    parameters: {
      type: 'object',
      properties: {
        result: { type: 'string' },
      },
      required: ['result'],
    },
    async execute() {
      return {
        content: [{ type: 'text', text: 'ok' }],
        details: {},
      };
    },
  });
}

test('custom return_result tool is only active when explicitly included in the child tools list', async () => {
  const cwd = process.cwd();
  const returnResultTool = createReturnResultTool();

  const { session: withoutExplicitActivation } = await createAgentSession({
    cwd,
    sessionManager: SessionManager.inMemory(cwd),
    tools: ['read', 'bash'],
    customTools: [returnResultTool],
  });

  try {
    assert.deepEqual(withoutExplicitActivation.getActiveToolNames(), ['read', 'bash']);
  } finally {
    withoutExplicitActivation.dispose();
  }

  const { session: withExplicitActivation } = await createAgentSession({
    cwd,
    sessionManager: SessionManager.inMemory(cwd),
    tools: ['read', 'bash', 'return_result'],
    customTools: [returnResultTool],
  });

  try {
    assert.deepEqual(withExplicitActivation.getActiveToolNames(), ['read', 'bash', 'return_result']);
  } finally {
    withExplicitActivation.dispose();
  }
});

test('spawn child-session wiring explicitly activates return_result', () => {
  const extensionSource = readFileSync(resolve('.pi/extensions/spawn/index.ts'), 'utf8');
  assert.match(
    extensionSource,
    /tools:\s*\[\.\.\.inheritedTools,\s*returnResultTool\.name\]/,
  );
});
