import type { Locale } from "../localized";
import { en, type Messages } from "./en";
import { zh } from "./zh";

export type { Messages } from "./en";

/** The interface text of every locale (ADR-0029). */
export const messages: Record<Locale, Messages> = { en, zh };

type Errors = Messages["errors"];

/** The name of a message in the dictionary's `errors` section. */
export type ErrorKey = keyof Errors;

/**
 * A message to show, sent by key so the screen can word it in the current
 * language; `values` fill in a message that takes them.
 */
export type ErrorMessage = {
	[K in ErrorKey]: Errors[K] extends (values: infer V) => string
		? { key: K; values: V }
		: { key: K; values?: undefined };
}[ErrorKey];

/** Message keys that take no values, e.g. the message of a zod schema. */
export type PlainErrorKey = {
	[K in ErrorKey]: Errors[K] extends string ? K : never;
}[ErrorKey];

export function isPlainErrorKey(value: string): value is PlainErrorKey {
	return typeof (en.errors as Record<string, unknown>)[value] === "string";
}

/** The message for a key that takes no values. */
export function plainMessage(key: PlainErrorKey): ErrorMessage {
	// Every plain key's message has this shape; the union cannot see it.
	return { key } as ErrorMessage;
}

/** The text of a message in the given dictionary. */
export function errorText(dictionary: Messages, message: ErrorMessage): string {
	const entry: string | ((values: never) => string) =
		dictionary.errors[message.key];
	return typeof entry === "string" ? entry : entry(message.values as never);
}
