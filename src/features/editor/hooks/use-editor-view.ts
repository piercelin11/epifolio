"use client";

import { useSearchParams } from "next/navigation";

import {
	type EditorView,
	editorParam,
	parentView,
	parseEditorView,
	serializeEditorView,
} from "../editor-view";

/** Key in history.state counting the entries the editor pushed. */
const depthKey = "epifolioEditorDepth";

function currentDepth(): number {
	const depth = (window.history.state as Record<string, unknown> | null)?.[
		depthKey
	];
	return typeof depth === "number" ? depth : 0;
}

function urlFor(view: EditorView | null): string {
	const params = new URLSearchParams(window.location.search);
	if (view) params.set(editorParam, serializeEditorView(view));
	else params.delete(editorParam);
	const query = params.toString();
	return query ? `?${query}` : window.location.pathname;
}

/**
 * The open editor card, read from the URL, and the moves between cards.
 * Each move pushes a history entry, so the browser's back button steps
 * back through the cards (ADR-0017).
 */
export function useEditorView() {
	const view = parseEditorView(useSearchParams().get(editorParam));

	function go(next: EditorView) {
		window.history.pushState(
			{ [depthKey]: currentDepth() + 1 },
			"",
			urlFor(next)
		);
	}

	/** Swaps the current card without a new history entry. */
	function replace(next: EditorView | null) {
		window.history.replaceState(
			{ [depthKey]: currentDepth() },
			"",
			urlFor(next)
		);
	}

	/**
	 * Returns `steps` cards back. After a reload there may be no entries to
	 * go back to, so the card that many parents up replaces the current one.
	 */
	function back(steps = 1) {
		if (currentDepth() >= steps) {
			window.history.go(-steps);
			return;
		}
		let target = view;
		for (let i = 0; i < steps && target; i++) target = parentView(target);
		replace(target);
	}

	/** Leaves the editor, unwinding every card it pushed. */
	function close() {
		const depth = currentDepth();
		if (depth > 0) window.history.go(-depth);
		else replace(null);
	}

	return { view, go, replace, back, close };
}
