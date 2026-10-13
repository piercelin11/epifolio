"use server";

import { refresh } from "next/cache";
import { z } from "zod";

import type { ActionResult } from "@/lib/action-result";
import { getCurrentUserId } from "@/lib/current-user";
import { prisma } from "@/lib/db";

const inputSchema = z.object({ bookId: z.string().min(1) });

/**
 * Deletes a menu book (a menu group) with its sections and items. The
 * recipes they presented stay in the database (ADR-0019).
 */
export async function deleteMenuBook(input: {
	bookId: string;
}): Promise<ActionResult> {
	const parsed = inputSchema.safeParse(input);
	if (!parsed.success) return { ok: false, error: "Menu not found." };
	const { bookId } = parsed.data;

	const userId = await getCurrentUserId();
	try {
		const { count } = await prisma.menuGroup.deleteMany({
			where: { id: bookId, menu: { userId } },
		});
		if (count === 0) return { ok: false, error: "Menu not found." };
	} catch (error) {
		console.error(error);
		return { ok: false, error: "Could not delete the menu." };
	}
	refresh();
	return { ok: true, data: undefined };
}
