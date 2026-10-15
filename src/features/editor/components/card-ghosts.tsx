import type { DishDraft } from "@/features/menu/schema";
import { useMessages } from "@/lib/i18n/locale-provider";
import { type Locale, localize } from "@/lib/i18n/localized";

import type { MenuModel } from "../menu-model";
import { CardButton, EditorCardLayout } from "./editor-card";
import { ImportForm, ImportHeading } from "./import-card";

// Still pictures of each face, shown mirrored through the other face of
// the card (EditorCard's ghost). They take no input.

const noop = () => {};

export function MenuGhost({
	model,
	locale,
}: {
	model: MenuModel | null;
	locale: Locale;
}) {
	const t = useMessages();
	const text = (value: Parameters<typeof localize<string>>[0]) =>
		localize(value, locale) ?? "";
	return (
		<EditorCardLayout
			variant="menu"
			header={
				<p className="text-subheading font-bold uppercase">
					{model && text(model.label)}
				</p>
			}
			footer={
				<div className="flex gap-3">
					<CardButton variant="primary">{t.editor.save}</CardButton>
					<CardButton variant="outline">{t.editor.cancel}</CardButton>
				</div>
			}
		>
			<div className="text-body pl-6 uppercase">
				{model?.sections.map((section) => (
					<div key={section.key}>
						<p className="border-editor-card-foreground border-b py-1.5 font-bold">
							{text(section.label)}
						</p>
						{section.items.map((item) => (
							<p
								key={item.key}
								className="border-editor-card-foreground ml-8 border-b py-1.5 font-medium"
							>
								{text(item.name)}
							</p>
						))}
					</div>
				))}
			</div>
		</EditorCardLayout>
	);
}

export function ImportGhost({
	dish,
	locale,
}: {
	dish: DishDraft;
	locale: Locale;
}) {
	const t = useMessages();
	return (
		<EditorCardLayout
			variant="menu"
			header={<ImportHeading />}
			footer={
				<div className="flex gap-3">
					<CardButton variant="primary">{t.editor.next}</CardButton>
					<CardButton variant="outline">{t.editor.cancel}</CardButton>
				</div>
			}
		>
			<ImportForm
				dish={dish}
				onChange={noop}
				locale={locale}
				source="scratch"
				onSourceChange={noop}
			/>
		</EditorCardLayout>
	);
}
