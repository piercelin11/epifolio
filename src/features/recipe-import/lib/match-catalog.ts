import type { CatalogIngredient } from "@/features/ingredient/types";
import type { LocalizedText } from "@/lib/i18n/localized";

import { importConfig } from "../config";

// Matches an imported ingredient line to the catalog in code (ADR-0026).
// The model names the ingredient and lists other names for it; this
// decides which catalog ingredients those names point to.

/** How a line's ingredient was found in the catalog. */
export type MatchStatus = "matched" | "alias" | "suggested" | "new";

export interface LineMatch {
	status: MatchStatus;
	/** Catalog ids the line's names point to, best first. */
	candidates: string[];
	/** For a new line: catalog ids that only loosely resemble it. */
	maybe: string[];
}

/** What a line says about its ingredient. */
export interface LineNames {
	/** The recipe's wording, e.g. "Garlic, minced". */
	wording: LocalizedText;
	/** The plain ingredient name the model gave, e.g. Garlic / 蒜頭. */
	name: LocalizedText;
	/** Other names the model gave, in either language. */
	terms: string[];
}

/** Lower case, full-width folded, punctuation and extra spaces dropped. */
export function normalize(text: string): string {
	return text
		.normalize("NFKC")
		.toLowerCase()
		.replace(/[^\p{L}\p{N}\s]/gu, " ")
		.replace(/\s+/g, " ")
		.trim();
}

/** The normalized text and its simple English singulars. */
function keys(text: string): string[] {
	const base = normalize(text);
	if (!base) return [];
	const result = [base];
	if (base.endsWith("es")) result.push(base.slice(0, -2));
	if (base.endsWith("s")) result.push(base.slice(0, -1));
	return result;
}

/** The whole text and the part before its first comma ("Garlic, minced"). */
function wordingForms(text: string): string[] {
	const head = text.split(/[,，]/)[0];
	return head === text ? [text] : [text, head];
}

const isChinese = (text: string) => /\p{Script=Han}/u.test(text);

/** English words worth comparing, singular. */
function words(text: string): string[] {
	const { minWordLength } = importConfig.matching;
	const ignoredWords: readonly string[] = importConfig.matching.ignoredWords;
	return normalize(text)
		.split(" ")
		.filter((w) => w.length >= minWordLength && !ignoredWords.includes(w))
		.map((w) => (w.endsWith("s") ? w.slice(0, -1) : w));
}

const namesOf = (ingredient: CatalogIngredient) =>
	[...Object.values(ingredient.name), ...ingredient.aliases].filter(
		(n): n is string => Boolean(n)
	);

/** Ingredients whose names share keys with `texts`, with how many matched. */
function strictHits(texts: string[], catalog: CatalogIngredient[]) {
	const wanted = new Set(texts.flatMap(keys));
	const hits = new Map<string, number>();
	for (const ingredient of catalog) {
		const count = namesOf(ingredient)
			.flatMap(keys)
			.filter((key) => wanted.has(key)).length;
		if (count > 0) hits.set(ingredient.id, count);
	}
	return hits;
}

/** Ingredients that only loosely resemble the line, best first. */
function looseHits(line: LineNames, catalog: CatalogIngredient[]): string[] {
	const { minContainedLength, maxMaybe } = importConfig.matching;
	const texts = [
		...Object.values(line.wording),
		...Object.values(line.name),
		...line.terms,
	].filter((t): t is string => Boolean(t));
	const lineWords = new Set(texts.filter((t) => !isChinese(t)).flatMap(words));
	const lineChinese = texts
		.filter(isChinese)
		.map(normalize)
		.filter((t) => t.length >= minContainedLength);

	const scored = catalog.flatMap((ingredient) => {
		let score = 0;
		for (const name of namesOf(ingredient)) {
			if (isChinese(name)) {
				const n = normalize(name);
				if (n.length < minContainedLength) continue;
				if (lineChinese.some((t) => t.includes(n) || n.includes(t))) score += 2;
			} else {
				score += words(name).filter((w) => lineWords.has(w)).length;
			}
		}
		return score > 0 ? [{ id: ingredient.id, score }] : [];
	});
	return scored
		.sort((a, b) => b.score - a.score)
		.slice(0, maxMaybe)
		.map((hit) => hit.id);
}

const byScore = (hits: Map<string, number>) =>
	[...hits.entries()].sort((a, b) => b[1] - a[1]).map(([id]) => id);

/**
 * Where a line's ingredient is in the catalog:
 * - matched: the recipe's wording is one ingredient's name or alias;
 * - alias: the model's names point to exactly one ingredient;
 * - suggested: they point to several, best first;
 * - new: they point to none; `maybe` lists loose resemblances.
 */
export function matchLine(
	line: LineNames,
	catalog: CatalogIngredient[]
): LineMatch {
	const { maxCandidates } = importConfig.matching;
	const wording = Object.values(line.wording)
		.filter((t): t is string => Boolean(t))
		.flatMap(wordingForms);
	const byWording = strictHits(wording, catalog);
	const byNames = strictHits(
		[
			...Object.values(line.name).filter((t): t is string => Boolean(t)),
			...line.terms,
		],
		catalog
	);

	// The recipe's own wording outweighs the model's names.
	const scores = new Map(byNames);
	for (const [id, count] of byWording) {
		scores.set(id, (scores.get(id) ?? 0) + count * 10);
	}
	const candidates = byScore(scores).slice(0, maxCandidates);

	if (byWording.size === 1) {
		return { status: "matched", candidates, maybe: [] };
	}
	if (candidates.length === 0) {
		return { status: "new", candidates, maybe: looseHits(line, catalog) };
	}
	return {
		status: candidates.length === 1 ? "alias" : "suggested",
		candidates,
		maybe: [],
	};
}
