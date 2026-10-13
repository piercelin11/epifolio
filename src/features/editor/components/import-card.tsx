"use client";

import { type ReactNode, useState } from "react";

import type { DishDraft } from "@/features/menu/schema";
import { defaultLocale, type Locale } from "@/lib/i18n/localized";
import { cn } from "@/lib/utils";

import { CardButton, EditorCard, EditorCardLayout } from "./editor-card";
import { LanguageToggle } from "./language-toggle";

/** Where a new dish comes from. Text and Photo wait for the LLM import (#52). */
const sources = [
	{ id: "scratch", label: "Scratch", ready: true },
	{ id: "text", label: "Text", ready: false },
	{ id: "photo", label: "Photo", ready: false },
] as const;

type Source = (typeof sources)[number]["id"];

interface ImportCardProps {
	dish: DishDraft;
	onChange: (dish: DishDraft) => void;
	onNext: () => void;
	onCancel: () => void;
	ghost?: ReactNode;
}

function Field({
	value,
	onChange,
	placeholder,
	disabled,
}: {
	value: string;
	onChange: (value: string) => void;
	placeholder: string;
	disabled?: boolean;
}) {
	return (
		<input
			value={value}
			onChange={(event) => onChange(event.target.value)}
			placeholder={placeholder}
			disabled={disabled}
			className="border-editor-card-foreground placeholder:text-editor-card-foreground/50 w-2/3 border-b bg-transparent py-1.5 uppercase focus:outline-none"
		/>
	);
}

/** The import card's body: pick a source, then fill it in. */
export function ImportForm({
	dish,
	onChange,
	locale,
	source,
	onSourceChange,
}: {
	dish: DishDraft;
	onChange: (dish: DishDraft) => void;
	locale: Locale;
	source: Source;
	onSourceChange: (source: Source) => void;
}) {
	return (
		<div className="text-body flex flex-col gap-4">
			<fieldset className="flex flex-col gap-2">
				<legend className="mb-2 font-bold uppercase">Import from</legend>
				<div className="flex gap-6">
					{sources.map(({ id, label }) => (
						<label
							key={id}
							className="flex cursor-pointer items-center gap-2 uppercase"
						>
							<input
								type="radio"
								name="import-source"
								value={id}
								checked={source === id}
								onChange={() => onSourceChange(id)}
								className="border-editor-card-foreground checked:bg-editor-card-foreground size-[1em] cursor-pointer appearance-none rounded-full border checked:shadow-[inset_0_0_0_2px_var(--editor-menu-card)]"
							/>
							{label}
						</label>
					))}
				</div>
			</fieldset>
			{source === "scratch" && (
				<div className="flex flex-col gap-3">
					<Field
						value={dish.name[locale] ?? ""}
						onChange={(value) =>
							onChange({ ...dish, name: { ...dish.name, [locale]: value } })
						}
						placeholder="Dish name"
					/>
					<Field
						value={dish.description?.[locale] ?? ""}
						onChange={(value) =>
							onChange({
								...dish,
								description: { ...dish.description, [locale]: value },
							})
						}
						placeholder="Description (optional)"
					/>
				</div>
			)}
			{source === "text" && (
				<textarea
					disabled
					placeholder="Paste a recipe here. Coming soon."
					className="border-editor-card-foreground placeholder:text-editor-card-foreground/50 h-32 resize-none border bg-transparent p-2"
				/>
			)}
			{source === "photo" && (
				<div className="border-editor-card-foreground flex h-32 flex-col items-center justify-center gap-1 border border-dashed text-center">
					<p className="font-bold uppercase">Choose a file or drag it here</p>
					<p className="text-caption">JPEG, PNG or PDF. Coming soon.</p>
				</div>
			)}
		</div>
	);
}

/** The back of the menu card: starts a new dish for a section. */
export function ImportCard({
	dish,
	onChange,
	onNext,
	onCancel,
	ghost,
}: ImportCardProps) {
	const [locale, setLocale] = useState<Locale>(defaultLocale);
	const [source, setSource] = useState<Source>("scratch");
	const ready = sources.find((s) => s.id === source)?.ready;
	return (
		<EditorCard variant="menu" ghost={ghost} reverse>
			<EditorCardLayout
				variant="menu"
				header={
					<div className="flex justify-end">
						<LanguageToggle value={locale} onChange={setLocale} />
					</div>
				}
				footer={
					<div className="flex gap-3">
						<CardButton variant="primary" onClick={onNext} disabled={!ready}>
							Next
						</CardButton>
						<CardButton variant="outline" onClick={onCancel}>
							Cancel
						</CardButton>
					</div>
				}
			>
				<div className={cn(!ready && "opacity-90")}>
					<ImportForm
						dish={dish}
						onChange={onChange}
						locale={locale}
						source={source}
						onSourceChange={setSource}
					/>
				</div>
			</EditorCardLayout>
		</EditorCard>
	);
}
