import { MenuPage } from "@/features/menu/components/menu-page";
import { getMockMenu } from "@/features/menu/lib/mock-menu";
import { PaperSheet } from "@/features/paper-stack/components/paper-sheet";
import { PaperStack } from "@/features/paper-stack/components/paper-stack";

export default function Home() {
	const menu = getMockMenu();

	return (
		<main className="bg-backdrop flex min-h-dvh justify-center pt-(--paper-top) pb-24">
			<PaperStack
				front="base"
				base={
					<PaperSheet tone="paper">
						<MenuPage header={null} sections={menu.sections} />
					</PaperSheet>
				}
				offset={
					<PaperSheet tone="primary" perforated>
						<p className="p-10">Recipe</p>
					</PaperSheet>
				}
			/>
		</main>
	);
}
