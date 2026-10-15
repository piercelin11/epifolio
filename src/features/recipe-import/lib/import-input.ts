import { type ErrorMessage, plainMessage } from "@/lib/i18n/messages";

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

/** A file as the checks need it; browser and server File both fit. */
interface FileSize {
	type: string;
	size: number;
}

const megabytes = (bytes: number) => bytes / 1024 / 1024;

/** Why a file cannot be imported, or undefined when it can. */
export function fileProblem(file: FileSize): ErrorMessage | undefined {
	if (!isImportFileType(file.type)) return plainMessage("fileType");
	const { maxImageBytes, maxPdfBytes } = importConfig.files;
	const max = file.type === "application/pdf" ? maxPdfBytes : maxImageBytes;
	if (file.size > max) {
		return { key: "fileTooLarge", values: { mb: megabytes(max) } };
	}
	return undefined;
}

/** Why the files together cannot be imported, or undefined when they can. */
export function filesProblem(files: FileSize[]): ErrorMessage | undefined {
	const { maxCount, maxTotalBytes } = importConfig.files;
	if (files.length > maxCount) {
		return { key: "tooManyFiles", values: { count: maxCount } };
	}
	const total = files.reduce((sum, file) => sum + file.size, 0);
	if (total > maxTotalBytes) {
		return { key: "filesTooLarge", values: { mb: megabytes(maxTotalBytes) } };
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
				!filesProblem(input.files) &&
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
		return { ok: false, error: plainMessage("importFailed") };
	}
}
