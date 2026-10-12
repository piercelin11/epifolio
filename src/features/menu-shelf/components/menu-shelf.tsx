"use client";

import type { CSSProperties, ReactNode } from "react";

import { MenuRecipeStack } from "@/features/menu/components/menu-recipe-stack";
import type { MenuBook } from "@/features/menu/types";
import { MenuThemeScope } from "@/features/menu-theme/components/menu-theme-scope";
import type { Recipe } from "@/features/recipe/types";

import { useMenuShelf } from "../hooks/use-menu-shelf";
import { isVisibleSlot, relativeSlot } from "../shelf-layout";

interface MenuShelfProps {
	books: MenuBook[];
	recipes: Recipe[];
	chefName: string;
	/** Site header, in the band above the books; the open book scrolls over it. */
	header: ReactNode;
}

/**
 * All menu books side by side. The current book is open in the centre;
 * its neighbours show at the screen edges and open when clicked.
 */
export function MenuShelf({
	books,
	recipes,
	chefName,
	header,
}: MenuShelfProps) {
	const { current, goTo, bookRefs } = useMenuShelf(books.length);

	return (
		<div className="relative min-h-0 flex-1 overflow-hidden">
			<div className="absolute inset-x-0 top-0">{header}</div>
			{books.map((book, index) => {
				const slot = relativeSlot(index, current, books.length);
				return (
					<MenuThemeScope
						key={book.id}
						ref={(el) => {
							bookRefs.current[index] = el;
						}}
						themeId={book.themeId}
						// Off-screen books stay rendered so they can slide in.
						inert={!isVisibleSlot(slot)}
						className="absolute inset-y-0 left-[calc(50%-var(--shelf-book-width)/2+var(--shelf-slot)*var(--shelf-pitch))] flex w-(--shelf-book-width) origin-top flex-col"
						style={{ "--shelf-slot": slot } as CSSProperties}
					>
						{/* Remounted on open and close, so a book always opens at the top of its menu */}
						<MenuRecipeStack
							key={slot === 0 ? "open" : "closed"}
							group={book.group}
							recipes={recipes}
							chefName={chefName}
							inactive={
								slot === 0
									? undefined
									: {
											label: `Open ${book.group.label}`,
											onActivate: () => goTo(index),
										}
							}
						/>
					</MenuThemeScope>
				);
			})}
		</div>
	);
}
