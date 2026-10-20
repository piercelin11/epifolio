"use client";

import { type RefObject, useLayoutEffect, useState } from "react";

/** Column counts tried in turn before the list is split into pages. */
const columnSteps = [2, 3] as const;

export type ColumnCount = (typeof columnSteps)[number];

interface ColumnLayout {
	columns: ColumnCount;
	pages: number;
}

/**
 * Fits a multi-column list into its fixed height (ADR-0033): two columns,
 * else three, else pages of three. The list reads its column count from
 * `data-columns`; columns that do not fit flow off to the side, so a page
 * is one list width plus a column gap. Measured after every render and
 * whenever the list resizes.
 */
export function useColumnPages(listRef: RefObject<HTMLElement | null>) {
	const [layout, setLayout] = useState<ColumnLayout>({ columns: 2, pages: 1 });
	const [page, setPage] = useState(0);

	useLayoutEffect(() => {
		const list = listRef.current;
		if (!list) return;
		const measure = () => {
			const gap = parseFloat(getComputedStyle(list).columnGap) || 0;
			let next: ColumnLayout = { columns: 3, pages: 1 };
			for (const columns of columnSteps) {
				list.dataset.columns = String(columns);
				if (list.scrollWidth <= list.clientWidth + 1) {
					next = { columns, pages: 1 };
					break;
				}
				next = {
					columns,
					pages: Math.ceil((list.scrollWidth + gap) / (list.clientWidth + gap)),
				};
			}
			// Left as the render will set it, so React and the DOM agree.
			list.dataset.columns = String(next.columns);
			setLayout((previous) =>
				previous.columns === next.columns && previous.pages === next.pages
					? previous
					: next
			);
		};
		measure();
		const observer = new ResizeObserver(measure);
		observer.observe(list);
		return () => observer.disconnect();
	});

	const current = Math.min(page, layout.pages - 1);
	return { ...layout, page: current, setPage };
}
