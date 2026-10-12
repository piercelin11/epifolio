import Image from "next/image";

import { formatNutrient, formatPriceAmount } from "../lib/format";
import type { Ingredient, Nutrition } from "../types";

interface IngredientCardProps {
	ingredient: Ingredient;
}

const nutrients: { key: keyof Nutrition; label: string; unit: string }[] = [
	{ key: "calories", label: "Calories", unit: "kcal" },
	{ key: "protein", label: "Protein", unit: "g" },
	{ key: "carbs", label: "Carbs", unit: "g" },
	{ key: "fat", label: "Fat", unit: "g" },
];

/**
 * An ingredient's photo, price and nutrition per 100 g, on textured card
 * stock. Missing fields are left out.
 */
export function IngredientCard({ ingredient }: IngredientCardProps) {
	const { name, image, price, nutrition } = ingredient;

	return (
		<article
			data-ingredient-card
			className="bg-ingredient-card text-ingredient-card-foreground relative isolate flex w-(--ingredient-card-width) flex-col gap-3 p-(--ingredient-card-padding) shadow-2xl"
		>
			<div
				aria-hidden
				className="paper-texture pointer-events-none absolute inset-0"
			/>
			{image && (
				<Image
					src={image}
					alt=""
					width={960}
					height={720}
					sizes="var(--ingredient-card-width)"
					className="relative aspect-4/3 w-full object-cover"
				/>
			)}
			<div className="relative flex items-baseline justify-between gap-4">
				<h3 className="text-title uppercase">{name}</h3>
				{price && (
					<p className="text-title whitespace-nowrap">
						{formatPriceAmount(price)}{" "}
						<span className="text-caption">/ {price.unit}</span>
					</p>
				)}
			</div>
			{nutrition && (
				<dl className="text-caption relative border-t border-current uppercase">
					{nutrients.map(({ key, label, unit }) => (
						<div
							key={key}
							className="flex justify-between border-b border-current/40 py-0.5"
						>
							<dt>{label}</dt>
							<dd>{formatNutrient(nutrition[key], unit)}</dd>
						</div>
					))}
				</dl>
			)}
		</article>
	);
}
