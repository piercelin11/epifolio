import { Minus, Plus } from "lucide-react";
import type { ReactNode } from "react";

import { useLocale, useMessages } from "@/lib/i18n/locale-provider";

import { clampServings, formatQuantity, scaleQuantity } from "../lib/quantity";
import type { Recipe, RecipeIngredient, RecipeProgress } from "../types";
import { unitLabel } from "../units";

interface RecipeSheetProps {
	recipe?: Recipe;
	/** Controls in the top-right corner, e.g. an edit button. */
	actions?: ReactNode;
	/** Servings and ready ingredients; owned by the caller. */
	progress?: RecipeProgress;
	onProgressChange?: (progress: RecipeProgress) => void;
	/** Called with the id of an ingredient whose name is picked. */
	onSelectIngredient?: (ingredientId: string) => void;
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
			<h3 className="font-heading text-subheading font-bold uppercase">
				{title}
			</h3>
			{children}
		</div>
	);
}

function GroupLabel({ children }: { children: ReactNode }) {
	return <h4 className="text-body font-bold uppercase">{children}</h4>;
}

function ServingsControl({
	servings,
	onChange,
}: {
	servings: number;
	onChange: (servings: number) => void;
}) {
	const t = useMessages();
	const step = (by: number) => onChange(clampServings(servings + by));
	const button =
		"bg-primary-foreground text-primary grid size-5 cursor-pointer place-items-center disabled:cursor-default disabled:opacity-40";
	return (
		<div className="flex items-center gap-2">
			<button
				type="button"
				aria-label={t.recipeSheet.fewerServings}
				className={button}
				disabled={clampServings(servings - 1) === servings}
				onClick={() => step(-1)}
			>
				<Minus className="size-3.5" strokeWidth={3} />
			</button>
			<strong className="text-body min-w-[2ch] text-center font-bold tabular-nums">
				{servings}
			</strong>
			<button
				type="button"
				aria-label={t.recipeSheet.moreServings}
				className={button}
				disabled={clampServings(servings + 1) === servings}
				onClick={() => step(1)}
			>
				<Plus className="size-3.5" strokeWidth={3} />
			</button>
			{/* Sized for the plural, so the controls stay put at one serving */}
			<span className="text-caption ml-1 inline-grid">
				<span aria-hidden className="invisible col-start-1 row-start-1">
					{t.recipeSheet.servings}
				</span>
				<span className="col-start-1 row-start-1">
					{servings === 1 ? t.recipeSheet.serving : t.recipeSheet.servings}
				</span>
			</span>
		</div>
	);
}

function IngredientLine({
	item,
	factor,
	checked,
	onCheckedChange,
	onSelectIngredient,
}: {
	item: RecipeIngredient;
	factor: number;
	checked: boolean;
	onCheckedChange: (checked: boolean) => void;
	onSelectIngredient?: (ingredientId: string) => void;
}) {
	const locale = useLocale();
	const t = useMessages();
	const { ingredientId } = item;
	return (
		<li>
			{/* A ready ingredient is struck through */}
			<label className="flex cursor-pointer items-baseline gap-2 has-checked:line-through has-checked:opacity-50">
				<input
					type="checkbox"
					checked={checked}
					onChange={(event) => onCheckedChange(event.target.checked)}
					className="size-[0.8em] shrink-0 translate-y-[0.1em] cursor-pointer appearance-none border border-current checked:bg-current focus-visible:outline-2 focus-visible:outline-offset-2"
				/>
				<span>
					<strong className="font-semibold">
						{item.quantity !== undefined
							? formatQuantity(
									scaleQuantity(item.quantity, factor),
									item.unit,
									locale
								)
							: item.unit
								? unitLabel(item.unit, locale)
								: t.recipeSheet.toTaste}{" "}
					</strong>
					{/* A button inside the label opens the card instead of checking the line */}
					{ingredientId && onSelectIngredient ? (
						<button
							type="button"
							data-ingredient-trigger
							onClick={() => onSelectIngredient(ingredientId)}
							// Inline, not inline-block, so a ready line's strike-through reaches it
							className="inline cursor-pointer hover:underline"
						>
							{item.name}
						</button>
					) : (
						item.name
					)}
					{item.note && ` (${item.note})`}
				</span>
			</label>
		</li>
	);
}

/** A recipe laid out for the recipe sheet of the stack. */
export function RecipeSheet({
	recipe,
	actions,
	progress = { checked: [] },
	onProgressChange,
	onSelectIngredient,
}: RecipeSheetProps) {
	const t = useMessages();
	if (!recipe) return null;

	const servings = progress.servings ?? recipe.serves;
	const factor = recipe.serves && servings ? servings / recipe.serves : 1;
	const change = (next: Partial<RecipeProgress>) =>
		onProgressChange?.({ ...progress, ...next });
	const setChecked = (key: string, checked: boolean) =>
		change({
			checked: checked
				? [...progress.checked, key]
				: progress.checked.filter((k) => k !== key),
		});
	// Steps are numbered on through every group.
	const firstStep = recipe.stepGroups.map((_, i) =>
		recipe.stepGroups
			.slice(0, i)
			.reduce((count, group) => count + group.steps.length, 1)
	);

	return (
		// The right padding clears the punched holes.
		<article className="flex flex-col gap-8 pt-(--paper-padding) pr-[calc(var(--paper-hole-inset)+var(--paper-hole-size)/2+var(--paper-padding))] pb-24 pl-(--paper-padding)">
			<div className="flex items-start justify-between gap-4">
				<h2 className="font-heading text-headline font-bold uppercase">
					{recipe.name}
				</h2>
				{actions && <div className="flex shrink-0 gap-1">{actions}</div>}
			</div>

			<section className="flex flex-col gap-6">
				<RecipeSectionHeader title={t.recipeSheet.ingredients}>
					{servings && (
						<ServingsControl
							servings={servings}
							onChange={(next) => change({ servings: next })}
						/>
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
								{group.items.map((item) => (
									<IngredientLine
										key={item.id}
										item={item}
										factor={factor}
										checked={progress.checked.includes(item.id)}
										onCheckedChange={(checked) => setChecked(item.id, checked)}
										onSelectIngredient={onSelectIngredient}
									/>
								))}
							</ul>
						</div>
					))}
				</div>
			</section>

			<section className="flex flex-col gap-6">
				<RecipeSectionHeader title={t.recipeSheet.instructions} />
				{recipe.stepGroups.map((group, g) => (
					<div key={g} className="flex flex-col gap-3">
						{group.label && <GroupLabel>{group.label}</GroupLabel>}
						<ol className="text-body flex flex-col gap-3">
							{group.steps.map((step, i) => (
								<li key={i} className="grid grid-cols-[1.75em_1fr]">
									<span className="font-heading font-bold">
										{firstStep[g] + i}.
									</span>
									{/* Keeps the line breaks typed with Shift+Enter */}
									<p className="whitespace-pre-line">
										{step.title && (
											<>
												<strong className="font-semibold">
													{step.title}.
												</strong>{" "}
											</>
										)}
										{step.text.map((part) => part.text).join("")}
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
