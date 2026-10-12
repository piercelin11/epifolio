"use client";

import { type CSSProperties, type ReactNode, useState } from "react";

import { MenuRecipeStack } from "@/features/menu/components/menu-recipe-stack";
import type { MenuBook } from "@/features/menu/types";
import { MenuThemeScope } from "@/features/menu-theme/components/menu-theme-scope";
import type { StackPosition } from "@/features/paper-stack/types";
import type { Recipe } from "@/features/recipe/types";
import { cn } from "@/lib/utils";

import { useMenuShelf } from "../hooks/use-menu-shelf";
import { bookAt, isVisibleSlot, overviewColumn } from "../shelf-layout";

interface MenuShelfProps {
	books: MenuBook[];
	recipes: Recipe[];
	chefName: string;
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
export function MenuShelf({ books, recipes, chefName, title }: MenuShelfProps) {
	const shelf = useMenuShelf(books.length);
	const { phase, center, focus, geometry, positions, rootRef, bookRefs } =
		shelf;
	const reading = phase === "reading";
	// Kept per book, so every copy of a book in the loop shows the same state.
	const [states, setStates] = useState<Record<string, BookState>>({});
	const update = (id: string, change: Partial<BookState>) =>
		setStates((all) => {
			const previous: BookState = all[id] ?? { front: "base" };
			return { ...all, [id]: { ...previous, ...change } };
		});

	return (
		<div ref={rootRef} className="relative min-h-0 flex-1 overflow-hidden">
			{/* The open book scrolls over the header band */}
			<header className="absolute inset-x-0 top-0 flex h-(--header-height) items-start justify-between px-(--page-inset) pt-8">
				{title}
				<button
					type="button"
					aria-pressed={phase === "overview"}
					className="font-heading text-masthead-nav cursor-pointer font-bold lowercase"
					onClick={() =>
						reading ? shelf.openOverview() : shelf.closeOverview()
					}
				>
					Menu
				</button>
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
						themeId={book.themeId}
						// Off-screen books stay rendered so they can slide in. Each book
						// spans the full height and overlaps the header band, so only its
						// open scroll area and sheets take pointer input.
						inert={!onScreen}
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
							chefName={chefName}
							front={state?.front ?? "base"}
							onFrontChange={(front) => update(book.id, { front })}
							recipeId={state?.recipeId}
							onRecipeChange={(recipeId) => update(book.id, { recipeId })}
							blankBackRecipe={!reading}
							inactive={
								open
									? undefined
									: {
											label: `Open ${book.group.label}`,
											onActivate: () =>
												reading ? shelf.goTo(k) : shelf.closeOverview(k),
										}
							}
						/>
					</MenuThemeScope>
				);
			})}
		</div>
	);
}
