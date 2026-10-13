// Which editor card is open, as kept in the ?edit= search parameter
// (ADR-0017), e.g. "menu:<bookId>" or "recipe:<recipeId>:<bookId>".

export type EditorView =
	| { card: "menu"; bookId: string }
	/** The back of the menu card, adding a dish to a section. */
	| { card: "import"; bookId: string; sectionId: string }
	/** An existing recipe; bookId when it was opened from that menu card. */
	| { card: "recipe"; recipeId: string; bookId?: string }
	/** The recipe of a dish being added from the import card. */
	| { card: "new-recipe"; bookId: string; sectionId: string };

export const editorParam = "edit";

export function parseEditorView(value: string | null): EditorView | null {
	const [card, first, second, ...rest] = value?.split(":") ?? [];
	if (!first || rest.length > 0) return null;
	switch (card) {
		case "menu":
			return second ? null : { card, bookId: first };
		case "import":
		case "new-recipe":
			return second ? { card, bookId: first, sectionId: second } : null;
		case "recipe":
			return second
				? { card, recipeId: first, bookId: second }
				: { card, recipeId: first };
		default:
			return null;
	}
}

export function serializeEditorView(view: EditorView): string {
	switch (view.card) {
		case "menu":
			return `menu:${view.bookId}`;
		case "import":
		case "new-recipe":
			return `${view.card}:${view.bookId}:${view.sectionId}`;
		case "recipe":
			return view.bookId
				? `recipe:${view.recipeId}:${view.bookId}`
				: `recipe:${view.recipeId}`;
	}
}

/** The card a view returns to, or null when it closes the editor. */
export function parentView(view: EditorView): EditorView | null {
	switch (view.card) {
		case "menu":
			return null;
		case "import":
			return { card: "menu", bookId: view.bookId };
		case "new-recipe":
			return { card: "import", bookId: view.bookId, sectionId: view.sectionId };
		case "recipe":
			return view.bookId ? { card: "menu", bookId: view.bookId } : null;
	}
}
