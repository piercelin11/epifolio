"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
	createDish,
	loadMenuBookDraft,
	saveMenuBook,
} from "@/features/menu/actions/menu-book-editor";
import { type DishDraft, dishDraftSchema } from "@/features/menu/schema";
import { saveRecipe } from "@/features/recipe/actions/recipe-editor";
import type { RecipeDraft } from "@/features/recipe/schema";
import type { MenuBook } from "@/features/menu/types";
import {
	emptyImportInput,
	type ImportInput,
} from "@/features/recipe-import/lib/import-input";
import {
	allMatched,
	applyChoices,
	type IngredientChoices,
	ingredientChoices,
} from "@/features/recipe-import/lib/ingredient-rows";
import type { ImportResponseData } from "@/features/recipe-import/types";
import type { Recipe } from "@/features/recipe/types";
import type { ActionResult } from "@/lib/action-result";
import { useErrorText, useLocale } from "@/lib/i18n/locale-provider";
import type { ErrorMessage } from "@/lib/i18n/messages";

import { editorMotion } from "../editor-motion";
import type { EditorView } from "../editor-view";
import type { useEditorView } from "../hooks/use-editor-view";
import { type MenuModel, toMenuModel } from "../menu-model";
import { newRecipeModel, toRecipeModel } from "../recipe-model";
import { ImportGhost, MenuGhost } from "./card-ghosts";
import { FlipCard } from "./flip-card";
import { ImportCard, type Source } from "./import-card";
import { IngredientReviewCard } from "./ingredient-review-card";
import { MenuCard } from "./menu-card";
import { RecipeCard } from "./recipe-card";

interface EditorLayerProps {
	editor: ReturnType<typeof useEditorView>;
	books: MenuBook[];
	recipes: Recipe[];
}

const emptyDish: DishDraft = { name: {}, description: {} };

/** The first field problem, else the error, of a failed action. */
function failureMessage(
	result: ActionResult<unknown> & { ok: false }
): ErrorMessage {
	return result.issues?.[0]?.message ?? result.error;
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
	const locale = useLocale();
	const errorText = useErrorText();
	const open = editor.view && resolve(editor.view, books, recipes);
	const bookId = open?.book?.id;
	// The menu card's draft lives here, so it survives turning the card over
	// and visiting a recipe card.
	const [menu, setMenu] = useState<{
		bookId: string;
		model: MenuModel | null;
	}>();
	const [saving, setSaving] = useState(false);
	// The dish typed on the import card, until its recipe is saved.
	const [dish, setDish] = useState<DishDraft>(emptyDish);
	// What the import card read with the LLM, and the ingredient choices
	// made on the review card; both go with the dish.
	const [source, setSource] = useState<Source>("scratch");
	const [importInput, setImportInput] = useState<ImportInput>(emptyImportInput);
	const [imported, setImported] = useState<ImportResponseData | null>(null);
	const [choices, setChoices] = useState<IngredientChoices | null>(null);
	// Whether the new recipe card was reached through the review card.
	const [viaReview, setViaReview] = useState(false);

	/** Forgets the dish and anything imported for it. */
	function resetDish() {
		setDish(emptyDish);
		setSource("scratch");
		setImportInput(emptyImportInput);
		setImported(null);
		setChoices(null);
	}
	// Set once the dish is saved; it is cleared after its card has gone.
	// Clearing it at once would send the still-open new recipe card back to
	// the import card, and that replaceState cancels the pending back(2).
	const [dishSaved, setDishSaved] = useState(false);
	if (dishSaved && editor.view?.card !== "new-recipe") {
		setDishSaved(false);
		resetDish();
	}
	const menuModel = menu && menu.bookId === bookId ? menu.model : null;

	// The drafts are dropped once the editor has closed, not when closing
	// starts: the view only changes after the history entry is popped, and
	// until then the card would show its loading state.
	const [wasOpen, setWasOpen] = useState(Boolean(open));
	if (wasOpen !== Boolean(open)) {
		setWasOpen(Boolean(open));
		if (!open) {
			setMenu(undefined);
			resetDish();
		}
	}

	useEffect(() => {
		if (!bookId || menu?.bookId === bookId) return;
		let current = true;
		loadMenuBookDraft(bookId).then((result) => {
			if (!current) return;
			if (result.ok) setMenu({ bookId, model: toMenuModel(result.data) });
			else toast.error(errorText(result.error));
		});
		return () => {
			current = false;
		};
	}, [bookId, menu?.bookId, errorText]);

	/** Leaves the editor; the drafts go once it has closed. */
	function close() {
		editor.close();
	}

	async function saveMenu() {
		if (!menuModel) return;
		setSaving(true);
		const result = await saveMenuBook(menuModel);
		setSaving(false);
		if (result.ok) close();
		else toast.error(errorText(failureMessage(result)));
	}

	/** Saves an existing recipe and returns to where it was opened from. */
	async function saveExistingRecipe(draft: RecipeDraft, fromBook: boolean) {
		const result = await saveRecipe(draft);
		if (!result.ok) {
			toast.error(errorText(failureMessage(result)));
			return false;
		}
		if (fromBook) editor.back();
		else close();
		return true;
	}

	/** Creates the dish typed on the import card with its recipe. */
	async function createNewDish(
		draft: RecipeDraft,
		book: MenuBook,
		sectionId: string
	) {
		const catalog =
			imported && choices
				? applyChoices(draft, choices, imported.catalog).catalog
				: undefined;
		const result = await createDish({
			sectionId,
			dish,
			recipe: draft,
			catalog,
		});
		if (!result.ok) {
			toast.error(errorText(failureMessage(result)));
			return false;
		}
		// The new dish joins the menu card's draft, which may hold other edits.
		const { itemId } = result.data;
		if (menuModel) {
			setMenu({
				bookId: book.id,
				model: {
					...menuModel,
					sections: menuModel.sections.map((section) =>
						section.id === sectionId
							? {
									...section,
									items: [
										...section.items,
										{
											key: itemId,
											id: itemId,
											name: dish.name,
											description: dish.description,
										},
									],
								}
							: section
					),
				},
			});
		}
		setDishSaved(true);
		// Past the import (and review) card, back to the menu card.
		editor.back(viaReview ? 3 : 2);
		return true;
	}

	const recipeIdOf = (itemId: string) =>
		open?.book?.group.sections
			.flatMap((section) => section.items)
			.find((item) => item.id === itemId)?.recipeId;

	// A link to a card that no longer exists just shows the shelf.
	useEffect(() => {
		if (editor.view && !open) editor.replace(null);
	}, [editor, open]);

	// After a reload the typed dish and the import are gone, so their cards
	// go back to the import card.
	const dishReady = dishDraftSchema.safeParse(dish).success;
	const reviewReady = Boolean(imported && choices);
	useEffect(() => {
		const view = editor.view;
		if (
			(view?.card === "new-recipe" && !dishReady) ||
			(view?.card === "ingredient-review" && !reviewReady)
		) {
			editor.replace({
				card: "import",
				bookId: view.bookId,
				sectionId: view.sectionId,
			});
		}
	}, [editor, dishReady, reviewReady]);

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

	/**
	 * From the import card to the next card: the review card when an import
	 * has ingredients to decide on, else the new recipe card.
	 */
	function continueDish(
		bookId: string,
		sectionId: string,
		current: { imported: ImportResponseData; choices: IngredientChoices } | null
	) {
		const review = current !== null && !allMatched(current.choices);
		setViaReview(review);
		editor.go({
			card: review ? "ingredient-review" : "new-recipe",
			bookId,
			sectionId,
		});
	}

	/** The new recipe card's starting point: imported, or blank. */
	function newRecipeStart() {
		if (!imported || !choices) return newRecipeModel(dish.name);
		const { recipe } = applyChoices(
			imported.imported.recipe,
			choices,
			imported.catalog
		);
		return toRecipeModel(recipe);
	}

	function card() {
		if (!open) return null;
		const { view, book, recipe } = open;
		if ((view.card === "menu" || view.card === "import") && book) {
			const sectionId = view.card === "import" ? view.sectionId : undefined;
			return (
				<FlipCard
					flipped={view.card === "import"}
					front={menuCard(book)}
					back={
						<ImportCard
							dish={dish}
							onChange={setDish}
							source={source}
							onSourceChange={setSource}
							input={importInput}
							onInputChange={setImportInput}
							onNext={() => {
								const parsed = dishDraftSchema.safeParse(dish);
								if (!parsed.success) {
									toast.error(errorText({ key: "dishNameRequired" }));
								} else if (sectionId) {
									continueDish(
										book.id,
										sectionId,
										imported && choices ? { imported, choices } : null
									);
								}
							}}
							onImported={(data) => {
								const next = ingredientChoices(data.imported);
								setImported(data);
								setChoices(next);
								setDish(data.imported.dish);
								// The dish name and description can be checked on Scratch.
								setSource("scratch");
								if (sectionId) {
									continueDish(book.id, sectionId, {
										imported: data,
										choices: next,
									});
								}
							}}
							onCancel={() => editor.back()}
							ghost={<MenuGhost model={menuModel} locale={locale} />}
						/>
					}
				/>
			);
		}
		if (view.card === "recipe" && recipe) {
			return (
				<RecipeCard
					key={recipe.id}
					recipeId={recipe.id}
					onSave={(draft) => saveExistingRecipe(draft, Boolean(view.bookId))}
					onCancel={() => editor.back()}
				/>
			);
		}
		if (view.card === "ingredient-review" && imported && choices) {
			return (
				<IngredientReviewCard
					choices={choices}
					catalog={imported.catalog}
					onChange={setChoices}
					onNext={() => {
						setViaReview(true);
						editor.go({
							card: "new-recipe",
							bookId: view.bookId,
							sectionId: view.sectionId,
						});
					}}
					onBack={() => editor.back()}
					onCancel={() => editor.back(2)}
				/>
			);
		}
		if (view.card === "new-recipe" && book && dishReady) {
			return (
				<RecipeCard
					key="new"
					initial={newRecipeStart()}
					onSave={(draft) => createNewDish(draft, book, view.sectionId)}
					onCancel={() => editor.back()}
				/>
			);
		}
		return null;
	}

	function menuCard(book: MenuBook) {
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
				ghost={<ImportGhost dish={dish} locale={locale} />}
			/>
		);
	}

	// Menu and import are two faces of one card, so they share a key.
	const cardKey = open
		? open.view.card === "menu" || open.view.card === "import"
			? `book:${open.book?.id}`
			: open.view.card === "ingredient-review"
				? "ingredient-review"
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
