"use client";

import { formatNutrient } from "@/features/ingredient/lib/format";
import { useMessages } from "@/lib/i18n/locale-provider";
import { cn } from "@/lib/utils";

import type { RecipeTotals } from "../types";

/** kcal per gram of each macronutrient, which sizes its share of the ring. */
const kcalPerGram = { protein: 4, carbs: 4, fat: 9 } as const;

type Macro = keyof typeof kcalPerGram;

const macros: { key: Macro; colour: string; dot: string }[] = [
	{
		key: "protein",
		colour: "stroke-nutrition-protein",
		dot: "bg-nutrition-protein",
	},
	{ key: "carbs", colour: "stroke-nutrition-carbs", dot: "bg-nutrition-carbs" },
	{ key: "fat", colour: "stroke-nutrition-fat", dot: "bg-nutrition-fat" },
];

const radius = 40;
const ringWidth = 16;
const circumference = 2 * Math.PI * radius;
/** Gap between segments, in the card's colour (viewBox units). */
const segmentGap = 1.5;

/**
 * Calories in the middle of a ring split by where they come from. Each
 * segment's length is its share of the macronutrients' calories.
 */
function NutritionRing({
	calories,
	grams,
	label,
}: {
	calories: number;
	grams: Record<Macro, number>;
	label: string;
}) {
	const t = useMessages();
	const kcal = macros.map(({ key }) => grams[key] * kcalPerGram[key]);
	const total = kcal.reduce((sum, value) => sum + value, 0);
	const lengths = kcal.map((value) =>
		total ? (value / total) * circumference : 0
	);
	// Each segment starts where the ones before it end.
	const segments = macros
		.map((macro, i) => ({
			...macro,
			length: lengths[i],
			start: lengths.slice(0, i).reduce((sum, length) => sum + length, 0),
		}))
		.filter((segment) => segment.length > 0);
	const gap = segments.length > 1 ? segmentGap : 0;

	return (
		<div className="relative aspect-square w-36">
			<svg
				viewBox="0 0 100 100"
				role="img"
				aria-label={label}
				className="size-full -rotate-90"
			>
				<circle
					cx="50"
					cy="50"
					r={radius}
					fill="none"
					strokeWidth={ringWidth}
					className="stroke-current opacity-15"
				/>
				{segments.map((segment) => {
					const dash = Math.max(segment.length - gap, 0);
					return (
						<circle
							key={segment.key}
							cx="50"
							cy="50"
							r={radius}
							fill="none"
							strokeWidth={ringWidth}
							strokeDasharray={`${dash} ${circumference - dash}`}
							strokeDashoffset={-segment.start}
							className={segment.colour}
						/>
					);
				})}
			</svg>
			<p
				aria-hidden
				className="absolute inset-0 flex flex-col items-center justify-center"
			>
				<span className="text-subheading font-bold tabular-nums">
					{formatNutrient(calories, "", 0)}
				</span>
				<span className="text-caption uppercase">
					{t.ingredientCard.calories}
				</span>
			</p>
		</div>
	);
}

/** The recipe's nutrition on the card clipped into the folder. */
export function NutritionCard({ totals }: { totals?: RecipeTotals }) {
	const t = useMessages();
	const nutrition = totals?.nutrition;
	if (!totals || !nutrition) {
		return (
			<p className="text-caption p-6 pt-10">{t.recipeSheet.noNutrition}</p>
		);
	}
	const { calories, protein, carbs, fat } = nutrition.value;
	const grams = { protein, carbs, fat };
	const basis = totals.perServing
		? t.recipeSheet.perServing
		: t.recipeSheet.wholeRecipe;
	const names: Record<Macro, string> = {
		protein: t.ingredientCard.protein,
		carbs: t.ingredientCard.carbs,
		fat: t.ingredientCard.fat,
	};

	return (
		// Only the card's top --nutrition-card-rise shows, so everything stays in it.
		<div className="flex h-(--nutrition-card-rise) flex-col gap-3 px-6 pt-8">
			{/* The note on missing values is the asterisk's tooltip; there is no room for it */}
			<p
				className="text-caption text-right uppercase"
				title={
					nutrition.incomplete ? t.recipeSheet.nutritionIncomplete : undefined
				}
			>
				{basis}
				{nutrition.incomplete && (
					<>
						{" *"}
						<span className="sr-only">{t.recipeSheet.nutritionIncomplete}</span>
					</>
				)}
			</p>
			<div className="flex justify-center">
				<NutritionRing
					calories={calories}
					grams={grams}
					label={`${basis}: ${formatNutrient(calories, " kcal", 0)}`}
				/>
			</div>
			<dl className="text-caption flex flex-col">
				{macros.map(({ key, dot }) => (
					<div
						key={key}
						className="flex items-center gap-2 border-b border-current/40 py-1 uppercase"
					>
						<span
							aria-hidden
							className={cn(
								"size-2 shrink-0 rounded-full border border-current/40",
								dot
							)}
						/>
						<dt className="flex-1">{names[key]}</dt>
						<dd className="tabular-nums">
							{formatNutrient(grams[key], " g", 0)}
						</dd>
					</div>
				))}
			</dl>
		</div>
	);
}
