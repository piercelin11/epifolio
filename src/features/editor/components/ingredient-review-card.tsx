"use client";

import { useState } from "react";

import type { NewIngredientDraft } from "@/features/ingredient/schema";
import type { CatalogIngredient } from "@/features/ingredient/types";
import {
	type IngredientChoices,
	type IngredientRow,
	type RowChoice,
	type RowStatus,
	chosenNewIngredients,
	newIngredientProblems,
	rowStatus,
} from "@/features/recipe-import/lib/ingredient-rows";
import {
	defaultLocale,
	type Locale,
	type LocalizedText,
	localize,
} from "@/lib/i18n/localized";
import { cn } from "@/lib/utils";

import { CardButton, EditorCard, EditorCardLayout } from "./editor-card";
import { LanguageToggle } from "./language-toggle";

interface IngredientReviewCardProps {
	choices: IngredientChoices;
	catalog: CatalogIngredient[];
	onChange: (choices: IngredientChoices) => void;
	onNext: () => void;
	onBack: () => void;
	onCancel: () => void;
}

const statusLabel: Record<RowStatus, string> = {
	matched: "Matched",
	alias: "Alias",
	new: "New",
	none: "Not linked",
};

const fieldClass =
	"border-editor-card-foreground placeholder:text-editor-card-foreground/50 min-w-0 border-b bg-transparent py-0.5 focus:outline-none";

const nutrients = [
	{ key: "calories", label: "kcal" },
	{ key: "protein", label: "Protein g" },
	{ key: "carbs", label: "Carbs g" },
	{ key: "fat", label: "Fat g" },
] as const;

/** A row's choice as a <select> value, and back. */
function choiceValue(choice: RowChoice): string {
	switch (choice.kind) {
		case "catalog":
			return `catalog:${choice.ingredientId}`;
		case "new":
			return `new:${choice.key}`;
		case "none":
			return "none";
	}
}

function StatusTag({ status }: { status: RowStatus }) {
	return (
		<span
			className={cn(
				"text-caption border-editor-card-foreground shrink-0 border px-1.5 font-bold uppercase",
				status === "new" && "bg-editor-card-foreground text-editor-review-card",
				status === "matched" && "opacity-60"
			)}
		>
			{statusLabel[status]}
		</span>
	);
}

/** Name, aliases and estimated nutrition of an ingredient to create. */
function NewIngredientFields({
	item,
	locale,
	problem,
	onChange,
}: {
	item: NewIngredientDraft;
	locale: Locale;
	problem?: string;
	onChange: (item: NewIngredientDraft) => void;
}) {
	return (
		<div className="text-caption mt-2 flex flex-col gap-2">
			<label className="flex items-baseline gap-3">
				<span className="w-20 shrink-0 uppercase">Name</span>
				<input
					value={item.name[locale] ?? ""}
					onChange={(event) =>
						onChange({
							...item,
							name: { ...item.name, [locale]: event.target.value },
						})
					}
					placeholder={localize(item.name) ?? "Ingredient name"}
					className={cn(fieldClass, "flex-1")}
				/>
			</label>
			{problem && <p className="font-bold">{problem}</p>}
			<label className="flex items-baseline gap-3">
				<span className="w-20 shrink-0 uppercase">Aliases</span>
				<input
					defaultValue={item.aliases.join(", ")}
					onBlur={(event) =>
						onChange({
							...item,
							aliases: event.target.value
								.split(/[,，]/)
								.map((alias) => alias.trim())
								.filter(Boolean),
						})
					}
					placeholder="Other names, separated by commas"
					className={cn(fieldClass, "flex-1")}
				/>
			</label>
			<div className="flex items-baseline gap-3">
				<span className="w-20 shrink-0 uppercase">Per 100 g</span>
				<div className="flex flex-1 flex-wrap items-baseline gap-x-4 gap-y-1">
					{nutrients.map(({ key, label }) => (
						<label key={key} className="flex items-baseline gap-1.5">
							<input
								type="number"
								min={0}
								step="any"
								value={item.nutrition[key] ?? ""}
								onChange={(event) =>
									onChange({
										...item,
										nutrition: {
											...item.nutrition,
											[key]:
												event.target.value === ""
													? null
													: Number(event.target.value),
										},
										// Edited by hand: no longer just the model's estimate.
										nutritionEstimated: false,
									})
								}
								className={cn(fieldClass, "w-14 text-right tabular-nums")}
							/>
							<span>{label}</span>
						</label>
					))}
					{item.nutritionEstimated && (
						<span className="font-bold uppercase">Estimated</span>
					)}
				</div>
			</div>
		</div>
	);
}

/** One line of the recipe and the ingredient it will use. */
function ReviewRow({
	row,
	status,
	catalog,
	choices,
	locale,
	problems,
	onChoose,
	onNewChange,
}: {
	row: IngredientRow;
	status: RowStatus;
	catalog: CatalogIngredient[];
	choices: IngredientChoices;
	locale: Locale;
	problems: Map<string, string>;
	onChoose: (value: string) => void;
	onNewChange: (item: NewIngredientDraft) => void;
}) {
	const text = (value: LocalizedText) => localize(value, locale) ?? "";
	const { choice } = row;
	const newItem =
		choice.kind === "new"
			? choices.newIngredients.find((item) => item.key === choice.key)
			: undefined;
	// Each new ingredient's fields show once, on the first row that chose it.
	const firstOfItem =
		newItem &&
		choices.rows.find(
			(r) => r.choice.kind === "new" && r.choice.key === newItem.key
		) === row;
	const otherNew = chosenNewIngredients(choices).filter(
		(item) => item.key !== newItem?.key
	);

	return (
		<li className="border-editor-card-foreground border-b py-2.5">
			<div className="text-body flex items-baseline gap-3">
				<StatusTag status={status} />
				<div className="min-w-0 flex-1">
					<p className="truncate font-medium">{text(row.wording)}</p>
					{row.where && <p className="text-caption opacity-70">{row.where}</p>}
				</div>
				<span aria-hidden>→</span>
				<select
					aria-label={`Ingredient for ${text(row.wording)}`}
					value={choiceValue(choice)}
					onChange={(event) => onChoose(event.target.value)}
					className={cn(fieldClass, "w-48 cursor-pointer")}
				>
					<optgroup label="Catalog">
						{catalog.map((ingredient) => (
							<option key={ingredient.id} value={`catalog:${ingredient.id}`}>
								{text(ingredient.name)}
							</option>
						))}
					</optgroup>
					<optgroup label="New">
						{newItem && (
							<option value={`new:${newItem.key}`}>
								{text(newItem.name) || "New ingredient"}
							</option>
						)}
						{otherNew.map((item) => (
							<option key={item.key} value={`new:${item.key}`}>
								{text(item.name)}
							</option>
						))}
						<option value="create">+ New ingredient</option>
					</optgroup>
					<option value="none">Not linked</option>
				</select>
			</div>
			{status === "alias" && choice.kind === "catalog" && (
				<label className="text-caption mt-2 flex cursor-pointer items-center gap-2 pl-1">
					<input
						type="checkbox"
						checked={choice.addAlias}
						onChange={(event) =>
							onChoose(
								`${event.target.checked ? "alias" : "noalias"}:${choice.ingredientId}`
							)
						}
						className="border-editor-card-foreground checked:bg-editor-card-foreground size-[1em] cursor-pointer appearance-none border"
					/>
					Add &ldquo;{text(row.wording)}&rdquo; as an alias
				</label>
			)}
			{newItem && firstOfItem && (
				<NewIngredientFields
					item={newItem}
					locale={locale}
					problem={problems.get(newItem.key)}
					onChange={onNewChange}
				/>
			)}
		</li>
	);
}

/**
 * After an import: which catalog ingredient each recipe line uses, with
 * the ones that need a decision first (ADR-0025).
 */
export function IngredientReviewCard({
	choices,
	catalog,
	onChange,
	onNext,
	onBack,
	onCancel,
}: IngredientReviewCardProps) {
	const [locale, setLocale] = useState<Locale>(defaultLocale);
	const [showMatched, setShowMatched] = useState(false);
	const problems = newIngredientProblems(choices, catalog);
	const statuses = new Map(
		choices.rows.map((row) => [row.id, rowStatus(row, catalog)])
	);
	const toReview = choices.rows.filter(
		(row) => statuses.get(row.id) !== "matched"
	);
	const matched = choices.rows.filter(
		(row) => statuses.get(row.id) === "matched"
	);
	const counts = (["matched", "alias", "new", "none"] as const)
		.map((status) => ({
			status,
			count: [...statuses.values()].filter((s) => s === status).length,
		}))
		.filter(({ count }) => count > 0);

	function choose(row: IngredientRow, value: string) {
		const colon = value.indexOf(":");
		const kind = colon < 0 ? value : value.slice(0, colon);
		const id = colon < 0 ? "" : value.slice(colon + 1);
		let choice: RowChoice;
		let newIngredients = choices.newIngredients;
		if (kind === "catalog") {
			choice = { kind: "catalog", ingredientId: id, addAlias: true };
		} else if (kind === "alias" || kind === "noalias") {
			choice = {
				kind: "catalog",
				ingredientId: id,
				addAlias: kind === "alias",
			};
		} else if (kind === "new") {
			choice = { kind: "new", key: id };
		} else if (kind === "create") {
			const key = `new:${row.id}:${newIngredients.length}`;
			newIngredients = [
				...newIngredients,
				{
					key,
					name: row.wording,
					aliases: [],
					nutrition: { calories: null, protein: null, carbs: null, fat: null },
					nutritionEstimated: false,
				},
			];
			choice = { kind: "new", key };
		} else {
			choice = { kind: "none" };
		}
		onChange({
			newIngredients,
			rows: choices.rows.map((r) => (r.id === row.id ? { ...r, choice } : r)),
		});
	}

	function changeNew(item: NewIngredientDraft) {
		onChange({
			...choices,
			newIngredients: choices.newIngredients.map((other) =>
				other.key === item.key ? item : other
			),
		});
	}

	const row = (r: IngredientRow) => (
		<ReviewRow
			key={r.id}
			row={r}
			status={statuses.get(r.id)!}
			catalog={catalog}
			choices={choices}
			locale={locale}
			problems={problems}
			onChoose={(value) => choose(r, value)}
			onNewChange={changeNew}
		/>
	);

	return (
		<EditorCard variant="review">
			<EditorCardLayout
				variant="review"
				header={
					<div className="flex flex-col gap-1">
						<div className="flex items-baseline justify-between gap-6">
							<h2 className="text-subheading font-bold uppercase">
								Ingredients
							</h2>
							<LanguageToggle value={locale} onChange={setLocale} />
						</div>
						<p className="text-caption uppercase">
							{counts
								.map(({ status, count }) => `${count} ${statusLabel[status]}`)
								.join(" · ")}
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
