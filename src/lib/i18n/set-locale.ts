"use server";

import { cookies } from "next/headers";

import { localeCookie, parseLocale } from "./locale-cookie";

/** A year; the choice should outlast the browser session. */
const maxAge = 60 * 60 * 24 * 365;

/**
 * Remembers the interface language. Setting the cookie makes Next.js
 * render the current page again, now in that language.
 */
export async function setLocale(value: string): Promise<void> {
	(await cookies()).set(localeCookie, parseLocale(value), {
		maxAge,
		path: "/",
		sameSite: "lax",
	});
}
