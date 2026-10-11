import { ThemeToggle } from "@/components/theme-toggle";
import { MenuRecipeStack } from "@/features/menu/components/menu-recipe-stack";
import { getMockMenu } from "@/features/menu/lib/mock-menu";
import { getMockRecipes } from "@/features/recipe/lib/mock-recipes";

export default function Home() {
	const menu = getMockMenu();

	return (
		<main className="bg-backdrop text-backdrop-foreground flex h-dvh flex-col overflow-hidden">
			<header className="h-(--header-height) shrink-0 px-10 pt-8">
				<div className="flex items-center justify-between">
					<h1 className="font-heading text-headline font-bold lowercase">
						Epifolio
					</h1>
					<ThemeToggle />
				</div>
			</header>
			{/* One group per sheet; switching between groups is #21 */}
			<MenuRecipeStack group={menu.groups[0]} recipes={getMockRecipes()} />
		</main>
	);
}
