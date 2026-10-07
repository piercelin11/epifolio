import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
	return (
		<main className="flex flex-1 flex-col">
			<header className="flex items-center justify-between border-b px-6 py-4">
				<h1 className="font-heading text-lg font-semibold">Epifolio</h1>
				<ThemeToggle />
			</header>
			<section className="flex flex-1 items-center justify-center p-6">
				<p className="text-muted-foreground">Menu coming soon.</p>
			</section>
		</main>
	);
}
