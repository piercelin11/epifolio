import "server-only";

import { cookies } from "next/headers";

import { localeCookie, parseLocale } from "./locale-cookie";
import type { Locale } from "./localized";

/**
 * The interface language of the current request. Reads a cookie, so call
 * it inside a Suspense boundary (ADR-0028).
 */
export async function getLocale(): Promise<Locale> {
	return parseLocale((await cookies()).get(localeCookie)?.value);
}
