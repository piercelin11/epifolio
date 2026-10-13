"use client";

import { useState } from "react";

import type { MenuBook } from "@/features/menu/types";
import { defaultLocale, type Locale } from "@/lib/i18n/localized";

import { CardButton, EditorCard, EditorCardLayout } from "./editor-card";
import { LanguageToggle } from "./language-toggle";

interface MenuCardProps {
	book: MenuBook;
	onCancel: () => void;
}

/** Edits one menu book: its name, sections and dishes. */
export function MenuCard({ book, onCancel }: MenuCardProps) {
	const [locale, setLocale] = useState<Locale>(defaultLocale);
	return (
		<EditorCard variant="menu">
			<EditorCardLayout
				variant="menu"
				header={
					<div className="flex items-baseline justify-between gap-6">
						<h2 className="text-title font-bold uppercase">
							{book.group.label}
						</h2>
						<LanguageToggle value={locale} onChange={setLocale} />
					</div>
				}
				footer={
					<div className="flex gap-3">
						<CardButton variant="primary" disabled>
							Save
						</CardButton>
						<CardButton variant="outline" onClick={onCancel}>
							Cancel
						</CardButton>
					</div>
				}
			>
				<ul className="text-body uppercase">
					{book.group.sections.map((section) => (
						<li key={section.id}>
							<p className="border-editor-card-foreground border-b py-1.5 font-bold">
								{section.label ?? "Untitled"}
							</p>
							<ul className="pl-8">
								{section.items.map((item) => (
									<li
										key={item.id}
										className="border-editor-card-foreground border-b py-1.5"
									>
										{item.name}
									</li>
								))}
							</ul>
						</li>
					))}
				</ul>
			</EditorCardLayout>
		</EditorCard>
	);
}
