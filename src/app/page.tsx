import { connection } from "next/server";
import { Suspense } from "react";

import { LocaleSwitch } from "@/components/locale-switch";
import { getIngredients } from "@/features/ingredient/data/get-ingredients";
import { getMenuBooks } from "@/features/menu/data/get-menu-books";
import { MenuShelf } from "@/features/menu-shelf/components/menu-shelf";
import { getRecipes } from "@/features/recipe/data/get-recipes";
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
	const [books, recipes, ingredients] = await Promise.all([
		getMenuBooks(userId, locale),
		getRecipes(userId, locale),
		getIngredients(locale),
	]);
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
