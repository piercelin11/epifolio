import Anthropic from "@anthropic-ai/sdk";

import { getIngredientCatalog } from "@/features/ingredient/data/get-ingredient-catalog";
import {
	importConfig,
	isImportFileType,
} from "@/features/recipe-import/config";
import {
	ImportError,
	type ImportSource,
	importRecipe,
} from "@/features/recipe-import/server/import-recipe";
import type { ImportResponse } from "@/features/recipe-import/types";

// Reads a recipe from pasted text, files or a web page with the model
// (ADR-0022). A route handler rather than a Server Action: it takes large
// files, and a cancelled request aborts the model call.

const fail = (error: string, status: number) =>
	Response.json({ ok: false, error } satisfies ImportResponse, { status });

/** The source in the form data, or a message saying what is wrong with it. */
async function readSource(form: FormData): Promise<ImportSource | string> {
	switch (form.get("source")) {
		case "text": {
			const text = String(form.get("text") ?? "").trim();
			if (!text) return "Paste a recipe first.";
			if (text.length > importConfig.maxTextLength) {
				return "The text is too long.";
			}
			return { kind: "text", text };
		}
		case "files": {
			const files = form.getAll("files").filter((f) => f instanceof File);
			if (files.length === 0) return "Choose a file first.";
			if (files.length > importConfig.files.maxCount) {
				return `Choose up to ${importConfig.files.maxCount} files.`;
			}
			const read: Extract<ImportSource, { kind: "files" }>["files"] = [];
			for (const file of files) {
				if (!isImportFileType(file.type)) {
					return `${file.name}: use JPEG, PNG, WebP or PDF.`;
				}
				if (file.size > importConfig.files.maxBytes) {
					return `${file.name} is too large.`;
				}
				const data = Buffer.from(await file.arrayBuffer()).toString("base64");
				read.push({ type: file.type, data });
			}
			return { kind: "files", files: read };
		}
		default:
			return "Choose what to import from.";
	}
}

export async function POST(request: Request): Promise<Response> {
	let form: FormData;
	try {
		form = await request.formData();
	} catch {
		return fail("Could not read the upload.", 400);
	}
	const source = await readSource(form);
	if (typeof source === "string") return fail(source, 400);

	const catalog = await getIngredientCatalog();
	try {
		const imported = await importRecipe(source, catalog, request.signal);
		return Response.json({
			ok: true,
			data: { imported, catalog },
		} satisfies ImportResponse);
	} catch (error) {
		if (error instanceof Anthropic.APIUserAbortError) {
			// The card stopped waiting; nobody reads this answer.
			return new Response(null, { status: 499 });
		}
		if (error instanceof ImportError) return fail(error.message, 422);
		console.error(error);
		return fail("Could not read the recipe. Try again.", 500);
	}
}
