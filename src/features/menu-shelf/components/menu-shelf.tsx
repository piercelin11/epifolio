"use client";

import {
	type CSSProperties,
	type ReactNode,
	startTransition,
	useOptimistic,
	useState,
} from "react";
import { toast } from "sonner";

import { LocaleSwitch } from "@/components/locale-switch";
import { IngredientCardLayer } from "@/features/ingredient/components/ingredient-card-layer";
import { useIngredientCard } from "@/features/ingredient/hooks/use-ingredient-card";
import type { Ingredient } from "@/features/ingredient/types";
import { deleteMenuBook } from "@/features/menu/actions/delete-menu-book";
import { updateBookTheme } from "@/features/menu/actions/update-book-theme";
import { DeleteBookButton } from "@/features/menu/components/delete-book-button";
import { MenuRecipeStack } from "@/features/menu/components/menu-recipe-stack";
import type { MenuBook } from "@/features/menu/types";
import { EditButton } from "@/features/editor/components/edit-button";
import { EditorLayer } from "@/features/editor/components/editor-layer";
import { useEditorView } from "@/features/editor/hooks/use-editor-view";
import { MenuThemePicker } from "@/features/menu-theme/components/menu-theme-picker";
import { MenuThemeScope } from "@/features/menu-theme/components/menu-theme-scope";
import type { MenuThemeId } from "@/features/menu-theme/menu-themes";
import type { StackPosition } from "@/features/paper-stack/types";
import type { Recipe, RecipeProgress } from "@/features/recipe/types";
import { useMessages } from "@/lib/i18n/locale-provider";
import { cn } from "@/lib/utils";

import { useMenuShelf } from "../hooks/use-menu-shelf";
import { bookAt, isVisibleSlot, overviewColumn } from "../shelf-layout";

interface MenuShelfProps {
	books: MenuBook[];
	recipes: Recipe[];
	ingredients: Ingredient[];
	/** Site title, at the left of the header band. */
	title: ReactNode;
}

/** What each book remembers while it is closed. */
interface BookState {
	front: StackPosition;
	recipeId?: string;
}

/**
 * All menu books side by side. In reading mode the current book is open in
 * the centre and its neighbours show at the screen edges; the menu button
 * shrinks every book into one row, where picking a book opens it.
 */
export function MenuShelf({
	books,
	recipes,
	ingredients,
	title,
}: MenuShelfProps) {
	const t = useMessages();
	const shelf = useMenuShelf(books.length);
	const card = useIngredientCard();
	const editor = useEditorView();
	// The shelf sits still under an open editor card.
	const editing = editor.view !== null;
	const { phase, center, focus, geometry, positions, rootRef, bookRefs } =
		shelf;
	const reading = phase === "reading";
	// Kept per book, so every copy of a book in the loop shows the same state.
	const [states, setStates] = useState<Record<string, BookState>>({});
	// Kept per recipe, so a recipe reached from any book shows the same state.
	const [progress, setProgress] = useState<Record<string, RecipeProgress>>({});
	// A picked theme shows at once; it reverts if saving fails.
	const [themes, showTheme] = useOptimistic(
		Object.fromEntries(books.map((book) => [book.id, book.themeId])),
		(all, change: { bookId: string; themeId: MenuThemeId }) => ({
			...all,
			[change.bookId]: change.themeId,
		})
	);
	const changeTheme = (bookId: string, themeId: MenuThemeId) =>
		startTransition(async () => {
			showTheme({ bookId, themeId });
			const result = await updateBookTheme({ bookId, themeId });
			if (!result.ok) toast.error(result.error);
		});
	const update = (id: string, change: Partial<BookState>) =>
		setStates((all) => {
			const previous: BookState = all[id] ?? { front: "base" };
			return { ...all, [id]: { ...previous, ...change } };
		});

	return (
		<div ref={rootRef} className="relative min-h-0 flex-1 overflow-hidden">
			{/* The open book scrolls over the header band */}
			<header
				inert={editing}
				className="absolute inset-x-0 top-0 flex h-(--header-height) items-start justify-between px-(--page-inset) pt-8"
			>
				{title}
				<div className="font-heading text-masthead-nav flex items-start gap-6 font-bold">
					<LocaleSwitch />
					<button
						type="button"
						aria-pressed={phase === "overview"}
						className="cursor-pointer lowercase"
						onClick={() => {
							card.close();
							if (reading) shelf.openOverview();
							else shelf.closeOverview();
						}}
					>
						{t.shelf.menu}
					</button>
				</div>
			</header>
			{positions.map((k) => {
				const book = books[bookAt(k, books.length)];
				const state = states[book.id];
				const slot = k - center;
				const open = reading && slot === 0;
				const column = overviewColumn(k, focus);
				const onScreen =
					phase === "overview" && geometry
						? column >= 0 && column < geometry.columns
						: isVisibleSlot(slot);
				return (
					<MenuThemeScope
						key={k}
						ref={(el) => {
							if (!el) return;
							bookRefs.current.set(k, el);
							return () => {
								bookRefs.current.delete(k);
							};
						}}
						themeId={themes[book.id] ?? book.themeId}
						// Off-screen books stay rendered so they can slide in. Each book
						// spans the full height and overlaps the header band, so only its
						// open scroll area and sheets take pointer input.
						inert={!onScreen || editing}
						className={cn(
							"pointer-events-none absolute inset-y-0 left-[calc(50%-var(--shelf-book-width)/2+var(--shelf-slot)*var(--shelf-pitch))] flex w-(--shelf-book-width) flex-col",
							// The overview scales books from their top-left corner.
							reading ? "origin-top" : "origin-top-left"
						)}
						style={{ "--shelf-slot": slot } as CSSProperties}
					>
						<MenuRecipeStack
							group={book.group}
							recipes={recipes}
							menuActions={
								reading && (
									<>
										<EditButton
											label="Edit menu"
											onClick={() => {
												card.close();
												editor.go({ card: "menu", bookId: book.id });
											}}
										/>
										<MenuThemePicker
											themeId={themes[book.id] ?? book.themeId}
											onChange={(themeId) => changeTheme(book.id, themeId)}
										/>
										<DeleteBookButton
											label={book.group.label}
											onDelete={async () => {
												card.close();
												const result = await deleteMenuBook({
													bookId: book.id,
												});
												if (!result.ok) toast.error(result.error);
												return result.ok;
											}}
										/>
									</>
								)
							}
							recipeActions={(recipeId) =>
								reading && (
									<EditButton
										label="Edit recipe"
										onClick={() => {
											card.close();
											editor.go({ card: "recipe", recipeId });
										}}
									/>
								)
							}
							front={state?.front ?? "base"}
							onFrontChange={(front) => update(book.id, { front })}
							recipeId={state?.recipeId}
							onRecipeChange={(recipeId) => update(book.id, { recipeId })}
							onSelectIngredient={(ingredientId, scrollArea) =>
								card.toggle(ingredientId, scrollArea, k)
							}
							onSwapStart={card.close}
							overlay={
								<IngredientCardLayer
									ingredients={ingredients}
									card={card}
									owner={k}
								/>
							}
							progress={progress}
							onProgressChange={(recipeId, next) =>
								setProgress((all) => ({ ...all, [recipeId]: next }))
							}
							blankBackRecipe={!reading}
							inactive={
								open
									? undefined
									: {
											label: `Open ${book.group.label}`,
											onActivate: () => {
												card.close();
												if (reading) shelf.goTo(k);
												else shelf.closeOverview(k);
											},
										}
							}
						/>
					</MenuThemeScope>
				);
			})}
			<EditorLayer editor={editor} books={books} recipes={recipes} />
		</div>
	);
}
