// Links the wording in a recipe or menu ("Garlic, minced", "蒜頭") to an
// ingredient in the catalog by its names and aliases. Matching is strict on
// purpose: a wrong link opens the wrong card, while a missing one can be
// fixed by adding an alias.

/** An ingredient with every name it may be written as. */
export interface IngredientNames {
	id: string;
	names: string[];
}

const normalise = (text: string) => text.trim().toLowerCase();

/** The text itself and its simple English singulars. */
function forms(text: string): string[] {
	const result = [text];
	if (text.endsWith("es")) result.push(text.slice(0, -2));
	if (text.endsWith("s")) result.push(text.slice(0, -1));
	return result;
}

/**
 * The ingredient `text` names: the whole text, or the part before its first
 * comma ("Garlic, minced"), must equal a name or alias, ignoring case and a
 * plural ending. "Garlic powder" does not match garlic. Undefined when
 * nothing matches.
 */
export function matchIngredient(
	text: string,
	catalog: IngredientNames[]
): string | undefined {
	const whole = normalise(text);
	if (!whole) return undefined;
	const head = normalise(whole.split(/[,，]/)[0]);
	const candidates = new Set([...forms(whole), ...forms(head)]);
	return catalog.find((ingredient) =>
		ingredient.names.some((name) => candidates.has(normalise(name)))
	)?.id;
}
