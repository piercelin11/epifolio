// Tuning for importing a recipe with an LLM (ADR-0022, ADR-0023). The
// import card and the route handler both read these limits.

export const importConfig = {
	/** Claude model that reads the source; see docs/data-sources.md. */
	model: "claude-haiku-5-5",
	/** Output budget, thinking included. */
	maxTokens: 16000,
	/** How hard the model thinks: low | medium | high | xhigh | max. */
	effort: "medium",
	/**
	 * USD per million tokens for `model`, to report what an import cost.
	 * Prompts longer than `longPromptTokens` cost `longPromptFactor` times
	 * as much (Haiku 5.5 pricing, 2026-10). Update with the model.
	 */
	price: {
		input: 0.1,
		output: 0.5,
		longPromptTokens: 100_000,
		longPromptFactor: 5,
	},
	/** Longest wait for the model before the import fails, in ms. */
	timeoutMs: 120_000,
	/** Longest pasted text, in characters. */
	maxTextLength: 50_000,
	files: {
		/** Files per import, e.g. the pages of one recipe. */
		maxCount: 5,
		/** Largest file, in bytes. */
		maxBytes: 5 * 1024 * 1024,
		/** Accepted types; HEIC and other formats the API cannot read are refused. */
		types: ["image/jpeg", "image/png", "image/webp", "application/pdf"],
	},
	url: {
		/** Longest wait for a web page, in ms. */
		timeoutMs: 10_000,
		/** Largest page downloaded, in bytes. */
		maxBytes: 2 * 1024 * 1024,
		/** Longest text kept from a page, in characters. */
		maxTextLength: 40_000,
	},
} as const;

export type ImportFileType = (typeof importConfig.files.types)[number];

export function isImportFileType(type: string): type is ImportFileType {
	return (importConfig.files.types as readonly string[]).includes(type);
}
