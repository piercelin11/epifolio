"use server";

import { refresh } from "next/cache";
import { z } from "zod";

import { isMenuThemeId } from "@/features/menu-theme/menu-themes";
import type { ActionResult } from "@/lib/action-result";
import { getCurrentUserId } from "@/lib/current-user";
import { prisma } from "@/lib/db";

const inputSchema = z.object({
	bookId: z.string().min(1),
	themeId: z.string().refine(isMenuThemeId),
});

/** Saves the theme a menu book is shown in; the book is a menu group. */
export async function updateBookTheme(input: {
	bookId: string;
	themeId: string;
}): Promise<ActionResult> {
	const parsed = inputSchema.safeParse(input);
	if (!parsed.success) return { ok: false, error: { key: "unknownTheme" } };
	const { bookId, themeId } = parsed.data;

	const userId = await getCurrentUserId();
	try {
		const { count } = await prisma.menuGroup.updateMany({
			where: { id: bookId, menu: { userId } },
			data: { themeId },
		});
		if (count === 0) return { ok: false, error: { key: "menuNotFound" } };
	} catch (error) {
		console.error(error);
		return { ok: false, error: { key: "themeSaveFailed" } };
	}
	refresh();
	return { ok: true, data: undefined };
}
