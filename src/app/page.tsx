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
				chefName={siteConfig.chefName}
				header={
					<header className="h-(--header-height) px-10 pt-8">
						<h1 className="font-heading text-headline font-bold lowercase">
							Epifolio
						</h1>
					</header>
				}
			/>
		</main>
	);
}
