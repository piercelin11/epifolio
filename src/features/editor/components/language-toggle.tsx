import { useMessages } from "@/lib/i18n/locale-provider";
import { type Locale, locales } from "@/lib/i18n/localized";
import { cn } from "@/lib/utils";

interface LanguageToggleProps {
	value: Locale;
	onChange: (locale: Locale) => void;
}

/** EN | ZH: which language the card's text fields are editing. */
export function LanguageToggle({ value, onChange }: LanguageToggleProps) {
	const t = useMessages();
	return (
		<div
			role="group"
			aria-label={t.editor.editingLanguage}
			className="text-caption flex items-center gap-1.5 uppercase"
		>
			{locales.map((locale, i) => (
				<span key={locale} className="flex items-center gap-1.5">
					{i > 0 && <span aria-hidden>|</span>}
					<button
						type="button"
						aria-pressed={locale === value}
						onClick={() => onChange(locale)}
						className={cn(
							// Preflight resets text-transform on buttons
							"cursor-pointer uppercase",
							locale === value ? "font-bold" : "opacity-50 hover:opacity-80"
						)}
					>
						{locale}
					</button>
				</span>
			))}
		</div>
	);
}
