import { ThemeToggle } from "@/components/theme-toggle";
import { MenuBook } from "@/features/menu/components/menu-book";
import { getMockMenu } from "@/features/menu/lib/mock-menu";
import { splitIntoSpread } from "@/features/menu/lib/spread";

export default function Home() {
	const menu = getMockMenu();

	return (
		<MenuBook
			spread={splitIntoSpread(menu.sections)}
			leftHeader={
				<h1 className="font-heading text-primary text-xl font-bold">
					Epifolio
				</h1>
			}
			rightHeader={
				<div className="ml-auto">
					<ThemeToggle />
				</div>
			}
		/>
	);
}
