import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";

type SpawnMode = "on" | "off";

interface SpawnModeState {
	spawnMode: SpawnMode;
}

const ENTRY_TYPE = "spawn-mode-config";
const DELEGATE_SKILL_PATTERN = /^\/skill:delegate-me(?:\s|$)/;
const MODE_ENABLED_MESSAGE = "spawn mode enabled";
const MODE_DISABLED_MESSAGE = "spawn mode disabled";
const BACKEND_UNAVAILABLE_MESSAGE =
	"spawn backend unavailable. Reload the session or verify the project-local pi-spawn package is installed.";
const FALLBACK_MESSAGE = "spawn backend unavailable; falling back to parent-only workflow.";
const SKILL_BLOCK_MESSAGE =
	"delegate-me is unavailable while spawn mode is off. Run /spawn-mode and choose on.";
const TOOL_BLOCK_REASON = "spawn is disabled because spawn mode is off.";

export default function spawnModeExtension(pi: ExtensionAPI) {
	let spawnMode: SpawnMode = "off";

	function notify(ctx: ExtensionContext, message: string, level: "info" | "warning" | "error" = "info") {
		if (ctx.hasUI) ctx.ui.notify(message, level);
	}

	function updateStatus(ctx: ExtensionContext) {
		if (!ctx.hasUI) return;
		ctx.ui.setStatus("spawn-mode", undefined);
	}

	function isSpawnAvailable() {
		return pi.getAllTools().some((tool) => tool.name === "spawn");
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
		if (spawnMode === "on" && !isSpawnAvailable()) {
			notify(ctx, FALLBACK_MESSAGE, "warning");
		}
		updateStatus(ctx);
	}

	function enableMode(ctx: ExtensionContext) {
		spawnMode = "on";
		persistState();
		updateStatus(ctx);
		if (!isSpawnAvailable()) {
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
				return;
			}

			notify(ctx, `current spawn mode: ${spawnMode}`, "info");
			const choice = await ctx.ui.select("Choose spawn mode", ["on", "off"]);
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
		if (event.toolName !== "spawn") return undefined;
		if (spawnMode === "on") return undefined;

		notify(ctx, TOOL_BLOCK_REASON, "warning");
		return { block: true, reason: TOOL_BLOCK_REASON };
	});
}
