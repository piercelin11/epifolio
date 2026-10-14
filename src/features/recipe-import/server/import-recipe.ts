import "server-only";

import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";

import { z } from "zod";

import { newIngredientDraftSchema } from "@/features/ingredient/schema";
import type { CatalogIngredient } from "@/features/ingredient/types";
import { dishDraftSchema } from "@/features/menu/schema";
import { recipeDraftSchema } from "@/features/recipe/schema";

import { type ImportFileType, importConfig } from "../config";
import { importUsage } from "../lib/cost";
import { type ImportedRecipe, toImportedRecipe } from "../lib/to-draft";
import type { ImportUsage } from "../types";
import { llmOutputSchema } from "../llm-output";
import { systemPrompt } from "../prompt";
import { saveRawResponse } from "./raw-responses";

/** What to read: text (pasted, or taken from a web page) or files. */
export type ImportSource =
	| { kind: "text"; text: string }
	| { kind: "files"; files: { type: ImportFileType; data: string }[] };

/** A failed import; the message is safe to show. */
export class ImportError extends Error {
	/** Set when the model was called before the import failed. */
	usage?: ImportUsage;
}

let client: Anthropic | undefined;

/** Made on first use, so a missing key fails one import, not the module. */
function getClient(): Anthropic {
	client ??= new Anthropic({
		timeout: importConfig.timeoutMs,
		maxRetries: 1,
	});
	return client;
}

function fileBlock(file: {
	type: ImportFileType;
	data: string;
}): Anthropic.ContentBlockParam {
	return file.type === "application/pdf"
		? {
				type: "document",
				source: { type: "base64", media_type: file.type, data: file.data },
			}
		: {
				type: "image",
				source: { type: "base64", media_type: file.type, data: file.data },
			};
}

/** The message the API sent with an error, e.g. a low credit balance. */
function apiMessage(error: InstanceType<typeof Anthropic.APIError>) {
	const body = error.error as { error?: { message?: unknown } } | undefined;
	const message = body?.error?.message;
	return typeof message === "string" ? message : undefined;
}

/** Turns an SDK error into one to show; rethrows a cancelled request. */
function importError(error: unknown): unknown {
	if (error instanceof Anthropic.APIUserAbortError) return error;
	if (error instanceof Anthropic.APIConnectionTimeoutError) {
		return new ImportError("Reading the recipe took too long. Try again.");
	}
	if (error instanceof Anthropic.APIConnectionError) {
		return new ImportError("Could not reach the Anthropic API.");
	}
	if (error instanceof Anthropic.AuthenticationError) {
		return new ImportError("The Anthropic API key is missing or invalid.");
	}
	if (error instanceof Anthropic.RateLimitError) {
		return new ImportError("Too many requests. Try again in a minute.");
	}
	if (error instanceof Anthropic.APIError) {
		console.error(error);
		return new ImportError(
			apiMessage(error) ?? `The Anthropic API failed (${error.status}).`
		);
	}
	return error;
}

/**
 * Reads a recipe from the source with the model and returns the drafts for
 * the import's cards. Throws ImportError with a message to show.
 */
export async function importRecipe(
	source: ImportSource,
	catalog: CatalogIngredient[],
	signal?: AbortSignal
): Promise<{ imported: ImportedRecipe; usage: ImportUsage }> {
	if (!process.env.ANTHROPIC_API_KEY) {
		throw new ImportError("Set ANTHROPIC_API_KEY in .env to import recipes.");
	}
	const content: Anthropic.ContentBlockParam[] = [
		...(source.kind === "files" ? source.files.map(fileBlock) : []),
		{
			type: "text",
			text:
				source.kind === "text"
					? `Recipe source:\n\n${source.text}`
					: "The recipe source is in the attached files.",
		},
	];

	let response;
	try {
		response = await getClient().messages.parse(
			{
				model: importConfig.model,
				max_tokens: importConfig.maxTokens,
				thinking: { type: "adaptive" },
				output_config: {
					effort: importConfig.effort,
					format: zodOutputFormat(llmOutputSchema),
				},
				system: systemPrompt,
				messages: [{ role: "user", content }],
			},
			{ signal }
		);
	} catch (error) {
		throw importError(error);
	}

	await saveRawResponse(source.kind, response);
	const usage = importUsage(response.usage);
	console.info(
		`recipe-import: ${usage.inputTokens} in / ${usage.outputTokens} out, about US$${usage.costUsd.toFixed(4)}`
	);
	/** An ImportError that reports the call's usage. */
	const failure = (message: string) =>
		Object.assign(new ImportError(message), { usage });

	if (response.stop_reason === "refusal") {
		throw failure("The model declined to read this source.");
	}
	if (response.stop_reason === "max_tokens") {
		throw failure("The recipe is too long to read in one go.");
	}
	if (!response.parsed_output) {
		throw failure("Could not read the recipe. Try again.");
	}
	let imported: ImportedRecipe;
	try {
		imported = toImportedRecipe(response.parsed_output, catalog, (message) =>
			console.warn(`recipe-import: ${message}`)
		);
	} catch {
		throw failure("No recipe found in this source.");
	}
	// The cards save through these schemas; an answer they reject is a bug.
	const checks = [
		dishDraftSchema.safeParse(imported.dish),
		recipeDraftSchema.safeParse(imported.recipe),
		z.array(newIngredientDraftSchema).safeParse(imported.newIngredients),
	];
	const failed = checks.find((check) => !check.success);
	if (failed) {
		console.error(failed.error);
		throw failure("Could not read the recipe. Try again.");
	}
	return { imported, usage };
}
