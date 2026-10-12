import type { ReactNode } from "react";

import { formatQuantity, scaleQuantity } from "../lib/quantity";
import type { Recipe, RecipeIngredient } from "../types";

interface RecipeSheetProps {
	recipe?: Recipe;
}

/** A section title between two rules, with optional controls on the right. */
function RecipeSectionHeader({
	title,
	children,
}: {
	title: string;
	children?: ReactNode;
}) {
	return (
		<div className="flex min-h-11 items-center justify-between gap-6 border-y border-current/40 py-2">
			<h3 className="font-heading text-title font-bold uppercase">{title}</h3>
			{children}
		</div>
	);
}

function GroupLabel({ children }: { children: ReactNode }) {
	return <h4 className="text-body font-bold uppercase">{children}</h4>;
}

function IngredientLine({
	item,
	factor,
}: {
	item: RecipeIngredient;
	factor: number;
}) {
	return (
		<li className="flex items-baseline gap-2">
			<span
				aria-hidden
				className="size-[0.8em] shrink-0 translate-y-[0.1em] border border-current"
			/>
			<span>
				{item.quantity !== undefined && (
					<strong className="font-semibold">
						{formatQuantity(
							scaleQuantity(item.quantity, factor),
							item.unit
						)}{" "}
					</strong>
				)}
				{item.name}
				{item.note && ` (${item.note})`}
			</span>
		</li>
	);
}

/** A recipe laid out for the recipe sheet of the stack. */
export function RecipeSheet({ recipe }: RecipeSheetProps) {
	if (!recipe) return null;

	const factor = 1;
	// Steps are numbered on through every group.
	const firstStep = recipe.stepGroups.map((_, i) =>
		recipe.stepGroups
			.slice(0, i)
			.reduce((count, group) => count + group.steps.length, 1)
	);

	return (
		// The right padding clears the punched holes.
		<article className="flex flex-col gap-8 pt-(--paper-padding) pr-[calc(var(--paper-hole-inset)+var(--paper-hole-size)/2+var(--paper-padding))] pb-24 pl-(--paper-padding)">
			<h2 className="font-heading text-headline font-bold uppercase">
				{recipe.name}
			</h2>

			<section className="flex flex-col gap-6">
				<RecipeSectionHeader title="Ingredients">
					{recipe.serves && (
						<p className="text-caption">
							<strong className="text-body font-bold">{recipe.serves}</strong>{" "}
							{recipe.serves === 1 ? "serving" : "servings"}
						</p>
					)}
				</RecipeSectionHeader>
				<div className="columns-2 gap-x-10">
					{recipe.ingredientGroups.map((group, g) => (
						<div
							key={g}
							className="mb-6 flex break-inside-avoid flex-col gap-2 last:mb-0"
						>
							{group.label && <GroupLabel>{group.label}</GroupLabel>}
							<ul className="text-body flex flex-col gap-1 leading-snug">
								{group.items.map((item, i) => (
									<IngredientLine key={i} item={item} factor={factor} />
								))}
							</ul>
						</div>
					))}
				</div>
			</section>

			<section className="flex flex-col gap-6">
				<RecipeSectionHeader title="Instructions" />
				{recipe.stepGroups.map((group, g) => (
					<div key={g} className="flex flex-col gap-3">
						{group.label && <GroupLabel>{group.label}</GroupLabel>}
						<ol className="text-body flex flex-col gap-3">
							{group.steps.map((step, i) => (
								<li key={i} className="grid grid-cols-[1.75em_1fr]">
									<span className="font-heading font-bold">
										{firstStep[g] + i}.
									</span>
									<p>
										<strong className="font-semibold">{step.title}.</strong>{" "}
										{step.text}
									</p>
								</li>
							))}
						</ol>
					</div>
				))}
			</section>
		</article>
	);
}
