import Image from "next/image";

import { EditButton } from "@/features/editor/components/edit-button";
import { unitLabel } from "@/features/recipe/units";
import { useLocale, useMessages } from "@/lib/i18n/locale-provider";
import { type Messages } from "@/lib/i18n/messages";

import { formatNutrient, formatPriceAmount } from "../lib/format";
import type { Ingredient, Nutrition } from "../types";
import { CardStock } from "./card-stock";

interface IngredientCardProps {
	ingredient: Ingredient;
	/** Turns the card over to edit it. */
	onEdit?: () => void;
}

export const nutrients: {
	key: keyof Nutrition & keyof Messages["ingredientCard"];
	unit: string;
}[] = [
	{ key: "calories", unit: "kcal" },
	{ key: "protein", unit: "g" },
	{ key: "carbs", unit: "g" },
	{ key: "fat", unit: "g" },
];

/**
 * The front of the ingredient card: photo, price and nutrition per 100 g.
 * Missing fields are left out; the text sits on the bottom edge either way.
 */
export function IngredientCard({ ingredient, onEdit }: IngredientCardProps) {
	const t = useMessages();
	const locale = useLocale();
	const { name, image, price, nutrition } = ingredient;
	const known = nutrients.filter(({ key }) => nutrition[key] !== null);

	return (
		<CardStock side="front" className="gap-3">
			{onEdit && (
				<div className="absolute top-(--ingredient-card-padding) right-(--ingredient-card-padding) z-10">
					<EditButton label={t.ingredientCard.edit} onClick={onEdit} />
				</div>
			)}
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
			{/* The text sits on the bottom edge, with or without a photo. */}
			<div className="relative mt-auto flex items-baseline justify-between gap-4">
				<h3 className="text-title uppercase">{name}</h3>
				{price && (
					<p className="text-title whitespace-nowrap">
						{formatPriceAmount(price)}{" "}
						<span className="text-caption">
							/ {price.quantity === 1 ? "" : `${price.quantity} `}
							{unitLabel(price.unit, locale, price.quantity)}
						</span>
					</p>
				)}
			</div>
			{known.length > 0 && (
				<dl className="text-caption relative border-t border-current uppercase">
					{known.map(({ key, unit }) => (
						<div
							key={key}
							className="flex justify-between border-b border-current/40 py-0.5"
						>
							<dt>{t.ingredientCard[key]}</dt>
							<dd>{formatNutrient(nutrition[key]!, unit)}</dd>
						</div>
					))}
				</dl>
			)}
		</CardStock>
	);
}
