"use client";

import { ChevronLeft, ChevronRight, Minus, Plus } from "lucide-react";
import type { CSSProperties, ReactNode, Ref } from "react";

import { useLocale, useMessages } from "@/lib/i18n/locale-provider";
import { cn } from "@/lib/utils";

import { clampServings, formatQuantity, scaleQuantity } from "../lib/quantity";
import type { IngredientGroup, RecipeIngredient } from "../types";
import { unitLabel } from "../units";

/** A group label as the folder shows it, e.g. "[ MAIN ]". */
export function GroupLabel({ children }: { children: ReactNode }) {
	return <h4 className="text-caption uppercase">[&nbsp;{children}&nbsp;]</h4>;
}

const squareButton =
	"bg-primary-foreground text-primary grid size-4 cursor-pointer place-items-center disabled:cursor-default disabled:opacity-40";

export function ServingsControl({
	servings,
	onChange,
}: {
	servings: number;
	onChange: (servings: number) => void;
}) {
	const t = useMessages();
	const step = (by: number) => onChange(clampServings(servings + by));
	return (
		<div className="flex items-center gap-2">
			<button
				type="button"
				aria-label={t.recipeSheet.fewerServings}
				className={squareButton}
				disabled={clampServings(servings - 1) === servings}
				onClick={() => step(-1)}
			>
				<Minus className="size-3" strokeWidth={3} />
			</button>
			<strong className="text-caption min-w-[2ch] text-center font-bold tabular-nums">
				{servings}
			</strong>
			<button
				type="button"
				aria-label={t.recipeSheet.moreServings}
				className={squareButton}
				disabled={clampServings(servings + 1) === servings}
				onClick={() => step(1)}
			>
				<Plus className="size-3" strokeWidth={3} />
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

/** Previous and next page of the ingredient list; hidden with one page. */
export function PageControl({
	page,
	pages,
	onChange,
}: {
	page: number;
	pages: number;
	onChange: (page: number) => void;
}) {
	const t = useMessages();
	if (pages <= 1) return null;
	return (
		<div className="flex items-center gap-2">
			<button
				type="button"
				aria-label={t.recipeSheet.previousPage}
				className={squareButton}
				disabled={page === 0}
				onClick={() => onChange(page - 1)}
			>
				<ChevronLeft className="size-3" strokeWidth={3} />
			</button>
			<span className="text-caption tabular-nums">
				{t.recipeSheet.pageOf({ page: page + 1, pages })}
			</span>
			<button
				type="button"
				aria-label={t.recipeSheet.nextPage}
				className={squareButton}
				disabled={page === pages - 1}
				onClick={() => onChange(page + 1)}
			>
				<ChevronRight className="size-3" strokeWidth={3} />
			</button>
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
							className="inline cursor-pointer text-left hover:underline"
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

/**
 * The ingredient groups in three columns that fill the space given. A
 * group runs on in the same column after the one before it; a label is
 * never left at the foot of a column and a line is never split. Columns
 * that do not fit flow off to the side; `page` slides them into view
 * (see useColumnPages).
 */
export function IngredientColumns({
	listRef,
	page,
	groups,
	factor,
	checked,
	onCheckedChange,
	onSelectIngredient,
}: {
	listRef: Ref<HTMLDivElement>;
	page: number;
	groups: IngredientGroup[];
	factor: number;
	checked: string[];
	onCheckedChange: (lineId: string, checked: boolean) => void;
	onSelectIngredient?: (ingredientId: string) => void;
}) {
	return (
		// Clip, not hidden: focusing a line on another page must not scroll it.
		<div className="min-h-0 flex-1 overflow-clip">
			<div
				ref={listRef}
				style={{ "--page": page } as CSSProperties}
				className={cn(
					"h-full columns-3 gap-x-(--folder-column-gap) transition-transform duration-300 motion-reduce:transition-none",
					"translate-x-[calc(var(--page)*-1*(100%+var(--folder-column-gap)))]"
				)}
			>
				{/* Plain blocks, not flex, so groups break cleanly between columns */}
				{groups.map((group, g) => (
					<div key={g} className="not-first:mt-(--folder-group-gap)">
						{group.label && (
							<div className="mb-1.5 break-after-avoid">
								<GroupLabel>{group.label}</GroupLabel>
							</div>
						)}
						<ul className="text-caption leading-snug *:break-inside-avoid *:not-first:mt-0.5">
							{group.items.map((item) => (
								<IngredientLine
									key={item.id}
									item={item}
									factor={factor}
									checked={checked.includes(item.id)}
									onCheckedChange={(next) => onCheckedChange(item.id, next)}
									onSelectIngredient={onSelectIngredient}
								/>
							))}
						</ul>
					</div>
				))}
			</div>
		</div>
	);
}
