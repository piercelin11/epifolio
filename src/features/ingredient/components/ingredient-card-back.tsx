"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Fragment, useEffect, useState, useTransition } from "react";
import { type FieldError, useFieldArray, useForm } from "react-hook-form";

import { CardButton } from "@/features/editor/components/editor-card";
import { SquareIcon } from "@/features/editor/components/square-icon";
import { countUnits, unitLabel, units } from "@/features/recipe/units";
import {
	useErrorText,
	useLocale,
	useMessages,
} from "@/lib/i18n/locale-provider";
import {
	type ErrorMessage,
	isPlainErrorKey,
	plainMessage,
} from "@/lib/i18n/messages";
import { cn } from "@/lib/utils";

import { updateIngredient } from "../actions/update-ingredient";
import { ingredientFormSchema, toFormValues } from "../lib/ingredient-form";
import type { Ingredient } from "../types";
import { CardStock } from "./card-stock";
import { nutrients } from "./ingredient-card";

interface IngredientCardBackProps {
	ingredient: Ingredient;
	/** True while the card is turned over; the form restarts each time. */
	editing: boolean;
	/** Turns the card back to its front, after saving or cancelling. */
	onDone: () => void;
}

const field =
	"min-w-0 border-b border-current bg-transparent py-1 uppercase placeholder:text-current/40 focus:outline-none aria-invalid:border-b-2";

/** The message key a field was rejected with, as a message to show. */
function fieldMessage(error: FieldError | undefined): ErrorMessage | undefined {
	if (!error?.message) return undefined;
	return plainMessage(
		isPlainErrorKey(error.message) ? error.message : "invalidField"
	);
}

/**
 * The back of the ingredient card: its names, price, nutrition per 100 g,
 * unit weights and aliases. Save writes them and turns the card back;
 * Cancel turns it back without saving.
 */
export function IngredientCardBack({
	ingredient,
	editing,
	onDone,
}: IngredientCardBackProps) {
	const t = useMessages();
	const locale = useLocale();
	const errorText = useErrorText();
	const [saving, startSaving] = useTransition();
	const [saveError, setSaveError] = useState<ErrorMessage>();
	// A failed save's message lasts until the card turns, however it turns.
	const [turnedOver, setTurnedOver] = useState(editing);
	if (editing !== turnedOver) {
		setTurnedOver(editing);
		setSaveError(undefined);
	}
	const form = useForm({
		resolver: zodResolver(ingredientFormSchema),
		defaultValues: toFormValues(ingredient),
	});
	const { register, handleSubmit, reset, formState } = form;
	const weights = useFieldArray({
		control: form.control,
		name: "units.weights",
	});

	// Each turn opens on the ingredient as saved.
	useEffect(() => {
		if (!editing) return;
		reset(toFormValues(ingredient));
	}, [editing, ingredient, reset]);

	// Each try starts without the last try's message.
	const save = handleSubmit(
		(values) => {
			setSaveError(undefined);
			startSaving(async () => {
				const result = await updateIngredient({ id: ingredient.id, ...values });
				if (result.ok) onDone();
				else setSaveError(result.error);
			});
		},
		() => setSaveError(undefined)
	);

	const { errors } = formState;
	const weightErrors = errors.units?.weights;
	// One message at a time, top to bottom: fields are only outlined.
	const problems: (FieldError | undefined)[] = [
		errors.name as FieldError | undefined,
		errors.price?.amount,
		errors.price?.quantity,
		errors.price?.unit,
		...nutrients.map(({ key }) => errors.nutrition?.[key]),
		errors.units?.density,
		// A rule on the whole list, e.g. a unit listed twice.
		weightErrors?.root ?? (weightErrors as FieldError | undefined),
		...(Array.isArray(weightErrors)
			? weightErrors.flatMap((row) => [row?.unit, row?.grams])
			: []),
	];
	const message =
		saveError ?? problems.map(fieldMessage).find((m) => m !== undefined);

	const unitOptions = (list: readonly string[]) =>
		list.map((unit) => (
			<option key={unit} value={unit}>
				{unitLabel(unit, locale)}
			</option>
		));

	return (
		<CardStock side="back">
			<form
				onSubmit={save}
				noValidate
				className="text-body relative flex min-h-0 flex-1 flex-col gap-3"
			>
				{/* Clear of the clip on the right */}
				<div className="text-title flex flex-col pr-[calc(var(--ingredient-card-clip-width)+var(--ingredient-card-clip-left))] font-bold">
					<input
						{...register("name.en")}
						aria-label={t.ingredientCard.englishName}
						aria-invalid={Boolean(errors.name)}
						placeholder={t.ingredientCard.englishPlaceholder}
						className={cn(field, "w-full border-transparent")}
					/>
					<input
						{...register("name.zh")}
						aria-label={t.ingredientCard.chineseName}
						aria-invalid={Boolean(errors.name)}
						placeholder={t.ingredientCard.chinesePlaceholder}
						className={cn(field, "w-full border-transparent")}
					/>
				</div>

				{/* The fields sit low, as on the front; a long form scrolls. */}
				<div className="-mx-1 min-h-0 flex-1 overflow-y-auto px-1">
					<div className="flex min-h-full flex-col justify-end gap-3 pt-1">
						<div className="grid grid-cols-[auto_1fr_5rem_6.5rem] items-baseline gap-x-3">
							<span>$</span>
							<input
								{...register("price.amount")}
								inputMode="decimal"
								aria-label={t.ingredientCard.price}
								aria-invalid={Boolean(errors.price?.amount)}
								placeholder={t.ingredientCard.price}
								className={field}
							/>
							<input
								{...register("price.quantity")}
								inputMode="decimal"
								aria-label={t.ingredientCard.quantity}
								aria-invalid={Boolean(errors.price?.quantity)}
								placeholder={t.ingredientCard.quantity}
								className={field}
							/>
							<select
								{...register("price.unit")}
								aria-label={t.ingredientCard.unit}
								aria-invalid={Boolean(errors.price?.unit)}
								className={field}
							>
								<option value="">{t.ingredientCard.unit}</option>
								{unitOptions(units)}
							</select>
						</div>

						{/* Per 100 g, as on the front */}
						<div className="text-caption border-t border-current uppercase">
							{nutrients.map(({ key, unit }) => (
								<label
									key={key}
									className="flex items-baseline justify-between gap-4 border-b border-current/40"
								>
									<span>{t.ingredientCard[key]}</span>
									<span className="flex items-baseline gap-1">
										<input
											{...register(`nutrition.${key}`)}
											inputMode="decimal"
											aria-invalid={Boolean(errors.nutrition?.[key])}
											className="w-16 bg-transparent text-right focus:outline-none aria-invalid:underline"
										/>
										<span className="w-9">{unit}</span>
									</span>
								</label>
							))}
						</div>

						{/* A label column, then the value: rows line up. */}
						<div className="text-caption grid grid-cols-[7.5rem_1fr] items-baseline gap-x-2 uppercase">
							<span>{t.ingredientCard.defaultUnit}</span>
							<select
								{...register("units.defaultUnit")}
								aria-label={t.ingredientCard.defaultUnit}
								className={cn(field, "w-28")}
							>
								<option value="">–</option>
								{unitOptions(units)}
							</select>
							<span>{t.ingredientCard.density}</span>
							<span className="flex items-baseline gap-2">
								{t.ingredientCard.densityHint}
								<input
									{...register("units.density")}
									inputMode="decimal"
									aria-label={t.ingredientCard.density}
									aria-invalid={Boolean(errors.units?.density)}
									className={cn(field, "w-16 text-right")}
								/>
								g
							</span>
							{weights.fields.map((row, i) => (
								<Fragment key={row.id}>
									<span className="flex items-baseline gap-2">
										1
										<select
											{...register(`units.weights.${i}.unit`)}
											aria-label={t.ingredientCard.unit}
											className={cn(field, "w-full")}
										>
											<option value="">{t.ingredientCard.unit}</option>
											{unitOptions(countUnits)}
										</select>
									</span>
									<span className="flex items-baseline gap-2">
										=
										<input
											{...register(`units.weights.${i}.grams`)}
											inputMode="decimal"
											aria-label={t.ingredientCard.gramsPer({
												unit: row.unit ? unitLabel(row.unit, locale) : "",
											})}
											aria-invalid={Boolean(errors.units?.weights?.[i]?.grams)}
											className={cn(field, "w-16 text-right")}
										/>
										g
										<button
											type="button"
											aria-label={t.ingredientCard.removeUnit}
											onClick={() => weights.remove(i)}
											className="ml-auto cursor-pointer"
										>
											<SquareIcon sign="minus" />
										</button>
									</span>
								</Fragment>
							))}
							<button
								type="button"
								onClick={() => weights.append({ unit: "", grams: "" })}
								className="col-start-2 flex cursor-pointer items-center gap-1.5 justify-self-start pt-1 font-semibold uppercase"
							>
								<SquareIcon sign="plus" />
								{t.ingredientCard.addUnit}
							</button>
							<span className="pt-1">{t.ingredientCard.aliases}</span>
							<input
								{...register("aliases")}
								aria-label={t.ingredientCard.aliases}
								placeholder={t.ingredientCard.aliasesPlaceholder}
								className={cn(field, "mt-1 normal-case")}
							/>
						</div>
					</div>
				</div>

				<div className="flex flex-col items-center gap-2">
					{message && (
						<p role="alert" className="text-caption font-bold">
							{errorText(message)}
						</p>
					)}
					<div className="flex justify-center gap-3">
						<CardButton type="submit" variant="primary" disabled={saving}>
							{saving ? t.editor.saving : t.editor.save}
						</CardButton>
						<CardButton variant="outline" onClick={onDone}>
							{t.editor.cancel}
						</CardButton>
					</div>
				</div>
			</form>
		</CardStock>
	);
}
