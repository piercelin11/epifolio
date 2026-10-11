import { ThemeToggle } from "@/components/theme-toggle";
import { MenuRecipeStack } from "@/features/menu/components/menu-recipe-stack";
import { getMockMenu } from "@/features/menu/lib/mock-menu";
import { getMockRecipes } from "@/features/recipe/lib/mock-recipes";

export default function Home() {
	const menu = getMockMenu();

	return (
		<main className="bg-backdrop text-backdrop-foreground relative flex min-h-dvh justify-center overflow-clip pt-(--paper-top) pb-24">
			<header className="absolute inset-x-0 top-0 flex items-center justify-between px-10 pt-8">
				<h1 className="font-heading text-6xl font-bold lowercase">Epifolio</h1>
				<ThemeToggle />
			</header>
			<MenuRecipeStack sections={menu.sections} recipes={getMockRecipes()} />
		</main>
	);
}
