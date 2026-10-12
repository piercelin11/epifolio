import { connection } from "next/server";
import { Suspense } from "react";

import { getIngredients } from "@/features/ingredient/data/get-ingredients";
import { getMenuBooks } from "@/features/menu/data/get-menu-books";
import { MenuShelf } from "@/features/menu-shelf/components/menu-shelf";
import { getRecipes } from "@/features/recipe/data/get-recipes";
import { getCurrentUserId } from "@/lib/current-user";
import { siteConfig } from "@/lib/site-config";

const title = (
	<h1 className="font-heading text-masthead font-bold lowercase">Epifolio</h1>
);

/** The shelf with the current user's books; read on every request. */
async function Shelf() {
	await connection();
	const userId = await getCurrentUserId();
	const [books, recipes, ingredients] = await Promise.all([
		getMenuBooks(userId),
		getRecipes(userId),
		getIngredients(),
	]);
	// The shelf needs at least one book, e.g. before the database is seeded.
	if (books.length === 0) {
		return <div className="px-(--page-inset) pt-8">{title}</div>;
	}
	return (
		<MenuShelf
			books={books}
			recipes={recipes}
			ingredients={ingredients}
			chefName={siteConfig.chefName}
			title={title}
		/>
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
