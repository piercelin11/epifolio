"use client";

import { useTransition } from "react";

import { htmlLang } from "@/lib/i18n/locale-cookie";
import { useLocale, useMessages } from "@/lib/i18n/locale-provider";
import { locales } from "@/lib/i18n/localized";
import { setLocale } from "@/lib/i18n/set-locale";
import { cn } from "@/lib/utils";

/**
 * The site-wide language switch: shows the current language, and a click
 * changes to the other one (ADR-0028).
 */
export function LocaleSwitch({ className }: { className?: string }) {
	const locale = useLocale();
	const t = useMessages();
	const [pending, startTransition] = useTransition();
	const next = locales.find((other) => other !== locale) ?? locale;
	return (
		<button
			type="button"
			aria-label={t.locale.switchTo}
			disabled={pending}
			onClick={() =>
				startTransition(async () => {
					document.documentElement.lang = htmlLang[next];
					await setLocale(next);
				})
			}
			className={cn(
				"cursor-pointer lowercase disabled:cursor-default disabled:opacity-50",
				className
			)}
		>
			{locale}
		</button>
	);
}
