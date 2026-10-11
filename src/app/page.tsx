import { ThemeToggle } from "@/components/theme-toggle";
import { MenuSheet } from "@/features/menu/components/menu-sheet";
import { getMockMenu } from "@/features/menu/lib/mock-menu";
import { PaperSheet } from "@/features/paper-stack/components/paper-sheet";
import { PaperStack } from "@/features/paper-stack/components/paper-stack";
import { RecipeSheet } from "@/features/recipe/components/recipe-sheet";
import { getMockRecipes } from "@/features/recipe/lib/mock-recipes";

export default function Home() {
	const menu = getMockMenu();
	const recipes = getMockRecipes();

	return (
		<main className="bg-backdrop text-backdrop-foreground relative flex min-h-dvh justify-center pt-(--paper-top) pb-24">
			<header className="absolute inset-x-0 top-0 flex items-center justify-between px-10 pt-8">
				<h1 className="font-heading text-6xl font-bold lowercase">Epifolio</h1>
				<ThemeToggle />
			</header>
			<PaperStack
				front="base"
				base={
					<PaperSheet tone="paper">
						<MenuSheet sections={menu.sections} />
					</PaperSheet>
				}
				offset={
					<PaperSheet tone="primary" perforated>
						<RecipeSheet recipe={recipes[0]} />
					</PaperSheet>
				}
			/>
		</main>
	);
}
