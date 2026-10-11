import type { Recipe } from "../types";

interface RecipeSheetProps {
	recipe?: Recipe;
}

/** A recipe as plain text, laid out for the recipe sheet of the stack. */
export function RecipeSheet({ recipe }: RecipeSheetProps) {
	if (!recipe) return null;

	return (
		<article className="flex max-w-2xl flex-col gap-8 px-11 pt-12 pb-24">
			<header className="flex flex-col gap-2">
				<h2 className="font-heading text-5xl font-bold lowercase">
					{recipe.name}
				</h2>
				<p className="text-sm">
					{[
						recipe.serves && `Serves ${recipe.serves}`,
						recipe.timeMinutes && `${recipe.timeMinutes} min`,
					]
						.filter(Boolean)
						.join(" · ")}
				</p>
			</header>

			{recipe.ingredientGroups.map((group) => (
				<section key={group.label} className="flex flex-col gap-2">
					<h3 className="font-heading text-2xl uppercase">{group.label}</h3>
					<ul className="flex flex-col gap-1 text-sm">
						{group.items.map((item) => (
							<li key={item.name}>
								{item.amount} {item.name}
								{item.note && ` (${item.note})`}
							</li>
						))}
					</ul>
				</section>
			))}

			<section className="flex flex-col gap-2">
				<h3 className="font-heading text-2xl uppercase">Steps</h3>
				<ol className="flex list-decimal flex-col gap-3 pl-5 text-sm">
					{recipe.steps.map((step) => (
						<li key={step.title}>
							<strong>{step.title}.</strong> {step.text}
						</li>
					))}
				</ol>
			</section>

			{recipe.notes.length > 0 && (
				<section className="flex flex-col gap-2">
					<h3 className="font-heading text-2xl uppercase">Notes</h3>
					<ul className="flex list-disc flex-col gap-1 pl-5 text-sm">
						{recipe.notes.map((note) => (
							<li key={note}>{note}</li>
						))}
					</ul>
				</section>
			)}
		</article>
	);
}
