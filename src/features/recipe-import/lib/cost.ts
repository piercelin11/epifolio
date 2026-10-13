import type { ImportUsage } from "../types";
import { importConfig } from "../config";

/** Tokens and cost of one model call, from the response's usage. */
export function importUsage(usage: {
	input_tokens: number;
	output_tokens: number;
	cache_creation_input_tokens?: number | null;
	cache_read_input_tokens?: number | null;
}): ImportUsage {
	// The import does not use prompt caching; any cached tokens are priced
	// as plain input, which overstates rather than understates the cost.
	const inputTokens =
		usage.input_tokens +
		(usage.cache_creation_input_tokens ?? 0) +
		(usage.cache_read_input_tokens ?? 0);
	const outputTokens = usage.output_tokens;
	const { input, output, longPromptTokens, longPromptFactor } =
		importConfig.price;
	const factor = inputTokens > longPromptTokens ? longPromptFactor : 1;
	const costUsd =
		((inputTokens * input + outputTokens * output) * factor) / 1_000_000;
	return { inputTokens, outputTokens, costUsd };
}
