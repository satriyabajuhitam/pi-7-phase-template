/**
 * spawn — Minimal subagent extension
 *
 * One tool. One prompt. The orchestrator controls concurrency.
 *
 *   Single call   → one subagent, one task
 *   Multiple calls → pi runs them in parallel (the model decides)
 *   Sequential    → the model waits for each spawn to finish before calling again
 *
 * Design:
 *   Each spawn creates an isolated in-process AgentSession via the pi SDK.
 *   Custom renderCall/renderResult shows live streaming + token/cost stats.
 *   No task batching, no concurrency parameter — the orchestrator's
 *   call pattern IS the concurrency model.
 */

import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import type { Message, Model } from "@earendil-works/pi-ai";
import { StringEnum } from "@earendil-works/pi-ai";
import {
	DEFAULT_MAX_BYTES,
	DEFAULT_MAX_LINES,
	type AgentSessionEvent,
	type ExtensionAPI,
	type ModelRegistry,
	type TruncationResult,
	DefaultResourceLoader,
	createAgentSession,
	defineTool,
	formatSize,
	getAgentDir,
	getMarkdownTheme,
	keyHint,
	SessionManager,
	SettingsManager,
	truncateHead,
	truncateTail,
	withFileMutationQueue,
} from "@earendil-works/pi-coding-agent";
import { Container, Markdown, Spacer, Text, truncateToWidth } from "@earendil-works/pi-tui";
import { Type } from "typebox";
import { TOOL_NAME } from "./shared";

// Path of this extension file — used to exclude spawn from subagent sessions.
const SELF_PATH = fileURLToPath(import.meta.url);

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

interface SubagentUsage {
	input: number;
	output: number;
	cacheRead: number;
	cacheWrite: number;
	cost: number;
	contextTokens: number;
	turns: number;
	model: string;
	stopReason: string | undefined;
}

interface TaskResult {
	prompt: string;
	output: string;
	usage: SubagentUsage;
	error?: string;
	warning?: string;
	missingReturnResult?: boolean;
	truncation?: TruncationResult;
	fullOutputPath?: string;
	streamPreview?: string;
	streamPreviewTruncated?: boolean;
}

interface SpawnDetails {
	mode: "spawn";
	results: TaskResult[];
}

// ─────────────────────────────────────────────────────────────
// Render components
// ─────────────────────────────────────────────────────────────

/** Reusable Text component for renderCall — carries state across renders. */
class SpawnCallComponent extends Text {
	constructor() {
		super("", 0, 0);
	}
}

/** Reusable Text component for renderResult (collapsed + streaming) — avoids allocation on each render. */
class SpawnResultText extends Text {
	constructor() {
		super("", 0, 0);
	}
}

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

const STREAM_PREVIEW_MAX_BYTES = 1024;
const STREAM_PREVIEW_MAX_LINES = 24;
const STREAM_UPDATE_MIN_INTERVAL_MS = 100;
const EMPTY_USAGE: SubagentUsage = {
	input: 0,
	output: 0,
	cacheRead: 0,
	cacheWrite: 0,
	cost: 0,
	contextTokens: 0,
	turns: 0,
	model: "",
	stopReason: undefined,
};

function formatTokens(n: number): string {
	if (n < 1000) return String(n);
	if (n < 10_000) return (n / 1000).toFixed(1) + "k";
	return Math.round(n / 1000) + "k";
}

function formatUsage(u: SubagentUsage): string {
	const parts: string[] = [];
	if (u.turns) parts.push(u.turns + " turn" + (u.turns > 1 ? "s" : ""));
	if (u.input) parts.push("\u2191" + formatTokens(u.input));
	if (u.output) parts.push("\u2193" + formatTokens(u.output));
	if (u.cacheRead) parts.push("R" + formatTokens(u.cacheRead));
	if (u.cacheWrite) parts.push("W" + formatTokens(u.cacheWrite));
	if (u.cost) parts.push("$" + u.cost.toFixed(4));
	if (u.contextTokens > 0) parts.push("ctx:" + formatTokens(u.contextTokens));
	if (u.model) parts.push(u.model);
	return parts.join(" ");
}

function getMeaningfulLines(text: string): string[] {
	return text
		.split("\n")
		.map((line) => line.trim())
		.filter(Boolean);
}

function truncatePreviewLine(text: string, maxChars = 88): string {
	if (text.length <= maxChars) return text;
	return text.slice(0, maxChars - 1) + "…";
}

function normalizeActivityLine(text: string): string {
	const trimmed = text.trim();
	const match = trimmed.match(/^\[([^\]]+)\]\s*(.*)$/);
	if (!match) return truncatePreviewLine(trimmed);
	const [, toolName, rest] = match;
	if (!rest) return `${toolName}\u2026`;
	return truncatePreviewLine(`${toolName}: ${rest}`);
}

function getPromptPreview(prompt: string): { shown: string[]; remaining: number } {
	const lines = prompt.split("\n").map((line) => line.trim()).filter(Boolean);
	const shown = (lines.length > 0 ? lines : ["(empty prompt)"]).slice(0, 2).map((line) => truncatePreviewLine(line));
	return { shown, remaining: Math.max(0, lines.length - shown.length) };
}

function getResultPreview(r: TaskResult): string {
	const firstLine = getMeaningfulLines(r.output)[0];
	if (r.missingReturnResult) {
		if (firstLine) return truncatePreviewLine(`No return_result — fallback output only. ${firstLine}`);
		return "No return_result — fallback output only.";
	}
	if (r.warning) {
		if (firstLine) return truncatePreviewLine(firstLine);
		return truncatePreviewLine(r.warning);
	}
	if (firstLine) return truncatePreviewLine(firstLine);
	return "No output.";
}

function getStreamingPreview(text: string): string {
	const lines = getMeaningfulLines(text);
	const lastLine = lines.at(-1);
	if (!lastLine) return "Waiting for output…";
	return normalizeActivityLine(lastLine);
}

function getFinalOutput(messages: Message[]): string {
	for (let i = messages.length - 1; i >= 0; i--) {
		const m = messages[i];
		if (m.role === "assistant") {
			for (const part of m.content) {
				if (part.type === "text") return part.text;
			}
		}
	}
	return "";
}

function appendStreamingPreviewBuffer(
	buffer: string,
	chunk: string,
): { buffer: string; truncated: boolean } {
	const truncation = truncateTail(buffer + chunk, {
		maxLines: STREAM_PREVIEW_MAX_LINES,
		maxBytes: STREAM_PREVIEW_MAX_BYTES,
	});
	return {
		buffer: truncation.content,
		truncated: truncation.truncated,
	};
}

async function truncateFinalOutput(
	output: string,
): Promise<Pick<TaskResult, "output" | "truncation" | "fullOutputPath">> {
	if (!output) return { output: "" };

	const truncation = truncateHead(output, {
		maxLines: DEFAULT_MAX_LINES,
		maxBytes: DEFAULT_MAX_BYTES,
	});

	let resultText = truncation.content;
	let fullOutputPath: string | undefined;

	if (truncation.truncated) {
		const tempDir = await mkdtemp(join(tmpdir(), "pi-spawn-"));
		fullOutputPath = join(tempDir, "output.md");
		await withFileMutationQueue(fullOutputPath, async () => {
			await writeFile(fullOutputPath!, output, "utf8");
		});

		const omittedLines = truncation.totalLines - truncation.outputLines;
		const omittedBytes = truncation.totalBytes - truncation.outputBytes;
		resultText += `\n\n[Output truncated: showing ${truncation.outputLines} of ${truncation.totalLines} lines`;
		resultText += ` (${formatSize(truncation.outputBytes)} of ${formatSize(truncation.totalBytes)}).`;
		resultText += ` ${omittedLines} lines (${formatSize(omittedBytes)}) omitted.`;
		resultText += ` Full output saved to: ${fullOutputPath}]`;
	}

	return {
		output: resultText,
		truncation: truncation.truncated ? truncation : undefined,
		fullOutputPath,
	};
}

const MISSING_RETURN_RESULT_FALLBACK =
	"subagent finished without calling return_result; fell back to the last assistant message.";
const MISSING_RETURN_RESULT_WARNING =
	`${MISSING_RETURN_RESULT_FALLBACK} Treat this as degraded-success.`;
const MISSING_RETURN_RESULT_STRICT_WARNING =
	"strictResult enabled: fallback output is shown for debugging, but the spawn is treated as failed.";
const MISSING_RETURN_RESULT_STRICT_ERROR =
	"subagent finished without calling return_result while strictResult was enabled.";

function formatResultText(result: Pick<TaskResult, "output" | "warning">): string {
	if (!result.warning) return result.output;
	if (result.output) return `${result.output}\n\n[Warning: ${result.warning}]`;
	return `[Warning: ${result.warning}]`;
}

function formatToolError(result: TaskResult): string {
	const text = formatResultText(result);
	if (text) return `Subagent failed: ${result.error}\n\n${text}`;
	return `Subagent failed: ${result.error}`;
}

const SUBAGENT_TOOLS = ["read", "bash", "edit", "write", "grep", "find", "ls"] as const;
type SubagentTool = typeof SUBAGENT_TOOLS[number];
type ThinkingLevel = "off" | "minimal" | "low" | "medium" | "high" | "xhigh";

const SUBAGENT_SYSTEM_PROMPT =
	"You are a focused coding subagent. Your context is fresh — the parent agent delegated this task because it requires isolated attention. Complete the task, then call return_result with a concise summary of what you did and what you found, including evidence such as file paths, line numbers, and specific values.";

const SPAWN_DESCRIPTION = `Spawn an isolated subagent with a fresh context window. Zero access to parent state. All context must be in the prompt.

## Writing a prompt
1. Ground with references, not inline code — give file paths. Have the subagent read them. Don't dump contents.
2. State what, not how. 3. Define output format. 4. Require return_result with evidence (cite paths, lines).

## When to spawn
Tasks with a different focus than the parent that benefit from isolation: fresh review, parallel recon, research, validation, non-trivial codegen (where you do NOT already know the exact implementation).

## When NOT to spawn
If you know the exact implementation, write the file directly. Signs you're spawning wrong: prompt has more code than task; subagent can't discover anything new; prompt dictates variable names and line-by-line behavior.

> Empty-shell test: If removing the code leaves an empty prompt, write the file directly.

## Dependencies & order
| Pattern | When | How |
|---------|------|-----|
| Serial | Step B needs Step A's output | Sequential spawn calls (pi waits) |
| Parallel | Independent work | Fire multiple in one turn (pi runs concurrently) |
| Mixed | Scout then build | Parallel scouts → parent merges → serial implementation |

Rule: if spawn A's output feeds spawn B, use serial. Never fire both in one turn and hope A finishes first.

## Cost awareness
Each spawn costs tokens independently. No free lunch.

BAD — inline code (write directly instead):
  spawn agent
    Implement this: [400 lines of code]
    Save to src/foo.ts

GOOD — reference delegation:
  spawn agent
    Read src/foo.ts for patterns. Implement retry wrapper at
    src/retry.ts with exponential backoff and jitter.
    Call return_result with path + summary.

Bad: "Find the bug in the auth code."
Good: "Read src/auth/login.ts lines 40-80. The login handler crashes when the token expires. Identify the root cause and call return_result with your findings. Cite the specific lines and values that demonstrate the bug."`;

// ─────────────────────────────────────────────────────────────
// Core: run a single subagent in an isolated in-process session
// ─────────────────────────────────────────────────────────────

async function runOne(
	prompt: string,
	parentModel: Model<any>,
	modelRegistry: ModelRegistry,
	thinking: ThinkingLevel,
	signal: AbortSignal | undefined,
	cwd: string,
	activeTools: readonly string[],
	strictResult: boolean,
	onOutput: (text: string) => void,
): Promise<TaskResult> {
	const agentDir = getAgentDir();
	const settingsManager = SettingsManager.create(cwd, agentDir);
	const resourceLoader = new DefaultResourceLoader({
		cwd,
		agentDir,
		settingsManager,
		appendSystemPromptOverride: (base) => [...base, SUBAGENT_SYSTEM_PROMPT],
		noThemes: true,
		extensionsOverride: (base) => ({
			...base,
			extensions: base.extensions.filter((ext) => ext.resolvedPath !== SELF_PATH),
		}),
	});
	await resourceLoader.reload();

	const allowed = new Set<string>(SUBAGENT_TOOLS);
	const inheritedTools = activeTools.filter((tool): tool is SubagentTool =>
		allowed.has(tool),
	);

	// return_result tool — captures structured output from the subagent
	let returnedResult: string | undefined;
	const returnResultTool = defineTool({
		name: "return_result",
		label: "Return Result",
		description: "Call this tool exactly once when you have completed your task to return the final result to the parent agent.",
		parameters: Type.Object({
			result: Type.String({ description: "The result of your work, with evidence such as file paths, line numbers, and values." }),
		}),
		async execute(_toolCallId, params) {
			returnedResult = params.result;
			return {
				content: [{ type: "text", text: "Result submitted." }],
				details: {},
			};
		},
	});

	const { session } = await createAgentSession({
		cwd,
		sessionManager: SessionManager.inMemory(cwd),
		tools: [...inheritedTools],
		customTools: [returnResultTool],
		model: parentModel,
		modelRegistry,
		thinkingLevel: thinking,
		resourceLoader,
		settingsManager,
	});

	const messages: Message[] = [];
	const unsub = session.subscribe((evt: AgentSessionEvent) => {
		if (evt.type === "message_update" && evt.assistantMessageEvent.type === "text_delta") {
			onOutput(evt.assistantMessageEvent.delta);
		}
		if (evt.type === "message_end") {
			messages.push(evt.message as Message);
		}
		if (evt.type === "tool_execution_start") {
			onOutput("\n[" + evt.toolName + "] ");
		}
		if (evt.type === "tool_execution_update") {
			const text = evt.partialResult?.content?.find((c: { type: string; text?: string }) => c.type === "text")?.text;
			if (text) onOutput(text);
		}
	});

	const abortListener = () => {
		void session.abort();
	};

	try {
		if (signal?.aborted) {
			void session.abort();
		}
		signal?.addEventListener("abort", abortListener, { once: true });

		await session.prompt(prompt);

		const modelId = session.model?.id ?? parentModel.id;
		const usage = collectUsage(messages, modelId);
		const missingReturnResult = returnedResult === undefined;
		const missingReturnResultWarning = strictResult ? MISSING_RETURN_RESULT_STRICT_WARNING : MISSING_RETURN_RESULT_WARNING;
		const finalOutput = await truncateFinalOutput(returnedResult ?? getFinalOutput(messages));
		return {
			prompt,
			usage,
			...(strictResult && missingReturnResult ? { error: MISSING_RETURN_RESULT_STRICT_ERROR } : {}),
			...(missingReturnResult ? { missingReturnResult: true, warning: missingReturnResultWarning } : {}),
			...finalOutput,
		};
	} catch (err: any) {
		const modelId = session.model?.id ?? parentModel.id;
		const usage = collectUsage(messages, modelId);
		const missingReturnResult = returnedResult === undefined;
		const missingReturnResultWarning = strictResult ? MISSING_RETURN_RESULT_STRICT_WARNING : MISSING_RETURN_RESULT_WARNING;
		const finalOutput = await truncateFinalOutput(returnedResult ?? getFinalOutput(messages));
		return {
			prompt,
			usage,
			error: err?.message ?? String(err),
			...(missingReturnResult ? { missingReturnResult: true, warning: missingReturnResultWarning } : {}),
			...finalOutput,
		};
	} finally {
		signal?.removeEventListener("abort", abortListener);
		unsub();
		session.dispose();
	}
}

function collectUsage(messages: Message[], modelId: string): SubagentUsage {
	const usage: SubagentUsage = {
		input: 0,
		output: 0,
		cacheRead: 0,
		cacheWrite: 0,
		cost: 0,
		contextTokens: 0,
		turns: 0,
		model: modelId,
		stopReason: undefined,
	};
	for (const m of messages) {
		if (m.role === "assistant") {
			usage.turns++;
			if (m.usage) {
				usage.input += m.usage.input || 0;
				usage.output += m.usage.output || 0;
				usage.cacheRead += m.usage.cacheRead || 0;
				usage.cacheWrite += m.usage.cacheWrite || 0;
				usage.cost += m.usage.cost?.total || 0;
				usage.contextTokens = m.usage.totalTokens || 0;
			}
			if (m.stopReason) usage.stopReason = m.stopReason;
			if (m.model && m.model !== modelId) usage.model = m.model;
		}
	}
	return usage;
}

interface ActiveSpawnEntry {
	toolCallId: string;
	title: string;
	activity: string;
	strictResult: boolean;
}

type WidgetTheme = {
	fg(color: string, text: string): string;
	bold(text: string): string;
};

type WidgetUI = {
	setWidget(
		key: string,
		content: undefined | ((tui: any, theme: WidgetTheme) => { render(width: number): string[]; invalidate(): void }),
		options?: { placement?: "aboveEditor" | "belowEditor" },
	): void;
};

function buildWidgetTitle(prompt: string): string {
	const { shown, remaining } = getPromptPreview(prompt);
	const first = shown[0] ?? "(empty prompt)";
	return remaining > 0 ? `${first} (+${remaining})` : first;
}

// ─────────────────────────────────────────────────────────────
// Extension entry point
// ─────────────────────────────────────────────────────────────

export default function (pi: ExtensionAPI) {
	const activeSpawns = new Map<string, ActiveSpawnEntry>();
	let widgetUI: WidgetUI | undefined;
	let widgetRegistered = false;
	let widgetTui: any | undefined;

	function clearActiveSpawnWidget() {
		if (!widgetUI) return;
		widgetUI.setWidget("spawn-active", undefined);
		widgetRegistered = false;
		widgetTui = undefined;
	}

	function renderActiveSpawnWidget(width: number, theme: WidgetTheme): string[] {
		const entries = [...activeSpawns.values()];
		if (entries.length === 0) return [];

		const visible = entries.slice(0, 3);
		const lines: string[] = [];
		lines.push(truncateToWidth(`${theme.fg("accent", "●")} ${theme.fg("accent", theme.bold("Active spawns"))}`, width));

		for (const [index, entry] of visible.entries()) {
			const isLastVisible = index === visible.length - 1 && entries.length <= visible.length;
			const branch = isLastVisible ? "└─" : "├─";
			const childBranch = isLastVisible ? "   " : "│  ";
			let title = `${branch} ${theme.fg("accent", "●")} ${entry.title}`;
			if (entry.strictResult) title += ` ${theme.fg("warning", "[strict]")}`;
			lines.push(truncateToWidth(title, width));
			lines.push(truncateToWidth(`${childBranch} ${theme.fg("dim", `⎿ ${entry.activity}`)}`, width));
		}

		if (entries.length > visible.length) {
			lines.push(truncateToWidth(`└─ ${theme.fg("muted", `+${entries.length - visible.length} more running`)}`, width));
		}

		return lines;
	}

	function refreshActiveSpawnWidget() {
		if (!widgetUI) return;
		if (activeSpawns.size === 0) {
			clearActiveSpawnWidget();
			return;
		}

		if (!widgetRegistered) {
			widgetUI.setWidget("spawn-active", (tui, theme) => {
				widgetTui = tui;
				return {
					render: (width: number) => renderActiveSpawnWidget(width, theme),
					invalidate: () => {
						widgetRegistered = false;
						widgetTui = undefined;
					},
				};
			}, { placement: "aboveEditor" });
			widgetRegistered = true;
			return;
		}

		widgetTui?.requestRender();
	}

	function ensureWidgetUI(ui: unknown) {
		if (!ui) return;
		const nextUI = ui as WidgetUI;
		if (nextUI !== widgetUI) {
			widgetUI = nextUI;
			widgetRegistered = false;
			widgetTui = undefined;
		}
	}

	function startActiveSpawn(toolCallId: string, prompt: string, strictResult: boolean, ui: unknown) {
		ensureWidgetUI(ui);
		activeSpawns.set(toolCallId, {
			toolCallId,
			title: buildWidgetTitle(prompt),
			activity: "Starting…",
			strictResult,
		});
		refreshActiveSpawnWidget();
	}

	function updateActiveSpawn(toolCallId: string, activity: string) {
		const entry = activeSpawns.get(toolCallId);
		if (!entry) return;
		if (entry.activity === activity) return;
		entry.activity = activity;
		refreshActiveSpawnWidget();
	}

	function finishActiveSpawn(toolCallId: string) {
		if (!activeSpawns.delete(toolCallId)) return;
		refreshActiveSpawnWidget();
	}

	pi.on("session_start", async () => {
		activeSpawns.clear();
		clearActiveSpawnWidget();
	});

	pi.on("session_shutdown", async () => {
		activeSpawns.clear();
		clearActiveSpawnWidget();
	});

	const spawnTool = defineTool({
		name: TOOL_NAME,
		label: "Spawn Subagent",
		description: SPAWN_DESCRIPTION,

		promptSnippet: "Delegate one focused task to an isolated subagent",
		promptGuidelines: [
			"Ground prompts with file references, not inline code — have the subagent read files to discover patterns.",
			"State what, not how — if you know the exact implementation, write the file directly instead of spawning.",
			"Fire multiple spawn calls in one turn for parallel independent work — pi runs them concurrently.",
			"Make sequential spawn calls for dependent steps — each waits for the previous to finish.",
			"Every spawn consumes tokens independently — prefer handling simple lookups directly in the parent instead.",
		],

		parameters: Type.Object({
			prompt: Type.String({
				description:
					"Self-contained task for the subagent. Include file paths, code snippets, expected output format.",
			}),
			thinking: Type.Optional(
				StringEnum(["off", "minimal", "low", "medium", "high", "xhigh"] as const, {
					description: "Override thinking level for this subagent. Defaults to the parent's current thinking level.",
				}),
			),
			strictResult: Type.Optional(
				Type.Boolean({
					description: "If true, fail explicitly when the child finishes without calling return_result. Defaults to false.",
				}),
			),
		}),

		async execute(toolCallId, params, signal, onUpdate, ctx) {
			const thinking: ThinkingLevel = params.thinking ?? pi.getThinkingLevel();
			const strictResult = params.strictResult ?? false;
			const parentModel = ctx.model;
			const modelRegistry = ctx.modelRegistry;
			const cwd = ctx.cwd;
			const activeTools = pi.getActiveTools();

			if (!parentModel || !modelRegistry) {
				throw new Error("No model selected. Select a model first.");
			}

			startActiveSpawn(toolCallId, params.prompt, strictResult, ctx.ui);

			let streamPreviewBuffer = "";
			let pendingStreamText = "";
			let lastStreamEmitAt = 0;
			let lastStreamPreview = "Starting…";
			let lastStreamPreviewTruncated = false;
			const flushStreamingUpdate = (force = false) => {
				if (!pendingStreamText && !force) return;
				const prevPreview = lastStreamPreview;
				const prevPreviewTruncated = lastStreamPreviewTruncated;
				if (pendingStreamText) {
					const next = appendStreamingPreviewBuffer(streamPreviewBuffer, pendingStreamText);
					streamPreviewBuffer = next.buffer;
					lastStreamPreviewTruncated = lastStreamPreviewTruncated || next.truncated;
					pendingStreamText = "";
				}
				const streamPreview = getStreamingPreview(streamPreviewBuffer);
				const previewChanged =
					streamPreview !== prevPreview || lastStreamPreviewTruncated !== prevPreviewTruncated;
				lastStreamPreview = streamPreview;
				lastStreamEmitAt = Date.now();
				if (!force && !previewChanged) return;
				updateActiveSpawn(toolCallId, streamPreview);
				onUpdate?.({
					content: [{ type: "text", text: streamPreview }],
					details: {
						mode: "spawn",
						results: [{
							prompt: params.prompt,
							output: streamPreview,
							streamPreview,
							streamPreviewTruncated: lastStreamPreviewTruncated,
							usage: EMPTY_USAGE,
						}],
					} as SpawnDetails,
				});
			};
			const onOut = (t: string) => {
				pendingStreamText += t;
				const now = Date.now();
				const shouldFlush =
					t.includes("\n") ||
					t.startsWith("[") ||
					now - lastStreamEmitAt >= STREAM_UPDATE_MIN_INTERVAL_MS;
				if (shouldFlush) flushStreamingUpdate();
			};

			try {
				const result = await runOne(
					params.prompt,
					parentModel,
					modelRegistry,
					thinking,
					signal,
					cwd,
					activeTools,
					strictResult,
					onOut,
				);
				flushStreamingUpdate(true);

				if (result.error) {
					throw new Error(formatToolError(result));
				}

				return {
					content: [{ type: "text", text: formatResultText(result) }],
					details: { mode: "spawn", results: [result] } as SpawnDetails,
				};
			} finally {
				finishActiveSpawn(toolCallId);
			}
		},

		renderCall(args, theme, context) {
			const comp = (context.lastComponent as SpawnCallComponent | undefined) ?? new SpawnCallComponent();
			const prompt = (args.prompt ?? "...") as string;
			const { shown, remaining } = getPromptPreview(prompt);
			let text = theme.fg("muted", "◦") + " " + theme.fg("toolTitle", theme.bold("spawn"));
			text += " " + theme.fg("dim", "queued");
			if (args.thinking) text += theme.fg("dim", ` [${args.thinking as string}]`);
			if (args.strictResult) text += theme.fg("warning", " [strict-result]");
			if (context.expanded) {
				text += "\n" + theme.fg("dim", prompt);
			} else {
				text += "\n" + theme.fg("dim", `⎿ ${shown[0]}`);
				if (shown[1]) text += "\n" + theme.fg("dim", `  ${shown[1]}`);
				if (remaining > 0) {
					text += theme.fg("muted", `\n... (${remaining} more lines, ${keyHint("app.tools.expand", "to expand")})`);
				}
			}
			comp.setText(text);
			return comp;
		},

		renderResult(result, { expanded, isPartial, isError }, theme, context) {
			const comp = (context.lastComponent instanceof SpawnResultText
				? context.lastComponent
				: new SpawnResultText()) as SpawnResultText;
			const details = result.details as SpawnDetails | undefined;

			// ── Streaming ──
			if (isPartial) {
				const t = result.content[0];
				const raw = t?.type === "text" ? t.text : "";
				const partial = details?.results[0];
				const streamPreview = partial?.streamPreview ?? getStreamingPreview(raw);
				const streamPreviewTruncated = partial?.streamPreviewTruncated ?? false;
				let text = theme.fg("accent", "●") + " " + theme.fg("toolTitle", theme.bold("spawn"));
				text += " " + theme.fg("accent", "running");
				text += "\n" + theme.fg("dim", `⎿ ${streamPreview}`);
				if (streamPreviewTruncated) {
					text += "\n" + theme.fg("warning", "[stream truncated]");
				}
				comp.setText(text);
				return comp;
			}

			// ── No details (fallback / thrown tool error) ──
			if (!details || details.results.length === 0) {
				const t = result.content[0];
				const raw = t?.type === "text" ? t.text : "";
				const summary = truncatePreviewLine(getMeaningfulLines(raw)[0] ?? (isError ? "Spawn failed." : "No output."));
				let text = (isError ? theme.fg("error", "✗") : theme.fg("muted", "○")) + " ";
				text += theme.fg("toolTitle", theme.bold("spawn"));
				text += " " + theme.fg(isError ? "error" : "dim", isError ? "error" : "done");
				text += "\n" + theme.fg(isError ? "error" : "dim", `⎿ ${summary}`);
				if (raw && getMeaningfulLines(raw).length > 1) {
					text += "\n" + theme.fg("muted", `(${keyHint("app.tools.expand", "to expand")})`);
				}
				comp.setText(text);
				return comp;
			}

			const r = details.results[0];
			const hasWarning = !!r.warning;
			const hasTruncation = !!r.truncation?.truncated;
			const hasOutput = getMeaningfulLines(r.output).length > 0;
			const isFallback = !!r.missingReturnResult;
			const isEmpty = !hasOutput && !r.error;
			const statusText = r.error
				? "error"
				: isFallback
					? "fallback"
					: hasWarning
						? "warning"
						: hasTruncation
							? "truncated"
							: isEmpty
								? "empty"
								: "done";
			const statusTone = r.error
				? "error"
				: isFallback || hasWarning || hasTruncation
					? "warning"
					: isEmpty
						? "dim"
						: "success";
			const icon = r.error
				? theme.fg("error", "✗")
				: isFallback || hasWarning || hasTruncation
					? theme.fg("warning", "!")
					: isEmpty
						? theme.fg("muted", "○")
						: theme.fg("success", "✓");
			const mdTheme = getMarkdownTheme();
			const badges: string[] = [];
			if (isFallback) badges.push(theme.fg("warning", "[no return_result]"));
			if (hasWarning && !isFallback) badges.push(theme.fg("warning", "[warning]"));
			if (hasTruncation) badges.push(theme.fg("warning", "[truncated]"));
			if (isEmpty) badges.push(theme.fg("muted", "[empty]"));
			const badgesText = badges.length > 0 ? " " + badges.join(" ") : "";

			// ── Expanded ──
			if (expanded) {
				const container = new Container();
				container.addChild(new Text(`${icon} ${theme.fg("toolTitle", theme.bold("spawn"))} ${theme.fg(statusTone, statusText)}${badgesText}`, 0, 0));
				container.addChild(new Spacer(1));
				container.addChild(new Text(theme.fg("muted", "─── Task ───"), 0, 0));
				container.addChild(new Text(theme.fg("dim", r.prompt), 0, 0));
				container.addChild(new Spacer(1));
				if (r.error) {
					container.addChild(new Text(theme.fg("error", "Error: " + r.error), 0, 0));
				} else if (r.output) {
					container.addChild(new Text(theme.fg("muted", "─── Output ───"), 0, 0));
					container.addChild(new Markdown(r.output.trim(), 0, 0, mdTheme));
				} else {
					container.addChild(new Text(theme.fg("muted", "(no output)"), 0, 0));
				}
				if (r.warning) {
					container.addChild(new Spacer(1));
					container.addChild(new Text(theme.fg("warning", `Warning: ${r.warning}`), 0, 0));
				}
				if (r.fullOutputPath) {
					container.addChild(new Spacer(1));
					container.addChild(new Text(theme.fg("dim", `Full output: ${r.fullOutputPath}`), 0, 0));
				}
				const usageStr = formatUsage(r.usage);
				if (usageStr) {
					container.addChild(new Spacer(1));
					container.addChild(new Text(theme.fg("dim", usageStr), 0, 0));
				}
				return container;
			}

			// ── Collapsed ──
			let text = `${icon} ${theme.fg("toolTitle", theme.bold("spawn"))} ${theme.fg(statusTone, statusText)}${badgesText}`;
			const preview = r.error ? truncatePreviewLine(r.error) : getResultPreview(r);
			text += "\n" + theme.fg(r.error ? "error" : isFallback ? "warning" : "dim", `⎿ ${preview}`);
			const hasMoreDetail =
				getMeaningfulLines(r.output).length > 1 || !!r.warning || !!r.fullOutputPath || !!r.error || isFallback || hasTruncation;
			if (hasMoreDetail) {
				text += "\n" + theme.fg("muted", `(${keyHint("app.tools.expand", "to expand")})`);
			}
			comp.setText(text);
			return comp;
		},
	});

	pi.registerTool(spawnTool);
}
