"use client";

import { Combobox as ComboboxPrimitive } from "@base-ui/react";
import { ChevronDown } from "lucide-react";
import { useId, useState } from "react";

import {
	Combobox,
	ComboboxContent,
	ComboboxEmpty,
	ComboboxItem,
	ComboboxList,
} from "@/components/ui/combobox";
import type { CatalogIngredient } from "@/features/ingredient/types";
import {
	createForRow,
	type IngredientChoices,
	type IngredientRow,
	linkRow,
	linkRowToSuggestion,
	renameNew,
	rowProblems,
} from "@/features/recipe-import/lib/ingredient-rows";
import { normalize } from "@/features/recipe-import/lib/match-catalog";
import type { LocalizedText } from "@/lib/i18n/localized";

import { CardButton, EditorCard, EditorCardLayout } from "./editor-card";

interface IngredientReviewCardProps {
	choices: IngredientChoices;
	catalog: CatalogIngredient[];
	onChange: (choices: IngredientChoices) => void;
	onNext: () => void;
	onBack: () => void;
	onCancel: () => void;
}

const fieldClass =
	"border-editor-card-foreground placeholder:text-editor-card-foreground/40 min-w-0 border-b bg-transparent py-1.5 uppercase focus:outline-none";

/** Both names side by side, e.g. "OLIVE OIL | 橄欖油". */
const bilingual = (text: LocalizedText) =>
	[text.en, text.zh].filter(Boolean).join(" | ");

interface Option {
	id: string;
	label: string;
	/** Every name and alias, normalized, for searching. */
	search: string[];
}

/** Catalog ingredients to pick from, the row's suggestions first. */
function options(row: IngredientRow, catalog: CatalogIngredient[]): Option[] {
	const ranked = [
		...row.suggestions.flatMap((id) => catalog.find((i) => i.id === id) ?? []),
		...catalog.filter((i) => !row.suggestions.includes(i.id)),
	];
	return ranked.map((ingredient) => ({
		id: ingredient.id,
		label: bilingual(ingredient.name),
		search: [...Object.values(ingredient.name), ...ingredient.aliases]
			.filter((n): n is string => Boolean(n))
			.map(normalize),
	}));
}

/** A catalog ingredient, found by typing any of its names or aliases. */
function IngredientPicker({
	row,
	catalog,
	ingredientId,
	onPick,
}: {
	row: IngredientRow;
	catalog: CatalogIngredient[];
	ingredientId: string | null;
	onPick: (ingredientId: string | null) => void;
}) {
	const [open, setOpen] = useState(false);
	const items = options(row, catalog);
	const selected = items.find((item) => item.id === ingredientId) ?? null;
	return (
		<Combobox
			items={items}
			value={selected}
			onValueChange={(item: Option | null) => onPick(item?.id ?? null)}
			onOpenChange={setOpen}
			itemToStringLabel={(item: Option) => item.label}
			isItemEqualToValue={(a: Option, b: Option) => a.id === b.id}
			filter={(item: Option, query: string) => {
				const q = normalize(query);
				return !q || item.search.some((name) => name.includes(q));
			}}
		>
			<div className="border-editor-card-foreground flex items-center border-b">
				<ComboboxPrimitive.Input
					aria-label={`Ingredient for ${bilingual(row.wording)}`}
					placeholder="Search ingredients"
					// Typing replaces the picked name instead of adding to it.
					onFocus={(event) => event.currentTarget.select()}
					// Esc closes the list here; it must not also close the card.
					onKeyDown={(event) => {
						if (event.key === "Escape" && open) event.preventDefault();
					}}
					className="placeholder:text-editor-card-foreground/40 min-w-0 flex-1 bg-transparent py-1.5 font-bold uppercase focus:outline-none"
				/>
				<ComboboxPrimitive.Trigger
					aria-label="Show ingredients"
					className="cursor-pointer p-1"
				>
					<ChevronDown className="size-[1.1em]" />
				</ComboboxPrimitive.Trigger>
			</div>
			<ComboboxContent>
				<ComboboxEmpty>No ingredient found.</ComboboxEmpty>
				<ComboboxList>
					{(item: Option) => (
						<ComboboxItem key={item.id} value={item}>
							{item.label}
						</ComboboxItem>
					)}
				</ComboboxList>
			</ComboboxContent>
		</Combobox>
	);
}

/** One recipe line: create a new ingredient for it, or link it to one. */
function ReviewRow({
	row,
	catalog,
	choices,
	problem,
	onChange,
}: {
	row: IngredientRow;
	catalog: CatalogIngredient[];
	choices: IngredientChoices;
	problem?: string;
	onChange: (choices: IngredientChoices) => void;
}) {
	const name = useId();
	const { choice } = row;
	const created =
		choice.kind === "new"
			? choices.newIngredients.find((item) => item.key === choice.key)
			: undefined;
	const radio = (value: "new" | "catalog", label: string) => (
		<label className="flex cursor-pointer items-center gap-2">
			<input
				type="radio"
				name={name}
				checked={choice.kind === value}
				onChange={() =>
					onChange(
						value === "new"
							? createForRow(choices, row.id)
							: linkRowToSuggestion(choices, row.id)
					)
				}
				className="border-editor-card-foreground checked:bg-editor-card-foreground size-[1em] cursor-pointer appearance-none rounded-full border checked:shadow-[inset_0_0_0_2px_var(--editor-review-card)]"
			/>
			{label}
		</label>
	);

	return (
		<li className="flex flex-col gap-3 py-4">
			<p className="text-body font-bold uppercase">{bilingual(row.wording)}</p>
			<div className="text-caption flex gap-8 uppercase">
				{radio("new", "Create new")}
				{radio("catalog", "Link to")}
			</div>
			{choice.kind === "catalog" ? (
				<IngredientPicker
					row={row}
					catalog={catalog}
					ingredientId={choice.ingredientId}
					onPick={(id) => onChange(linkRow(choices, row.id, id))}
				/>
			) : (
				created && (
					<div className="text-body grid grid-cols-2 gap-5">
						{(["en", "zh"] as const).map((locale) => (
							<input
								key={locale}
								aria-label={`${locale === "en" ? "English" : "Chinese"} name`}
								value={created.name[locale] ?? ""}
								onChange={(event) =>
									onChange(
										renameNew(choices, created.key, {
											...created.name,
											[locale]: event.target.value,
										})
									)
								}
								placeholder={locale === "en" ? "EN name" : "ZH name"}
								className={fieldClass}
							/>
						))}
					</div>
				)
			)}
			{problem && <p className="text-caption font-bold">{problem}</p>}
		</li>
	);
}

/**
 * After an import: which catalog ingredient each recipe line uses. Lines
 * the import could not match come first; matched ones fold away at the
 * bottom. Aliases and nutrition are settled without asking (ADR-0025).
 */
export function IngredientReviewCard({
	choices,
	catalog,
	onChange,
	onNext,
	onBack,
	onCancel,
}: IngredientReviewCardProps) {
	const [showMatched, setShowMatched] = useState(false);
	const problems = rowProblems(choices, catalog);
	const toReview = choices.rows.filter((row) => !row.matched);
	const matched = choices.rows.filter((row) => row.matched);

	const row = (r: IngredientRow) => (
		<ReviewRow
			key={r.id}
			row={r}
			catalog={catalog}
			choices={choices}
			problem={problems.get(r.id)}
			onChange={onChange}
		/>
	);

	return (
		<EditorCard variant="review">
			<EditorCardLayout
				variant="review"
				header={
					<div className="flex flex-col gap-1">
						<h2 className="text-subheading font-bold uppercase">Ingredients</h2>
						<p className="text-body uppercase">
							{matched.length} matched · {toReview.length} not matched
						</p>
					</div>
				}
				footer={
					<div className="flex justify-center gap-3">
						<CardButton
							variant="primary"
							onClick={onNext}
							disabled={problems.size > 0}
						>
							Next
						</CardButton>
						<CardButton variant="outline" onClick={onBack}>
							Back
						</CardButton>
						<CardButton variant="outline" onClick={onCancel}>
							Cancel
						</CardButton>
					</div>
				}
			>
				<ul>{toReview.map(row)}</ul>
				{matched.length > 0 && (
					<div className="mt-4">
						<button
							type="button"
							aria-expanded={showMatched}
							onClick={() => setShowMatched(!showMatched)}
							className="text-caption cursor-pointer font-bold uppercase"
						>
							{showMatched ? "Hide" : "Show"} matched ({matched.length})
						</button>
						{showMatched && <ul>{matched.map(row)}</ul>}
					</div>
				)}
			</EditorCardLayout>
		</EditorCard>
	);
}
