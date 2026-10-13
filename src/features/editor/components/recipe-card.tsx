"use client";

import { useState } from "react";

import type { Recipe } from "@/features/recipe/types";
import { defaultLocale, type Locale } from "@/lib/i18n/localized";

import { CardButton, EditorCard, EditorCardLayout } from "./editor-card";
import { LanguageToggle } from "./language-toggle";

interface RecipeCardProps {
	/** Absent while adding a new dish. */
	recipe?: Recipe;
	onCancel: () => void;
}

/** Edits one recipe: name, servings, ingredients, steps and references. */
export function RecipeCard({ recipe, onCancel }: RecipeCardProps) {
	const [locale, setLocale] = useState<Locale>(defaultLocale);
	return (
		<EditorCard variant="recipe">
			<EditorCardLayout
				variant="recipe"
				header={
					<div className="grid grid-cols-[1fr_auto_1fr] items-baseline gap-6">
						<span />
						<h2 className="text-heading text-center font-semibold uppercase">
							{recipe?.name ?? "New recipe"}
						</h2>
						<div className="justify-self-end">
							<LanguageToggle value={locale} onChange={setLocale} />
						</div>
					</div>
				}
				footer={
					<div className="flex justify-center gap-3">
						<CardButton variant="primary" disabled>
							Save
						</CardButton>
						<CardButton variant="outline" onClick={onCancel}>
							Cancel
						</CardButton>
					</div>
				}
			>
				<div />
			</EditorCardLayout>
		</EditorCard>
	);
}
