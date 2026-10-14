import "server-only";

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

// In development, keeps every import's raw model response on disk, so a
// strange result (a missing step, a wrong match) can be traced to the
// model or to the code that cleaned its answer. Never in production.

/** Gitignored folder at the project root. */
const folder = path.join(process.cwd(), ".recipe-import-responses");

export async function saveRawResponse(
	source: string,
	response: unknown
): Promise<void> {
	if (process.env.NODE_ENV === "production") return;
	try {
		await mkdir(folder, { recursive: true });
		const name = `${new Date().toISOString().replace(/[:.]/g, "-")}-${source}.json`;
		await writeFile(path.join(folder, name), JSON.stringify(response, null, 1));
	} catch (error) {
		// A debugging aid must never fail the import.
		console.warn("recipe-import: could not save the raw response", error);
	}
}
