import type { LocalizedText } from "@/lib/i18n/localized";

import { newKey } from "./keys";

// A recipe card list (ingredients or steps) as one flat run of rows: a
// group heading, then its entries, then the next heading. Turning an entry
// into a heading or back only changes that row's kind; the rows after it
// fall into whichever group now comes before them.

export interface OutlineGroup {
	kind: "group";
	key: string;
	id?: string;
	label: LocalizedText;
}

export type OutlineEntry<E> = E & { kind: "entry"; key: string; id?: string };

export type OutlineRow<E> = OutlineGroup | OutlineEntry<E>;

export interface NestedGroup<E> {
	id?: string;
	label: LocalizedText;
	entries: (E & { id?: string })[];
}

export function flattenOutline<E>(groups: NestedGroup<E>[]): OutlineRow<E>[] {
	return groups.flatMap((group): OutlineRow<E>[] => [
		{
			kind: "group",
			key: group.id ?? newKey(),
			id: group.id,
			label: group.label,
		},
		...group.entries.map((entry) => ({
			...entry,
			kind: "entry" as const,
			key: entry.id ?? newKey(),
		})),
	]);
}

/** Groups the rows again; entries before the first heading get one without a label. */
export function nestOutline<E>(rows: OutlineRow<E>[]): NestedGroup<E>[] {
	const groups: NestedGroup<E>[] = [];
	for (const row of rows) {
		if (row.kind === "group") {
			groups.push({ id: row.id, label: row.label, entries: [] });
			continue;
		}
		if (groups.length === 0) groups.push({ label: {}, entries: [] });
		// Drop the row's own fields; the rest is the entry.
		const entry: Record<string, unknown> = { ...row };
		delete entry.kind;
		delete entry.key;
		groups.at(-1)!.entries.push(entry as E & { id?: string });
	}
	return groups;
}

/** The heading row and the entries under it, by the heading's key. */
export function groupBlock<E>(rows: OutlineRow<E>[], key: string) {
	const start = rows.findIndex((row) => row.key === key);
	let end = start + 1;
	while (end < rows.length && rows[end].kind === "entry") end++;
	return { start, end };
}
