"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Fragment, useEffect, useState, useTransition } from "react";
import { type FieldError, useForm } from "react-hook-form";

import { CardButton } from "@/features/editor/components/editor-card";
import { unitLabel, units } from "@/features/recipe/units";
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
 * default unit and aliases. The density and count unit weights are not
 * shown here and are saved as they were. Save writes the card and turns it
 * back;
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

				{/*
				 * Labels on the left, fields on the right; the rows sit low, as
				 * on the front, and scroll if they ever outgrow the card.
				 */}
				<div className="-mx-1 min-h-0 flex-1 overflow-y-auto px-1">
					<div className="flex min-h-full flex-col justify-end">
						<div className="text-caption grid grid-cols-[6.5rem_1fr] items-baseline gap-x-2 gap-y-1 uppercase">
							{/* Nutrition is per 100 g, as on the front. */}
							{nutrients.map(({ key, unit }) => (
								<Fragment key={key}>
									<span>{t.ingredientCard[key]}</span>
									<span className="flex items-baseline gap-2">
										<input
											{...register(`nutrition.${key}`)}
											inputMode="decimal"
											aria-label={t.ingredientCard[key]}
											aria-invalid={Boolean(errors.nutrition?.[key])}
											className={cn(field, "w-20 text-right")}
										/>
										{unit}
									</span>
								</Fragment>
							))}
							<span>{t.ingredientCard.defaultUnit}</span>
							<select
								{...register("units.defaultUnit")}
								aria-label={t.ingredientCard.defaultUnit}
								className={cn(field, "w-28")}
							>
								<option value="">–</option>
								{unitOptions(units)}
							</select>
							<span>{t.ingredientCard.aliases}</span>
							<input
								{...register("aliases")}
								aria-label={t.ingredientCard.aliases}
								placeholder={t.ingredientCard.aliasesPlaceholder}
								className={cn(field, "normal-case")}
							/>
						</div>
					</div>
				</div>

				<div className="flex flex-col items-center gap-2 pt-3">
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
