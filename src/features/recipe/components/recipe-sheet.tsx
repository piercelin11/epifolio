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
				<h2 className="font-heading text-headline font-bold lowercase">
					{recipe.name}
				</h2>
				<p className="text-caption">
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
					<h3 className="font-heading text-title uppercase">{group.label}</h3>
					<ul className="text-body flex flex-col gap-1">
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
				<h3 className="font-heading text-title uppercase">Steps</h3>
				<ol className="text-body flex list-decimal flex-col gap-3 pl-5">
					{recipe.steps.map((step) => (
						<li key={step.title}>
							<strong>{step.title}.</strong> {step.text}
						</li>
					))}
				</ol>
			</section>

			{recipe.notes.length > 0 && (
				<section className="flex flex-col gap-2">
					<h3 className="font-heading text-title uppercase">Notes</h3>
					<ul className="text-body flex list-disc flex-col gap-1 pl-5">
						{recipe.notes.map((note) => (
							<li key={note}>{note}</li>
						))}
					</ul>
				</section>
			)}
		</article>
	);
}
