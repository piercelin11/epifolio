"use client";

import { type RefObject, useLayoutEffect, useState } from "react";

/**
 * Splits a multi-column list into pages at its fixed height (ADR-0033).
 * Columns that do not fit flow off to the side, so a page is one list
 * width plus a column gap. Measured after every render and whenever the
 * list resizes.
 */
export function useColumnPages(listRef: RefObject<HTMLElement | null>) {
	const [pages, setPages] = useState(1);
	const [page, setPage] = useState(0);

	useLayoutEffect(() => {
		const list = listRef.current;
		if (!list) return;
		const measure = () => {
			const gap = parseFloat(getComputedStyle(list).columnGap) || 0;
			setPages(
				Math.max(
					1,
					Math.ceil((list.scrollWidth + gap) / (list.clientWidth + gap))
				)
			);
		};
		measure();
		const observer = new ResizeObserver(measure);
		observer.observe(list);
		return () => observer.disconnect();
	});

	return { pages, page: Math.min(page, pages - 1), setPage };
}
