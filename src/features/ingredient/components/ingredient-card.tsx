import Image from "next/image";

import { type Messages } from "@/lib/i18n/messages";
import { useMessages } from "@/lib/i18n/locale-provider";

import { formatNutrient, formatPriceAmount } from "../lib/format";
import type { Ingredient, Nutrition } from "../types";

interface IngredientCardProps {
	ingredient: Ingredient;
}

const nutrients: {
	key: keyof Nutrition & keyof Messages["ingredientCard"];
	unit: string;
}[] = [
	{ key: "calories", unit: "kcal" },
	{ key: "protein", unit: "g" },
	{ key: "carbs", unit: "g" },
	{ key: "fat", unit: "g" },
];

/**
 * An ingredient's photo, price and nutrition per 100 g, on textured card
 * stock held by a binder clip. Missing fields are left out; without a photo
 * the top stays blank.
 */
export function IngredientCard({ ingredient }: IngredientCardProps) {
	const t = useMessages();
	const { name, image, price, nutrition } = ingredient;

	return (
		<article
			data-ingredient-card
			className="bg-ingredient-card text-ingredient-card-foreground relative isolate flex w-(--ingredient-card-width) flex-col gap-3 p-(--ingredient-card-padding) shadow-lg"
		>
			<div
				aria-hidden
				className="paper-texture pointer-events-none absolute inset-0"
			/>
			{/*
			 * The clip image is 263 by 240; its jaw starts at 0.56 of its width
			 * from the top, so lifting it by that much puts the jaw on the edge.
			 */}
			<div
				aria-hidden
				className="absolute top-[calc(var(--ingredient-card-clip-width)*-0.56)] left-(--ingredient-card-clip-left) z-10 aspect-240/263 w-(--ingredient-card-clip-width) bg-(image:--ingredient-card-clip) bg-contain bg-no-repeat"
			/>
			{image ? (
				<Image
					src={image}
					alt=""
					width={960}
					height={720}
					sizes="var(--ingredient-card-width)"
					className="relative aspect-4/3 w-full object-cover"
				/>
			) : (
				<div aria-hidden className="h-(--ingredient-card-blank)" />
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
					{nutrients.map(({ key, unit }) => (
						<div
							key={key}
							className="flex justify-between border-b border-current/40 py-0.5"
						>
							<dt>{t.ingredientCard[key]}</dt>
							<dd>{formatNutrient(nutrition[key], unit)}</dd>
						</div>
					))}
				</dl>
			)}
		</article>
	);
}
