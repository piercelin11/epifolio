import type { z } from "zod";

import {
	type ErrorMessage,
	isPlainErrorKey,
	plainMessage,
} from "@/lib/i18n/messages";

// What a Server Action returns: plain data the client can show, never a
// thrown error. Messages go as keys and are worded on screen (ADR-0029).

/** A field the input schema rejected, by its path in the input. */
export interface ActionIssue {
	path: (string | number)[];
	message: ErrorMessage;
}

export type ActionResult<T = void> =
	| { ok: true; data: T }
	| { ok: false; error: ErrorMessage; issues?: ActionIssue[] };

export function invalidInput(error: z.ZodError): ActionResult<never> {
	return {
		ok: false,
		error: { key: "fieldsNeedAttention" },
		issues: error.issues.map((issue) => ({
			path: issue.path.map((key) =>
				typeof key === "number" ? key : String(key)
			),
			// Our schemas name a message key; zod's own messages are not shown.
			message: plainMessage(
				isPlainErrorKey(issue.message) ? issue.message : "invalidField"
			),
		})),
	};
}

/** An error whose message is safe to show, sent by key. */
class UserFacingError extends Error {
	constructor(readonly userMessage: ErrorMessage) {
		super(userMessage.key);
	}
}

/**
 * Thrown by data functions for a record that does not exist or is not the
 * current user's.
 */
export class RecordNotFoundError extends UserFacingError {}

/**
 * Thrown by data functions when the input clashes with stored data, e.g. a
 * new ingredient named like an existing one.
 */
export class ConflictError extends UserFacingError {}

/** Turns an error from a data function into a result to show. */
export function failedResult(error: unknown): ActionResult<never> {
	if (error instanceof RecordNotFoundError || error instanceof ConflictError) {
		return { ok: false, error: error.userMessage };
	}
	console.error(error);
	return { ok: false, error: { key: "saveFailed" } };
}
