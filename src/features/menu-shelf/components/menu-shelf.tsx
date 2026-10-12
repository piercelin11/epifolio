"use client";

import type { CSSProperties, ReactNode } from "react";

import { MenuRecipeStack } from "@/features/menu/components/menu-recipe-stack";
import type { MenuBook } from "@/features/menu/types";
import { MenuThemeScope } from "@/features/menu-theme/components/menu-theme-scope";
import type { Recipe } from "@/features/recipe/types";

import { useMenuShelf } from "../hooks/use-menu-shelf";
import { isVisibleSlot, overviewColumn, relativeSlot } from "../shelf-layout";

interface MenuShelfProps {
	books: MenuBook[];
	recipes: Recipe[];
	chefName: string;
	/** Site title, at the left of the header band. */
	title: ReactNode;
}

/**
 * All menu books side by side. In reading mode the current book is open in
 * the centre and its neighbours show at the screen edges; the menu button
 * shrinks every book into one row, where picking a book opens it.
 */
export function MenuShelf({ books, recipes, chefName, title }: MenuShelfProps) {
	const shelf = useMenuShelf(books.length);
	const { phase, current, focus, rootRef, bookRefs } = shelf;
	const reading = phase === "reading";

	return (
		<div ref={rootRef} className="relative min-h-0 flex-1 overflow-hidden">
			{/* The open book scrolls over the header band */}
			<header className="absolute inset-x-0 top-0 flex h-(--header-height) items-start justify-between px-(--page-inset) pt-8">
				{title}
				<button
					type="button"
					aria-pressed={phase === "overview"}
					className="font-heading text-heading cursor-pointer font-bold lowercase"
					onClick={() =>
						reading ? shelf.openOverview() : shelf.closeOverview()
					}
				>
					Menu
				</button>
			</header>
			{books.map((book, index) => {
				const slot = relativeSlot(index, current, books.length);
				const open = reading && slot === 0;
				const onScreen =
					phase === "overview"
						? overviewColumn(index, focus, books.length) >= 0
						: isVisibleSlot(slot);
				return (
					<MenuThemeScope
						key={book.id}
						ref={(el) => {
							bookRefs.current[index] = el;
						}}
						themeId={book.themeId}
						// Off-screen books stay rendered so they can slide in.
						inert={!onScreen}
						className="absolute inset-y-0 left-[calc(50%-var(--shelf-book-width)/2+var(--shelf-slot)*var(--shelf-pitch))] flex w-(--shelf-book-width) origin-top flex-col"
						style={{ "--shelf-slot": slot } as CSSProperties}
					>
						{/* Remounted on open and close, so a book always opens at the top of its menu */}
						<MenuRecipeStack
							key={open ? "open" : "closed"}
							group={book.group}
							recipes={recipes}
							chefName={chefName}
							preview={!reading}
							inactive={
								open
									? undefined
									: {
											label: `Open ${book.group.label}`,
											onActivate: () =>
												reading
													? shelf.goTo(index)
													: shelf.closeOverview(index),
										}
							}
						/>
					</MenuThemeScope>
				);
			})}
		</div>
	);
}
