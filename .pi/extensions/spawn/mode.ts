import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import {
	BACKEND_UNAVAILABLE_MESSAGE,
	ENTRY_TYPE,
	FALLBACK_MESSAGE,
	getBackendStatus,
	getStatusSummary,
	isSpawnAvailable,
	MODE_DISABLED_MESSAGE,
	MODE_ENABLED_MESSAGE,
	SKILL_BLOCK_MESSAGE,
	SpawnMode,
	TOOL_BLOCK_REASON,
	TOOL_NAME,
} from "./shared";

interface SpawnModeState {
	spawnMode: SpawnMode;
}

const DELEGATE_SKILL_PATTERN = /^\/skill:delegate-me(?:\s|$)/;

export default function spawnModeExtension(pi: ExtensionAPI) {
	let spawnMode: SpawnMode = "off";

	function notify(ctx: ExtensionContext, message: string, level: "info" | "warning" | "error" = "info") {
		if (ctx.hasUI) ctx.ui.notify(message, level);
	}

	function reportStatus(ctx: ExtensionContext, level: "info" | "warning" | "error" = "info") {
		const summary = getStatusSummary(pi, spawnMode);
		if (ctx.hasUI) {
			notify(ctx, summary, level);
			return;
		}
		pi.sendMessage({
			customType: "spawn-mode-status",
			content: summary,
			display: true,
			details: { level, spawnMode, backend: getBackendStatus(pi) },
		});
	}

	function updateStatus(ctx: ExtensionContext) {
		if (!ctx.hasUI) return;
		const theme = ctx.ui.theme;
		const modeText = theme.fg(spawnMode === "on" ? "success" : "warning", `spawn:${spawnMode}`);
		const backendAvailable = isSpawnAvailable(pi);
		const backendText = theme.fg(
			backendAvailable ? "success" : "error",
			`backend:${backendAvailable ? "available" : "unavailable"}`,
		);
		ctx.ui.setStatus("spawn-mode", `${modeText} ${backendText}`);
	}

	function persistState() {
		pi.appendEntry<SpawnModeState>(ENTRY_TYPE, { spawnMode });
	}

	function setMode(ctx: ExtensionContext, mode: SpawnMode, notifyUser = true) {
		spawnMode = mode;
		persistState();
		updateStatus(ctx);
		if (!notifyUser) return;
		notify(ctx, mode === "on" ? MODE_ENABLED_MESSAGE : MODE_DISABLED_MESSAGE, "info");
	}

	function restoreFromBranch(ctx: ExtensionContext) {
		let savedMode: SpawnMode | undefined;
		for (const entry of ctx.sessionManager.getBranch()) {
			if (entry.type !== "custom" || entry.customType !== ENTRY_TYPE) continue;
			const data = entry.data as SpawnModeState | undefined;
			if (data?.spawnMode === "on" || data?.spawnMode === "off") {
				savedMode = data.spawnMode;
			}
		}

		spawnMode = savedMode ?? "off";
		if (spawnMode === "on" && !isSpawnAvailable(pi)) {
			notify(ctx, FALLBACK_MESSAGE, "warning");
		}
		updateStatus(ctx);
	}

	function enableMode(ctx: ExtensionContext) {
		spawnMode = "on";
		persistState();
		updateStatus(ctx);
		if (!isSpawnAvailable(pi)) {
			notify(ctx, BACKEND_UNAVAILABLE_MESSAGE, "error");
			return false;
		}
		notify(ctx, MODE_ENABLED_MESSAGE, "info");
		return true;
	}

	function disableMode(ctx: ExtensionContext) {
		setMode(ctx, "off");
	}

	pi.registerCommand("spawn-mode", {
		description: "Toggle spawn delegation mode on or off",
		handler: async (args, ctx) => {
			const normalized = args.trim().toLowerCase();

			if (normalized === "on") {
				enableMode(ctx);
				return;
			}
			if (normalized === "off") {
				disableMode(ctx);
				return;
			}

			if (!ctx.hasUI) {
				reportStatus(ctx);
				return;
			}

			const choice = await ctx.ui.select(`${getStatusSummary(pi, spawnMode)}\n\nChoose spawn mode`, ["on", "off"]);
			if (!choice) return;

			if (choice === "on") {
				enableMode(ctx);
				return;
			}
			disableMode(ctx);
		},
	});

	pi.on("session_start", async (_event, ctx) => {
		restoreFromBranch(ctx);
	});

	pi.on("session_tree", async (_event, ctx) => {
		restoreFromBranch(ctx);
	});

	pi.on("input", async (event, ctx) => {
		if (event.source === "extension") return { action: "continue" as const };
		if (spawnMode === "on") return { action: "continue" as const };
		if (!DELEGATE_SKILL_PATTERN.test(event.text)) return { action: "continue" as const };

		notify(ctx, SKILL_BLOCK_MESSAGE, "warning");
		return { action: "handled" as const };
	});

	pi.on("tool_call", async (event, ctx) => {
		if (event.toolName !== TOOL_NAME) return undefined;
		if (spawnMode === "on") return undefined;

		notify(ctx, TOOL_BLOCK_REASON, "warning");
		return { block: true, reason: TOOL_BLOCK_REASON };
	});
}
