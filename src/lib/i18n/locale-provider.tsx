"use client";

import { createContext, type ReactNode, use } from "react";

import { defaultLocale, type Locale } from "./localized";
import { type ErrorMessage, errorText, messages } from "./messages";

const LocaleContext = createContext<Locale>(defaultLocale);

/** Gives the components below it the interface language (ADR-0028). */
export function LocaleProvider({
	locale,
	children,
}: {
	locale: Locale;
	children: ReactNode;
}) {
	return <LocaleContext value={locale}>{children}</LocaleContext>;
}

/** The current interface language. */
export function useLocale(): Locale {
	return use(LocaleContext);
}

/** The interface text in the current language. */
export function useMessages() {
	return messages[useLocale()];
}

/** Words an ErrorMessage, e.g. from a Server Action, in the current language. */
export function useErrorText() {
	const dictionary = useMessages();
	return (message: ErrorMessage) => errorText(dictionary, message);
}
