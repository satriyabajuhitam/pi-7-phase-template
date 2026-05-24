import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

export type SpawnMode = "on" | "off";

export const TOOL_NAME = "spawn";
export const ENTRY_TYPE = "spawn-mode-config";
export const MODE_ENABLED_MESSAGE = "spawn mode enabled";
export const MODE_DISABLED_MESSAGE = "spawn mode disabled";
export const BACKEND_UNAVAILABLE_MESSAGE =
	"spawn backend unavailable. Reload the session or verify the local spawn backend is loaded.";
export const FALLBACK_MESSAGE = "spawn backend unavailable; falling back to parent-only workflow.";
export const SKILL_BLOCK_MESSAGE =
	"delegate-me is unavailable while spawn mode is off. Run /spawn-mode and choose on.";
export const TOOL_BLOCK_REASON = "spawn is disabled because spawn mode is off.";

export function isSpawnAvailable(pi: ExtensionAPI) {
	return pi.getAllTools().some((tool) => tool.name === TOOL_NAME);
}

export function getBackendStatus(pi: ExtensionAPI) {
	return isSpawnAvailable(pi) ? "available" : "unavailable";
}

export function getStatusSummary(pi: ExtensionAPI, spawnMode: SpawnMode) {
	return `Current spawn mode: ${spawnMode}\nSpawn backend: ${getBackendStatus(pi)}`;
}
