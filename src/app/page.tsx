import { getMockIngredients } from "@/features/ingredient/lib/mock-ingredients";
import { getMockBooks } from "@/features/menu/lib/mock-books";
import { MenuShelf } from "@/features/menu-shelf/components/menu-shelf";
import { getMockRecipes } from "@/features/recipe/lib/mock-recipes";
import { siteConfig } from "@/lib/site-config";

export default function Home() {
	return (
		<main className="bg-backdrop text-backdrop-foreground flex h-dvh flex-col overflow-hidden">
			<MenuShelf
				books={getMockBooks()}
				recipes={getMockRecipes()}
				ingredients={getMockIngredients()}
				chefName={siteConfig.chefName}
				title={
					<h1 className="font-heading text-masthead font-bold lowercase">
						Epifolio
					</h1>
				}
			/>
		</main>
	);
}
