"use client";

import { type ReactNode, useEffect, useState } from "react";
import { toast } from "sonner";

import { loadRecipeDraft } from "@/features/recipe/actions/recipe-editor";
import type { RecipeDraft } from "@/features/recipe/schema";
import { scalingConfig } from "@/features/recipe/scaling";
import { units } from "@/features/recipe/units";
import {
	defaultLocale,
	type Locale,
	type LocalizedText,
	localize,
} from "@/lib/i18n/localized";
import { cn } from "@/lib/utils";

import { newKey } from "../keys";
import type { OutlineRow } from "../outline";
import {
	emptyLine,
	emptyStep,
	type LineEntry,
	type RecipeModel,
	type StepEntry,
	toRecipeDraft,
	toRecipeModel,
} from "../recipe-model";
import { AddRow, RemoveButton } from "./card-rows";
import { CardButton, EditorCard, EditorCardLayout } from "./editor-card";
import { InlineText } from "./inline-text";
import { LanguageToggle } from "./language-toggle";
import { OutlineList } from "./outline-list";
import { SquareIcon } from "./square-icon";

interface RecipeCardProps {
	/** An existing recipe to load; absent for a new dish's recipe. */
	recipeId?: string;
	/** The starting point for a new recipe. */
	initial?: RecipeModel;
	/** Saves the draft; resolves false when it was not saved. */
	onSave: (draft: RecipeDraft) => Promise<boolean>;
	onCancel: () => void;
}

const fieldClass =
	"border-editor-card-foreground placeholder:text-editor-card-foreground/50 min-w-0 border-b bg-transparent py-0.5 focus:outline-none";

function SectionTitle({
	title,
	children,
}: {
	title: string;
	children?: ReactNode;
}) {
	return (
		<div className="border-editor-card-foreground mt-6 mb-2 grid grid-cols-[1fr_auto_1fr] items-center gap-4 border-y-2 py-1.5 first:mt-0">
			<span />
			{/* Sized like the section titles on the recipe sheet */}
			<h3 className="text-subheading font-bold uppercase">{title}</h3>
			<div className="justify-self-end">{children}</div>
		</div>
	);
}

function ServingsField({
	serves,
	onChange,
}: {
	serves: number | null;
	onChange: (serves: number) => void;
}) {
	const { min, max } = scalingConfig.servings;
	const step = (by: number) =>
		onChange(Math.min(Math.max((serves ?? min) + by, min), max));
	const button = "grid cursor-pointer place-items-center disabled:opacity-40";
	return (
		<div className="text-body flex items-center gap-2">
			<button
				type="button"
				aria-label="Fewer servings"
				className={button}
				disabled={serves !== null && serves <= min}
				onClick={() => step(-1)}
			>
				<SquareIcon sign="minus" className="size-[1.25em]" />
			</button>
			<strong className="min-w-[2ch] text-center tabular-nums">
				{serves ?? "–"}
			</strong>
			<button
				type="button"
				aria-label="More servings"
				className={button}
				disabled={serves !== null && serves >= max}
				onClick={() => step(serves === null ? 0 : 1)}
			>
				<SquareIcon sign="plus" className="size-[1.25em]" />
			</button>
			<span className="text-caption">servings</span>
		</div>
	);
}

const text = (value: Parameters<typeof localize<string>>[0], locale: Locale) =>
	localize(value, locale) ?? "";

/** Whether any language has more than white space. */
const hasText = (value: LocalizedText | null | undefined) =>
	Object.values(value ?? {}).some((v) => v?.trim());

/** Edits one recipe: name, servings, ingredients, steps and references. */
export function RecipeCard({
	recipeId,
	initial,
	onSave,
	onCancel,
}: RecipeCardProps) {
	const [locale, setLocale] = useState<Locale>(defaultLocale);
	const [model, setModel] = useState<RecipeModel | null>(initial ?? null);
	const [saving, setSaving] = useState(false);
	const [autoEditUrl, setAutoEditUrl] = useState<string | null>(null);

	useEffect(() => {
		if (!recipeId) return;
		let current = true;
		loadRecipeDraft(recipeId).then((result) => {
			if (!current) return;
			if (result.ok) setModel(toRecipeModel(result.data));
			else toast.error(result.error);
		});
		return () => {
			current = false;
		};
	}, [recipeId]);

	async function save() {
		if (!model) return;
		setSaving(true);
		await onSave(toRecipeDraft(model));
		setSaving(false);
	}

	const set = (change: Partial<RecipeModel>) =>
		model && setModel({ ...model, ...change });

	return (
		<EditorCard variant="recipe">
			<EditorCardLayout
				variant="recipe"
				header={
					<div className="grid grid-cols-[1fr_auto_1fr] items-baseline gap-4">
						<span />
						{model ? (
							<InlineText
								value={model.name[locale] ?? ""}
								onChange={(value) =>
									set({ name: { ...model.name, [locale]: value } })
								}
								placeholder="Recipe name"
								className="text-heading text-center font-semibold uppercase"
							/>
						) : (
							<span />
						)}
						<div className="justify-self-end">
							<LanguageToggle value={locale} onChange={setLocale} />
						</div>
					</div>
				}
				footer={
					<div className="flex justify-center gap-3">
						<CardButton
							variant="primary"
							onClick={save}
							disabled={!model || saving}
						>
							{saving ? "Saving" : "Save"}
						</CardButton>
						<CardButton variant="outline" onClick={onCancel}>
							Cancel
						</CardButton>
					</div>
				}
			>
				{model ? (
					<div>
						<SectionTitle title="Ingredients">
							<ServingsField
								serves={model.serves}
								onChange={(serves) => set({ serves })}
							/>
						</SectionTitle>
						<OutlineList<LineEntry>
							rows={model.ingredients}
							onChange={(ingredients) => set({ ingredients })}
							locale={locale}
							entryLabel="Ingredient"
							newEntry={emptyLine}
							isEmptyEntry={(line) =>
								!line.quantity.trim() &&
								!line.unit &&
								!hasText(line.name) &&
								!hasText(line.note)
							}
							entryToHeading={(line) => line.name}
							headingToEntry={(label) => ({ ...emptyLine(), name: label })}
							rowText={(row) =>
								row.kind === "group"
									? text(row.label, locale)
									: lineText(row, locale)
							}
							renderEntry={(line) =>
								lineText(line, locale) || (
									<span className="opacity-50">Empty ingredient</span>
								)
							}
							renderEditor={(line, editor) => (
								<div className="flex items-baseline gap-2">
									<input
										autoFocus
										value={line.quantity}
										onChange={(event) =>
											editor.update({ ...line, quantity: event.target.value })
										}
										onKeyDown={(event) => {
											editor.onFirstFieldKeyDown(event);
											editor.onFieldKeyDown(event);
										}}
										placeholder="Qty"
										aria-label="Quantity"
										className={cn(fieldClass, "w-16")}
									/>
									<select
										value={line.unit ?? ""}
										onChange={(event) =>
											editor.update({
												...line,
												unit: event.target.value as LineEntry["unit"],
											})
										}
										onKeyDown={editor.onFieldKeyDown}
										aria-label="Unit"
										className={cn(
											fieldClass,
											"w-20",
											!line.unit && "opacity-50"
										)}
									>
										<option value="">Unit</option>
										{units.map((unit) => (
											<option key={unit} value={unit}>
												{unit}
											</option>
										))}
									</select>
									<input
										value={line.name[locale] ?? ""}
										onChange={(event) =>
											editor.update({
												...line,
												name: { ...line.name, [locale]: event.target.value },
											})
										}
										onKeyDown={editor.onFieldKeyDown}
										placeholder="Ingredient"
										aria-label="Ingredient"
										className={cn(fieldClass, "flex-1")}
									/>
									<input
										value={line.note?.[locale] ?? ""}
										onChange={(event) =>
											editor.update({
												...line,
												note: { ...line.note, [locale]: event.target.value },
											})
										}
										onKeyDown={editor.onFieldKeyDown}
										placeholder="Note"
										aria-label="Note"
										className={cn(fieldClass, "w-1/4")}
									/>
								</div>
							)}
						/>

						<SectionTitle title="Instructions" />
						<OutlineList<StepEntry>
							rows={model.steps}
							onChange={(steps) => set({ steps })}
							locale={locale}
							entryLabel="Step"
							newEntry={emptyStep}
							isEmptyEntry={(step) =>
								!hasText(step.title) && !hasText(step.text)
							}
							entryToHeading={(step) =>
								Object.keys(step.title ?? {}).length ? step.title! : step.text
							}
							headingToEntry={(label) => ({ ...emptyStep(), title: label })}
							rowText={(row) =>
								row.kind === "group"
									? text(row.label, locale)
									: text(row.text, locale)
							}
							renderEntry={(step) => <StepText step={step} locale={locale} />}
							renderEditor={(step, editor) => (
								<div className="flex items-start gap-2">
									<input
										autoFocus
										value={step.title?.[locale] ?? ""}
										onChange={(event) =>
											editor.update({
												...step,
												title: { ...step.title, [locale]: event.target.value },
											})
										}
										onKeyDown={(event) => {
											editor.onFirstFieldKeyDown(event);
											editor.onFieldKeyDown(event);
										}}
										placeholder="Highlight (optional)"
										aria-label="Highlight"
										className={cn(fieldClass, "w-1/3")}
									/>
									<textarea
										value={step.text[locale] ?? ""}
										onChange={(event) =>
											editor.update({
												...step,
												text: { ...step.text, [locale]: event.target.value },
											})
										}
										onKeyDown={editor.onFieldKeyDown}
										placeholder="Instruction"
										aria-label="Instruction"
										rows={1}
										className={cn(
											fieldClass,
											"field-sizing-content flex-1 resize-none"
										)}
									/>
								</div>
							)}
						/>

						<SectionTitle title="References" />
						{/* Level with the group headings: links have no groups */}
						<div className="text-body pl-6">
							{model.references.map((link, i) => (
								<div
									key={link.key}
									className="group border-editor-card-foreground relative border-b py-1.5"
								>
									<RemoveButton
										label="Remove reference"
										onClick={() =>
											set({
												references: model.references.filter((_, j) => j !== i),
											})
										}
									/>
									<InlineText
										value={link.url}
										onChange={(url) =>
											set({
												references: model.references.map((r, j) =>
													j === i ? { ...r, url } : r
												),
											})
										}
										placeholder="https://"
										autoEdit={autoEditUrl === link.key}
									/>
								</div>
							))}
							<AddRow
								label="URL"
								onClick={() => {
									const key = newKey();
									setAutoEditUrl(key);
									set({ references: [...model.references, { key, url: "" }] });
								}}
							/>
						</div>
					</div>
				) : (
					<p className="text-body opacity-50">Loading…</p>
				)}
			</EditorCardLayout>
		</EditorCard>
	);
}

/** An ingredient line as one line of text, e.g. "1/2 tsp Lemon juice (to taste)". */
function lineText(line: LineEntry, locale: Locale): string {
	const name = text(line.name, locale);
	const note = text(line.note, locale);
	const main = [line.quantity, line.unit, name].filter(Boolean).join(" ");
	return note ? `${main} (${note})` : main;
}

function StepText({
	step,
	locale,
}: {
	step: OutlineRow<StepEntry> & StepEntry;
	locale: Locale;
}) {
	const title = text(step.title, locale);
	const body = text(step.text, locale);
	if (!title && !body) return <span className="opacity-50">Empty step</span>;
	return (
		<span className="whitespace-pre-line">
			{title && <strong className="font-semibold">{title}. </strong>}
			{body}
		</span>
	);
}
