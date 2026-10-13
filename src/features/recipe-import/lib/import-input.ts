import { importConfig, isImportFileType } from "../config";
import type { ImportResponse } from "../types";

// What the import card collects for each source, how it is checked before
// sending, and the request that sends it.

/** What the import card has filled in for each source. */
export interface ImportInput {
	text: string;
	url: string;
	files: File[];
}

export const emptyImportInput: ImportInput = { text: "", url: "", files: [] };

export type ImportSourceChoice = "text" | "photo" | "url";

function isWebAddress(text: string): boolean {
	try {
		const url = new URL(text.trim());
		return url.protocol === "http:" || url.protocol === "https:";
	} catch {
		return false;
	}
}

/** Why a file cannot be imported, or undefined when it can. */
export function fileProblem(file: File): string | undefined {
	if (!isImportFileType(file.type)) return "Use JPEG, PNG, WebP or PDF.";
	if (file.size > importConfig.files.maxBytes) {
		const mb = importConfig.files.maxBytes / 1024 / 1024;
		return `Larger than ${mb} MB.`;
	}
	return undefined;
}

/** Whether the source has something to send. */
export function canImport(source: ImportSourceChoice, input: ImportInput) {
	switch (source) {
		case "text":
			return (
				input.text.trim().length > 0 &&
				input.text.length <= importConfig.maxTextLength
			);
		case "url":
			return isWebAddress(input.url);
		case "photo":
			return (
				input.files.length > 0 &&
				input.files.length <= importConfig.files.maxCount &&
				input.files.every((file) => !fileProblem(file))
			);
	}
}

/** Sends the source to POST /api/recipe-import; `signal` cancels it. */
export async function requestImport(
	source: ImportSourceChoice,
	input: ImportInput,
	signal: AbortSignal
): Promise<ImportResponse> {
	const form = new FormData();
	if (source === "text") {
		form.set("source", "text");
		form.set("text", input.text);
	} else if (source === "url") {
		form.set("source", "url");
		form.set("url", input.url.trim());
	} else {
		form.set("source", "files");
		for (const file of input.files) form.append("files", file);
	}
	const response = await fetch("/api/recipe-import", {
		method: "POST",
		body: form,
		signal,
	});
	try {
		return (await response.json()) as ImportResponse;
	} catch {
		return { ok: false, error: "Could not read the recipe. Try again." };
	}
}
