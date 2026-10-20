"use client";

import { type RefObject, useLayoutEffect, useState } from "react";

/** The element's border-box height in px, kept up to date as it resizes. */
export function useElementHeight(ref: RefObject<HTMLElement | null>): number {
	const [height, setHeight] = useState(0);
	useLayoutEffect(() => {
		const el = ref.current;
		if (!el) return;
		const measure = () => setHeight(el.offsetHeight);
		measure();
		const observer = new ResizeObserver(measure);
		observer.observe(el);
		return () => observer.disconnect();
	}, [ref]);
	return height;
}
