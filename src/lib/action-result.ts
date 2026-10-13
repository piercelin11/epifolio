import type { z } from "zod";

// What a Server Action returns: plain data the client can show, never a
// thrown error.

/** A field the input schema rejected, by its path in the input. */
export interface ActionIssue {
	path: (string | number)[];
	message: string;
}

export type ActionResult<T = void> =
	{ ok: true; data: T } | { ok: false; error: string; issues?: ActionIssue[] };

export function invalidInput(error: z.ZodError): ActionResult<never> {
	return {
		ok: false,
		error: "Some fields need attention.",
		issues: error.issues.map((issue) => ({
			path: issue.path.map((key) =>
				typeof key === "number" ? key : String(key)
			),
			message: issue.message,
		})),
	};
}

/**
 * Thrown by data functions for a record that does not exist or is not the
 * current user's; the message is safe to show.
 */
export class RecordNotFoundError extends Error {}

/** Turns an error from a data function into a result to show. */
export function failedResult(error: unknown): ActionResult<never> {
	if (error instanceof RecordNotFoundError) {
		return { ok: false, error: error.message };
	}
	console.error(error);
	return { ok: false, error: "Could not save. Please try again." };
}
