"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
	loadMenuBookDraft,
	saveMenuBook,
} from "@/features/menu/actions/menu-book-editor";

import type { MenuBook } from "@/features/menu/types";
import type { Recipe } from "@/features/recipe/types";

import { editorMotion } from "../editor-motion";
import type { EditorView } from "../editor-view";
import type { useEditorView } from "../hooks/use-editor-view";
import { type MenuModel, toMenuModel } from "../menu-model";
import { MenuCard } from "./menu-card";
import { RecipeCard } from "./recipe-card";

interface EditorLayerProps {
	editor: ReturnType<typeof useEditorView>;
	books: MenuBook[];
	recipes: Recipe[];
}

/** The book and section a view names, when they still exist. */
function resolve(view: EditorView, books: MenuBook[], recipes: Recipe[]) {
	const book =
		"bookId" in view && view.bookId
			? books.find((b) => b.id === view.bookId)
			: undefined;
	if ("bookId" in view && view.bookId && !book) return null;
	if ("sectionId" in view) {
		const section = book?.group.sections.find((s) => s.id === view.sectionId);
		if (!section) return null;
	}
	const recipe =
		view.card === "recipe"
			? recipes.find((r) => r.id === view.recipeId)
			: undefined;
	if (view.card === "recipe" && !recipe) return null;
	return { view, book, recipe };
}

/**
 * The editor cards over the shelf (ADR-0017): a scrim over the books and
 * the open card, rising from below and sinking away.
 */
export function EditorLayer({ editor, books, recipes }: EditorLayerProps) {
	const reduceMotion = useReducedMotion();
	const open = editor.view && resolve(editor.view, books, recipes);
	const bookId = open?.book?.id;
	// The menu card's draft lives here, so it survives turning the card over
	// and visiting a recipe card.
	const [menu, setMenu] = useState<{
		bookId: string;
		model: MenuModel | null;
	}>();
	const [saving, setSaving] = useState(false);
	const menuModel = menu && menu.bookId === bookId ? menu.model : null;

	useEffect(() => {
		if (!bookId || menu?.bookId === bookId) return;
		let current = true;
		loadMenuBookDraft(bookId).then((result) => {
			if (!current) return;
			if (result.ok) setMenu({ bookId, model: toMenuModel(result.data) });
			else toast.error(result.error);
		});
		return () => {
			current = false;
		};
	}, [bookId, menu?.bookId]);

	/** Leaves the editor and forgets the draft. */
	function close() {
		setMenu(undefined);
		editor.close();
	}

	async function saveMenu() {
		if (!menuModel) return;
		setSaving(true);
		const result = await saveMenuBook(menuModel);
		setSaving(false);
		if (result.ok) close();
		else toast.error(result.issues?.[0]?.message ?? result.error);
	}

	const recipeIdOf = (itemId: string) =>
		open?.book?.group.sections
			.flatMap((section) => section.items)
			.find((item) => item.id === itemId)?.recipeId;

	// A link to a card that no longer exists just shows the shelf.
	useEffect(() => {
		if (editor.view && !open) editor.replace(null);
	}, [editor, open]);

	// Re-bound every render, so it always sees the current card and draft.
	useEffect(() => {
		if (!open) return;
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key !== "Escape" || event.defaultPrevented) return;
			if (editor.view?.card === "menu") close();
			else editor.back();
		};
		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	});

	const { travel, enter, exit, rotate, scrim } = editorMotion;
	const instant = { duration: 0 };

	function card() {
		if (!open) return null;
		const { view, book, recipe } = open;
		if ((view.card === "menu" || view.card === "import") && book) {
			return (
				<MenuCard
					model={menuModel}
					onChange={(model) => setMenu({ bookId: book.id, model })}
					recipeIdOf={recipeIdOf}
					onOpenRecipe={(recipeId) =>
						editor.go({ card: "recipe", recipeId, bookId: book.id })
					}
					onAddDish={(sectionId) =>
						editor.go({ card: "import", bookId: book.id, sectionId })
					}
					onSave={saveMenu}
					saving={saving}
					onCancel={close}
				/>
			);
		}
		return <RecipeCard recipe={recipe} onCancel={editor.back} />;
	}

	// Menu and import are two faces of one card, so they share a key.
	const cardKey = open
		? open.view.card === "menu" || open.view.card === "import"
			? `book:${open.book?.id}`
			: `recipe:${open.recipe?.id ?? "new"}`
		: null;

	return (
		<>
			<AnimatePresence>
				{open && (
					<motion.div
						key="scrim"
						className="bg-editor-scrim fixed inset-0 z-40"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={reduceMotion ? instant : scrim}
					/>
				)}
			</AnimatePresence>
			<div className="pointer-events-none fixed inset-0 z-50 grid place-items-center">
				<AnimatePresence mode="wait">
					{open && (
						<motion.div
							key={cardKey}
							role="dialog"
							aria-modal
							className="pointer-events-auto"
							initial={
								reduceMotion
									? { opacity: 0 }
									: { y: travel, rotate: rotate.enter }
							}
							animate={{
								y: 0,
								rotate: 0,
								opacity: 1,
								transition: reduceMotion ? instant : enter,
							}}
							exit={
								reduceMotion
									? { opacity: 0, transition: instant }
									: { y: travel, rotate: rotate.exit, transition: exit }
							}
						>
							{card()}
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</>
	);
}
