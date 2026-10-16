import { connection } from "next/server";
import { Suspense } from "react";

import { LocaleSwitch } from "@/components/locale-switch";
import { getIngredients } from "@/features/ingredient/data/get-ingredients";
import { getMenuBooks } from "@/features/menu/data/get-menu-books";
import { MenuShelf } from "@/features/menu-shelf/components/menu-shelf";
import { getRecipes } from "@/features/recipe/data/get-recipes";
import { recipeTotals } from "@/features/recipe/lib/recipe-totals";
import { getCurrentUserId } from "@/lib/current-user";
import { getLocale } from "@/lib/i18n/get-locale";
import { LocaleProvider } from "@/lib/i18n/locale-provider";

// A component, not a shared element: React keeps per-element state while it
// renders, so one element object reused across requests can carry it over.
function Title() {
	return (
		<h1 className="font-heading text-masthead font-bold lowercase">Epifolio</h1>
	);
}

/**
 * The shelf with the current user's books, in the language the locale
 * cookie names; read on every request.
 */
async function Shelf() {
	await connection();
	const [userId, locale] = await Promise.all([getCurrentUserId(), getLocale()]);
	const [storedBooks, storedRecipes, ingredients] = await Promise.all([
		getMenuBooks(userId, locale),
		getRecipes(userId, locale),
		getIngredients(locale),
	]);
	// Cost and nutrition are worked out on every load, never stored (ADR-0032).
	const byId = new Map(
		ingredients.map((ingredient) => [ingredient.id, ingredient])
	);
	const recipes = storedRecipes.map((recipe) => ({
		...recipe,
		totals: recipeTotals(recipe, byId),
	}));
	const costs = new Map(
		recipes.map((recipe) => [recipe.id, recipe.totals.cost])
	);
	const books = storedBooks.map((book) => ({
		...book,
		group: {
			...book.group,
			sections: book.group.sections.map((section) => ({
				...section,
				items: section.items.map((item) => ({
					...item,
					price: costs.get(item.recipeId),
				})),
			})),
		},
	}));
	return (
		<LocaleProvider locale={locale}>
			{books.length > 0 ? (
				<MenuShelf
					books={books}
					recipes={recipes}
					ingredients={ingredients}
					title={<Title />}
				/>
			) : (
				// The shelf needs at least one book, e.g. before the database is seeded.
				<div className="flex items-start justify-between px-(--page-inset) pt-8">
					<Title />
					<LocaleSwitch className="font-heading text-masthead-nav font-bold" />
				</div>
			)}
		</LocaleProvider>
	);
}

export default function Home() {
	return (
		<main className="bg-backdrop text-backdrop-foreground flex h-dvh flex-col overflow-hidden">
			<Suspense>
				<Shelf />
			</Suspense>
		</main>
	);
}
